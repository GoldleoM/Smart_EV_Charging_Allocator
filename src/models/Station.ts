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
  const stationsData: StationsMap = {
    "station_1": {
      name: "Downtown Hub",
      location: { lat: 40.7128, lng: -74.0060 },
      totalParking: 10,
      availableParking: 10,
      totalChargers: 5,
      availableChargers: 5
    },
    "station_2": {
      name: "Midtown Fast-Charge",
      location: { lat: 40.7580, lng: -73.9855 },
      totalParking: 8,
      availableParking: 8,
      totalChargers: 8,
      availableChargers: 8
    },
    "station_3": {
      name: "Uptown Plaza",
      location: { lat: 40.7851, lng: -73.9683 },
      totalParking: 15,
      availableParking: 15,
      totalChargers: 3,
      availableChargers: 3
    }
  };

  try {
    // Nested inside a stations object for the root update
    await update(ref(db), { stations: stationsData });
    console.log("✓ Stations seeded successfully.");
  } catch (error: any) {
    console.error("Error seeding stations:", error.message);
  }
}