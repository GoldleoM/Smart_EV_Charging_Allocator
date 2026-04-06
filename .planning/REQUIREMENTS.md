# Requirements

## v1 Requirements

### Architecture/Simulation
- [ ] **SIM-01**: Implement V2N simulation engine updating every 2-5s with battery decay, location, and speed.
- [ ] **SIM-02**: Establish vehicle state manager and station data models handling parking/chargers.
- [ ] **SIM-03**: Create mock scenario generator supporting 5-10 vehicles and 3 stations.

### Core Allocation
- [ ] **ALLOC-01**: Implement priority scoring algorithm based on battery urgency, distance, and wait time.
- [ ] **ALLOC-02**: Enforce strict co-allocation (charger + parking slot required to assign).
- [ ] **ALLOC-03**: Handle edge case rejections and real-time rerouting if availability changes.
- [ ] **ALLOC-04**: Apply transaction locks to prevent double-booking.

### Real-Time Infrastructure
- [ ] **RT-01**: Establish WebSocket/Firebase connections for low-latency live updates.
- [ ] **RT-02**: Dynamically push queue changes, reroutes, and ETAs to connected clients.

### User Interface
- [ ] **UI-01**: Build interactive map dashboard with Google Maps API and nearby stations.
- [ ] **UI-02**: Implement Vehicle Panel showing battery %, ETA, and queue position.
- [ ] **UI-03**: Implement Station View showing charger status, parking slots, and wait time.
- [ ] **UI-04**: Add simulation controls (add/remove vehicles, change battery %, simulate delay).

## v2 Requirements (Deferred)
- [ ] **V2-01**: Machine learning for predictive traffic patterns.
- [ ] **V2-02**: Physical hardware interface with real chargers.

## Out of Scope
- Payment processing — Not core to the allocation algorithm demonstration.
- Complex user authentication — Unnecessary friction for a hackathon demo.
- Simple sequential queueing — We strictly use weighted prioritization to manage urgency.

## Traceability
*(To be populated by Roadmap)*
