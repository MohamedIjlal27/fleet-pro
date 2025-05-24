import axiosInstance from '../../../../utils/axiosConfig';
import {IAddress , IInsurance} from '../interfaces/interfaces'

export const fetchInsuranceFilters = async () => {
    try {
        const response = await axiosInstance.get('/api/orders/filters');
        console.log("filter data =" + JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        console.error('Error fetching orders data:', error);
    }
};



export const fetchInsurances = async (page: number = 1, size: number = 10, status: string = '') => {
    try {
        // Prepare the query parameters
        const params = {
            page: page,
            size: size,
        };
        console.log(`fetchInsurances params = `,params);
        const response = await axiosInstance.get('/api/insurance', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching insurances data:', error);
    }
};

export const fetchInsurance = async (id: number) => {
    try {
        console.log(`fetchInsurance id = `,id);
        const response = await axiosInstance.get(`/api/insurance/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching insurance data:', error);
    }
};

export const createInsurance = async (insuranceData:IInsurance ) => {
    try {
        const sanitizedData = {
            ...insuranceData,
        };
        console.log('createInsurance Payload sanitizedData:', sanitizedData);
        const response = await axiosInstance.post(`/api/insurance`, sanitizedData);
        console.log('insurance created successfully:', response.data);
        return response.data; // Return the data from the response
    } catch (error: any) {
        console.error('Error creating insurance:', error.response?.data || error.message);
        throw new Error(
            error.response?.data?.message || 'Failed to create insurance. Please try again.'
        );
    }
};

export const updateInsurance = async (insuranceData:IInsurance ) => {
    try {
        const sanitizedData = {
            ...insuranceData,
        };
        console.log('updateInsurance Payload sanitizedData:', sanitizedData);
        const response = await axiosInstance.put(`/api/insurance/${sanitizedData.id}`, sanitizedData);
        console.log('insurance update successfully:', response.data);
        return response.data; // Return the data from the response
    } catch (error: any) {
        console.error('Error update insurance:', error.response?.data || error.message);
        throw new Error(
            error.response?.data?.message || 'Failed to update insurance. Please try again.'
        );
    }
};


export const uploadInsuranceDocument = async  (insuranceId: number, file: File) => {
    
    const formData = new FormData();
  
    console.log('uploadInsuranceDocument insuranceId:', insuranceId);
    console.log('uploadInsuranceDocument file:', file);
    // Append the file and maintenanceId to the FormData
    formData.append('file', file); // Append file to the form
    formData.append('insuranceId', insuranceId.toString()); // Append maintenanceId
    try {
        console.log('uploadInsuranceDocument Payload:', formData);
        const response = await axiosInstance.post(`/api/insurance/upload-document`, formData);
        console.log('Insurance upload doc successfully:', response.data);
        return response.data; // Return the data from the response
    } catch (error: any) {
        console.error('Error upload doc Insurance:', error.response?.data || error.message);
        throw new Error(
            error.response?.data?.message || 'Failed to upload doc Insurance. Please try again.'
        );
    }
};

