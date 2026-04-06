require('dotenv').config();
const { db } = require('./db/firebaseConfig');
const { seedStations } = require('./models/Station');
const { generateVehicles } = require('./models/Vehicle');

async function runSimulator() {
  if (!db) {
    console.error("FATAL: Database instance not found. Ensure FIREBASE_SERVICE_ACCOUNT is set in .env.");
    return;
  }

  console.log("Initializing Smart EV Orchestrator Mock Environment...");

  // 1. Initial State Seeding
  await seedStations(db);
  await generateVehicles(db, 7);

  console.log("Starting vehicle simulation loop (tick = 5000ms)...");

  // 2. Continuous Simulation Loop
  setInterval(async () => {
    try {
      const vehiclesSnapshot = await db.ref('/vehicles').once('value');
      const vehicles = vehiclesSnapshot.val();
      
      if (!vehicles) return;

      const updates = {};
      
      // Compute deltas for each vehicle
      for (const [vehicleId, vehicle] of Object.entries(vehicles)) {
        if (vehicle.status === "driving") {
          // Decrement battery and ETA
          const newBattery = Math.max(0, vehicle.batteryLevel - 0.5);
          const newEta = Math.max(0, vehicle.etaMinutes - 0.2);

          // If ETA hits 0, vehicle has "arrived" -> switch status to waiting or parked
          const newStatus = newEta === 0 ? "waiting" : "driving";

          updates[`/vehicles/${vehicleId}/batteryLevel`] = newBattery;
          updates[`/vehicles/${vehicleId}/etaMinutes`] = newEta;
          updates[`/vehicles/${vehicleId}/status`] = newStatus;
        }
      }

      // Atomic multi-path update
      if (Object.keys(updates).length > 0) {
        await db.ref('/').update(updates);
        console.log(`Tick executed: Updated ${Object.keys(vehicles).length} vehicles.`);
      }

    } catch (error) {
      console.error("Error during simulator tick:", error.message);
    }
  }, 5000);
}

// Execute
runSimulator();
