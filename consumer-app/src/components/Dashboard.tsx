import { useState } from 'react';
import { 
  Search, Bell, Settings, MapPin, 
  Car, Zap, Activity, Navigation, 
  Map as MapIcon, ChevronDown, Monitor,
  MoreVertical, Clock
} from 'lucide-react';
import { LiveMap } from './Map/LiveMap';
import { useSimulationState } from '../hooks/useSimulationState';
import { StationPanel } from './StationPanel';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { state } = useSimulationState();
  const myVehicle = state.vehicles['manual_user_999'];
  const batteryLevel = myVehicle ? Math.round(myVehicle.batteryLevel) : 2;
  const targetStation = myVehicle?.targetStationId ? state.stations[myVehicle.targetStationId]?.name : 'None';

  return (
    <div className="h-screen w-full bg-[#09080e] text-white font-sans p-4 flex flex-col overflow-hidden box-border">
      {/* Top Navbar */}
      <nav className="shrink-0 flex items-center justify-between px-6 py-2 bg-[#110f18] rounded-xl mb-3 border border-[#2a2638] shadow-lg">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Zap size={18} className="text-white" fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-wide">ELECTRA</span>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-[#1a1723] rounded-xl p-1 border border-[#2a2638]">
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'dashboard' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Monitor size={16} />
            Dashboard
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'station' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('station')}
          >
            <MapIcon size={16} />
            Station
          </button>
        </div>

      </nav>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        {activeTab === 'dashboard' ? (
          <>
        
        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 h-full">
          
          {/* EV Cars - Expanded Left Column */}
          <div className="col-span-4 bg-[#110f18] rounded-2xl border border-[#2a2638] p-5 flex flex-col relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none -mr-10 -mt-10"></div>
            
            <div className="flex items-center justify-between mb-8 z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1a1723] flex items-center justify-center text-gray-300">
                  <Car size={16} />
                </div>
                <h2 className="text-lg font-semibold">EV Cars</h2>
              </div>
              <button className="text-sm text-gray-400 flex items-center gap-1 hover:text-white bg-[#1a1723] px-3 py-1.5 rounded-full border border-[#2a2638]">
                Tesla M-3 <ChevronDown size={14} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative my-4 w-full z-10 transition-all">
              {/* Glowing conceptual car representation - VERTICAL */}
              <div className="relative w-[150px] flex-1 max-h-[460px] min-h-[280px] mb-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-cyan-500/10 blur-[80px] rounded-[50%] w-full h-[80%] mx-auto"></div>
                
                {/* Top View Car Wireframe Base */}
                <div className="relative w-full h-full max-h-[440px] min-h-[260px] border-2 border-cyan-400/40 rounded-[5rem] shadow-[0_0_50px_rgba(34,211,238,0.15)] bg-gradient-to-b from-[#161b28] to-[#0c0f16] flex items-center justify-center isolate">
                  
                  {/* Inner Shell / Battery Area */}
                  <div className="w-[86px] h-[86%] border-2 border-cyan-400/60 rounded-[4rem] shadow-inner shadow-cyan-400/30 relative flex flex-col items-center justify-center overflow-hidden bg-[#0d141f]">
                    
                    {/* Battery Fill visualizer */}
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-cyan-600/40 to-cyan-400/10 transition-all duration-1000 ease-in-out border-t border-cyan-400/50" 
                      style={{ height: `${batteryLevel}%` }}
                    ></div>

                    {/* Glowing charging effect lines - Vertical */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                      <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#22d3ee" strokeWidth="2" strokeDasharray="6 8" className="opacity-20" />
                    </svg>

                    {/* Center % text straight */}
                    <div className="text-cyan-50 font-bold text-5xl font-mono drop-shadow-[0_0_15px_rgba(34,211,238,1)] z-20 flex  items-center mt-2">
                      {Math.round(batteryLevel)}<span className="text-4xl text-cyan-300/80 ">%</span>
                    </div>
                  </div>

                  {/* Wheels */}
                  {/* Top Left */}
                  <div className="absolute top-[18%] -left-[14px] w-[14px] h-[16%] bg-[#080b12] rounded-l-md border-y-2 border-l-2 border-cyan-500/70 shadow-[0_0_10px_rgba(34,211,238,0.4)] z-[-1]"></div>
                  {/* Bottom Left */}
                  <div className="absolute bottom-[18%] -left-[14px] w-[14px] h-[16%] bg-[#080b12] rounded-l-md border-y-2 border-l-2 border-cyan-500/70 shadow-[0_0_10px_rgba(34,211,238,0.4)] z-[-1]"></div>
                  {/* Top Right */}
                  <div className="absolute top-[18%] -right-[14px] w-[14px] h-[16%] bg-[#080b12] rounded-r-md border-y-2 border-r-2 border-cyan-500/70 shadow-[0_0_10px_rgba(34,211,238,0.4)] z-[-1]"></div>
                  {/* Bottom Right */}
                  <div className="absolute bottom-[18%] -right-[14px] w-[14px] h-[16%] bg-[#080b12] rounded-r-md border-y-2 border-r-2 border-cyan-500/70 shadow-[0_0_10px_rgba(34,211,238,0.4)] z-[-1]"></div>
                  
                  {/* Front/Rear bumpers glow accents */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60px] h-[4px] bg-cyan-400/50 blur-[2px] rounded-full"></div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60px] h-[4px] bg-red-500/40 blur-[2px] rounded-full"></div>
                </div>
              </div>

              <div className="grid grid-cols-3 w-full gap-4 pt-8 mt-auto border-t border-[#2a2638]">
                <div className="text-center">
                  <div className="text-xl font-bold text-white mb-1">{myVehicle?.etaMinutes ? Math.ceil(myVehicle.etaMinutes) : 0} min</div>
                  <div className="text-xs text-gray-500">ETA to Station</div>
                </div>
                <div className="text-center border-l border-[#2a2638]">
                  <div className="text-xl font-bold text-white mb-1 truncate px-2" title={targetStation}>{targetStation}</div>
                  <div className="text-xs text-gray-500">Target Station</div>
                </div>
                <div className="text-center border-l border-[#2a2638]">
                  <div className="text-xl font-bold text-white mb-1">$18 <span className="text-xs font-normal text-gray-400">USD</span></div>
                  <div className="text-xs text-gray-500">Cost per kW</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Stack: Map and Station List */}
          <div className="col-span-8 flex flex-col gap-4 h-full min-h-0">
            
            {/* Quick Trip Planner Map Expanded */}
            <div className="flex-1 bg-[#110f18] rounded-2xl border border-[#2a2638] p-5 flex flex-col relative overflow-hidden min-h-0">
              <div className="flex items-center justify-between mb-4 z-10 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1a1723] flex items-center justify-center text-gray-300">
                    <Car size={16} />
                  </div>
                  <h2 className="text-lg font-semibold">Quick Trip Planner</h2>
                </div>
                <button className="text-sm text-gray-400 flex items-center gap-1 hover:text-white bg-[#1a1723] p-2 rounded-lg border border-[#2a2638]">
                  <Settings size={16} />
                </button>
              </div>

              <div className="flex-1 bg-[#1a1723] rounded-xl border border-[#2a2638] relative overflow-hidden flex flex-col justify-end">
                <div className="absolute inset-0 z-0">
                   <LiveMap />
                </div>
                
                {/* Map Controls */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
                  <button className="w-8 h-8 rounded-full bg-[#110f18]/80 border border-[#2a2638] flex items-center justify-center text-gray-300 hover:text-white hover:border-purple-500 transition-colors backdrop-blur-sm">
                    <MapPin size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-[#110f18]/80 border border-[#2a2638] flex items-center justify-center text-gray-300 hover:text-white hover:border-purple-500 transition-colors backdrop-blur-sm">
                    <Navigation size={14} />
                  </button>
                  <div className="w-8 flex flex-col items-center bg-[#110f18]/80 border border-[#2a2638] rounded-full backdrop-blur-sm mt-2">
                    <button className="w-full h-8 flex items-center justify-center text-gray-300 hover:text-white">+</button>
                    <div className="w-4 h-[1px] bg-[#2a2638]"></div>
                    <button className="w-full h-8 flex items-center justify-center text-gray-300 hover:text-white">-</button>
                  </div>
                </div>

                {/* Bottom Bar Info overlay */}
                <div className="w-full h-16 bg-gradient-to-t from-[#110f18] to-transparent z-10 flex items-end px-6 pb-4 justify-between pointer-events-none">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-300">Range: 254 Miles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-300">Time: 1.5 Hour</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Station List */}
            <div className="flex-1 bg-[#110f18] rounded-2xl border border-[#2a2638] p-5 flex flex-col relative overflow-hidden min-h-0">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1a1723] flex items-center justify-center text-gray-300">
                    <MapIcon size={16} />
                  </div>
                  <h2 className="text-lg font-semibold">Station List</h2>
                </div>
                <button className="text-sm text-gray-400 flex items-center gap-1 hover:text-white bg-[#1a1723] px-3 py-1.5 rounded-full border border-[#2a2638]">
                  Nearby All <ChevronDown size={14} />
                </button>
              </div>

              <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4 shrink-0">
                <div className="col-span-4">Location</div>
                <div className="col-span-3">Ports</div>
                <div className="col-span-3">Time</div>
                <div className="col-span-2 text-right pr-4">Book</div>
              </div>

              <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
                {Object.values(state.stations || {}).map((station: any, i: number) => (
                  <div 
                    key={station.name || i} 
                    className={`grid grid-cols-12 items-center p-3 rounded-xl transition-all hover:bg-[#1a1723] border ${station.availableParking === 0 ? 'bg-red-900/20 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-transparent border-transparent'}`}
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-[#2a2638] shrink-0 bg-dark-800 flex items-center justify-center">
                        <MapIcon size={20} className="text-gray-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-200 truncate pr-2" title={station.name}>{station.name}</h4>
                        <p className="text-xs text-gray-500">Live coordinates</p>
                      </div>
                    </div>
                    
                    <div className="col-span-3 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${station.availableChargers > 0 ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'}`}>
                          {station.availableChargers}
                        </span>
                        <span className="text-xs text-gray-400">Available ports</span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Zap size={10} /> ${10}/hour
                      </div>
                    </div>

                    <div className="col-span-3 flex flex-col justify-center text-xs text-gray-400 gap-1">
                      <div className="flex items-center gap-1"><Car size={12} /> {station.availableParking} / {station.totalParking} Parking</div>
                    </div>

                    <div className="col-span-2 flex justify-end pr-2">
                      <button className="px-4 py-1.5 rounded-full border border-purple-500/50 text-purple-400 text-xs font-semibold hover:bg-purple-500 hover:text-white transition-all shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
          </>
        ) : (
          <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 h-full">
            <div className="col-span-4 bg-[#110f18] rounded-2xl border border-[#2a2638] overflow-hidden flex flex-col min-h-0 relative h-full shadow-lg">
               <StationPanel />
            </div>
            <div className="col-span-8 bg-[#110f18] rounded-2xl border border-[#2a2638] relative overflow-hidden flex flex-col h-full min-h-0 shadow-lg">
               <div className="absolute inset-0 z-0">
                 <LiveMap />
               </div>
               
               {/* Map Context Overlay */}
               <div className="absolute left-6 top-6 z-20 pointer-events-none">
                 <div className="bg-[#110f18]/80 backdrop-blur-md px-4 py-2 rounded-lg border border-[#2a2638] flex items-center gap-3 shadow-lg">
                   <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
                   <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Routing Map active</span>
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
