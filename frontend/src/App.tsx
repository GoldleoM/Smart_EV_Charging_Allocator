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
      <div className="absolute inset-0 z-10 pointer-events-none">
        
        {/* Left Column Stack */}
        <div className="absolute top-6 bottom-28 left-6 pointer-events-auto flex flex-col gap-4 w-[350px]">
          <SystemOverview />
          <VehicleQueue />
        </div>
        
        {/* Top Right Stack */}
        <div className="absolute top-6 right-6 pointer-events-auto pb-20">
          <StationSummary />
        </div>

        {/* Bottom Center (Demo Bar) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto w-max max-w-[95vw]">
          <DemoBar />
        </div>
        
      </div>
    </div>
  );
}

export default App;
