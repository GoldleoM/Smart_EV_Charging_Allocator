# Phase 3: V2N Simulation & Real-Time Sync — Summary

**Date:** 2026-04-09
**Status:** Complete
**Requirements:** SIM-01, RT-01, RT-02, ALLOC-03

## Accomplishments

1. **Queue Bumping Engine (ALLOC-03):** 
   - Implemented critical-vehicle bumping in `src/engine/allocator.ts`.
   - Vehicles with battery ≤ 10% can now revoke reservations from lower-priority `RESERVED` vehicles.
   - Priority weights adjusted to **80% Battery / 20% ETA** to favor urgency.

2. **Full Charging Lifecycle:**
   - **Arrival**: Vehicles transition to `OCCUPIED` status upon hitting 0m ETA.
   - **Charging**: `OCCUPIED` vehicles gain +2% battery per 5s tick.
   - **Departure**: Once at 100% battery, vehicles release their station slot (`availableParking++`) and reset to `driving` with a new random destination.

3. **Physics & Range Improvements:**
   - **Stranded Status**: Vehicles hitting 0% battery now stop moving (ETA halts) and are flagged as `stranded`.
   - **Movement Fix**: Resolved bug where `RESERVED` vehicles would "freeze"; they now continue driving toward their destination.
   - **Range Check**: The allocator now calculates if a vehicle can physically reach a station (consumption rate = 0.5% per minute) before allowing a reservation.

4. **Real-Time Sync (RT-01, RT-02):**
   - Verified native Firebase Realtime Database synchronization.
   - All state transitions (Reservations, Bumps, Charging, Departures) are broadcast to the cloud for frontend visualization.

5. **Validation:**
   - Expanded Jest test suite in `tests/allocator.test.ts`.
   - Live simulator verification confirmed self-sustaining loop.

## Files Modified
- `src/engine/allocator.ts` — Core logic, range checks, bumping, scoring weights.
- `src/simulator.ts` — Physics loop, charging, departures, stranded status.
- `src/models/Vehicle.ts` — Added `stranded` status and tuned initial seed battery ranges.
- `tests/allocator.test.ts` — Added queue bumping and priority weight test cases.

## Technical Decisions
- **Battery Weight (80%)**: Emergency vehicles are prioritized over "closer" vehicles with more charge.
- **Consumption (0.5%/min)**: Balanced for a 3.3-hour "real-world" range suitable for demo visualization.
- **Self-Cleaning Loop**: Departed vehicles keep the simulation alive forever.
