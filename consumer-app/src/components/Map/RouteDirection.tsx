import { useEffect, useRef, useState } from 'react';
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

  // Stable ref so debounced callbacks always read the latest origin
  const originRef = useRef(origin);
  originRef.current = origin;
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // 1. Initialize Service and Renderer once the Maps library is ready
  useEffect(() => {
    if (!routesLibrary || !map) return;

    const service = new routesLibrary.DirectionsService();
    const renderer = new routesLibrary.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: { strokeColor: color, strokeWeight: weight },
    });

    setDirectionsService(service);
    setDirectionsRenderer(renderer);

    return () => {
      renderer.setMap(null);
    };
  }, [routesLibrary, map, color, weight]);

  // 2. Draw route when destination changes (the real auto-route trigger).
  //    Uses a ref for origin so we always draw with the latest location
  //    without adding origin to deps (which would re-fire every simulator tick).
  useEffect(() => {
    if (!directionsService || !directionsRenderer || !destination) return;

    const drawRoute = () => {
      const orig = originRef.current;
      if (!orig) return;
      directionsService
        .route({
          origin: orig,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        })
        .then((response) => directionsRenderer.setDirections(response))
        .catch((e) => console.error('Directions request failed', e));
    };

    // Immediate draw when destination first appears or changes
    drawRoute();

    // Debounced redraw every 3s so the line follows the moving vehicle
    // without hammering the API on every 5-second simulator tick
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setInterval(drawRoute, 3000);

    return () => clearInterval(debounceTimer.current);

  }, [directionsService, directionsRenderer, destination?.lat, destination?.lng]);

  return null;
}
