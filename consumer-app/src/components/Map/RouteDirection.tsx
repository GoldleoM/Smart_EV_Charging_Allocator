import { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

interface RouteDirectionProps {
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  color?: string;
  weight?: number;
}

export function RouteDirection({ origin, destination, color = '#a855f7', weight = 4 }: RouteDirectionProps) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();

  // 1. Initialize the Service and Renderer
  useEffect(() => {
    if (!routesLibrary || !map) return;
    
    const service = new routesLibrary.DirectionsService();
    const renderer = new routesLibrary.DirectionsRenderer({ 
        map, 
        // Disable default A/B markers so our custom "YOU" and Station markers act as the start/end points
        suppressMarkers: true
    });
    
    setDirectionsService(service);
    setDirectionsRenderer(renderer);

    // Cleanup: erase route whenever component unmounts (e.g. End Session)
    return () => {
      renderer.setMap(null);
    };
  }, [routesLibrary, map]);

  // 2. Fetch the Route whenever origin or destination changes
  useEffect(() => {
    if (!directionsService || !directionsRenderer || !origin || !destination) return;

    directionsService
      .route({
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      })
      .then((response) => {
        directionsRenderer.setDirections(response);
      })
      .catch((e) => console.error("Directions request failed", e));
      
    // Remove the aggressive cleanup here so the route doesn't vanish mid-simulation.
    // Instead, the DirectionsRenderer will clear the old route automatically when setDirections is called again.
  }, [directionsService, directionsRenderer, origin?.lat, origin?.lng, destination?.lat, destination?.lng]);

  return null;
}
