import { AdvancedMarker } from '@vis.gl/react-google-maps';
import type { Vehicle } from '../../hooks/useSimulationState';
import { motion } from 'framer-motion';
import { Car } from 'lucide-react';
import clsx from 'clsx';

export function VehicleMarker({ vehicle, targetStationName }: { vehicle: Vehicle, targetStationName?: string }) {
  if (!vehicle.location) return null;

  let markerColor = 'bg-blue-500 border-blue-400';
  if (vehicle.status === 'RESERVED') markerColor = 'bg-yellow-500 border-yellow-400';
  if (vehicle.status === 'stranded') markerColor = 'bg-red-600 border-red-500 text-white';
  
  // Hide vehicles inside stations to prevent clutter
  if (vehicle.status === 'OCCUPIED' || vehicle.status === 'waiting') return null;

  return (
    <AdvancedMarker position={vehicle.location} zIndex={50}>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        className={clsx(
          "group relative flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-1000",
          markerColor
        )}
      >
        <Car size={16} className="text-white" />
        
        {/* Urgent Glow Context */}
        {vehicle.batteryLevel <= 20 && vehicle.status !== 'stranded' && (
          <span className="absolute -inset-2 rounded-full border border-red-500/80 animate-[ping_2s_ease-out_infinite]" />
        )}

        {/* Hover Tooltip Overlay */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-dark-800/95 backdrop-blur-md rounded-lg shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex flex-col gap-1 z-[100]">
          <div className="font-mono text-xs font-bold text-white/90 capitalize">{vehicle.id.replace('_', ' ')}</div>
          <div className="text-[10px] text-white/60">Dest: <span className="text-white/90 font-medium">{targetStationName}</span></div>
          <div className="text-[10px] text-white/60 flex items-center justify-between gap-3">
            <span>Battery: <span className={clsx("font-mono font-bold", vehicle.batteryLevel <= 20 ? "text-red-400" : "text-green-400")}>{vehicle.batteryLevel.toFixed(0)}%</span></span>
            <span>ETA: <span className="font-mono font-bold text-blue-400">{vehicle.etaMinutes}m</span></span>
          </div>
        </div>
      </motion.div>
    </AdvancedMarker>
  );
}
