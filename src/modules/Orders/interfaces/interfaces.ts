export interface IOrder {
    id: number;
    date: string;
    time: string;
    customer: {
      name: string;
    };
    vehicle: {
      make: string;
      model: string;
    };
    location: string;
    plan: string;
    status: string;
  }
  