import axiosInstance from '../../../../utils/axiosConfig';

export const fetchGeoFence = async (id: number) => {
  try {
    const response = await axiosInstance.get(`/api/geo-fence/${id}`);
    console.log('fetchGeoFence = ', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching GeoFence data:', error);
  }
};

export const fetchGeoFences = async () => {
  try {
    const response = await axiosInstance.get(`/api/geo-fence/`);
    console.log('fetchGeoFence = ', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching GeoFence data:', error);
  }
};

export const fetchDevices = async () => {
  try {
    const response = await axiosInstance.get(`/api/device`);
    console.log('fetchDevices = ', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetchDevices :', error);
  }
};

export const fetchVehicles = async () => {
  try {
    const response = await axiosInstance.get(`/api/vehicle`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
  }
};

export const createGeoFence = async (
  name: string,
  type: string,
  data: any,
  isEnabled: boolean
) => {
  try {
    const payload = {
      name: name,
      type: type,
      metadata: data,
      isEnabled: isEnabled,
      trackingDeviceType: 'FLESPI',
    };
    console.log('Create GeoFence payload', payload);
    const response = await axiosInstance.post(`/api/geo-fence`, payload);
    console.log('createGeoFence response', response);
    return response;
  } catch (error) {
    console.error('Error creating Geo Fence:', error);
    throw error;
  }
};

export const updateGeofence = async (
  geofenceId: string,
  isEnabled: boolean,
  type: string,
  data: any
) => {
  try {
    const payload = {
      type: type,
      metadata: data,
      isEnabled: isEnabled,
      trackingDeviceType: 'FLESPI',
    };
    console.log('Update GeoFence payload', payload);
    const response = await axiosInstance.put(
      `/api/geo-fence/${geofenceId}`,
      payload
    );
    console.log('updateGeoFence response', response);
    return response;
  } catch (error) {
    console.error('Error updating Geo Fence:', error);
    throw error;
  }
};

export const deleteGeoFence = async (id: number) => {
  try {
    const response = await axiosInstance.delete(`/api/geo-fence/${id}`);
    console.log('deleteGeoFence response', response);
    return response;
  } catch (error) {
    console.error('Error deleting Geo Fence:', error);
    throw error;
  }
};

export const tagGeoFencetoDevice = async (
  deviceId: number,
  geoFenceId: number,
  geofenceDeviceAlertType: string = 'ALERT'
) => {
  try {
    const payload = {
      deviceId: deviceId,
      geoFenceId: geoFenceId,
      geofenceDeviceAlertType: geofenceDeviceAlertType,
    };
    console.log('tagGeoFencetoDevice payload = ', payload);
    const response = await axiosInstance.post(
      `/api/geo-fence-devices`,
      payload
    );
    console.log('tagGeoFencetoDevice response', response);
    return response;
  } catch (error) {
    console.error('Error tagGeoFencetoDevice :', error);
    throw error;
  }
};
