import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { useState, useEffect } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../../lib/firebase';
import { useSimulationState } from '../../hooks/useSimulationState';
import { useAuth } from '../../contexts/AuthContext';
import { StationMarker } from './StationMarker';
import { VehicleMarker } from './VehicleMarker';
import { RouteDirection } from './RouteDirection';

// Dark map style for Smart City aesthetic
const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export function LiveMap() {
  const { state } = useSimulationState();
  const { stations, vehicles } = state;
  const { user } = useAuth();
  const userId = user?.uid || '';
  const [deviceLoc, setDeviceLoc] = useState<{lat: number, lng: number} | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  // Fetch real user device location and update the backend
  useEffect(() => {
    if (!userId) return; // wait until auth is ready
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          let loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          
          // HACKATHON DEMO FIX:
          // The allocator physics engine strictly calculates battery consumption based on distance.
          // If the real user is in another country, distance is huge, and no station will be eligible,
          // causing Auto-Route to silently fail. We clamp them to the New Delhi demo area if they are far away.
          const dist = Math.sqrt(Math.pow(loc.lat - 28.6139, 2) + Math.pow(loc.lng - 77.2090, 2));
          if (dist > 5) {
            console.log("User is outside demo area, snapping to New Delhi for simulation.");
            loc = { lat: 28.6139, lng: 77.2090 };
          }

          setDeviceLoc(loc);
          // Patch the actual real-time location to the backend database so the global simulation stays in sync!
          update(ref(db, `vehicles/${userId}`), { location: loc }).catch(console.error);
        },
        () => {
          // Suppressed console.warn to keep the console clean during demos.
          // Geolocation is blocked by the browser, so we silently use the NYC fallback.
          // Hackathon Demo Fallback: Connaught Place, New Delhi
          const fallbackLoc = { lat: 28.6139, lng: 77.2090 };
          setDeviceLoc(fallbackLoc);
          update(ref(db, `vehicles/${userId}`), { location: fallbackLoc }).catch(console.error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, [userId]);

  const userVehicle = vehicles?.[userId];
  const targetStation = userVehicle?.targetStationId ? stations?.[userVehicle.targetStationId] : null;

  const activeOrigin = userVehicle?.location || deviceLoc;

  useEffect(() => {
    if (userVehicle?.targetStationId) {
      setSelectedStationId(userVehicle.targetStationId);
    }
  }, [userVehicle?.targetStationId]);

  return (
    <div className="absolute inset-0 w-full h-full bg-dark-900 z-0">
      <APIProvider apiKey={apiKey}>
        <Map
          style={{ width: '100%', height: '100%' }}
          defaultCenter={{ lat: 28.61, lng: 77.21 }}
          defaultZoom={12}
          mapId={mapId}
          disableDefaultUI={true}
          gestureHandling={'greedy'}
          clickableIcons={false}
        >
          {stations && Object.entries(stations).map(([stationId, station]) => {
            const queueLength = vehicles ? Object.values(vehicles).filter((v: any) => v.targetStationId === stationId && (v.status === "RESERVED" || v.status === "waiting")).length : 0;
            return (
              <StationMarker
                key={stationId}
                station={station}
                queueLength={queueLength}
                isSelected={selectedStationId === stationId}
                onToggle={() => setSelectedStationId((current) => current === stationId ? null : stationId)}
              />
            );
          })}

          {/* Show simulation vehicles */}
          {vehicles && Object.entries(vehicles).map(([vId, vehicle]) => {
            const targetName = stations?.[vehicle.targetStationId]?.name || "Unknown Station";
            return <VehicleMarker key={vId} vehicle={vehicle} targetStationName={targetName} currentUserId={userId} />;
          })}

          {/* Always show Current Device Location / Origin marker (NEVER removed on reset) */}
          {activeOrigin && (
            <AdvancedMarker position={activeOrigin}>
              <div className="flex flex-col items-center">
                <div className="text-[11px] font-black text-black bg-yellow-400 px-2 py-0.5 rounded-full shadow-lg mb-1.5 whitespace-nowrap border-2 border-yellow-200 tracking-widest">YOU</div>
                <div className="w-8 h-8 bg-yellow-400 rounded-full border-2 border-yellow-200 shadow-[0_0_24px_rgba(250,204,21,0.9)] animate-pulse flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full shadow-inner"></div>
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* ONLY show Route when a target is selected! (Removed on reset) */}
          {targetStation && activeOrigin && (
            <RouteDirection
              origin={activeOrigin}
              destination={targetStation.location}
            />
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
