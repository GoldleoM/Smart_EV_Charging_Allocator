import { update, ref } from 'firebase/database';
import { db } from '../../lib/firebase';
import { motion } from 'framer-motion';
import { Plus, Zap, RefreshCw, Cpu, Building } from 'lucide-react';
import { useSimulationState } from '../../hooks/useSimulationState';

export function DemoBar() {
  const { state } = useSimulationState();
  const isPaused = state.system?.isPaused || false;

  const generateNewVehicle = async () => {
    const id = `manual_${Date.now().toString().slice(-4)}`;

    // Scatter around central Delhi — allocator will assign a station dynamically
    const centerLat = 28.6139;
    const centerLng = 77.2090;
    const vLat = centerLat + (Math.random() - 0.5) * 0.12;
    const vLng = centerLng + (Math.random() - 0.5) * 0.12;

    await update(ref(db), {
      [`/vehicles/${id}`]: {
        id,
        batteryLevel: Math.floor(Math.random() * 20) + 5, // 5-25 (Urgent!)
        status: "driving",
        location: { lat: vLat, lng: vLng },
        targetStationId: "",
        etaMinutes: 0,
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
    
    // Pick a random location within the Delhi grid
    const lat = 28.5 + (Math.random() * 0.2);
    const lng = 77.1 + (Math.random() * 0.2);
    
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
    try {
      const response = await fetch('https://my-backend-265867944795.asia-south1.run.app/api/reset', {
        method: 'POST'
      });
      if (!response.ok) {
        console.error('Failed to reset simulation via backend');
      }
    } catch (err) {
      console.error('Error resetting simulation:', err);
    }
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
