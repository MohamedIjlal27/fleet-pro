export interface BackendGarage {
  id: number;
  name: string;
  city: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
}

export interface GarageWithCount {
  id: number;
  name: string;
  city: string;
  vehicleCount: number;
}

export interface ReminderItem {
  key: string;
  title: string;
  details: string;
  count?: string;
  route: string;
}

export interface VehicleAnalytics {
  vehicleId: number;
  totalKmDriven: number;
  totalFuelUsed: number;
  totalIdleTime: number;
}

export interface VehicleStats {
  vehicle: string;
  distance: number;
  fuelConsumption: number;
  idling: number;
}

export interface BadDriverApiResponse {
  driverId: number;
  driverName: string;
  speeding: number;
  harshBraking: number;
  idling: number;
  category: string;
}

export interface DriverStats {
  driver: string;
  speeding: number;
  harshBraking: number;
  idling: number;
}

export interface DashboardItem {
  wgAvailableVehicles?: number;
  wgNewReservations?: number;
  wgNewScreening?: number;
  wgTopVehicleStats?: any[]; // Empty array or objects
  wgFleetStatusChart?: {
    Available: number;
    Unavailable: number;
    InService: number;
    Reserved: number;
    Maintenance?: number;
  };
  wgGaragesChart?: {
    id: number;
    name: string;
    city: string;
    vehicleCount: number;
  }[];
  wgBadDriversChart?: any[]; // Empty array or objects
  wgReminders?: {
    insuranceUpload: number;
    newMaintenance: number;
    newLeads: number;
    billRequestToPay: number;
    invoiceUpdate: number;
    requestFromCustomer: number;
    devicesActivated: number;
    deliveredCompleted: number;
  };

  wgMapwithGarages?: {
    garages: {
      id: number;
      latitude: number;
      longitude: number;
      name: string;
      address: string;
      phoneNumber: string;
    }[];
    vehicles: {
      id: number;
      coverImage?: string | null;
      make: string;
      model: string;
      year: number;
      color: string;
      plateNumber: string;
      device: {
        deviceId?: string;
      };
    }[];
  };
  wgTaskStatusChart?: {
    [taskType: string]: {
      PENDING: number;
      ASSIGNED: number;
      IN_PROCESS: number;
      COMPLETED: number;
      CLOSED: number;
    };
  };
  wgPredictiveAndPreventiveChart?: {
    preventive_maintenance_percent: number;
    predictive_maintenance_percent: number;
  };
  wgAvailableAssets: number;
  wgInUseVehicles: number;
  wgInProgressMaintenances?: number;
  wgMaintenanceStatusChart?: {
    New: number;
    Confirmed: number;
    InProcessing: number;
    Paid: number;
    Completed: number;
    Cancelled: number;
  }
}
