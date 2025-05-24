// Comment out unused import for demo mode
// import axiosInstance from '../../../../utils/axiosConfig';
import { IMaintenanceDetail } from '../interfaces/interfaces';

// Demo data for maintenance options/filters
const demoMaintenanceOptions = {
    status: {
        "scheduled": "Scheduled",
        "in-progress": "In Progress", 
        "completed": "Completed",
        "cancelled": "Cancelled"
    },
    serviceType: {
        "oil-change": "Oil Change",
        "brake-service": "Brake Service",
        "tire-rotation": "Tire Rotation",
        "engine-check": "Engine Check",
        "transmission-service": "Transmission Service",
        "full-service": "Full Service"
    }
};

// Demo data for maintenance records
const demoMaintenances: IMaintenanceDetail[] = [
    {
        id: 1,
        carId: 1001,
        userId: 101,
        plateNumber: "ABC-123",
        startTime: "2024-01-15T09:00:00Z",
        status: 3,
        statusName: "Completed",
        serviceType: 1,
        serviceTypeName: "Oil Change",
        coverImage: "/src/assets/car_models/car_model_1_big.png",
        make: "Ford",
        model: "Transit",
        year: 2022,
        color: "White",
        amount: 150,
        work_shop: "Main Auto Shop",
        notes: "Regular oil change service completed successfully",
        service_detail: "Changed engine oil and oil filter, checked fluid levels",
        estimated_cost: 120,
        practical_cost: 150,
        paid_date: "2024-01-15T15:30:00Z",
        paid_resource: "Credit Card",
        maintenanceRecordFiles: [
            { id: 1, fileName: "receipt_oil_change.pdf", url: "/uploads/receipt1.pdf" }
        ],
        repairEta: "2024-01-15T12:00:00Z",
        endTime: "2024-01-15T11:30:00Z",
        odometer: 15000,
        fuelType: "Gasoline",
        vin: "1FTBW2CM5JKB12345",
        garage_name: "Main Garage",
        garage_address: "123 Main St, Toronto, ON",
        pickupAssigneeId: 201,
        pickupScheduleDate: "2024-01-15T08:30:00Z",
        dropOffAssigneeId: 202,
        dropOffScheduleDate: "2024-01-15T16:00:00Z",
        maintenanceDeliveryReturn: { status: "completed", deliveryDate: "2024-01-15T16:00:00Z" },
        maintenanceDelivery: { status: "completed", pickupDate: "2024-01-15T08:30:00Z" },
        user: { id: 101, firstName: "John", lastName: "Smith", email: "john.smith@example.com" },
        vehicle: {
            plateNumber: "ABC-123",
            coverImage: "/src/assets/car_models/car_model_1_big.png",
            make: "Ford",
            model: "Transit",
            year: 2022,
            color: "White"
        }
    },
    {
        id: 2,
        carId: 1002,
        userId: 102,
        plateNumber: "XYZ-456",
        startTime: "2024-01-20T14:00:00Z",
        status: 2,
        statusName: "In Progress",
        serviceType: 2,
        serviceTypeName: "Brake Service",
        coverImage: "/src/assets/car_models/car_model_1_big.png",
        make: "Chevrolet",
        model: "Express",
        year: 2021,
        color: "Blue",
        amount: 450,
        work_shop: "Downtown Auto Service",
        notes: "Brake pads and rotors replacement in progress",
        service_detail: "Replacing front brake pads and rotors, brake fluid flush",
        estimated_cost: 400,
        practical_cost: 450,
        paid_date: undefined,
        paid_resource: undefined,
        maintenanceRecordFiles: [],
        repairEta: "2024-01-20T18:00:00Z",
        endTime: undefined,
        odometer: 18500,
        fuelType: "Gasoline",
        vin: "1GCWGAFG5N1123456",
        garage_name: "Downtown Garage",
        garage_address: "456 Downtown Ave, Toronto, ON",
        pickupAssigneeId: 203,
        pickupScheduleDate: "2024-01-20T13:30:00Z",
        dropOffAssigneeId: undefined,
        dropOffScheduleDate: undefined,
        maintenanceDeliveryReturn: undefined,
        maintenanceDelivery: { status: "completed", pickupDate: "2024-01-20T13:30:00Z" },
        user: { id: 102, firstName: "Sarah", lastName: "Johnson", email: "sarah.johnson@example.com" },
        vehicle: {
            plateNumber: "XYZ-456",
            coverImage: "/src/assets/car_models/car_model_1_big.png",
            make: "Chevrolet",
            model: "Express",
            year: 2021,
            color: "Blue"
        }
    },
    {
        id: 3,
        carId: 1003,
        userId: 103,
        plateNumber: "DEF-789",
        startTime: "2024-01-25T10:30:00Z",
        status: 1,
        statusName: "Scheduled",
        serviceType: 3,
        serviceTypeName: "Tire Rotation",
        coverImage: "/src/assets/car_models/car_model_1_big.png",
        make: "Mercedes",
        model: "Sprinter",
        year: 2023,
        color: "Silver",
        amount: 80,
        work_shop: "East Side Auto",
        notes: "Scheduled tire rotation and alignment check",
        service_detail: "Rotate all four tires, check alignment and tire pressure",
        estimated_cost: 80,
        practical_cost: 80,
        paid_date: undefined,
        paid_resource: undefined,
        maintenanceRecordFiles: [],
        repairEta: "2024-01-25T12:00:00Z",
        endTime: undefined,
        odometer: 13200,
        fuelType: "Diesel",
        vin: "WD3PE8CD5NP123456",
        garage_name: "East Garage",
        garage_address: "789 East St, Toronto, ON",
        pickupAssigneeId: undefined,
        pickupScheduleDate: "2024-01-25T10:00:00Z",
        dropOffAssigneeId: undefined,
        dropOffScheduleDate: undefined,
        maintenanceDeliveryReturn: undefined,
        maintenanceDelivery: undefined,
        user: { id: 103, firstName: "Mike", lastName: "Davis", email: "mike.davis@example.com" },
        vehicle: {
            plateNumber: "DEF-789",
            coverImage: "/src/assets/car_models/car_model_1_big.png",
            make: "Mercedes",
            model: "Sprinter",
            year: 2023,
            color: "Silver"
        }
    }
];

export const fetchMaintenanceOptions = async () => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get('/api/maintenance/options');
        // return response.data;
        
        console.log('fetchMaintenanceOptions (demo mode)');
        return demoMaintenanceOptions;
    } catch (error) {
        console.error('Error fetching maintenance data:', error);
    }
};

export const fetchMaintenances = async (page: number = 1, size: number = 10, carId: number | null = null , status: string = '', serviceType: string = '')  => {
    try {
        // Comment out API call for demo mode
        // const params = {
        //     page: page,
        //     size: size,
        //     carId:carId,
        //     status: status,
        //     serviceType: serviceType,
        // };
        // const response = await axiosInstance.get('/api/maintenance/', { params });
        // return response.data;
        
        console.log('fetchMaintenances (demo mode)', { page, size, carId, status, serviceType });
        
        // Filter demo data based on parameters
        let filteredData = [...demoMaintenances];
        
        if (carId) {
            filteredData = filteredData.filter(item => item.carId === carId);
        }
        if (status) {
            filteredData = filteredData.filter(item => item.statusName.toLowerCase() === status.toLowerCase());
        }
        if (serviceType) {
            filteredData = filteredData.filter(item => item.serviceTypeName.toLowerCase().includes(serviceType.toLowerCase()));
        }
        
        // Simulate pagination
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        return {
            data: paginatedData,
            meta: {
                currentPage: page,
                lastPage: Math.ceil(filteredData.length / size),
                total: filteredData.length,
                perPage: size,
                from: startIndex + 1,
                to: Math.min(endIndex, filteredData.length)
            }
        };
    } catch (error) {
        console.error('Error fetching maintenance data:', error);
    }
};

export const fetchMaintenanceDetail = async (id: number) => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get(`/api/maintenance/${id}`);
        // return response.data;
        
        console.log('fetchMaintenanceDetail (demo mode)', { id });
        
        // Find maintenance record by id
        const maintenanceDetail = demoMaintenances.find(item => item.id === id);
        
        if (maintenanceDetail) {
            return maintenanceDetail;
        } else {
            throw new Error(`Maintenance record with id ${id} not found`);
        }
    } catch (error) {
        console.error('Error fetching maintenance detail data:', error);
        throw error;
    }
};

export const createMaintenance = async (maintenanceData: IMaintenanceDetail) => {
    try {
        // Comment out API call for demo mode
        // const sanitizedData = {
        //     ...maintenanceData,
        //     paid_date: maintenanceData.paid_date?.trim() ? maintenanceData.paid_date : undefined,
        //     endTime: maintenanceData.endTime?.trim() ? maintenanceData.endTime : undefined,
        // };
        // const response = await axiosInstance.post(`/api/maintenance`, sanitizedData);
        // return response.data;
        
        console.log('createMaintenance (demo mode)', maintenanceData);
        
        // Create new maintenance record with generated id
        const newMaintenance: IMaintenanceDetail = {
            ...maintenanceData,
            id: Date.now(), // Generate unique ID
            startTime: maintenanceData.startTime || new Date().toISOString(),
        };
        
        // Add to demo data for session consistency
        demoMaintenances.push(newMaintenance);
        
        const mockResponse = {
            data: newMaintenance,
            message: 'Maintenance created successfully (demo mode)',
            success: true
        };
        
        console.log('Maintenance created successfully (demo mode):', mockResponse);
        return mockResponse;
    } catch (error: any) {
        console.error('Error creating Maintenance (demo mode):', error);
        throw new Error('Failed to create Maintenance in demo mode. Please try again.');
    }
};

export const updateMaintenance = async (maintenanceData: IMaintenanceDetail) => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.put(`/api/maintenance/${maintenanceData.id}`, maintenanceData);
        // return response.data;
        
        console.log('updateMaintenance (demo mode)', maintenanceData);
        
        // Find and update maintenance record in demo data
        const maintenanceIndex = demoMaintenances.findIndex(item => item.id === maintenanceData.id);
        
        if (maintenanceIndex !== -1) {
            demoMaintenances[maintenanceIndex] = { ...demoMaintenances[maintenanceIndex], ...maintenanceData };
            
            const mockResponse = {
                data: demoMaintenances[maintenanceIndex],
                message: 'Maintenance updated successfully (demo mode)',
                success: true
            };
            
            console.log('Maintenance updated successfully (demo mode):', mockResponse);
            return mockResponse;
        } else {
            throw new Error(`Maintenance record with id ${maintenanceData.id} not found`);
        }
    } catch (error: any) {
        console.error('Error updating Maintenance (demo mode):', error);
        throw new Error('Failed to update Maintenance in demo mode. Please try again.');
    }
};

export const uploadMaintenanceDocument = async  (maintenanceId: number, file: File) => {
    try {
        // Comment out API call for demo mode
        // const formData = new FormData();
        // formData.append('file', file);
        // formData.append('maintenanceId', maintenanceId.toString());
        // const response = await axiosInstance.post(`/api/maintenance/uploadDocument`, formData);
        // return response.data;
        
        console.log('uploadMaintenanceDocument (demo mode)', { maintenanceId, fileName: file.name, fileSize: file.size });
        
        // Mock successful file upload
        const mockFileUpload = {
            id: Date.now(),
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadDate: new Date().toISOString(),
            url: `/uploads/demo_${file.name}`,
            maintenanceId: maintenanceId
        };
        
        const mockResponse = {
            data: mockFileUpload,
            message: 'Document uploaded successfully (demo mode)',
            success: true
        };
        
        console.log('Document uploaded successfully (demo mode):', mockResponse);
        return mockResponse;
    } catch (error: any) {
        console.error('Error uploading document (demo mode):', error);
        throw new Error('Failed to upload document in demo mode. Please try again.');
    }
};