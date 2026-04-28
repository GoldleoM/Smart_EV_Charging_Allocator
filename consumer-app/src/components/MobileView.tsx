import { useState, useRef, useCallback, useMemo } from 'react';
import { Zap, Monitor, Map as MapIcon, Car, BatteryCharging, Navigation, LogOut } from 'lucide-react';
import { LiveMap } from './Map/LiveMap';
import { StationPanel } from './StationPanel';
import { useSimulationState } from '../hooks/useSimulationState';
import { useAuth } from '../contexts/AuthContext';

export function MobileView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { state } = useSimulationState();
  const { user, logout } = useAuth();
  const userId = user?.uid || '';
  const myVehicle = state.vehicles[userId];
  const batteryLevel = myVehicle ? Math.round(myVehicle.batteryLevel ?? 0) : 0;
  const targetStation = myVehicle?.targetStationId ? state.stations[myVehicle.targetStationId]?.name : 'None';

  // Haversine distance in km between two lat/lng points
  const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  // User base location (from vehicle or Delhi fallback)
  const userLat = myVehicle?.location?.lat ?? 28.6139;
  const userLng = myVehicle?.location?.lng ?? 77.2090;

  // All stations sorted by distance, top 5
  const nearbyStations = useMemo(() => {
    return Object.entries(state.stations || {})
      .map(([id, st]) => ({
        id, st,
        distKm: haversineKm(userLat, userLng, st.location?.lat ?? 0, st.location?.lng ?? 0)
      }))
      .sort((a, b) => a.distKm - b.distKm)
      .slice(0, 5);
  }, [state.stations, userLat, userLng]);

  // Bottom sheet drag state
  const SNAP_POSITIONS = [30, 70, 92]; // % of screen height
  const [sheetHeight, setSheetHeight] = useState(70);
  const dragStartY = useRef<number | null>(null);
  const dragStartHeight = useRef<number>(70);

  const onDragStart = useCallback((clientY: number) => {
    dragStartY.current = clientY;
    dragStartHeight.current = sheetHeight;
  }, [sheetHeight]);

  const onDragMove = useCallback((clientY: number) => {
    if (dragStartY.current === null) return;
    const deltaY = dragStartY.current - clientY;
    const deltaPercent = (deltaY / window.innerHeight) * 100;
    const newHeight = Math.min(92, Math.max(20, dragStartHeight.current + deltaPercent));
    setSheetHeight(newHeight);
  }, []);

  const onDragEnd = useCallback(() => {
    if (dragStartY.current === null) return;
    dragStartY.current = null;
    // Snap to nearest position
    setSheetHeight(prev => {
      const nearest = SNAP_POSITIONS.reduce((a, b) =>
        Math.abs(b - prev) < Math.abs(a - prev) ? b : a
      );
      return nearest;
    });
  }, []);

  return (
    <div className="h-screen w-full bg-[#09080e] text-white font-sans flex flex-col overflow-hidden box-border">
      {/* Top Navbar */}
      <nav className="shrink-0 flex items-center justify-between px-3 py-2 bg-[#110f18] border-b border-[#2a2638] z-50">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-7 h-7 shrink-0 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Zap size={14} className="text-white" fill="currentColor" />
          </div>
          <span className="text-base font-bold tracking-wide">ELECTRA</span>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-[#1a1723] rounded-xl p-0.5 border border-[#2a2638] shrink-0 ml-2">
          <button 
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              activeTab === 'dashboard' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Monitor size={12} />
            <span>Dashboard</span>
          </button>
          <button 
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              activeTab === 'station' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('station')}
          >
            <MapIcon size={14} />
            Station
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="shrink-0 w-7 h-7 rounded-lg bg-[#1a1723] border border-[#2a2638] flex items-center justify-center text-gray-500 hover:text-red-400 hover:border-red-500/40 transition-colors ml-1"
          title="Logout"
        >
          <LogOut size={12} />
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 relative min-h-0">

        {activeTab === 'dashboard' ? (
          // Dashboard Tab - EV Car full screen, Quick Trip Planner, Stations
          <div className="absolute inset-0 bg-[#110f18] overflow-y-auto scroll-smooth" style={{scrollSnapType: 'y proximity'}}>
            {/* ── SECTION 1: EV Car (full screen, snap) ── */}
            <div className="min-h-full flex flex-col p-5 relative" style={{scrollSnapAlign: 'start'}}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none -mr-10 -mt-10"></div>

              <div className="flex items-center justify-between mb-8 z-10 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1a1723] flex items-center justify-center text-gray-300">
                    <Car size={16} />
                  </div>
                  <h2 className="text-lg font-semibold">EV Cars</h2>
                </div>
                <div className="flex items-center bg-[#1a1723] px-3 py-1 rounded-full border border-[#2a2638]">
                  <input 
                    type="text" 
                    defaultValue="Tesla M-3" 
                    className="bg-transparent text-sm text-gray-400 hover:text-white focus:outline-none w-24 text-right"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center w-full z-10 py-4">
              {/* Glowing conceptual car representation - VERTICAL */}
              <div className="relative w-[150px] h-[380px] mb-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-cyan-500/10 blur-[80px] rounded-[50%] w-full h-[80%] mx-auto"></div>
                
                {/* Top View Car Wireframe Base */}
                <div className="relative w-full h-full border-2 border-cyan-400/40 rounded-[5rem] shadow-[0_0_50px_rgba(34,211,238,0.15)] bg-gradient-to-b from-[#161b28] to-[#0c0f16] flex items-center justify-center isolate">
                  
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
                  <div className="absolute top-[18%] -left-[14px] w-[14px] h-[16%] bg-[#080b12] rounded-l-md border-y-2 border-l-2 border-cyan-500/70 shadow-[0_0_10px_rgba(34,211,238,0.4)] z-[-1]"></div>
                  <div className="absolute bottom-[18%] -left-[14px] w-[14px] h-[16%] bg-[#080b12] rounded-l-md border-y-2 border-l-2 border-cyan-500/70 shadow-[0_0_10px_rgba(34,211,238,0.4)] z-[-1]"></div>
                  <div className="absolute top-[18%] -right-[14px] w-[14px] h-[16%] bg-[#080b12] rounded-r-md border-y-2 border-r-2 border-cyan-500/70 shadow-[0_0_10px_rgba(34,211,238,0.4)] z-[-1]"></div>
                  <div className="absolute bottom-[18%] -right-[14px] w-[14px] h-[16%] bg-[#080b12] rounded-r-md border-y-2 border-r-2 border-cyan-500/70 shadow-[0_0_10px_rgba(34,211,238,0.4)] z-[-1]"></div>
                  
                  {/* Front/Rear bumpers glow accents */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60px] h-[4px] bg-cyan-400/50 blur-[2px] rounded-full"></div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60px] h-[4px] bg-red-500/40 blur-[2px] rounded-full"></div>
                </div>
              </div>

              <div className="grid grid-cols-3 w-full gap-4 pt-5 border-t border-[#2a2638] shrink-0">
                <div className="text-center">
                  <div className="text-xl font-bold text-white mb-1">{myVehicle?.etaMinutes ? Math.ceil(myVehicle.etaMinutes) : 0} min</div>
                  <div className="text-xs text-gray-500">ETA</div>
                </div>
                <div className="text-center border-l border-[#2a2638]">
                  <div className="text-xl font-bold text-white mb-1 truncate px-2" title={targetStation}>{targetStation}</div>
                  <div className="text-xs text-gray-500">Station</div>
                </div>
                <div className="text-center border-l border-[#2a2638]">
                  <div className="text-xl font-bold text-white mb-1">$18 <span className="text-[10px] font-normal text-gray-400">USD</span></div>
                  <div className="text-xs text-gray-500">Cost/kW</div>
                </div>
              </div>
                {/* Scroll hint */}
                <div className="w-full flex flex-col items-center pt-4 pb-2 shrink-0 animate-bounce">
                  <span className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">scroll for stations</span>
                  <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M1 1L8 8L15 1" stroke="#4b5563" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
              </div>{/* end section 1 */}

            {/* ── SECTION 2: Nearby Stations (below fold) ── */}
              <div className="shrink-0 pt-5 pb-6 px-1">
                <div className="flex items-center gap-2 mb-3">
                  <Navigation size={14} className="text-purple-400" />
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Stations</h3>
                  <div className="flex-1 h-px bg-[#2a2638] ml-1"></div>
                </div>
                {nearbyStations.length === 0 ? (
                  <div className="text-center text-gray-600 text-xs py-6">Loading stations...</div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {nearbyStations.map(({ id, st, distKm }, idx) => (
                      <div key={id} className="flex items-center gap-3 bg-[#1a1723] border border-[#2a2638] rounded-xl px-4 py-3">
                        {/* Rank badge */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 ${
                          idx === 0 ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' :
                          idx === 1 ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' :
                          idx === 2 ? 'bg-pink-500/20 border-pink-500/40 text-pink-300' :
                          'bg-gray-700/40 border-gray-600/40 text-gray-400'
                        }`}>{idx + 1}</div>

                        {/* Station info — flex-1 + min-w-0 allows truncate to work */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-100 leading-tight truncate">{st.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-amber-400 font-medium">{st.queueLength ?? 0} waiting</span>
                            <span className="text-[10px] text-gray-500">·</span>
                            <span className="text-[10px] text-green-400 font-medium">{st.availableChargers}/{st.totalChargers} plugs</span>
                          </div>
                        </div>

                        {/* Distance — always right-aligned, never shrinks */}
                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                          <span className="text-xs font-bold text-white whitespace-nowrap">{distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)}km`}</span>
                          <span className="text-[9px] text-gray-500">away</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>{/* end outer scroll container */}
          </div>
        ) : (
          // Station Tab - Map full screen, Bottom Sheet
          <div className="relative w-full h-full overflow-hidden">
            
            {/* Map fills entire screen */}
            <div className="absolute inset-0 z-0">
              <LiveMap />
            </div>

            {/* "Routing Active" badge */}
            <div className="absolute left-4 top-4 pointer-events-none z-10">
              <div className="bg-[#110f18]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#2a2638] flex items-center gap-2 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Routing Active</span>
              </div>
            </div>

            {/* Bottom Sheet */}
            <div
              className="absolute bottom-0 left-0 right-0 pointer-events-auto bg-[#110f18] rounded-t-3xl border-t border-[#2a2638] overflow-hidden flex flex-col shadow-[0_-15px_50px_rgba(0,0,0,0.7)] transition-[height] duration-150 ease-out z-20"
              style={{ height: `${sheetHeight}%` }}
            >
              {/* Drag Handle - events scoped here only, NOT on the sheet root */}
              <div
                className="w-full flex flex-col items-center pt-2.5 pb-2 shrink-0 bg-[#1a1723] cursor-grab active:cursor-grabbing select-none touch-none"
                onPointerDown={(e) => {
                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                  onDragStart(e.clientY);
                }}
                onPointerMove={(e) => { if (dragStartY.current !== null) onDragMove(e.clientY); }}
                onPointerUp={onDragEnd}
                onPointerCancel={onDragEnd}
              >
                <div className="w-12 h-1.5 bg-[#3a3550] rounded-full mb-1"></div>
                <span className="text-[9px] text-gray-600 uppercase tracking-widest">drag to resize</span>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <StationPanel />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
