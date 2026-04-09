# Phase 2: Core Co-allocation Engine - Research

## Context Summary
- **Domain**: Build the scoring algorithm and enforce dual-resource locking.
- **Constraints**: Runs every 5s on tick, locks exactly 1 parking + 1 charger.
- **Formula**: `(100 - batteryLevel) * 0.6 + (1 / (etaMinutes + 1)) * 40`.

## Technical Approach

### 1. Separation of Concerns
Currently, `src/simulator.js` handles both tick-management and vehicle physics (battery decay, ETA drop). It's getting bloated. We should extract the allocation logic into a new module: `src/engine/allocator.js`.

The `allocator.js` module will export a function `runAllocationTick(db)` that:
1. Fetches all current stations and vehicles.
2. Filters for vehicles that are unassigned and within reservation range (`ETA <= 5`).
3. Scores eligible vehicles using the formula.
4. Identifies available slots (`availableParking > 0 && availableChargers > 0`).
5. Performs assignments starting from highest-scoring vehicles.
6. Returns the delta/updates object.

`src/simulator.js` will call this function immediately after calculating the movement physics, and merge the updates into one massive `db.ref('/').update()` atomic transaction.

### 2. Avoiding Race Conditions (Dual Locking)
Even though the Firebase Realtime SDK isn't strictly transactional in `update()` calls, since the Node server acts as the single "God Mode" orchestrator running sequentially, we don't have to worry about race conditions from multiple clients. We can rely purely on memory state during the tick loop:
- Copy the current `availableParking` and `availableChargers` values into memory.
- Loop over sorted vehicles.
- If selected: Decrement the in-memory counts, push the update (`stations/X/availableParking = current-1`, `vehicles/Y/status = "RESERVED"`).
- This inherently guarantees no double booking, as the loop is strictly synchronous.

### 3. State Management
Vehicles transition: `driving` → `waiting` (if ETA=0 but no slot) OR `RESERVED` (if slot found & ETA<=5). Once ETA=0 and `RESERVED`, they move to `OCCUPIED`.

## Validation Architecture
*(Required by Nyquist Validation Framework)*

**Dimension 1: Component/Unit**
- The score correctly prioritizes a distant vehicle with 5% battery over a close vehicle with 80% battery.

**Dimension 2: Integration**
- The `allocator.js` functions successfully integrate into the `simulator.js` 5s tick.

**Dimension 3: State/Data**
- Stations never report negative `availableParking` or `availableChargers` under high load.
- Over-allocation is impossible.
