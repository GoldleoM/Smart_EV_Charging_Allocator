import { ref, set, Database } from 'firebase/database';

export type VehicleStatus = "driving" | "waiting" | "RESERVED" | "OCCUPIED";

export interface Vehicle {
  id: string;
  batteryLevel: number;
  status: VehicleStatus;
  location: {
    lat: number;
    lng: number;
  };
  targetStationId: string;
  etaMinutes: number;
  queuePriorityScore: number;
}

export type VehiclesMap = Record<string, Vehicle>;

export async function generateVehicles(db: Database, count: number): Promise<void> {
  const stationIds = ["station_1", "station_2", "station_3"];
  const vehiclesData: VehiclesMap = {};

  for (let i = 1; i <= count; i++) {
    const batteryLevel = Math.floor(Math.random() * 61) + 20; // 20-80
    const etaMinutes = Math.floor(Math.random() * 26) + 5;    // 5-30
    const targetStationId = stationIds[Math.floor(Math.random() * stationIds.length)];

    vehiclesData[`vehicle_${i}`] = {
      id: `vehicle_${i}`,
      batteryLevel,
      status: "driving",
      location: {
        lat: 40.7 + (Math.random() * 0.1),
        lng: -74.0 + (Math.random() * 0.1)
      },
      targetStationId,
      etaMinutes,
      queuePriorityScore: 0
    };
  }

  try {
    await set(ref(db, '/vehicles'), vehiclesData);
    console.log(`✓ Generated ${count} mock vehicles.`);
  } catch (error: any) {
    console.error("Error generating vehicles:", error.message);
  }
}
