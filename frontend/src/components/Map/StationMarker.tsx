import { useState } from 'react';
import type { Station } from '../../hooks/useSimulationState';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Zap, Car } from 'lucide-react';

interface StationMarkerProps {
  station: Station;
  queueLength: number;
}

export function StationMarker({ station, queueLength }: StationMarkerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const loadPercentage = ((station.totalChargers - station.availableChargers) / station.totalChargers) * 100;
  
  let loadColor = 'text-green-400';
  let bgColor = 'bg-green-500/20 border-green-500/50';
  let isHighLoad = false;

  if (loadPercentage >= 90) {
    loadColor = 'text-red-400';
    bgColor = 'bg-red-500/20 border-red-500/50';
    isHighLoad = true;
  } else if (loadPercentage >= 60) {
    loadColor = 'text-yellow-400';
    bgColor = 'bg-yellow-500/20 border-yellow-500/50';
  }

  return (
    <AdvancedMarker position={station.location} onClick={() => setIsExpanded(prev => !prev)} style={{ cursor: 'pointer' }}>
      {!isExpanded ? (
        <motion.div
           initial={{ y: -10, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="w-6 h-6 bg-red-500 rounded-t-full rounded-bl-full border-[2px] border-dark-900 shadow-[0_0_15px_rgba(239,68,68,0.6)] hover:scale-125 hover:bg-red-400 transition-all duration-300 relative group flex items-center justify-center rotate-45 origin-center"
        >
          {/* Inner circle giving it an authentic pin hole feeling */}
          <span className="w-2 h-2 rounded-full bg-white shadow-inner" />
          
          <span className="absolute -inset-2 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse pointer-events-none" />
        </motion.div>
      ) : (
        <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={clsx(
          "relative flex flex-col items-center justify-center p-3 rounded-xl border backdrop-blur-md shadow-2xl transition-colors duration-500",
          bgColor,
          "min-w-[120px]"
        )}
      >
        {isHighLoad && (
          <span className="absolute -inset-1 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse border border-red-500/30" />
        )}
        
        <div className="relative z-10 w-full flex flex-col gap-1">
          <div className="text-xs font-semibold text-white/90 truncate max-w-[100px] text-center mb-1">
            {station.name}
          </div>
          
          <div className="flex items-center justify-between gap-3 text-sm">
            <div className={clsx("flex items-center gap-1 font-mono font-bold", loadColor)}>
              <Zap size={14} className="fill-current" />
              {station.availableChargers}/{station.totalChargers}
            </div>
            
            <div className="flex items-center gap-1 font-mono text-white/70">
              <Car size={14} />
              {station.availableParking}
            </div>
          </div>
          
          {/* Note: Kept these clean badges based on original design */}
          {queueLength > 0 && (
            <div className="text-[10px] text-center text-yellow-300 font-bold uppercase mt-1 bg-yellow-900/40 rounded px-1">
              Queue: {queueLength}
            </div>
          )}
          {station.availableParking === 0 && queueLength > 0 && (
            <div className="text-[10px] text-center text-red-300 font-medium uppercase mt-0.5">
              Parking Full
            </div>
          )}
        </div>
      </motion.div>
      )}
    </AdvancedMarker>
  );
}
