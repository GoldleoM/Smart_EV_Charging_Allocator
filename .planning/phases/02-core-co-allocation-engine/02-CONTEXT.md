# Phase 2: Core Co-allocation Engine - Context

**Gathered:** 2026-04-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the scoring algorithm and enforce dual-resource locking (charger + parking slot simultaneously) for EV assignments based on live vehicle conditions.
</domain>

<decisions>
## Implementation Decisions

### Scoring Weights
- **D-01:** Priority score formula: `(100 - batteryLevel) * 0.6 + (1 / (etaMinutes + 1)) * 40`.
- This heavily prioritizes urgent needs (low battery) while also preferring closer vehicles to reduce idle slot time.

### Locking Behavior (Dual Resource Locking)
- **D-02:** Strict co-allocation of both a charger and a parking slot. 
- State transitions: `FREE → RESERVED → OCCUPIED → FREE`.
- `RESERVED` means locked for an incoming vehicle. `OCCUPIED` means arrived and actively charging.

### Execution Trigger
- **D-03:** The allocation engine runs every 5 seconds, integrated directly into the existing simulation loop.

### Distant Reservations
- **D-04:** Reservations are only allowed when a vehicle is sufficiently close: `ETA ≤ 5 minutes`. Else, the vehicle remains in the queue.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Rules
- `.planning/PROJECT.md` — Project definition and constraints
- `.planning/REQUIREMENTS.md` — Requirement list
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/simulator.js` (The 5s tick loop is already running here, allocator will plug directly into this tick).

### Established Patterns
- Continuous mutation of vehicles inside `setInterval`. We will add the slot state mutations logic here.
</code_context>

<specifics>
## Specific Ideas

- Ensure we update both station `availableParking` and `availableChargers` exactly symmetrically when transitioning from `FREE` to `RESERVED`.
</specifics>

<deferred>
## Deferred Ideas

None
</deferred>
