---
phase: 3
wave: 1
depends_on: []
files_modified:
  - "src/engine/allocator.ts"
autonomous: true
---

# Phase 3 — Plan 1: Queue Bumping Engine

## Goal
Implement priority-based queue bumping to ensure critical cars under 10% battery seize existing reservations if available.

## Tasks

```xml
<task id="3-01-01">
  <read_first>
    <file>.planning/phases/03-v2n-simulation-real-time-sync/03-CONTEXT.md</file>
    <file>src/engine/allocator.ts</file>
  </read_first>
  <action>
    In `src/engine/allocator.ts`, modify `allocateSlots()`. 
    Identify the currently `RESERVED` vehicles and store them in a local array. 
    Calculate and attach their `queuePriorityScore` dynamically utilizing `calculatePriorityScore` so they can be securely compared against the unassigned cars. Add their updated tracking score to the `updates` object so clients can see it.
  </action>
  <acceptance_criteria>
    `RESERVED` vehicles exist as a sorted dynamic pool inside the core allocation function.
  </acceptance_criteria>
</task>

<task id="3-01-02">
  <read_first>
    <file>src/engine/allocator.ts</file>
  </read_first>
  <action>
    In `allocateSlots()`, inside the main allocation loop for eligible vehicles (`driving` & `ETA <= 5`), extend the slot assignment logic:
    If a station lacks `availableParking` or `availableChargers`, check if the unassigned vehicle has `batteryLevel <= 10`.
    If true, find the `RESERVED` vehicle with the absolute lowest `queuePriorityScore`.
    If the critical unassigned vehicle's score > the lowest reserved vehicle's score:
       - Rob the reservation: Set critical vehicle's `targetStationId` = displaced vehicle's `targetStationId`.
       - Assign critical vehicle `status = "RESERVED"`.
       - Demote displaced vehicle: `status = "driving"`. 
       - Record these property mutations via the `updates` object accurately using Firebase patch strings.
       - Keep the `stations` capacity counts identical (since a swap is net 0).
       - Remove the displaced car from the local `RESERVED` array and optionally add the critical car to prevent double-robbing.
  </action>
  <acceptance_criteria>
    Critical cars securely steal slots utilizing the Priority Math mechanism without destroying capacity counts.
  </acceptance_criteria>
</task>
```

## Verification
- Unit bounds testing in `tests/allocator.test.ts` to mimic a crowded scenario.
- Successful reallocation of targetStationIds.

## Must Haves
- Safe swap logic.
- The physics payload and tick loops remain completely agnostic to this allocator complexity.
