/*
 * KOSL Tube Furnace — ESP32 Temperature Logger
 * Reads Type K thermocouple via MAX6675 (SPI) → CSV over USB serial
 *
 * Pins:
 *   GPIO 18 — SCK
 *   GPIO 19 — SO (MISO)
 *   GPIO  5 — CS
 *
 * Serial: 115200 baud
 * Output: CSV lines  timestamp_ms,temp_c
 *
 * Log to file:
 *   python3 -c "import serial,sys; s=serial.Serial('COMx',115200); \
 *     [sys.stdout.write(s.readline().decode()) for _ in iter(int,1)]" > log.csv
 */

#include <max6675.h>

#define PIN_SCK  18
#define PIN_MISO 19
#define PIN_CS    5

#define LOG_INTERVAL_MS 1000

MAX6675 thermocouple(PIN_SCK, PIN_CS, PIN_MISO);

unsigned long lastLogMs = 0;

void setup() {
    Serial.begin(115200);
    delay(500); // MAX6675 needs ~500ms after power-on before first reading
    Serial.println("timestamp_ms,temp_c");
}

void loop() {
    if (millis() - lastLogMs >= LOG_INTERVAL_MS) {
        float temp = thermocouple.readCelsius();
        Serial.print(millis());
        Serial.print(",");
        Serial.println(temp, 2);
        lastLogMs = millis();
    }
}
