export interface ICustomerFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  invoiceTitle?: string,
  invoicePhoneNumber?: string,
  invoiceEmail?: string,
  invoiceAddress?: string,
  invoiceUnitNumber?: string,
  invoicePostCode?: string,
  invoiceCity?: string,
  invoiceProvince?: string,
  invoiceCountry?: string,
}

export interface ICustomer{
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    invoiceTitle?: string,
    invoicePhoneNumber?: string,
    invoiceEmail?: string,
    invoiceAddress?: string,
    invoiceUnitNumber?: string,
    invoicePostCode?: string,
    invoiceCity?: string,
    invoiceProvince?: string,
    invoiceCountry?: string,
    createdAt: number;
    updatedAt: number;
    orders: any;
}