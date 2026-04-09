import { LiveMap } from './components/Map/LiveMap';
import { SystemOverview } from './components/Panels/SystemOverview';
import { StationSummary } from './components/Panels/StationSummary';
import { VehicleQueue } from './components/Panels/VehicleQueue';
import { DemoBar } from './components/Controls/DemoBar';

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-dark-900 font-sans text-white">
      {/* Visual background map layer */}
      <LiveMap />

      {/* Interactive overlays container */}
      <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
        
        {/* TOP ROW */}
        <div className="flex justify-between items-start pointer-events-auto">
          <SystemOverview />
          <StationSummary />
        </div>

        {/* BOTTOM ROW */}
        <div className="flex justify-between items-end">
          <div className="pointer-events-auto">
            <VehicleQueue />
          </div>

          {/* Centered Demo Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
            <DemoBar />
          </div>
          
          <div className="w-[350px] opacity-0 pointer-events-none">
            {/* Spacer to balance VehicleQueue on the left, keeping DemoBar perfectly centered */}
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default App;
