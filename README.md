# ⚡ Smart EV Charging & Parking Orchestrator

A scalable, real-time intelligent platform designed to dynamically co-allocate EV charging stations AND parking slots simultaneously. It acts as a live "Smart City" control center, featuring intelligent spatial routing, simulated Vehicle-to-Network (V2N) communication, and an interactive geographic AI.

![Hackathon Ready](https://img.shields.io/badge/Status-Hackathon_Ready-success) ![Tech Stack](https://img.shields.io/badge/Stack-ReactV19%20%7C%20Node%20%7C%20Firebase-blue) ![MapLibre](https://img.shields.io/badge/Mapping-MapLibre_GL-orange)

## 🌟 The Innovation

Current EV charging networks operate as queues. You arrive, you wait. 
**Our Orchestrator changes this by operating as a Spatial Intelligence Layer.**

1. **Dynamic Nearest-Station Routing**: The AI Allocator constantly calculates geographic math in real-time. If a vehicle is heading to a busy station, but a closer station frees up capacity, the AI instantly intercepts the vehicle's navigation system and redirects it, dynamically recalculating its ETA.
2. **Co-Allocation (Parking + Charging)**: The system locks both a physical parking spot and an electrical charger simultaneously to prevent real-world gridlock.
3. **Priority Over First-Come-First-Serve**: Vehicles broadcast their current battery payload (`V2N`). If a vehicle drops to `<= 10%` battery, the allocator categorizes it as critical. It is granted the capability to literally **bump** a fully charged/safer vehicle out of a reserved slot to save the dying vehicle!
4. **No API Keys Required**: The interactive smart map runs on **MapLibre GL JS** paired with Carto's Dark Matter OpenStreetMap vector tiles, meaning this platform can be deployed globally without expensive Google Maps billing.

## 🎯 Core Value & Algorithm

The system enforces **simultaneous co-allocation** of both a physical parking slot and an electrical charger. It moves away from simple sequential queueing (first-come, first-serve) to a **weighted priority scoring system**. 

The **Allocation Engine** calculates priority based on:
- **Battery Level (V2N Simulation)**: Vehicles broadcasting critical battery (<= 10%) get immediate priority.
- **Geographic Distance / ETA**: Proximity to available charging stations.
- **Wait Time**: Preventing extended delays for any single user.

## 🗺️ Project Roadmap & Phases

The project development follows a structured 5-phase execution plan:

- **Phase 1: Backend Foundation & Data Models** (✅ Complete) - Core data structures for vehicles and stations with mock data.
- **Phase 2: Core Co-allocation Engine** (✅ Complete) - Intelligent allocation algorithm scoring logic and dual-resource locking.
- **Phase 3: V2N Simulation & Real-Time Sync** (✅ Complete) - Live vehicle movement, battery decay, and WebSocket/Firebase integration.
- **Phase 4: Interactive Dashboard & UI** (✅ Complete) - Frontend visualizations, MapLibre GL integration, and simulation controls.
- **Phase 5: Consumer Side App Prototype** (🚧 In Progress) - Building the mobile/end-user interface for EV drivers.

## 🛠 Tech Stack

* **Frontend Dashboard**: React 19, TypeScript, Vite, Tailwind CSS V4, Framer Motion, MapLibre GL
* **Backend Physics Engine**: Node.js, TypeScript, Express
* **Database & State**: MongoDB (Data persistence), Firebase Realtime Database (Live sync)
* **Aesthetics**: Glassmorphism, Carto Dark Matter mapping, Lucide Icons

## 🛡️ Architecture & Constraints

- **Hardware Decoupling**: Uses a highly accurate simulation for V2N data, making it perfectly scoped for hackathon demonstrations without hardware bottlenecks.
- **Cost-Effective Mapping**: Utilizes MapLibre GL JS with OpenStreetMap tiles instead of paid services like Google Maps.

## 🚀 How to Run Locally

Because the system is decoupled via Firebase, the backend simulation and the frontend visualization run independently.

### 1. Setup Firebase Configuration
You need a free Firebase Realtime Database.
1. Create a `frontend/.env` file with your web config:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_DATABASE_URL=your_db_url
   ...
   ```
2. Create a root `.env` file for the backend simulation with your admin credentials:
   ```env
   FIREBASE_PROJECT_ID=your_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   FIREBASE_CLIENT_EMAIL=your_email
   ```

### 2. Run the AI Simulator (Backend)
Navigate to the root directory and start the physics simulation:
```bash
npm install
npm start
```
The console will start ticking (`Tick → 7 driving | 0 RESERVED`).

### 3. Run the Control Center (Frontend)
Open a second terminal, navigate to `/frontend`:
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173`.

## 🎮 Interactive Demo Controls
Once the dashboard is running, use the floating **Demo Bar** to test the grid:
* **Add Station**: Drops a brand new smart-station onto the map with dynamic capacity. Watch as the AI instantly incorporates it and re-routes vehicles toward it if it's closer!
* **Rush Hour**: Injects a massive wave of vehicles into the map. Watch the Allocator aggressively balance the load.
* **Toggle AI Allocator**: Pause the algorithm to freeze all reservations and inspect the grid.
* **Vehicle Hover Tooltips**: Hover over moving cars to observe their live battery telemetry, exact geographic ETA, and current target destination.
