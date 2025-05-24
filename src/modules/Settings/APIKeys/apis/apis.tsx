import axiosInstance from '../../../../utils/axiosConfig';

export const fetchApiKeys = async () => {
    try {
        const response = await axiosInstance.get('/api/settings/api-keys');
        //console.log("filter API keys =" + JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        console.error('Error fetching API keys error:', error);
    }
};

export const updateApiKeys = async ( apiKeys: any) => {
    try {
        //console.log("updateApiKeys payload", apiKeys);
        const response = await axiosInstance.put(`/api/settings/api-keys`, apiKeys);
        //console.log("updateApiKeys response", response);
        return response;
    } catch (error) {
        console.error('Error updateApiKeys :', error);
        throw error;
    }
};