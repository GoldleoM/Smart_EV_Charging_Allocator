# Phase 3: V2N Simulation & Real-Time Sync - Context

**Gathered:** 2026-04-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Handle queue re-routing/bumps and real-time syncing to connected clients for the continuous 5s allocation ticks.
</domain>

<decisions>
## Implementation Decisions

### Re-route / Queue Bumping
- **D-01:** If a new vehicle has critically low battery (`≤ 10%`) AND all slots are fully `RESERVED` (but not `OCCUPIED`), the system must revoke the reservation from the *lowest-priority* reserved vehicle, and grant it to the critical vehicle.
- **Constraints:** `OCCUPIED` slots are entirely immune. Displaced vehicles are dumped back to the queue (status: `driving` or `waiting`) and re-evaluated by the core engine. 

### WebSocket Infrastructure
- **D-02:** No custom websocket server. We rely entirely on Firebase Realtime Database's native real-time sync (`onValue`) for data transport to the frontend.

### Movement Interpolation
- **D-03:** Simulation handles only `etaMinutes` decay, without generating synthetic `lat/lng` traces. ETA decay is computationally cheap and completely sufficient for conveying spatial arrival.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Rules
- `.planning/PROJECT.md` — Project definition and constraints
- `.planning/REQUIREMENTS.md` — Requirement list
- `.planning/phases/02-core-co-allocation-engine/02-CONTEXT.md` — Contains the parent algorithm logic we are appending to.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/engine/allocator.ts` — Engine structure is functional. Bumping behavior directly appends to `allocateSlots()`.

### Established Patterns
- We construct a massive object mapping of paths to new values. Re-routed vehicles will simply be added as another mutation parameter in the `updates` JSON payload.
</code_context>

<specifics>
## Specific Ideas
- To successfully decouple bumping logic, the allocator will need two lists internally: Active `driving` unassigned vehicles, and existing `RESERVED` assigned vehicles.
- Stations have `totalParking` indicating maximum capacity. 
</specifics>

<deferred>
## Deferred Ideas
None
</deferred>
