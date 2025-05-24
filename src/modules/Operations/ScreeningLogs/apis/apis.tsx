import axios, { AxiosError } from 'axios';
// Comment out unused import for demo mode
// import axiosInstance from '../../../../utils/axiosConfig';

// Comment out BASE_URL for demo mode
// const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

// Demo data for screening logs
const demoScreeningLogs = [
    {
        id: 1,
        orderId: 1001,
        organizationId: 1,
        customerId: 101,
        driverId: 101,
        driverName: "John Smith",
        screeningType: "Background Check",
        status: "Completed",
        isApproved: true,
        result: "Passed",
        provider: "CheckR",
        applicationId: "APP001",
        remark: "All checks cleared successfully",
        date: "2024-01-17T14:20:00Z",
        requestedDate: "2024-01-15T10:30:00Z",
        completedDate: "2024-01-17T14:20:00Z",
        notes: "All checks cleared successfully",
        documents: [
            { id: 1, name: "Criminal Background Check", status: "Passed" },
            { id: 2, name: "MVR Report", status: "Passed" },
            { id: 3, name: "Drug Test", status: "Passed" }
        ]
    },
    {
        id: 2,
        orderId: 1002,
        organizationId: 1,
        customerId: 102,
        driverId: 102,
        driverName: "Sarah Johnson",
        screeningType: "MVR Check",
        status: "In Process",
        isApproved: false,
        result: null,
        provider: "DMV Direct",
        applicationId: "APP002",
        remark: "Waiting for DMV response",
        date: "2024-01-20T09:15:00Z",
        requestedDate: "2024-01-20T09:15:00Z",
        completedDate: null,
        notes: "Waiting for DMV response",
        documents: [
            { id: 4, name: "MVR Report", status: "Pending" }
        ]
    },
    {
        id: 3,
        orderId: 1003,
        organizationId: 1,
        customerId: 103,
        driverId: 103,
        driverName: "Mike Davis",
        screeningType: "Drug Test",
        status: "Failed",
        isApproved: false,
        result: "Failed",
        provider: "LabCorp",
        applicationId: "APP003",
        remark: "Failed pre-employment drug screening",
        date: "2024-01-19T16:45:00Z",
        requestedDate: "2024-01-18T11:20:00Z",
        completedDate: "2024-01-19T16:45:00Z",
        notes: "Failed pre-employment drug screening",
        documents: [
            { id: 5, name: "Drug Test Results", status: "Failed" }
        ]
    },
    {
        id: 4,
        orderId: 1004,
        organizationId: 1,
        customerId: 104,
        driverId: 104,
        driverName: "Emily Wilson",
        screeningType: "Background Check",
        status: "In Process",
        isApproved: false,
        result: null,
        provider: "Sterling",
        applicationId: "APP004",
        remark: "Background check initiated, waiting for results",
        date: "2024-01-22T08:00:00Z",
        requestedDate: "2024-01-22T08:00:00Z",
        completedDate: null,
        notes: "Background check initiated, waiting for results",
        documents: [
            { id: 6, name: "Criminal Background Check", status: "In Progress" },
            { id: 7, name: "Employment Verification", status: "In Progress" }
        ]
    }
];

export const fetchScreening = async () => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get('/api/screening');
        // console.log("screening data", response.data);
        // return response.data;
        
        console.log('fetchScreening (demo mode)');
        return { data: demoScreeningLogs };
    } catch (error) {
        console.error('Error fetching screening data:', error);
    }
};

/*export const createScreening = async (screeningData: object) => {
    try {
        //console.log("payload", screeningData);
        const response = await axiosInstance.post(`/api/screening`, screeningData);
        //console.log("screening data", response);
        return response.data;
    } catch (error) {
        console.error('Error creating screening:', error);
        throw error;
    }
};*/

export const createScreening = async (orderId: number) => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.post('/api/screening', { orderId });
        // console.log("screening", response.data);
        // return response.data;
        
        console.log('createScreening (demo mode)', { orderId });
        
        // Mock successful screening creation
        const newScreening = {
            id: Date.now(),
            orderId: orderId,
            organizationId: 1,
            customerId: Math.floor(Math.random() * 1000) + 100,
            driverId: Math.floor(Math.random() * 1000) + 100,
            driverName: "New Driver",
            screeningType: "Background Check",
            status: "In Process",
            isApproved: false,
            result: null,
            provider: "CheckR",
            applicationId: `APP${Date.now()}`,
            remark: "Screening request submitted",
            date: new Date().toISOString(),
            requestedDate: new Date().toISOString(),
            completedDate: null,
            notes: "Screening request submitted",
            documents: [
                { id: Date.now() + 1, name: "Criminal Background Check", status: "Pending" },
                { id: Date.now() + 2, name: "MVR Report", status: "Pending" }
            ]
        };
        
        // Add to demo data for session consistency
        demoScreeningLogs.push(newScreening);
        
        return {
            data: newScreening,
            message: 'Screening created successfully'
        };
    } catch (error) {
        console.error('Error creating screening:', error);
        throw error;
    }
};

export const approveScreening = async (id: number) => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.put(`/api/screening/${id}`, {});
        // console.log("screening", response);
        // return response.data;
        
        console.log('approveScreening (demo mode)', { id });
        
        // Find and update the screening in demo data
        const screeningIndex = demoScreeningLogs.findIndex(screening => screening.id === id);
        if (screeningIndex !== -1) {
            demoScreeningLogs[screeningIndex] = {
                ...demoScreeningLogs[screeningIndex],
                status: "Completed",
                isApproved: true,
                result: "Passed",
                completedDate: new Date().toISOString(),
                date: new Date().toISOString(),
                remark: "Screening approved by administrator",
                notes: "Screening approved by administrator"
            };
            
            return {
                data: demoScreeningLogs[screeningIndex],
                message: 'Screening approved successfully'
            };
        } else {
            throw new Error(`Screening with id ${id} not found`);
        }
    } catch (error) {
        console.error('Error approving screening:', error);
        throw error;
    }
};
