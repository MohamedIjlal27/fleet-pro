export interface IAddress {
    city?: string;
    unit?: number;
    address?: string;
    country?: string;
    province?: string;
    postal_code?: string;
  }
  
 export interface IInsurance {
    id?: number;
    policyNumber: string;
    insuranceCompany: string;
    effectiveDate: string;
    expiryDate: string;
    namedInsured?: string;
    insuredAddress?: IAddress;
    cars: number[];
    coverage: string;
    createdAt?: string;
    updatedAt?: string;
    status?: string;
    insuranceFiles?: {
      fileName: string,
      fileType: string,
      fileUrl: string,
    }[];
  }