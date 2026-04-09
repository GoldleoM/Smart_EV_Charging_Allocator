# Phase 4: Interactive Dashboard & UI - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the frontend visualizations, Google Maps integration, and live simulation controls for the hackathon demo.
</domain>

<decisions>
## Implementation Decisions

### Layout Strategy
- **D-01:** Full-bleed map layout. The map occupies the entire screen and acts as the primary canvas. Information is layered on top using floating panels with a high-fidelity glassmorphism style (translucent backgrounds, soft blur, rounded corners, subtle borders). Dark-mode theme.

### Station Visualization
- **D-02:** Custom HTML overlays instead of default map pins. Each station overlay must instantly show: available charging slots, current queue length, load intensity encoded by color (green/yellow/red), and optional pulsing glow for high demand.

### Moving Elements
- **D-03:** Vehicles are *not* rendered as moving markers. They are represented logically via ETA-based countdowns inside a dedicated UI panel.

### Component Structure
- **D-04:** Use specific floating modules:
  - Top-left: System status overview
  - Top-right: Station summary panel
  - Bottom-left: Vehicle queue and ETA list
  - Bottom-right: Selected station details (on interaction)
  - Bottom-center: Demo / Developer Control Bar

### Simulation Controls
- **D-05:** Place simulation controls (Add vehicle, simulate rush hour, clear queue, AI mode) in a floating, visually distinct bottom-center bar labeled clearly e.g. "Demo Mode Active" to separate from the real system UI.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Rules
- `.planning/PROJECT.md` — Project definition and constraints
- `.planning/REQUIREMENTS.md` — Requirement list
- `.planning/phases/03-v2n-simulation-real-time-sync/03-CONTEXT.md` — Details on real-time data flow with Firebase.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None specifically for UI yet. React/Next.js to be set up per constraints.

### Established Patterns
- We sync via Firebase `onValue` mapped to React state.
</code_context>

<specifics>
## Specific Ideas

- The dashboard must avoid traditional sidebar or multi-page navigation to maintain a "live command center" feel.
- Animations and transitions for real-time updates should be smooth to ensure instant readability and high visual hierarchy.
</specifics>

<deferred>
## Deferred Ideas

- None.
</deferred>
