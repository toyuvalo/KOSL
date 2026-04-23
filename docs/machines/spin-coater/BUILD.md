# KOSL Spin Coater — Build Guide

**Authors:** Yuval Olsha + Lev Kropp  
**Project:** Kropp Olsha Science Lab (KOSL)  
**Version:** 0.1.0  
**Status:** In-progress build

---

## 1. Overview

A spin coater deposits thin uniform films of photoresist (or other liquids) onto a substrate by spinning it at a controlled speed. Centrifugal force spreads the liquid to a uniform thickness determined primarily by RPM — higher RPM → thinner film.

For the Albu photoresist process, we need 1000–6000 RPM with ±10 RPM stability. This build achieves that using a closed-loop feedback system: three Hall-effect magnetic encoders read the actual plate speed, and an ESP32 runs a PID controller to drive a PWM signal that corrects the motor.

**Roadmap position:** Required for KOSL Phase 2 (first transistors) and Phase 2.5 (semi-automated lithography).

---

## 2. System Architecture

```
  [Target RPM via Serial]
         │
         ▼
  ┌─────────────┐   PWM duty   ┌──────────────┐  voltage  ┌────────────────┐
  │  ESP32 PID  │─────────────▶│ Motor Driver │──────────▶│ Brushed Motor  │
  │  controller │              └──────────────┘           │  + Spin Plate  │
  └─────────────┘                                         └────────────────┘
         ▲                                                        │
         │  pulse count / timing                                  │ magnets on
  ┌──────┴──────────┐                                            │ underside
  │ 3× Hall sensors │◀──────────────────────────────────────────┘
  │  at 120° apart  │   (sensors fixed, plate + magnets rotate)
  └─────────────────┘
```

**How it works:**
- N disc magnets are press-fit into the underside of the spinning plate
- Three A3144 Hall-effect sensors are fixed 120° apart beneath the plate at magnet sweep radius
- As the plate spins, each magnet sweeps past all three sensors, generating a pulse on each
- The ESP32 counts pulses per unit time → calculates RPM
- A PID loop adjusts PWM duty to keep actual RPM at target

**Pulses per revolution:** `3 × (number of magnets on plate)`. With 12 magnets: 36 pulses/rev. At 3000 RPM → 1800 pulses/sec — well within ESP32 interrupt capability.

---

## 3. Bill of Materials

| # | Item | Status | Qty | Notes |
|---|------|--------|-----|-------|
| 1 | Brushed DC motor (small, 6–12V) | **Have** | 1 | Check voltage rating — see §5 |
| 2 | ESP32 dev board (38-pin) | **Have** | 1 | Any variant works |
| 3 | Motor driver | **Have** | 1 | L298N if motor > 2A stall; DRV8833 if < 2A |
| 4 | A3144 Hall-effect sensors | **Buy** | 3 (order 5+) | Digital open-collector, 4.5–24V, ~$0.40 each |
| 5 | N52 disc magnets | **Confirm** | 6 or 12 | 5×2mm or 6×2mm; must fit 3D printed pockets |
| 6 | 10kΩ resistors | **Confirm** | 3 | Pull-ups for sensor outputs |
| 7 | 12V DC power supply | **Confirm** | 1 | Or LiPo + regulator |
| 8 | 3D printed parts (see §4) | **Print** | 4 pcs | PETG or ABS |
| 9 | USB cable (USB-A to USB-micro/C) | **Have** | 1 | For flashing |
| 10 | Jumper wire, breadboard or PCB | **Confirm** | — | For prototype wiring |
| 11 | M3 screws + heat-set inserts | **Confirm** | ~12 | For mounting motor + tray |

**Encoder note:** Order A3144, not A3141/A3142/A3143. The A3144 is unipolar (triggers on one pole) — simpler for this use case. Buy 5 to have spares; one per batch is often DOA.

**Magnet count tradeoff:**
- 6 magnets → 18 pulses/rev → adequate but marginal at low RPM
- 12 magnets → 36 pulses/rev → recommended, gives smooth PID response at all speeds

---

## 4. 3D Printing

Four parts to print. CAD files will be added in a follow-on session; for now, design intent is documented here so either of us can model them.

### Part 1 — Motor Mount Bracket
- Clamps around motor body (measure OD first)
- Two ears with M3 holes to bolt to chassis base
- Sets correct axle height above base (leave room for electronics tray below)

### Part 2 — Spinning Plate
- Circular disc, 80–100mm diameter (choose based on substrate size)
- Central bore: press-fit or set-screw onto motor shaft (measure shaft OD first)
- 6 or 12 magnet pockets on underside, evenly spaced on a ring (decide magnet radius — must align with sensor bracket)
- Keep plate as light and balanced as possible; add balance boss opposite any asymmetry
- Top surface: flat; optionally add a small center boss + three vacuum grooves if vacuum chuck is desired later

### Part 3 — Sensor Bracket
- Fixed ring or 3-arm spider that sits beneath the spinning plate
- Three sensor mounts at exactly 120° (±1°) on the same radius as the plate magnets
- Sensor pocket: snug fit for A3144 body (4×3mm body); airgap between sensor face and magnet sweep = 1–2mm
- Bolt to chassis base, does not rotate

### Part 4 — Electronics Tray
- Flat sled that mounts ESP32 + motor driver side by side
- Bolt holes to chassis base or underside of motor bracket
- Cable pass-through slots for sensor wires

**Print settings:**
- Material: PETG (preferred) or ABS — motor generates heat
- Layer height: 0.2mm
- Infill: 30%+ for bracket and mount; 20% for tray
- Perimeters: 3–4
- Supports: only for overhanging sensor pockets if needed

---

## 5. Assembly — Step by Step

### Step 1 — Measure motor
- Record motor body OD, shaft OD, shaft length
- Record operating voltage range (check label or datasheet by model number)
- Note: do not exceed rated voltage; we will run at rated voltage and control speed via PWM duty

### Step 2 — Press magnets into plate
- Print spinning plate; test-fit magnets dry first
- Confirm pocket depth: magnets should sit flush or 0.2mm recessed
- Apply a drop of cyanoacrylate per pocket; press magnets in; let cure 10 min
- For better signal: alternate polarity N/S/N/S around the ring (test both configs during calibration — §9)

### Step 3 — Mount motor
- Press plate onto motor shaft (friction fit or set-screw)
- Check plate is perpendicular to shaft — wobble will cause uneven airgap and noisy encoder signals
- Seat motor in mount bracket; tighten clamp screws finger-tight, then verify plate spins freely, then lock

### Step 4 — Mount sensor bracket
- Position sensor bracket beneath plate; align sensor pockets to magnet sweep ring
- Confirm airgap: slide a 1mm feeler gauge (or folded paper) between sensor face and plate underside — should just fit
- Bolt bracket to base; sensors must be stationary

### Step 5 — Wire sensors
- Insert A3144 into each sensor pocket, flat face toward magnets
- Per sensor: Pin 1 (VCC) → ESP32 3.3V, Pin 2 (GND) → GND, Pin 3 (OUT) → 10kΩ pull-up to 3.3V, then → GPIO
- GPIO assignments: Sensor A → GPIO 34, Sensor B → GPIO 35, Sensor C → GPIO 36
- Twist each sensor's three wires together to reduce noise; keep sensor wire runs short

### Step 6 — Wire motor driver
- Motor driver VIN → 12V supply positive
- Motor driver GND → 12V supply negative → ESP32 GND (common ground!)
- Motor driver IN/PWM → ESP32 GPIO 25
- Motor driver OUT → motor terminals (polarity: check spin direction; if reversed, swap)
- If using L298N: tie ENA high and use IN1 for PWM, or use ENA pin for PWM directly

### Step 7 — Wire power
- 12V supply → motor driver + (via 5V linear/buck reg on L298N board) → ESP32 VIN
- If ESP32 board has onboard 3.3V reg: sensors can run off ESP32 3V3 pin (max ~200mA — fine for 3 Hall sensors)
- Add 100µF electrolytic cap across 12V supply terminals at motor driver (reduces motor noise spikes)

### Step 8 — First spin check (no firmware)
- With firmware not yet loaded, manually drive GPIO 25 high (3.3V from jumper) to verify motor spins
- Check direction; swap motor terminals if wrong
- Verify magnets don't drag on sensor bracket (clearance check)

---

## 6. Wiring Reference

```
12V PSU (+) ──────────────────────── Motor Driver VM
12V PSU (-) ──────────────────────── Motor Driver GND
                                      Motor Driver GND ── ESP32 GND (common)

ESP32 3.3V ──┬── 10kΩ ── Hall A OUT ── ESP32 GPIO 34
             │── 10kΩ ── Hall B OUT ── ESP32 GPIO 35
             └── 10kΩ ── Hall C OUT ── ESP32 GPIO 36

Hall A VCC ─── ESP32 3.3V
Hall B VCC ─── ESP32 3.3V
Hall C VCC ─── ESP32 3.3V
Hall A/B/C GND ─── ESP32 GND

ESP32 GPIO 25 ── Motor Driver PWM/IN
Motor Driver OUT1 ── Motor (+)
Motor Driver OUT2 ── Motor (-)   [or GND for single-direction]

ESP32 VIN ── 5V from L298N onboard reg (or separate 5V buck)
```

---

## 7. Firmware

Full source at `firmware/spin_coater.ino`. Key design decisions:

- **Interrupt-driven counting:** All three sensor pins use `attachInterrupt()` with `RISING` edge. ISR increments a single atomic counter. This is safe because all three sensors fire on the same physical plate rotation — triple-counting is the intent.
- **RPM window:** Calculated every 100ms. Short enough for responsive PID; long enough for statistical accuracy at low RPM.
- **PID output:** Mapped to `ledcWrite()` (ESP32 LEDC peripheral), 5kHz frequency, 8-bit resolution (0–255). 5kHz is well above audible range and appropriate for small brushed motors.
- **Serial protocol:** JSON lines at 115200. Send commands; receive status. No dependency on any library — plain `Serial.println`.
- **Tuning via serial:** Kp, Ki, Kd adjustable at runtime without reflash.

**Default PID starting values (tune per §9):**
```
Kp = 0.5
Ki = 0.02
Kd = 0.01
```

**Serial commands:**
```json
{"cmd":"set_rpm","value":3000}        → set target RPM
{"cmd":"stop"}                         → ramp down and stop
{"cmd":"set_kp","value":0.5}          → set proportional gain
{"cmd":"set_ki","value":0.02}         → set integral gain
{"cmd":"set_kd","value":0.01}         → set derivative gain
{"cmd":"set_magnets","value":12}      → update magnet count (default 12)
{"cmd":"status"}                       → request immediate status line
```

**Status output (every 500ms while running):**
```json
{"status":"running","rpm_target":3000,"rpm":2998,"pwm":187,"error":2,"kp":0.5,"ki":0.02,"kd":0.01}
```

---

## 8. Flashing the ESP32

1. Install **Arduino IDE 2.x** from arduino.cc
2. Add ESP32 board support: File → Preferences → Additional Board URLs:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Tools → Board Manager → search "esp32" → install "esp32 by Espressif Systems"
4. Open `firmware/spin_coater.ino`
5. Tools → Board → **ESP32 Dev Module**
6. Tools → Port → select the COM port for your board
7. Tools → Upload Speed → **921600**
8. Click Upload (Ctrl+U)
9. Open Serial Monitor (Ctrl+Shift+M), set baud to **115200**
10. You should see: `{"status":"idle","rpm_target":0,"rpm":0,"pwm":0}`

---

## 9. Calibration

Do this with the motor mounted and plate spinning freely (no substrate).

### Step 1 — Verify encoder
```json
{"cmd":"set_magnets","value":12}
{"cmd":"set_rpm","value":500}
```
Watch the `rpm` field. It should be in the right ballpark. If it reads ~2× expected, you have 6 magnets not 12 — update `set_magnets` accordingly.

### Step 2 — Tune Kp (proportional)
```json
{"cmd":"set_kp","value":0.3}
{"cmd":"set_ki","value":0.0}
{"cmd":"set_kd","value":0.0}
{"cmd":"set_rpm","value":2000}
```
Watch RPM. Increase Kp in steps of 0.1 until RPM oscillates, then back off by 30%. Target: RPM reaches setpoint but oscillates ±50–100 RPM.

### Step 3 — Tune Ki (integral)
```json
{"cmd":"set_ki","value":0.01}
```
Ki pulls out the steady-state offset. Increase slowly (0.005 steps). Target: error drops below ±10 RPM and holds. If RPM starts hunting (slow oscillation), Ki is too high.

### Step 4 — Tune Kd (derivative)
Only add Kd if ramp-up overshoot is a problem.
```json
{"cmd":"set_kd","value":0.005}
```
Increase in small steps. Target: ramp to setpoint without overshoot.

### Step 5 — Verify full range
```json
{"cmd":"set_rpm","value":1000}   → hold 20s → check stability
{"cmd":"set_rpm","value":3000}   → hold 20s → check stability
{"cmd":"set_rpm","value":6000}   → hold 20s → check stability
{"cmd":"stop"}
```

### Step 6 — Load test
Tape a glass microscope slide to plate center. Re-run setpoints. RPM should hold within ±20 RPM of target (I-term compensates for load). If it doesn't settle, increase Ki slightly.

---

## 10. Operating Procedure

### Coat a substrate

1. Place substrate on plate center; secure with tape or vacuum (if vacuum chuck added later)
2. Send target RPM — use recipe table below
3. Dispense photoresist onto center of substrate as plate accelerates
4. Hold at target RPM for specified time
5. Send stop command for controlled ramp-down
6. Remove substrate carefully; proceed to exposure

### RPM recipes (starting points — refine experimentally)

| Process | RPM | Time | Expected thickness |
|---------|-----|------|--------------------|
| Albu egg-white photoresist (negative) | 3000 | 45s | ~1–2 µm |
| Albu egg-white + glycerol (positive) | 2000 | 60s | ~2–3 µm |
| Spin-on-glass (SOG) | 2000–4000 | 30s | 100–200 nm/layer |
| PMMA (for reference) | 4000 | 60s | ~200–400 nm |

### Emergency stop
```json
{"cmd":"stop"}
```
Motor brakes via PWM cutoff. Plate coasts to a stop. Do not power-cycle while substrate is spinning — plate may eject substrate.

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| RPM reads 0 | Sensor wiring, or magnets not triggering sensors | Check airgap (< 2mm), check 10kΩ pull-up present, verify GPIO 34/35/36 with `Serial.println(digitalRead(34))` |
| RPM oscillates wildly | Kp too high | Reduce Kp by 50% |
| RPM stable but wrong (e.g., 2× actual) | Wrong magnet count in firmware | Send `set_magnets` with correct count |
| Plate wobbles | Plate not balanced, or not perpendicular to shaft | Re-seat plate; add balance material to light side |
| Motor driver gets hot | Motor drawing too much current, or driver undersized | Check stall current; upgrade to L298N or add heatsink |
| ESP32 resets under load | Noise on power rail from motor | Add 100µF cap at motor driver input; add ferrite bead on ESP32 5V supply |

---

## Next Steps

- [ ] Design CAD files for all 4 printed parts (ClawsSCAD session)
- [ ] Order A3144 Hall sensors (×5) and N52 5×2mm disc magnets (×15)
- [ ] Confirm motor voltage and stall current → select motor driver
- [ ] Flash firmware and verify encoder reads before assembly
- [ ] Add vacuum chuck port to spinning plate (Phase 2.5)
- [ ] Serial-over-BLE variant (control from phone) — future
