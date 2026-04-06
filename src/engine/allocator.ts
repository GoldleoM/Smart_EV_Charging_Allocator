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

  // 1. Filter eligible: driving & ETA <= 5
  const eligibleVehicles = Object.values(vehicles).filter(
    (v) => v.status === "driving" && v.etaMinutes <= 5
  );

  // 2. Score & Sort descending
  eligibleVehicles.forEach(v => {
    v.queuePriorityScore = calculatePriorityScore(v);
    updates[`/vehicles/${v.id}/queuePriorityScore`] = v.queuePriorityScore; // ensure UI sees score
  });
  eligibleVehicles.sort((a, b) => b.queuePriorityScore - a.queuePriorityScore);

  // 3. Allocate sequentially (simulated transaction)
  for (const vehicle of eligibleVehicles) {
    const station = stations[vehicle.targetStationId];
    if (station && station.availableParking > 0 && station.availableChargers > 0) {
      // Lock dual resources
      station.availableParking -= 1;
      station.availableChargers -= 1;

      // Queue the updates
      updates[`/stations/${vehicle.targetStationId}/availableParking`] = station.availableParking;
      updates[`/stations/${vehicle.targetStationId}/availableChargers`] = station.availableChargers;
      updates[`/vehicles/${vehicle.id}/status`] = "RESERVED";
    }
  }

  return updates;
}
