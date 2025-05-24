export interface IUserFormState {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber: string;
  organizationId: number;
  isDriver: boolean;
  status: string;
  licenseType?: string;
  licenseExpirationDate?: string;
  bloodGroup?: string;
  emergencyNumber?: string;
  roles: number[];
  phone: string;
  driverLicenseNumber?: string;
  homeAddress?: string;
  emergencyName?: string;
  insuranceNumber?: string;
  driverDigitalNumber?: string;
  picture?: string;
  garageId?: string;
}

export interface IUser {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  organizationId?: number;
  phone?: string;
  password?: string;
  picture: string;
  phoneNumber?: string;
}

export interface IUserCard {
  [x: string]: ReactNode;
  status: number;
  statusName: ReactNode;
  lastActiveDate: ReactNode;
  roleIds: any;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  organizationId: number;
  picture: string;
}

export interface IUserUpdateForm {
  id?: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  organizationId: number;
  isDriver: boolean;
  status: string;
  roleIds: number[];
  phone: string;
  picture: string;
  licenseType?: string;
  licenseExpirationDate?: string;
  bloodGroup?: string;
  emergencyNumber?: string;
  driverLicenseNumber?: string;
  homeAddress?: string;
  emergencyName?: string;
  insuranceNumber?: string;
  driverDigitalNumber?: string;
  garageId?: string;
  confirmPassword?: string;
  password?: string;

  [key: string]: any;
}
