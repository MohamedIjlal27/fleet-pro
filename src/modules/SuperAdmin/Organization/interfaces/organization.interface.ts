

export interface IOrganization {
    id: number;
    name: string;
    phoneNumber: string;
    country: string;
    province: string;
    city: string;
    postalCode: string;
    logo?: string; // Optional field
    address: string;
    email: string;
    googlePlaceId: string;
    //garages: Garage[]; // Assuming Garage is another interface or type
    //users: User[]; // Assuming User is another interface or type
  }