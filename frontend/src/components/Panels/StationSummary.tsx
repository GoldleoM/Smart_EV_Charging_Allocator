import { useSimulationState } from '../../hooks/useSimulationState';
import { motion } from 'framer-motion';
import { Zap, Car } from 'lucide-react';
import clsx from 'clsx';

export function StationSummary() {
  const { state } = useSimulationState();
  const stations = Object.entries(state.stations);
  const vehicles = Object.values(state.vehicles);

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass-panel w-[320px] max-h-[500px] flex flex-col"
    >
      <div className="p-4 border-b border-white/10 sticky top-0 bg-dark-800/80 backdrop-blur-md rounded-t-2xl z-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">
          Station Diagnostics
        </h2>
      </div>

      <div className="overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
        {stations.map(([id, s]) => {
          const loadPct = ((s.totalChargers - s.availableChargers) / s.totalChargers) * 100;
          const queueLength = vehicles.filter((v: any) => v.targetStationId === id && (v.status === "RESERVED" || v.status === "waiting")).length;

          return (
            <div key={id} className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-sm text-white/90">{s.name}</div>
                {loadPct >= 90 ? (
                   <span className="text-[10px] uppercase font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-sm">Critical</span>
                ) : loadPct >= 60 ? (
                   <span className="text-[10px] uppercase font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-sm">Heavy</span>
                ) : (
                   <span className="text-[10px] uppercase font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-sm">Normal</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                {/* Chargers */}
                <div className="flex items-center justify-between text-xs font-mono bg-dark-900/50 p-1.5 rounded">
                  <div className="flex items-center gap-1.5 text-white/50">
                    <Zap size={12} className={clsx(loadPct >= 90 ? "text-red-400" : "text-blue-400")} /> 
                    <span>EVSE</span>
                  </div>
                  <div>
                    <span className="text-white/90 font-bold">{s.availableChargers}</span>
                    <span className="text-white/40">/{s.totalChargers}</span>
                  </div>
                </div>

                {/* Parking & Queue */}
                <div className="flex items-center justify-between text-xs font-mono bg-dark-900/50 p-1.5 rounded">
                  <div className="flex items-center gap-1.5 text-white/50">
                    <Car size={12} className={clsx(s.availableParking === 0 ? "text-red-400" : "text-green-400")} /> 
                    <span>PARK</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {queueLength > 0 && <span className="text-yellow-400 font-bold text-[10px] bg-yellow-400/10 px-1 rounded uppercase">+{queueLength} Q</span>}
                    <div>
                      <span className="text-white/90 font-bold">{s.availableParking}</span>
                      <span className="text-white/40">/{s.totalParking}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
