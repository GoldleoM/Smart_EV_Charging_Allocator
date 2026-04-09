---
phase: 2
wave: 1
depends_on: []
files_modified:
  - "src/engine/allocator.js"
  - "src/simulator.js"
autonomous: true
---

# Phase 2 — Plan 1: Allocation Engine

## Goal
Build the scoring algorithm and enforce dual-resource locking.

## Tasks

```xml
<task id="2-01-01">
  <read_first>
    <file>.planning/phases/02-core-co-allocation-engine/02-CONTEXT.md</file>
  </read_first>
  <action>
    Create `src/engine/allocator.js`. Implement and export a pure function `function calculatePriorityScore(vehicle)`. It must use the exact formula: `(100 - vehicle.batteryLevel) * 0.6 + (1 / (vehicle.etaMinutes + 1)) * 40`. Add a small wrapper to return a clamped/rounded value if desired, but keep the core logic identical.
  </action>
  <acceptance_criteria>
    `src/engine/allocator.js` exists and exports `calculatePriorityScore`.
  </acceptance_criteria>
</task>

<task id="2-01-02">
  <read_first>
    <file>.planning/phases/02-core-co-allocation-engine/02-CONTEXT.md</file>
    <file>src/engine/allocator.js</file>
  </read_first>
  <action>
    In `src/engine/allocator.js`, implement and export a pure function `function allocateSlots(vehicles, stations)`. 
    1. Filter the `vehicles` dictionary for those with `status === "driving"` and `etaMinutes <= 5`. 
    2. Sort these eligible vehicles globally by priority score descending.
    3. Initialize a local `updates` object.
    4. Loop through sorted vehicles. For each vehicle, check its `targetStationId` in the `stations` map.
    5. If that station has BOTH `availableParking > 0` AND `availableChargers > 0`:
       - Decrement those counts in the in-memory `stations` object to prevent double-booking.
       - Add `/stations/${targetStationId}/availableParking: newCount` to `updates`.
       - Add `/stations/${targetStationId}/availableChargers: newCount` to `updates`.
       - Add `/vehicles/${vehicleId}/status: "RESERVED"` to `updates`.
    6. Return the `updates` object.
  </action>
  <acceptance_criteria>
    `allocateSlots` implements strict dual-resource locking and respects the sorted priority order correctly without writing directly to the database.
  </acceptance_criteria>
</task>

<task id="2-01-03">
  <read_first>
    <file>src/simulator.js</file>
    <file>src/engine/allocator.js</file>
  </read_first>
  <action>
    Refactor `src/simulator.js` to integrate the allocator. Import `allocateSlots` from `src/engine/allocator.js`. Inside the `setInterval(..., 5000)` loop:
    1. Fetch `db.ref('/')` to get all vehicles AND all stations simultaneously.
    2. Execute the current battery/ETA physics decay on vehicles. Instead of calculating `updates` locally immediately, mutate the in-memory `vehicles` object.
    3. Create the massive `updates` object spanning the exact physics changes using the mutated `vehicles` object (recording `batteryLevel` and `etaMinutes`).
    4. Pass the mutated `vehicles` and `stations` into `allocateSlots(vehicles, stations)`.
    5. Merge the physics `updates` object with the allocator's returned `updates` object via `Object.assign()`.
    6. Run the final atomic `db.ref('/').update(mergedUpdates)`.
  </action>
  <acceptance_criteria>
    `src/simulator.js` seamlessly executes both decay physics and prioritized pathfinding/slot-locking in one combined 5s tick.
  </acceptance_criteria>
</task>
```

## Verification

- `node src/simulator.js` logs should show simulation ticks, and eventually vehicles should switch from "driving" to "RESERVED".
- Test the priority logic against manual cases if necessary.

## Must Haves

- Strict formulation: `(100 - batteryLevel) * 0.6 + (1 / (etaMinutes + 1)) * 40`.
- Dual locking: `availableParking > 0` AND `availableChargers > 0` synchronously.
