# Roadmap

## Phase 1: Backend Foundation & Data Models
**Goal**: Establish the core data structures for vehicles and stations with mock data.
**Requirements**: SIM-02, SIM-03
**Success Criteria**:
- Station definitions load successfully with both chargers and parking slots.
- Vehicle simulation data populates successfully.
- State manager components track inventory without crashing.

## Phase 2: Core Co-allocation Engine
**Goal**: Build the intelligent allocation algorithm scoring logic and enforce dual-resource locking.
**Requirements**: ALLOC-01, ALLOC-02, ALLOC-04
**Status**: Complete ✅
**Success Criteria**:
- Algorithm computes scores accurately based on battery, ETA, and wait time.
- System correctly locks *both* a parking slot and charger during allocation.
- Tests confirm overbooking is impossible during simultaneous requests.

## Phase 3: V2N Simulation & Real-Time Sync
**Goal**: Implement live vehicle movement, battery decay, and WebSocket integration for real-time queue orchestration.
**Requirements**: SIM-01, RT-01, RT-02, ALLOC-03
**Success Criteria**:
- Vehicles decrease battery and update location every 2-5 seconds.
- Clients receive continuous queue updates and ETA recalculations over WebSockets.
- Vehicle re-routes happen automatically if higher priority bumps them or parameters drop.

## Phase 4: Interactive Dashboard & UI
**Goal**: Build the frontend visualizations and simulation controls for the hackathon demo.
**Requirements**: UI-01, UI-02, UI-03, UI-04
**Success Criteria**:
**UI hint**: yes
- Google Map correctly renders stations and allocated locations.
- Station View accurately reflects live charger and parking states.
- Vehicle panel updates dynamically without requiring page refreshes.
- Simulation controls correctly trigger backend changes (e.g. forced battery drop).
