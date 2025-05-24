export interface IUser {
  id: number;
  createdAt: string;
  updatedAt: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  picture?: string | null;
  organizationId: number;
  password: string;
  isDriver: boolean;
}

export interface IDriver {
  id: number;
  userId: number;
  phoneNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  status: string;
  driverLicenseNumber: string;
  licenseExpirationDate: string;
  licenseType: string;
  homeAddress: string;
  emergencyNumber: string;
  emergencyName: string;
  bloodGroup: string;
  insuranceNumber: string;
  driverDigitalNumber: string;
  garageId: number;
  thirdPartyCompanyId: number | null;
  user?: IUser;
}

export interface IGeneralTabProps {
  formState: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (e: any) => void;
  handleSubmit: () => void;
  id: string;
}

export interface IDriverVehicleAssignmentTabProps {
  id: string;
}

export interface IAnalyticsTabProps {
  id: string;
}

export interface IDriverKeysTabProps {
  id: string;
}

export interface IDocument {
  id: number;
  documentType: string;
  fileUrl: string;
  fileName: string;
  uploadType: string;
  createdAt: string;
  metadata: MetadataItem[]
}

interface MetadataItem {
  url: string;
  fileType: string;
  fileName: string;
}

export interface IGarage {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  createdAt: string;
}

export interface IVehicle {
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
  transmissionType: string;
  parking?: string;
  status?: string;
  category: string;
  otherCategory?: string;
  garageId?: number;
  garage?: IGarage;
  driverId?: number;
  driver?: IDriver;
  coverImage?: string;
}

export interface IVehicleAssignment {
  id: number;
  startDate: string;
  endDate: string;
  confirmDate?: string;
  driverStartDate?: string;
  driverEndDate?: string;
  vehicle?: IVehicle;
}

export interface IFilterOptions {
  makes: string[];
  models: string[];
  trims: string[];
  statuses: string[];
  garages: string[];
}
