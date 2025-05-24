import axios, { AxiosError } from 'axios';
import axiosInstance from '../../../../utils/axiosConfig';

// Comment out BASE_URL for demo mode
// const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

// Demo data for drivers - matching IDriver interface
const demoDrivers = [
    {
        id: 1,
        userId: 101,
        phoneNumber: "+1-555-0101",
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@example.com",
        status: "Active",
        driverLicenseNumber: "DL123456789",
        licenseExpirationDate: "2025-12-31",
        licenseType: "Commercial",
        homeAddress: "123 Main St, New York, NY 10001",
        emergencyNumber: "+1-555-0911",
        emergencyName: "Jane Smith",
        bloodGroup: "O+",
        insuranceNumber: "INS123456789",
        driverDigitalNumber: "DDN123456789",
        garageId: 1,
        thirdPartyCompanyId: null,
        user: {
            id: 101,
            createdAt: "2023-01-15T10:30:00Z",
            updatedAt: "2024-01-15T10:30:00Z",
            email: "john.smith@example.com",
            username: "johnsmith",
            firstName: "John",
            lastName: "Smith",
            phone: "+1-555-0101",
            accessToken: null,
            refreshToken: null,
            picture: null,
            organizationId: 1,
            password: "hashed_password",
            isDriver: true
        }
    },
    {
        id: 2,
        userId: 102,
        phoneNumber: "+1-555-0102",
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@example.com",
        status: "Active",
        driverLicenseNumber: "DL987654321",
        licenseExpirationDate: "2026-03-15",
        licenseType: "Commercial",
        homeAddress: "456 Oak Ave, Brooklyn, NY 11201",
        emergencyNumber: "+1-555-0912",
        emergencyName: "Mike Johnson",
        bloodGroup: "A+",
        insuranceNumber: "INS987654321",
        driverDigitalNumber: "DDN987654321",
        garageId: 1,
        thirdPartyCompanyId: null,
        user: {
            id: 102,
            createdAt: "2023-02-20T10:30:00Z",
            updatedAt: "2024-01-15T10:30:00Z",
            email: "sarah.johnson@example.com",
            username: "sarahjohnson",
            firstName: "Sarah",
            lastName: "Johnson",
            phone: "+1-555-0102",
            accessToken: null,
            refreshToken: null,
            picture: null,
            organizationId: 1,
            password: "hashed_password",
            isDriver: true
        }
    },
    {
        id: 3,
        userId: 103,
        phoneNumber: "+1-555-0103",
        firstName: "Mike",
        lastName: "Davis",
        email: "mike.davis@example.com",
        status: "Inactive",
        driverLicenseNumber: "DL456789123",
        licenseExpirationDate: "2025-08-20",
        licenseType: "Standard",
        homeAddress: "789 Pine St, Queens, NY 11355",
        emergencyNumber: "+1-555-0913",
        emergencyName: "Lisa Davis",
        bloodGroup: "B+",
        insuranceNumber: "INS456789123",
        driverDigitalNumber: "DDN456789123",
        garageId: 2,
        thirdPartyCompanyId: null,
        user: {
            id: 103,
            createdAt: "2022-11-10T10:30:00Z",
            updatedAt: "2024-01-15T10:30:00Z",
            email: "mike.davis@example.com",
            username: "mikedavis",
            firstName: "Mike",
            lastName: "Davis",
            phone: "+1-555-0103",
            accessToken: null,
            refreshToken: null,
            picture: null,
            organizationId: 1,
            password: "hashed_password",
            isDriver: true
        }
    },
    {
        id: 4,
        userId: 104,
        phoneNumber: "+1-555-0104",
        firstName: "Emily",
        lastName: "Wilson",
        email: "emily.wilson@example.com",
        status: "Active",
        driverLicenseNumber: "DL789123456",
        licenseExpirationDate: "2026-01-10",
        licenseType: "Commercial",
        homeAddress: "321 Elm Dr, Manhattan, NY 10001",
        emergencyNumber: "+1-555-0914",
        emergencyName: "Tom Wilson",
        bloodGroup: "AB+",
        insuranceNumber: "INS789123456",
        driverDigitalNumber: "DDN789123456",
        garageId: 1,
        thirdPartyCompanyId: null,
        user: {
            id: 104,
            createdAt: "2023-04-05T10:30:00Z",
            updatedAt: "2024-01-15T10:30:00Z",
            email: "emily.wilson@example.com",
            username: "emilywilson",
            firstName: "Emily",
            lastName: "Wilson",
            phone: "+1-555-0104",
            accessToken: null,
            refreshToken: null,
            picture: null,
            organizationId: 1,
            password: "hashed_password",
            isDriver: true
        }
    }
];

const demoVehicles = [
    { 
        id: 1001, 
        make: "Ford", 
        model: "Transit", 
        trim: "Base",
        year: 2023, 
        plateNumber: "ABC-123", 
        status: "Active",
        color: "White",
        category: "van",
        bodyClass: "Van",
        driveType: "RWD",
        fuelType: "Gasoline",
        doors: 4,
        odometer: 12000,
        transmissionType: "Automatic",
        vin: "1FTBW2CM5JKB12345",
        chasisNo: "CH001"
    },
    { 
        id: 1002, 
        make: "Chevrolet", 
        model: "Express", 
        trim: "Base",
        year: 2022, 
        plateNumber: "XYZ-456", 
        status: "Active",
        color: "Blue",
        category: "van",
        bodyClass: "Van",
        driveType: "RWD",
        fuelType: "Gasoline",
        doors: 4,
        odometer: 18000,
        transmissionType: "Automatic",
        vin: "1GCWGAFG5N1123456",
        chasisNo: "CH002"
    },
    { 
        id: 1003, 
        make: "Mercedes", 
        model: "Sprinter", 
        trim: "Base",
        year: 2023, 
        plateNumber: "DEF-789", 
        status: "Active",
        color: "Silver",
        category: "van",
        bodyClass: "Van",
        driveType: "RWD",
        fuelType: "Diesel",
        doors: 4,
        odometer: 8000,
        transmissionType: "Automatic",
        vin: "WD3PE8CD5NP123456",
        chasisNo: "CH003"
    },
    { 
        id: 1004, 
        make: "Ford", 
        model: "E-Series", 
        trim: "Base",
        year: 2021, 
        plateNumber: "GHI-012", 
        status: "Available",
        color: "Red",
        category: "van",
        bodyClass: "Van",
        driveType: "RWD",
        fuelType: "Gasoline",
        doors: 2,
        odometer: 25000,
        transmissionType: "Automatic",
        vin: "1FDWE35L4MHA12345",
        chasisNo: "CH004"
    }
];

const demoDriverBehavior = {
    totalTrips: 45,
    totalMiles: 1250,
    averageSpeed: 55,
    hardBraking: 3,
    rapidAcceleration: 2,
    speeding: 1,
    score: 8.5,
    trends: [
        { date: "2023-01", score: 7.8 },
        { date: "2023-02", score: 8.1 },
        { date: "2023-03", score: 8.3 },
        { date: "2023-04", score: 8.5 }
    ]
};

const demoFilterOptions = {
    makes: ["Toyota", "Honda", "Ford", "Nissan"],
    models: ["Camry", "Accord", "Focus", "Altima"],
    trims: ["Base", "LX", "SE", "SV"],
    statuses: ["Available", "In Use", "Maintenance", "Out of Service"],
    garages: ["Main Garage", "Downtown Garage", "East Garage", "West Garage"]
};

export const fetchDrivers = async (page: number = 1, size: number = 10) => {
    try {
        // Comment out API call for demo mode
        // const params = { page: page, size: size };
        // const response = await axiosInstance.get('/api/drivers', { params });
        // return response.data;
        
        console.log('fetchDrivers (demo mode)', { page, size });
        
        // Simulate pagination
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const paginatedDrivers = demoDrivers.slice(startIndex, endIndex);
        const totalPages = Math.ceil(demoDrivers.length / size);
        
        return {
            data: paginatedDrivers,
            meta: {
                currentPage: page,
                lastPage: totalPages,
                total: demoDrivers.length,
                perPage: size,
                from: startIndex + 1,
                to: Math.min(endIndex, demoDrivers.length)
            }
        };
    } catch (error) {
        console.error('Error fetching drivers data:', error);
    }
};

export const fetchVehicles = async () => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get('/api/vehicle/list');
        // return response.data;
        
        console.log('fetchVehicles (demo mode)');
        return { data: demoVehicles };
    } catch (error) {
        console.error('Error fetching vehicles data:', error);
    }
};

export const fetchDriverAvailableVehicles = async () => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get('/api/drivers/available-vehicles');
        // return response.data;
        
        console.log('fetchDriverAvailableVehicles (demo mode)');
        const availableVehicles = demoVehicles.filter(vehicle => vehicle.status === 'Available');
        return { data: availableVehicles };
    } catch (error) {
        console.error('Error fetching vehicles data:', error);
    }
};

export const fetchDriverVehicleHistory = async (driverId: string) => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get(`/api/drivers/${driverId}/vehicles`);
        // return response.data;
        
        console.log('fetchDriverVehicleHistory (demo mode)', { driverId });
        
        // Mock vehicle assignment history structure
        const assignments = {
            pending: [
                {
                    id: 1,
                    startDate: "2025-02-01T09:00:00Z",
                    endDate: "2025-02-28T17:00:00Z",
                    vehicle: {
                        id: 1001,
                        make: "Toyota",
                        model: "Camry",
                        trim: "LE",
                        year: 2023,
                        plateNumber: "PEN-001",
                        status: "Pending Assignment",
                        color: "White",
                        category: "sedan",
                        bodyClass: "Sedan",
                        driveType: "FWD",
                        fuelType: "Gasoline",
                        doors: 4,
                        odometer: 15000,
                        transmissionType: "Automatic",
                        vin: "1HGBH41JXMN109186",
                        chasisNo: "CH123456",
                        garage: { 
                            id: 1,
                            name: "Main Garage",
                            address: "123 Main St",
                            city: "New York",
                            country: "USA",
                            createdAt: "2023-01-01T00:00:00Z"
                        }
                    }
                }
            ],
            current: [
                {
                    id: 2,
                    startDate: "2025-01-15T09:00:00Z",
                    endDate: "2025-01-31T17:00:00Z",
                    vehicle: {
                        id: 1002,
                        make: "Honda",
                        model: "Accord",
                        trim: "LX",
                        year: 2022,
                        plateNumber: "CUR-002",
                        status: "In Use",
                        color: "Blue",
                        category: "sedan",
                        bodyClass: "Sedan",
                        driveType: "FWD",
                        fuelType: "Gasoline",
                        doors: 4,
                        odometer: 25000,
                        transmissionType: "CVT",
                        vin: "1HGBH41JXMN109187",
                        chasisNo: "CH123457",
                        garage: { 
                            id: 2,
                            name: "Downtown Garage",
                            address: "456 Downtown Ave",
                            city: "New York",
                            country: "USA",
                            createdAt: "2023-01-01T00:00:00Z"
                        }
                    }
                }
            ],
            completed: [
                {
                    id: 3,
                    startDate: "2024-12-01T09:00:00Z",
                    endDate: "2024-12-31T17:00:00Z",
                    vehicle: {
                        id: 1003,
                        make: "Ford",
                        model: "Focus",
                        trim: "SE",
                        year: 2021,
                        plateNumber: "COM-003",
                        status: "Available",
                        color: "Red",
                        category: "hatchback",
                        bodyClass: "Hatchback",
                        driveType: "FWD",
                        fuelType: "Gasoline",
                        doors: 4,
                        odometer: 35000,
                        transmissionType: "Manual",
                        vin: "1HGBH41JXMN109188",
                        chasisNo: "CH123458",
                        garage: { 
                            id: 3,
                            name: "East Garage",
                            address: "789 East St",
                            city: "New York",
                            country: "USA",
                            createdAt: "2023-01-01T00:00:00Z"
                        }
                    }
                },
                {
                    id: 4,
                    startDate: "2024-11-01T09:00:00Z",
                    endDate: "2024-11-30T17:00:00Z",
                    vehicle: {
                        id: 1004,
                        make: "Nissan",
                        model: "Altima",
                        trim: "SV",
                        year: 2020,
                        plateNumber: "COM-004",
                        status: "Available",
                        color: "Silver",
                        category: "sedan",
                        bodyClass: "Sedan",
                        driveType: "FWD",
                        fuelType: "Gasoline",
                        doors: 4,
                        odometer: 45000,
                        transmissionType: "CVT",
                        vin: "1HGBH41JXMN109189",
                        chasisNo: "CH123459",
                        garage: { 
                            id: 4,
                            name: "West Garage",
                            address: "321 West Blvd",
                            city: "New York",
                            country: "USA",
                            createdAt: "2023-01-01T00:00:00Z"
                        }
                    }
                }
            ]
        };
        
        return { assignments };
    } catch (error) {
        console.error('Error fetching vehicles data:', error);
    }
};

export const fetchFilterOptions = async () => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get('/api/vehicle/filters');
        // return response.data;
        
        console.log('fetchFilterOptions (demo mode)');
        return demoFilterOptions;
    } catch (error) {
        console.error('Error fetching vehicles data:', error);
    }
};

export const fetchDriverBehavior = async (frequency: string, driverId: string) => {
    try {
        // Comment out API call for demo mode
        // console.log(`/api/drivers/driver-behavior?frequency=${frequency}&driverId=${driverId}&historicalData=true`);
        // const response = await axiosInstance.get(`/api/drivers/driver-behavior?frequency=${frequency}&driverId=${driverId}&historicalData=true`);
        // return response.data;
        
        console.log('fetchDriverBehavior (demo mode)', { frequency, driverId });
        return { data: demoDriverBehavior };
    } catch (error) {
        console.error('Error fetching vehicles data:', error);
    }
};

export const createDriverVehicleAssignment = async (data: any) => {
    try {
        // Comment out API call for demo mode
        // const payload = {
        //     ...data,
        //     startDate: new Date(data.startDate).toISOString(),
        //     endDate: new Date(data.endDate).toISOString(),
        // }
        // console.log("createDriverVehicleAssignment payload", payload);
        // const response = await axiosInstance.post(`/api/drivers/driver-assignment`, payload);
        // return response;
        
        console.log('createDriverVehicleAssignment (demo mode)', data);
        
        // Mock successful assignment creation
        const mockResponse = {
            data: {
                id: Date.now(),
                driverId: data.driverId,
                vehicleId: data.vehicleId,
                startDate: data.startDate,
                endDate: data.endDate,
                status: 'Active',
                createdAt: new Date().toISOString()
            },
            status: 201,
            statusText: 'Created'
        };
        
        return mockResponse;
    } catch (error) {
        console.error('Error creating vehicle assignment:', error);
        throw error;
    }
};

export const deleteDriverAssignment = async (assignmentId: number) => {
  try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.delete(`/api/drivers/driver-assignment/${assignmentId}`);
        // return response.data;
        
        console.log('deleteDriverAssignment (demo mode)', { assignmentId });
        
        // Mock successful deletion
        return {
            success: true,
            message: 'Assignment deleted successfully',
            deletedId: assignmentId
        };
  } catch (error) {
    console.error(`Failed to delete assignment ${assignmentId}:`, error);
    throw error;
  }
};

export const filesUpload = async (driverId: number, documentType: string, uploadType: string, base64: string[]) => {
    try {
        // Comment out API call for demo mode
        // const files = base64.map((data) => ({
        //     data: data,
        //     documentType: documentType,
        //     uploadType: uploadType,
        // }));
        // const params = { driverId: driverId, files: files };
        // console.log('drivers/uploadDocuments  params:', params);
        // const response = await axiosInstance.post(`/api/drivers/uploadDocuments`, params);
        // console.log('drivers/uploadDocuments successfully:', response.data);
        // return response.data;
        
        console.log('filesUpload (demo mode)', { driverId, documentType, uploadType, filesCount: base64.length });
        
        // Mock successful file upload
        const mockUploadedFiles = base64.map((_, index) => ({
            id: Date.now() + index,
            fileName: `document_${index + 1}.pdf`,
            documentType: documentType,
            uploadType: uploadType,
            uploadDate: new Date().toISOString(),
            status: 'Uploaded'
        }));
        
        return {
            success: true,
            message: 'Documents uploaded successfully',
            files: mockUploadedFiles
        };
    } catch (error: any) {
        console.error('Error drivers/uploadDocuments:', error.response?.data || error.message);
        throw new Error(
            error.response?.data?.message || 'Failed to Upload Documents. Please try again.'
        );
    }
};
