import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { MobileView } from './components/MobileView';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-screen h-screen bg-[#09080e] overflow-hidden font-sans">
      {isMobile ? <MobileView /> : <Dashboard />}
    </div>
  );
}

export default App;
