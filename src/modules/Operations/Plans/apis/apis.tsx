import axios, { AxiosError } from 'axios';
import axiosInstance from '../../../../utils/axiosConfig';

// Comment out BASE_URL for demo mode
// const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

// Demo data for plans
const demoPlans = [
    {
        id: 1,
        name: "Basic Fleet Plan",
        description: "Essential fleet management features",
        price: 29.99,
        currency: "USD",
        billingCycle: "monthly",
        features: [
            "Up to 10 vehicles",
            "Real-time tracking",
            "Basic reporting",
            "Email support"
        ],
        maxVehicles: 10,
        isActive: true,
        createdAt: "2023-01-15T10:30:00Z",
        updatedAt: "2023-06-20T14:20:00Z"
    },
    {
        id: 2,
        name: "Professional Fleet Plan",
        description: "Advanced fleet management with analytics",
        price: 59.99,
        currency: "USD",
        billingCycle: "monthly",
        features: [
            "Up to 50 vehicles",
            "Advanced analytics",
            "Custom reporting",
            "Driver behavior monitoring",
            "Priority support"
        ],
        maxVehicles: 50,
        isActive: true,
        createdAt: "2023-02-10T09:15:00Z",
        updatedAt: "2023-08-15T16:45:00Z"
    },
    {
        id: 3,
        name: "Enterprise Fleet Plan",
        description: "Complete fleet management solution",
        price: 99.99,
        currency: "USD",
        billingCycle: "monthly",
        features: [
            "Unlimited vehicles",
            "AI-powered insights",
            "Custom integrations",
            "24/7 phone support",
            "Dedicated account manager",
            "White-label options"
        ],
        maxVehicles: null,
        isActive: true,
        createdAt: "2023-03-05T11:20:00Z",
        updatedAt: "2023-09-10T13:30:00Z"
    },
    {
        id: 4,
        name: "Legacy Plan",
        description: "Discontinued basic plan",
        price: 19.99,
        currency: "USD",
        billingCycle: "monthly",
        features: [
            "Up to 5 vehicles",
            "Basic tracking",
            "Limited support"
        ],
        maxVehicles: 5,
        isActive: false,
        createdAt: "2022-06-01T08:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z"
    }
];

export const fetchPlans = async () => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get('/api/plans');
        // console.log("Plan", response.data);
        // return response.data;
        
        console.log('fetchPlans (demo mode)');
        
        // Return only active plans by default
        const activePlans = demoPlans.filter(plan => plan.isActive);
        return { data: activePlans };
    } catch (error) {
        console.error('Error fetching plans data:', error);
    }
};

export const createPlan = async (planData: object) => {
    try {
        // Comment out API call for demo mode
        // console.log("payload", planData);
        // const response = await axiosInstance.post(`/api/plans`, planData);
        // console.log("Plan", response);
        // return response.data;
        
        console.log('createPlan (demo mode)', planData);
        
        // Mock successful plan creation
        const newPlan = {
            id: Date.now(),
            ...planData,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Add to demo data for session consistency
        demoPlans.push(newPlan);
        
        return {
            data: newPlan,
            message: 'Plan created successfully'
        };
    } catch (error) {
        console.error('Error creating plan:', error);
        throw error;
    }
};

export const updatePlan = async (id: number, planData: object) => {
    try {
        // Comment out API call for demo mode
        // console.log("payload", planData);
        // const response = await axiosInstance.put(`/api/plans/${id}`, planData);
        // console.log("Plan", response);
        // return response.data;
        
        console.log('updatePlan (demo mode)', { id, planData });
        
        // Find and update the plan in demo data
        const planIndex = demoPlans.findIndex(plan => plan.id === id);
        if (planIndex !== -1) {
            demoPlans[planIndex] = {
                ...demoPlans[planIndex],
                ...planData,
                updatedAt: new Date().toISOString()
            };
            
            return {
                data: demoPlans[planIndex],
                message: 'Plan updated successfully'
            };
        } else {
            throw new Error(`Plan with id ${id} not found`);
        }
    } catch (error) {
        console.error('Error updating plan:', error);
        throw error;
    }
};



