async function generateVehicles(db, count) {
  if (!db) {
    console.log("Mock db offline, skipping Vehicle seeding.");
    return;
  }

  const vehiclesRef = db.ref('/vehicles');
  const vehiclesData = {};

  const stationIds = ["station_1", "station_2", "station_3"];

  for (let i = 1; i <= count; i++) {
    // Random battery between 20 and 80
    const batteryLevel = Math.floor(Math.random() * 61) + 20; 
    // Random ETA between 5 and 30
    const etaMinutes = Math.floor(Math.random() * 26) + 5; 
    // Randomly assign a station target
    const targetStationId = stationIds[Math.floor(Math.random() * stationIds.length)];

    vehiclesData[`vehicle_${i}`] = {
      batteryLevel,
      status: "driving",
      location: { 
        lat: 40.7 + (Math.random() * 0.1), 
        lng: -74.0 + (Math.random() * 0.1) 
      },
      targetStationId,
      etaMinutes,
      queuePriorityScore: 0,
      id: `vehicle_${i}`
    };
  }

  try {
    // Using set() instead of update so that every time the app restarts,
    // we have a fresh slate of exactly {count} vehicles.
    await vehiclesRef.set(vehiclesData);
    console.log(`Successfully generated ${count} mock vehicles.`);
  } catch (error) {
    console.error("Error generating vehicles:", error.message);
  }
}

module.exports = { generateVehicles };
