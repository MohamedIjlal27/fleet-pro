export interface IAiMaintenance {
    recommendation_id: number;
    device_id: string; // Updated to string as per API response
    maintenance_type: string;
    service_type: string;
    preventive_maintenance_date: string; // Added
    expected_downtime: string;
    estimated_cost: number;
    health_score: number; // Updated to match API response type
    severity_score: number; // Updated to match API response type
    last_maintenance_date: string | null; // Added
    last_maintenance_type: string | null; // Added
    mileage_at_last_maintenance: number | null; // Added
    processed_at_timestamp: number; // Added
    processed_at_mileage: number; // Added
    predictive_downtime_date: string | null; // Added
    severity_level: string; // Added
    vehicle: {
      id: number;
      coverImage: string | null; // Updated to match API response type
      make: string;
      model: string;
      year: number;
      color: string;
      plateNumber: string;
      odometer: number; // Added
      fuelType: string; // Added
      vin: string | null; // Added
      garage: {
        name: string; // Added as part of garage object
        address: string; // Added as part of garage object
      };
    }
  }