import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../lib/firebase';

export type VehicleStatus = "driving" | "waiting" | "RESERVED" | "OCCUPIED" | "stranded";

export interface Vehicle {
  id: string;
  batteryLevel: number;
  status: VehicleStatus;
  location: { lat: number; lng: number };
  targetStationId: string;
  etaMinutes: number;
  queuePriorityScore: number;
  isRerouted?: boolean;
  isManualSelection?: boolean;
}

export interface Station {
  name: string;
  location: { lat: number; lng: number };
  totalParking: number;
  availableParking: number;
  totalChargers: number;
  availableChargers: number;
  queueLength?: number;
}

export interface SystemState {
  isPaused?: boolean;
  tickInterval?: number;
  speedMultiplier?: number;
}

export interface SimulationState {
  vehicles: Record<string, Vehicle>;
  stations: Record<string, Station>;
  system: SystemState;
}

export function useSimulationState() {
  const [state, setState] = useState<SimulationState>({ vehicles: {}, stations: {}, system: {} });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const rootRef = ref(db, '/');
    const unsubscribe = onValue(rootRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setState({
          vehicles: data.vehicles || {},
          stations: data.stations || {},
          system: data.system || {},
        });
        if (!isConnected) setIsConnected(true);
      }
    }, (error) => {
      console.error("Firebase subscription error:", error);
    });

    return () => unsubscribe();
  }, [isConnected]);

  return { state, isConnected };
}
