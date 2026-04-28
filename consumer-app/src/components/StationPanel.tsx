import { useState } from 'react';
import { ref, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { Zap, MapPin, Navigation, Car, BatteryCharging, CheckCircle2, ChevronRight, Hash, Search, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationState } from '../hooks/useSimulationState';
import { useStationRecommendation } from '../hooks/useStationRecommendation';
import { useAuth } from '../contexts/AuthContext';

export function StationPanel() {
  const { state } = useSimulationState();
  const { user } = useAuth();
  const userId = user?.uid || '';
  const vehicle = state.vehicles[userId];
  const stations = state.stations;
  const [searchTerm, setSearchTerm] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiReason, setAiReason] = useState('');
  const { getRecommendations, isLoading } = useStationRecommendation();

  const [routingMode, setRoutingMode] = useState<'auto' | 'manual'>('auto');

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

  const stationName = vehicle?.targetStationId ? stations[vehicle.targetStationId]?.name : '';

  const requestCharge = (isManual: boolean, targetId: string, initialStatus: string = 'RESERVED') => {
    const baseLat = 28.6139; // Delhi base
    const baseLng = 77.2090;
    
    set(ref(db, `vehicles/${userId}`), {
      id: userId,
      batteryLevel: 15, // Starting battery per demo
      status: initialStatus,
      targetStationId: targetId,
      etaMinutes: 10,
      isManualSelection: isManual,
      location: vehicle?.location || {
        lat: baseLat,
        lng: baseLng
      }
    });
  };

  const cancelCharge = () => {
    // Do not delete the vehicle, just reset the session state
    set(ref(db, `vehicles/${userId}/targetStationId`), null);
    set(ref(db, `vehicles/${userId}/status`), 'idle');
    set(ref(db, `vehicles/${userId}/etaMinutes`), 0);
    set(ref(db, `vehicles/${userId}/isManualSelection`), false);
  };

  const getStatusDisplay = () => {
    if (!vehicle) return null;
    if (vehicle.status === 'driving' || vehicle.status === 'RESERVED') return 'Navigating to Station';
    if (vehicle.status === 'waiting') return 'Arrived! Waiting in Queue';
    if (vehicle.status === 'OCCUPIED') return 'Charging...';
    if (vehicle.status === 'stranded') return 'Battery Depleted';
    return vehicle.status;
  };

  return (
    <div className="flex flex-col h-full bg-[#110f18] text-white font-sans w-full relative overflow-hidden">
      
      {/* Header Visual */}
      <div className="px-6 py-5 border-b border-[#2a2638] flex items-center justify-between z-10 shrink-0 bg-[#1a1723]/30 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold tracking-tight">EV Connect</h1>
          <p className="text-xs text-gray-400 font-medium">Smart Allocation</p>
        </div>
        <div className="h-10 w-10 bg-gradient-to-tr from-purple-500 to-pink-500 p-[1px] rounded-full drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]">
          <div className="w-full h-full bg-[#1a1723] rounded-full flex items-center justify-center">
            <Zap size={18} className="text-pink-400" fill="currentColor" />
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-y-auto flex flex-col p-6 hide-scrollbar custom-scrollbar min-h-0">
        <AnimatePresence mode="wait">
          {(!vehicle || !vehicle.targetStationId) ? (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col flex-1 pb-4"
            >
              <h2 className="text-xl font-bold mb-2">Ready to Charge?</h2>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Let the orchestrator assign you the mathematically best station, or override it and pick your own.
              </p>
              
              <div className="flex bg-[#1a1723] p-1 rounded-xl border border-[#2a2638] mb-6 shrink-0">
                <button
                  onClick={() => setRoutingMode('auto')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    routingMode === 'auto'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Sparkles size={16} /> Auto Route
                </button>
                <button
                  onClick={() => setRoutingMode('manual')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    routingMode === 'manual'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <MapPin size={16} /> Manual Pick
                </button>
              </div>

              {routingMode === 'auto' ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-6"
                >
                  <button
                    onClick={() => requestCharge(false, '')}
                    className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all hover:scale-[1.02] active:scale-95 shrink-0"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center justify-center gap-2">
                      <Navigation size={18} />
                      Auto-Route (Best ETA)
                    </span>
                  </button>

                  <div className="flex items-center gap-4 opacity-50 shrink-0">
                    <div className="flex-1 h-px bg-[#2a2638]"></div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Smart AI Override</div>
                    <div className="flex-1 h-px bg-[#2a2638]"></div>
                  </div>

                  <form onSubmit={handleAiRoute} className="relative group shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl group-hover:opacity-100 transition-opacity opacity-50 rounded-xl" />
                    <div className="relative flex items-start bg-[#1a1723] border border-purple-500/30 rounded-xl overflow-hidden shadow-inner focus-within:border-pink-500/60 transition-colors">
                      <div className="pl-4 pt-4 text-purple-400">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <textarea
                        placeholder="Or tell AI: 'I'm in a rush!'"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        disabled={isLoading}
                        className="flex-1 w-full h-24 resize-none bg-transparent text-sm text-gray-200 py-4 px-3 focus:outline-none placeholder:text-gray-500 disabled:opacity-50 custom-scrollbar"
                      />
                      <button 
                        type="submit"
                        disabled={!aiPrompt.trim() || isLoading}
                        className="px-4 py-2 mr-2 mb-2 self-end bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600 hover:text-white transition-colors disabled:opacity-50 text-sm font-bold flex items-center gap-2 shrink-0"
                      >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Route"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col flex-1 min-h-0"
                >
                  <div className="relative mb-4 shrink-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={14} className="text-gray-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search stations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#1a1723] text-sm text-gray-200 border border-[#2a2638] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-gray-600 shadow-inner"
                    />
                  </div>

                  <div className="flex flex-col gap-3 pb-4 overflow-y-auto custom-scrollbar">
                    {Object.entries(stations)
                      .filter(([_, st]) => st.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(([id, st]) => (
                      <button 
                        key={id} 
                        onClick={() => requestCharge(true, id)}
                        className="flex items-center justify-between w-full p-4 bg-[#1a1723] border border-[#2a2638] rounded-xl hover:border-pink-500/50 hover:bg-[#1a1723]/80 active:scale-[0.98] transition-all text-left group shrink-0"
                      >
                        <div>
                          <div className="font-semibold text-gray-200">{st.name}</div>
                          <div className="flex items-center gap-3 mt-1.5 opacity-80">
                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                              <Car size={12} />
                              {st.queueLength || 0} in queue
                            </span>
                            <span className="text-[11px] text-gray-400 font-medium font-mono">
                              {st.availableChargers}/{st.totalChargers} Plugs Open
                            </span>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#110f18] flex items-center justify-center border border-[#2a2638] group-hover:border-pink-500/50 transition-colors">
                          <ChevronRight size={14} className="text-gray-400 group-hover:text-pink-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col h-full"
            >
              <div className="flex-1 flex flex-col items-center">
                
                {/* Main Visualizer - Pink Neon Circle */}
                <div className="relative w-48 h-48 mb-8 flex flex-col items-center justify-center mt-4">
                  <div className="absolute inset-0 bg-pink-500/10 blur-[40px] rounded-full pointer-events-none"></div>
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[#2a2638]" />
                    <circle 
                      cx="96" cy="96" r="88" 
                      stroke="url(#pink-gradient)" 
                      strokeWidth="4" 
                      fill="transparent" 
                      strokeDasharray="552.9" 
                      strokeDashoffset={552.9 - (552.9 * vehicle.batteryLevel) / 100}
                      className="transition-all duration-1000 ease-out" 
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="pink-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <div className="flex flex-col items-center relative z-10 pointer-events-none">
                    <span className="text-5xl font-bold tracking-tighter tabular-nums drop-shadow-md text-white">
                      {Math.round(vehicle.batteryLevel)}<span className="text-2xl text-gray-400 ml-1">%</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-pink-500 mt-2">
                      Battery
                    </span>
                  </div>

                  {vehicle.status === 'OCCUPIED' && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className="absolute -bottom-2 bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-full p-2 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    >
                      <BatteryCharging size={20} />
                    </motion.div>
                  )}
                </div>

                {/* Info Card */}
                <div className="w-full bg-[#1a1723] border border-[#2a2638] rounded-2xl p-5 mb-4 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-[#110f18] p-2 rounded-lg border border-[#2a2638]">
                      <MapPin size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Destination</p>
                      <p className="font-semibold text-base flex items-center gap-2 text-white">
                        {stationName || 'Routing...'}
                        {vehicle.isManualSelection && (
                          <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded shadow-sm border border-purple-500/30 uppercase">
                            Locked
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#2a2638] relative">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Status</p>
                      <p className="font-medium text-sm text-pink-400">{getStatusDisplay()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Time to Target</p>
                      <p className="font-bold text-lg tabular-nums text-white">
                        {vehicle.etaMinutes > 0 ? `${Math.ceil(vehicle.etaMinutes)} min` : 'Arrived'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Queue Metrics */}
                  <div className="mt-4 pt-4 border-t border-[#2a2638] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Station Queue</p>
                      <p className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                         <Hash size={14} />
                         {vehicle.targetStationId && stations[vehicle.targetStationId] ? stations[vehicle.targetStationId].queueLength || 0 : 0} vehicles waiting
                      </p>
                    </div>
                    {vehicle.queuePriorityScore !== undefined && vehicle.queuePriorityScore !== null ? (
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Your Priority</p>
                        <p className="font-bold text-sm text-emerald-400">{vehicle.queuePriorityScore.toFixed(1)}</p>
                      </div>
                    ) : null}
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
                    className="w-full bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center mb-4 shrink-0"
                  >
                    <CheckCircle2 size={24} className="text-green-400 mb-1" />
                    <p className="font-semibold text-green-200">Charge Complete!</p>
                  </motion.div>
                )}
                
                <div className="flex-1"></div>

                <button
                  onClick={cancelCharge}
                  className="mt-auto w-full bg-transparent hover:bg-red-500/10 border border-[#2a2638] text-gray-300 py-3 rounded-xl font-semibold transition-all hover:border-red-500/50 hover:text-red-400 shrink-0 text-sm"
                >
                  End Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
