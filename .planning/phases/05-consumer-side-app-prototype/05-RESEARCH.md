# Phase 5: Consumer Side App Prototype - Research

**Goal:** Create a lightweight mobile-first UI for a consumer (driver) to engage with the EV allocation platform, demonstrating the dual-reservation UX.

## 1. Context & Objectives
The system currently provides an "Omniscient System Dashboard" for administrators. To fulfill a complete hackathon flow, we need a Consumer Side Prototype to demonstrate the driver's perspective: requesting a charge, navigating to the allocated station (which books both parking + charger), and tracking ETA/wait times.

## 2. Standard Stack
We will leverage the existing proven tech stack from the admin frontend to maintain maximum velocity and consistency:
- **Framework**: Vite + React (TypeScript)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion (for fluid mobile transitions)
- **Icons**: Lucide React
- **Data Layer**: Firebase Realtime Database
- **Mapping**: Google Maps API via `@vis.gl/react-google-maps`

## 3. Architecture Patterns
- **Monorepo Structure**: Create a new `consumer-app/` folder at the root directory alongside `frontend/` and `src/`.
- **Shared Data Source**: The new consumer app MUST connect to the exact same Firebase Real-time Database used by the backend `simulator.ts`.
- **Mobile-First Layout**: Use a strict mobile container constraints (`max-w-md mx-auto h-screen relative bg-dark-900`) so it perfectly mimics a mobile app when viewed on desktop browsers.
- **V2N Trigger**: The app should act as a "Manual Vehicle Override". When the user clicks "Navigate to Charge", the app updates a specific user-tied vehicle (e.g. `user_vehicle_1`) in Firebase, and the backend allocator (`allocator.ts`) will automatically scoop it up and assign a `targetStationId` with a `queuePriorityScore`.

## 4. Don't Hand-Roll
- **Do not build a backend API layer for the mobile app**: Directly embed Firebase RTDB listeners. This guarantees instantaneous 0-latency sync with the orchestrator simulation algorithm.
- **Do not invent custom physics**: If the user tells the app they are driving, let the `simulator.ts` backend handle the ETA calculation, battery dropping, and parking slot consumptions. Treat the Consumer App as a pure "View/Controller" for exactly 1 vehicle in the database.

## 5. Common Pitfalls
- **Port Collisions**: The admin dashboard (`frontend/`) typically runs on `5173`. The Vite config for `consumer-app` should explicitly be mapped to `5174` or `3000` to prevent dev server overlap.
- **Cross-App Secrets**: Ensure the `.env` copying includes the Firebase configuration so that the consumer app hooks into the correct database.

## RESEARCH COMPLETE
The standard path is clear: Spin up a parallel Vite React PWA in `consumer-app/`, style it globally for mobile viewports, connect its live stream to a single vehicle node in Firebase, and let the backend orchestrator do the heavy lifting of station assignment.
