import { Role } from "@/types/role";
import axiosInstance from "./axiosConfig";
import { Permission } from "@/types/permission";
import { toast } from "react-toastify";

export const fetchData = async <T>(url: string, options: any = {}): Promise<T> => {
    try {
        const response = await axiosInstance({
            url,
            ...options,
        });
        return response.data as T;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};

// Create role
export const createRole = async (roleData: any) => {
    try {
        const response = await axiosInstance.post('/api/roles', roleData);
        return response.data;
    } catch (error) {
        console.error('Error creating role:', error);
        throw error;
    }
};

// Fetch all roles
export const getRoles = async () => {
    return await fetchData<Role[]>(`/api/roles`);
};

// Fetch all drivers roles
export const getDriversRoles = async () => {
    return await fetchData<Role[]>(`/api/roles/driver`);
};

// Fetch role by ID
export const getRoleById = async (id: number) => {
    return await fetchData<Role>(`/api/roles/${id}`);
};

export const updateRole = async (id: number, roleData: any) => {
    try {
        const response = await axiosInstance.put(`/api/roles/${id}`, roleData);
        return response.data;
    } catch (error) {
        console.error('Error updating role:', error);
        throw error;
    }
};

// Fetch all permissions
export const getPermissions = async () => {
    return await fetchData<Permission[]>(`/api/permissions`);
}

export const getAllUsers = async () => {
    return await fetchData<any>(`/api/user/all`);
}

export const getUserById = async (id: number) => {
    return await fetchData<any>(`/api/user/${id}`);
}

export const createUser = async (userData: any) => {
    try {
        const response = await axiosInstance.post('/api/user', userData);
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const updateUser = async (id: number, userData: any) => {
  try {
    const response = await axiosInstance.put(`/api/user/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const deleteUser = async (id: number) => {
    try {
        const response = await axiosInstance.delete(`/api/user/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

export const getStatistics = async () => {
    return await fetchData<any>(`/api/user/statistics`);
}

export const inviteUser = async (inviteData: {
    userId: number;
    invitationExpiry: number;
    sendEmail: boolean;
    customMessage: string;
}) => {
    try {
        const response = await axiosInstance.post('/api/user/invitation', inviteData);
        return response.data;
    } catch (error) {
        console.error('Error inviting user:', error);
        throw error;
    }
};

export const signUpOrganization = async (organizationData: any) => {
    try {
        const response = await axiosInstance.post('/api/auth/signup-organization', organizationData);
        return response.data;
    } catch (error) {
        console.error('Error signing up organization:', error);
        throw error;
    }
}

export const getBusinessInfo = async () => {
    // Return demo business info for local development
    return {
        metadata: {
            biz_icon: '/src/assets/logo-dark.svg',
            biz_icon_dark: '/src/assets/logo.svg', 
            biz_icon_small: '/src/assets/logo-sm.png'
        }
    };
};

export const postQuestionnaireData = async (preferencesData: any, token: string) => {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
        const response = await axiosInstance.post('/api/system-plans/selection/preferences', preferencesData);
        return response.data;
    } catch (error) {
        console.error('Error posting system plans selection preferences:', error);
        throw error;
    }
};

export const getOrderById = async (id: number) => {
    return await fetchData<any>(`/api/orders/${id}`);
}

export const getTaskById = async (id: number) => {
    return await fetchData<any>(`/api/tasks/${id}`);
}

export const postPayment = async (paymentData: any) => {
    try {
        const response = await axiosInstance.post('/api/system-payments/signup/payment', paymentData);
        return response.data;
    } catch (error) {
        console.error('Error posting payment data:', error);
        throw error;
    }
};

export const activateTrail = async (data: {
    planId: number;
    perAssetType: {
        type: string;
        assets: number;
    }[];
    currency: string;
}) => {
    try {
        const response = await axiosInstance.post('/api/system-plans/activate/trial', data);
        return response.data;
    } catch (error: any) {

        if (error?.response?.status === 401) {
            toast.error(error?.response.data.message);
            alert("Data missing, please do the questionnaire again.");
            window.location.href = "/questionnaire";
            return;
        }

        console.error('Error activating trial:', error);
        toast.error(error?.response.data.message);
        throw error;
    }
}

export const getPlanById = async (planId: number) => {
    try {
        const response = await axiosInstance.get(`/api/plans/${planId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching plan:', error);
    }
};

export const updateTaskById = async (taskId: number, taskData: any) => {
    try {
        const response = await axiosInstance.put(`/api/tasks/${taskId}`, taskData);
        return response.data;
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
}