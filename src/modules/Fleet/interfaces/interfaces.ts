export interface IVehicleData {
  id?: number;
  make: string;
  model: string;
  trim: string;
  vin?: string;
  chasisNo?: string;
  plateNumber: string;
  year: number;
  bodyClass: string;
  driveType: string;
  fuelType: string;
  color: string;
  doors: number;
  odometer: number;
  driver: number;
  transmissionType: string;
  parking?: string;
  status?: string;
  category: string;
  otherCategory?: string;
  garageId?: number;
  driverId?: number;
}

export interface ILogsData {
  vehicleHistory: any[];
  driverHistory: any[];
  fuelHistory: any[];
  commandHistory: any[];
}
