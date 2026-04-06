# Phase 1: Backend Foundation & Data Models - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the core data structures for vehicles and stations with mock data.
</domain>

<decisions>
## Implementation Decisions

### Framework choice
- **D-01:** Use Node.js (Agent discretion applied. Node.js pairs exceptionally well with Firebase SDKs for real-time hackathon apps).

### Data storage
- **D-02:** Use Firebase (Realtime Database or Firestore) for high-performance transient state instead of MongoDB + WebSockets.

### Mock data structure
- **D-03:** Use realistic dynamic generators to simulate the 5-10 vehicles and 3 stations automatically rather than static JSON, ensuring the demo feels alive.

### the agent's Discretion
- Code architecture and mock generator implementation details.
- Exact schema for the Firebase documents/nodes.

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
- None (Greenfield phase 1)

### Established Patterns
- None (Greenfield phase 1)

### Integration Points
- None (Greenfield phase 1)

</code_context>

<specifics>
## Specific Ideas

- The user specifically requested "maybe use firebase", pivoting away from the initial MongoDB/WebSocket stack to simplify real-time data flow.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-Backend Foundation & Data Models*
*Context gathered: 2026-04-06*
