import axiosInstance from '../../../../utils/axiosConfig';

export const fetchSystemLogs = async (page: number = 1, size: number = 10) => {
    try {
        const params = {
            page: page,
            size: size,
        };
        console.log("fetch sys log payload =" , params);
        const response = await axiosInstance.get('/api/sys-logs', { params });
        console.log("fetch sys log res =" , response);
        return response.data;
    } catch (error) {
        console.error('Error fetching sys log error:', error);
    }
};