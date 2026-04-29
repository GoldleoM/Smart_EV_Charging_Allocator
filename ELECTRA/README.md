# Smart EV Charging + Parking Orchestrator - Consumer App

This is the consumer-facing frontend application for the Smart EV Charging + Parking Orchestrator, built with React, TypeScript, Vite, and Tailwind CSS.

## 🚀 Features Implemented So Far

### 1. Modern Dashboard & UI
- **Dark Theme Aesthetics:** A premium, dark-themed interface with neon accents inspired by modern vehicle HUDs.
- **Dual-Pane Station Management:** 
  - **Left Panel:** Station selection and navigation controls.
  - **Right Panel:** Real-time metrics including battery status, estimated arrival time, and queue length for the selected station.

### 2. Map & Route Visualization
- **Live Tracking:** Real-time tracking of the user's location with a persistent "YOU" marker on the map.
- **Route Rendering:** Visualizes the route to the selected charging station using the Google Maps API.
- **Session Management:** Seamlessly cleans up route lines while maintaining the user location marker upon session termination.

### 3. Real-Time Synchronization
- **Firebase Integration:** Real-time data synchronization with the backend via Firebase to keep station queues, battery status, and user location up to date instantly.

### 🤖 AI-Powered Station Recommendation (AI Mode)
The application features an intelligent **AI Mode** designed to optimize the EV charging experience. Instead of manually picking a station, the AI automatically evaluates and recommends the *best* station for the user based on multiple real-time constraints:
- **Distance:** Minimizing travel time to the station.
- **Queue Length:** Avoiding stations with high wait times.
- **Charging Needs:** Factoring in the user's current battery level and the station's charging speed.

By comprehensively analyzing these metrics simultaneously, the AI ensures users are directed to the most efficient charging slot available.

## 🛠️ Tech Stack
- **Frontend Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide React (Icons)
- **Maps & Routing:** Google Maps API (`@react-google-maps/api`)
- **Real-Time Data:** Firebase Realtime Database

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- Firebase Project configured
- Google Maps API Key

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root of the `consumer-app` directory and add your keys (e.g., Firebase config, Google Maps API key):
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
# ... other firebase config
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173/`.
