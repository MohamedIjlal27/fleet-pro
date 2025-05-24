import axios, { AxiosError } from 'axios';
import axiosInstance from '../../../../utils/axiosConfig';
export const fetchSettingsPreference = async () => {
    try {
        const response = await axiosInstance.get('/api/settings/preference/');
        return response.data;
    } catch (error) {
        console.error('Error fetching settings preference data:', error);
    }
};

export const fetchSettingsDefaultMapCenter = async () => {
    try {
        const response = await axiosInstance.get('/api/settings/default-map-center/');
        return response.data;
    } catch (error) {
        console.error('Error fetching settings default-map-center data:', error);
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

export const updateSettingsPreference = async (id: number, preferenceData: {
    locale: string;
    timezone: string;
}) => {

    try {
        const preferenceDataFormatted = {
            ...preferenceData,
        }
        const response = await axiosInstance.put(`/api/settings/preference`, preferenceDataFormatted);
        return response.data; // Return updated preference data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to update preference.');
        } else {
            throw new Error('An unexpected error occurred while updating the preference.');
        }
    }
};

export const updateSettingsDefaultMapCenter = async (id: number, defaultMapCenterData: {
    lat: number;
    lng: number;
}) => {

    try {
        const defaultMapCenterDataFormatted = {
            ...defaultMapCenterData,
        }
        const response = await axiosInstance.put(`/api/settings/default-map-center`, defaultMapCenterDataFormatted);
        return response.data; // Return updated default-map-center data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to update default-map-center.');
        } else {
            throw new Error('An unexpected error occurred while updating the default-map-center.');
        }
    }
};
