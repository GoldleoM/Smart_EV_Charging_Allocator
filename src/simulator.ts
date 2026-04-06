import * as dotenv from 'dotenv';
dotenv.config();

import { db } from './db/firebaseConfig';
import { seedStations, StationsMap } from './models/Station';
import { generateVehicles, VehiclesMap } from './models/Vehicle';
import { allocateSlots } from './engine/allocator';
import { ref, get, update } from 'firebase/database';

async function runSimulator(): Promise<void> {
  if (!db) {
    console.error("FATAL: Database instance not found. Ensure .env is loaded.");
    return;
  }

  console.log("🚗 Initializing Smart EV Orchestrator...");

  await seedStations(db);
  await generateVehicles(db, 7);

  console.log("\n⚡ Starting vehicle simulation loop (tick = 5s)...\n");

  setInterval(async () => {
    try {
      // 1. Fetch entire state
      const snapshot = await get(ref(db, '/'));
      const state = snapshot.val();
      
      if (!state || !state.vehicles || !state.stations) return;

      const vehicles = state.vehicles as VehiclesMap;
      const stations = state.stations as StationsMap;
      
      let baseUpdates: Record<string, any> = {};

      // 2. Compute physics deltas
      for (const [vehicleId, vehicle] of Object.entries(vehicles)) {
        if (vehicle.status === "driving") {
          // Mutate memory object for the allocator context
          vehicle.batteryLevel = Math.max(0, parseFloat((vehicle.batteryLevel - 0.5).toFixed(2)));
          vehicle.etaMinutes = Math.max(0, parseFloat((vehicle.etaMinutes - 0.2).toFixed(2)));
          
          if (vehicle.etaMinutes === 0) {
            vehicle.status = "waiting"; 
          }

          // Add to base updates
          baseUpdates[`/vehicles/${vehicleId}/batteryLevel`] = vehicle.batteryLevel;
          baseUpdates[`/vehicles/${vehicleId}/etaMinutes`]   = vehicle.etaMinutes;
          baseUpdates[`/vehicles/${vehicleId}/status`]       = vehicle.status;
        }
      }

      // 3. Run allocator with advanced physics state
      const allocatorUpdates = allocateSlots(vehicles, stations);

      // 4. Merge and atomic commit
      const finalUpdates = { ...baseUpdates, ...allocatorUpdates };

      if (Object.keys(finalUpdates).length > 0) {
        await update(ref(db), finalUpdates);
        
        const drivingCount = Object.values(vehicles).filter((v) => v.status === "driving").length;
        const reservedCount = Object.values(vehicles).filter((v) => v.status === "RESERVED").length;
        
        console.log(`Tick → ${drivingCount} driving | ${reservedCount} RESERVED`);
      }

    } catch (error: any) {
      console.error("Tick error:", error.message);
    }
  }, 5000);
}

runSimulator();
