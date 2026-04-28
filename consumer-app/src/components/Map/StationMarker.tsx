import type { Station } from '../../hooks/useSimulationState';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Zap, Car } from 'lucide-react';

interface StationMarkerProps {
  station: Station;
  queueLength: number;
  isSelected: boolean;
  onToggle: () => void;
}

export function StationMarker({ station, queueLength, isSelected, onToggle }: StationMarkerProps) {
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
    <AdvancedMarker position={station.location}>
      <div className="relative flex flex-col items-center">
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={clsx(
              "relative mb-3 flex min-w-[168px] flex-col gap-2 rounded-2xl border p-3 text-left backdrop-blur-md shadow-2xl transition-colors duration-500",
              bgColor
            )}
          >
            {isHighLoad && (
              <span className="absolute -inset-1 rounded-2xl border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse" />
            )}

            <div className="relative z-10 text-xs font-semibold text-white/90">
              {station.name}
            </div>

            <div className="relative z-10 flex items-center justify-between gap-3 text-sm">
              <div className={clsx("flex items-center gap-1 font-mono font-bold", loadColor)}>
                <Zap size={14} className="fill-current" />
                {station.availableChargers}/{station.totalChargers}
              </div>

              <div className="flex items-center gap-1 font-mono text-white/70">
                <Car size={14} />
                {station.availableParking}
              </div>
            </div>

            {queueLength > 0 && (
              <div className="relative z-10 rounded px-1 text-[10px] font-bold uppercase text-center text-yellow-300 bg-yellow-900/40">
                Queue: {queueLength}
              </div>
            )}
            {station.availableParking === 0 && queueLength > 0 && (
              <div className="relative z-10 text-[10px] font-medium uppercase text-center text-red-300">
                Parking Full
              </div>
            )}
          </motion.div>
        )}

        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: isSelected ? 1.08 : 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className="relative flex h-12 w-10 items-start justify-center bg-transparent"
          aria-label={`Toggle ${station.name} details`}
        >
          <div className="absolute top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-200 bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.45)]">
            <Zap size={14} className="fill-current" />
          </div>
          <div className="absolute bottom-0 h-5 w-5 rotate-45 rounded-sm border-r-2 border-b-2 border-red-200 bg-red-500 shadow-[0_0_18px_rgba(239,68,68,0.35)]" />
        </motion.button>
      </div>
    </AdvancedMarker>
  );
}
