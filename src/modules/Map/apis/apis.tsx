// import axiosInstance from '../../../utils/axiosConfig';
import {
  IDeviceTelemetry,
  IVehicle,
  IDevice,
} from '../../../modules/core/interfaces/interfaces';
import { IRouteHistoryData } from '../../../modules/core/interfaces/interfaces';

// Demo data for vehicles with device telemetry
const demoVehicles: IVehicle[] = [
  {
    id: 1,
    make: 'Ford',
    model: 'Transit',
    trim: 'Base',
    vin: '1FTBW2CM5MKA12345',
    chasisNo: 'CH12345',
    plateNumber: 'ABC-123',
    year: 2023,
    category: 'Van',
    bodyClass: 'Commercial',
    driveType: 'RWD',
    fuelType: 'Gasoline',
    color: 'White',
    doors: 4,
    odometer: 25000,
    transmissionStyle: 'Automatic',
    status: 'Active',
    serviceType: 'Delivery',
    dealershipId: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    organizationId: 1,
    entityType: 'Vehicle',
    assetId: 'V001',
    device: {
      latitude: 43.6532,
      longitude: -79.3832,
      speed: 45,
      timestamp: Date.now(),
      direction: 90,
      fuelLevel: 75,
      engineTemperature: 85,
      tirePressureLow: false,
      harshAcceleration: false,
      harshBraking: false,
      harshCornering: false,
      overSpeeding: false,
      batteryVoltage: 12.5,
      panicAlert: false,
      temperAlert: false,
      externalPowerVoltage: 12.8,
      mowingEfficiency: 0,
      mowingVolume: 0,
      gsmSignal: 85,
      movement: true,
      serverTimestamp: Date.now(),
      sleepMode: 0,
      mileage: 25000,
      ignition: true,
      rssiDistance: 0,
      deviceTypeId: 1,
      satellites: 8,
      valid: true,
      ident: 'DEVICE001',
      deviceName: 'Ford Transit GPS',
      battery: 95,
      deviceId: 1001,
      id: 1,
      deviceProtocol: 'GT06',
      deviceTypeName: 'GPS Tracker',
      organizationId: 1
    },
    garage: {
      id: 1,
      name: 'Main Depot',
      address: '123 Main St, Toronto, ON',
      organizationId: 1
    },
    coverImage: '/src/assets/vehicles/van1.jpg'
  },
  {
    id: 2,
    make: 'Mercedes',
    model: 'Sprinter',
    trim: 'High Roof',
    vin: '1FTBW2CM5MKA67890',
    chasisNo: 'CH67890',
    plateNumber: 'DEF-456',
    year: 2022,
    category: 'Van',
    bodyClass: 'Commercial',
    driveType: 'RWD',
    fuelType: 'Diesel',
    color: 'Blue',
    doors: 4,
    odometer: 35000,
    transmissionStyle: 'Manual',
    status: 'Active',
    serviceType: 'Cargo',
    dealershipId: 2,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-15T11:30:00Z',
    organizationId: 1,
    entityType: 'Vehicle',
    assetId: 'V002',
    device: {
      latitude: 43.7615,
      longitude: -79.4111,
      speed: 0,
      timestamp: Date.now(),
      direction: 180,
      fuelLevel: 60,
      engineTemperature: 70,
      tirePressureLow: false,
      harshAcceleration: false,
      harshBraking: false,
      harshCornering: false,
      overSpeeding: false,
      batteryVoltage: 12.3,
      panicAlert: false,
      temperAlert: false,
      externalPowerVoltage: 12.6,
      mowingEfficiency: 0,
      mowingVolume: 0,
      gsmSignal: 92,
      movement: false,
      serverTimestamp: Date.now(),
      sleepMode: 0,
      mileage: 35000,
      ignition: false,
      rssiDistance: 0,
      deviceTypeId: 1,
      satellites: 10,
      valid: true,
      ident: 'DEVICE002',
      deviceName: 'Mercedes Sprinter GPS',
      battery: 88,
      deviceId: 1002,
      id: 2,
      deviceProtocol: 'GT06',
      deviceTypeName: 'GPS Tracker',
      organizationId: 1
    },
    garage: {
      id: 2,
      name: 'North Branch',
      address: '456 North Ave, Toronto, ON',
      organizationId: 1
    },
    coverImage: '/src/assets/vehicles/sprinter1.jpg'
  },
  {
    id: 3,
    make: 'Iveco',
    model: 'Daily',
    trim: 'Standard',
    vin: '1FTBW2CM5MKA11111',
    chasisNo: 'CH11111',
    plateNumber: 'GHI-789',
    year: 2024,
    category: 'Truck',
    bodyClass: 'Commercial',
    driveType: 'RWD',
    fuelType: 'Diesel',
    color: 'Red',
    doors: 2,
    odometer: 15000,
    transmissionStyle: 'Manual',
    status: 'Maintenance',
    serviceType: 'Heavy Delivery',
    dealershipId: 3,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    organizationId: 1,
    entityType: 'Vehicle',
    assetId: 'V003',
    device: {
      latitude: 43.6426,
      longitude: -79.3871,
      speed: 0,
      timestamp: Date.now(),
      direction: 270,
      fuelLevel: 90,
      engineTemperature: 65,
      tirePressureLow: true,
      harshAcceleration: false,
      harshBraking: false,
      harshCornering: false,
      overSpeeding: false,
      batteryVoltage: 12.1,
      panicAlert: false,
      temperAlert: false,
      externalPowerVoltage: 12.4,
      mowingEfficiency: 0,
      mowingVolume: 0,
      gsmSignal: 78,
      movement: false,
      serverTimestamp: Date.now(),
      sleepMode: 1,
      mileage: 15000,
      ignition: false,
      rssiDistance: 0,
      deviceTypeId: 1,
      satellites: 6,
      valid: true,
      ident: 'DEVICE003',
      deviceName: 'Iveco Daily GPS',
      battery: 72,
      deviceId: 1003,
      id: 3,
      deviceProtocol: 'GT06',
      deviceTypeName: 'GPS Tracker',
      organizationId: 1
    },
    garage: {
      id: 1,
      name: 'Main Depot',
      address: '123 Main St, Toronto, ON',
      organizationId: 1
    },
    coverImage: '/src/assets/vehicles/truck1.jpg'
  },
  {
    id: 4,
    make: 'Toyota',
    model: 'Hiace',
    trim: 'Standard',
    vin: '1FTBW2CM5MKA22222',
    chasisNo: 'CH22222',
    plateNumber: 'JKL-012',
    year: 2023,
    category: 'Van',
    bodyClass: 'Commercial',
    driveType: 'RWD',
    fuelType: 'Gasoline',
    color: 'Silver',
    doors: 4,
    odometer: 18000,
    transmissionStyle: 'Automatic',
    status: 'Active',
    serviceType: 'Passenger',
    dealershipId: 4,
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z',
    organizationId: 1,
    entityType: 'Vehicle',
    assetId: 'V004',
    device: {
      latitude: 43.7001,
      longitude: -79.4163,
      speed: 30,
      timestamp: Date.now(),
      direction: 45,
      fuelLevel: 55,
      engineTemperature: 88,
      tirePressureLow: false,
      harshAcceleration: false,
      harshBraking: false,
      harshCornering: false,
      overSpeeding: false,
      batteryVoltage: 12.7,
      panicAlert: false,
      temperAlert: false,
      externalPowerVoltage: 13.0,
      mowingEfficiency: 0,
      mowingVolume: 0,
      gsmSignal: 88,
      movement: true,
      serverTimestamp: Date.now(),
      sleepMode: 0,
      mileage: 18000,
      ignition: true,
      rssiDistance: 0,
      deviceTypeId: 1,
      satellites: 9,
      valid: true,
      ident: 'DEVICE004',
      deviceName: 'Toyota Hiace GPS',
      battery: 91,
      deviceId: 1004,
      id: 4,
      deviceProtocol: 'GT06',
      deviceTypeName: 'GPS Tracker',
      organizationId: 1
    },
    garage: {
      id: 2,
      name: 'North Branch',
      address: '456 North Ave, Toronto, ON',
      organizationId: 1
    },
    coverImage: '/src/assets/vehicles/hiace1.jpg'
  }
];

// Demo devices
const demoDevices: IDevice[] = [
  {
    id: 1,
    deviceId: '1001',
    deviceName: 'Ford Transit GPS',
    deviceProtocol: 'GT06',
    ident: 'DEVICE001',
    type: 'GPS Tracker',
    status: 'Active',
    odometer: '25000',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z'
  },
  {
    id: 2,
    deviceId: '1002',
    deviceName: 'Mercedes Sprinter GPS',
    deviceProtocol: 'GT06',
    ident: 'DEVICE002',
    type: 'GPS Tracker',
    status: 'Active',
    odometer: '35000',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-15T11:30:00Z'
  },
  {
    id: 3,
    deviceId: '1003',
    deviceName: 'Iveco Daily GPS',
    deviceProtocol: 'GT06',
    ident: 'DEVICE003',
    type: 'GPS Tracker',
    status: 'Maintenance',
    odometer: '15000',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 4,
    deviceId: '1004',
    deviceName: 'Toyota Hiace GPS',
    deviceProtocol: 'GT06',
    ident: 'DEVICE004',
    type: 'GPS Tracker',
    status: 'Active',
    odometer: '18000',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z'
  }
];

// Demo route history data generator
const generateDemoRouteHistory = (deviceId: string, date: string): IRouteHistoryData => {
  const deviceIdNum = parseInt(deviceId);
  const selectedDate = new Date(date);
  
  // Generate demo trips for the selected date
  const trips = [
    {
      status: 'completed',
      idleTrip: false,
      distance: 15.2,
      fuelUsed: 2.5,
      tripTime: '00:45:30',
      start: selectedDate.getTime(),
      end: selectedDate.getTime() + (45 * 60 * 1000),
      startDataTime: selectedDate.toISOString(),
      endDataTime: new Date(selectedDate.getTime() + (45 * 60 * 1000)).toISOString(),
      position: [
        { latitude: 43.6532, longitude: -79.3832, speed: 0, direction: 0 },
        { latitude: 43.6550, longitude: -79.3850, speed: 25, direction: 45 },
        { latitude: 43.6580, longitude: -79.3880, speed: 40, direction: 90 },
        { latitude: 43.6600, longitude: -79.3900, speed: 35, direction: 135 },
        { latitude: 43.6620, longitude: -79.3920, speed: 0, direction: 180 }
      ],
      event: [
        {
          flag: 'Medium',
          name: 'Hard Braking',
          latitude: 43.6580,
          longitude: -79.3880,
          media1: {
            created: Date.now(),
            timestamp: Date.now(),
            url: '/demo/video1.mp4',
            uploadedMedia: 'demo_video_1.mp4'
          }
        }
      ]
    },
    {
      status: 'completed',
      idleTrip: true,
      distance: 0,
      fuelUsed: 0.5,
      tripTime: '00:15:00',
      start: selectedDate.getTime() + (60 * 60 * 1000),
      end: selectedDate.getTime() + (75 * 60 * 1000),
      startDataTime: new Date(selectedDate.getTime() + (60 * 60 * 1000)).toISOString(),
      endDataTime: new Date(selectedDate.getTime() + (75 * 60 * 1000)).toISOString(),
      position: [
        { latitude: 43.6620, longitude: -79.3920, speed: 0, direction: 180 }
      ]
    },
    {
      status: 'completed',
      idleTrip: false,
      distance: 22.8,
      fuelUsed: 3.2,
      tripTime: '01:12:15',
      start: selectedDate.getTime() + (90 * 60 * 1000),
      end: selectedDate.getTime() + (162 * 60 * 1000),
      startDataTime: new Date(selectedDate.getTime() + (90 * 60 * 1000)).toISOString(),
      endDataTime: new Date(selectedDate.getTime() + (162 * 60 * 1000)).toISOString(),
      position: [
        { latitude: 43.6620, longitude: -79.3920, speed: 0, direction: 180 },
        { latitude: 43.6650, longitude: -79.3950, speed: 30, direction: 225 },
        { latitude: 43.6700, longitude: -79.4000, speed: 45, direction: 270 },
        { latitude: 43.6750, longitude: -79.4050, speed: 50, direction: 315 },
        { latitude: 43.6800, longitude: -79.4100, speed: 0, direction: 0 }
      ],
      event: [
        {
          flag: 'High',
          name: 'Speeding',
          latitude: 43.6750,
          longitude: -79.4050,
          media1: {
            created: Date.now(),
            timestamp: Date.now(),
            url: '/demo/video2.mp4',
            uploadedMedia: 'demo_video_2.mp4'
          }
        }
      ]
    }
  ];

  return {
    deviceId: deviceIdNum,
    trips,
    fuelLevel: 75 - (deviceIdNum * 5) // Vary fuel level by device
  };
};

export async function fetchDeviceData(deviceList: IDevice[]): Promise<any[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    // Original API calls - commented out
    // const promises = deviceList.map((device) => {
    //   return axiosInstance.get(`/api/device/${device.deviceId}/trip`);
    // });

    // const results = await Promise.all(promises);
    // console.log('fetchDeviceData', results);
    // const devicesData: IDeviceTelemetry[] = [];
    // results.forEach((response) => {
    //   devicesData.push({
    //     ...response.data,
    //     deviceName: response.data['deviceName'].trim(),
    //   });
    // });

    // return devicesData;

    // Demo data implementation
    const devicesData: IDeviceTelemetry[] = deviceList.map(device => {
      const demoVehicle = demoVehicles.find(v => v.device?.deviceId.toString() === device.deviceId);
      if (demoVehicle?.device) {
        return {
          ...demoVehicle.device,
          deviceName: demoVehicle.device.deviceName.trim(),
        };
      }
      
      // Fallback demo data if vehicle not found
      return {
        latitude: 43.6532 + Math.random() * 0.1,
        longitude: -79.3832 + Math.random() * 0.1,
        speed: Math.floor(Math.random() * 60),
        timestamp: Date.now(),
        direction: Math.floor(Math.random() * 360),
        fuelLevel: 50 + Math.floor(Math.random() * 50),
        engineTemperature: 70 + Math.floor(Math.random() * 30),
        tirePressureLow: false,
        harshAcceleration: false,
        harshBraking: false,
        harshCornering: false,
        overSpeeding: false,
        batteryVoltage: 12.0 + Math.random(),
        panicAlert: false,
        temperAlert: false,
        externalPowerVoltage: 12.0 + Math.random(),
        mowingEfficiency: 0,
        mowingVolume: 0,
        gsmSignal: 70 + Math.floor(Math.random() * 30),
        movement: Math.random() > 0.5,
        serverTimestamp: Date.now(),
        sleepMode: 0,
        mileage: 10000 + Math.floor(Math.random() * 50000),
        ignition: Math.random() > 0.3,
        rssiDistance: 0,
        deviceTypeId: 1,
        satellites: 4 + Math.floor(Math.random() * 8),
        valid: true,
        ident: device.ident || `DEVICE${device.id}`,
        deviceName: device.deviceName.trim(),
        battery: 70 + Math.floor(Math.random() * 30),
        deviceId: parseInt(device.deviceId),
        id: device.id,
        deviceProtocol: device.deviceProtocol || 'GT06',
        deviceTypeName: 'GPS Tracker',
        organizationId: 1
      };
    });

    console.log('fetchDeviceData (demo)', devicesData);
    return devicesData;
  } catch (error) {
    console.error('Error fetching device data (demo):', error);
    throw error;
  }
}

export const getVehiclesWithDeviceData = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Original API call - commented out
  // const response = await axiosInstance.get(`/api/vehicle/list`);
  // const vehicles: IVehicle[] = response.data;
  // return vehicles;

  // Demo data implementation
  try {
    console.log('getVehiclesWithDeviceData (demo)', demoVehicles);
    return demoVehicles;
  } catch (error) {
    console.error('Error fetching vehicles with device data (demo):', error);
    throw error;
  }
};

export const getRouteHistory = async (
  deviceId: string,
  date: string
): Promise<IRouteHistoryData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Original API call - commented out
  // const selectedDate = new Date(date);
  // const nextDate = new Date(selectedDate);
  // nextDate.setDate(selectedDate.getDate() + 1);
  // const nextDateStr = nextDate.toISOString().split('T')[0];
  // //console.log(`getRouteHistory /api/device/${deviceId}/trip?from=${date}&to=${nextDateStr}&completeAddress=false`)
  // const response = await axiosInstance.get(
  //   `/api/device/${deviceId}/trip?from=${date}&to=${nextDateStr}&completeAddress=false`
  // );
  // console.log("getRouteHistory res=",response.data);
  // return response.data;

  // Demo data implementation
  try {
    const routeHistoryData = generateDemoRouteHistory(deviceId, date);
    console.log("getRouteHistory (demo) res=", routeHistoryData);
    return routeHistoryData;
  } catch (error) {
    console.error('Error fetching route history (demo):', error);
    throw error;
  }
};

export const getLiveStreaming = async (deviceId: number) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // Original API call - commented out
    // const response = await axiosInstance.get(`/api/device/${deviceId}/live-streaming`);

    // // Ensure response is valid
    // if (!response || !response.data) {
    //   console.warn("Empty response from API", response);
    //   return null;
    // }

    // return response.data; // Expecting an array of streams

    // Demo data implementation
    const demoStreams = [
      {
        id: 1,
        deviceId,
        streamUrl: `/demo/stream/${deviceId}/live.m3u8`,
        status: 'active',
        quality: '720p',
        fps: 30,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        deviceId,
        streamUrl: `/demo/stream/${deviceId}/backup.m3u8`,
        status: 'backup',
        quality: '480p',
        fps: 25,
        createdAt: new Date().toISOString()
      }
    ];

    console.log("getLiveStreaming (demo)", demoStreams);
    return demoStreams;
  } catch (error) {
    console.error("Error fetching live stream (demo):", error);
    return null;
  }
};
