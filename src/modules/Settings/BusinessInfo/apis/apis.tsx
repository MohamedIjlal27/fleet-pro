import axios, { AxiosError } from 'axios';
import axiosInstance from '../../../../utils/axiosConfig';
export const fetchSettingsBusinessInfo = async () => {
    try {
        const response = await axiosInstance.get('/api/settings/business-info/');
        return response.data;
    } catch (error) {
        console.error('Error fetching settings business-info data:', error);
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

export const updateSettingsBusinessInfo = async (
    businessInfoData: {
        biz_icon: string;
        biz_icon_dark: string;
        biz_icon_small: string;
        biz_name: string;
        pickup_addr: [];
        pickup_hours: [];
    }, 
    newbizIcon: string,
    newbizIconDark: string,
    newbizIconSmall: string
) => {
    try {
        //remove unexpected key
        const pickupAddr = Object.values(businessInfoData.pickup_addr);
        const pickupHours = Object.values(businessInfoData.pickup_hours);
        
        const businessInfoDataFormatted = {
            ...businessInfoData,
            biz_icon: newbizIcon ? newbizIcon : businessInfoData.biz_icon,
            biz_icon_dark: newbizIconDark ? newbizIconDark : businessInfoData.biz_icon_dark,
            biz_icon_small: newbizIconSmall ? newbizIconSmall : businessInfoData.biz_icon_small,
            pickup_addr: pickupAddr,
            pickup_hours: pickupHours,
        }

        const response = await axiosInstance.put(`/api/settings/business-info`, businessInfoDataFormatted);
        return response.data; // Return updated business-info data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to update business-info.');
        } else {
            throw new Error('An unexpected error occurred while updating the business-info.');
        }
    }
};

export const uploadSettingsBusinessInfo = async (id: number, file: File): Promise<any> => {
    try {
      const imageBase64 = await toBase64(file);
  
      const response = await axiosInstance.post('/api/image', { data: imageBase64 }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      return response.data; // Return server response
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to upload file.');
      } else {
        throw new Error('An unexpected error occurred while uploading the file.');
      }
    }
  };
  

// Convert a file to base64 string
const toBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.readAsDataURL(file);

        fileReader.onload = () => {
        resolve(fileReader.result);
        };

        fileReader.onerror = (error) => {
        reject(error);
        };
    });
};

  