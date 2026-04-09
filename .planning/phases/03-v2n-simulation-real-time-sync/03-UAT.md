---
status: testing
phase: 03-v2n-simulation-real-time-sync
source: [03-SUMMARY.md]
started: 2026-04-09T12:14:00Z
updated: 2026-04-09T12:14:00Z
---

## Current Test

number: 1
name: Cold Start Smoke Test
expected: |
  Kill any running server. Run `npm start`. The simulator boots without errors, seeds stations and vehicles to Firebase, and begins printing tick output (e.g. "Tick → 7 driving | 0 RESERVED") every 5 seconds.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server. Run `npm start`. The simulator boots without errors, seeds stations and vehicles to Firebase, and begins printing tick output every 5 seconds.
result: [pending]

### 2. Queue Bumping — Critical Vehicle Steals Reservation
expected: Run `npm test`. The "critical vehicle bumps a lower priority reserved vehicle when full" test passes — verifying a 5% battery vehicle steals a slot from a 60% battery RESERVED vehicle and the displaced vehicle reverts to "driving".
result: [pending]

### 3. OCCUPIED Immunity
expected: Run `npm test`. No test or code path modifies vehicles with status "OCCUPIED". Reviewing `allocator.ts` confirms OCCUPIED vehicles are excluded from both the unassigned and reserved pools.
result: [pending]

### 4. Capacity Invariance on Bump
expected: Run `npm test`. The bumping test confirms that station capacity fields (`availableParking`, `availableChargers`) are NOT present in the update payload during a swap — proving net-zero capacity change.
result: [pending]

### 5. Real-Time Firebase Sync
expected: Run `npm start` and observe Firebase Realtime Database in the console. Vehicle statuses, battery levels, and ETA values update every 5 seconds. Reservations appear as status changes from "driving" to "RESERVED".
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0

## Gaps

[none yet]
