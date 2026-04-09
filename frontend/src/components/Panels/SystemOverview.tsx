import { useSimulationState } from '../../hooks/useSimulationState';
import { motion } from 'framer-motion';
import { Activity, Car } from 'lucide-react';
import clsx from 'clsx';

export function SystemOverview() {
  const { state, isConnected } = useSimulationState();
  
  const vList = Object.values(state.vehicles);
  const sList = Object.values(state.stations);
  
  const activeVehicles = vList.filter(v => v.status !== 'waiting' && v.status !== 'stranded').length;
  
  const totalChargers = sList.reduce((acc, s) => acc + s.totalChargers, 0);
  const availChargers = sList.reduce((acc, s) => acc + s.availableChargers, 0);
  const usedChargers = totalChargers - availChargers;
  const loadPct = totalChargers > 0 ? (usedChargers / totalChargers) * 100 : 0;
  
  return (
    <motion.div 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass-panel p-5 min-w-[300px] flex flex-col gap-4"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">System Status</h2>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className={clsx("w-2 h-2 rounded-full", isConnected ? "bg-green-500 animate-pulse" : "bg-red-500")} />
          {isConnected ? "LIVE" : "CONNECTING..."}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-white/60 text-xs uppercase">
            <Car size={14} /> Active Vehicles
          </div>
          <div className="text-3xl font-light">{activeVehicles}</div>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-white/60 text-xs uppercase">
            <Activity size={14} /> Grid Load
          </div>
          <div className="text-3xl font-light">
            {loadPct.toFixed(0)}<span className="text-lg text-white/40">%</span>
          </div>
        </div>
      </div>

      <div className="w-full bg-dark-900 rounded-full h-1.5 mt-2 overflow-hidden border border-white/5">
        <div 
          className={clsx(
            "h-full transition-all duration-1000",
            loadPct > 80 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" : 
            loadPct > 50 ? "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]" : 
            "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"
          )}
          style={{ width: `${loadPct}%` }}
        />
      </div>
    </motion.div>
  );
}
