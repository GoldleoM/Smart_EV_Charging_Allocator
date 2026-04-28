import * as dotenv from 'dotenv';
dotenv.config();

import { db } from './db/firebaseConfig.js';
import { seedStations, StationsMap } from './models/Station.js';
import { generateVehicles, VehiclesMap } from './models/Vehicle.js';
import { allocateSlots } from './engine/allocator.js';
import { ref, get, update } from 'firebase/database';
import express from 'express';

const app = express();
const PORT = Number(process.env.PORT) || 8080;

// 1. Start Server Immediately (Crucial for Cloud Run)
app.get('/', (req, res) => {
  res.send('Smart EV Orchestrator is running...');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Health check server listening on port ${PORT}`);
});

async function runSimulator(): Promise<void> {
  console.log("🚗 Initializing Smart EV Orchestrator...");

  if (!db) {
    console.error("FATAL: Database instance not found. Ensure environment variables are set.");
    return;
  }

  console.log("🚗 Initializing Smart EV Orchestrator...");

  const validatedDb = db!; // At this point we know db is not null

  await seedStations(validatedDb);
  await generateVehicles(validatedDb, 7);

  console.log("\n⚡ Starting vehicle simulation loop (tick = 5s)...\n");

  const runTick = async () => {
    try {
      // 1. Fetch entire state
      const snapshot = await get(ref(validatedDb, '/'));
      const state = snapshot.val();

      if (!state || !state.vehicles || !state.stations) return;
      if (state.system?.isPaused) return;

      const vehicles = state.vehicles as VehiclesMap;
      const stations = state.stations as StationsMap;

      let baseUpdates: Record<string, any> = {};

      // 2. Compute physics deltas
      // 2. Physics & State Machine
      const stationWaitingQueues: Record<string, typeof vehicles[0][]> = {};
      Object.keys(stations).forEach(id => stationWaitingQueues[id] = []);

      // Phase 1: General Movement & Charging
      // Process departures first to free capacity, then prioritize closest vehicles to prevent queue jumping
      const sortedVehicles = Object.entries(vehicles).sort((a, b) => {
        if (a[1].status === "OCCUPIED" && b[1].status !== "OCCUPIED") return -1;
        if (b[1].status === "OCCUPIED" && a[1].status !== "OCCUPIED") return 1;
        return a[1].etaMinutes - b[1].etaMinutes;
      });

      for (const [vehicleId, vehicle] of sortedVehicles) {
        if (vehicleId === "undefined" || !vehicle) continue;
        vehicle.id = vehicleId; // Guarantee the ID is present

        // Guard: skip vehicles with missing batteryLevel to prevent undefined writes to Firebase
        if (vehicle.batteryLevel === undefined || vehicle.batteryLevel === null) continue;

        // --- 1. Driving Physics ---
        if (vehicle.status === "driving" || vehicle.status === "RESERVED" || vehicle.status === "stranded") {
          let nextBattery = vehicle.batteryLevel;

          // Only drain battery if motor is actually running
          if (vehicle.status === "driving" || (vehicle.status === "RESERVED" && vehicle.etaMinutes > 0)) {
            nextBattery = parseFloat((vehicle.batteryLevel - 0.1).toFixed(2));
          }

          if (nextBattery <= 0) {
            vehicle.batteryLevel = 0;
            vehicle.status = "stranded";
          } else {
            vehicle.batteryLevel = nextBattery;
          }

          const targetStation = stations[vehicle.targetStationId];

          if (vehicle.status === "RESERVED" || vehicle.status === "stranded") {
            if (vehicle.status === "RESERVED") {
              // Physics engine natively ticks at 0.2 simulated minutes per 5s real-world tick.
              const speedFactor = 0.2;
              vehicle.etaMinutes = Math.max(0, parseFloat((vehicle.etaMinutes - speedFactor).toFixed(2)));

              if (targetStation && targetStation.location && vehicle.location) {
                const dLat = targetStation.location.lat - vehicle.location.lat;
                const dLng = targetStation.location.lng - vehicle.location.lng;

                if (vehicle.etaMinutes > 0) {
                  const fraction = Math.min(1, speedFactor / (vehicle.etaMinutes + speedFactor));
                  vehicle.location.lat += dLat * fraction;
                  vehicle.location.lng += dLng * fraction;
                }
              }
            }

            // Arrival Logic: Try to park!
            // Even if slightly stranded right at the gates, allow them to be pushed in.
            if (vehicle.etaMinutes <= 0.5) {
              if (targetStation && targetStation.availableParking > 0) {
                vehicle.status = "waiting";
                vehicle.etaMinutes = 0; // lock to 0 natively
                if (targetStation.location) vehicle.location = { ...targetStation.location };
                
                // Consume Parking Slot
                targetStation.availableParking -= 1;
                baseUpdates[`/stations/${vehicle.targetStationId}/availableParking`] = targetStation.availableParking;
                
                stationWaitingQueues[vehicle.targetStationId].push(vehicle);
              }
              // If parking is 0, they idle at ETA=0 outside.
            }
          } else if (vehicle.status === "driving") {
            // Just driving -> roam randomly
            if (vehicle.location) {
              vehicle.location.lat += (Math.random() - 0.5) * 0.005;
              vehicle.location.lng += (Math.random() - 0.5) * 0.005;
            }

            if (targetStation && targetStation.location && vehicle.location) {
              const distDeg = Math.sqrt(Math.pow(targetStation.location.lat - vehicle.location.lat, 2) + Math.pow(targetStation.location.lng - vehicle.location.lng, 2));
              let accurateEta = parseFloat((distDeg * 222).toFixed(1));
              if (accurateEta < 0.2) accurateEta = 0.2;
              vehicle.etaMinutes = accurateEta;
            }
          }

          baseUpdates[`/vehicles/${vehicleId}/location`] = vehicle.location;
        }
        else if (vehicle.status === "waiting") {
          stationWaitingQueues[vehicle.targetStationId]?.push(vehicle);
        }
        // --- 3. Charging Physics & Departure ---
        else if (vehicle.status === "OCCUPIED") {
          vehicle.batteryLevel = Math.min(100, parseFloat((vehicle.batteryLevel + 0.5).toFixed(2)));

          if (vehicle.batteryLevel === 100) {
            // Free up BOTH parking and charger resources
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
            const newTargetId = stationIds[Math.floor(Math.random() * stationIds.length)];
            vehicle.targetStationId = newTargetId;
            vehicle.isRerouted = false;

            const newTarget = stations[newTargetId];
            if (newTarget && newTarget.location && vehicle.location) {
              const distDeg = Math.sqrt(
                Math.pow(newTarget.location.lat - vehicle.location.lat, 2) +
                Math.pow(newTarget.location.lng - vehicle.location.lng, 2)
              );
              let accurateEta = Math.round(distDeg * 222);
              if (accurateEta < 2) accurateEta = 2;
              vehicle.etaMinutes = accurateEta;
            } else {
              vehicle.etaMinutes = 15;
            }

            console.log(`✨ Vehicle ${vehicleId} fully charged and departed for ${vehicle.targetStationId}`);
          }
        }
        // Shared updates for all status types
        baseUpdates[`/vehicles/${vehicleId}/batteryLevel`] = vehicle.batteryLevel;
        baseUpdates[`/vehicles/${vehicleId}/etaMinutes`] = vehicle.etaMinutes;
        baseUpdates[`/vehicles/${vehicleId}/status`] = vehicle.status;
        if (vehicle.targetStationId !== undefined) {
          baseUpdates[`/vehicles/${vehicleId}/targetStationId`] = vehicle.targetStationId;
        }
        if (vehicle.isRerouted !== undefined) {
          baseUpdates[`/vehicles/${vehicleId}/isRerouted`] = vehicle.isRerouted;
        }
      }

      // Phase 2: Priority-based Charger Assignment
      for (const [stationId, queue] of Object.entries(stationWaitingQueues)) {
        const station = stations[stationId];
        if (!station || station.availableChargers <= 0 || queue.length === 0) continue;

        // Highest priority score gets the charger first
        queue.sort((a, b) => b.queuePriorityScore - a.queuePriorityScore);

        let chargersToAssign = station.availableChargers;
        for (let i = 0; i < queue.length && chargersToAssign > 0; i++) {
            const v = queue[i];
            v.status = "OCCUPIED";
            chargersToAssign--;
            station.availableChargers--;
            
            baseUpdates[`/vehicles/${v.id}/status`] = "OCCUPIED";
        }
        baseUpdates[`/stations/${stationId}/availableChargers`] = station.availableChargers;
      }

      // 3. Run allocator with advanced physics state
      const allocatorUpdates = allocateSlots(vehicles, stations);

      // 4. Merge and atomic commit
      const finalUpdates = { ...baseUpdates, ...allocatorUpdates };

      if (Object.keys(finalUpdates).length > 0) {
        await update(ref(validatedDb), finalUpdates);

        const drivingCount = Object.values(vehicles).filter((v) => v.status === "driving").length;
        const reservedCount = Object.values(vehicles).filter((v) => v.status === "RESERVED").length;

        console.log(`Tick → ${drivingCount} driving | ${reservedCount} RESERVED`);
      }

      // Read tickInterval from db, fallback to 5000
      const tickInterval = state.system?.tickInterval || 5000;
      setTimeout(runTick, tickInterval);

    } catch (error: any) {
      console.error("Tick error:", error.message);
      setTimeout(runTick, 5000);
    }
  };

  runTick();
}

runSimulator().catch(err => {
  console.error("❌ Fatal error in simulator startup:", err);
});