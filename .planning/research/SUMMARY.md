# Ecosystem Research Summary

**Domain:** EV Charging + Parking Orchestrator (V2N)
**Researched:** 2026-04-06

## TL;DR

This project solves the dual-resource constraint problem (charger + parking slot) in EV charging by simulating a V2N (Vehicle-to-Network) environment. Real-time orchestration requires low-latency updates and a weighted priority allocation algorithm, mapping well to a modern Node/Firebase stack for a hackathon.

## Key Findings

**Stack:**
- **Frontend**: Next.js / React, Tailwind CSS, Google Maps API
- **Backend / Real-time**: Node.js with Firebase Realtime DB or Socket.io. WebSockets provide the necessary 2-5s update cadence.
- **Database**: MongoDB for persistent state (stations, mock users), though transient state (queues, live location) should stay in memory or Firebase.

**Table Stakes:**
- Simulated vehicles with changing battery state and ETA.
- Station data models combining parking inventory and chargers.
- Dynamic queue system scoring vehicles by urgency.
- Real-time map-based dashboard.

**Architecture Patterns:**
- **Centralized Orchestrator**: A single Allocation Engine service handles all recomputations to prevent race conditions.
- **Tick-based Simulation Engine**: A cron or loop process that ticks every 5 seconds to update coordinates, decay batteries, and emit WebSocket events.
- **Strict Locking**: Allocation must use transaction locks. Co-allocation fails if either charger or parking slot becomes unavailable.

**Watch Out For:**
- **State Desync**: Simulating fast updates can cause frontend lag if not throttled; send deltas instead of full state if possible.
- **Race Conditions**: During allocation, ensure database or memory locks (e.g. Redis/MongoDB transactions) are used to prevent overbooking.
- **Algorithmic Edge Cases**: Rapid battery drop might cause infinite reshuffling of the queue. Implement hysteresis (a threshold of change) to prevent rapid bouncing of assignments.

---
*Synthesized from ecosystem research*
