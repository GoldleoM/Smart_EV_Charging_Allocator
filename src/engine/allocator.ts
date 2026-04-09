import type { Vehicle, VehiclesMap } from '../models/Vehicle';
import type { StationsMap } from '../models/Station';

/**
 * Calculates priority score based on battery and ETA.
 * High score = high priority.
 * Formula: (100 - batteryLevel) * 0.8 + (1 / (etaMinutes + 1)) * 20
 */
export function calculatePriorityScore(vehicle: Vehicle): number {
  const batteryTerm = (100 - vehicle.batteryLevel) * 0.8;
  const etaTerm = (1 / (vehicle.etaMinutes + 1)) * 20;
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

  const CONSUMPTION_RATE = 0.5; // battery units per ETA minute

  for (const v of Object.values(vehicles)) {
    const batteryNeeded = v.etaMinutes * CONSUMPTION_RATE;
    const hasRange = v.batteryLevel > batteryNeeded;

    // Eligible if: 
    // 1. Has enough battery to reach the station
    // 2. Is driving
    // 3. (Is close AND battery < 30%) OR (Battery is critical < 10%)
    const isEligible = v.status === "driving" && hasRange && (
      (v.etaMinutes <= 5 && v.batteryLevel <= 30) || 
      (v.batteryLevel <= 10)
    );

    if (isEligible) {
      v.queuePriorityScore = calculatePriorityScore(v);
<<<<<<< HEAD
      updates[`/vehicles/${v.id}/queuePriorityScore`] = v.queuePriorityScore;
      unassigned.push(v);
    } else if (v.status === "RESERVED") {
      v.queuePriorityScore = calculatePriorityScore(v);
      updates[`/vehicles/${v.id}/queuePriorityScore`] = v.queuePriorityScore;
=======
      if (v.id) updates[`/vehicles/${v.id}/queuePriorityScore`] = v.queuePriorityScore;
      unassigned.push(v);
    } else if (v.status === "RESERVED") {
      v.queuePriorityScore = calculatePriorityScore(v);
      if (v.id) updates[`/vehicles/${v.id}/queuePriorityScore`] = v.queuePriorityScore;
>>>>>>> origin/Jayant
      reserved.push(v);
    }
  }

  // 2. Sort unassigned descending (highest priority gets first dibs)
  unassigned.sort((a, b) => b.queuePriorityScore - a.queuePriorityScore);

  // 3. Allocate (or Bump!) sequentially
  for (const vehicle of unassigned) {
<<<<<<< HEAD
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
=======
    // Find all stations that currently have capacity
    const availableStations = Object.entries(stations).filter(([id, st]) => st.availableParking > 0 && st.availableChargers > 0);
    
    let bestStationId: string | null = null;
    let minDistance = Infinity;

    if (availableStations.length > 0 && vehicle.location) {
      // Find the absolute closest geographic station with capacity
      for (const [sId, st] of availableStations) {
         if (!st.location) continue;
         const dist = Math.sqrt(Math.pow(st.location.lat - vehicle.location.lat, 2) + Math.pow(st.location.lng - vehicle.location.lng, 2));
         if (dist < minDistance) {
            minDistance = dist;
            bestStationId = sId;
         }
      }
    }

    const vId = vehicle.id;
    if (!vId) continue;

    // Normal Allocation at closest station
    if (bestStationId) {
      const station = stations[bestStationId];
      station.availableParking -= 1;
      station.availableChargers -= 1;

      updates[`/stations/${bestStationId}/availableParking`] = station.availableParking;
      updates[`/stations/${bestStationId}/availableChargers`] = station.availableChargers;
      updates[`/vehicles/${vId}/status`] = "RESERVED";
      
      // If the AI re-routed the vehicle, calculate valid ETA and commit
      if (bestStationId !== vehicle.targetStationId) {
         vehicle.targetStationId = bestStationId;
         updates[`/vehicles/${vId}/targetStationId`] = bestStationId;
         
         let accurateEta = Math.round(minDistance * 222);
         if (accurateEta < 2) accurateEta = 2;
         vehicle.etaMinutes = accurateEta;
         updates[`/vehicles/${vId}/etaMinutes`] = accurateEta;
         
         vehicle.queuePriorityScore = calculatePriorityScore(vehicle);
         updates[`/vehicles/${vId}/queuePriorityScore`] = vehicle.queuePriorityScore;
      }
      
      vehicle.status = "RESERVED";
      reserved.push(vehicle);
    } 
    // Attempt bumping (Critical <= 10%) if everything is full
    else if (vehicle.batteryLevel <= 10 && reserved.length > 0) {
      reserved.sort((a, b) => a.queuePriorityScore - b.queuePriorityScore);
      const weakest = reserved[0]; 
      
      if (vehicle.queuePriorityScore > weakest.queuePriorityScore) {
        const wId = weakest.id;
        const newStationId = weakest.targetStationId;
        
        // Re-route
        vehicle.targetStationId = newStationId;
        updates[`/vehicles/${vId}/targetStationId`] = newStationId;
        updates[`/vehicles/${vId}/status`] = "RESERVED";
        
        // Calculate newly re-routed ETA physically
        const newStation = stations[newStationId];
        if (newStation && newStation.location && vehicle.location) {
            const dist = Math.sqrt(Math.pow(newStation.location.lat - vehicle.location.lat, 2) + Math.pow(newStation.location.lng - vehicle.location.lng, 2));
            let accurateEta = Math.round(dist * 222);
            if (accurateEta < 2) accurateEta = 2;
            vehicle.etaMinutes = accurateEta;
            updates[`/vehicles/${vId}/etaMinutes`] = accurateEta;
            
            vehicle.queuePriorityScore = calculatePriorityScore(vehicle);
            updates[`/vehicles/${vId}/queuePriorityScore`] = vehicle.queuePriorityScore;
        }

        if (wId) {
          updates[`/vehicles/${wId}/status`] = "driving";
        }

        vehicle.status = "RESERVED";
        weakest.status = "driving";
        reserved.shift(); 
        reserved.push(vehicle); 
>>>>>>> origin/Jayant
      }
    }
  }

  return updates;
}
