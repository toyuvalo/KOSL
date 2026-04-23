# KOSL Tube Furnace — Build Guide

**Authors:** Yuval Olsha + Lev Kropp  
**Project:** Kropp Olsha Science Lab (KOSL)  
**Version:** 0.1.0  
**Status:** Pre-build — shopping phase

> **Safety first:** This machine runs on mains AC voltage (120V) and reaches temperatures above 1000°C.
> Read §3 (Safety) completely before purchasing or building anything.
> Do not work alone on mains wiring. Do not power on without a fused IEC inlet and working thermal shutoff.

---

## 1. Overview

A tube furnace heats a ceramic or quartz tube to high temperature in a controlled, uniform zone. It is essential for KOSL semiconductor processes:

| Process | Temperature | Phase needed |
|---------|-------------|--------------|
| Thermal oxidation of Si (SiO₂ gate dielectric) | 900–1100°C | Phase 2 |
| ZnO TFT channel anneal | 400–600°C | Phase 2 |
| Metal contact anneal (Al, Au) | 300–500°C | Phase 2 |
| Diffusion doping (future) | 800–1100°C | Phase 3+ |

This build targets **1100°C max**, which covers all Phase 2 and Phase 3 processes. It uses a commercial PID temperature controller driving a Solid State Relay (SSR) to switch mains power to a hand-wound Kanthal heating coil. An optional ESP32 adds data logging and remote monitoring.

**Roadmap position:** Required for KOSL Phase 2 (first transistors) — thermal oxidation for gate dielectric.

---

## 2. System Architecture

```
  Mains AC (120V)
       │
  ┌────┴────┐
  │ Fused   │
  │ IEC     │
  └────┬────┘
       │
  ┌────▼──────────┐   SSR trigger (3–32V DC)   ┌──────────────┐
  │  PID Temp     │───────────────────────────▶ │  Solid State │
  │  Controller   │                             │  Relay (SSR) │
  │  (REX-C100)   │◀── Type K thermocouple ─┐  └──────┬───────┘
  └───────────────┘                          │         │ switched mains
                                             │         ▼
                                             │  ┌─────────────────┐
                                             │  │  Kanthal coil   │
                                             │  │  wound on tube  │
                                             │  └─────────────────┘
                                             │         │
                                             │  ┌─────────────────┐
                                             └──│  Quartz tube    │
                                                │  (process zone) │
                                                └─────────────────┘

  Optional:
  Type K thermocouple ──▶ ESP32 (MAX6675) ──▶ USB logging / graphs
```

**Control loop:** PID reads thermocouple temperature → compares to setpoint → toggles SSR on/off to control average power to the heating element → tube reaches and holds setpoint.

**Why commercial PID, not ESP32:** Mains switching must be reliable and isolated. A $15 certified PID + SSR combo is safer, more accurate, and faster to build than a DIY mains control circuit.

---

## 3. Safety

Read this section in full. Violating these rules can cause electrocution, fire, or toxic exposure.

### Electrical
- **All mains wiring inside a grounded metal enclosure.** No exposed 120V terminals.
- **Fuse on the live (hot) line**, rated just above expected draw (a 1200W furnace at 120V draws 10A — use a 12A slow-blow fuse).
- **SSR on a heatsink.** An unheatsunk SSR running 10A will fail thermally and may fail closed (full power, no shutoff). Mount SSR to a metal panel or external heatsink.
- **Ground the chassis.** The metal enclosure must be connected to earth ground via the IEC inlet ground pin.
- **Never open the enclosure while powered.** Use a key-switch or interlock if working alone.

### Thermal
- **1100°C surfaces will ignite most materials on contact.** The tube exterior, end plugs, and any metal near the hot zone will be dangerously hot. Plan for clearance of at least 200mm from any flammable surface.
- **Ceramic fiber insulation is a respiratory hazard** — wear N95 and gloves when cutting or handling. Wet the material before cutting to reduce dust.
- **Quartz tube thermal shock:** heat and cool slowly (< 5°C/min through quartz strain point ~1070°C). Rapid thermal cycling cracks quartz.
- **Over-temperature shutoff:** wire a second thermocouple + independent thermal cutoff relay (e.g., Auber WS-1500H or manual OT relay) set 50°C above max setpoint. If the PID fails ON, the OT relay kills power.

### Chemical
- Thermal oxidation and annealing in air is safe at home lab scale.
- If ever running forming gas (H₂/N₂) or other gases through the tube: research gas handling separately — out of scope for this guide version.

---

## 4. Bill of Materials & Shopping List

### 4a. Core — Must Buy

| # | Item | Qty | Est. Price | Where to buy | Notes |
|---|------|-----|------------|--------------|-------|
| 1 | **Quartz tube**, 50mm OD, 46mm ID, 500mm length | 1 | $35–55 | Amazon, eBay (search "fused quartz tube 50mm") | Verify: OD 50mm, wall ≥2mm, length ≥450mm |
| 2 | **Kanthal A1 resistance wire**, 24 AWG (0.51mm), 10m | 1 | $12–18 | Amazon, eBay, wiretronic.com | Resistance ~7.6 Ω/m; gives ≈1000W at 120V — calc in §6 |
| 3 | **Ceramic fiber blanket**, 1260°C rating, 25mm thick | 1 roll (~0.3m²) | $20–30 | Amazon (search "kaowool 2300F blanket") | Cut to wrap tube + line enclosure |
| 4 | **PID temperature controller**, REX-C100 or Inkbird ITC-100VH | 1 | $15–22 | Amazon | Get one with relay + SSR output (dual output); comes with Type K sensor |
| 5 | **Solid State Relay (SSR)**, 25A, 3–32V DC in, 24–480V AC out | 1 | $8–14 | Amazon (search "SSR-25DA") | SSR-25DA is the standard; avoid no-brand sub-$5 |
| 6 | **SSR heatsink** (for DA/DC SSRs, 60×50mm fin type) | 1 | $5–8 | Amazon | Required — SSR will fail without it |
| 7 | **Type K thermocouple**, ceramic-sheathed, 200–300mm probe | 1 extra | $8–14 | Amazon (search "K-type thermocouple 1200C ceramic") | The REX-C100 includes one; buy a second for OT shutoff |
| 8 | **Ceramic end plugs / wool plugs** for 50mm tube | 2 | $5–12 | Amazon, or DIY from ceramic fiber (see §7) | Holds atmosphere in tube; can DIY with leftover ceramic wool |
| 9 | **IEC power inlet with fuse holder and switch** (C14, panel mount) | 1 | $6–10 | Amazon (search "IEC C14 panel mount fuse switch") | 3-in-1: socket + fuse + power switch |
| 10 | **12A slow-blow fuse**, 5×20mm | 5-pack | $4–6 | Amazon | Fuses for the IEC inlet |
| 11 | **Refractory cement / castable** (Kastolite 30 or Satanite) | 500g | $10–18 | Amazon, pottery supply | Secures heating coil in grooves; fills gaps |
| 12 | **High-temp wire**, 18 AWG silicone insulated (1m) | 1 | $6–10 | Amazon (search "silicone wire 18AWG high temp") | For mains connections near hot zone; PVC melts |
| 13 | **Thermal shutoff relay** (over-temperature cutoff) | 1 | $12–18 | Amazon (search "Auber WS-1500H" or "OT relay 1200C") | Independent OT protection, separate from PID |
| 14 | **Ceramic standoffs / coil holders** | 8–12 | $6–12 | Amazon, pottery supply | Holds Kanthal coil off insulation; optional but prolongs coil life |

**Core subtotal: ~$160–220**

### 4b. Enclosure & Structure — Must Buy

| # | Item | Qty | Est. Price | Notes |
|---|------|-----|------------|-------|
| 15 | **Steel project enclosure**, 300×200×150mm (or similar) | 1 | $20–35 | Amazon, electronics surplus — needs to fit tube length + controls |
| 16 | **Steel tube supports / V-brackets** for 50mm tube | 2 | $5–10 | Cut from angle iron, or 3D print in ABS with ceramic paper lining |
| 17 | **M4 machine screws + nuts** (assorted) | 1 pack | $5 | Hardware store |
| 18 | **Spade connectors + heat-shrink tubing** | 1 pack | $6 | For wiring |
| 19 | **DIN rail + DIN rail terminal blocks** (optional but clean) | — | $8–12 | For internal wiring bus |

**Enclosure subtotal: ~$45–65**

### 4c. Optional — ESP32 Data Logger

| # | Item | Qty | Est. Price | Notes |
|---|------|-----|------------|-------|
| 20 | **MAX6675 thermocouple-to-SPI breakout** | 1 | $3–6 | Amazon; reads Type K via SPI → ESP32 |
| 21 | Extra **Type K thermocouple**, bare bead or mini connector | 1 | $5–8 | For the logger (PID keeps its own sensor) |
| 22 | **ESP32 dev board** | 1 | Have | Already in lab |
| 23 | **USB cable** | 1 | Have | Already in lab |

**Logger subtotal: ~$10–15 extra**

### 4d. Confirm / Check Before Ordering

| Item | Action needed |
|------|---------------|
| Mains outlet type at build location | Confirm 120V (US/CA) — guide assumes 120V throughout |
| Tube length vs enclosure width | Measure before ordering tube; enclosure must accommodate tube + 50mm clearance each end |
| Quartz vs alumina tube | Quartz OK for ≤1100°C; alumina needed for ≥1200°C. Quartz recommended for Phase 2. |

**Grand total (core + enclosure, no logger): ~$200–285**

---

## 5. 3D Printing

Only two printed parts needed. Everything else is sheet metal, ceramic, or off-shelf.

### Part 1 — Tube End Cap Inserts (×2, optional)
- If ceramic fiber plugs are not purchased: print in ABS, line interior with ceramic fiber wool
- Simple cylinder with 50mm OD, 30mm long, one closed end
- **Must be ABS or better** — PLA will deform; PETG marginal at sustained 100°C+ at tube exit
- Pack with ceramic fiber wool to insulate end

### Part 2 — ESP32 Logger Mount (optional)
- Flat bracket to mount ESP32 + MAX6675 to outside of furnace enclosure
- Simple L-bracket; no thermal requirements (logger is outside enclosure)

---

## 6. Kanthal Coil Design

### Wire resistance and power calculation

Wire: Kanthal A1, 24 AWG (0.51mm diameter)  
Resistance: ~7.6 Ω/m at room temp (increases ~10% at operating temp — design for cold resistance)

**Target power:** 800–1000W (enough to reach 1100°C in a well-insulated 50mm tube)

At 120V: `R = V² / P = 120² / 1000 = 14.4 Ω`  
Length needed: `14.4 Ω / 7.6 Ω/m ≈ 1.9m` of wire

Use **2.0–2.2m** (adds safety margin; slight derating is fine).  
Current draw: `P / V = 1000W / 120V ≈ 8.3A` — SSR-25DA is more than adequate.

### Coil winding

1. Wind wire onto a 50mm mandrel (use the tube itself as mandrel, wrapped in paper to prevent sticking)
2. Coil pitch: 3× wire diameter spacing between turns (~1.5mm gap for 24 AWG)
3. Single-layer helix over ~300mm active length → uniform hot zone
4. Leave 150mm cold at each end (tube exit zones stay cool)
5. Tuck coil ends through end insulation to reach external terminals

### Coil resistance check
Measure with multimeter before installation. Target: 13–16 Ω cold. If outside range, adjust length before cementing.

---

## 7. Assembly — Step by Step

### Step 1 — Prepare enclosure
- Cut two circular holes in opposite short faces of enclosure for tube pass-through (50mm ID + 5mm clearance)
- Cut rectangular cutout in front face for PID controller panel mount
- Cut hole for IEC inlet on rear face
- Drill holes for SSR mount, thermocouple entry, and any ventilation
- File all cut edges smooth; deburr
- Connect chassis to IEC ground pin with a short green/yellow wire — do this now before anything else

### Step 2 — Line enclosure with ceramic fiber
- Cut ceramic fiber blanket into panels to line bottom, sides, top of tube cavity
- Leave the tube pass-through holes open
- Secure with high-temp adhesive or refractory cement
- This is the most irritating step — wear N95, gloves, long sleeves

### Step 3 — Wind and test coil
- Wind Kanthal per §6
- Measure resistance; confirm 13–16 Ω
- Set aside — do not install yet

### Step 4 — Prepare tube
- Clean quartz tube with IPA; let dry
- Mark the 300mm active zone (center) and 100mm cold zones at each end
- Optional: score shallow spiral groove into a ceramic former (castable refractory poured around the tube at the shop) — OR lay coil directly in ceramic fiber if skipping former

### Step 5 — Install coil
- Lay coil into/onto tube's active zone
- Pack refractory cement into any gaps between coil and ceramic fiber; let cure per cement instructions (usually 24h air dry + 2h low-temp bake at 200°C before first high-temp run)
- Route coil ends out through end insulation to terminal block

### Step 6 — Install thermocouple
- Primary thermocouple (to PID): route ceramic-sheathed probe into tube so tip sits at center of hot zone
- OT thermocouple: position 10mm from hot zone center, route to OT shutoff relay
- Seal thermocouple entry with ceramic fiber wool to reduce air draft

### Step 7 — Wire mains (do together, one person reads wiring, other connects)

> Work unplugged. Double-check every connection before first power-on.

```
IEC Inlet L (live/hot) ──── Fuse ──── OT relay NC ──── SSR AC-in L
IEC Inlet N (neutral)  ──────────────────────────────── SSR AC-in N
SSR AC-out L ──── Kanthal terminal 1
SSR AC-out N ──── Kanthal terminal 2    [or neutral direct to Kanthal terminal 2]
IEC Inlet GND ──── Chassis ground

PID controller 24V DC out (+) ──── SSR DC-in (+)
PID controller relay out (−)  ──── SSR DC-in (−)   [or PID SSR trigger terminals]
PID controller thermocouple IN ──── Primary Type K (observe polarity: + yellow, − red for Type K)
OT relay thermocouple IN ──── OT Type K thermocouple
OT relay set to: max setpoint + 50°C (e.g., if max use = 1100°C, set OT = 1150°C)
```

All mains wires near heat: use 18 AWG silicone-insulated wire.

### Step 8 — Cold test (no mains, no power)
- With meter in continuity mode: confirm chassis to earth ground pin = 0 Ω
- Confirm L to N: no continuity (open circuit — SSR off, OT relay closed = good)
- Confirm L to chassis: no continuity
- Confirm thermocouple resistance: ~5–30 Ω (Type K sanity check)

### Step 9 — First power-on (controlled)
- Plug in; PID should power on and show room temperature
- Set PID target to 50°C (well below operating)
- SSR should click on/off; tube should feel warm after 5 min
- Monitor: PID reading, SSR indicator LED, chassis temp (should stay cool)
- If anything smells wrong or SSR LED stays solid: unplug immediately

### Step 10 — Cure bake
Before process use, the refractory cement must be cured:
1. 100°C / 1h → 200°C / 1h → 400°C / 1h → 600°C / 1h → cool to room (inside furnace, lid closed)
2. This drives out moisture; skipping this causes cracking and steam damage to quartz

---

## 8. Wiring Reference

```
                     ┌──────── Fuse (12A SB) ─────────┐
IEC L (hot) ─────────┤                                 │
                     └─────────────────────────────────┤
                                                        │
                                               OT relay NC (in series)
                                                        │
                                               SSR AC-in L
IEC N (neutral) ──────────────────────────── SSR AC-in N

SSR AC-out L ────────────────────────────── Kanthal end 1
SSR AC-out N (or IEC N direct) ─────────── Kanthal end 2

IEC GND ─────────────────────────────────── Chassis (green wire, short)

PID (+12–24V out) ──────────────────────── SSR DC+ (3–32V)
PID (relay/SSR out) ────────────────────── SSR DC−

PID Thermocouple IN (+) ──────────────── Primary Type K (+) [yellow]
PID Thermocouple IN (−) ──────────────── Primary Type K (−) [red]

OT relay IN (+) ──────────────────────── OT Type K (+)
OT relay IN (−) ──────────────────────── OT Type K (−)
```

---

## 9. PID Configuration (REX-C100)

The REX-C100 ships with default auto-tune. Use it:

1. Power on; set SP (setpoint) to 500°C
2. Enter configuration menu (hold SET for 3s): set input type to K-type thermocouple
3. Enable auto-tune: AT parameter → ON; furnace will ramp and hunt for ~10 minutes, then lock in Kp/Ki/Kd
4. After auto-tune: record Kp, Ki, Kd values (write them here after your session)
5. The REX-C100 cycle time default is 2s — reduce to 0.5s for smoother SSR switching (less thermal cycling noise)

**Temperature ramp rate:** The PID alone does not limit ramp rate. For quartz tube longevity, limit ramp manually by stepping setpoint in 50°C increments every 5 minutes below 600°C, then freely above.

---

## 10. ESP32 Data Logger (Optional)

Full firmware in `firmware/furnace_logger.ino`. Reads temperature from MAX6675 via SPI every 1 second and outputs CSV over USB serial.

**Wiring:**
```
MAX6675 VCC → ESP32 3.3V
MAX6675 GND → ESP32 GND
MAX6675 SCK → ESP32 GPIO 18
MAX6675 CS  → ESP32 GPIO 5
MAX6675 SO  → ESP32 GPIO 19
Type K (+)  → MAX6675 T+ (yellow)
Type K (−)  → MAX6675 T− (red)
```

**Output format (115200 baud):**
```
timestamp_ms,temp_c
1000,23.50
2000,24.25
...
```

Log to file with: `python3 -c "import serial,sys; s=serial.Serial('COMx',115200); [sys.stdout.write(s.readline().decode()) for _ in iter(int,1)]" > furnace_log.csv`

---

## 11. Operating Procedure

### Standard anneal / oxidation run

1. Load substrate into quartz tube; position at center of hot zone using a quartz boat or alumina paddle
2. Insert end plugs (leave one end slightly ajar for atmospheric exchange if running in air)
3. Set PID target temperature
4. Ramp: increase setpoint by 50°C/step every 5 min until 600°C, then let PID ramp freely
5. Hold at target for process time (see recipe table below)
6. Cool: set PID to 0°C (or off); let cool naturally inside furnace — do NOT open furnace above 200°C

### Process recipes (starting points — refine by results)

| Process | Temp | Time | Atmosphere | Expected result |
|---------|------|------|------------|-----------------|
| Dry thermal oxidation (SiO₂) | 1000°C | 60 min | Air (open end) | ~30–50 nm SiO₂ |
| ZnO channel anneal | 450°C | 30 min | Air | Improved ZnO crystallinity |
| Al contact anneal | 350°C | 20 min | N₂ or air | Ohmic contact to ZnO |
| General anneal / degas | 300°C | 30 min | Air | Removes moisture, organics |

### Emergency shutoff
1. Hit power switch on IEC inlet (front panel)
2. Do not open furnace — thermal shock risk to tube and substrate
3. OT relay will have already killed power if PID malfunctioned

---

## 12. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| PID reads room temp but setpoint reached, no heat | SSR DC input not receiving trigger | Check PID SSR output wiring; confirm SSR DC+ is getting 3–32V when PID calls for heat |
| PID reads "EEEE" or error | Thermocouple open circuit | Check thermocouple wiring polarity; check probe isn't broken |
| SSR runs hot | No heatsink, or ambient too high | Mount SSR to heatsink; confirm it's SSR-25DA not undersized |
| Quartz tube cracked | Thermal shock | Ramp more slowly; never touch cold object to hot tube |
| Temperature overshoots badly | PID not auto-tuned, or Ki too high | Re-run auto-tune; if still bad, manually reduce Ki |
| Furnace won't reach setpoint | Not enough insulation, or coil resistance too high | Add more ceramic fiber; recheck coil Ω (should be 13–16 Ω cold) |
| Refractory cement cracking | Skipped cure bake | Run cure bake sequence (§7 Step 10); then re-cement cracks |

---

## Next Steps — Ordered by Priority

- [ ] **Buy:** Core BOM items 1–14 (especially tube, Kanthal, ceramic fiber, PID, SSR)
- [ ] **Buy:** Enclosure items 15–19
- [ ] Confirm mains voltage (120V assumed) and confirm enclosure dimensions fit tube
- [ ] Wind and measure Kanthal coil before assembly; confirm resistance in range
- [ ] Run cure bake before first process run
- [ ] Design quartz boat / substrate holder in CAD (ClawsSCAD session)
- [ ] Log first oxidation run with ESP32 logger; record time-temperature curve
- [ ] Add vacuum/gas fitting to end cap (Phase 2.5 — controlled atmosphere)
