import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import { Units } from '@turf/helpers';
import { Box } from '@mui/material';
import { toast } from 'react-toastify';
import { Menu, X } from 'lucide-react';

import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import { systemPlan, systemModule } from '@/utils/constants';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';

import Error404Page from '@/modules/core/pages/Error404Page';
import LockedFeature from '@/modules/core/components/LockedFeature';

import {
  fetchDevices,
  fetchGeoFences,
  createGeoFence,
  updateGeofence,
  deleteGeoFence,
} from './apis/apis';
import TopBar from './components/TopBar';
import GeofenceList from './components/GeofencesList';
import AddGeofenceForm from './components/AddGeofenceForm';
import GeofenceInfo from './components/GeofenceInfo';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

type CircleGeometry = {
  center: { lat: number; lon: number };
  radius: number;
  type: 'circle';
};

type PolygonGeometry = {
  path: { lat: number; lon: number }[];
  type: 'polygon';
};

type Geofence = {
  id: string;
  name: string;
  isActive: boolean;
  geoFenceIdid?: string;
  geometry: CircleGeometry | PolygonGeometry;
};

const GeofencePage: React.FC = () => {
  if (!checkModuleExists(systemModule.SettingsGeofences)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Geofences" />
    ) : (
      <Error404Page />
    );
  }

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const [drawGeofences, setDrawGeofences] = useState<Geofence | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [deviceList, setDeviceList] = useState<any[]>([]);
  const [selectedGeofences, setSelectedGeofences] = useState<string[]>([]);
  const [geofenceOptions, setGeofenceOptions] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isAddingGeofence, setIsAddingGeofence] = useState({
    isAdding: false,
    isFileUploading: false,
  });
  const [isGeofenceInfoOpen, setIsGeofenceInfoOpen] = useState(false);
  const [currentGeofence, setCurrentGeofence] = useState<string>('');
  const [openedGeofence, setOpenedGeofence] = useState<any>(null);
  const [isEditingGeofence, setIsEditingGeofence] = useState(false);
  const [editGeofence, setEditGeofence] = useState<Geofence | null>(null);
  const [isActive, setIsActive] = useState(true);

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1200); //896
      if (window.innerWidth < 1200) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    loadDevices();
    initMap();
    loadGeofences();
  }, []);

  useEffect(() => {
    console.log('useEffect selectedGeofences =', selectedGeofences);
    selectedGeofences.forEach((id) => {
      const selectedGeofence = geofenceOptions.geometries.find(
        (g) => g.id === id
      );

      console.log('useEffect id =', id);
      if (selectedGeofence) {
        drawGeofenceFromJSON(selectedGeofence);
      }
    });
  }, [selectedGeofences, geofenceOptions]);

  useEffect(() => {
    if (currentGeofence) {
      const selectedGeofence = geofenceOptions.geometries.find(
        (g: Geofence) => g.id === currentGeofence
      );
      if (selectedGeofence) {
        drawGeofence(selectedGeofence);
      }
    } else return;
  }, [currentGeofence]);

  const drawGeofence = (geofence: Geofence) => {
    const map = mapRef.current;
    if (!map) return;

    clearGeofences();

    // Generate a unique ID for this geofence
    const geofenceId = `geofence-${geofence.id || Date.now()}`;

    if (geofence.geometry.type === 'circle') {
      const options: { steps: number; units: Units } = {
        steps: 64,
        units: 'kilometers',
      };

      const circle = turf.circle(
        [geofence.geometry.center.lon, geofence.geometry.center.lat],
        geofence.geometry.radius,
        options
      );

      map.addSource(geofenceId, {
        type: 'geojson',
        data: circle,
      });

      map.addLayer({
        id: geofenceId,
        type: 'fill',
        source: geofenceId,
        paint: {
          'fill-color': '#088',
          'fill-opacity': 0.4,
          'fill-outline-color': 'yellow',
        },
      });

      map.addLayer({
        id: `${geofenceId}-outline`,
        type: 'line',
        source: geofenceId,
        paint: {
          'line-color': '#088',
          'line-width': 2,
        },
      });

      const bbox = turf.bbox(circle);
      map.fitBounds([bbox[0], bbox[1], bbox[2], bbox[3]], {
        padding: 20,
        maxZoom: 15,
      });
    } else if (geofence.geometry.type === 'polygon') {
      // Convert the path to GeoJSON format
      const coordinates = geofence.geometry.path.map((point) => [
        point.lon,
        point.lat,
      ]);

      // Create a GeoJSON polygon
      const polygonGeoJSON = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
      };

      // Add the polygon source
      map.addSource(geofenceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: polygonGeoJSON.geometry.coordinates,
          },
        },
      });

      // Add the fill layer
      map.addLayer({
        id: geofenceId,
        type: 'fill',
        source: geofenceId,
        paint: {
          'fill-color': '#088',
          'fill-opacity': 0.4,
          'fill-outline-color': 'yellow',
        },
      });

      // Add outline layer
      map.addLayer({
        id: `${geofenceId}-outline`,
        type: 'line',
        source: geofenceId,
        paint: {
          'line-color': '#088',
          'line-width': 2,
        },
      });

      const bbox = turf.bbox({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: polygonGeoJSON.geometry.coordinates,
        },
      });
      map.fitBounds([bbox[0], bbox[1], bbox[2], bbox[3]], {
        padding: 20,
        maxZoom: 15,
      });
    }
  };

  const onClickEditGeofence = (geofenceId: string) => {
    // Function should come from parent component
    // when we click on edit, we pass the geofenceId to the parent component
    // it will get the details and set to drawGeofence (w/ model Geofence)
    // then pass it to add geo fence with is edit true
    const selectedGeofence = geofenceOptions.geofences.find(
      (geofence: any) => geofence.id === geofenceId
    );
    const selectedGeofenceGeometries = geofenceOptions.geometries.find(
      (geofence: any) => geofence.id === geofenceId
    );
    if (selectedGeofence && selectedGeofenceGeometries) {
      // setDrawGeofences([selectedGeofenceGeometries]);
      setIsActive(selectedGeofence.isActive);
      drawGeofence(selectedGeofenceGeometries);
      setIsGeofenceInfoOpen(false);
      setIsAddingGeofence({
        isAdding: true,
        isFileUploading: false,
      });
      setIsEditingGeofence(true);
      setEditGeofence(selectedGeofenceGeometries);
    }
  };

  const onClickDeleteGeofence = async (geofenceId: string) => {
    await deleteGeoFence(Number(geofenceId)).then(() => {
      setIsGeofenceInfoOpen(false);
      loadGeofences();
      loadDevices();
      clearGeofences();
      toast.success('Geofence deleted successfully!');
    });
  };

  const loadDevices = async () => {
    try {
      const response = await fetchDevices();
      console.log('device respone ', response);
      setDeviceList(response.filter((device: any) => device.type === 'FLESPI'));
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const initMap = () => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-79.384116, 43.65326],
      zoom: 4,
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
    });

    map.addControl(draw);
    mapRef.current = map;
    drawRef.current = draw;

    return () => map.remove();
  };

  const startDrawPolygon = () => {
    if (drawRef.current) {
      // This activates the polygon drawing mode
      drawRef.current.changeMode('draw_polygon');
    }
  };

  const createNewPolygonGeofence = (
    features: mapboxgl.GeoJSONFeature[],
    name: string
  ) => {
    console.log('createNewPolygonGeofence name = ', name);

    setDrawGeofences(null);

    features.forEach((feature) => {
      if (feature.geometry.type === 'Polygon') {
        const coordinates = feature.geometry.coordinates[0].map(
          ([lon, lat]) => ({
            lon,
            lat,
          })
        );

        const newGeofence: Geofence = {
          id: `geofence-${Date.now()}`,
          name: name,
          geometry: { path: coordinates, type: 'polygon' },
        };

        setDrawGeofences(newGeofence);
      }
    });
  };

  const drawGeofenceFromJSON = (geofence: Geofence) => {
    const map = mapRef.current;
    if (!map) return;

    if (geofence.geometry.type === 'circle') {
      const { center, radius } = geofence.geometry;

      // Create the circle using Turf.js
      const circle = turf.circle([center.lon, center.lat], radius, {
        steps: 50, // Number of points to approximate the circle
        units: 'kilometers',
      });

      // Create a lineString from the circle's geometry (polygon boundary)
      const line = turf.lineString(...circle.geometry.coordinates);
      console.log('drawGeofenceFromJSON line = ', line);

      // Add the circle as a geojson source
      map.addSource(geofence.id, {
        type: 'geojson',
        data: circle,
      });

      // Draw the circle as a fill layer
      map.addLayer({
        id: geofence.id,
        type: 'fill',
        source: geofence.id,
        paint: {
          'fill-color': '#088', // Circle fill color
          'fill-opacity': 0.4,
          'fill-outline-color': 'yellow', // Outline color of the circle
        },
      });

      // Add the circle outline as a line layer
      map.addLayer({
        id: `${geofence.id}-outline`,
        type: 'line',
        source: geofence.id,
        paint: {
          'line-color': '#005bb5', // Outline color
          'line-width': 2,
        },
      });

      setDrawGeofences(geofence);

      // Calculate the bounding box of the circle and zoom to it
      const bbox = turf.bbox(circle);
      map.fitBounds(bbox, {
        padding: 20, // Optional padding around the bounds
        maxZoom: 15, // Optional max zoom
      });
    } else if (geofence.geometry.type === 'polygon') {
      const coordinates = geofence.geometry.path.map((point) => [
        point.lon,
        point.lat,
      ]);

      map.addSource(geofence.id, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates],
          },
        },
      });

      // Draw the polygon as a fill layer
      map.addLayer({
        id: geofence.id,
        type: 'fill',
        source: geofence.id,
        paint: {
          'fill-color': '#f54242',
          'fill-opacity': 0.3,
        },
      });

      // Add the polygon outline as a line layer
      map.addLayer({
        id: `${geofence.id}-outline`,
        type: 'line',
        source: geofence.id,
        paint: {
          'line-color': '#f54242',
          'line-width': 2,
        },
      });

      setDrawGeofences(geofence);

      // Calculate the bounding box of the polygon and zoom to it
      const bbox = turf.bbox({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
      });
      map.fitBounds(bbox, {
        padding: 20, // Optional padding around the bounds
        maxZoom: 15, // Optional max zoom
      });
    }
  };

  // Fetch all geofences from the backend
  const loadGeofences = async () => {
    const response = await fetchGeoFences();
    const geofences = response.data;
    console.log('fetchGeoFence ', geofences);

    const updatedGeofences: Geofence[] = geofences
      .map((geofence: any) => {
        if (geofence.type === 'polygon') {
          return {
            id: geofence.id,
            geoFenceId: geofence.geoFenceId,
            name: `${geofence.name}`,
            type: geofence.type,
            geoFenceVehicleCount: geofence.geoFenceVehicleCount,
            updatedAt: geofence.updatedAt,
            createdAt: geofence.createdAt,
            geometry: {
              path: geofence.metadata.map(
                (coords: { lat: number; lon: number }) => ({
                  lat: coords.lat,
                  lon: coords.lon,
                })
              ),
              type: 'polygon',
            },
          };
        } else if (geofence.type === 'circle') {
          return {
            id: geofence.id,
            geoFenceId: geofence.geoFenceId,
            name: `${geofence.name}-${geofence.id}`,
            updatedAt: geofence.updatedAt,
            createdAt: geofence.createdAt,
            geometry: {
              center: geofence.metadata.center,
              radius: geofence.metadata.radius,
              type: 'circle',
            },
          };
        }
        return null;
      })
      .filter(Boolean);

    const geofenceList = {
      geofences: geofences,
      geometries: updatedGeofences,
    };

    setGeofenceOptions(geofenceList);
  };

  const clearGeofences = () => {
    const map = mapRef.current;
    if (!map) return;

    // drawGeofences.forEach((geofence) => {
    //   if (map.getLayer(geofence.id)) map.removeLayer(geofence.id);
    //   if (map.getLayer(`${geofence.id}-outline`))
    //     map.removeLayer(`${geofence.id}-outline`);
    //   if (map.getSource(geofence.id)) map.removeSource(geofence.id);
    // });

    if (drawGeofences) {
      if (map.getLayer(drawGeofences.id)) map.removeLayer(drawGeofences.id);
      if (map.getLayer(`${drawGeofences.id}-outline`))
        map.removeLayer(`${drawGeofences.id}-outline`);
      if (map.getSource(drawGeofences.id)) map.removeSource(drawGeofences.id);
    }

    // Remove all existing geofence layers and sources
    const existingLayers = map.getStyle()?.layers || [];
    existingLayers.forEach((layer: any) => {
      if (layer.id.startsWith('geofence-')) {
        map.removeLayer(layer.id);
      }
    });

    // Get all sources and remove geofence sources
    const style = map.getStyle();
    const existingSources = style ? Object.keys(style.sources) : [];
    existingSources.forEach((sourceId) => {
      if (sourceId.startsWith('geofence-')) {
        map.removeSource(sourceId);
      }
    });

    clearDrawnGeofences();
  };

  const clearDrawnGeofences = () => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
    } else {
      console.log('Draw instance is not initialized.');
    }
    setDrawGeofences(null);
    setSelectedGeofences([]);
  };

  const saveGeofences = async () => {
    if (isSaving) return;
    setIsSaving(true);

    console.log('Saving geofences to backend:', drawGeofences);

    // for (let geofence of drawGeofences) {
    //   const { geometry } = geofence;
    //   let type = geometry.type;
    //   let data;

    //   // If the geofence is a circle
    //   if (type === 'circle') {
    //     data = {
    //       center: {
    //         lat: geometry.center.lat,
    //         lon: geometry.center.lon,
    //       },
    //       radius: geometry.radius, // in meters
    //     };
    //   }

    //   // If the geofence is a polygon
    //   else if (type === 'polygon') {
    //     data = geometry.path.map((point) => ({
    //       lat: point.lat,
    //       lon: point.lon,
    //     }));
    //   }

    //   try {
    //     // Call the API to create the geofence
    //     const response = await createGeoFence(geofence.name, type, data);
    //     console.log(`GeoFence ${geofence.name} created successfully`, response);
    //     toast.success(`GeoFence ${geofence.name} created successfully`);
    //   } catch (error) {
    //     console.error(`Error creating GeoFence ${geofence.id}:`, error);
    //     toast.error(`Error creating GeoFence ${geofence.id}`);
    //   }
    // }

    if (!drawGeofences) return;

    const { geometry } = drawGeofences;
    let type = geometry.type;
    const isEnabled = isActive;
    let data;

    // If the geofence is a circle
    if (type === 'circle') {
      data = {
        center: {
          lat: geometry.center.lat,
          lon: geometry.center.lon,
        },
        radius: geometry.radius, // in meters
      };
    }

    // If the geofence is a polygon
    else if (type === 'polygon') {
      data = geometry.path.map((point) => ({
        lat: point.lat,
        lon: point.lon,
      }));
    }

    try {
      // Call the API to create the geofence
      const response = await createGeoFence(
        drawGeofences.name,
        type,
        data,
        isEnabled
      );
      console.log(
        `GeoFence ${drawGeofences.name} created successfully`,
        response
      );
      toast.success(`GeoFence ${drawGeofences.name} created successfully`);
    } catch (error) {
      console.error(`Error creating GeoFence ${drawGeofences.id}:`, error);
      toast.error(`Error creating GeoFence ${drawGeofences.id}`);
    }

    setIsSaving(false);
    loadGeofences();
    loadDevices();
  };

  const updateGeofenceById = async (geofenceId: string) => {
    if (isSaving) return;
    setIsSaving(true);

    console.log(
      'Updating geofences to backend:',
      drawGeofences,
      'geofenceId:',
      geofenceId
    );

    if (!drawGeofences) return;

    const { geometry } = drawGeofences;
    let type = geometry.type;
    const isEnabled = isActive;
    let data;

    // If the geofence is a circle
    if (type === 'circle') {
      data = {
        center: {
          lat: geometry.center.lat,
          lon: geometry.center.lon,
        },
        radius: geometry.radius, // in meters
      };
    }

    // If the geofence is a polygon
    else if (type === 'polygon') {
      data = geometry.path.map((point) => ({
        lat: point.lat,
        lon: point.lon,
      }));
    }

    try {
      // Call the API to update the geofence
      const response = await updateGeofence(geofenceId, isEnabled, type, data);
      console.log(
        `GeoFence ${drawGeofences.name} updated successfully`,
        response
      );
      toast.success(`GeoFence ${drawGeofences.name} updated successfully`);
    } catch (error) {
      console.error(`Error creating GeoFence ${drawGeofences.id}:`, error);
      toast.error(`Error creating GeoFence ${drawGeofences.id}`);
    }

    setIsSaving(false);
    loadGeofences();
    loadDevices();
  };

  const drawCircle = (
    lon: number,
    lat: number,
    radius: number,
    name: string
  ) => {
    const map = mapRef.current;
    if (!map) return;

    const options: { steps: number; units: Units } = {
      steps: 64,
      units: 'kilometers',
    }; // More steps = smoother circle
    const circle = turf.circle([lon, lat], radius, options);

    // Add the circle as a source and layer to Mapbox
    const circleId = `circle-${Date.now()}`;
    map.addSource(circleId, {
      type: 'geojson',
      data: circle,
    });

    map.addLayer({
      id: circleId,
      type: 'fill',
      source: circleId,
      paint: {
        'fill-color': '#088',
        'fill-opacity': 0.4,
        'fill-outline-color': 'yellow',
      },
    });

    // Optionally, save the geofence to the state
    const newGeofence: Geofence = {
      id: circleId,
      name: name,
      isActive: true,
      geometry: {
        type: 'circle',
        center: { lon: lon, lat: lat },
        radius,
      },
    };
    setDrawGeofences(newGeofence);

    const bbox = turf.bbox(circle);
    map.fitBounds([bbox[0], bbox[1], bbox[2], bbox[3]], {
      padding: 20,
      maxZoom: 15,
    });
  };

  const handleDeleteFeatures = () => {
    if (drawRef.current) {
      const selectedFeatures = drawRef.current.getSelected();
      if (selectedFeatures.features.length > 0) {
        drawRef.current.delete(
          selectedFeatures.features.map((feature) => feature.id as string)
        );
      } else {
        console.log('No features selected to delete.');
      }
      clearGeofences();
    }
  };

  const handleFileChange = (file: File, name: string) => {
    setFileName(file.name); // Save file name for reference
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      parseCSV(content, name);
    };

    reader.readAsText(file);
  };

  const parseCSV = (content: string, name: string) => {
    try {
      const rows = content
        .split('\n')
        .map((row) => row.trim())
        .filter((row) => row);

      if (rows.length === 0) {
        toast.error('CSV is empty.');
        return;
      }

      // Extract headers and validate first two columns
      const headers = rows[0]
        .split(',')
        .map((header) => header.trim().toLowerCase());

      if (headers.length < 2 || headers[0] !== 'lon' || headers[1] !== 'lat') {
        toast.error(
          "Invalid CSV format. The first two columns must be 'lon' and 'lat'."
        );
        return;
      }

      // Parse data
      const coordinates = rows.slice(1).map((row) => {
        const values = row.split(',').map((value) => value.trim());
        return {
          lon: parseFloat(values[0]),
          lat: parseFloat(values[1]),
        };
      });

      // Ensure at least 3 points for a valid polygon
      if (coordinates.length < 3) {
        toast.error('A polygon must have at least 3 coordinate points.');
        return;
      }

      clearGeofences();

      // Create and store new geofence
      const newGeofence: Geofence = {
        id: `geofence-${Date.now()}`,
        isActive: true,
        name: name,
        geometry: { path: coordinates, type: 'polygon' },
      };

      drawGeofenceFromJSON(newGeofence);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast.error('Failed to parse the CSV. Please check its format.');
    }
  };

  const handleGeofenceInfoTabOpen = (open: boolean, geofence?: any) => {
    if (!open) {
      setIsGeofenceInfoOpen(false);
      setOpenedGeofence(null);
    } else if (geofence) {
      setIsGeofenceInfoOpen(true);
      setOpenedGeofence(geofence);
    } else {
      console.error('Geofence ID is required to open info tab.');
    }
  };

  return (
    <div>
      <TopBar
        addNewGeofence={(isFile: boolean) => {
          clearGeofences();
          setIsAddingGeofence({ isAdding: true, isFileUploading: isFile });
        }}
      />
      <div
        className="flex relative flex-col w-full md:h-[calc(100vh - 172px)] h-[calc(100vh - 164px)]"
        style={{ height: 'calc(100vh - 195px)' }}
      >
        {/* Mobile toggle button - only visible on small screens */}
        {isMobile && !sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-4 left-4 z-30 p-2 bg-white text-gray-400 rounded-md shadow-lg"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="flex flex-1 overflow-hidden relative gap-2">
          {/* Sidebar content */}
          <div
            className={`text-white h-full w-1/3 ${
              isMobile ? 'hidden' : 'block'
            }`}
          >
            {sidebarOpen && isAddingGeofence.isAdding ? (
              <AddGeofenceForm
                drawCircle={drawCircle}
                handleFileUpload={handleFileChange}
                createNewPolygonGeofence={createNewPolygonGeofence}
                saveGeofences={saveGeofences}
                handleDicline={() => {
                  clearGeofences();
                  setIsAddingGeofence({
                    isAdding: false,
                    isFileUploading: false,
                  });
                  setIsEditingGeofence(false);
                }}
                isFileUploading={isAddingGeofence.isFileUploading}
                clearGeofences={clearGeofences}
                drawRef={drawRef}
                mapRef={mapRef}
                isEditing={isEditingGeofence}
                editGeofence={editGeofence}
                updateGeofence={updateGeofenceById}
                isActive={isActive}
                setIsActive={setIsActive}
              />
            ) : (
              <GeofenceList
                currentGeofence={currentGeofence}
                setCurrentGeofence={setCurrentGeofence}
                geofences={geofenceOptions}
                openInfo={handleGeofenceInfoTabOpen}
              />
            )}
          </div>

          <div
            className={`absolute transition-all duration-300 ease-in-out z-30 h-full w-4/6 2xsm:w-1/2 rounded-lg ${
              sidebarOpen ? (isMobile ? 'block' : 'hidden') : 'hidden'
            }`}
          >
            <div className={`rounded-lg px-4 bg-white m-4 text-white h-full`}>
              {sidebarOpen && isAddingGeofence.isAdding ? (
                <AddGeofenceForm
                  drawCircle={drawCircle}
                  createNewPolygonGeofence={createNewPolygonGeofence}
                  handleFileUpload={handleFileChange}
                  saveGeofences={saveGeofences}
                  handleDicline={() => {
                    clearGeofences();
                    setIsAddingGeofence({
                      isAdding: false,
                      isFileUploading: false,
                    });
                    setIsEditingGeofence(false);
                  }}
                  isFileUploading={isAddingGeofence.isFileUploading}
                  clearGeofences={clearGeofences}
                  drawRef={drawRef}
                  mapRef={mapRef}
                  isEditing={isEditingGeofence}
                  editGeofence={editGeofence}
                  updateGeofence={updateGeofenceById}
                  isActive={isActive}
                  setIsActive={setIsActive}
                />
              ) : (
                <GeofenceList
                  currentGeofence={currentGeofence}
                  setCurrentGeofence={setCurrentGeofence}
                  geofences={geofenceOptions}
                  openInfo={handleGeofenceInfoTabOpen}
                />
                // we are not referring to the geofenceOptions directly in the info page that's why it's not being reflected.
              )}
            </div>
            {isMobile && sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 -right-8 z-30 p-2 bg-white text-gray-400 rounded-md shadow-lg"
                aria-label="Toggle sidebar"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Main content - expands to fill available space */}
          <div
            className={`mt-2 transition-all duration-300 ease-in-out ${
              isMobile ? 'w-full' : sidebarOpen ? 'w-2/3' : 'w-full'
            }`}
          >
            <div
              className="h-full"
              style={{ display: isGeofenceInfoOpen ? 'block' : 'none' }}
            >
              <GeofenceInfo
                geofence={openedGeofence}
                loadGeofences={loadGeofences}
                closeInfo={() => handleGeofenceInfoTabOpen(false)}
                onClickEdit={onClickEditGeofence}
                onClickDelete={onClickDeleteGeofence}
              />
            </div>

            <div
              className="h-full w-full rounded-lg"
              style={{ display: isGeofenceInfoOpen ? 'none' : 'block' }}
            >
              <Box
                ref={mapContainerRef}
                flex="1"
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeofencePage;
