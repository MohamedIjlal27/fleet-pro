import axiosInstance from "../../../../utils/axiosConfig";
import { ITelemetryDeviceForm } from "../interfaces/ITelemetryDeviceForm";



export const getVehicles = async () => {
    try {
        const response = await axiosInstance.get('/api/vehicle/list');
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        return [];
    }
};

export const deleteTelemetryDevice = async (deviceId: number) => {
    const response = await axiosInstance.delete(`/api/device/${deviceId}`);
    console.log('deleteTelemetryDevice response',response);
    return response.data;
};

export const addTelemetryDevice = async (device: ITelemetryDeviceForm) => {
    const formattedDevice = formatDeviceFormData(device);
    console.log('addTelemetryDevice formattedDevice',formattedDevice);
    const response = await axiosInstance.post('api/device/register', formattedDevice);
    console.log('addTelemetryDevice response',response);
    return response.data;
};

export const getTelemetryDevices = async () => {
    try {
        const response = await axiosInstance.get('/api/device');
        console.log('getTelemetryDevices response',response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching devices:', error);
        return [];
    }
};

export const getTelemetryDeviceOptions = async () => {
    try {
        const response = await axiosInstance.get('/api/device/options');
        console.log('getTelemetryDeviceOptions response',response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching devices:', error);
        return [];
    }
};


const formatDeviceFormData = (device: ITelemetryDeviceForm) => {
    const formattedDevice = {
        ...device,
        vehicleId: Number(device.vehicleId) || null,
        status: device.status || 'inactive',
    };
    return formattedDevice;
};



