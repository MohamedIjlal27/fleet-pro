import React, { useEffect, useRef, useState, useCallback } from "react";
import * as turf from '@turf/turf';
import mapboxgl from "mapbox-gl";
import { getVehicleStatus } from '@/modules/Map/utils/getVehicleStatus';
import { getStatusColor } from '@/modules/Map/utils/getStatusColor';
import { createVehicleElement } from '@/modules/Map/utils/createVehicleElement';
import "mapbox-gl/dist/mapbox-gl.css";
import { fetchWidgetData } from "../apis/apis.tsx";
import { createGarageMarkerElement } from "../../../utils/map/garage_icon";
import socketService from "../../../Socket";
import { useVehicleLocationUpdates } from "../../Map/hooks/useVehicleLocationUpdates";
import { createVehicleMarkerElement } from "../../../utils/map/vehicle_icon.ts";
import { IVehicle } from "../../core/interfaces/interfaces";
import { getVehiclesWithDeviceData } from "../../Map/apis/apis";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface Garage {
  id: number;
  name: string;
  city: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
}

type DisplayType = "all" | "vehicle" | "asset";
type StatusType = "all" | "active" | "inactive" | "inService" | "reserved";

const MapWithGaragesVehicles: React.FC = () => {
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [assets, setAssets] = useState<IVehicle[]>([]);
  const [displayType, setDisplayType] = useState<DisplayType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusType>("all");

  // Counts for status filter
  const [counts, setCounts] = useState({
    all: 0,
    active: 0,
    inactive: 0,
  });

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const garageMarkersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const vehicleMarkersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const assetMarkersRef = useRef<Record<string, mapboxgl.Marker>>({});

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
      if (!data.deviceId) {
        console.warn("Received location update with missing deviceId:", data);
        return;
      }
  
      const deviceIdStr = data.deviceId.toString();
      const existingMarker = vehicleMarkersRef.current[deviceIdStr];

      const vehicle = vehicles.find(
        (vehicle) => vehicle.device?.deviceId?.toString() === deviceIdStr
      );

      const vehicleStatus = getVehicleStatus(vehicle?.device?.ignition, vehicle?.device?.movement);
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
        const pointerWrapper = el.querySelector('.pointer-wrapper') as HTMLDivElement;
        if (pointerWrapper) {
          pointerWrapper.style.transform = `rotate(${heading}deg)`;
          pointerWrapper.style.display = vehicleStatus === 'driving' ? 'block' : 'none';
        }

        // Update arrow color
        const pointer = el.querySelector('.pointer-arrow') as HTMLDivElement;
        if (pointer) {
          pointer.style.borderBottomColor = markerColor;
        }
        
        const popup = existingMarker.getPopup();

        if (popup) {
          const vehicle = vehicles.find(
            (vehicle) => vehicle.device?.deviceId?.toString() === deviceIdStr
          );
          popup.setHTML(`
          <div>
            <h3>Plate Number: ${vehicle!.plateNumber}</h3>
            <h3>Device ID: ${data.deviceId}</h3>
            <p>Driver: ${
              vehicle?.currentAssignedDriver &&
              typeof vehicle.currentAssignedDriver === 'object' &&
              Object.keys(vehicle.currentAssignedDriver).length > 0
                ? `${vehicle.currentAssignedDriver?.user?.firstName ?? ''} ${vehicle.currentAssignedDriver?.user?.lastName ?? ''}`
                : 'No driver assigned'
            }</p>
            <p>Latitude: ${data.latitude}</p>
            <p>Longitude: ${data.longitude}</p>
          </div>
        `);
        }
      } else {
        if (vehicle && mapRef.current) {
          const markerElement = createVehicleElement(vehicleStatus, markerColor, heading, vehicle.entityType);
          const marker = new mapboxgl.Marker(markerElement)
          //const marker = new mapboxgl.Marker(createVehicleMarkerElement())
            .setLngLat([data.longitude, data.latitude])
            .addTo(mapRef.current);
  
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div>
              <h3>Plate Number: ${vehicle.plateNumber}</h3>
              <p>Device ID: ${vehicle.device?.deviceId}</p>
              <p>Driver: ${
                vehicle?.currentAssignedDriver &&
                typeof vehicle.currentAssignedDriver === 'object' &&
                Object.keys(vehicle.currentAssignedDriver).length > 0
                  ? `${vehicle.currentAssignedDriver?.user?.firstName ?? ''} ${vehicle.currentAssignedDriver?.user?.lastName ?? ''}`
                  : 'No driver assigned'
              }</p>
              <p>Latitude: ${data.latitude}</p>
              <p>Longitude: ${data.longitude}</p>
            </div>
          `);
  
          marker.setPopup(popup);
          vehicleMarkersRef.current[deviceIdStr] = marker;
        }
      }
    },
    [vehicles]
  );

  useVehicleLocationUpdates(vehicles, updateVehicleMarkerOnWebSocket);

  // Fetch garages, vehicles, assets locations from API
  useEffect(() => {
    const fetchWgMapwithGarages = async () => {
      try {
        // Use status filter parameter if applicable
        //const statusParam = statusFilter !== "all" ? statusFilter : "";
        const apiData = await fetchWidgetData({
          wg9: true,
          //wg9a: statusParam
        });

        const wgMapwithGarages = apiData.find(
          (item: any) => item.wgMapwithGarages !== undefined
        )?.wgMapwithGarages;

        const newGarages = wgMapwithGarages.garages || [];
        const newVehicles = wgMapwithGarages.vehicles || [];
        const newAssets = wgMapwithGarages.assets || [];

        setGarages(newGarages);
        setVehicles(newVehicles);
        setAssets(newAssets);

        setCounts(prev => ({
          ...prev,
          all: newVehicles.length,
        }));
      } catch (error) {
        console.error("Error fetching garage locations:", error);
      }
    };

    fetchWgMapwithGarages();
  }, []);

  useEffect(() => {
    if (mapContainer && !map) {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

      try {
        const mapInstance = new mapboxgl.Map({
          container: mapContainer,
          style: "mapbox://styles/mapbox/light-v10",
        });

        mapInstance.addControl(new mapboxgl.NavigationControl());
        mapInstance.addControl(new mapboxgl.FullscreenControl());
        setMap(mapInstance);
        mapRef.current = mapInstance;
      } catch (error) {
        console.error("Error initializing Mapbox:", error);
      }
    }
  }, [mapContainer, map]);

  // Function to handle zoom in
  const handleZoomIn = () => {
    if (map) {
      map.zoomIn();
    }
  };

  // Function to handle zoom out
  const handleZoomOut = () => {
    if (map) {
      map.zoomOut();
    }
  };

  useEffect(() => {
    if (map) {
      const loadGarageMarkers = async (): Promise<[number, number][]> => {
        const coordinates: [number, number][] = [];
      
        if (!map || displayType !== "all" || statusFilter !== "all") return coordinates;
      
        garages.forEach((garage) => {
          const coord: [number, number] = [garage.longitude, garage.latitude];
          coordinates.push(coord);
      
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <strong>${garage.name}</strong><br>${garage.address}<br>Phone: ${garage.phoneNumber}
          `);
      
          const marker = new mapboxgl.Marker(createGarageMarkerElement())
            .setLngLat(coord)
            .setPopup(popup)
            .addTo(map);
      
          garageMarkersRef.current[garage.id.toString()] = marker;
        });
      
        return coordinates;
      };

      // Load and return vehicle coordinates after adding markers
      const loadVehicleMarkers = async (): Promise<[number, number][]> => {
        const coordinates: [number, number][] = [];
        if (displayType !== "all" && displayType !== "vehicle") return coordinates;
      
        try {
          let activeVehicleCount = 0;
          let inactiveVehicleCount = 0;

          const enrichedVehicles = vehicles
          .filter((v) => v.device)
          .map((vehicle) => {
            const status = getVehicleStatus(vehicle.device?.ignition, vehicle.device?.movement);
            if (status === 'driving' || status === 'idling') {
              activeVehicleCount++;
            } else {
              inactiveVehicleCount++;
            }
            return { ...vehicle, vehicleStatus: status };
          });

          const filteredData = enrichedVehicles.filter((vehicle) => {
            if (statusFilter === 'active') {
              return vehicle.vehicleStatus === 'driving' || vehicle.vehicleStatus === 'idling';
            }
            if (statusFilter === 'inactive') {
              return vehicle.vehicleStatus === 'parking';
            }
            return true; // 'all'
          });
      
          const deviceIds = filteredData
            .map((v) => v.device?.deviceId?.toString())
            .filter((id): id is string => typeof id === 'string');
          socketService.subscribeTodevicesLocationUpdates(deviceIds);
      
          filteredData.forEach((vehicle) => {
            const vehicleStatus = getVehicleStatus(vehicle?.device?.ignition, vehicle?.device?.movement);
            const markerColor = getStatusColor(vehicleStatus);

            const device = vehicle.device;
            if (device) {
              const latitude = device.latitude;
              const longitude = device.longitude;
              const heading = device.direction ?? 0;
      
              // Validate latitude and longitude before using them
              if (typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude)) {
                const coord: [number, number] = [longitude, latitude];
                coordinates.push(coord);
      
                const markerElement = createVehicleElement(vehicleStatus, markerColor, heading, 'vehicle');
                const marker = new mapboxgl.Marker(markerElement)
                //const marker = new mapboxgl.Marker(createVehicleMarkerElement())
                  .setLngLat(coord)
                  .setPopup(
                    new mapboxgl.Popup({ offset: 25 }).setHTML(`
                      <div>
                        <h3>Plate Number: ${vehicle.plateNumber}</h3>
                        <p>Device ID: ${device.deviceId}</p>
                        <p>Driver: ${
                          vehicle?.currentAssignedDriver &&
                          typeof vehicle.currentAssignedDriver === 'object' &&
                          Object.keys(vehicle.currentAssignedDriver).length > 0
                            ? `${vehicle.currentAssignedDriver?.user?.firstName ?? ''} ${vehicle.currentAssignedDriver?.user?.lastName ?? ''}`
                            : 'No driver assigned'
                        }</p>
                        <p>Latitude: ${device.latitude}</p>
                        <p>Longitude: ${device.longitude}</p>
                      </div>
                    `)
                  )
                  .addTo(map!);
      
                vehicleMarkersRef.current[device.deviceId.toString()] = marker;
              } else {
                console.warn(`Invalid coordinates for vehicle with device ID ${vehicle.device?.deviceId}`);
              }
            }
          });

          setCounts(prev => ({
            ...prev,
            active: activeVehicleCount,
            inactive: inactiveVehicleCount,
          }));
        } catch (error) {
          console.error("Error loading vehicle markers:", error);
        }
      
        return coordinates;
      };

      // Load and return asset coordinates after adding markers
      const loadAssetMarkers = async (): Promise<[number, number][]> => {
        const coordinates: [number, number][] = [];
        if ((displayType !== "all" && displayType !== "asset") || statusFilter !== "all") return coordinates;

        try {
          assets.forEach((asset) => {
            let assetStatus = 'parking';
            if (asset?.device?.ignition === true && asset.device?.movement) {
              assetStatus = 'driving';
            } else if (
              asset?.device?.ignition === true &&
              !asset.device?.movement
            ) {
              assetStatus = 'idling';
            }
            const markerColor = getStatusColor(assetStatus);

            const device = asset.device;
            if (device) {
              const latitude = device.latitude;
              const longitude = device.longitude;
              const heading = device.direction ?? 0;
      
              // Validate latitude and longitude before using them
              if (typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude)) {
                const coord: [number, number] = [longitude, latitude];
                coordinates.push(coord);
          
                const markerElement = createVehicleElement(assetStatus, markerColor, heading, 'asset');
                const marker = new mapboxgl.Marker(markerElement)
                //const marker = new mapboxgl.Marker(createVehicleMarkerElement()) // replace with `createAssetMarkerElement()` if available
                  .setLngLat(coord)
                  .setPopup(
                    new mapboxgl.Popup({ offset: 25 }).setHTML(`
                      <div>
                        <h3>${asset.assetId}</h3>
                        <p>Device ID: ${device.deviceId}</p>
                        <p>Type: ${asset.assetType}</p>
                        <p>Latitude: ${device.latitude}</p>
                        <p>Longitude: ${device.longitude}</p>
                      </div>
                    `)
                  )
                  .addTo(map!);

                assetMarkersRef.current[asset.id.toString()] = marker;
              } else {
                console.warn(`Invalid coordinates for vehicle with device ID ${asset.device?.deviceId}`);
              }
            }
          });
        } catch (error) {
          console.error("Error loading asset markers:", error);
        }

        return coordinates;
      };

      // Master function to update all markers and zoom map
      const updateMap = async () => {
        // Clear existing markers
        Object.values(garageMarkersRef.current).forEach((m) => m.remove());
        garageMarkersRef.current = {};
        Object.values(vehicleMarkersRef.current).forEach((m) => m.remove());
        vehicleMarkersRef.current = {};
        Object.values(assetMarkersRef.current).forEach((m) => m.remove());
        assetMarkersRef.current = {};

        const [garageCoords, vehicleCoords, assetCoords] = await Promise.all([
          loadGarageMarkers(),
          loadVehicleMarkers(),
          loadAssetMarkers(),
        ]);

        const allCoordinates = [...garageCoords, ...vehicleCoords, ...assetCoords].filter(
          ([lng, lat]) => lng && lat
        );

        if (allCoordinates.length > 0) {
          const bounds = turf.bbox(
            turf.featureCollection(
              allCoordinates.map((coord) => turf.point(coord))
            )
          );

          map!.fitBounds(
            [
              [bounds[0], bounds[1]],
              [bounds[2], bounds[3]],
            ],
            { padding: 50 }
          );
        }
      };

      updateMap();
    }
  }, [map, displayType, statusFilter, garages]);

  return (
    <div className="relative w-full h-full">
      {/* Type filter tabs at top */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex rounded-full overflow-hidden shadow-md">
        <button
          className={`px-6 py-2 text-sm font-medium ${displayType === "all"
            ? "bg-[#0A1224] text-white"
            : "bg-white text-gray-700"
            }`}
          onClick={() => setDisplayType("all")}
        >
          All
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${displayType === "vehicle"
            ? "bg-[#0A1224] text-white"
            : "bg-white text-gray-700"
            }`}
          onClick={() => setDisplayType("vehicle")}
        >
          Vehicle
        </button>
        <button
          className={`px-2 py-2 text-sm font-medium ${displayType === "asset"
            ? "bg-[#0A1224] text-white"
            : "bg-white text-gray-700"
            }`}
          onClick={() => setDisplayType("asset")}
        >
          Asset
        </button>
      </div>

      {/* Status filter at bottom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex rounded-full overflow-hidden shadow-md">
        <button
          className={`px-4 py-2 text-sm font-medium ${statusFilter === "all"
            ? "bg-[#0A1224] text-white"
            : "bg-white text-gray-700"
            }`}
          onClick={() => setStatusFilter("all")}
        >
          All ({counts.all})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${statusFilter === "active"
            ? "bg-[#0A1224] text-white"
            : "bg-white text-gray-700"
            }`}
          onClick={() => setStatusFilter("active")}
        >
          Active ({counts.active})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${statusFilter === "inactive"
            ? "bg-[#0A1224] text-white"
            : "bg-white text-gray-700"
            }`}
          onClick={() => setStatusFilter("inactive")}
        >
          Inactive ({counts.inactive})
        </button>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col">
        <button
          className="bg-white p-2 rounded-t-md shadow-md"
          onClick={handleZoomIn}
        >
          <AddIcon fontSize="small" />
        </button>
        <button
          className="bg-white p-2 rounded-b-md shadow-md border-t border-gray-200"
          onClick={handleZoomOut}
        >
          <RemoveIcon fontSize="small" />
        </button>
      </div>

      {/* Map container */}
      <div ref={(el) => setMapContainer(el)} className="w-full h-full" />
    </div>
  );
};

export default MapWithGaragesVehicles;
