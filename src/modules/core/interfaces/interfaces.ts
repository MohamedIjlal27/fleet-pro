export interface IVehicle {
  id: number;
  make: string;
  model: string;
  trim?: string;
  vin?: string;
  chasisNo?: string;
  plateNumber?: string;
  year?: number;
  category?: string;
  otherCategory?: string;
  bodyClass?: string;
  driveType?: string;
  fuelType?: string;
  color?: string;
  doors?: number;
  odometer?: number;
  transmissionStyle?: string;
  status: string;
  serviceType?: string;
  dealershipId?: number;
  createdAt: string;
  updatedAt: string;
  device?: IDeviceTelemetry;
  garage?: Garage;
  coverImage?: string;
  entityType?: string;
  organizationId: number;
  assetId?: string;
  assetSerialNumber?: string;
  assetType?: string;
  currentAssignedDriver?: any;
}

export interface IDeviceTelemetry {
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: number;
  direction: number;
  fuelLevel: number;
  engineTemperature: number;
  tirePressureLow: boolean;
  harshAcceleration: boolean;
  harshBraking: boolean;
  harshCornering: boolean;
  overSpeeding: boolean;
  batteryVoltage: number;
  panicAlert: boolean;
  temperAlert: boolean;
  externalPowerVoltage: number;
  mowingEfficiency: number;
  mowingVolume: number;
  gsmSignal: number;
  movement: boolean;
  serverTimestamp: number;
  sleepMode: number;
  mileage: number;
  ignition: boolean;
  rssiDistance: number;
  deviceTypeId: number;
  satellites: number;
  valid: boolean;
  ident: string;
  deviceName: string;
  battery: number;
  deviceId: number;
  id: number;
  deviceProtocol?: string;
  deviceTypeName?: string;
  organizationId: number;
}

export interface IDeviceData {
  id?: number;
  deviceId: string;
  deviceName: string;
  position: {
    altitude: number;
    latitude: number;
    longitude: number;
    speed: number;
    direction: number;
  };
  status?: string;
  timestamp?: string;
  deviceBattery?: {
    voltage: number;
  };
  vehicleBattery?: number;
  GSM_signalLevel?: number;
  mileage?: number;
  engineHours?: number;
  fuelLevel?: number;
  movement?: boolean;
  engineIgnition?: boolean;
}

export interface Garage {
  id: number;
  name: string;
  address: string;
  organizationId: number;
}

export interface IDevicePosition {
  latitude: number;
  longitude: number;
  speed: number;
  direction: number;
}

export interface ITrip {
  status: string;
  idleTrip: boolean;
  distance: number;
  fuelUsed: number;
  tripTime: string;
  start: number;
  end: number;
  startDataTime: string;
  endDataTime: string;
  position: IDevicePosition[];
  event?: IEvent[];
}

export interface IEvent {
  flag: string; // e.g., "High"
  name: string; // e.g., "Collision"
  latitude: number; // Latitude of the event
  longitude: number; // Longitude of the event
  media1?: IMedia;
  media2?: IMedia;
}

export interface IMedia {
  created: number; 
  meta?: {
    channel: number;
    command_id: number;
    duration: number;
    has_audio: boolean;
    height: number;
    type: string; 
    video_codec: string;
    width: number;
  };
  mime?: string; 
  name?: string; 
  size?: number;
  url?: string; 
  uuid?: string; 
  timestamp: number;
  uploadedMedia?: string;
}



export interface IRouteHistoryData {
  deviceId: number;
  trips: ITrip[];
  fuelLevel?: number;
}

export interface IDevice {
  id: number;
  deviceId: string;
  deviceName: string;
  deviceProtocol?: string;
  ident?: string;
  type: string;
  status: string;
  odometer?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  id: number;
  entityType: string;
  entityId: string;
  relatedId: string;
  vehicleId: string;
  sensitivity: string;
  title: string;
  description: string;
  note: string;  // New field added
  sendEmail: boolean;
  sendSms: boolean;
  read: boolean;
  metadata?: any;
  createdAt: string,
  updatedAt: string,
  vehicle?: any;
  assignedDriver?: any;
}