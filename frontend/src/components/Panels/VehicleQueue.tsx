import { useSimulationState } from '../../hooks/useSimulationState';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import clsx from 'clsx';

export function VehicleQueue() {
  const { state } = useSimulationState();
  
  // Sort vehicles active first, lowest ETA first
  const vehicles = Object.values(state.vehicles).filter(v => 
    v.batteryLevel < 100
  ).sort((a, b) => {
    if (a.status === 'stranded' && b.status !== 'stranded') return -1;
    if (a.status !== 'stranded' && b.status === 'stranded') return 1;
    if (a.status === 'driving' && b.status !== 'driving') return -1;
    if (a.status !== 'driving' && b.status === 'driving') return 1;
    return a.etaMinutes - b.etaMinutes;
  });

  return (
    <motion.div 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass-panel w-[350px] max-h-[400px] flex flex-col"
    >
      <div className="p-4 border-b border-white/10 sticky top-0 bg-dark-800/80 backdrop-blur-md rounded-t-2xl z-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 flex items-center gap-2">
          Vehicle Queue Overview
        </h2>
      </div>

      <div className="overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
        {vehicles.length === 0 && (
          <div className="text-center text-white/30 text-sm py-4">No active queued vehicles</div>
        )}
        
        {vehicles.map(v => {
          let statusColor = "text-blue-400";
          let statusBg = "bg-blue-400/10 border-blue-400/20";
          
          if (v.status === 'RESERVED') {
            statusColor = "text-yellow-400";
            statusBg = "bg-yellow-400/10 border-yellow-400/20";
          } else if (v.status === 'OCCUPIED' || v.status === 'waiting') {
            statusColor = "text-green-400";
            statusBg = "bg-green-400/10 border-green-400/20";
          } else if (v.status === 'stranded') {
            statusColor = "text-red-500 animate-pulse font-bold";
            statusBg = "bg-red-900/30 border-red-500/50";
          }

          const targetName = state.stations[v.targetStationId]?.name || "Unassigned";

          return (
            <div key={v.id} className={clsx("p-3 rounded-lg border", statusBg, "transition-all")}>
              <div className="flex justify-between items-center mb-2">
                <div className="font-mono text-sm text-white/80">{v.id?.toUpperCase() || 'UNKNOWN'}</div>
                <div className={clsx("text-xs font-bold uppercase", statusColor)}>
                  {v.status}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/50">Target</span>
                  <span className="text-white/80">{targetName}</span>
                </div>
                
                <div className="flex items-center gap-4 text-xs font-mono mt-1">
                  <div className="flex items-center gap-1.5 text-white/60">
                    <Clock size={12} />
                    <span>{v.etaMinutes} min</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-full h-1 bg-dark-900 rounded-full relative overflow-hidden">
                      <div 
                        className={clsx("h-full absolute left-0", v.batteryLevel < 20 ? "bg-red-500" : "bg-green-500")}
                        style={{ width: `${v.batteryLevel}%` }}
                      />
                    </div>
                    <span>{v.batteryLevel.toFixed(0)}%</span>
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
