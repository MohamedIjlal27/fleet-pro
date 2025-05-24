import axios, { AxiosError } from 'axios';
import axiosInstance from '../../../../utils/axiosConfig';
export const fetchSettingsTaxRate = async () => {
    try {
        const response = await axiosInstance.get('/api/settings/tax-rate/');
        return response.data;
    } catch (error) {
        console.error('Error fetching settings tax-rate data:', error);
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

export const updateSettingsTaxRate = async (id: number, taxRateData: {
    AB: string;
    BC: string;
    MB: string;
    NB: string;
    NL: string;
    NS: string;
    ON: string;
    PE: string;
    QC: string;
    SK: string;
    YT: string;
    NU: string;
    NT: string;
}) => {

    try {
        const taxRateDataFormatted = {
            ...taxRateData
        }
        console.log(taxRateDataFormatted);
        const response = await axiosInstance.put(`/api/settings/tax-rate`, taxRateDataFormatted);
        return response.data; // Return updated tax-rate data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to update tax-rate.');
        } else {
            throw new Error('An unexpected error occurred while updating the tax-rate.');
        }
    }
};
