import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { useState, useEffect } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../../lib/firebase';
import { useSimulationState } from '../../hooks/useSimulationState';
import { StationMarker } from './StationMarker';
import { VehicleMarker } from './VehicleMarker';
import { RouteDirection } from './RouteDirection';

// Dark map style for Smart City aesthetic
const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export function LiveMap() {
  const { state } = useSimulationState();
  const { stations, vehicles } = state;
  const [deviceLoc, setDeviceLoc] = useState<{lat: number, lng: number} | null>(null);

  // Fetch real user device location and update the backend
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setDeviceLoc(loc);
          // Patch the actual real-time location to the backend database so the global simulation stays in sync!
          update(ref(db, `vehicles/manual_user_999`), { location: loc }).catch(console.error);
        },
        (err) => {
          console.warn("Geolocation error/blocked. Using fallback location (Delhi).", err);
          // Hackathon Demo Fallback: Delhi, India
          const fallbackLoc = { lat: 28.6139, lng: 77.2090 };
          setDeviceLoc(fallbackLoc);
          update(ref(db, `vehicles/manual_user_999`), { location: fallbackLoc }).catch(console.error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const userVehicle = vehicles?.['manual_user_999'];
  const targetStation = userVehicle?.targetStationId ? stations?.[userVehicle.targetStationId] : null;

  const activeOrigin = userVehicle?.location || deviceLoc;

  return (
    <div className="absolute inset-0 w-full h-full bg-dark-900 z-0">
      <APIProvider apiKey={apiKey}>
        <Map
          style={{ width: '100%', height: '100%' }}
          defaultCenter={{ lat: 28.6139, lng: 77.2090 }}
          defaultZoom={12}
          mapId={mapId}
          disableDefaultUI={true}
          gestureHandling={'greedy'}
        >
          {stations && Object.entries(stations).map(([stationId, station]) => {
            const queueLength = vehicles ? Object.values(vehicles).filter((v: any) => v.targetStationId === stationId && (v.status === "RESERVED" || v.status === "waiting")).length : 0;
            return <StationMarker key={stationId} station={station} queueLength={queueLength} />;
          })}

          {/* Show simulation vehicles */}
          {vehicles && Object.entries(vehicles).map(([vId, vehicle]) => {
            const targetName = stations?.[vehicle.targetStationId]?.name || "Unknown Station";
            return <VehicleMarker key={vId} vehicle={vehicle} targetStationName={targetName} />;
          })}

          {/* Always show Current Device Location / Origin marker (NEVER removed on reset) */}
          {activeOrigin && (
            <AdvancedMarker position={activeOrigin}>
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-bold text-white bg-blue-600 px-1.5 py-0.5 rounded shadow-lg mb-1 whitespace-nowrap border border-blue-400">YOU</div>
                <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
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
