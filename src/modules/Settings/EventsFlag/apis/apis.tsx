import axiosInstance from '../../../../utils/axiosConfig';
import {IEventFlags} from '../interfaces/interfaces'


export const fetchEventsFlag = async () => {
    try {
        const response = await axiosInstance.get(`/api/settings/vehicle-events-flag`);
        console.log("fetchEventsFlag = ",response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetchEventsFlag data:', error);
    }
};

export const fetchEventsFlagOptions = async () => {
    try {
        const response = await axiosInstance.get(`/api/settings/options`);
        console.log("fetchEventsFlagOptions = ",response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetchEventsFlagOptions data:', error);
    }
};

export const updateEventsFlag = async (eventsflagData: IEventFlags) => {
    try {
        console.log('updateEventsFlag Payload:', eventsflagData);
        const response = await axiosInstance.put(`/api/settings/vehicle-events-flag`, eventsflagData);
        console.log('updateEventsFlag successfully:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error updateEventsFlag:', error.response?.data || error.message);
        throw new Error(
            error.response?.data?.message || 'Failed to updateEventsFlag. Please try again.'
        );
    }
};