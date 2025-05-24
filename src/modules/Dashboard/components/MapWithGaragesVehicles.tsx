import React, { useEffect, useRef, useState, useCallback } from "react";
import * as turf from '@turf/turf';
import mapboxgl from "mapbox-gl";
import { getVehicleStatus } from '@/modules/Map/utils/getVehicleStatus';
import { getStatusColor } from '@/modules/Map/utils/getStatusColor';
import "mapbox-gl/dist/mapbox-gl.css";
import { fetchWidgetData } from "../apis/apis.tsx";
import { useVehicleLocationUpdates } from "../../Map/hooks/useVehicleLocationUpdates";
import { IVehicle } from "../../core/interfaces/interfaces";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LocationAddress from '@/utils/addressForLatLong';
import { createRoot } from 'react-dom/client';

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

function debounce(func: Function, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const MapWithGaragesVehicles: React.FC = () => {
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [mapboxTokenAvailable, setMapboxTokenAvailable] = useState<boolean>(true);
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
  const geoJSONDataRef = useRef<any>({ type: 'FeatureCollection', features: [] });

  const pendingUpdatesRef = useRef<Record<string, any>>({});

  const debouncedUpdateMap = useRef(
    debounce(() => {
      const features = geoJSONDataRef.current.features;

      let updated = false;

      Object.entries(pendingUpdatesRef.current).forEach(([deviceIdStr, data]) => {
        const featureIndex = features.findIndex(
          (f) => f.properties?.id?.toString() === deviceIdStr
        );

        if (featureIndex !== -1) {
          features[featureIndex].geometry.coordinates = [data.longitude, data.latitude];
          features[featureIndex].properties.longitude = data.longitude;
          features[featureIndex].properties.latitude = data.latitude;
          features[featureIndex].properties.status = data.status;
          features[featureIndex].properties.color = data.color;
          features[featureIndex].properties.bearing = data.bearing;
          updated = true;
        }
      });

      if (updated && mapRef.current?.getSource('locations')) {
        mapRef.current.getSource('locations').setData({
          type: 'FeatureCollection',
          features: features.map((f) => ({ ...f, properties: { ...f.properties } })),
        });
      }

      pendingUpdatesRef.current = {}; // Clear queue
    }, 100) // adjust time as needed
  ).current;

  // Function to handle live location updates
  const updateVehicleMarkerOnWebSocket = useCallback(
    (data: {
      deviceId: string | number;
      latitude: number;
      longitude: number;
      deviceTypeName: string;
      //battery?: number;
      //batteryVoltage?: number;
      //deviceName?: string;
      direction?: number;
      //externalPowerVoltage?: number;
      //gsmSignal?: number;
      ignition?: boolean;
      //mileage?: number;
      movement?: boolean;
      //satellites?: number;
      //speed?: number;
      timestamp?: number;
      rssiDistance?: number;
    }) => {
      if (!data.deviceId) return;
  
      const deviceIdStr = data.deviceId.toString();

      const status = getVehicleStatus(data.ignition, data.movement);
      const color = getStatusColor(status);
      const bearing = data.direction ?? 0;

      pendingUpdatesRef.current[deviceIdStr] = {
        longitude: data.longitude,
        latitude: data.latitude,
        status,
        color,
        bearing,
      };
  
      debouncedUpdateMap();
    },
    [vehicles, assets]
  );

  useVehicleLocationUpdates(vehicles, updateVehicleMarkerOnWebSocket);

  // Fetch garages, vehicles, assets locations from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiData = await fetchWidgetData({
          wg9: true,
        });

        const wgMapwithGarages = apiData.find(
          (item: any) => item.wgMapWithGarages !== undefined
        )?.wgMapWithGarages;

        const newGarages = wgMapwithGarages?.garages || [];
        const newVehicles = wgMapwithGarages?.vehicles || [];
        const newAssets = wgMapwithGarages?.assets || [];

        setGarages(newGarages);
        setVehicles(newVehicles);
        setAssets(newAssets);
      } catch (error) {
        console.error("Error fetching garage locations:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (mapContainer && !map) {
      const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;
      
      // Check if Mapbox token is available
      if (!token || token === 'undefined') {
        console.warn('Mapbox access token not available in demo mode');
        setMapboxTokenAvailable(false);
        return;
      }
      
      mapboxgl.accessToken = token;
  
      const mapInstance = new mapboxgl.Map({
        container: mapContainer,
        style: "mapbox://styles/mapbox/light-v10",
      });
  
      mapInstance.addControl(new mapboxgl.NavigationControl());
      mapInstance.addControl(new mapboxgl.FullscreenControl());
  
      mapInstance.on('load', () => {
        setMap(mapInstance);
        mapRef.current = mapInstance;
      });
    }
  }, [mapContainer, map]);

  useEffect(() => {
    if (!mapContainer || !map) return;
  
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
  
    resizeObserver.observe(mapContainer);
  
    return () => {
      resizeObserver.disconnect();
    };
  }, [mapContainer, map]);

  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;
  
    // Clear any existing sources or layers if needed
    if (map.getSource('locations')) {
      map.removeLayer('clusters');
      map.removeLayer('cluster-count');
      map.removeLayer('unclustered');
      map.removeLayer('unclustered-type-icons');
      map.removeLayer('unclustered-triangle');
      map.removeSource('locations');
    }

    // Update GeoJSON data based on vehicles, garages, and assets
    geoJSONDataRef.current.features = [];
    let activeCount = 0;
    let inactiveCount = 0;

    if (displayType === "all" || displayType === "vehicle") {
      vehicles.forEach((vehicle) => {
        const lng = vehicle.device?.longitude;
        const lat = vehicle.device?.latitude;

        if (typeof lng === 'number' && typeof lat === 'number' && !isNaN(lng) && !isNaN(lat)) {
          const status = getVehicleStatus(vehicle.device?.ignition, vehicle.device?.movement);
          const color = getStatusColor(status);

          if (status === 'Driving' || status === 'Idling') {
            activeCount++;
          } else if (status === 'Parking') {
            inactiveCount++;
          }

          if (statusFilter !== 'all' && (
            (statusFilter === 'active' && !(status === 'Driving' || status === 'Idling')) ||
            (statusFilter === 'inactive' && status !== 'Parking')
          )) {
            return;
          }

          const vehicleFeature = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [vehicle.device?.longitude, vehicle.device?.latitude],
            },
            properties: {
              id: vehicle.device?.deviceId,
              deviceId: vehicle.device?.deviceId,
              status: status,
              plateNumber: vehicle.plateNumber,
              latitude: vehicle.device?.latitude,
              longitude: vehicle.device?.longitude,
              driver: vehicle?.currentAssignedDriver && typeof vehicle.currentAssignedDriver === 'object' &&
                Object.keys(vehicle.currentAssignedDriver).length > 0
                  ? `${vehicle.currentAssignedDriver?.user?.firstName ?? ''} ${vehicle.currentAssignedDriver?.user?.lastName ?? ''}`
                  : 'No driver assigned',
              color: color,
              type: 'vehicle',
              bearing: vehicle.device?.direction || 0,
            },
          };

          geoJSONDataRef.current.features.push(vehicleFeature);
        }
      });
    }

    if (displayType === "all" || displayType === "asset") {
      assets.forEach((asset) => {
        const lng = asset.device?.longitude;
        const lat = asset.device?.latitude;
        if (typeof lng === 'number' && typeof lat === 'number' && !isNaN(lng) && !isNaN(lat)) {
          const status = getVehicleStatus(asset.device?.ignition, asset.device?.movement);
          const color = getStatusColor(status);

          if (status === 'Driving' || status === 'Idling') {
            activeCount++;
          } else if (status === 'Parking') {
            inactiveCount++;
          }

          if (statusFilter !== 'all' && (
            (statusFilter === 'active' && !(status === 'Driving' || status === 'Idling')) ||
            (statusFilter === 'inactive' && status !== 'Parking')
          )) {
            return;
          }

          const assetFeature = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [asset.device?.longitude, asset.device?.latitude],
            },
            properties: {
              id: asset.device?.deviceId,
              deviceId: asset.device?.deviceId,
              status: status,
              assetId: asset.assetId,
              assetType: asset.assetType,
              latitude: asset.device?.latitude,
              longitude: asset.device?.longitude,
              color: color,
              type: 'asset',
              bearing: asset.device?.direction || 0,
            },
          };

          geoJSONDataRef.current.features.push(assetFeature);
        }
      });
    }

    if (displayType === "all" && statusFilter === "all") {
      garages.forEach((garage) => {
        const lng = garage.longitude;
        const lat = garage.latitude;

        if (typeof lng === 'number' && typeof lat === 'number' && !isNaN(lng) && !isNaN(lat)) {
          const garageFeature = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [garage.longitude, garage.latitude],
            },
            properties: {
              id: garage.id,
              name: garage.name,
              address: garage.address,
              phoneNumber: garage.phoneNumber,
              type: 'garage',
            },
          };

          geoJSONDataRef.current.features.push(garageFeature);
        }
      });
    }

    map.loadImage('/images/maps/garage_icon.png', (error, image) => {
      if (error) throw error;
      if (!map.hasImage('garage-icon')) {
        map.addImage('garage-icon', image!);
      }
    });
    map.loadImage('/images/maps/fleet-vehicle.png', (error, image) => {
      if (error) throw error;
      if (!map.hasImage('vehicle-icon')) {
        map.addImage('vehicle-icon', image!);
      }
    });
    map.loadImage('/images/maps/fleet-asset.png', (error, image) => {
      if (error) throw error;
      if (!map.hasImage('asset-icon')) {
        map.addImage('asset-icon', image!);
      }
    });
    map.loadImage('/images/maps/fleet-triangle.png', (error, image) => {
      if (error) throw error;
      if (!map.hasImage('triangle')) {
        map.addImage('triangle', image!);
      }
    });

    // Add GeoJSON source for clustering
    map.addSource('locations', {
      type: 'geojson',
      data: geoJSONDataRef.current,
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster
      clusterRadius: 50, // Distance between points to cluster them
    });

    // Add a layer for clusters
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'locations',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          100,
          '#f1f075',
          750,
          '#f28cb1',
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          100,
          30,
          750,
          40,
        ],
      },
    });

    // Add a layer for cluster labels
    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'locations',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      paint: {
        'text-color': '#ffffff',
      },
    });

    // Add a layer for unclustered points (individual markers)
    map.addLayer({
      id: 'unclustered',
      type: 'circle',
      source: 'locations',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': 12,
      }
    });

    map.addLayer({
      id: 'unclustered-type-icons',
      type: 'symbol',
      source: 'locations',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': [
          'match',
          ['get', 'type'],
          'vehicle', 'vehicle-icon',
          'asset', 'asset-icon',
          'garage', 'garage-icon',
          /* default */ 'vehicle-icon'
        ],
        'icon-size': 0.8,
        'icon-allow-overlap': true,
        'icon-offset': [0, 0],
      }
    });

    map.addLayer({
      id: 'unclustered-triangle',
      type: 'symbol',
      source: 'locations',
      filter: [
        'all',
        ['!', ['has', 'point_count']],
        ['==', ['get', 'status'], 'Driving']
      ],
      layout: {
        'icon-image': 'triangle',
        'icon-size': 0.7,
        'icon-allow-overlap': true,
        'icon-rotate': ['get', 'bearing'], // rotate icon by "bearing" property
        'icon-rotation-alignment': 'map',
        'icon-offset': [0, -25], // pushes it above the point
      },
    });

    // When a cluster is clicked, zoom to its bounds
    map.on('click', 'clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters'],
      });

      const clusterId = features[0].properties.cluster_id;
      map.getSource('locations').getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
        });
      });
    });

    // Add popups when clicking on unclustered points (individual markers)
    map.on('click', 'unclustered', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const properties = e.features[0].properties;

      const popupNode = document.createElement('div');
      let popupContent: React.ReactNode;

      switch (properties.type) {
        case 'vehicle':
          popupContent = (
            <div>
              <h3>Plate Number: {properties.plateNumber}</h3>
              <p>Device ID: {properties.deviceId}</p>
              <p>Driver: {properties.driver}</p>
              <p>Lat: {properties.latitude}</p>
              <p>Lng: {properties.longitude}</p>
              <LocationAddress
                latitude={properties.latitude ?? 0}
                longitude={properties.longitude ?? 0}
              />
            </div>
          );
          break;
        case 'asset':
          popupContent = (
            <div>
              <h3>Asset ID: {properties.assetId}</h3>
              <p>Device ID: {properties.deviceId}</p>
              <p>Type: {properties.assetType}</p>
              <p>Lat: {properties.latitude}</p>
              <p>Lng: {properties.longitude}</p>
              <LocationAddress
                latitude={properties.latitude ?? 0}
                longitude={properties.longitude ?? 0}
              />
            </div>
          );
          break;
        case 'garage':
          popupContent = (
            <div>
              <strong>${properties.name}</strong>
              <p>${properties.address}</p>
              <p>Phone: ${properties.phoneNumber}</p>
            </div>
          );
          break;
        default:
          popupContent = `<div><p>Unknown type</p></div>`;
      }
      
      createRoot(popupNode).render(popupContent);

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setDOMContent(popupNode)
        .addTo(map);
    });

    // Resize the map when the window is resized
    map.on('resize', () => {
      map.resize();
    });
    
    const bbox = turf.bbox(geoJSONDataRef.current);
    map.fitBounds(
      [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]],
      ],
      { padding: 50 }
    );

    setCounts({
      all: activeCount + inactiveCount,
      active: activeCount,
      inactive: inactiveCount,
    });
  }, [map, vehicles, assets, garages, displayType, statusFilter]);

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

      {/* Map container or fallback */}
      {mapboxTokenAvailable ? (
        <div ref={(el) => setMapContainer(el)} className="w-full h-full" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-600">
          <div className="text-center">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold mb-2">Map Unavailable</h3>
            <p className="text-sm">Mapbox access token not configured in demo mode</p>
            <p className="text-xs mt-1">Configure VITE_MAPBOX_ACCESS_TOKEN to enable maps</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapWithGaragesVehicles;
