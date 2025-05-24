import axiosInstance from '../../../utils/axiosConfig';

/**
 * Dashboard filter parameters interface.
 * Matches backend structure from src/modules/dashboard/controllers/dashboard.controller.ts
 */
export interface DashboardFilterParams {
  // Main filter parameters (directly from backend controller)
  garageGroup?: string;
  garageId?: number;
  frequency?: string;

  // Widget parameters 
  wg1?: boolean;  // Available Vehicles
  wg2?: boolean;  // New Reservations
  wg3?: boolean;  // New Screening
  wg4?: boolean;  // Top Vehicle Stats
  wg4a?: string;  // Top Vehicle Stats Metrics (distance/fuelConsumption/idling)
  wg4b?: string;  // Top Vehicle Stats Date Range (24hrs/3days/weekly/monthly/yearly)
  wg5?: boolean;  // Fleet Status Chart
  wg6?: boolean;  // Garages Chart
  wg7?: boolean;  // Bad Drivers Chart
  wg7a?: number;  // Bad Drivers Chart N (number of drivers)
  wg8?: boolean;  // Reminders
  wg9?: boolean;  // Map with Garages
  wg9a?: string;  // Map with Garages Status (All/Active/Inactive)
  wg10?: boolean; // Maintenance Status Chart
  wg10a?: string; // Maintenance Status Chart Vehicle IDs (comma-separated)
  wg11?: boolean; // Bill Status Chart
  wg12?: boolean; // Task Status Chart
  wg13?: boolean; // Available Assets
  wg14?: boolean; // Asset Status Chart
  wg15?: boolean; // Asset Availability Chart
  wg16?: boolean; // Asset Utilization Chart
  wg17?: boolean; // Preventive & Predictive Chart
  wg18?: boolean; // Average Idle Rate Chart
  wg19?: boolean; // Cost of Ownership Chart
  wg20?: boolean; // Good Drivers Chart
  wg20a?: number; // Good Drivers Chart N (number of drivers)
  wg21?: boolean; // Average Downtime Chart (maintenance hours)
  wg22?: boolean; // Average Maintenance Cost Chart
  wg23?: boolean; // In Use Vehicles
  wg24?: boolean; // In Progress Maintenance Vehicles
  wg25?: boolean; // Number Of Incidents Chart
  wg25a?: string; // Number Of Incidents Chart -> Filter by type
}

export const fetchWidgetData = async (params: DashboardFilterParams = {}) => {
  try {
    // Return demo dashboard data for local development
    console.log("fetchDashboardData with filters:", params);
    
    // Generate demo data based on the requested widgets
    const demoData = [];

    if (params.wg1) {
      demoData.push({ wgAvailableVehicles: 25 });
    }
    
    if (params.wg2) {
      demoData.push({ wgNewReservations: 8 });
    }
    
    if (params.wg3) {
      demoData.push({ wgNewScreening: 3 });
    }
    
    if (params.wg4) {
      demoData.push({ 
        wgTopVehicleStats: [
          { vehicleId: 'V001', totalKmDriven: 1200, totalFuelUsed: 80, totalIdleTime: 2.5 },
          { vehicleId: 'V002', totalKmDriven: 950, totalFuelUsed: 65, totalIdleTime: 1.8 },
          { vehicleId: 'V003', totalKmDriven: 800, totalFuelUsed: 55, totalIdleTime: 3.2 }
        ]
      });
    }
    
    if (params.wg5) {
      demoData.push({ 
        wgFleetStatusChart: [
          { status: 'Available', count: 15 },
          { status: 'Unavailable', count: 3 },
          { status: 'InUse', count: 5 },
          { status: 'Reserved', count: 2 }
        ]
      });
    }
    
    if (params.wg6) {
      demoData.push({ 
        wgGaragesChart: [
          { name: 'Main Depot', vehicleCount: 12, location: { lat: 43.6532, lng: -79.3832 } },
          { name: 'North Branch', vehicleCount: 8, location: { lat: 43.7615, lng: -79.4111 } },
          { name: 'East Service', vehicleCount: 5, location: { lat: 43.6426, lng: -79.3799 } }
        ]
      });
    }
    
    if (params.wg7) {
      demoData.push({ 
        wgBadDriversChart: [
          { driverId: 'D001', name: 'John Doe', violations: 3, score: 72 },
          { driverId: 'D002', name: 'Jane Smith', violations: 2, score: 78 }
        ]
      });
    }
    
    if (params.wg8) {
      demoData.push({ 
        wgReminders: {
          insuranceUpload: 2,
          newMaintenance: 5,
          newLeads: 3,
          billRequestToPay: 1,
          invoiceUpdate: 4,
          requestFromCustomer: 2
        }
      });
    }
    
    if (params.wg9) {
      demoData.push({ 
        wgMapWithGarages: {
          garages: [
            { id: 1, name: 'Main Depot', latitude: 43.6532, longitude: -79.3832, address: '123 Main St', phoneNumber: '555-0123', city: 'Toronto', country: 'Canada' },
            { id: 2, name: 'North Branch', latitude: 43.7615, longitude: -79.4111, address: '456 North Ave', phoneNumber: '555-0456', city: 'Toronto', country: 'Canada' }
          ],
          vehicles: [],
          assets: []
        }
      });
    }
    
    if (params.wg10) {
      demoData.push({ 
        wgMaintenanceStatusChart: [
          { status: 'Scheduled', count: 5 },
          { status: 'InProgress', count: 3 },
          { status: 'Completed', count: 12 }
        ]
      });
    }
    
    if (params.wg11) {
      demoData.push({ 
        wgBillStatusChart: [
          { status: 'Pending', count: 8 },
          { status: 'Paid', count: 15 },
          { status: 'Overdue', count: 2 }
        ]
      });
    }
    
    if (params.wg12) {
      demoData.push({ 
        wgTaskStatusChart: [
          { status: 'Open', count: 6 },
          { status: 'InProgress', count: 4 },
          { status: 'Completed', count: 18 }
        ]
      });
    }
    
    if (params.wg13) {
      demoData.push({ wgAvailableAssets: 18 });
    }
    
    if (params.wg14) {
      demoData.push({ 
        wgAssetStatusChart: [
          { status: 'Active', count: 15 },
          { status: 'Inactive', count: 3 },
          { status: 'Maintenance', count: 2 }
        ]
      });
    }
    
    if (params.wg15) {
      demoData.push({ 
        wgAssetAvailabilityChart: [
          ['2025-W01', { asset_availability: 85 }],
          ['2025-W02', { asset_availability: 92 }],
          ['2025-W03', { asset_availability: 88 }],
          ['2025-W04', { asset_availability: 95 }]
        ]
      });
    }
    
    if (params.wg16) {
      demoData.push({ 
        wgAssetUtilizationChart: [
          ['2025-W01', { utilization: 75 }],
          ['2025-W02', { utilization: 82 }],
          ['2025-W03', { utilization: 78 }],
          ['2025-W04', { utilization: 85 }]
        ]
      });
    }
    
    if (params.wg18) {
      demoData.push({ 
        wgAssetIdleRateChart: [
          ['2025-W01', { idle_rate: 15 }],
          ['2025-W02', { idle_rate: 12 }],
          ['2025-W03', { idle_rate: 18 }],
          ['2025-W04', { idle_rate: 10 }]
        ]
      });
    }
    
    if (params.wg20) {
      demoData.push({ 
        wgGoodDriversChart: [
          { driverId: 'D101', name: 'Alice Johnson', score: 96, safetyRating: 9.5 },
          { driverId: 'D102', name: 'Bob Wilson', score: 94, safetyRating: 9.2 },
          { driverId: 'D103', name: 'Carol Brown', score: 92, safetyRating: 9.0 }
        ]
      });
    }
    
    if (params.wg21) {
      demoData.push({ 
        wgMaintenanceDowntimeChart: [
          ['January', { downtime_hours: 24 }],
          ['February', { downtime_hours: 18 }],
          ['March', { downtime_hours: 32 }]
        ]
      });
    }
    
    if (params.wg22) {
      demoData.push({ 
        wgMaintenanceCostChart: [
          ['January', { cost: 5200 }],
          ['February', { cost: 4800 }],
          ['March', { cost: 6100 }]
        ]
      });
    }
    
    if (params.wg23) {
      demoData.push({ wgInUseVehicles: 7 });
    }
    
    if (params.wg24) {
      demoData.push({ wgInProgressMaintenanceVehicles: 3 });
    }
    
    if (params.wg25) {
      demoData.push({ 
        wgNumberOfIncidentsChart: [
          { period: 'Week 1', count: 2 },
          { period: 'Week 2', count: 1 },
          { period: 'Week 3', count: 4 },
          { period: 'Week 4', count: 0 }
        ]
      });
    }

    return demoData;
  } catch (error) {
    console.error('Error fetching widget data:', error);
    throw error;
  }
};

// Note: We don't need a separate fetchAssetUtilizationData function
// We can use the fetchWidgetData function with wg16: true
// This keeps our approach consistent with how AssetAvailabilityChart works

export const fetchVehicles = async () => {
  try {
    // Return demo vehicle data for local development
    return [
      { id: 'V001', status: 'Available', model: 'Ford Transit', license: 'ABC-123' },
      { id: 'V002', status: 'InUse', model: 'Mercedes Sprinter', license: 'DEF-456' },
      { id: 'V003', status: 'Maintenance', model: 'Iveco Daily', license: 'GHI-789' }
    ];
  } catch (error) {
    console.error('Error fetching vehicle data:', error);
  }
};

export const fetchLayout = async () => {
  try {
    // Return demo layout data for local development
    return {
      settings: { 
        mode: 'demo',
        lastUpdated: new Date().toISOString()
      },
      matrix: [
        { w: 6, h: 4, x: 0, y: 0, i: 'wg1' },
        { w: 6, h: 4, x: 6, y: 0, i: 'wg2' },
        { w: 12, h: 6, x: 0, y: 4, i: 'wg5' }
      ]
    };
  } catch (error) {
    console.error('Error fetching layout data:', error);
  }
};

interface Matrix {
  w: number;
  h: number;
  x: number;
  y: number;
  i: string;
}

export const updateLayout = async (matrix: Matrix[] = []) => {
  try {
    const payload = { matrix };
    const response = await axiosInstance.put('/api/settings/dashboard-layout', payload);
    //console.log('Layout updated successfully:', response.data);
    return response.data; // Return the data from the response
  } catch (error: any) {
    console.error('Error update Layout:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to update Layout. Please try again.'
    );
  }
};
