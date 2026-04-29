import { ref, set, Database } from 'firebase/database';

export type VehicleStatus = "idle" | "driving" | "waiting" | "RESERVED" | "OCCUPIED" | "stranded";

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
  isRerouted?: boolean;
  isManualSelection?: boolean;
}

export type VehiclesMap = Record<string, Vehicle>;

export async function generateVehicles(db: Database, count: number): Promise<void> {
  const vehiclesData: VehiclesMap = {};

  // Central Delhi anchor — vehicles scatter randomly around this point
  const centerLat = 28.6139;
  const centerLng = 77.2090;

  for (let i = 1; i <= count; i++) {
    const batteryLevel = Math.floor(Math.random() * 41) + 10; // 10-50

    // Scatter within ~10km of central Delhi
    const vLat = centerLat + (Math.random() - 0.5) * 0.12;
    const vLng = centerLng + (Math.random() - 0.5) * 0.12;

    vehiclesData[`vehicle_${i}`] = {
      id: `vehicle_${i}`,
      batteryLevel,
      status: "driving",
      location: { lat: vLat, lng: vLng },
      targetStationId: "",
      etaMinutes: 0,
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