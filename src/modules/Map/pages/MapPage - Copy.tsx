import React, { useEffect, useRef, useState, useCallback } from 'react';
import PageMeta from '@/components/common/PageMeta';
import ReactDOM from 'react-dom';
import * as turf from '@turf/turf';
import mapboxgl from 'mapbox-gl';
import { getRouteHistory, getVehiclesWithDeviceData } from '../apis/apis';
import { fetchAlert } from '../../core/apis/apis';
import VehicleDetails from '../components/VehicleDetails';
import {
  IVehicle,
  ITrip,
  IRouteHistoryData,
  IEvent,
} from '../../core/interfaces/interfaces';

import { INotification } from '../../core/interfaces/interfaces';
import socketService from '../../../Socket';
import { useVehicleLocationUpdates } from '../hooks/useVehicleLocationUpdates';
import { createMarkerElement } from '../../../utils/map/pulsating_dot';
import Button from '../../core/components/ThemeButton';
import VehicleItems from '../components/VehicleItems';
import {
  Commute,
  DirectionsCar as DirectionsCarIcon,
  FormatListBulleted,
  Inventory,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  Public,
  Timeline,
  Tune,
} from '@mui/icons-material';
import StreamIcon from '@mui/icons-material/Stream';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box } from '@mui/material';
import { toast } from 'react-toastify';
import DirectionArrow from '../../../assets/maps/direction_arrow.png';
import EventPopup from '../components/EventPopup';
import red_alert from '/src/assets/maps/red_alert.png';
import yellow_alert from '/src/assets/maps/yellow_alert.png';
import green_alert from '/src/assets/maps/green_alert.png';
import { useParams } from 'react-router';
import { systemPlan, systemModule } from '@/utils/constants';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from '@/modules/core/pages/Error404Page';
import LockedFeature from '@/modules/core/components/LockedFeature';
import ReactDOMServer from 'react-dom/server';
import {
  BarChart2,
  BatteryMedium,
  Boxes,
  BoxIcon,
  Car,
  Caravan,
  Clock,
  Earth,
  List,
  Locate,
  MapPin,
  Navigation,
  Search,
  Truck,
  User,
  X,
} from 'lucide-react';
import fleetVehicleIcon from '@/icons/fleet-vehicle.svg';
import fleetAssetIcon from '@/icons/fleet-asset.svg';
import VehicleItemMobile from '../components/VehicleItemMobile';
import { VehicleItemMobileSkeletonList } from '../components/VehicleItemMobileSkeleton';
import VehicleDetailsMobile from '../components/vehicleDetailsMobile';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export const MapPage: React.FC = () => {
  if (!checkModuleExists(systemModule.Map)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Map" />
    ) : (
      <Error404Page />
    );
  }
  const isAiDashcamModuleAvailable = checkModuleExists(
    systemModule.MapAIDashCam
  );

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [routeHistoryData, setRouteHistoryData] =
    useState<IRouteHistoryData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<IVehicle | null>(null);
  const [selectedTrips, setSelectedTrips] = useState<ITrip[]>([]);
  const [showRouteHistory, setShowRouteHistory] = useState<boolean>(false);
  const [mapLoading, setMapLoading] = useState(true);
  // for event marker
  const [curretnEvents, setCurretnEvents] = useState<IEvent[]>([]);
  const eventMarkersRef = useRef<Record<string, mapboxgl.Marker>>({});
  //for uniqlo trip color
  const [tripLayers, setTripLayers] = useState<
    { sourceId: string; layerId: string }[]
  >([]);

  const [viewMode, setViewMode] = useState<'listView' | 'mapView'>('listView');

  //for alert and alert email
  const { alertId } = useParams<{ alertId: string }>();
  const [alert, setAlert] = useState<INotification>();
  const [vehiclesLoaded, setVehiclesLoaded] = useState(false);

  // Function to reset or remove all layers and sources
  const clearAllTripsRouteOnMap = (map: mapboxgl.Map) => {
    if (map.getLayer('start')) map.removeLayer('start');
    if (map.getSource('start')) map.removeSource('start');
    if (map.getLayer('destination')) map.removeLayer('destination');
    if (map.getSource('destination')) map.removeSource('destination');
    if (map.getLayer('route')) map.removeLayer('route');
    if (map.getSource('route')) map.removeSource('route');
    if (map.getLayer('route-arrows')) map.removeLayer('route-arrows');
    if (map.getSource('directions')) map.removeSource('directions');

    tripLayers.forEach(({ sourceId, layerId }) => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    });
    tripLayers.length = 0;
    // Clear the state of trip layout
    setTripLayers([]);

    // Clear the state of event marker
    setCurretnEvents([]);
    Object.values(eventMarkersRef.current).forEach((marker) => marker.remove());
    eventMarkersRef.current = {}; // Reset the event markers reference
  };

  const getStatusColor = (status: string) => {
    if (!status) return '#adb5bd'; // N/A - light gray

    switch (status.toLowerCase()) {
      case 'active':
        return '#198754'; // green
      case 'idle':
        return '#ffc107'; // yellow
      case 'maintenance':
        return '#dc3545'; // red
      case 'charging':
        return '#0dcaf0'; // blue
      case 'off':
        return '#6c757d'; // gray
      case 'parking':
        return '#6c757d'; // gray
      case 'idling':
        return '#ffc107'; // yellow
      case 'driving':
        return '#198754'; // green
      default:
        return '#adb5bd'; // light gray for unknown
    }
  };

  const createVehicleElement = (
    vehicleStatus: string,
    color: string,
    heading: number | null,
    entityType: string = 'vehicle'
  ) => {
    // Outer container for marker + pointer
    const container = document.createElement('div');
    container.style.width = '40px';
    container.style.height = '40px';
    container.style.position = 'absolute'; // Map will use this as the anchor
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';

    // Inner circle marker (radar + icon)
    const markerElement = document.createElement('div');
    markerElement.style.width = '25px';
    markerElement.style.height = '25px';
    markerElement.style.backgroundColor = color;
    markerElement.style.borderRadius = '50%';
    markerElement.style.display = 'flex';
    markerElement.style.justifyContent = 'center';
    markerElement.style.alignItems = 'center';
    markerElement.style.position = 'relative'; // relative to allow absolute child
    markerElement.className = 'marker-element';

    let iconSrc = fleetVehicleIcon;
    if (entityType === 'asset') {
      iconSrc = fleetAssetIcon;
    }

    const iconWrapper = document.createElement('div');
    iconWrapper.innerHTML = `<img src="${iconSrc}" width="18" height="18" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%)" />`;
    const iconElement = iconWrapper.firstChild as HTMLImageElement;
    iconElement.style.position = 'absolute';
    iconElement.style.top = '50%';
    iconElement.style.left = '50%';
    iconElement.style.transform = 'translate(-50%, -50%)';

    // Radar wrapper
    const radarWrapper = document.createElement('div');
    radarWrapper.style.position = 'absolute';
    radarWrapper.style.top = '0';
    radarWrapper.style.left = '0';
    radarWrapper.style.width = '100%';
    radarWrapper.style.height = '100%';
    radarWrapper.style.borderRadius = '50%';

    const radarScan = document.createElement('div');
    radarScan.style.position = 'absolute';
    radarScan.style.top = '0';
    radarScan.style.left = '0';
    radarScan.style.width = '100%';
    radarScan.style.height = '100%';
    radarScan.style.borderRadius = '50%';

    const animationName = `pulse-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;
    radarScan.style.animation = `${animationName} 2s infinite`;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes ${animationName} {
        0% {
          transform: scale(1);
          box-shadow: 0 0 0 0 ${color}B3;
        }
        70% {
          transform: scale(1.1);
          box-shadow: 0 0 0 15px ${color}00;
        }
        100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 ${color}00;
        }
      }
    `;
    document.head.appendChild(style);

    // Append radar + icon into circle
    radarWrapper.appendChild(radarScan);
    radarWrapper.appendChild(iconElement);
    markerElement.appendChild(radarWrapper);

    // Pointer arrow outside the circle
    const pointerWrapper = document.createElement('div');
    pointerWrapper.style.position = 'absolute';
    pointerWrapper.style.width = '100%';
    pointerWrapper.style.height = '100%';
    pointerWrapper.style.top = '0';
    pointerWrapper.style.left = '0';
    pointerWrapper.style.transform = `rotate(${heading ?? 0}deg)`;
    pointerWrapper.style.transformOrigin = '50% 50%';
    pointerWrapper.style.display =
      vehicleStatus === 'driving' ? 'block' : 'none';
    pointerWrapper.className = 'pointer-wrapper';

    const pointer = document.createElement('div');
    pointer.style.position = 'absolute';
    pointer.style.top = '-5px'; // push it further from the center (adjust this as needed)
    pointer.style.left = '50%';
    pointer.style.transform = 'translateX(-50%)';
    pointer.style.width = '0';
    pointer.style.height = '0';
    pointer.style.borderLeft = '5px solid transparent';
    pointer.style.borderRight = '5px solid transparent';
    pointer.style.borderBottom = `10px solid ${color}`;
    pointer.className = 'pointer-arrow';

    pointerWrapper.appendChild(pointer);
    container.appendChild(pointerWrapper);

    // Append marker to outer container
    container.appendChild(markerElement);

    return container; // this is what gets added to the map
  };

  // Function to handle live location updates
  const updateVehicleMarkerOnWebSocket = useCallback(
    (data: {
      deviceId: string | number;
      latitude: number;
      longitude: number;
      battery?: number;
      batteryVoltage?: number;
      deviceName?: string;
      direction?: number;
      externalPowerVoltage?: number;
      gsmSignal?: number;
      ignition?: boolean;
      mileage?: number;
      movement?: boolean;
      satellites?: number;
      speed?: number;
      timestamp?: number;
    }) => {
      // console.log('Received live location update:', data);
      const deviceIdStr = data.deviceId.toString();

      const existingMarker = markersRef.current[deviceIdStr];

      const vehicle = vehicles.find(
        (vehicle) => vehicle.device?.deviceId.toString() === deviceIdStr
      );

      let vehicleStatus = 'parking';
      if (vehicle?.device?.ignition === true && vehicle.device?.movement) {
        vehicleStatus = 'driving';
      } else if (
        vehicle?.device?.ignition === true &&
        !vehicle.device?.movement
      ) {
        vehicleStatus = 'idling';
      }
      const markerColor = getStatusColor(vehicleStatus);

      const heading = data.direction ?? 0;

      if (existingMarker) {
        existingMarker.setLngLat([data.longitude, data.latitude]);

        const el = existingMarker.getElement();

        // Update marker color
        const markerEl = el.querySelector('.marker-element') as HTMLDivElement;
        if (markerEl) {
          markerEl.style.backgroundColor = markerColor;
        }

        // Update arrow direction
        const pointerWrapper = el.querySelector(
          '.pointer-wrapper'
        ) as HTMLDivElement;
        if (pointerWrapper) {
          pointerWrapper.style.transform = `rotate(${heading}deg)`;
          pointerWrapper.style.display =
            vehicleStatus === 'driving' ? 'block' : 'none';
        }

        // Update arrow color
        const pointer = el.querySelector('.pointer-arrow') as HTMLDivElement;
        if (pointer) {
          pointer.style.borderBottomColor = markerColor;
        }

        const popup = existingMarker.getPopup();

        if (popup) {
          const vehicle = vehicles.find(
            (vehicle) => vehicle.device?.deviceId.toString() === deviceIdStr
          );
          popup.setHTML(`
          <div>
          <h3>${vehicle!.plateNumber}</h3>
            <h3>Device ID: ${data.deviceId}</h3>
            <p>Latitude: ${data.latitude}</p>
            <p>Longitude: ${data.longitude}</p>
            <p>Driver: ${
              vehicle?.currentAssignedDriver &&
              typeof vehicle.currentAssignedDriver === 'object' &&
              Object.keys(vehicle.currentAssignedDriver).length > 0
                ? `${vehicle.currentAssignedDriver.firstName ?? ''} ${
                    vehicle.currentAssignedDriver.lastName ?? ''
                  }`
                : 'No driver assigned'
            }</p>
          </div>
        `);
        }
      } else {
        if (vehicle && mapRef.current) {
          const arrowElement = createVehicleElement(
            vehicleStatus,
            markerColor,
            heading,
            vehicle.entityType
          );
          const marker = new mapboxgl.Marker(arrowElement)
            .setLngLat([data.longitude, data.latitude])
            .addTo(mapRef.current!);
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div>
          <h3>${vehicle.plateNumber}</h3>
          <p>Device ID: ${vehicle.device?.deviceId}</p>
          <p>Latitude: ${data.latitude}</p>
          <p>Longitude: ${data.longitude}</p>
          <p>Driver: ${
            vehicle?.currentAssignedDriver &&
            typeof vehicle.currentAssignedDriver === 'object' &&
            Object.keys(vehicle.currentAssignedDriver).length > 0
              ? `${vehicle.currentAssignedDriver.firstName ?? ''} ${
                  vehicle.currentAssignedDriver.lastName ?? ''
                }`
              : 'No driver assigned'
          }</p>
        </div>
      `);

          marker.setPopup(popup);
          markersRef.current[deviceIdStr] = marker;
        }
      }
    },
    [vehicles]
  );

  useVehicleLocationUpdates(vehicles, updateVehicleMarkerOnWebSocket);

  const initMap = () => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
    });

    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.FullscreenControl());

    setMap(map);
    mapRef.current = map;

    const loadMapData = () => {
      setIsLoadingVehicles(true);
      getVehiclesWithDeviceData().then((data: IVehicle[]) => {
        setVehicles(data);
        setVehiclesLoaded(true);

        const validVehicles = data.filter(
          (vehicle) =>
            vehicle.device &&
            typeof vehicle.device.latitude === 'number' &&
            typeof vehicle.device.longitude === 'number' &&
            !isNaN(vehicle.device.latitude) &&
            !isNaN(vehicle.device.longitude)
        );

        const deviceIds = validVehicles.map((vehicle) =>
          vehicle.device!.deviceId.toString()
        );
        socketService.subscribeTodevicesLocationUpdates(deviceIds);

        const vehicleCoordinates = validVehicles.map((vehicle) => [
          vehicle.device!.longitude,
          vehicle.device!.latitude,
        ]);

        if (vehicleCoordinates.length > 0) {
          const bounds = turf.bbox(
            turf.featureCollection(
              vehicleCoordinates.map((coord) => turf.point(coord))
            )
          );

          map.fitBounds(
            [
              [bounds[0], bounds[1]],
              [bounds[2], bounds[3]],
            ],
            { padding: 50 }
          );
        }

        // Clear existing markers
        for (const deviceId in markersRef.current) {
          markersRef.current[deviceId].remove();
        }
        markersRef.current = {};

        validVehicles.forEach((vehicle) => {
          const deviceIdStr = vehicle.device.deviceId.toString();

          const coordinates: [number, number] = [
            vehicle.device.longitude,
            vehicle.device.latitude,
          ];

          let vehicleStatus = 'parking';
          if (vehicle?.device?.ignition === true && vehicle.device?.movement) {
            vehicleStatus = 'driving';
          } else if (
            vehicle?.device?.ignition === true &&
            !vehicle.device?.movement
          ) {
            vehicleStatus = 'idling';
          }
          const markerColor = getStatusColor(vehicleStatus);

          // Create a custom marker with rotation for heading (using an image or CSS)
          const createVehicleMarker = (
            color: string,
            heading: number | null
          ) => {
            const markerElement = createVehicleElement(
              vehicleStatus,
              color,
              heading,
              vehicle.entityType
            );
            return new mapboxgl.Marker(markerElement)
              .setLngLat(coordinates)
              .addTo(map);
          };

          const marker = createVehicleMarker(
            markerColor,
            vehicle.device.direction
          );

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div>
              <h3>${vehicle.plateNumber}</h3>
              <p>Device ID: ${vehicle.device?.deviceId}</p>
              <p>Latitude: ${vehicle.device?.latitude}</p>
              <p>Longitude: ${vehicle.device?.longitude}</p>
              <p>Driver: ${
                vehicle?.currentAssignedDriver &&
                typeof vehicle.currentAssignedDriver === 'object' &&
                Object.keys(vehicle.currentAssignedDriver).length > 0
                  ? `${vehicle.currentAssignedDriver.firstName ?? ''} ${
                      vehicle.currentAssignedDriver.lastName ?? ''
                    }`
                  : 'No driver assigned'
              }</p>
            </div>
          `);

          marker.setPopup(popup);
          markersRef.current[deviceIdStr] = marker;
        });

        setIsLoadingVehicles(false);
      });
    };

    map.on('load', loadMapData);
    setMapLoading(false);

    // Reload map data every 30 seconds
    //const intervalId = setInterval(loadMapData, 30000);

    return () => {
      //clearInterval(intervalId);
      //map.remove();
    };
  };

  useEffect(() => {
    initMap();
    const timer = setTimeout(() => {
      setMapLoading(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, [viewMode]);

  useEffect(() => {
    // This effect runs whenever sidebar state changes
    if (mapRef.current) {
      // Allow DOM to update first
      setTimeout(() => {
        mapRef.current!.resize();

        // After resize, if we're in gods view (no vehicle selected), recalculate bounds
        if (!selectedVehicle && vehicles.length > 0) {
          const vehicleCoordinates = vehicles
            .filter(
              (vehicle) =>
                vehicle.device &&
                typeof vehicle.device.longitude === 'number' &&
                typeof vehicle.device.latitude === 'number' &&
                !isNaN(vehicle.device.longitude) &&
                !isNaN(vehicle.device.latitude)
            )
            .map((vehicle) => [
              vehicle.device!.longitude,
              vehicle.device!.latitude,
            ]);

          if (vehicleCoordinates.length > 0) {
            const bounds = turf.bbox(
              turf.featureCollection(
                vehicleCoordinates.map((coord) => turf.point(coord))
              )
            );

            mapRef.current.fitBounds(
              [
                [bounds[0], bounds[1]],
                [bounds[2], bounds[3]],
              ],
              { padding: 50 }
            );
          }
        }
      }, 100);
    }
  }, [isSidebarOpen, vehicles, selectedVehicle]);

  useEffect(() => {
    if (vehiclesLoaded) {
      loadAlert();
    }
  }, [alertId, vehiclesLoaded]);

  const loadAlert = async () => {
    if (!isSidebarOpen) {
      toggleSidebar();
    }
    if (alertId) {
      const res = await fetchAlert(alertId);
      setAlert(res);
      console.log(`alertId ID is ${alertId} res =`, res);
      console.log(`alertId vehicles =`, vehicles);
      if (res) {
        const foundVehicle = vehicles.find(
          (vehicle) => vehicle.id === Number(res.metadata.map.vehicle)
        );
        console.log(`alertId foundVehicle ID is =`, foundVehicle);
        if (foundVehicle) {
          await handleVehicleClick(foundVehicle);
        } else {
          console.warn(
            'Vehicle not found for vehicle ID:',
            res.metadata.map.vehicle
          );
        }
      }
    }
  };

  useEffect(() => {
    if (map && selectedVehicle && selectedVehicle.device) {
      const vehicleCoordinates: [number, number] = [
        selectedVehicle.device.longitude,
        selectedVehicle.device.latitude,
      ];

      if (map.isStyleLoaded()) {
        map.setCenter(vehicleCoordinates);
        map.setZoom(14);

        markDeviceOnMap(mapRef, selectedVehicle);
      }
    }
  }, [map, selectedVehicle]);

  useEffect(() => {
    if (map && selectedVehicle && selectedVehicle.device) {
      const vehicleCoordinates: [number, number] = [
        selectedVehicle.device.longitude,
        selectedVehicle.device.latitude,
      ];

      if (map.isStyleLoaded()) {
        map.setCenter(vehicleCoordinates);
        map.setZoom(14);

        markDeviceOnMap(mapRef, selectedVehicle);
      }
    }
  }, [map, selectedVehicle]);

  useEffect(() => {
    if (map) {
      clearAllTripsRouteOnMap(map);
    }

    if (
      !map ||
      !selectedTrips ||
      !showRouteHistory ||
      selectedTrips.length === 0
    ) {
      return;
    }

    const allPositions = selectedTrips.flatMap((trip) => trip.position);

    if (!allPositions || allPositions.length === 0) return;

    const coordinates: [number, number][] = allPositions.map((pos) => [
      pos.longitude,
      pos.latitude,
    ]);

    console.log('selectedTrips =', selectedTrips);
    console.log('allPositions =', allPositions);

    const drawRouteWithStartAndEndAndMovingArrows = () => {
      if (map && map.isStyleLoaded()) {
        clearAllTripsRouteOnMap(map);

        // Add a new Marker.
        //const marker = new mapboxgl.Marker({
        //  color: '#F84C4C' // color it red
        //});

        // Add Start Point
        map.addSource('start', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: coordinates[0], // First point in the route
            },
            properties: {},
          },
        });

        map.addLayer({
          id: 'start',
          type: 'circle',
          source: 'start',
          paint: {
            'circle-radius': 7,
            'circle-color': '#ffffff',
            'circle-stroke-width': 4,
            'circle-stroke-color': '#88C273', // Green for start
          },
        });

        // Add Destination Point
        map.addSource('destination', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: coordinates[coordinates.length - 1], // Last point in the route
            },
            properties: {},
          },
        });

        map.addLayer({
          id: 'destination',
          type: 'circle',
          source: 'destination',
          paint: {
            'circle-radius': 7,
            'circle-color': '#ffffff',
            'circle-stroke-width': 4,
            'circle-stroke-color': '#FFA27F', // Red for destination
          },
        });

        // we don't use route now replay by trip-source-
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: coordinates,
            },
            properties: {},
          },
        });

        // for the route color
        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#0000FF', // Keep the color as is
            'line-width': 6, // Keep the same width
            'line-opacity': 0, // Set opacity to 0 to make it fully transparent
          },
        });

        // Function to get the icon URL based on the event flag
        const getIconUrlBasedOnFlag = (flag: string): string => {
          // You can map the flag to different icon URLs
          switch (flag) {
            case 'High':
              return red_alert;
            case 'Medium':
              return yellow_alert;
            default:
              return green_alert;
          }
        };

        // Function to create a marker element with custom icon
        const createMarkerElement = (iconUrl: string) => {
          const div = document.createElement('div');
          div.style.backgroundImage = `url(${iconUrl})`;
          div.style.width = '32px'; // Adjust size as needed
          div.style.height = '32px'; // Adjust size as needed
          div.style.backgroundSize = 'cover';
          return div;
        };

        const newTripLayers: { sourceId: string; layerId: string }[] = [];
        console.log(`alert selectedTrips ${alertId}`, selectedTrips);
        selectedTrips.forEach((trip, index) => {
          const tripCoordinates: [number, number][] = trip.position.map(
            (pos) => [pos.longitude, pos.latitude]
          );

          // Create unique IDs
          const tripSourceId = `trip-source-${index}`;
          const tripLayerId = `trip-layer-${index}`;
          const tripColor = `hsl(${(index * 50) % 360}, 70%, 50%)`; // Generate a unique color per trip

          // Add source and layer to the map
          map.addSource(tripSourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: tripCoordinates,
              },
              properties: {},
            },
          });

          map.addLayer({
            id: tripLayerId,
            type: 'line',
            source: tripSourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': tripColor, // Assign the unique color
              'line-width': 4,
              'line-opacity': 0.8,
            },
          });

          // Add IDs to the temporary array
          newTripLayers.push({ sourceId: tripSourceId, layerId: tripLayerId });

          // add alert event marker
          // Check if the trip has any events
          if (
            isAiDashcamModuleAvailable &&
            trip.event &&
            trip.event.length > 0
          ) {
            trip.event.forEach((event) => {
              const markerId = `${event.latitude},${event.longitude}`;

              // Get the icon based on the event flag
              const iconUrl = getIconUrlBasedOnFlag(event.flag); // Function to decide icon URL based on flag

              const marker = new mapboxgl.Marker({
                element: createMarkerElement(iconUrl), // Create custom marker with icon
              })
                .setLngLat([event.longitude, event.latitude])
                .addTo(map);

              // Create a div element to render the React component
              const popupContainer = document.createElement('div');
              // Render the EventPopup component into the popup container
              ReactDOM.render(
                <EventPopup
                  name={event.name}
                  flag={event.flag}
                  media1={event.media1}
                  media2={event.media2}
                  location={`Lat:${event.latitude} Lon:${event.longitude}`}
                />,
                popupContainer
              );

              const popup = new mapboxgl.Popup({
                offset: 25,
                maxWidth: '400px',
              }).setDOMContent(popupContainer); // Set the React component as the popup content

              marker.setPopup(popup);

              // Store marker in eventMarkersRef
              eventMarkersRef.current[markerId] = marker;
            });
          }
        });
        setTripLayers(newTripLayers);

        const pointFeatures: GeoJSON.Feature<GeoJSON.Point>[] =
          allPositions.map((pos) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [pos.longitude, pos.latitude],
            },
            properties: {
              direction: pos.direction,
            },
          }));

        // Add the source for directions
        map.addSource('directions', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: pointFeatures,
          },
        });

        // Add a symbol layer to display the direction arrows
        map.addLayer({
          id: 'route-arrows',
          type: 'symbol',
          source: 'route',
          layout: {
            'symbol-placement': 'line',
            'text-field': '▶',
            'text-size': ['interpolate', ['linear'], ['zoom'], 12, 24, 22, 60],
            'symbol-spacing': [
              'interpolate',
              ['linear'],
              ['zoom'],
              12,
              30,
              22,
              160,
            ],
            'text-keep-upright': false,
          },
          paint: {
            'text-color': '#3887be',
            'text-halo-color': 'hsl(55, 11%, 96%)',
            'text-halo-width': 3,
          },
        });

        const geojson = turf.featureCollection(
          selectedTrips.map((trip) => ({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: trip.position.map((pos) => [
                pos.longitude,
                pos.latitude,
              ]),
            },
            properties: {},
          }))
        );

        const bbox = turf.bbox(geojson);
        map.fitBounds(
          [
            [bbox[0], bbox[1]],
            [bbox[2], bbox[3]],
          ],
          { padding: 50 }
        );
      }
    };
    if (map?.isStyleLoaded()) {
      drawRouteWithStartAndEndAndMovingArrows();
    } else {
      map?.on('load', drawRouteWithStartAndEndAndMovingArrows);
    }

    return () => {
      if (map && map.isStyleLoaded()) {
        clearAllTripsRouteOnMap(map);
      }
    };
  }, [map, selectedTrips, showRouteHistory]);

  const markDeviceOnMap = (
    mapRef: React.RefObject<mapboxgl.Map>,
    selectedVehicle: IVehicle | null = null
  ) => {
    setIsLoadingVehicles(true);
    getVehiclesWithDeviceData().then((data: IVehicle[]) => {
      setVehicles(data);
      setVehiclesLoaded(true);
      if (selectedVehicle) {
        if (!selectedVehicle.device) {
          console.warn(
            `No device data available for vehicle ${selectedVehicle.plateNumber}`
          );
          return;
        }

        let vehicleStatus = 'parking';
        if (
          selectedVehicle.device?.ignition === true &&
          selectedVehicle.device?.movement
        ) {
          vehicleStatus = 'driving';
        } else if (
          selectedVehicle.device?.ignition === true &&
          !selectedVehicle.device?.movement
        ) {
          vehicleStatus = 'idling';
        }
        const markerColor = getStatusColor(vehicleStatus);

        const vehicleCoordinates: [number, number] = [
          selectedVehicle.device.longitude,
          selectedVehicle.device.latitude,
        ];

        Object.values(markersRef.current).forEach((marker) => marker.remove());

        // Create a custom marker with an arrow pointing in the vehicle's heading direction
        const createArrowMarker = (color: string, heading: number | null) => {
          const markerElement = createVehicleElement(
            vehicleStatus,
            color,
            heading,
            selectedVehicle.entityType
          );

          return new mapboxgl.Marker(markerElement)
            .setLngLat(vehicleCoordinates)
            .addTo(mapRef.current!);
        };

        // Create the custom arrow marker
        const actualMarker = createArrowMarker(
          markerColor,
          selectedVehicle.device.direction
        );

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div>
            <h3>${selectedVehicle.plateNumber}</h3>
            <p>Device ID: ${selectedVehicle.device.deviceId}</p>
            <p>Latitude: ${selectedVehicle.device.latitude}</p>
            <p>Longitude: ${selectedVehicle.device.longitude}</p>
            <p>Driver: ${
              selectedVehicle?.currentAssignedDriver &&
              typeof selectedVehicle.currentAssignedDriver === 'object' &&
              Object.keys(selectedVehicle.currentAssignedDriver).length > 0
                ? `${selectedVehicle.currentAssignedDriver.firstName ?? ''} ${
                    selectedVehicle.currentAssignedDriver.lastName ?? ''
                  }`
                : 'No driver assigned'
            }</p>
            <p>Speed: ${selectedVehicle.device.speed}</p>
            <p>Movement: ${selectedVehicle.device.movement}</p>
            <p>Engine Ignition: ${selectedVehicle.device.ignition}</p>
            <p>Battery Voltage: ${selectedVehicle.device.batteryVoltage}</p>
            <p>Mileage: ${selectedVehicle.device.mileage} km</p>
            <p>Vehicle Battery: ${selectedVehicle.device.battery} V</p>
            <p>GSM Signal Level: ${
              selectedVehicle.device.gsmSignal ?? 0
            } dBm</p>
          </div>
        `);

        actualMarker.setPopup(popup);
        markersRef.current[selectedVehicle.device.deviceId] = actualMarker;

        mapRef.current?.setCenter([
          selectedVehicle.device.longitude,
          selectedVehicle.device.latitude,
        ]);
        mapRef.current?.setZoom(14);
        setIsLoadingVehicles(false);
      }
    });
  };

  const handleVehicleClick = (vehicle: IVehicle) => {
    setSelectedVehicle(vehicle);

    socketService.unsubscribeFromDeviceUpdates();

    if (
      mapRef.current &&
      vehicle.device?.longitude &&
      vehicle.device?.latitude
    ) {
      const vehicleCoordinates = [
        vehicle.device.longitude,
        vehicle.device.latitude,
      ];

      const point = turf.point(vehicleCoordinates);

      const bbox = turf.bbox(point);

      mapRef.current.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 14,
        }
      );

      markDeviceOnMap(mapRef, vehicle);

      if (vehicle.device.deviceId) {
        socketService.subscribeToDeviceUpdates(
          vehicle.device.deviceId.toString()
        );

        socketService.onDeviceUpdate((data) => {
          if (vehicle.device && data.deviceId === vehicle.device.deviceId) {
            updateVehicleMarkerOnWebSocket(data);
          }
        });
      }
    } else {
      toast.error('No device data available for this vehicle');
    }

    clearAllTripsRouteOnMap(map);
    setRouteHistoryData({ deviceId: 0, trips: [] });
    setSelectedTrips([]);

    handleDateChange('');
  };

  const handleGodsView = () => {
    setIsSidebarOpen(false);

    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    }, 300);

    clearAllTripsRouteOnMap(mapRef.current);

    Object.values(markersRef.current).forEach((marker) => marker.remove());

    setIsLoadingVehicles(true);
    getVehiclesWithDeviceData().then((data: IVehicle[]) => {
      setVehicles(data);
      setVehiclesLoaded(true);
      const vehicleCoordinates = data
        .filter((vehicle) => vehicle.device)
        .map((vehicle) => [
          vehicle.device!.longitude,
          vehicle.device!.latitude,
        ]);

      if (vehicleCoordinates.length > 0) {
        const bounds = turf.bbox(
          turf.featureCollection(
            vehicleCoordinates.map((coord) => turf.point(coord))
          )
        );
        mapRef.current?.fitBounds(
          [
            [bounds[0], bounds[1]],
            [bounds[2], bounds[3]],
          ],
          { padding: 50 }
        );
      }

      data.forEach((vehicle) => {
        if (vehicle.device) {
          const coordinates: [number, number] = [
            vehicle.device.longitude,
            vehicle.device.latitude,
          ];
          let markerColor = '#808080';

          if (vehicle.device?.ignition === true && vehicle.device?.movement) {
            markerColor = '#4AD14A';
          } else if (
            vehicle.device?.ignition === true &&
            !vehicle.device?.movement
          ) {
            markerColor = '#FF0000';
          }
          const marker = new mapboxgl.Marker(createMarkerElement(markerColor))
            .setLngLat(coordinates)
            .addTo(mapRef.current!);

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div>
              <h3>${vehicle.plateNumber}</h3>
              <p>Device ID: ${vehicle.device?.deviceId}</p>
              <p>Latitude: ${vehicle.device?.latitude}</p>
              <p>Longitude: ${vehicle.device?.longitude}</p>
              <p>Driver: ${
                vehicle?.currentAssignedDriver
                  ? `${vehicle.currentAssignedDriver.firstName ?? ''} ${
                      vehicle.currentAssignedDriver.lastName ?? ''
                    }`
                  : 'No driver assigned'
              }</p>
            </div>
          `);

          marker.setPopup(popup);
          markersRef.current[vehicle.device.deviceId.toString()] = marker;
        }
      });
      setIsLoadingVehicles(false);
    });
  };

  const handleDateChange = useCallback(
    (date: string) => {
      console.log('handleDateChange date=', date);
      if (!date) {
        return;
      }

      const dummyEvent = {
        flag: 'High',
        name: 'Collision',
        latitude: -4.036027,
        longitude: 39.609748,
        media: {
          created: 1737731754,
          meta: {
            channel: 2,
            command_id: 1737734434841064,
            duration: 51.072,
            has_audio: true,
            height: 576,
            type: 'video',
            video_codec: 'h264',
            width: 704,
          },
          mime: 'video/mp4',
          name: 'VID_2025-01-24_21-15-54-0600.mp4',
          size: 7762109,
          url: 'https://media.flespi.io/735029734268A7090000A2D170FACD0F82B219000000000044A2A0AE3D91386A',
          uuid: '735029734268A7090000A2D170FACD0F82B219000000000044A2A0AE3D91386A',
        },
      };

      if (
        selectedVehicle &&
        selectedVehicle.device &&
        selectedVehicle.device.deviceId
      ) {
        getRouteHistory(selectedVehicle.device.deviceId.toString(), date)
          .then((data) => {
            console.log('alert getRouteHistory data=', data);
            setRouteHistoryData(data);
          })
          .catch((error) => {
            toast.error(error.message);
          });
      }
    },
    [selectedVehicle]
  );

  useEffect(() => {
    // Cleanup function to unsubscribe when component unmounts
    return () => {
      socketService.unsubscribeFromDeviceUpdates();
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setSelectedVehicle(null);
    setRouteHistoryData({ deviceId: 0, trips: [] });

    // Add a small delay to ensure DOM updates first
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.resize();

        // Force bounds recalculation
        if (vehicles.length > 0) {
          const vehicleCoordinates = vehicles
            .filter(
              (vehicle) =>
                vehicle.device &&
                typeof vehicle.device.longitude === 'number' &&
                typeof vehicle.device.latitude === 'number' &&
                !isNaN(vehicle.device.longitude) &&
                !isNaN(vehicle.device.latitude)
            )
            .map((vehicle) => [
              vehicle.device!.longitude,
              vehicle.device!.latitude,
            ]);

          if (vehicleCoordinates.length > 0) {
            const bounds = turf.bbox(
              turf.featureCollection(
                vehicleCoordinates.map((coord) => turf.point(coord))
              )
            );

            mapRef.current.fitBounds(
              [
                [bounds[0], bounds[1]],
                [bounds[2], bounds[3]],
              ],
              { padding: 50 }
            );
          }
        }
      }
    }, 100); // Shorter delay is better for UX
  };

  const handleZoomToLocation = () => {
    if (mapRef.current && selectedVehicle?.device) {
      mapRef.current.flyTo({
        center: [
          selectedVehicle.device.longitude,
          selectedVehicle.device.latitude,
        ],
        zoom: 18,
      });
    } else {
      toast.error('No location data available for this vehicle.');
    }
  };

  const plotDeviceMarker = () => {
    if (selectedVehicle && selectedVehicle.device) {
      markDeviceOnMap(mapRef, selectedVehicle);
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const term = searchTerm.toLowerCase();
    return (
      vehicle.make?.toLowerCase().includes(term) ||
      vehicle.model?.toLowerCase().includes(term) ||
      vehicle.plateNumber?.toLowerCase().includes(term) ||
      vehicle.vin?.toLowerCase().includes(term)
    );
  });

  // Mobile related stuff //
  const [isFilterBottomSheetOpen, setIsFilterBottomSheetOpen] = useState(false);
  const [
    isSelectedVehicleBottomSheetOpen,
    setIsSelectedVehicleBottomSheetOpen,
  ] = useState(false);
  const [status, setStatus] = useState('Both');
  const [equipmentType, setEquipmentType] = useState('Both');
  const [searchBarExpanded, setSearchBarExpanded] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  const toggleSearchBar = () => {
    setSearchBarExpanded(true);
  };

  const sheetRef = useRef(null);

  const handleClose = () => {
    setIsFilterBottomSheetOpen(false);
  };

  const handleApplyFilter = () => {
    console.log('Applied filters:', { status, equipmentType });
    setIsFilterBottomSheetOpen(false);
  };

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sheetRef.current &&
        !(sheetRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setIsFilterBottomSheetOpen(false);
        setIsSelectedVehicleBottomSheetOpen(false);
        setSelectedVehicle(null);
      }
    };

    if (isFilterBottomSheetOpen || isSelectedVehicleBottomSheetOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterBottomSheetOpen, isSelectedVehicleBottomSheetOpen]);

  const toggleFilterBottomSheet = () => {
    setIsFilterBottomSheetOpen(!isFilterBottomSheetOpen);
  };

  useEffect(() => {
    if (viewMode === 'mapView' && mapContainerRef.current) {
      if (!mapRef.current) {
        // Initialize the map if it doesn't exist
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v11',
        });

        map.addControl(new mapboxgl.NavigationControl());
        map.addControl(new mapboxgl.FullscreenControl());

        setMap(map);
        mapRef.current = map;

        const loadMapData = () => {
          setIsLoadingVehicles(true);
          getVehiclesWithDeviceData().then((data: IVehicle[]) => {
            setVehicles(data);
            setVehiclesLoaded(true);

            const validVehicles = data.filter(
              (vehicle) =>
                vehicle.device &&
                typeof vehicle.device.latitude === 'number' &&
                typeof vehicle.device.longitude === 'number' &&
                !isNaN(vehicle.device.latitude) &&
                !isNaN(vehicle.device.longitude)
            );

            const vehicleCoordinates = validVehicles.map((vehicle) => [
              vehicle.device!.longitude,
              vehicle.device!.latitude,
            ]);

            if (vehicleCoordinates.length > 0) {
              const bounds = turf.bbox(
                turf.featureCollection(
                  vehicleCoordinates.map((coord) => turf.point(coord))
                )
              );

              map.fitBounds(
                [
                  [bounds[0], bounds[1]],
                  [bounds[2], bounds[3]],
                ],
                { padding: 50 }
              );
            }

            setIsLoadingVehicles(false);
          });
        };

        map.on('load', loadMapData);
        setMapLoading(false);

        return () => {
          map.remove();
          mapRef.current = null;
        };
      } else {
        // Resize and re-center the map if it already exists
        mapRef.current.resize();
        if (vehicles.length > 0) {
          const vehicleCoordinates = vehicles
            .filter(
              (vehicle) =>
                vehicle.device &&
                typeof vehicle.device.latitude === 'number' &&
                typeof vehicle.device.longitude === 'number' &&
                !isNaN(vehicle.device.latitude) &&
                !isNaN(vehicle.device.longitude)
            )
            .map((vehicle) => [
              vehicle.device!.longitude,
              vehicle.device!.latitude,
            ]);

          if (vehicleCoordinates.length > 0) {
            const bounds = turf.bbox(
              turf.featureCollection(
                vehicleCoordinates.map((coord) => turf.point(coord))
              )
            );

            mapRef.current.fitBounds(
              [
                [bounds[0], bounds[1]],
                [bounds[2], bounds[3]],
              ],
              { padding: 50 }
            );
          }
        }
      }
    }
  }, [viewMode, vehicles]);

  return (
    <>
      <PageMeta
        title="Map | Synops AI"
        description="This is Map page for Synops AI"
      />
      <div className="flex flex-col md:flex-row h-full w-full bg-white overflow-hidden">
        {/* Mobile Search Bar */}
        <div
          className={`flex-row md:hidden items-center justify-between p-4 gap-4 ${
            viewMode === 'listView' ? 'flex' : 'hidden'
          }`}
        >
          <div className="relative w-full bg-gray-100 rounded-lg">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="w-full py-2 pl-10 pr-4 bg-muted text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search Vehicles"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div
            className="flex flex-row items-center p-2 bg-gray-100 rounded-lg"
            onClick={toggleFilterBottomSheet}
          >
            <Tune className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
        {/* end of Mobile Search Bar */}

        {/* Mobile Header & Toggle Component */}
        <div className="flex flex-row items-center justify-between p-4 md:hidden">
          <h2 className="text-lg">Equipment ({filteredVehicles.length})</h2>
          <div className="flex p-1 bg-[#0E1F47] rounded-full">
            <div
              className={`flex py-2 px-3 rounded-full gap-1 items-center ${
                viewMode === 'listView' ? 'bg-white' : 'bg-[#0E1F47] text-white'
              }`}
              onClick={() => setViewMode('listView')}
            >
              <List className="w-5 h-5 text-muted-foreground" />
              <p>List</p>
            </div>
            <div
              className={`flex py-2 px-3 rounded-full gap-1 items-center ${
                viewMode === 'mapView' ? 'bg-white' : 'bg-[#0E1F47] text-white'
              }`}
              onClick={() => setViewMode('mapView')}
            >
              <Earth className="w-5 h-5 text-muted-foreground" />
              <p>Map</p>
            </div>
          </div>
        </div>
        {/* end of Mobile Header & Toggle Component */}

        {/* List View on Mobile */}
        {viewMode === 'listView' && (
          <div className="flex flex-col w-full md:hidden overflow-y-auto thin-scrollbar px-4">
            <div className="text-sm space-y-2">
              {isLoadingVehicles ? (
                <VehicleItemMobileSkeletonList />
              ) : filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle, index) => (
                  <VehicleItemMobile
                    key={index}
                    vehicle={vehicle}
                    onClick={() => {
                      handleVehicleClick(vehicle);
                      setIsSelectedVehicleBottomSheetOpen(true);
                    }}
                    isSelected={selectedVehicle?.id === vehicle.id}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center h-full w-full text-gray-500">
                  <p>No vehicles found.</p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* end of List View on Mobile */}

        {/* Map View on Mobile */}
        {viewMode === 'mapView' && (
          <div className="flex flex-col w-full h-full">
            {/* Map Container - takes remaining height */}
            <div
              className="relative w-full flex-1"
              style={{ minHeight: '200px' }}
            >
              <div
                ref={mapContainerRef}
                className="w-full h-full rounded-md overflow-hidden border border-gray-200"
              />
              {mapLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-20 rounded-md">
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Loading map...</span>
                    </div>
                    <p className="mt-2">Loading map data...</p>
                  </div>
                </div>
              )}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 md:hidden">
                <div className="flex rounded-full bg-white/80">
                  <div
                    onClick={() => setStatus('Both')}
                    className={`rounded-l-full py-2 px-6 ${
                      status === 'Both' ? 'bg-[#0E1F47] text-white' : ''
                    }`}
                  >
                    <p>All</p>
                  </div>
                  <div
                    onClick={() => setStatus('Active')}
                    className={`py-2 px-6 ${
                      status === 'Active' ? 'bg-[#0E1F47] text-white' : ''
                    }`}
                  >
                    <p>Active</p>
                  </div>
                  <div
                    onClick={() => setStatus('Inactive')}
                    className={`rounded-r-full py-2 px-6 ${
                      status === 'Inactive' ? 'bg-[#0E1F47] text-white' : ''
                    }`}
                  >
                    <p>Inactive</p>
                  </div>
                </div>
                <div className="flex rounded-full bg-white/80 w-fit">
                  <div
                    onClick={() => setEquipmentType('Vehicles')}
                    className={`rounded-l-full py-2 px-6 ${
                      equipmentType === 'Vehicles'
                        ? 'bg-[#0E1F47] text-white'
                        : ''
                    }`}
                  >
                    <Commute className="w-5 h-5" />
                  </div>
                  <div
                    onClick={() => setEquipmentType('Assets')}
                    className={`rounded-r-full py-2 px-6 ${
                      equipmentType === 'Assets'
                        ? 'bg-[#0E1F47] text-white'
                        : ''
                    }`}
                  >
                    <BoxIcon />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-12 left-4 right-4 z-10 md:hidden">
                {searchBarExpanded ? (
                  <div className="relative w-full bg-white rounded-lg py-2">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      className="w-full py-2 pl-10 pr-4 bg-muted text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Search Vehicles"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                ) : (
                  <div
                    onClick={toggleSearchBar}
                    className="flex w-fit rounded-lg items-center p-4 bg-white"
                  >
                    <Search className="w-5 h-5 text-gray-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Details Panel - fixed height that can be resized */}
            {selectedVehicle && (
              <div
                className="bg-white w-full overflow-y-auto border-t border-gray-200"
                style={{ height: `fit-content` }}
              >
                <VehicleDetailsMobile
                  selectedVehicle={selectedVehicle}
                  getStatusColor={getStatusColor}
                  handleZoomToLocation={handleZoomToLocation}
                  setSearchBarExpanded={setSearchBarExpanded}
                />
              </div>
            )}
          </div>
        )}
        {/* end of Map View on Mobile */}

        <div className="flex-col w-full md:flex-row md:h-full hidden md:flex">
          {/* Main container - changes to row on desktop */}
          <div className="flex flex-col w-full md:flex-row lg:flex-row md:h-full">
            {/* First column: Sidebar with vehicle list */}
            {isSidebarOpen && (
              <div className="w-full md:w-[275px] lg:w-[275px] flex-shrink-0 bg-white shadow-md h-auto md:h-full overflow-hidden">
                <div className="w-full bg-white text-black p-4 h-full flex flex-col">
                  <div className="flex items-center justify-center mb-4 gap-8">
                    <Button
                      onClick={toggleSidebar}
                      icon={<KeyboardArrowLeftIcon />}
                      name=""
                    />
                    <Button
                      onClick={handleGodsView}
                      icon={<StreamIcon />}
                      name="God's view"
                    />
                  </div>
                  <hr className="my-4" />
                  <div className="relative p-4">
                    <div className="absolute left-8 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search Vehicle"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-2 border rounded-full text-sm"
                    />
                  </div>
                  <hr className="my-4" />

                  {/* Vehicle list container */}
                  <div className="divide-y text-sm overflow-y-auto thin-scrollbar flex-1">
                    {filteredVehicles.map((vehicle, index) => (
                      <VehicleItems
                        key={index}
                        vehicle={vehicle}
                        onClick={() => handleVehicleClick(vehicle)}
                        isSelected={selectedVehicle?.id === vehicle.id}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="w-full flex flex-col md:flex-col lg:flex-row md:h-full overflow-hidden">
              {/* Second column: Vehicle details when selected */}
              {isSidebarOpen && selectedVehicle && selectedVehicle.device && (
                <div className="w-full lg:h-auto lg:w-[350px] bg-white shadow-md mb-4 lg:mb-0 lg:mr-4 flex-shrink-0 overflow-y-auto">
                  <VehicleDetails
                    vehicle={selectedVehicle}
                    onClose={() => setSelectedVehicle(null)}
                    routeHistory={routeHistoryData}
                    onDateChange={handleDateChange}
                    onZoomToLocation={handleZoomToLocation}
                    onPlotDeviceLocation={plotDeviceMarker}
                    showRouteHistory={showRouteHistory}
                    setShowRouteHistory={setShowRouteHistory}
                    onTripSelectionChange={setSelectedTrips}
                    alert={alert}
                  />
                </div>
              )}

              {/* Map Container - Always visible, takes remaining space */}
              <div className="relative w-full h-[50vh] md:h-[calc(100vh-20px)] lg:h-full lg:flex-1">
                <div
                  ref={mapContainerRef}
                  className="w-full h-full rounded-md overflow-hidden border border-gray-200"
                />
                {mapLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-20 rounded-md">
                    <div className="text-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="sr-only">Loading map...</span>
                      </div>
                      <p className="mt-2">Loading map data...</p>
                    </div>
                  </div>
                )}
                {/* Sidebar Toggle Button */}
                {!isSidebarOpen && (
                  <div className="absolute top-4 left-4 z-10 space-x-2">
                    <Button
                      onClick={toggleSidebar}
                      name="Vehicles"
                      icon={<DirectionsCarIcon />}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filter Bottom Sheet */}
        {isFilterBottomSheetOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 md:hidden">
            <div
              ref={sheetRef}
              className="bg-white rounded-t-3xl w-full p-6 animate-slide-up"
              style={{
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">Filter</h2>
                <button onClick={handleClose} className="text-gray-500">
                  <X size={24} />
                </button>
              </div>

              {/* Status Filter */}
              <div className="mb-6">
                <label className="block text-gray-800 mb-3">Status</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    className={`py-2 px-4 rounded-md border ${
                      status === 'Both'
                        ? 'bg-gray-200 border-gray-300'
                        : 'bg-white border-gray-300'
                    }`}
                    onClick={() => setStatus('Both')}
                  >
                    Both
                  </button>
                  <button
                    className={`py-2 px-4 rounded-md border ${
                      status === 'Active'
                        ? 'bg-gray-200 border-gray-300'
                        : 'bg-white border-gray-300'
                    }`}
                    onClick={() => setStatus('Active')}
                  >
                    Active
                  </button>
                  <button
                    className={`py-2 px-4 rounded-md border ${
                      status === 'Inactive'
                        ? 'bg-gray-200 border-gray-300'
                        : 'bg-white border-gray-300'
                    }`}
                    onClick={() => setStatus('Inactive')}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              {/* Equipment Types Filter */}
              <div className="mb-8">
                <label className="block text-gray-800 mb-3">
                  Equipment Types
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    className={`py-2 px-4 rounded-md border ${
                      equipmentType === 'Both'
                        ? 'bg-gray-200 border-gray-300'
                        : 'bg-white border-gray-300'
                    }`}
                    onClick={() => setEquipmentType('Both')}
                  >
                    Both
                  </button>
                  <button
                    className={`py-2 px-4 rounded-md border ${
                      equipmentType === 'Vehicles'
                        ? 'bg-gray-200 border-gray-300'
                        : 'bg-white border-gray-300'
                    }`}
                    onClick={() => setEquipmentType('Vehicles')}
                  >
                    Vehicles
                  </button>
                  <button
                    className={`py-2 px-4 rounded-md border ${
                      equipmentType === 'Assets'
                        ? 'bg-gray-200 border-gray-300'
                        : 'bg-white border-gray-300'
                    }`}
                    onClick={() => setEquipmentType('Assets')}
                  >
                    Assets
                  </button>
                </div>
              </div>

              {/* Apply Filter Button */}
              <button
                className="w-full bg-[#0E1F47] text-white py-3 rounded-full font-medium"
                onClick={handleApplyFilter}
              >
                Apply Filter
              </button>
            </div>

            <style>{`
           @keyframes slide-up {
             from {
               transform: translateY(100%);
             }
             to {
               transform: translateY(0);
             }
           }
           
           .animate-slide-up {
             animation: slide-up 0.3s ease-out forwards;
           }
         `}</style>
          </div>
        )}
        {/* end of Mobile Filter Bottom Sheet */}

        {/* Vehicle Details Bottom Sheet */}
        {selectedVehicle &&
          isSelectedVehicleBottomSheetOpen &&
          viewMode !== 'mapView' && (
            <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 md:hidden">
              <div
                ref={sheetRef}
                className="bg-white rounded-t-3xl w-full mt-16 animate-slide-up shadow-xl"
              >
                {/* Header with vehicle name and status */}
                <div className="p-4 pb-2 flex justify-between items-center">
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold mr-2">
                      {selectedVehicle.make} {selectedVehicle.model}
                    </h2>
                    <div className="flex items-center">
                      <div
                        className="w-2 h-2 rounded-full mr-1.5"
                        style={{
                          backgroundColor: getStatusColor(
                            selectedVehicle.status
                          ),
                        }}
                      ></div>
                      <span
                        className="text-sm"
                        style={{
                          color: getStatusColor(selectedVehicle.status),
                        }}
                      >
                        {selectedVehicle.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVehicle(null)}
                    className="text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Battery status */}
                <div className="px-4 pb-2 flex items-center text-gray-500 text-sm">
                  <BatteryMedium size={20} className="mr-2" />
                  <span>
                    {selectedVehicle.device?.battery
                      ? `${selectedVehicle.device.battery}%`
                      : 'N/A'}
                  </span>
                </div>

                {/* Vehicle info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center text-gray-600">
                      <User size={20} className="mr-2" />
                      <span>Driver:</span>
                    </div>
                    {selectedVehicle.currentAssignedDriver.firstName ||
                    selectedVehicle.currentAssignedDriver.LastName ? (
                      <span className="text-blue-600 font-medium">{`${
                        selectedVehicle.currentAssignedDriver.firstName || ''
                      } ${
                        selectedVehicle.currentAssignedDriver.LastName || ''
                      }`}</span>
                    ) : (
                      <span className="text-gray-500">No Driver Assigned</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-600">
                      <Truck size={20} className="mr-2" />
                      <span>Vehicle ID:</span>
                    </div>
                    <span className="text-gray-800">{selectedVehicle.id}</span>
                  </div>
                </div>

                {/* Last updated */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center text-gray-600">
                      <Clock size={20} className="mr-2" />
                      <span>Last Updated:</span>
                    </div>
                    <span className="text-gray-800">
                      {new Date(selectedVehicle.updatedAt).toLocaleString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        }
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-5">
                    <div className="flex items-start text-gray-600">
                      <MapPin size={20} className="mr-2 mt-1 flex-shrink-0" />
                      <span>Location:</span>
                    </div>
                    <div className="text-right text-gray-800">
                      {selectedVehicle.garage?.address || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="p-4 grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-full text-gray-700 font-medium">
                    <Timeline className="mr-2" />
                    <span>Trip History</span>
                  </button>
                  <button
                    disabled={!selectedVehicle.device}
                    onClick={() => {
                      setViewMode('mapView');
                      handleZoomToLocation();
                    }}
                    className="flex items-center justify-center py-2.5 px-4 bg-blue-900 text-white rounded-full font-medium"
                  >
                    <Locate size={18} className="mr-2" />
                    <span>Locate Vehicle</span>
                  </button>
                </div>
              </div>

              <style>{`
           @keyframes slide-up {
             from {
               transform: translateY(100%);
             }
             to {
               transform: translateY(0);
             }
           }
           
           .animate-slide-up {
             animation: slide-up 0.3s ease-out forwards;
           }
         `}</style>
            </div>
          )}
        {/* end of Vehicle Details Bottom Sheet */}
      </div>
    </>
  );
};
