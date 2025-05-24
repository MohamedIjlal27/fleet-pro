import axios, { AxiosError } from 'axios';
import axiosInstance from '../../../../utils/axiosConfig';
import { IOrganizationSettingsFormData } from '../interfaces/setting.interface';

export const fetchSettingsSmsEmailTemplate = async () => {
  try {
    const response = await axiosInstance.get('/api/settings/sms-email-template');
    return response.data;
  } catch (error) {
    console.error('Error fetching settings sms-email-template data:', error);
  }
};

export const updateSettingsSmsEmailTemplate = async (data: IOrganizationSettingsFormData) => {
  try {
    const response = await axiosInstance.put(`/api/settings/sms-email-template`, data);
    return response.data; // Return updated sms-email-template data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update sms-email-template.');
    } else {
      throw new Error('An unexpected error occurred while updating the sms-email-template.');
    }
  }
};
