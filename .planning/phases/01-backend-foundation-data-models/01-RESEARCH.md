# Phase 1: Backend Foundation & Data Models - Research

## Context Summary
- **Framework**: Node.js
- **Database**: Firebase (Realtime Database recommended over Firestore due to high-frequency WebSocket-like updates).
- **Goal**: Initialize the data models for Vehicles and Stations and create the mock generator.

## Technical Findings

### 1. Database Selection (Realtime DB vs Firestore)
Given the project requires high-frequency updates (every 2-5s) for vehicle telemetry (location, battery), **Firebase Realtime Database** is strongly recommended. Firestore charges per document write, which can quickly exhaust the free tier in a simulation running non-stop. Realtime DB charges by bandwidth and storage, making it perfect for volatile game-like state sync.

### 2. Data Models (Firebase Nodes)

**Stations (`/stations`)**:
A station needs to track its parking inventory and chargers.
```json
{
  "station_1": {
    "name": "Downtown Hub",
    "location": { "lat": 40.7128, "lng": -74.0060 },
    "totalParking": 10,
    "availableParking": 10,
    "totalChargers": 5,
    "availableChargers": 5
  }
}
```

**Vehicles (`/vehicles`)**:
Vehicles need shifting telemetry data and priority factors.
```json
{
  "vehicle_1": {
    "batteryLevel": 34,
    "status": "driving", // "driving", "waiting", "charging", "parked"
    "location": { "lat": 40.7130, "lng": -74.0050 },
    "targetStationId": "station_1",
    "etaMinutes": 12,
    "queuePriorityScore": 0 // Calculated dynamically
  }
}
```

### 3. Mock Data Generator
Since this is a simulated hackathon backend, the Node.js server acts as the "God Mode" simulator.
- We need an initialization script to seed 3 static stations on boot.
- We need a `simulator.js` module running a `setInterval()` loop (e.g., ticking every 5s) to iteratively decay the `batteryLevel` and inch the `etaMinutes` closer to 0 for 5-10 virtual vehicles.

## Validation Architecture
*(Required by Nyquist Validation Framework)*

**Dimension 1: Component/Unit**
- The station and vehicle node structures instantiate correctly without schema errors.
- The default state has the correct initial `batteryLevel` (randomly distributed between 20-80%).

**Dimension 2: Integration**
- Node.js successfully authenticates with the Firebase Realtime DB via `firebase-admin` service account.
- The simulator successfully patches updates into the `/vehicles` node automatically on a tick interval.

**Dimension 3: State/Data**
- No zombie vehicles remain in the database (reset capability works).
- Updates don't completely overwrite siblings in Firebase (use `update()` instead of `set()`).

**Dimension 8: Complete Verification Flow**
To verify this phase, the tester must launch the Node program and use the Firebase Console to visually confirm the vehicle nodes tick downwards in battery and ETA over time, confirming the simulator loop + database connection works.

