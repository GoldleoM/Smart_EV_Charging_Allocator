/**
 * Calculates priority score based on battery and ETA.
 * High score = high priority.
 * Formula: (100 - batteryLevel) * 0.8 + (1 / (etaMinutes + 1)) * 20
 */
export function calculatePriorityScore(vehicle) {
    const batteryTerm = (100 - vehicle.batteryLevel) * 0.8;
    const etaTerm = (1 / (vehicle.etaMinutes + 1)) * 20;
    return Number((batteryTerm + etaTerm).toFixed(2));
}
/**
 * Pure function that determines which vehicles get a slot.
 * Mutates the stations object in memory to enforce locking for the current tick.
 * Returns a map of Firebase update paths.
 */
export function allocateSlots(vehicles, stations) {
    const updates = {};
    const activeSeeking = [];
    const currentlyReserved = [];
    const queueCounts = {};
    const CONSUMPTION_RATE = 0.5; // battery units per ETA minute
    // 1. Gather & Score all vehicles
    for (const v of Object.values(vehicles)) {
        if (v.status === "OCCUPIED")
            continue; // Safely ignore already charging cars
        if (v.status === "RESERVED" || v.status === "waiting") {
            v.queuePriorityScore = calculatePriorityScore(v);
            if (v.id)
                updates[`/vehicles/${v.id}/queuePriorityScore`] = v.queuePriorityScore;
            currentlyReserved.push(v);
        }
        const batteryNeeded = v.etaMinutes * CONSUMPTION_RATE;
        const hasRange = v.batteryLevel > batteryNeeded;
        // Eligible if driving AND has battery range AND (is close OR is critical)
        const isEligible = v.status === "driving" && hasRange && ((v.etaMinutes <= 7 && v.batteryLevel <= 30) ||
            (v.batteryLevel <= 18));
        if (isEligible) {
            v.queuePriorityScore = calculatePriorityScore(v);
            if (v.id)
                updates[`/vehicles/${v.id}/queuePriorityScore`] = v.queuePriorityScore;
            activeSeeking.push(v);
        }
    }
    // 2. Predict Queues and Route Efficiently
    // Combine arrays to evaluate everyone for best routes!
    // Sort by highest priority: highest gets the best routing choices first
    const allRouting = [...activeSeeking, ...currentlyReserved].sort((a, b) => b.queuePriorityScore - a.queuePriorityScore);
    // Start fresh simulated queues since we iterate in highest-priority-first order!
    const currentVirtualQueues = {};
    const currentVirtualIncoming = {};
    for (const vehicle of allRouting) {
        const vId = vehicle.id;
        if (!vId)
            continue;
        if (vehicle.isManualSelection && vehicle.targetStationId) {
            // Driver picked this station manually! Respect the AI lock, but still emit their presence to virtual queues so AI vehicles route around them.
            currentVirtualQueues[vehicle.targetStationId] = (currentVirtualQueues[vehicle.targetStationId] || 0) + 1;
            const requiresNewParking = !(vehicle.status === "waiting");
            if (requiresNewParking) {
                currentVirtualIncoming[vehicle.targetStationId] = (currentVirtualIncoming[vehicle.targetStationId] || 0) + 1;
            }
            continue; // Skip the routing algorithm completely
        }
        let bestStationId = null;
        let lowestCost = Infinity;
        let newEta = vehicle.etaMinutes;
        for (const [sId, st] of Object.entries(stations)) {
            if (!st.location || !vehicle.location)
                continue;
            const dist = Math.sqrt(Math.pow(st.location.lat - vehicle.location.lat, 2) + Math.pow(st.location.lng - vehicle.location.lng, 2));
            let accurateEta = Math.round(dist * 222);
            if (accurateEta < 2)
                accurateEta = 2; // Base travel time
            // Can we physically reach it?
            if (vehicle.batteryLevel <= accurateEta * CONSUMPTION_RATE)
                continue;
            // Project Wait Time for Chargers
            // Because we process highest priority vehicles first, carsAhead is EXACTLY the size of the virtual queue we've built so far!
            const carsAheadForCharger = currentVirtualQueues[sId] || 0;
            let waitCost = 0;
            if (carsAheadForCharger >= st.availableChargers) {
                // If available chargers is full, the very first car to wait (carsAhead=0) MUST wait for 1 car turnover.
                const waitingCarsToClear = carsAheadForCharger - st.availableChargers + 1;
                waitCost = Math.ceil(waitingCarsToClear / Math.max(1, st.totalChargers)) * 10;
            }
            // Project Wait Time for Parking
            const requiresNewParking = !(vehicle.status === "waiting" && vehicle.targetStationId === sId);
            const carsIncomingAhead = currentVirtualIncoming[sId] || 0;
            // Massive penalty if physical parking will be completely full upon arrival!
            if (requiresNewParking && carsIncomingAhead >= st.availableParking) {
                waitCost += 1000;
            }
            // Increased penalty if changing destinations to avoid thrashing
            let switchPenalty = (vehicle.targetStationId && vehicle.targetStationId !== sId) ? 15 : 0;
            if (vehicle.targetStationId && vehicle.targetStationId !== sId && vehicle.etaMinutes <= 5) {
                switchPenalty += 1000; // Almost never reroute if inside 5 minute proximity!
            }
            const totalCost = accurateEta + waitCost + switchPenalty;
            if (totalCost < lowestCost) {
                lowestCost = totalCost;
                bestStationId = sId;
                newEta = accurateEta;
            }
        }
        // 3. Finalize Routing
        if (bestStationId) {
            // Claim spots in the virtual queues so lower priority cars know we are ahead of them!
            currentVirtualQueues[bestStationId] = (currentVirtualQueues[bestStationId] || 0) + 1;
            const requiresNewParking = !(vehicle.status === "waiting" && vehicle.targetStationId === bestStationId);
            if (requiresNewParking) {
                currentVirtualIncoming[bestStationId] = (currentVirtualIncoming[bestStationId] || 0) + 1;
            }
            if (vehicle.status === "RESERVED" || vehicle.status === "waiting") {
                if (vehicle.targetStationId !== bestStationId) {
                    // We are abandoning our old station!
                    // If we were physically waiting, refund the parking spot so someone else can evaluate it right now!
                    if (vehicle.status === "waiting") {
                        const oldSt = stations[vehicle.targetStationId];
                        if (oldSt) {
                            oldSt.availableParking = Math.min(oldSt.totalParking, oldSt.availableParking + 1);
                            updates[`/stations/${vehicle.targetStationId}/availableParking`] = oldSt.availableParking;
                        }
                    }
                    updates[`/vehicles/${vId}/targetStationId`] = bestStationId;
                    updates[`/vehicles/${vId}/etaMinutes`] = newEta;
                    updates[`/vehicles/${vId}/status`] = "RESERVED";
                    updates[`/vehicles/${vId}/isRerouted`] = true;
                }
            }
            else if (vehicle.status === "driving") {
                updates[`/vehicles/${vId}/targetStationId`] = bestStationId;
                updates[`/vehicles/${vId}/etaMinutes`] = newEta;
                updates[`/vehicles/${vId}/status`] = "RESERVED";
            }
        }
    }
    // 4. Expose Queue Length to Global State for UI Transparency
    for (const sId of Object.keys(stations)) {
        updates[`/stations/${sId}/queueLength`] = currentVirtualQueues[sId] || 0;
    }
    return updates;
}
