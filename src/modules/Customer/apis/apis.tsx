import axios, { AxiosError } from 'axios';
import axiosInstance from '../../../utils/axiosConfig';
import { ICustomerFormData } from '../interfaces/customer.interface';

export const fetchCustomers = async (
  page: number = 1,
  size: number = 10,
  sortBy: string = ``,
  sortOrder: string = `createdAt`,
  search: string = `asc`,
) => {
    try {
      const params = {
        page: page,
        size: size,
        sortBy: sortBy,
        sortOrder: sortOrder,
        search: search,
      };

        const response = await axiosInstance.get('/api/customers', {params});
        return response.data;
    } catch (error) {
        console.error('Error fetching customers data:', error);
    }
};

export const fetchCustomerDetails = async (customerId: number) => {
  try {
    const response = await axiosInstance.get(`/api/customers/${customerId}`);
    return response.data; // Return the data from the response
  } catch (error: any) {
    console.error('Error fetchCustomerDetails:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to fetchCustomerDetails. Please try again.'
    );
  }
};

export const createCustomer = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/api/customers', data); // Replace with your API endpoint
    return response.data; // Return created customer data
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // Handle Axios errors
      const axiosError = error as AxiosError<{ message: string }>;
      console.error('Axios error creating customer:', axiosError.response?.data?.message || axiosError.message);
      throw new Error(axiosError.response?.data?.message || 'Failed to create customer');
    } else {
      // Handle unknown errors
      console.error('Unknown error creating customer:', error);
      throw new Error('An unknown error occurred while creating the customer');
    }
  }
};

export const updateCustomer = async (customerId: number, data: ICustomerFormData) => {
  try {
    const response = await axiosInstance.put(`/api/customers/${customerId}`, data);
    return response.data; // Return the data from the response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // Handle Axios errors
      const axiosError = error as AxiosError<{ message: string }>;
      console.error('Axios error updating customer:', axiosError.response?.data?.message || axiosError.message);
      throw new Error(axiosError.response?.data?.message || 'Failed to update customer');
    } else {
      // Handle unknown errors
      console.error('Unknown error updating customer:', error);
      throw new Error('An unknown error occurred while updating the customer');
    }
  }
};

export const sendText = async (id: number): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/api/customers/text/send/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to send text.');
    } else {
        throw new Error('An unexpected error occurred while sending text.');
    }
  }
};