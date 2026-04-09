import type { Vehicle, VehiclesMap } from '../models/Vehicle';
import type { StationsMap } from '../models/Station';

/**
 * Calculates priority score based on battery and ETA.
 * High score = high priority.
 * Formula: (100 - batteryLevel) * 0.6 + (1 / (etaMinutes + 1)) * 40
 */
export function calculatePriorityScore(vehicle: Vehicle): number {
  const batteryTerm = (100 - vehicle.batteryLevel) * 0.6;
  const etaTerm = (1 / (vehicle.etaMinutes + 1)) * 40;
  return Number((batteryTerm + etaTerm).toFixed(2));
}

/**
 * Pure function that determines which vehicles get a slot.
 * Mutates the stations object in memory to enforce locking for the current tick.
 * Returns a map of Firebase update paths.
 */
export function allocateSlots(vehicles: VehiclesMap, stations: StationsMap): Record<string, any> {
  const updates: Record<string, any> = {};

  // 1. Gather & Score all vehicles
  const unassigned: Vehicle[] = [];
  const reserved: Vehicle[] = [];

  for (const v of Object.values(vehicles)) {
    if (v.status === "driving" && v.etaMinutes <= 5 && v.batteryLevel <= 30) {
      v.queuePriorityScore = calculatePriorityScore(v);
      updates[`/vehicles/${v.id}/queuePriorityScore`] = v.queuePriorityScore;
      unassigned.push(v);
    } else if (v.status === "RESERVED") {
      v.queuePriorityScore = calculatePriorityScore(v);
      updates[`/vehicles/${v.id}/queuePriorityScore`] = v.queuePriorityScore;
      reserved.push(v);
    }
  }

  // 2. Sort unassigned descending (highest priority gets first dibs)
  unassigned.sort((a, b) => b.queuePriorityScore - a.queuePriorityScore);

  // 3. Allocate (or Bump!) sequentially
  for (const vehicle of unassigned) {
    const station = stations[vehicle.targetStationId];
    
    // Attempt normal allocation
    if (station && station.availableParking > 0 && station.availableChargers > 0) {
      // Lock dual resources
      station.availableParking -= 1;
      station.availableChargers -= 1;

      // Queue the updates
      updates[`/stations/${vehicle.targetStationId}/availableParking`] = station.availableParking;
      updates[`/stations/${vehicle.targetStationId}/availableChargers`] = station.availableChargers;
      updates[`/vehicles/${vehicle.id}/status`] = "RESERVED";
      
      // Keep local pools updated for subsequent loop iterations
      vehicle.status = "RESERVED";
      reserved.push(vehicle);
    } 
    // Attempt bumping (Critical <= 10%)
    else if (vehicle.batteryLevel <= 10 && reserved.length > 0) {
      // Sort ascending, lowest priority first
      reserved.sort((a, b) => a.queuePriorityScore - b.queuePriorityScore);
      
      const weakest = reserved[0]; 
      
      // Ensure the critical car is actually more urgent
      if (vehicle.queuePriorityScore > weakest.queuePriorityScore) {
        // Re-route and seize slot
        vehicle.targetStationId = weakest.targetStationId;
        updates[`/vehicles/${vehicle.id}/targetStationId`] = vehicle.targetStationId;
        updates[`/vehicles/${vehicle.id}/status`] = "RESERVED";
        
        // Displace the weak vehicle
        updates[`/vehicles/${weakest.id}/status`] = "driving";

        // Keep local pools updated
        vehicle.status = "RESERVED";
        weakest.status = "driving";
        reserved.shift(); // remove weakest
        reserved.push(vehicle); // add critical
      }
    }
  }

  return updates;
}
