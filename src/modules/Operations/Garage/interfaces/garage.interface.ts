export interface IGarageFormData {
    id?: string;
    name: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    parkingLimit: number;
    taxRate: number;
    phoneNumber?: string;
    country?: string;
    googlePlaceId?: string;
    vehicles?: [];
    drivers?: [];
    remarks?: string;
    garageGroup?: string;
    operationStarts: string;
    operationEnds: string;
    latitude: number;
    longitude: number;
    operationDays: {
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
        sunday: boolean;
    };
}

export interface IGarage{
    id: number;
    name: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    parkingLimit: number;
    taxRate: number;
    phoneNumber: string;
    country: string;
    googlePlaceId: string;
    vehicles?: [];
    drivers?: [];
    organizationId: number;
    remarks?: string;
    garageGroup?: string;
    operationStarts: string;
    operationEnds: string;
    latitude: number;
    longitude: number;
    operationDays: {
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
        sunday: boolean;
    };
}
