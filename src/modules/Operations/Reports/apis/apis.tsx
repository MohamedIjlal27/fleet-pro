import axios, { AxiosError } from 'axios';
// Comment out unused import for demo mode
// import axiosInstance from '../../../../utils/axiosConfig';

// Comment out BASE_URL for demo mode
// const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

// Demo data for reports
const demoReports = [
    {
        id: 1,
        name: "Monthly Mileage Report",
        type: "mileage-report",
        description: "Vehicle mileage summary for the month",
        generatedDate: "2024-01-15T10:30:00Z",
        status: "Completed",
        fileUrl: "/reports/mileage-january-2024.pdf",
        fromDate: "2024-01-01",
        toDate: "2024-01-31",
        organizationId: 1,
        metadata: {},
        createdAt: "2024-01-15T10:30:00Z",
        user: {
            name: "John Smith"
        }
    },
    {
        id: 2,
        name: "Fuel Consumption Report",
        type: "fuel-consumption-report",
        description: "Fleet fuel usage analysis",
        generatedDate: "2024-01-10T14:20:00Z",
        status: "Completed",
        fileUrl: "/reports/fuel-january-2024.pdf",
        fromDate: "2024-01-01",
        toDate: "2024-01-31",
        organizationId: 1,
        metadata: {},
        createdAt: "2024-01-10T14:20:00Z",
        user: {
            name: "Sarah Johnson"
        }
    },
    {
        id: 3,
        name: "Driver Performance Report",
        type: "driver-performance-report",
        description: "Monthly driver performance metrics",
        generatedDate: "2024-01-05T09:15:00Z",
        status: "Completed",
        fileUrl: "/reports/performance-january-2024.pdf",
        fromDate: "2024-01-01",
        toDate: "2024-01-31",
        organizationId: 1,
        metadata: {},
        createdAt: "2024-01-05T09:15:00Z",
        user: {
            name: "Mike Davis"
        }
    },
    {
        id: 4,
        name: "Maintenance Report",
        type: "maintenance-report",
        description: "Vehicle maintenance schedule overview",
        generatedDate: "2024-01-03T11:45:00Z",
        status: "Completed",
        fileUrl: "/reports/maintenance-january-2024.pdf",
        fromDate: "2024-01-01",
        toDate: "2024-01-31",
        organizationId: 1,
        metadata: {},
        createdAt: "2024-01-03T11:45:00Z",
        user: {
            name: "Emily Wilson"
        }
    }
];

const demoReportTypes = {
    type: {
        "mileage-report": "Mileage Report",
        "fuel-consumption-report": "Fuel Consumption Report", 
        "driver-performance-report": "Driver Performance Report",
        "maintenance-report": "Maintenance Report"
    }
};

const demoMileageReport = {
    totalMileage: 15420,
    averageMileagePerVehicle: 3855,
    vehicleData: [
        { vehicleId: 1001, plateNumber: "ABC-123", mileage: 4200, fuelUsed: 320 },
        { vehicleId: 1002, plateNumber: "XYZ-456", mileage: 3800, fuelUsed: 290 },
        { vehicleId: 1003, plateNumber: "DEF-789", mileage: 4150, fuelUsed: 315 },
        { vehicleId: 1004, plateNumber: "GHI-012", mileage: 3270, fuelUsed: 248 }
    ],
    trends: [
        { month: "2023-10", totalMileage: 14200 },
        { month: "2023-11", totalMileage: 14800 },
        { month: "2023-12", totalMileage: 15420 },
        { month: "2024-01", totalMileage: 15850 }
    ]
};

const demoFuelConsumptionReport = {
    totalFuelConsumed: 1173,
    averageFuelPerVehicle: 293.25,
    fuelCostTotal: 4692,
    efficiency: {
        bestPerformer: { vehicleId: 1004, plateNumber: "GHI-012", mpg: 13.2 },
        worstPerformer: { vehicleId: 1001, plateNumber: "ABC-123", mpg: 11.8 }
    },
    monthlyData: [
        { month: "2023-10", fuelUsed: 1120, cost: 4480 },
        { month: "2023-11", fuelUsed: 1145, cost: 4580 },
        { month: "2023-12", fuelUsed: 1173, cost: 4692 },
        { month: "2024-01", fuelUsed: 1198, cost: 4792 }
    ]
};

export const getReportsList = async (page: number = 1, size: number = 10) => {
    try {
        // Comment out API call for demo mode
        // const params = { page: page, size: size };
        // const response = await axiosInstance.get('/api/reports',{ params });
        // console.log("genMileageReport" + JSON.stringify(response));
        // return response.data;
        
        console.log('getReportsList (demo mode)', { page, size });
        
        // Simulate pagination
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const paginatedReports = demoReports.slice(startIndex, endIndex);
        const totalPages = Math.ceil(demoReports.length / size);
        
        return {
            data: paginatedReports,
            meta: {
                currentPage: page,
                lastPage: totalPages,
                total: demoReports.length,
                perPage: size,
                from: startIndex + 1,
                to: Math.min(endIndex, demoReports.length)
            }
        };
    } catch (error) {
        console.error('Error getReportsList:', error);
    }
};

export const getReportsTypeList = async () => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get('/api/reports/type-list',);
        // console.log("getReportsTypeList" + JSON.stringify(response));
        // return response;
        
        console.log('getReportsTypeList (demo mode)');
        return { data: demoReportTypes };
    } catch (error) {
        console.error('Error getReportsTypeList:', error);
    }
};

export const genReportByType = async (typeName: string, fromDate: string, toDate: string) => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get(`/api/reports/${typeName}`,{
        //     params: { fromDate: fromDate, toDate: toDate },
        // });
        // console.log("genReportByType" + JSON.stringify(response));
        // return response;
        
        console.log('genReportByType (demo mode)', { typeName, fromDate, toDate });
        
        let csvData;
        switch (typeName) {
            case 'mileage-report':
                csvData = `Vehicle ID,Plate Number,Mileage,Fuel Used
1001,ABC-123,4200,320
1002,XYZ-456,3800,290
1003,DEF-789,4150,315
1004,GHI-012,3270,248`;
                break;
            case 'fuel-consumption-report':
                csvData = `Vehicle ID,Plate Number,Fuel Consumed,Cost,MPG
1001,ABC-123,320,1280,11.8
1002,XYZ-456,290,1160,12.1
1003,DEF-789,315,1260,12.0
1004,GHI-012,248,992,13.2`;
                break;
            case 'driver-performance-report':
                csvData = `Driver ID,Driver Name,Total Miles,Safety Score,Fuel Efficiency
101,John Smith,4200,8.5,11.8
102,Sarah Johnson,3800,9.1,12.1
103,Mike Davis,4150,7.9,12.0
104,Emily Wilson,3270,9.3,13.2`;
                break;
            case 'maintenance-report':
                csvData = `Vehicle ID,Plate Number,Next Service Date,Service Type,Miles Until Service
1001,ABC-123,2024-03-15,Oil Change,1200
1002,XYZ-456,2024-03-20,Tire Rotation,800
1003,DEF-789,2024-03-10,Brake Inspection,950
1004,GHI-012,2024-03-25,Full Service,1500`;
                break;
            default:
                csvData = `Report Type,Generated Date,Date Range
${typeName},${new Date().toISOString()},${fromDate} to ${toDate}`;
        }
        
        return { data: csvData };
    } catch (error) {
        console.error('Error genReportByType:', error);
    }
};

export const genFuelConsumptionReport = async (fromDate: string, toDate: string) => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get('/api/reports/fuel-consumption-report',{
        //     params: { fromDate: fromDate, toDate: toDate },
        // });
        // console.log("genFuelConsumptionReport" + JSON.stringify(response));
        // return response;
        
        console.log('genFuelConsumptionReport (demo mode)', { fromDate, toDate });
        
        const csvData = `Vehicle ID,Plate Number,Fuel Consumed,Cost,MPG
1001,ABC-123,320,1280,11.8
1002,XYZ-456,290,1160,12.1
1003,DEF-789,315,1260,12.0
1004,GHI-012,248,992,13.2`;
        
        return { data: csvData };
    } catch (error) {
        console.error('Error genFuelConsumptionReport:', error);
    }
};

export const genMileageReport = async (fromDate: string, toDate: string) => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get('/api/reports/mileage-report',{
        //     params: { fromDate: fromDate, toDate: toDate },
        // });
        // console.log("genMileageReport" + JSON.stringify(response));
        // return response;
        
        console.log('genMileageReport (demo mode)', { fromDate, toDate });
        
        const csvData = `Vehicle ID,Plate Number,Mileage,Fuel Used
1001,ABC-123,4200,320
1002,XYZ-456,3800,290
1003,DEF-789,4150,315
1004,GHI-012,3270,248`;
        
        return { data: csvData };
    } catch (error) {
        console.error('Error genMileageReport:', error);
    }
};


