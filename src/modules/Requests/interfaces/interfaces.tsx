import { IUser } from "@/modules/Operations/Users/interfaces/interface";
import { IVehicle } from "../../core/interfaces/interfaces";

export interface IRequest {
  id: number;
  customerId: number | null;
  organizationId: number;
  orderId: number | null;
  adminId: number;
  relatedId: number;
  assigneeId: number | null;
  initiatorType: number;
  initiatorTypeName: string;
  deliveryCarId: number;
  returnCarId: number | null;
  type: number;
  typeName: string;
  status: number;
  statusName: string;
  scheduleDate: string;
  scheduleTime: string;
  scheduleLocation: string;
  actuallyTime: string;
  createdAt: string;
  updatedAt: string;
  requestBy: string;
  underGoingDelivery?: IVehicle;
  carAwaitingRecycling?: IVehicle;
  vehicle?: IVehicle;
  customerName?: string;
}

export interface ITaskList {
  vehicle: IVehicle | undefined;
  id: number | undefined;
  customerId: number | undefined;
  organizationId: number | undefined;
  orderId: number | undefined;
  adminId: number | undefined;
  relatedId: number | undefined;
  assigneeId: number | undefined;
  initiatorType: number | undefined;
  deliveryCarId: number | undefined;
  returnCarId: number | undefined;
  type: number | undefined;
  status: number | undefined;
  scheduleDate: string | undefined;
  scheduleTime: string | undefined;
  scheduleLocation: string | undefined;
  actuallyTime: string | undefined;
  metadata: object | undefined;
  createdAt: string | undefined;
  updatedAt: string | undefined;
  customer: ICustomerList | undefined;
  order: object | undefined;
  underGoingDelivery: object | undefined;
  carAwaitingRecycling: object | undefined;
  user: IUser | undefined;
  requestBy: string | undefined;
  maintenance: object | undefined;
  typeName: string | undefined;
}

interface ICustomerList {
  id: number;
  organizationId: number;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  stripeId: string;
  metadata: object;
  createdAt: string;
  updatedAt: string;
}

export interface IPlanResponse {
  id: boolean;
  name: boolean;
  description: boolean;
  pricing: boolean;
  deposit: boolean;
  chargePeriod: boolean;
  duration: boolean;
  durationAdditional: boolean;
  durationPrice: boolean;
  distance: boolean;
  distanceAdditional: boolean;
  distancePrice: boolean;
  services: boolean;
  isPopular: boolean;
  createdAt: boolean;
  updatedAt: boolean;
  productStripeId: boolean;
  organization: {
    id: boolean;
    name: boolean;
  };
  planVehicles?: {
    vehicle?: {
      id?: string;
      make?: string;
      plateNumber?: string;
      coverImage?: string;
    };
  }[];
}
