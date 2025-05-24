// Comment out unused import for demo mode
// import axiosInstance from '../../../../utils/axiosConfig';
import {IAiMaintenance} from "../interfaces/interfaces";

// Demo data for AI maintenance filters
const demoMaintenanceFilters = {
    severityLevel: {
        "high": "High",
        "medium": "Medium", 
        "low": "Low"
    },
    serviceType: {
        "oil-change": "Oil Change",
        "brake-service": "Brake Service",
        "tire-rotation": "Tire Rotation",
        "engine-check": "Engine Check",
        "transmission-service": "Transmission Service"
    },
    maintenanceType: {
        "preventive": "Preventive",
        "predictive": "Predictive",
        "emergency": "Emergency"
    },
    aiSeverityLevel: {
        "low": "Low (< 50)",
        "medium": "Medium (50-80)",
        "high": "High (> 80)"
    },
    aiServiceType: {
        "oil-change": "Oil Change",
        "brake-service": "Brake Service",
        "tire-rotation": "Tire Rotation",
        "engine-check": "Engine Check",
        "transmission-service": "Transmission Service"
    },
    aiMaintenanceType: {
        "preventive": "Preventive",
        "predictive": "Predictive",
        "emergency": "Emergency"
    }
};

// Demo data for AI maintenance recommendations
const demoAiMaintenances: IAiMaintenance[] = [
    {
        recommendation_id: 1,
        device_id: "DEV001",
        maintenance_type: "preventive",
        service_type: "oil-change",
        preventive_maintenance_date: "2024-02-15T09:00:00Z",
        expected_downtime: "2 hours",
        estimated_cost: 150,
        health_score: 85,
        severity_score: 3,
        last_maintenance_date: "2023-11-15T10:00:00Z",
        last_maintenance_type: "oil-change",
        mileage_at_last_maintenance: 12000,
        processed_at_timestamp: Date.now(),
        processed_at_mileage: 15000,
        predictive_downtime_date: "2024-02-10T09:00:00Z",
        severity_level: "medium",
        vehicle: {
            id: 1001,
            coverImage: "/src/assets/car_models/car_model_1_big.png",
            make: "Ford",
            model: "Transit",
            year: 2022,
            color: "White",
            plateNumber: "ABC-123",
            odometer: 15000,
            fuelType: "Gasoline",
            vin: "1FTBW2CM5JKB12345",
            garage: {
                name: "Main Garage",
                address: "123 Main St, Toronto, ON"
            }
        }
    },
    {
        recommendation_id: 2,
        device_id: "DEV002",
        maintenance_type: "predictive",
        service_type: "brake-service",
        preventive_maintenance_date: "2024-02-20T14:00:00Z",
        expected_downtime: "4 hours",
        estimated_cost: 450,
        health_score: 65,
        severity_score: 7,
        last_maintenance_date: "2023-08-10T11:30:00Z",
        last_maintenance_type: "brake-service",
        mileage_at_last_maintenance: 8000,
        processed_at_timestamp: Date.now(),
        processed_at_mileage: 18500,
        predictive_downtime_date: "2024-02-18T14:00:00Z",
        severity_level: "high",
        vehicle: {
            id: 1002,
            coverImage: "/src/assets/car_models/car_model_1_big.png",
            make: "Chevrolet",
            model: "Express",
            year: 2021,
            color: "Blue",
            plateNumber: "XYZ-456",
            odometer: 18500,
            fuelType: "Gasoline",
            vin: "1GCWGAFG5N1123456",
            garage: {
                name: "Downtown Garage",
                address: "456 Downtown Ave, Toronto, ON"
            }
        }
    },
    {
        recommendation_id: 3,
        device_id: "DEV003",
        maintenance_type: "preventive",
        service_type: "tire-rotation",
        preventive_maintenance_date: "2024-02-12T10:30:00Z",
        expected_downtime: "1.5 hours",
        estimated_cost: 80,
        health_score: 78,
        severity_score: 4,
        last_maintenance_date: "2023-10-05T09:15:00Z",
        last_maintenance_type: "tire-rotation",
        mileage_at_last_maintenance: 10000,
        processed_at_timestamp: Date.now(),
        processed_at_mileage: 13200,
        predictive_downtime_date: null,
        severity_level: "low",
        vehicle: {
            id: 1003,
            coverImage: "/src/assets/car_models/car_model_1_big.png",
            make: "Mercedes",
            model: "Sprinter",
            year: 2023,
            color: "Silver",
            plateNumber: "DEF-789",
            odometer: 13200,
            fuelType: "Diesel",
            vin: "WD3PE8CD5NP123456",
            garage: {
                name: "East Garage",
                address: "789 East St, Toronto, ON"
            }
        }
    }
];

export const fetchAiMaintenanceFilters = async () => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get('/api/maintenance/options');
        // console.log("fetchAiMaintenanceFilters res = ",response);
        // return response.data;
        
        console.log('fetchAiMaintenanceFilters (demo mode)');
        return demoMaintenanceFilters;
    } catch (error) {
        console.error('Error fetching maintenance data:', error);
    }
};

export const fetchAiMaintenances = async (page: number = 1, size: number = 10, severityLevel: string = '', serviceType: string = '', maintenanceType: string = '')  => {
    try {
        // Comment out API call for demo mode
        // const params = {
        //     page: page,
        //     size: size,
        //     severityLevel: severityLevel,
        //     serviceType: serviceType,
        //     maintenanceType: maintenanceType,
        // };
        // const response = await axiosInstance.get('/api/maintenance/ai', { params });
        // return response.data;
        
        console.log('fetchAiMaintenances (demo mode)', { page, size, severityLevel, serviceType, maintenanceType });
        
        // Filter demo data based on parameters
        let filteredData = [...demoAiMaintenances];
        
        if (severityLevel) {
            const severityLevels = severityLevel.split(',');
            filteredData = filteredData.filter(item => severityLevels.includes(item.severity_level));
        }
        if (serviceType) {
            const serviceTypes = serviceType.split(',');
            filteredData = filteredData.filter(item => serviceTypes.includes(item.service_type));
        }
        if (maintenanceType) {
            const maintenanceTypes = maintenanceType.split(',');
            filteredData = filteredData.filter(item => maintenanceTypes.includes(item.maintenance_type));
        }
        
        // Simulate pagination
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        const totalPages = Math.ceil(filteredData.length / size);
        
        return {
            data: paginatedData,
            pagination: {
                current_page: page,
                items_per_page: size,
                total_items: filteredData.length,
                total_pages: totalPages,
                from: startIndex + 1,
                to: Math.min(endIndex, filteredData.length)
            }
        };
    } catch (error) {
        console.error('Error fetching maintenance data:', error);
    }
};

export const aiRecommendationAction = async (
    isAccept: boolean,
    AiMaintenance: IAiMaintenance,
    maintenanceId?: number // Make maintenanceId optional
  ) => {
    try {
      // Comment out API call for demo mode
      // const params: Record<string, any> = {
      //   recommendationId: AiMaintenance.recommendation_id,
      //   isAccept: isAccept,
      //   metadata: AiMaintenance,
      // };
      // if (maintenanceId !== undefined) {
      //   params.maintenanceId = maintenanceId;
      // }
      // const response = await axiosInstance.put('/api/maintenance/ai/', params);
      // return response.data;
      
      console.log('aiRecommendationAction (demo mode)', { 
        isAccept, 
        recommendationId: AiMaintenance.recommendation_id,
        maintenanceId 
      });
      
      // Mock successful action response
      const mockResponse = {
        success: true,
        message: isAccept ? 
          'AI recommendation accepted successfully (demo mode)' : 
          'AI recommendation rejected successfully (demo mode)',
        recommendationId: AiMaintenance.recommendation_id,
        maintenanceId: maintenanceId || Date.now(),
        action: isAccept ? 'accepted' : 'rejected',
        timestamp: new Date().toISOString()
      };
      
      return mockResponse;
    } catch (error) {
      console.error('Error processing AI recommendation action:', error);
      throw error;
    }
  };
  