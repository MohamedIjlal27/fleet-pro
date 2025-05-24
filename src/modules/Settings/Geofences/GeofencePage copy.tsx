import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  Input,
  Link,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from '@mui/material';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import * as turf from '@turf/turf';
import {
  fetchDevices,
  fetchGeoFence,
  fetchGeoFences,
  createGeoFence,
  tagGeoFencetoDevice,
} from './apis/apis';
import { toast } from 'react-toastify';
import AssignDevicesModal from './components/AssignDevicesModal';
import { systemPlan, systemModule } from '@/utils/constants';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from '@/modules/core/pages/Error404Page';
import LockedFeature from '@/modules/core/components/LockedFeature';

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
  type: string;
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
  const [drawGeofences, setDrawGeofences] = useState<Geofence[]>([]);
  const [name, setName] = useState<string>(`geofence-${Date.now()}`);
  const [modalOpen, setModalOpen] = useState(false);
  const [radius, setRadius] = useState(500); // Example radius, can be user-defined
  const [center, setCenter] = useState({ lon: -79.384116, lat: 43.65326 }); // Example center
  const [geofenceMode, setGeofenceMode] = useState<'polygon' | 'circle'>(
    'circle'
  );
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [deviceList, setDeviceList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedGeofence, setSelectedGeofence] = useState<string>('');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<
    'ALERT' | 'SPEED_CONTROL' | 'IMMOBILIZE'
  >('ALERT');

  const [selectedGeofences, setSelectedGeofences] = useState<string[]>([]);
  const [geofenceOptions, setGeofenceOptions] = useState<Geofence[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadDevices();
    initMap();
    loadGeofences();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await fetchDevices();
      console.log('device respone ', response);
      setDeviceList(response.filter((device) => device.type === 'FLESPI'));
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
      controls: {
        polygon: true,
        trash: true,
      },
    });

    map.addControl(draw);
    mapRef.current = map;
    drawRef.current = draw;

    map.on('draw.create', (e) => {
      const features = e.features;
      handleNewGeofence(features);
    });

    // map.on("draw.update", (e) => {
    //   console.log("Polygon Updated:", e.features[0].geometry.coordinates);
    // });

    // map.on("draw.selectionchange", handlePolygonEdit);

    return () => map.remove();
  };

  // const handlePolygonEdit = () => {
  //   const draw = drawRef.current;
  //   if (!draw) return;

  //   const selectedFeatures = draw.getSelected();
  //   if (selectedFeatures.features.length > 0) {
  //     const polygonId = selectedFeatures.features[0].id; // Get selected polygon ID
  //     draw.changeMode("direct_select", { featureId: polygonId }); // Enable edit mode
  //   }
  // };

  //add the draw geofence from mapbox to setDrawGeofences state
  const handleNewGeofence = (features: mapboxgl.GeoJSONFeature[]) => {
    console.log('handleNewGeofence name = ', name);
    console.log('draw.create features = ', features);
    features.forEach((feature) => {
      if (feature.geometry.type === 'Polygon') {
        const coordinates = feature.geometry.coordinates[0].map(
          ([lon, lat]) => ({
            lon,
            lat,
          })
        );

        setDrawGeofences((prev) => {
          const newGeofence: Geofence = {
            id: `geofence-${Date.now()}`,
            name: name, // Now using the latest name state
            geometry: { path: coordinates, type: 'polygon' },
          };
          return [...prev, newGeofence];
        });
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

      setDrawGeofences((prev) => [...prev, geofence]);

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

      setDrawGeofences((prev) => [...prev, geofence]);

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
            name: `${geofence.name}-${geofence.id}`,
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
            geometry: {
              center: geofence.metadata.center,
              radius: geofence.metadata.radius,
              type: 'circle',
            },
          };
        }
        return null;
      })
      .filter(Boolean); // Filter out any null values if the geofence type is unexpected

    // const updatedGeofence: Geofence = {
    //   id: geofence.id,
    //   name: geofence.type === 'polygon' ? `polygon-${geofence.id}` : `circle-${geofence.id}`,
    //   geometry: geofence.type === 'polygon'
    //     ? {
    //       path: geofence.metadata.map((coords: { lat: number; lon: number }) => ({
    //         lat: coords.lat,
    //         lon: coords.lon,
    //       })),
    //       type: 'polygon',
    //     }
    //     : {
    //       center: geofence.metadata.center,
    //       radius: geofence.metadata.radius,
    //       type: 'circle',
    //     },
    // };

    // console.log("updatedGeofence =", updatedGeofence);

    setGeofenceOptions(updatedGeofences);
  };

  // Handle geofence selection
  const handleSelectGeofences = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const selectedIds = event.target.value as string[];
    setSelectedGeofences(selectedIds);
  };

  // Draw selected geofences on the map
  useEffect(() => {
    console.log('useEffect selectedGeofences =', selectedGeofences);
    selectedGeofences.forEach((id) => {
      const selectedGeofence = geofenceOptions.find((g) => g.id === id);

      console.log('useEffect id =', id);
      if (selectedGeofence) {
        drawGeofenceFromJSON(selectedGeofence);
      }
    });
  }, [selectedGeofences, geofenceOptions]);

  const clearGeofences = () => {
    const map = mapRef.current;
    if (!map) return;

    drawGeofences.forEach((geofence) => {
      if (map.getLayer(geofence.id)) map.removeLayer(geofence.id);
      if (map.getLayer(`${geofence.id}-outline`))
        map.removeLayer(`${geofence.id}-outline`);
      if (map.getSource(geofence.id)) map.removeSource(geofence.id);
    });
    clearDrawnGeofences();
  };

  const clearDrawnGeofences = () => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
    } else {
      console.log('Draw instance is not initialized.');
    }
    setName(`geofence-${Date.now()}`);
    setDrawGeofences([]);
    setSelectedGeofences([]);
  };

  // Function to save geofences
  const saveGeofences = async () => {
    if (isSaving) return; // Prevent multiple clicks
    setIsSaving(true);

    console.log('Saving geofences to backend:', drawGeofences);

    for (let geofence of drawGeofences) {
      const { geometry } = geofence;
      let type = geometry.type;
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
        const response = await createGeoFence(name, type, data);
        console.log(`GeoFence ${geofence.name} created successfully`, response);
        toast.success(`GeoFence ${geofence.name} created successfully`);
      } catch (error) {
        console.error(`Error creating GeoFence 123 ${geofence.id}:`, error);
        toast.error(`Error creating GeoFence 123 ${geofence.id}`);
      }
    }

    setIsSaving(false);
    loadGeofences();
    loadDevices();
  };

  const drawPolygon = () => {
    if (drawRef.current) {
      drawRef.current.changeMode('draw_polygon');
    }
  };

  const drawCircle = () => {
    const map = mapRef.current;
    if (!map) return;

    // Create the circle using Turf.js from the user input
    const options = { steps: 64, units: 'kilometers' }; // More steps = smoother circle
    const circle = turf.circle([center.lon, center.lat], radius, options);

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
      geometry: {
        type: 'circle',
        center: { lon: center.lon, lat: center.lat },
        radius,
      },
    };
    setDrawGeofences((prev) => [...prev, newGeofence]);
  };

  const handleModeSelection = (mode: 'polygon' | 'circle') => {
    clearGeofences();
    setGeofenceMode(mode);
    // if (mode === "polygon") {
    //   drawPolygon()
    // }

    // if (mode === "circle") {
    //   setModalOpen(true);
    // }

    setModalOpen(true);
  };

  // Custom function to delete selected features
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    if (file.type !== 'text/csv') {
      toast.error('Only CSV files are allowed.');
      return;
    }

    setFileName(file.name); // Save file name for reference
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      parseCSV(content);
    };

    reader.readAsText(file);
  };

  const parseCSV = (content: string) => {
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

      // Create and store new geofence
      const newGeofence: Geofence = {
        id: `geofence-${Date.now()}`,
        name: name,
        geometry: { path: coordinates, type: 'polygon' },
      };

      drawGeofenceFromJSON(newGeofence);
      setModalOpen(false);

      toast.success('CSV parsed successfully and geofence created.');
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast.error('Failed to parse the CSV. Please check its format.');
    }
  };

  // Handle geofence selection (single choice)
  const handleGeofenceChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setSelectedGeofence(event.target.value as string);
  };

  // Handle individual device selection
  const handleDeviceChange = (deviceId: string) => {
    console.log('handleDeviceChange deviceId=', deviceId);
    setSelectedDevices((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  // Handle "Select All" toggle
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(deviceList.map((device) => device.id));
    }
    setSelectAll(!selectAll);
  };

  const handleAssignClick = async () => {
    loadGeofences();
    if (!selectedGeofence || selectedDevices.length === 0) return;

    console.log('Selected Geofence:', selectedGeofence);
    console.log('Selected Devices:', selectedDevices);

    try {
      // Loop through selected devices and assign each to the geofence
      await Promise.all(
        selectedDevices.map(async (deviceId) => {
          await tagGeoFencetoDevice(
            parseInt(deviceId),
            parseInt(selectedGeofence),
            selectedAction
          );
        })
      );

      console.log('All devices successfully assigned to geofence.');
      toast.success('All devices successfully assigned to geofence.');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to assign geofence to devices:', error);
      toast.error('Failed to assign geofence to devices');
    }
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        disableAutoFocus={true}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Assign Devices to Geofence
          </Typography>

          {/* Single-Select Geofence Dropdown */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="geofence-label">Select Geofence</InputLabel>
            <Select
              labelId="geofence-label"
              value={selectedGeofence}
              onChange={handleGeofenceChange}
              displayEmpty
            >
              {geofenceOptions.map((geofence) => (
                <MenuItem key={geofence.id} value={geofence.id}>
                  {geofence.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Action Selection Dropdown */}
          {/* Action Selection Dropdown */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="action-label">Select Action</InputLabel>
            <Select
              labelId="action-label"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              displayEmpty
            >
              <MenuItem value="ALERT">Alert</MenuItem>
              <MenuItem value="SPEED_CONTROL">Speed Control</MenuItem>
              <MenuItem value="IMMOBILIZE">Immobilize</MenuItem>
            </Select>
          </FormControl>

          {/* Device List with Scrollable View (Filtered for "FLESPI" type) */}
          <Box
            sx={{
              maxHeight: 200,
              overflowY: 'auto',
              border: '1px solid #ccc',
              borderRadius: 1,
              p: 1,
            }}
          >
            {/* Select All Checkbox inside the box */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, px: 1 }}>
              <Checkbox checked={selectAll} onChange={handleSelectAll} />
              <Typography variant="body1">Select All</Typography>
            </Box>

            {deviceList
              .filter((device) => device.type === 'FLESPI') // Filter for FLESPI devices
              .map((device) => (
                <Box
                  key={device.id}
                  sx={{ display: 'flex', alignItems: 'center', px: 1 }}
                >
                  <Checkbox
                    checked={selectedDevices.includes(device.id)}
                    onChange={() => handleDeviceChange(device.id)}
                  />
                  <Typography>
                    Name: {device.deviceName} ID: {device.id}
                  </Typography>
                </Box>
              ))}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setIsModalOpen(false);
                setDrawGeofences([]);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAssignClick}
              disabled={!selectedGeofence || selectedDevices.length === 0}
            >
              Assign
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        disableAutoFocus={true}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            width: 300,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Input Geofence Data
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Input Fields for Circle Parameters */}
            {geofenceMode === 'circle' && (
              <>
                <TextField
                  label="Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Latitude"
                  type="number"
                  value={center.lat}
                  onChange={(e) =>
                    setCenter({ ...center, lat: parseFloat(e.target.value) })
                  }
                  fullWidth
                />

                <TextField
                  label="Longitude"
                  type="number"
                  value={center.lon}
                  onChange={(e) =>
                    setCenter({ ...center, lon: parseFloat(e.target.value) })
                  }
                  fullWidth
                />
                <TextField
                  label="Radius (km)"
                  type="number"
                  value={radius}
                  onChange={(e) => setRadius(parseFloat(e.target.value))}
                  fullWidth
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setModalOpen(false);
                    drawCircle(); // Call the drawCircle function
                  }}
                >
                  Draw Circle
                </Button>
              </>
            )}

            {/* Input Fields for Polygon Parameters */}
            {geofenceMode === 'polygon' && (
              <>
                <TextField
                  label="Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                />
                <Typography fontWeight="bold" sx={{ marginBottom: '10px' }}>
                  Upload CSV File
                </Typography>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  inputProps={{ accept: '.csv' }}
                  sx={{ mb: 2 }}
                />
                <Typography variant="subtitle1">CSV Example</Typography>
                <Link
                  target="_blank"
                  href="/download/csv/geofence-template.csv"
                  sx={{ marginRight: 2, color: '#0070f3' }}
                >
                  geofence-template.csv
                </Link>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setModalOpen(false);
                    drawPolygon(); // Call the drawPolygon function
                  }}
                >
                  Draw Polygon
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Modal>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        padding={2}
        bgcolor="#f5f5f5"
      >
        <Typography variant="h6">Geofence Drawer</Typography>
        <Box display="flex" gap={2}>
          <Button variant="contained" onClick={() => setIsModalOpen(true)}>
            Assign Device
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={() => handleModeSelection('polygon')}
          >
            Draw Polygon
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleModeSelection('circle')}
          >
            Draw Circle
          </Button>
          {/* <Button variant="contained" color="secondary" onClick={handleDeleteFeatures}>
            Cancle Drawing
          </Button> */}
          <Button
            variant="contained"
            color="primary"
            onClick={saveGeofences}
            disabled={isSaving}
          >
            Save Geofences
          </Button>
          <Button variant="outlined" color="secondary" onClick={clearGeofences}>
            Clear Geofences
          </Button>
        </Box>
      </Box>
      <Box
        ref={mapContainerRef}
        flex="1"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '60%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      />
    </Box>
  );
};

export default GeofencePage;
