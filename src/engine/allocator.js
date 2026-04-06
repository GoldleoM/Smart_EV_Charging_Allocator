/**
 * Calculates priority score based on battery and ETA.
 * High score = high priority.
 * Formula: (100 - batteryLevel) * 0.6 + (1 / (etaMinutes + 1)) * 40
 */
function calculatePriorityScore(vehicle) {
  const batteryTerm = (100 - vehicle.batteryLevel) * 0.6;
  const etaTerm = (1 / (vehicle.etaMinutes + 1)) * 40;
  return Number((batteryTerm + etaTerm).toFixed(2));
}

module.exports = { calculatePriorityScore };
