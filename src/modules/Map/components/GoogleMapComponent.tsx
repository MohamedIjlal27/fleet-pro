import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loadGoogleMaps } from '../../../utils/loadGoogleMaps';
import type { IVehicle, ITrip } from '../../core/interfaces/interfaces';
import { getStatusColor } from '../utils/getStatusColor';
import { getVehicleStatus } from '../utils/getVehicleStatus';

// Extend Window interface to include google
declare global {
  interface Window {
    google: any;
  }
}

interface GoogleMapComponentProps {
  vehicles: IVehicle[];
  selectedVehicle: IVehicle | null;
  onVehicleSelect: (vehicle: IVehicle) => void;
  showRouteHistory: boolean;
  routeHistoryTrips: ITrip[];
  className?: string;
}

export const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  vehicles,
  selectedVehicle,
  onVehicleSelect,
  showRouteHistory,
  routeHistoryTrips,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Map<number, any>>(new Map());
  const routeRenderer = useRef<any>(null);
  const [googleMaps, setGoogleMaps] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps
  useEffect(() => {
    loadGoogleMaps()
      .then((maps) => {
        setGoogleMaps(maps);
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error('Failed to load Google Maps:', error);
      });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !googleMaps || !mapRef.current || mapInstance.current) return;

    // Default center (Toronto)
    const defaultCenter = { lat: 43.6532, lng: -79.3832 };
    
    mapInstance.current = new googleMaps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 12,
      mapTypeId: googleMaps.MapTypeId.ROADMAP,
      streetViewControl: true,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: true,
    });

    // Initialize DirectionsRenderer for route history
    routeRenderer.current = new googleMaps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#2563eb',
        strokeOpacity: 0.8,
        strokeWeight: 4,
      },
    });
  }, [isLoaded, googleMaps]);

  // Create vehicle marker icon
  const createVehicleMarkerIcon = useCallback((vehicle: IVehicle) => {
    if (!googleMaps) return null;

    const status = getVehicleStatus(vehicle.device?.ignition, vehicle.device?.movement);
    const color = getStatusColor(status);
    
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="${color}" stroke="white" stroke-width="2"/>
          <text x="16" y="20" text-anchor="middle" fill="white" font-size="8" font-weight="bold">
            ${vehicle.entityType === 'Vehicle' ? 'V' : 'A'}
          </text>
        </svg>
      `)}`,
      scaledSize: new googleMaps.Size(32, 32),
      anchor: new googleMaps.Point(16, 16),
    };
  }, [googleMaps]);

  // Update vehicle markers
  useEffect(() => {
    if (!mapInstance.current || !googleMaps || !isLoaded) return;

         // Clear existing markers
     for (const marker of markersRef.current.values()) {
       marker.setMap(null);
     }
     markersRef.current.clear();

    // Add markers for each vehicle
    vehicles.forEach((vehicle) => {
      if (!vehicle.device?.latitude || !vehicle.device?.longitude) return;

      const marker = new googleMaps.Marker({
        position: {
          lat: vehicle.device.latitude,
          lng: vehicle.device.longitude,
        },
        map: mapInstance.current,
        title: `${vehicle.make} ${vehicle.model} - ${vehicle.plateNumber}`,
        icon: createVehicleMarkerIcon(vehicle),
      });

      // Create info window
      const infoWindow = new googleMaps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h4 style="margin: 0 0 8px 0; color: #1f2937;">${vehicle.make} ${vehicle.model}</h4>
            <p style="margin: 2px 0; color: #6b7280;"><strong>Plate:</strong> ${vehicle.plateNumber}</p>
            <p style="margin: 2px 0; color: #6b7280;"><strong>Status:</strong> ${getVehicleStatus(vehicle.device?.ignition, vehicle.device?.movement)}</p>
            <p style="margin: 2px 0; color: #6b7280;"><strong>Speed:</strong> ${vehicle.device?.speed || 0} km/h</p>
            <p style="margin: 2px 0; color: #6b7280;"><strong>Fuel:</strong> ${vehicle.device?.fuelLevel || 0}%</p>
            <p style="margin: 2px 0; color: #6b7280;"><strong>Battery:</strong> ${vehicle.device?.battery || 0}%</p>
            ${vehicle.garage ? `<p style="margin: 2px 0; color: #6b7280;"><strong>Garage:</strong> ${vehicle.garage.name}</p>` : ''}
          </div>
        `,
      });

             // Add click listener
       marker.addListener('click', () => {
         // Close other info windows if needed
         infoWindow.open(mapInstance.current, marker);
         onVehicleSelect(vehicle);
       });

      markersRef.current.set(vehicle.id, marker);
    });

    // Fit bounds to show all vehicles
    if (vehicles.length > 0) {
      const bounds = new googleMaps.LatLngBounds();
      vehicles.forEach((vehicle) => {
        if (vehicle.device?.latitude && vehicle.device?.longitude) {
          bounds.extend({
            lat: vehicle.device.latitude,
            lng: vehicle.device.longitude,
          });
        }
      });
      
      if (!bounds.isEmpty()) {
        mapInstance.current!.fitBounds(bounds, { padding: 50 });
      }
    }
  }, [vehicles, googleMaps, isLoaded, createVehicleMarkerIcon, onVehicleSelect]);

  // Handle selected vehicle
  useEffect(() => {
    if (!mapInstance.current || !selectedVehicle?.device) return;

    const { latitude, longitude } = selectedVehicle.device;
    mapInstance.current.setCenter({ lat: latitude, lng: longitude });
    mapInstance.current.setZoom(16);

    // Highlight selected vehicle marker
    const selectedMarker = markersRef.current.get(selectedVehicle.id);
    if (selectedMarker) {
      selectedMarker.setAnimation(googleMaps.Animation.BOUNCE);
      setTimeout(() => {
        selectedMarker.setAnimation(null);
      }, 2000);
    }
  }, [selectedVehicle, googleMaps]);

  // Handle route history
  useEffect(() => {
    if (!mapInstance.current || !googleMaps || !routeRenderer.current) return;

    if (showRouteHistory && routeHistoryTrips.length > 0) {
      // Show route for the first trip with valid positions
      const tripWithRoute = routeHistoryTrips.find(
        (trip) => trip.position && trip.position.length > 1
      );

      if (tripWithRoute && tripWithRoute.position.length > 1) {
        const directionsService = new googleMaps.DirectionsService();
        
        const waypoints = tripWithRoute.position.slice(1, -1).map((pos) => ({
          location: { lat: pos.latitude, lng: pos.longitude },
          stopover: false,
        }));

        const request = {
          origin: {
            lat: tripWithRoute.position[0].latitude,
            lng: tripWithRoute.position[0].longitude,
          },
          destination: {
            lat: tripWithRoute.position[tripWithRoute.position.length - 1].latitude,
            lng: tripWithRoute.position[tripWithRoute.position.length - 1].longitude,
          },
          waypoints: waypoints.slice(0, 8), // Google Maps allows max 8 waypoints for free tier
          travelMode: googleMaps.TravelMode.DRIVING,
        };

        directionsService.route(request, (result: any, status: any) => {
          if (status === googleMaps.DirectionsStatus.OK) {
            routeRenderer.current!.setDirections(result);
            routeRenderer.current!.setMap(mapInstance.current);
          } else {
            console.error('Directions request failed:', status);
            // Fallback: draw simple polyline
            drawSimplePolyline(tripWithRoute.position);
          }
        });
      }
    } else {
      // Hide route
      routeRenderer.current.setMap(null);
    }
  }, [showRouteHistory, routeHistoryTrips, googleMaps]);

  // Fallback method to draw simple polyline
  const drawSimplePolyline = (positions: any[]) => {
    if (!mapInstance.current || !googleMaps) return;

    const path = positions.map((pos) => ({
      lat: pos.latitude,
      lng: pos.longitude,
    }));

    const polyline = new googleMaps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#2563eb',
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });

    polyline.setMap(mapInstance.current);
  };

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
    </div>
  );
};

export default GoogleMapComponent; 