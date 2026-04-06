---
phase: 1
wave: 1
depends_on: []
files_modified:
  - "package.json"
  - "src/db/firebaseConfig.js"
  - "src/models/Station.js"
  - "src/models/Vehicle.js"
  - "src/simulator.js"
autonomous: true
---

# Phase 1 — Plan 1: Foundation and Simulation

## Goal
Establish Firebase project connection and Node.js mock data generator.

## Tasks

```xml
<task id="1-01-01">
  <read_first>
    <file>.planning/phases/01-backend-foundation-data-models/01-RESEARCH.md</file>
  </read_first>
  <action>
    Initialize a barebones Node.js project. Run `npm init -y`. Install `firebase-admin` and `dotenv`. Create `src/db/firebaseConfig.js` to initialize the Firebase Admin SDK. It should parse `process.env.FIREBASE_SERVICE_ACCOUNT` (which will be a JSON string) and use it for credentials to connect to a Realtime DB at `process.env.FIREBASE_DB_URL`. Export the `admin.database()` reference.
  </action>
  <acceptance_criteria>
    `package.json` contains dependencies `firebase-admin` and `dotenv`. `src/db/firebaseConfig.js` exports a db instance.
  </acceptance_criteria>
</task>

<task id="1-01-02">
  <read_first>
    <file>.planning/phases/01-backend-foundation-data-models/01-RESEARCH.md</file>
  </read_first>
  <action>
    Create `src/models/Station.js` to handle station seeding. Write `async function seedStations(db)` that writes the mock JSON payload for 3 stations (e.g. Downtown Hub) precisely as outlined in 01-RESEARCH.md to the `/stations` node. Ensure `update()` is utilized rather than completely overwriting to emulate a non-destructive patch.
  </action>
  <acceptance_criteria>
    `src/models/Station.js` exports `seedStations` which references `/stations` in Firebase.
  </acceptance_criteria>
</task>

<task id="1-01-03">
  <read_first>
    <file>.planning/phases/01-backend-foundation-data-models/01-RESEARCH.md</file>
  </read_first>
  <action>
    Create `src/models/Vehicle.js`. Implement `async function generateVehicles(db, count)` to randomly generate `count` vehicles with properties `batteryLevel` (20-80), `status` ('driving'), `location`, `targetStationId`, `etaMinutes` (5-30), and `queuePriorityScore` (0). Save them to the `/vehicles` node as `/vehicles/vehicle_{idx}`.
  </action>
  <acceptance_criteria>
    `src/models/Vehicle.js` exports `generateVehicles`.
  </acceptance_criteria>
</task>

<task id="1-01-04">
  <read_first>
    <file>src/models/Vehicle.js</file>
    <file>src/models/Station.js</file>
  </read_first>
  <action>
    Create `src/simulator.js`. Require `dotenv`, `firebaseConfig.js`, `Station.js`, and `Vehicle.js`. Run `seedStations` and `generateVehicles(7)`. Start a loop using `setInterval(() => {}, 5000)` that simulates movement: fetch all `/vehicles`, iteratively subtract `0.5` to `batteryLevel` and `0.2` to `etaMinutes` per vehicle, and use a multi-path database `update()` (e.g. `db.ref('/').update(updates)`) to push changes atomically. Update `package.json` `"start": "node src/simulator.js"`.
  </action>
  <acceptance_criteria>
    `simulator.js` contains a `setInterval` of 5000ms. Battery decrement logic exists. `package.json` has `start` script.
  </acceptance_criteria>
</task>
```

## Verification

- Run `npm start`. Wait for logs to output "Tick executed..."
- Ensure `firebase-admin` authenticates properly (requires user to supply the local .env variables).

## Must Haves

- Firebase Realtime Database usage for tracking states (Node 1-01-01).
- 5000ms tick frequency and realistic vehicle JSON structs.
