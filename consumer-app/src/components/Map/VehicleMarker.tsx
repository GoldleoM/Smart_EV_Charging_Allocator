import { AdvancedMarker } from '@vis.gl/react-google-maps';
import type { Vehicle } from '../../hooks/useSimulationState';
import { motion } from 'framer-motion';
import { Car } from 'lucide-react';
import clsx from 'clsx';

export function VehicleMarker({ vehicle, targetStationName }: { vehicle: Vehicle, targetStationName?: string }) {
  if (!vehicle.location) return null;

  const isManual = vehicle.id === 'manual_user_999';
  let markerColor = 'bg-blue-500 border-blue-400 text-white text-white drop-shadow';
  if (vehicle.status === 'RESERVED') markerColor = 'bg-yellow-500 border-yellow-400 text-white text-white drop-shadow';
  if (vehicle.status === 'stranded') markerColor = 'bg-red-600 border-red-500 text-white shadow-red-500/50';

  if (isManual) {
    if (vehicle.status === 'OCCUPIED') {
      markerColor = 'bg-emerald-500 border-emerald-400 text-white scale-125 shadow-[0_0_20px_theme(colors.emerald.400/50)] !z-[100] ring-4 ring-emerald-400/30';
    } else if (vehicle.status === 'waiting') {
      markerColor = 'bg-blue-500 border-blue-400 text-white scale-125 shadow-[0_0_20px_theme(colors.blue.400/50)] !z-[100] ring-4 ring-blue-400/30';
    } else {
      markerColor = 'bg-amber-400 border-amber-200 text-black scale-125 shadow-[0_0_20px_theme(colors.amber.400/50)] !z-[100] ring-4 ring-amber-400/30';
    }
  }
  
  // Hide AI vehicles inside stations to prevent clutter (but never hide the manual user!)
  if (!isManual && (vehicle.status === 'OCCUPIED' || vehicle.status === 'waiting')) return null;

  return (
    <AdvancedMarker position={vehicle.location} zIndex={isManual ? 100 : 50}>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        className={clsx(
          "group relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-1000",
          markerColor,
          (vehicle.status === 'OCCUPIED' || vehicle.status === 'waiting') && isManual ? "-translate-y-12" : ""
        )}
      >
        {isManual && (
          <div className={clsx(
            "absolute flex flex-col items-center justify-center -top-8 px-2 py-0.5 bg-black/80 backdrop-blur-sm border text-[10px] font-bold rounded-full shadow-lg pointer-events-none uppercase tracking-widest",
            vehicle.status === 'OCCUPIED' ? "border-emerald-400/50 text-emerald-400 animate-pulse" : 
            vehicle.status === 'waiting' ? "border-blue-400/50 text-blue-400" :
            "border-amber-400/50 text-amber-400 animate-pulse"
          )}>
            {vehicle.status === 'OCCUPIED' ? 'CHARGING' : 
             vehicle.status === 'waiting' ? 'QUEUED' : 'YOU'}
          </div>
        )}
        <Car size={isManual ? 18 : 16} strokeWidth={isManual ? 2.5 : 2} />
        
        {/* Urgent Glow Context */}
        {(vehicle.batteryLevel ?? 100) <= 20 && vehicle.status !== 'stranded' && (
          <span className="absolute -inset-2 rounded-full border border-red-500/80 animate-[ping_2s_ease-out_infinite]" />
        )}
        {vehicle.isRerouted && (
          <span className="absolute -top-1 -right-1 bg-purple-500 w-3 h-3 rounded-full border border-dark-900 shadow-md animate-pulse" />
        )}

        {/* Hover Tooltip Overlay */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-dark-800/95 backdrop-blur-md rounded-lg shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex flex-col gap-1 z-[100]">
          {vehicle.isRerouted && <div className="text-[9px] font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-1.5 py-0.5 rounded text-center mb-0.5">Rerouted Active</div>}
          <div className="font-mono text-xs font-bold text-white/90 capitalize">{(vehicle.id || "vehicle").replace('_', ' ')}</div>
          <div className="text-[10px] text-white/60">Dest: <span className="text-white/90 font-medium">{targetStationName}</span></div>
          <div className="text-[10px] text-white/60 flex items-center justify-between gap-3">
            <span>Battery: <span className={clsx("font-mono font-bold", (vehicle.batteryLevel ?? 100) <= 20 ? "text-red-400" : "text-green-400")}>{(vehicle.batteryLevel ?? 0).toFixed(0)}%</span></span>
            <span>ETA: <span className="font-mono font-bold text-blue-400">{vehicle.etaMinutes}m</span></span>
          </div>
        </div>
      </motion.div>
    </AdvancedMarker>
  );
}
