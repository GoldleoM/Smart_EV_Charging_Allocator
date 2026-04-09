import { set, update, ref } from 'firebase/database';
import { db } from '../../lib/firebase';
import { motion } from 'framer-motion';
import { Plus, Zap, RefreshCw, Cpu, Building } from 'lucide-react';
import { useSimulationState } from '../../hooks/useSimulationState';

export function DemoBar() {
  const { state } = useSimulationState();
  const isPaused = state.system?.isPaused || false;

  const generateNewVehicle = async () => {
    const id = `manual_${Date.now().toString().slice(-4)}`;
    const stationIds = ["station_1", "station_2", "station_3"];
    const target = stationIds[Math.floor(Math.random() * stationIds.length)];
    
    // Target anchor so we don't spawn them off-screen
    const targetLoc = state.stations[target]?.location || { lat: 40.75, lng: -73.98 };
    const vLat = targetLoc.lat + (Math.random() - 0.5) * 0.08;
    const vLng = targetLoc.lng + (Math.random() - 0.5) * 0.08;
    
    const distanceDegree = Math.sqrt(Math.pow(vLat - targetLoc.lat, 2) + Math.pow(vLng - targetLoc.lng, 2));
    let accurateEta = Math.round(distanceDegree * 222);
    if (accurateEta < 2) accurateEta = 2;

    await update(ref(db), {
      [`/vehicles/${id}`]: {
        id,
        batteryLevel: Math.floor(Math.random() * 20) + 5, // 5-25 (Urgent!)
        status: "driving",
        location: { lat: vLat, lng: vLng },
        targetStationId: target,
        etaMinutes: accurateEta,
        queuePriorityScore: 0
      }
    });
  };

  const simulateRushHour = async () => {
    for(let i=0; i<3; i++) {
        await generateNewVehicle();
    }
  };

  const toggleSimulation = async () => {
    await update(ref(db, '/system'), { isPaused: !isPaused });
  };

  const setSpeed = async (multiplier: number) => {
    const baseInterval = 5000;
    await update(ref(db, '/system'), { tickInterval: baseInterval / multiplier, speedMultiplier: multiplier });
  };

  const addStation = async () => {
    const name = window.prompt("Enter Station Name (e.g. 'East Side Hub'):");
    if (!name) return;
    const parkingStr = window.prompt("Enter total parking spaces (e.g. 10):", "10");
    if (!parkingStr || isNaN(parseInt(parkingStr))) return;
    const chargingStr = window.prompt("Enter total chargers (e.g. 5):", "5");
    if (!chargingStr || isNaN(parseInt(chargingStr))) return;

    const parking = parseInt(parkingStr, 10);
    const charging = parseInt(chargingStr, 10);
    
    // Pick a random location within the NY grid
    const lat = 40.71 + (Math.random() * 0.08);
    const lng = -74.00 + (Math.random() * 0.08);
    
    const id = `station_${Date.now().toString().slice(-4)}`;

    await update(ref(db), {
      [`/stations/${id}`]: {
        name,
        location: { lat, lng },
        totalParking: parking,
        availableParking: parking,
        totalChargers: charging,
        availableChargers: charging
      }
    });
  };

  const resetSimulation = async () => {
    const stationIds = ["station_1", "station_2", "station_3"];
    
    // 1. Reset Stations to completely empty
    const stationsData = {
      "station_1": { name: "Downtown Hub", location: { lat: 40.7128, lng: -74.0060 }, totalParking: 10, availableParking: 10, totalChargers: 5, availableChargers: 5 },
      "station_2": { name: "Midtown Fast-Charge", location: { lat: 40.7580, lng: -73.9855 }, totalParking: 8, availableParking: 8, totalChargers: 8, availableChargers: 8 },
      "station_3": { name: "Uptown Plaza", location: { lat: 40.7851, lng: -73.9683 }, totalParking: 15, availableParking: 15, totalChargers: 3, availableChargers: 3 }
    };
    
    // 2. Generate exactly 7 fresh vehicles
    const vehiclesData: Record<string, any> = {};
    for (let i = 1; i <= 7; i++) {
      const target = stationIds[Math.floor(Math.random() * stationIds.length)];
      const targetLoc = (stationsData as any)[target].location;
      const vLat = targetLoc.lat + (Math.random() - 0.5) * 0.08;
      const vLng = targetLoc.lng + (Math.random() - 0.5) * 0.08;
      
      const distanceDegree = Math.sqrt(Math.pow(vLat - targetLoc.lat, 2) + Math.pow(vLng - targetLoc.lng, 2));
      let accurateEta = Math.round(distanceDegree * 222);
      if (accurateEta < 2) accurateEta = 2;

      vehiclesData[`vehicle_${i}`] = {
        id: `vehicle_${i}`,
        batteryLevel: Math.floor(Math.random() * 41) + 10, // 10-50%
        status: "driving",
        location: { lat: vLat, lng: vLng },
        targetStationId: target,
        etaMinutes: accurateEta,
        queuePriorityScore: 0
      };
    }
    
    // Atomically reset the entire DB to initial state
    await set(ref(db, '/'), {
      stations: stationsData,
      vehicles: vehiclesData
    });
  };

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-panel px-6 py-3 flex items-center gap-6"
    >
      <div className="flex items-center gap-2 border-r border-white/10 pr-6">
        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
        <span className="text-xs font-mono text-purple-400 font-bold tracking-widest uppercase">Demo Mode</span>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={generateNewVehicle}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
        >
          <Plus size={14} className="text-blue-400" /> Add Vehicle
        </button>

        <button 
          onClick={simulateRushHour}
          className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-lg px-3 py-2 text-xs font-medium text-yellow-100 transition-colors"
        >
          <Zap size={14} className="text-yellow-400 fill-yellow-400" /> Rush Hour
        </button>

        <button 
          onClick={addStation}
          className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-2 text-xs font-medium text-blue-200 transition-colors"
        >
          <Building size={14} className="text-blue-400" /> Add Station
        </button>

        <button 
          onClick={resetSimulation}
          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-2 text-xs font-medium text-red-200 transition-colors"
        >
          <RefreshCw size={14} className="text-red-400" /> Reset State
        </button>
        
        <button 
          onClick={toggleSimulation}
          className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-xs font-medium transition-colors ml-4 ${
            isPaused 
              ? "bg-red-500/10 border-red-500/30 text-red-500" 
              : "bg-green-500/10 border-green-500/30 text-green-400"
          }`}
        >
          <Cpu size={14} /> {isPaused ? "AI PAUSED" : "AI ON"}
        </button>

        <div className="flex bg-white/5 border border-white/10 rounded-lg p-1 ml-4 overflow-hidden">
           {[1, 2, 5, 10].map(speed => (
             <button
                key={speed}
                onClick={() => setSpeed(speed)}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                   state.system?.speedMultiplier === speed ? "bg-white/20 text-white" : "text-white/50 hover:bg-white/10 hover:text-white"
                }`}
             >
                {speed}x
             </button>
           ))}
        </div>
      </div>
    </motion.div>
  );
}
