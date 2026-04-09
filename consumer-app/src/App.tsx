import { MobileView } from './components/MobileView';

function App() {
  return (
    <div className="w-screen h-screen bg-black/90 flex justify-center items-center overflow-hidden font-sans">
      {/* Mobile Simulator Container */}
      <div className="w-full max-w-[400px] h-full sm:h-[85dvh] sm:rounded-3xl bg-dark-900 shadow-2xl relative overflow-hidden flex flex-col border sm:border-gray-800">
        <MobileView />
      </div>
    </div>
  );
}

export default App;
