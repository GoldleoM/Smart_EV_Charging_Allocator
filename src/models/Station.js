async function seedStations(db) {
  if (!db) {
    console.log("Mock db offline, skipping Station seeding.");
    return;
  }
  
  const stationsRef = db.ref('/stations');
  
  const stationsData = {
    "station_1": {
      "name": "Downtown Hub",
      "location": { "lat": 40.7128, "lng": -74.0060 },
      "totalParking": 10,
      "availableParking": 10,
      "totalChargers": 5,
      "availableChargers": 5
    },
    "station_2": {
      "name": "Midtown Fast-Charge",
      "location": { "lat": 40.7580, "lng": -73.9855 },
      "totalParking": 8,
      "availableParking": 8,
      "totalChargers": 8,
      "availableChargers": 8
    },
    "station_3": {
      "name": "Uptown Plaza",
      "location": { "lat": 40.7851, "lng": -73.9683 },
      "totalParking": 15,
      "availableParking": 15,
      "totalChargers": 3,
      "availableChargers": 3
    }
  };

  try {
    // We use update so we don't obliterate the entire node if other stations were manually added,
    // but in a hackathon simulation we could also just set it.
    await stationsRef.update(stationsData);
    console.log("Stations seeded successfully.");
  } catch (error) {
    console.error("Error seeding stations:", error.message);
  }
}

module.exports = { seedStations };
