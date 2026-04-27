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
      name: "Connaught Place Hub",
      location: { lat: 28.6304, lng: 77.2177 },
      totalParking: 10,
      availableParking: 10,
      totalChargers: 5,
      availableChargers: 5
    },
    "station_2": {
      name: "Lajpat Nagar Fast-Charge",
      location: { lat: 28.5677, lng: 77.2433 },
      totalParking: 8,
      availableParking: 8,
      totalChargers: 8,
      availableChargers: 8
    },
    "station_3": {
      name: "Dwarka Sector 21 Plaza",
      location: { lat: 28.5530, lng: 77.0588 },
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