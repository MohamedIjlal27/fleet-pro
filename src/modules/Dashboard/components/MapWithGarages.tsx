import React, { useEffect,useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { fetchWidgetData } from '../apis/apis.tsx';
import { createGarageMarkerElement } from '../../../utils/map/garage_icon';
import socketService from '../../../Socket';
import { useVehicleLocationUpdates } from '../../Map/hooks/useVehicleLocationUpdates';
import { createMarkerElement } from '../../../utils/map/pulsating_dot';
import { IVehicle, } from '../../core/interfaces/interfaces';
import { getVehiclesWithDeviceData } from '../../Map/apis/apis';

const MapWithGarages: React.FC = () => {
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [locations, setLocations] = useState<
    {
      id: number;
      name: string;
      city: string;
      country: string;
      address: string;
      latitude: number;
      longitude: number;
      phoneNumber: string;
    }[]
  >([]);



  //for vehicl live track
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});

  //Function to handle live location updates
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

      if (existingMarker) {
        existingMarker.setLngLat([data.longitude, data.latitude]);
        const popup = existingMarker.getPopup();

        if (popup) {
          const vehicle = vehicles.find(
            (vehicle) => vehicle.device?.deviceId.toString() === deviceIdStr
          );
          popup.setHTML(`
            <div>
              <h3>Plate Number: ${vehicle!.plateNumber}</h3>
              <h3>Device ID: ${data.deviceId}</h3>
              <p>Latitude: ${data.latitude}</p>
              <p>Longitude: ${data.longitude}</p>
            </div>
          `);
        }
      } else {
        const vehicle = vehicles.find(
          (vehicle) => vehicle.device?.deviceId.toString() === deviceIdStr
        );

        if (vehicle && mapRef.current) {
          const marker = new mapboxgl.Marker(createMarkerElement())
            .setLngLat([data.longitude, data.latitude])
            .addTo(mapRef.current!);
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div>
            <h3>Plate Number: ${vehicle.plateNumber}</h3>
            <p>Device ID: ${vehicle.device?.deviceId}</p>
            <p>Latitude: ${data.latitude}</p>
            <p>Longitude: ${data.longitude}</p>
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

  const markDeviceOnMap = (
    mapRef: React.RefObject<mapboxgl.Map>,
    selectedVehicle: IVehicle | null = null
  ) => {
    getVehiclesWithDeviceData().then((data: IVehicle[]) => {
      setVehicles(data);

      if (selectedVehicle) {
        if (!selectedVehicle.device) {
          console.warn(
            `No device data available for vehicle ${selectedVehicle.plateNumber}`
          );
          return;
        }

        const vehicleCoordinates: [number, number] = [
          selectedVehicle.device.longitude,
          selectedVehicle.device.latitude,
        ];

        Object.values(markersRef.current).forEach((marker) => marker.remove());

        const actualMarker = new mapboxgl.Marker(createMarkerElement())
          .setLngLat(vehicleCoordinates)
          .addTo(mapRef.current!);

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div>
            <h3>Plate Number: ${selectedVehicle.plateNumber}</h3>
            <p>Device ID: ${selectedVehicle.device.deviceId}</p>
            <p>Speed: ${selectedVehicle.device.speed}</p>
            <p>Movement: ${selectedVehicle.device.movement}</p>
            <p>Engine Ignition: ${selectedVehicle.device.ignition}</p>
            <p>Battery Voltage: ${selectedVehicle.device.batteryVoltage}</p>
            <p>Mileage: ${selectedVehicle.device.mileage} km</p>
            <p>Vehicle Battery: ${selectedVehicle.device.battery} V</p>
            <p>GSM Signal Level: ${selectedVehicle.device.gsmSignal ?? 0} dBm</p>
            <p>Latitude: ${selectedVehicle.device.latitude}</p>
            <p>Longitude: ${selectedVehicle.device.longitude}</p>
          </div>
        `);

        actualMarker.setPopup(popup);
        markersRef.current[selectedVehicle.device.deviceId] = actualMarker;

        mapRef.current?.setCenter([
          selectedVehicle.device.longitude,
          selectedVehicle.device.latitude,
        ]);
        mapRef.current?.setZoom(14);
      }
    });
  };

  useEffect(() => {
    // Fetch garage locations from API
    const fetchGarageLocations = async () => {
      try {
        const apiData = await fetchWidgetData({ wg9: true })
        const wgMapwithGarages = apiData.find(item => item.wgMapwithGarages !== undefined).wgMapwithGarages;
        // const dummydata = {
        //   garages: [
        //     {
        //       id: 1,
        //       name: "Garage One",
        //       city: "Toronto",
        //       country: "Canada",
        //       address: "1234 Maple St, Toronto, ON M1M 1M1",
        //       latitude: 43.6532,
        //       longitude: -79.3832,
        //       phoneNumber: "416-555-1234"
        //     },
        //     {
        //       id: 2,
        //       name: "Garage Two",
        //       city: "Toronto",
        //       country: "Canada",
        //       address: "5678 Oak St, Toronto, ON M2M 2M2",
        //       latitude: 43.6545,
        //       longitude: -79.3855,
        //       phoneNumber: "416-555-5678"
        //     },
        //     {
        //       id: 3,
        //       name: "Garage Three",
        //       city: "Mississauga",
        //       country: "Canada",
        //       address: "4321 Birch St, Mississauga, ON L5M 1M1",
        //       latitude: 43.5890,
        //       longitude: -79.6441,
        //       phoneNumber: "905-555-9876"
        //     },
        //     {
        //       id: 4,
        //       name: "Garage Four",
        //       city: "Oakville",
        //       country: "Canada",
        //       address: "8765 Pine St, Oakville, ON L6K 3P5",
        //       latitude: 43.4742,
        //       longitude: -79.6876,
        //       phoneNumber: "905-555-4321"
        //     }
        //   ]
        // };
        setLocations(wgMapwithGarages.garages); // Adjust based on the API response format
      } catch (error) {
        console.error('Error fetching garage locations:', error);
      }
    };

    fetchGarageLocations();
  }, []);

  useEffect(() => {
    if (mapContainer && !map && locations.length > 0) {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

      try {
        const mapInstance = new mapboxgl.Map({
          container: mapContainer,
          style: 'mapbox://styles/mapbox/light-v10',
          center: [locations[0].longitude, locations[0].latitude],
          zoom: 10,
          attributionControl: false,
        });

        mapInstance.addControl(new mapboxgl.NavigationControl());
        mapInstance.addControl(new mapboxgl.FullscreenControl());

        const bounds = new mapboxgl.LngLatBounds();

        locations.forEach((location) => {
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            closeOnClick: false,
          }).setHTML(
            `<strong>${location.name}</strong><br>${location.address}<br>Phone: ${location.phoneNumber}`
          );

          const marker = new mapboxgl.Marker(createGarageMarkerElement())
            .setLngLat([location.longitude, location.latitude])
            .addTo(mapInstance)
            .setPopup(popup);

          marker.getElement().addEventListener('mouseenter', () => {
            popup.addTo(mapInstance);
          });

          marker.getElement().addEventListener('mouseleave', () => {
            popup.remove();
          });

          bounds.extend([location.longitude, location.latitude]);
        });

        if (locations.length > 1) {
          mapInstance.fitBounds(bounds, { padding: 50 });
        }

        setMap(mapInstance);
      } catch (error) {
        console.error('Error initializing Mapbox:', error);
      }
    }
  }, [mapContainer, map, locations]);

  return (
    <div
      ref={(el) => setMapContainer(el)}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default MapWithGarages;
