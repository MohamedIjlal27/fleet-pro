import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createVehicleMarkerElement } from '../../../utils/map/vehicle_icon';

interface MapWithPulsatingMarkerProps {
  latitude: number;
  longitude: number;
  zoom?: number;
}

const MapWithPulsatingMarker: React.FC<MapWithPulsatingMarkerProps> = ({
  latitude,
  longitude,
  zoom = 12,
}) => {
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (mapContainer && !map) {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

      try {
        const mapInstance = new mapboxgl.Map({
          container: mapContainer,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [longitude, latitude],
          zoom: zoom,
          attributionControl: false,
        });

        const markerInstance = new mapboxgl.Marker(createVehicleMarkerElement())
          .setLngLat([longitude, latitude])
          .addTo(mapInstance);

        setMap(mapInstance);
        setMarker(markerInstance);
      } catch (error) {
        console.error('Error initializing Mapbox:', error);
      }
    }
  }, [mapContainer, map, latitude, longitude, zoom]);

  useEffect(() => {
    if (map && marker) {
      const newPosition: [number, number] = [longitude, latitude];
      marker.setLngLat(newPosition);
      map.jumpTo({ center: newPosition });
    }
  }, [latitude, longitude, map, marker]);

  return (
    <div
      ref={(el) => setMapContainer(el)}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default MapWithPulsatingMarker;
