---
phase: 5
name: Consumer Side App Prototype
depends_on: 4
files_modified:
  - consumer-app/package.json
  - consumer-app/vite.config.ts
  - consumer-app/src/main.tsx
  - consumer-app/src/App.tsx
  - consumer-app/src/index.css
  - consumer-app/src/firebaseConfig.ts
  - consumer-app/src/components/MobileView.tsx
  - consumer-app/src/components/screens/RequestChargeScreen.tsx
  - consumer-app/src/components/screens/EnRouteScreen.tsx
  - consumer-app/src/components/screens/ChargingScreen.tsx
  - .planning/STATE.md
autonomous: true
---

# Phase 5: Consumer Side App Prototype

**Goal:** Create a lightweight mobile-first UI for a consumer (driver) to engage with the EV allocation platform.

## Tasks

<task>
<read_first>
- .planning/phases/05-consumer-side-app-prototype/05-RESEARCH.md
</read_first>
<action>
Initialize a new Vite React app in the `consumer-app` directory using `npm create vite@latest consumer-app -- --template react-ts`.
Install TailwindCSS, Framer Motion, Lucide React, and Firebase.
Modify the `vite.config.ts` to strictly run on `port: 5174` so it doesn't conflict with the admin dashboard.
</action>
<acceptance_criteria>
`cd consumer-app && npm run build` successfully creates a dist directory.
`consumer-app/vite.config.ts` contains `port: 5174`.
</acceptance_criteria>
</task>

<task>
<read_first>
- frontend/src/firebaseConfig.ts
- consumer-app/src/firebaseConfig.ts
</read_first>
<action>
Copy the `/frontend/.env` file to `/consumer-app/.env` and mirror the exact Firebase configuration into `consumer-app/src/firebaseConfig.ts`.
This ensures the mobile app shares exactly the same real-time database state as the simulation engine.
</action>
<acceptance_criteria>
`consumer-app/src/firebaseConfig.ts` contains valid Firebase initialization matching the admin dashboard.
</acceptance_criteria>
</task>

<task>
<read_first>
- consumer-app/src/App.tsx
- consumer-app/src/index.css
</read_first>
<action>
Set up a strict mobile layout wrapper in `App.tsx`: `<div className="max-w-[400px] mx-auto h-[100dvh] bg-dark-900 overflow-hidden relative shadow-2xl">`.
Configure basic Tailwind global properties in `index.css` (fonts, dark mode roots).
Build three primary simulated states managed by a local React state machine: 
1. `Idle` (RequestChargeScreen)
2. `Driving to Station` (EnRouteScreen)
3. `Charging` (ChargingScreen)
</action>
<acceptance_criteria>
`consumer-app/src/App.tsx` contains the hardcoded standard max-w-[400px] mobile wrapper and layout structure.
</acceptance_criteria>
</task>

<task>
<read_first>
- src/simulator.ts
- consumer-app/src/components/screens/RequestChargeScreen.tsx
- consumer-app/src/components/screens/EnRouteScreen.tsx
</read_first>
<action>
Hook the views directly into Firebase RTDB referencing a specific hardcoded user vehicle ID (e.g., `manual_user_999`).
In `RequestChargeScreen`, adding a massive "Navigate to Nearest Charger" button. When clicked, it generates `manual_user_999` with `batteryLevel = 15`, `etaMinutes = 10`, `status = "driving"`, and pushes it to `/vehicles/manual_user_999` in Firebase.
The UI immediately transitions to `EnRouteScreen` while listening to `manual_user_999` in Firebase to display real-time ETA, target station name, and its queue rank dropping exactly in sync with the orchestrator!
Modify the admin dashboard `frontend/src/components/Map/VehicleMarker.tsx` to highlight any vehicle with ID `"manual_user_999"`, painting it golden and labeling it "YOU" so you can visually track your consumer app's path through the live matrix.
</action>
<acceptance_criteria>
`RequestChargeScreen` contains a Firebase write to `set(ref(db, 'vehicles/manual_user_999'), {...})`.
`EnRouteScreen` listens to Firebase and pulls its updated `targetStationId` from the backend allocator.
</acceptance_criteria>
</task>

## Verification
- Verify the consumer app can be started concurrently with `npm run dev` in `consumer-app` directory.
- Verify when "Navigate to Charger" is clicked, `manual_user_999` visibly spawns on the main Admin React Dashboard map.
- Verify the mobile UI updates live as the vehicle state changes (eta drops, battery drops) and correctly displays its assigned station.
