/*
 * KOSL Spin Coater — ESP32 Firmware
 * Closed-loop RPM control via 3x Hall-effect encoders + PID + PWM
 *
 * Pins:
 *   GPIO 34 — Hall sensor A (interrupt, input-only)
 *   GPIO 35 — Hall sensor B (interrupt, input-only)
 *   GPIO 36 — Hall sensor C (interrupt, input-only)
 *   GPIO 25 — Motor driver PWM out (LEDC channel 0, 5kHz)
 *
 * Serial: 115200 baud, JSON lines
 *   Commands: {"cmd":"set_rpm","value":3000}
 *             {"cmd":"stop"}
 *             {"cmd":"set_kp","value":0.5}
 *             {"cmd":"set_ki","value":0.02}
 *             {"cmd":"set_kd","value":0.01}
 *             {"cmd":"set_magnets","value":12}
 *             {"cmd":"status"}
 */

#include <ArduinoJson.h>

// --- Pin assignments ---
#define PIN_HALL_A   34
#define PIN_HALL_B   35
#define PIN_HALL_C   36
#define PIN_MOTOR    25

// --- LEDC (PWM) config ---
#define LEDC_CHANNEL    0
#define LEDC_FREQ_HZ    5000
#define LEDC_RESOLUTION 8       // 8-bit: 0–255

// --- Defaults ---
#define DEFAULT_MAGNETS  12
#define LOOP_INTERVAL_MS 100    // PID + RPM calc period
#define STATUS_INTERVAL_MS 500

// --- Encoder state (volatile = ISR-safe) ---
volatile uint32_t pulseCount = 0;

void IRAM_ATTR onHallA() { pulseCount++; }
void IRAM_ATTR onHallB() { pulseCount++; }
void IRAM_ATTR onHallC() { pulseCount++; }

// --- PID state ---
float Kp = 0.5f;
float Ki = 0.02f;
float Kd = 0.01f;

float targetRpm    = 0.0f;
float currentRpm   = 0.0f;
float pidIntegral  = 0.0f;
float pidPrevError = 0.0f;
float pwmDuty      = 0.0f;   // 0.0–255.0

// --- Config ---
int   numMagnets   = DEFAULT_MAGNETS;
float pulsesPerRev;           // = 3 * numMagnets

// --- Timing ---
unsigned long lastLoopMs   = 0;
unsigned long lastStatusMs = 0;

// --- Helpers ---
void setMotorPwm(float duty) {
    uint32_t d = (uint32_t)constrain(duty, 0.0f, 255.0f);
    ledcWrite(LEDC_CHANNEL, d);
    pwmDuty = (float)d;
}

void updatePulsesPerRev() {
    pulsesPerRev = (float)(3 * numMagnets);
}

void sendStatus(const char* statusStr) {
    StaticJsonDocument<256> doc;
    doc["status"]     = statusStr;
    doc["rpm_target"] = (int)targetRpm;
    doc["rpm"]        = (int)currentRpm;
    doc["pwm"]        = (int)pwmDuty;
    doc["error"]      = (int)(targetRpm - currentRpm);
    doc["kp"]         = Kp;
    doc["ki"]         = Ki;
    doc["kd"]         = Kd;
    serializeJson(doc, Serial);
    Serial.println();
}

void handleCommand(const char* json) {
    StaticJsonDocument<128> doc;
    if (deserializeJson(doc, json) != DeserializationError::Ok) return;

    const char* cmd = doc["cmd"];
    if (!cmd) return;

    if (strcmp(cmd, "set_rpm") == 0) {
        targetRpm    = doc["value"] | 0.0f;
        pidIntegral  = 0.0f;
        pidPrevError = 0.0f;
    } else if (strcmp(cmd, "stop") == 0) {
        targetRpm    = 0.0f;
        pidIntegral  = 0.0f;
        pidPrevError = 0.0f;
        setMotorPwm(0);
        sendStatus("stopped");
    } else if (strcmp(cmd, "set_kp") == 0) {
        Kp = doc["value"] | Kp;
    } else if (strcmp(cmd, "set_ki") == 0) {
        Ki = doc["value"] | Ki;
        pidIntegral = 0.0f;
    } else if (strcmp(cmd, "set_kd") == 0) {
        Kd = doc["value"] | Kd;
    } else if (strcmp(cmd, "set_magnets") == 0) {
        numMagnets = doc["value"] | numMagnets;
        updatePulsesPerRev();
    } else if (strcmp(cmd, "status") == 0) {
        sendStatus(targetRpm > 0 ? "running" : "idle");
    }
}

void setup() {
    Serial.begin(115200);

    // Motor PWM
    ledcSetup(LEDC_CHANNEL, LEDC_FREQ_HZ, LEDC_RESOLUTION);
    ledcAttachPin(PIN_MOTOR, LEDC_CHANNEL);
    ledcWrite(LEDC_CHANNEL, 0);

    // Hall sensor inputs — GPIO 34/35/36 are input-only, no internal pull-up
    pinMode(PIN_HALL_A, INPUT);
    pinMode(PIN_HALL_B, INPUT);
    pinMode(PIN_HALL_C, INPUT);

    attachInterrupt(digitalPinToInterrupt(PIN_HALL_A), onHallA, RISING);
    attachInterrupt(digitalPinToInterrupt(PIN_HALL_B), onHallB, RISING);
    attachInterrupt(digitalPinToInterrupt(PIN_HALL_C), onHallC, RISING);

    updatePulsesPerRev();

    lastLoopMs   = millis();
    lastStatusMs = millis();

    sendStatus("idle");
}

void loop() {
    // --- Read serial commands ---
    static char rxBuf[128];
    static uint8_t rxIdx = 0;

    while (Serial.available()) {
        char c = Serial.read();
        if (c == '\n' || c == '\r') {
            if (rxIdx > 0) {
                rxBuf[rxIdx] = '\0';
                handleCommand(rxBuf);
                rxIdx = 0;
            }
        } else if (rxIdx < sizeof(rxBuf) - 1) {
            rxBuf[rxIdx++] = c;
        }
    }

    // --- PID + RPM calc at LOOP_INTERVAL_MS ---
    unsigned long now = millis();
    unsigned long elapsed = now - lastLoopMs;

    if (elapsed >= LOOP_INTERVAL_MS) {
        // Snapshot and clear pulse count atomically
        noInterrupts();
        uint32_t pulses = pulseCount;
        pulseCount = 0;
        interrupts();

        // RPM from pulse count over elapsed window
        // RPM = (pulses / pulsesPerRev) * (60000 / elapsed_ms)
        currentRpm = (pulsesPerRev > 0 && elapsed > 0)
            ? ((float)pulses / pulsesPerRev) * (60000.0f / (float)elapsed)
            : 0.0f;

        // PID
        if (targetRpm > 0.0f) {
            float error = targetRpm - currentRpm;
            pidIntegral  += error * (float)elapsed / 1000.0f;
            float derivative = (error - pidPrevError) / ((float)elapsed / 1000.0f);
            pidPrevError = error;

            float output = Kp * error + Ki * pidIntegral + Kd * derivative;
            setMotorPwm(pwmDuty + output);
        }

        lastLoopMs = now;
    }

    // --- Periodic status output ---
    if (millis() - lastStatusMs >= STATUS_INTERVAL_MS) {
        sendStatus(targetRpm > 0 ? "running" : "idle");
        lastStatusMs = millis();
    }
}
