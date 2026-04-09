import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { useSimulationState } from '../../hooks/useSimulationState';
import { StationMarker } from './StationMarker';
import { VehicleMarker } from './VehicleMarker';

// Dark map style for Smart City aesthetic
const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export function LiveMap() {
  const { state } = useSimulationState();
  const { stations, vehicles } = state;

  return (
    <div className="absolute inset-0 w-full h-full bg-dark-900 z-0">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: 40.75, lng: -73.98 }}
          defaultZoom={12}
          mapId={mapId}
          disableDefaultUI={true}
          gestureHandling={'greedy'}
        >
          {Object.entries(stations).map(([stationId, station]) => {
            const queueLength = Object.values(vehicles).filter((v: any) => v.targetStationId === stationId && (v.status === "RESERVED" || v.status === "waiting")).length;
            return <StationMarker key={stationId} station={station} queueLength={queueLength} />;
          })}

          {Object.entries(vehicles).map(([vId, vehicle]) => {
            const targetName = stations[vehicle.targetStationId]?.name || "Unknown Station";
            return <VehicleMarker key={vId} vehicle={vehicle} targetStationName={targetName} />;
          })}
        </Map>
      </APIProvider>
    </div>
  );
}
