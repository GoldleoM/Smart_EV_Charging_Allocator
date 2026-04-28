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
  const stationIds = ["station_1", "station_2", "station_3"];
  const vehiclesData: VehiclesMap = {};

  const stationLocs: Record<string, { lat: number, lng: number }> = {
    "station_1": { lat: 28.6304, lng: 77.2177 }, // Connaught Place
    "station_2": { lat: 28.5677, lng: 77.2433 }, // Lajpat Nagar
    "station_3": { lat: 28.5530, lng: 77.0588 }  // Dwarka
  };

  for (let i = 1; i <= count; i++) {
    const batteryLevel = Math.floor(Math.random() * 41) + 10; // 10-50
    const targetStationId = stationIds[Math.floor(Math.random() * stationIds.length)];
    const targetLoc = stationLocs[targetStationId];
    
    // Generate inside a ~10km radius from the target station to fit inside the Zoom radius
    const vLat = targetLoc.lat + (Math.random() - 0.5) * 0.08;
    const vLng = targetLoc.lng + (Math.random() - 0.5) * 0.08;
    
    // Formula: 1 degree = 111km. Speed = 30km/h = 0.5km/min. Mins = (degree * 111) / 0.5 = degree * 222.
    const distanceDegree = Math.sqrt(Math.pow(vLat - targetLoc.lat, 2) + Math.pow(vLng - targetLoc.lng, 2));
    let accurateEta = Math.round(distanceDegree * 222);
    if (accurateEta < 2) accurateEta = 2;

    vehiclesData[`vehicle_${i}`] = {
      id: `vehicle_${i}`,
      batteryLevel,
      status: "driving",
      location: { lat: vLat, lng: vLng },
      targetStationId,
      etaMinutes: accurateEta,
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