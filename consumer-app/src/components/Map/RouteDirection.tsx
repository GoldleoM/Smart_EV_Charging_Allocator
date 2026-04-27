import { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

interface RouteDirectionProps {
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  color?: string;
  weight?: number;
}

export function RouteDirection({ origin, destination, color = '#000000ff', weight = 4 }: RouteDirectionProps) {
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
        suppressMarkers: true,
        polylineOptions: { strokeColor: color, strokeWeight: weight }
    });
    
    setDirectionsService(service);
    setDirectionsRenderer(renderer);

    return () => {
      renderer.setMap(null);
    };
  }, [routesLibrary, map, color, weight]);

  // 2. Fetch the Route whenever destination changes (avoid spamming API every tick)
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
      
  }, [directionsService, directionsRenderer, destination?.lat, destination?.lng]);

  return null;
}
