import axios, { AxiosError } from 'axios';
import axiosInstance from '../../../../utils/axiosConfig';
export const fetchSettingsCustomerAgreement = async () => {
    try {
        const response = await axiosInstance.get('/api/settings/customer-agreement/');
        return response.data;
    } catch (error) {
        console.error('Error fetching settings customer-agreement data:', error);
    }
};

interface IMetadata {
    metadata: {
        lat: number;
        lng: number;
    };
}

export interface SettingsData {
    id: number;
    organizationId: number;
    type: number;
    metadata: IMetadata[];
    createdAt: string;
    updatedAt: string;
}

export const updateSettingsCustomerAgreement = async (id: number, customerAgreementData: {

    content: string;
}) => {

    try {
        const customerAgreementDataFormatted = {
            ...customerAgreementData,
        }
        const response = await axiosInstance.put(`/api/settings/customer-agreement`, customerAgreementDataFormatted);
        return response.data; // Return updated customer-agreement data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to update customer-agreement.');
        } else {
            throw new Error('An unexpected error occurred while updating the customer-agreement.');
        }
    }
};


// bypass auth for this two api
// Commented out for local development without backend
// const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const BASE_URL = ''; // Disabled for local development

export const fetchCustomerAgreementFromToken = async (token: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/signature/agreement`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching customer agreement with token:", error);
        throw error; // Re-throw for further handling if needed
    }
};

export interface ISignatureData {
    signatureAgreement: string; // The agreement text or related info
    signatureImage: string;    // Base64 encoded image or relevant signature data
}

export const signAgreement = async (token: string, data: ISignatureData) => {
    try {
        console.log(`signAgreement data = ${JSON.stringify(data)}`);
        const response = await axios.post(`${BASE_URL}/api/signature`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log(`signAgreement response = ${JSON.stringify(response)}`);
        return response;
    } catch (error) {
        console.error("Error signing customer agreement with token:", error);
        throw error; // Re-throw for further handling if needed
    }
};
