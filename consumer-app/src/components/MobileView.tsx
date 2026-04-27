import { useEffect, useState } from 'react';
import { ref, onValue, set, remove } from 'firebase/database';
import { db } from '../lib/firebase';
import { Zap, MapPin, Navigation, Car, BatteryCharging, CheckCircle2, ChevronRight, Hash, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStationRecommendation } from '../hooks/useStationRecommendation';

const USER_ID = 'manual_user_999';

interface Vehicle {
  id: string;
  batteryLevel: number;
  status: 'driving' | 'waiting' | 'OCCUPIED' | 'stranded' | 'RESERVED';
  targetStationId: string;
  etaMinutes: number;
  queuePriorityScore?: number;
  isManualSelection?: boolean;
}

interface Station {
  name: string;
  location: { lat: number; lng: number };
  totalParking: number;
  availableParking: number;
  totalChargers: number;
  availableChargers: number;
  queueLength?: number;
}

export function MobileView() {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [stations, setStations] = useState<Record<string, Station>>({});
  const [stationName, setStationName] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiReason, setAiReason] = useState('');
  const { getRecommendations, isLoading } = useStationRecommendation();

  const handleAiRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isLoading) return;
    setAiReason('');
    
    const decision = await getRecommendations(aiPrompt);
    
    if (decision && decision.recommendations.length > 0) {
      const best = decision.recommendations[0];
      setAiReason(best.explanation || "This is the best route.");
      requestCharge(true, best.station_id, 'RESERVED');
    } else {
      setAiReason("Sorry, I couldn't understand that request. Try picking manually!");
    }
    setAiPrompt('');
  };

  useEffect(() => {
    const vehicleRef = ref(db, `vehicles/${USER_ID}`);
    const unsub = onValue(vehicleRef, (snapshot) => {
      setVehicle(snapshot.val() || null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const stationsRef = ref(db, `stations`);
    const unsub = onValue(stationsRef, (snapshot) => {
      setStations(snapshot.val() || {});
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (vehicle?.targetStationId && stations[vehicle.targetStationId]) {
      setStationName(stations[vehicle.targetStationId].name);
    }
  }, [vehicle?.targetStationId, stations]);

  const requestCharge = (isManual: boolean, targetId: string, initialStatus: string = 'driving') => {
    const baseLat = 40.7128; // New York base
    const baseLng = -74.0060;
    
    set(ref(db, `vehicles/${USER_ID}`), {
      id: USER_ID,
      batteryLevel: 15,
      status: initialStatus,
      targetStationId: targetId,
      etaMinutes: 10,
      isManualSelection: isManual,
      location: {
        lat: baseLat + (Math.random() - 0.5) * 0.04,
        lng: baseLng + (Math.random() - 0.5) * 0.04
      }
    });
  };

  const cancelCharge = () => {
    remove(ref(db, `vehicles/${USER_ID}`));
  };

  const getStatusDisplay = () => {
    if (!vehicle) return null;
    if (vehicle.status === 'driving' || vehicle.status === 'RESERVED') return 'Navigating to Station';
    if (vehicle.status === 'waiting') return 'Arrived! Waiting in Queue';
    if (vehicle.status === 'OCCUPIED') return 'Charging...';
    if (vehicle.status === 'stranded') return 'Battery Depleted. Assistance needed.';
    return vehicle.status;
  };

  return (
    <div className="flex flex-col h-full bg-dark-900 text-white font-sans selection:bg-purple-500/30 w-full relative">
      {/* Header */}
      <div className="px-6 py-6 pb-4 border-b border-white/5 flex items-center justify-between z-10 shrink-0">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">EV Connect</h1>
          <p className="text-xs text-gray-400 font-medium">Smart Allocation</p>
        </div>
        <div className="h-10 w-10 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Zap size={20} className="text-white drop-shadow-sm" />
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col px-6">
        <AnimatePresence mode="wait">
          {!vehicle ? (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col flex-1 h-full pt-8 pb-4"
            >
              <h2 className="text-2xl font-bold mb-2">Ready to Charge?</h2>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Let the orchestrator assign you the mathematically best station, or override it and pick your own.
              </p>
              
              <button
                onClick={() => requestCharge(false, '')}
                className="w-full relative group overflow-hidden bg-white text-black py-4 rounded-xl font-semibold shadow-xl shadow-white/10 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2">
                  <Navigation size={18} />
                  Auto-Route (Best ETA)
                </span>
              </button>

              <div className="flex items-center gap-4 mt-8 mb-4 opacity-50 shrink-0">
                <div className="flex-1 h-px bg-white/20"></div>
                <div className="text-xs font-bold uppercase tracking-widest text-white">Smart AI Override</div>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>

              {/* Gemini Smart Router */}
              <form onSubmit={handleAiRoute} className="relative mb-6 shrink-0">
                <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-inner focus-within:border-purple-500/50 transition-colors">
                  <div className="pl-4 text-purple-400">
                    <Sparkles size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Or tell AI: 'I'm in a rush!'"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-transparent text-sm text-gray-200 py-4 px-3 focus:outline-none placeholder:text-gray-500 disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={!aiPrompt.trim() || isLoading}
                    className="px-4 py-2 mr-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600 hover:text-white transition-colors disabled:opacity-50 text-sm font-bold flex items-center gap-2"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Route"}
                  </button>
                </div>
              </form>

              <div className="flex items-center gap-4 mb-4 opacity-50 shrink-0">
                <div className="flex-1 h-px bg-white/20"></div>
                <div className="text-xs font-bold uppercase tracking-widest text-white">Manual Override</div>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>

              {/* Station Selection List */}
              <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pb-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                {Object.entries(stations).map(([id, st]) => (
                  <button 
                    key={id} 
                    onClick={() => requestCharge(true, id)}
                    className="flex items-center justify-between w-full p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 active:scale-[0.98] transition-all text-left group"
                  >
                    <div>
                      <div className="font-semibold text-gray-100">{st.name}</div>
                      <div className="flex items-center gap-3 mt-1.5 opacity-80">
                        <span className="flex items-center gap-1 text-xs font-medium text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md">
                          <Car size={12} />
                          {st.queueLength || 0} in queue
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {st.availableChargers}/{st.totalChargers} Plugs Open
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col h-full py-8"
            >
              <div className="flex-1 flex flex-col pt-4">
                
                {/* Main Visualizer */}
                <div className="relative w-48 h-48 mx-auto mb-10 flex flex-col items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                    <circle 
                      cx="96" cy="96" r="88" 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      fill="transparent" 
                      strokeDasharray="552.9" 
                      strokeDashoffset={552.9 - (552.9 * vehicle.batteryLevel) / 100}
                      className="text-purple-500 transition-all duration-1000 ease-out" 
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-bold tracking-tighter tabular-nums drop-shadow-md">
                      {Math.round(vehicle.batteryLevel)}<span className="text-2xl text-gray-400 ml-1">%</span>
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 mt-2">
                      Battery
                    </span>
                  </div>

                  {vehicle.status === 'OCCUPIED' && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className="absolute -bottom-2 bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-full p-2 shadow-lg shadow-green-500/30"
                    >
                      <BatteryCharging size={20} />
                    </motion.div>
                  )}
                </div>

                {/* Info Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/10 p-2 rounded-lg">
                      <MapPin size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Destination</p>
                      <p className="font-semibold text-lg flex items-center gap-2">
                        {stationName || 'Routing...'}
                        {vehicle.isManualSelection && (
                          <span className="text-[10px] bg-red-500/20 text-red-300 font-bold px-1.5 py-0.5 rounded shadow-sm">
                            Locked
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 relative">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Status</p>
                      <p className="font-medium text-sm text-purple-300">{getStatusDisplay()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Time to Target</p>
                      <p className="font-bold text-lg tabular-nums">
                        {vehicle.etaMinutes > 0 ? `${Math.ceil(vehicle.etaMinutes)} min` : 'Arrived'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Queue Metrics */}
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Station Queue</p>
                      <p className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                         <Hash size={14} />
                         {vehicle.targetStationId && stations[vehicle.targetStationId] ? stations[vehicle.targetStationId].queueLength || 0 : 0} vehicles waiting
                      </p>
                    </div>
                    {vehicle.queuePriorityScore !== undefined && (
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Your Priority</p>
                        <p className="font-bold text-sm text-emerald-400">{vehicle.queuePriorityScore}</p>
                      </div>
                    )}
                  </div>
                </div>

                {aiReason && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full mb-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-sm text-purple-200 flex items-start gap-3"
                  >
                    <Sparkles size={18} className="shrink-0 mt-0.5 text-purple-400" />
                    <p className="leading-relaxed"><strong>Gemini:</strong> {aiReason}</p>
                  </motion.div>
                )}

                {vehicle.status === 'OCCUPIED' && vehicle.batteryLevel >= 100 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center mb-4 shrink-0"
                  >
                    <CheckCircle2 size={28} className="text-green-400 mb-2" />
                    <p className="font-semibold text-green-100">Charge Complete!</p>
                    <p className="text-xs text-green-300/80 mt-1">Ready to disconnect & depart.</p>
                  </motion.div>
                )}

              </div>

              <button
                onClick={cancelCharge}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-xl font-semibold transition-all hover:border-red-500/30 hover:text-red-400 shrink-0"
              >
                End Session
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
