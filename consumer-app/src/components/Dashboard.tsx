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
        
        {/* TOP ROW */}
        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          {/* EV Cars (Left 4 cols) */}
          <div className="col-span-4 bg-[#110f18] rounded-2xl border border-[#2a2638] p-5 flex flex-col relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none -mr-10 -mt-10"></div>
          
          <div className="flex items-center justify-between mb-4 z-10">
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

          <div className="flex-1 flex flex-col items-center justify-center relative my-4 min-h-[180px] z-10">
            {/* Glowing conceptual car representation */}
            <div className="relative w-[280px] h-[120px] mb-8">
              <div className="absolute inset-0 bg-cyan-400/20 blur-[50px] rounded-full"></div>
              {/* Top View Car Wireframe Base */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[100px] border border-cyan-400/40 rounded-[4rem] flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                <div className="w-[180px] h-[60px] border border-cyan-400/60 rounded-[3rem] shadow-inner shadow-cyan-400/20"></div>
                {/* Wheels */}
                <div className="absolute top-[-5px] left-[40px] w-[30px] h-[10px] bg-cyan-900 rounded-sm border border-cyan-500"></div>
                <div className="absolute bottom-[-5px] left-[40px] w-[30px] h-[10px] bg-cyan-900 rounded-sm border border-cyan-500"></div>
                <div className="absolute top-[-5px] right-[40px] w-[30px] h-[10px] bg-cyan-900 rounded-sm border border-cyan-500"></div>
                <div className="absolute bottom-[-5px] right-[40px] w-[30px] h-[10px] bg-cyan-900 rounded-sm border border-cyan-500"></div>
                
                {/* Center % */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-50 font-bold text-3xl font-mono drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] z-20">
                  <span className="-rotate-90 block">{batteryLevel}%</span>
                </div>
                {/* Glowing charging effect lines */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 100">
                  <path d="M 120 50 L 120 10" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4 4" className="opacity-60" />
                  <path d="M 120 50 L 120 90" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4 4" className="opacity-60" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-3 w-full gap-4 pt-6 border-t border-[#2a2638]">
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

        {/* Quick Trip Planner Map Expanded (Right 8 cols) */}
        <div className="col-span-8 bg-[#110f18] rounded-2xl border border-[#2a2638] p-5 flex flex-col relative overflow-hidden h-full">
          <div className="flex items-center justify-between mb-4 z-10">
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

        </div>

        {/* BOTTOM ROW */}
        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          {/* Charge Statistic (Left 4 cols) */}
          <div className="col-span-4 bg-[#110f18] rounded-2xl border border-[#2a2638] p-5 flex flex-col relative overflow-hidden h-full">
          <div className="flex items-center justify-between mb-6 z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1a1723] flex items-center justify-center text-gray-300">
                <Activity size={16} />
              </div>
              <h2 className="text-lg font-semibold">Charge Statistic</h2>
            </div>
            <button className="text-sm text-gray-400 flex items-center gap-1 hover:text-white bg-[#1a1723] px-3 py-1.5 rounded-full border border-[#2a2638]">
              Week <ChevronDown size={14} />
            </button>
          </div>

          <div className="flex items-center justify-between mb-8 z-10 px-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-500 flex items-center justify-center">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
              </div>
              <div className="text-sm text-gray-400">Home</div>
              <div className="font-bold">37 <span className="text-xs text-gray-500">%</span></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              </div>
              <div className="text-sm text-gray-400">Work</div>
              <div className="font-bold">23 <span className="text-xs text-gray-500">%</span></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              </div>
              <div className="text-sm text-gray-400">Other</div>
              <div className="font-bold">42 <span className="text-xs text-gray-500">%</span></div>
            </div>
          </div>

          {/* Fake Chart / Custom Chart Visualization matching the picture */}
          <div className="flex-1 flex flex-col justify-end relative z-10 pb-4">
            <div className="absolute inset-0 bg-purple-500/5 blur-[60px] pointer-events-none rounded-full"></div>
            
            <div className="flex items-end justify-between h-40 w-full relative">
              {/* Connecting lines */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                <path d="M 50 160 L 150 160 L 250 160" stroke="#2a2638" strokeWidth="1" />
                <path d="M 50 120 L 150 140 L 250 100" stroke="#312d45" strokeWidth="2" fill="none" />
                <path d="M 50 90 L 150 120 L 250 70" stroke="#483f6b" strokeWidth="2" fill="none" />
                <path d="M 50 60 L 150 90 L 250 30" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" fill="none" opacity="0.5" />
              </svg>

              {/* Bar 1: Oct */}
              <div className="flex flex-col items-center gap-1 w-24">
                <div className="text-xs text-gray-400 mb-2">Total: 79%</div>
                <div className="w-full h-8 bg-gradient-to-b from-purple-500 to-purple-800 rounded-md border border-purple-400/30"></div>
                <div className="w-full h-6 bg-gradient-to-b from-amber-200 to-amber-500 rounded-md border border-amber-400/30"></div>
                <div className="w-full h-8 bg-gradient-to-b from-pink-400 to-pink-700 rounded-md border border-pink-400/30"></div>
                <div className="text-xs text-gray-500 mt-2 font-medium">Oct</div>
              </div>

              {/* Bar 2: Nov */}
              <div className="flex flex-col items-center gap-1 w-24 mt-8">
                <div className="text-xs text-gray-400 mb-2">Total: 43%</div>
                <div className="w-full h-4 bg-gradient-to-b from-purple-500 to-purple-800 rounded-md border border-purple-400/30"></div>
                <div className="w-full h-4 bg-gradient-to-b from-amber-200 to-amber-500 rounded-md border border-amber-400/30"></div>
                <div className="w-full h-6 bg-gradient-to-b from-pink-400 to-pink-700 rounded-md border border-pink-400/30"></div>
                <div className="text-xs text-gray-500 mt-2 font-medium">Nov</div>
              </div>

              {/* Bar 3: Dec */}
              <div className="flex flex-col items-center gap-1 w-24 -mt-4">
                <div className="text-xs text-gray-400 mb-2">Total: 86%</div>
                <div className="w-full h-10 bg-gradient-to-b from-purple-500 to-purple-800 rounded-md border border-purple-400/30"></div>
                <div className="w-full h-8 bg-gradient-to-b from-amber-200 to-amber-500 rounded-md border border-amber-400/30"></div>
                <div className="w-full h-6 bg-gradient-to-b from-pink-400 to-pink-700 rounded-md border border-pink-400/30"></div>
                <div className="text-xs text-gray-500 mt-2 font-medium">Dec</div>
              </div>
            </div>
          </div>
        </div>

        {/* Station List (Right 8 cols) */}
        <div className="col-span-8 bg-[#110f18] rounded-2xl border border-[#2a2638] p-5 flex flex-col relative overflow-hidden h-full">
          <div className="flex items-center justify-between mb-6">
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

          <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
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
