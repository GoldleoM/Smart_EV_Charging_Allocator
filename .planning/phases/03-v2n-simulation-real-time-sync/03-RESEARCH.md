# Phase 3: V2N Simulation & Real-Time Sync - Research

## Context Summary
- **Domain**: Handle queue re-routing/bumps (ALLOC-03) and finalize Real-Time Sync (RT-01, RT-02).
- **Constraints**: `OCCUPIED` slots are immune. Bumping only occurs if `battery <= 10`.

## Technical Approach

### 1. Augmenting `allocateSlots`
Currently, `allocateSlots` solely evaluates unassigned (`driving`) vehicles against `FREE` slots. To support bumping, it needs to evaluate all currently `RESERVED` vehicles across the system.

**Algorithm:**
1. Filter eligible unassigned vehicles (`status === "driving"` and `etaMinutes <= 5`). Score and sort descending.
2. Filter currently `RESERVED` vehicles. Score them dynamically to represent their current priority.
3. For each unassigned vehicle:
   - *Attempt Normal Allocation*: Check if their `targetStationId` has a FREE slot. If yes, assign it.
   - *Attempt Bumping (if critical)*: If no FREE slots exist at the target station, and the vehicle has `batteryLevel <= 10`:
     - Sort the `RESERVED` vehicles by priority score *ascending* (lowest priority first).
     - Find the lowest priority `RESERVED` vehicle.
     - If the critical vehicle's score is strictly greater than the lowest `RESERVED` vehicle's score:
       - Revoke reservation: `displacedVehicle.status = "driving"`. (Updates payload)
       - The displaced slot temporarily returns to the pool, guaranteeing a slot is open.
       - Re-assign critical vehicle: `criticalVehicle.status = "RESERVED"`, update its `targetStationId` to the displaced slot's station (re-routing it). (Updates payload)
       - Swap the array references so the displaced vehicle is removed from the `RESERVED` pool.

### 2. Real-Time Transport
Because the backend uses `firebase/database` client SDK to directly mutate the cloud JSON object with `update()`, the required Transport layer (RT-01, RT-02) is technically fully implemented on the backend. No Socket.io server is needed. The Frontend application will attach listeners to `/vehicles` and `/stations`. 

### 3. Edge Case: Station Re-routing
When a vehicle steals a reservation from another station, its `targetStationId` changes. The simulation physics in `simulator.ts` currently doesn't care about `targetStationId` when interpolating ETA, so we don't need to rebuild ETA logic (it just represents arrival time abstractly).

## Validation Architecture
*(Required by Nyquist Validation Framework)*

**Dimension 1: Component/Unit**
- If a `driving` vehicle has 9% battery, and all slots are `RESERVED` by vehicles with >= 50% battery, the driving vehicle will steal a slot and the 50% vehicle reverts to `driving`.
- `OCCUPIED` vehicles are never touched regardless of priority.

**Dimension 2: Integration**
- Extends the existing `allocator.ts` logic natively without modifying the `simulator.ts` physics loop payload format.

**Dimension 3: State/Data**
- Stations capacities `availableParking` do not drop below zero during a bump swap (stealing a reservation means `available` stays at 0, merely the owner changes).
