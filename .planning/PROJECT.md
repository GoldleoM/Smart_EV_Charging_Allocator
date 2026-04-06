# Smart EV Charging + Parking Orchestrator

## What This Is

A scalable, real-time intelligent platform designed for hackathons that allocates EV charging stations AND parking slots simultaneously. It uses smart resource allocation and simulated V2N (Vehicle-to-Network) communication to minimize wait times, prioritize users by urgency, and dynamically update recommendations.

## Core Value

Simultaneous co-allocation of charging and parking slots based on real-time vehicle simulation (V2N) and intelligent prioritization, eliminating real-world EV charging friction.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Implement V2N simulation layer (updates every 2-5s with battery decay, movement, ETA)
- [ ] Build vehicle state, station, and queue managers
- [ ] Implement core Allocation Engine (co-allocation of parking + charging based on priority score)
- [ ] Real-time updates via WebSockets/Firebase (dynamic rerouting, live queues)
- [ ] Interactive Dashboard (Map, nearby stations, simulation controls)
- [ ] Vehicle Panel UI (Battery, ETA, Queue position)
- [ ] Station View UI (Chargers status, Wait time)
- [ ] Handle edge cases (No parking/charger mismatch, conflicts, rapid battery drops)
- [ ] Demonstrate priority-based allocation with mock scenario (5-10 vehicles, 3 stations)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- [Payment processing] — Not core to the allocation algorithm demonstration
- [Production hardware integration] — Simulation suffices for hackathon scope
- [Complex user authentication] — Unnecessary friction for a hackathon demo
- [Simple sequential queueing] — We strictly use weighted prioritization to manage urgency

## Context

In real-world EV charging, finding available chargers and nearby parking is uncoordinated and frustrating. This project targets that gap via predictive co-allocation for a hackathon setting. It utilizes a stack of React/Next.js for the frontend, Node.js/FastAPI for the backend, MongoDB, and WebSockets/Firebase for real-time state. Fast execution and visual demo impact are primary goals.

## Constraints

- **Scope**: Keep system simple enough for hackathon — Avoid overengineering to focus on working demo, real-time behavior, and smart allocation logic.
- **Tech Stack**: Frontend (React/Next.js, Tailwind, Google Maps API), Backend (Node.js/Express or FastAPI), DB (MongoDB), Real-time (Socket.io/Firebase).
- **Time/Execution**: Must follow the detailed 5-phase approach.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Co-allocate ONLY if both charger and parking are available | Prevents edge case where user arrives and cannot park or charge | — Pending |
| Use simulation for V2N data | Hardware integration is too slow/complex for a hackathon | — Pending |
| Compute priority via weighted score (Battery, distance, wait time) | Ensures urgent needs are met first | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-06 after initialization*
