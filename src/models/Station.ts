import { ref, update, Database } from 'firebase/database';

export interface Station {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  totalParking: number;
  availableParking: number;
  totalChargers: number;
  availableChargers: number;
  queueLength?: number;
}

export type StationsMap = Record<string, Station>;

export async function seedStations(db: Database): Promise<void> {
  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  let stationsData: StationsMap = {};

  if (apiKey) {
    try {
      console.log("📍 Fetching real EV stations from Google Places API strictly around Delhi...");
      const delhiLat = 28.6139;
      const delhiLng = 77.2090;
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=EV+charging+station&location=${delhiLat},${delhiLng}&radius=15000&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        data.results.slice(0, 15).forEach((place: any, index: number) => {
          // Simulate the parking logic since Places API doesn't provide real-time occupancy.
          const totalParking = Math.floor(Math.random() * 10) + 4;
          const availableParking = Math.floor(Math.random() * totalParking);
          const totalChargers = Math.floor(Math.random() * Math.min(totalParking, 6)) + 2;
          const availableChargers = Math.floor(Math.random() * totalChargers);

          stationsData[`station_${index + 1}`] = {
            name: place.name || "EV Charging Station",
            location: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            },
            totalParking,
            availableParking,
            totalChargers,
            availableChargers
          };
        });
        console.log(`✓ Fetched ${Object.keys(stationsData).length} real stations from Google.`);
      } else {
        console.warn("API returned no results or failed:", data.status, data.error_message);
      }
    } catch (err: any) {
      console.error("Failed to fetch stations from Google API:", err.message);
    }
  } else {
    console.warn("⚠️ No GOOGLE_MAPS_API_KEY found, skipping live API fetch.");
  }

  // Fallback to our existing 4 locations if API fetch didn't return anything
  if (Object.keys(stationsData).length === 0) {
    console.log("Using default fallback Delhi stations...");
    stationsData = {
      "station_1": {
        name: "Tata Power Charging - Connaught Place",
        location: { lat: 28.6322, lng: 77.2198 },
        totalParking: 15, availableParking: 10, totalChargers: 6, availableChargers: 4
      },
      "station_2": {
        name: "EESL EV Station - South Ex",
        location: { lat: 28.5683, lng: 77.2162 },
        totalParking: 8, availableParking: 4, totalChargers: 4, availableChargers: 2
      },
      "station_3": {
        name: "Statiq Charging - Vasant Kunj",
        location: { lat: 28.5303, lng: 77.1561 },
        totalParking: 20, availableParking: 5, totalChargers: 10, availableChargers: 3
      },
      "station_4": {
        name: "Jio-bp Pulse - Dwarka Sec 10",
        location: { lat: 28.5815, lng: 77.0601 },
        totalParking: 12, availableParking: 12, totalChargers: 5, availableChargers: 5
      }
    };
  }

  try {
    await update(ref(db), { stations: stationsData });
    console.log("✓ Stations seeded to database effectively.");
  } catch (error: any) {
    console.error("Error seeding stations:", error.message);
  }
}