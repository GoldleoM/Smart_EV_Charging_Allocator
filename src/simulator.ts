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
<<<<<<< HEAD
=======
      if (state.system?.isPaused) return;
>>>>>>> origin/Jayant

      const vehicles = state.vehicles as VehiclesMap;
      const stations = state.stations as StationsMap;
      
      let baseUpdates: Record<string, any> = {};

      // 2. Compute physics deltas
      for (const [vehicleId, vehicle] of Object.entries(vehicles)) {
        // --- 1. Driving Physics ---
        if (vehicle.status === "driving" || vehicle.status === "RESERVED") {
          const nextBattery = parseFloat((vehicle.batteryLevel - 0.1).toFixed(2));
          
          if (nextBattery <= 0) {
            vehicle.batteryLevel = 0;
            vehicle.status = "stranded";
          } else {
            vehicle.batteryLevel = nextBattery;
            vehicle.etaMinutes = Math.max(0, parseFloat((vehicle.etaMinutes - 0.2).toFixed(2)));
            
<<<<<<< HEAD
            if (vehicle.etaMinutes === 0) {
              vehicle.status = "waiting"; 
=======
            // Move location towards target station accurately based on ETA remaining
            const targetStation = stations[vehicle.targetStationId];
            if (targetStation && targetStation.location && vehicle.location) {
              const dLat = targetStation.location.lat - vehicle.location.lat;
              const dLng = targetStation.location.lng - vehicle.location.lng;
              
              if (vehicle.etaMinutes > 0) {
                 // The fraction of the trip left to cover in this single tick (0.2 eta reduction per tick)
                 // Math.min guards against dividing by zero or overshooting
                 const fraction = Math.min(1, 0.2 / vehicle.etaMinutes);
                 
                 vehicle.location.lat += dLat * fraction;
                 vehicle.location.lng += dLng * fraction;
                 baseUpdates[`/vehicles/${vehicleId}/location`] = vehicle.location;
              }
            }

            if (vehicle.etaMinutes === 0) {
              vehicle.status = "waiting"; 
              if (targetStation && targetStation.location) {
                 vehicle.location = { ...targetStation.location };
                 baseUpdates[`/vehicles/${vehicleId}/location`] = vehicle.location;
              }
>>>>>>> origin/Jayant
            }
          }
        }
        // --- 2. Arrival Logic ---
        else if (vehicle.status === "waiting") {
          // Immediately dock if they arrived (they hold a reservation)
          vehicle.status = "OCCUPIED";
        }
        // --- 3. Charging Physics & Departure ---
        else if (vehicle.status === "OCCUPIED") {
          vehicle.batteryLevel = Math.min(100, parseFloat((vehicle.batteryLevel + 2.0).toFixed(2)));
          
          if (vehicle.batteryLevel === 100) {
            // Free up station resources
            const station = stations[vehicle.targetStationId];
            if (station) {
              station.availableParking = Math.min(station.totalParking, station.availableParking + 1);
              station.availableChargers = Math.min(station.totalChargers, station.availableChargers + 1);
              
              baseUpdates[`/stations/${vehicle.targetStationId}/availableParking`] = station.availableParking;
              baseUpdates[`/stations/${vehicle.targetStationId}/availableChargers`] = station.availableChargers;
            }

            // Reset to driving with new destination
            const stationIds = Object.keys(stations);
            vehicle.status = "driving";
            vehicle.batteryLevel = 100;
<<<<<<< HEAD
            vehicle.etaMinutes = Math.floor(Math.random() * 26) + 5; // 5-30
            vehicle.targetStationId = stationIds[Math.floor(Math.random() * stationIds.length)];
=======
            const newTargetId = stationIds[Math.floor(Math.random() * stationIds.length)];
            vehicle.targetStationId = newTargetId;
            
            // Calculate accurate realistic math for ETA from the current station to the new one!
            const newTarget = stations[newTargetId];
            if (newTarget && newTarget.location && vehicle.location) {
              const distDeg = Math.sqrt(
                Math.pow(newTarget.location.lat - vehicle.location.lat, 2) + 
                Math.pow(newTarget.location.lng - vehicle.location.lng, 2)
              );
              // 1 degree = 111km. Speed = 30km/h = 0.5km/min. Therefore mins = distDeg * 111 * 2
              let accurateEta = Math.round(distDeg * 222);
              if (accurateEta < 2) accurateEta = 2;
              vehicle.etaMinutes = accurateEta;
            } else {
               vehicle.etaMinutes = 15; // Safe fallback
            }
>>>>>>> origin/Jayant
            
            console.log(`✨ Vehicle ${vehicleId} fully charged and departed for ${vehicle.targetStationId}`);
          }
        }

        // Shared updates for all status types
        baseUpdates[`/vehicles/${vehicleId}/batteryLevel`] = vehicle.batteryLevel;
        baseUpdates[`/vehicles/${vehicleId}/etaMinutes`]   = vehicle.etaMinutes;
        baseUpdates[`/vehicles/${vehicleId}/status`]       = vehicle.status;
        baseUpdates[`/vehicles/${vehicleId}/targetStationId`] = vehicle.targetStationId;
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
