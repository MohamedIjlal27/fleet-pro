import axios, { AxiosError } from 'axios';
// import axiosInstance from "@/utils/axiosConfig"; // Commented out for demo mode
import { IVehicleData } from '../interfaces/interfaces';

// Demo data for vehicles
const demoVehicles = [
  {
    id: 1,
    plateNumber: 'ABC-123',
    make: 'Ford',
    model: 'Transit',
    vin: '1FTDS1EF5DDA12345',
    entityType: 'vehicle',
    status: 'Available',
    year: 2020,
    color: 'White',
    trim: 'Base',
    fuelType: 'Gasoline',
    coverImage: null,
    garage: { id: 1, name: 'Main Depot', address: '123 Main St', organizationId: 1 },
    odometer: 45000,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    organizationId: 1,
    currentAssignedDriver: {
      firstName: 'John',
      LastName: 'Doe',
      user: { firstName: 'John', lastName: 'Doe' }
    },
    device: {
      deviceId: 'DEV001',
      longitude: -79.3832,
      latitude: 43.6532,
      ignition: false,
      movement: false,
      direction: 0,
      speed: 0,
      deviceName: 'Vehicle Tracker 1',
      maxSpeed: 120,
      immobilizer: false
    }
  },
  {
    id: 2,
    plateNumber: 'DEF-456',
    make: 'Mercedes',
    model: 'Sprinter',
    vin: '1FTDS1EF5DDA67890',
    entityType: 'vehicle',
    status: 'InUse',
    year: 2019,
    color: 'Blue',
    trim: 'Premium',
    fuelType: 'Diesel',
    coverImage: null,
    garage: { id: 2, name: 'North Branch', address: '456 North Ave', organizationId: 1 },
    odometer: 62000,
    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2024-01-14T15:30:00Z',
    organizationId: 1,
    currentAssignedDriver: {
      firstName: 'Jane',
      LastName: 'Smith',
      user: { firstName: 'Jane', lastName: 'Smith' }
    },
    device: {
      deviceId: 'DEV002',
      longitude: -79.4111,
      latitude: 43.7615,
      ignition: true,
      movement: true,
      direction: 45,
      speed: 65,
      deviceName: 'Vehicle Tracker 2',
      maxSpeed: 90,
      immobilizer: false
    }
  },
  {
    id: 3,
    plateNumber: 'GHI-789',
    make: 'Iveco',
    model: 'Daily',
    vin: '1FTDS1EF5DDA11111',
    entityType: 'asset',
    status: 'Maintenance',
    year: 2021,
    color: 'Yellow',
    trim: 'Deluxe',
    fuelType: 'Electric',
    coverImage: null,
    garage: { id: 1, name: 'Main Depot', address: '123 Main St', organizationId: 1 },
    odometer: 28000,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z',
    organizationId: 1,
    currentAssignedDriver: null,
    device: {
      deviceId: 'DEV003',
      longitude: -79.3799,
      latitude: 43.6426,
      ignition: false,
      movement: false,
      direction: 0,
      speed: 0,
      deviceName: 'Asset Tracker 1',
      maxSpeed: 80,
      immobilizer: true
    }
  }
];

// Demo data for vehicle notes
const demoVehicleNotes = [
  {
    id: 1,
    vehicleId: 1,
    content: 'Regular maintenance completed',
    createdAt: '2024-01-15T10:30:00Z',
    createdBy: { firstName: 'John', lastName: 'Doe' }
  },
  {
    id: 2,
    vehicleId: 1,
    content: 'Oil change due next month',
    createdAt: '2024-01-10T14:20:00Z',
    createdBy: { firstName: 'Jane', lastName: 'Smith' }
  }
];

// Demo data for vehicle logs
const demoVehicleLogs = [
  {
    id: 1,
    vehicleId: 1,
    action: 'Status Updated',
    description: 'Vehicle status changed to Available',
    timestamp: '2024-01-15T10:30:00Z',
    user: { firstName: 'John', lastName: 'Doe' }
  },
  {
    id: 2,
    vehicleId: 1,
    action: 'Assignment',
    description: 'Vehicle assigned to driver John Doe',
    timestamp: '2024-01-14T09:15:00Z',
    user: { firstName: 'Admin', lastName: 'User' }
  }
];

// Demo data for vehicle reports
const demoVehicleReports = [
  {
    id: 1,
    vehicleId: 1,
    reportType: 'Inspection',
    status: 'Passed',
    createdAt: '2024-01-10T10:00:00Z',
    details: 'All systems functioning normally'
  }
];

export const fetchVehicles = async () => {
  try {
    console.log("[DEMO MODE] fetchVehicles - returning demo data");
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return demoVehicles;
  } catch (error) {
    console.error("Error fetching vehicle data:", error);
  }
};

export const fetchVehiclesWithPaging = async ({
  page = 1,
  size = 10,
  search,
  make,
  model,
  trim,
  status,
  entityType,
  garage,
  yearMin,
  yearMax,
}: {
  page?: number;
  size?: number;
  search?: string;
  make?: string;
  model?: string;
  trim?: string;
  status?: string;
  entityType?: string;
  garage?: string;
  yearMin?: number;
  yearMax?: number;
}) => {
  try {
    console.log(`[DEMO MODE] fetchVehiclesWithPaging params = `, { page, size, search, make, model, trim, status, entityType, garage, yearMin, yearMax });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter demo data based on parameters
    let filteredVehicles = [...demoVehicles];
    
    if (search) {
      filteredVehicles = filteredVehicles.filter(v => 
        v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
        v.vin.toLowerCase().includes(search.toLowerCase()) ||
        v.make.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (make) {
      filteredVehicles = filteredVehicles.filter(v => 
        make.split(',').includes(v.make)
      );
    }
    
    if (model) {
      filteredVehicles = filteredVehicles.filter(v => 
        model.split(',').includes(v.model)
      );
    }
    
    if (status) {
      filteredVehicles = filteredVehicles.filter(v => 
        status.split(',').includes(v.status)
      );
    }
    
    if (entityType) {
      filteredVehicles = filteredVehicles.filter(v => 
        entityType.split(',').includes(v.entityType)
      );
    }
    
    if (yearMin) {
      filteredVehicles = filteredVehicles.filter(v => v.year >= yearMin);
    }
    
    if (yearMax) {
      filteredVehicles = filteredVehicles.filter(v => v.year <= yearMax);
    }

    const total = filteredVehicles.length;
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);

    const response = {
      data: paginatedVehicles,
      meta: {
        currentPage: page,
        lastPage: Math.ceil(total / size),
        total: total,
        perPage: size
      }
    };

    console.log(`[DEMO MODE] fetchVehiclesWithPaging response = `, response);
    return response;
  } catch (error) {
    console.error("Error fetching vehicle data:", error);
    throw error;
  }
};

export const fetchVehicleFilters = async () => {
  try {
    console.log("[DEMO MODE] fetchVehicleFilters - returning demo data");
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      status: {
        'Available': 'Available',
        'InUse': 'In Use',
        'Maintenance': 'Maintenance',
        'Offline': 'Offline'
      },
      entityType: {
        'vehicle': 'Vehicle',
        'asset': 'Asset'
      },
      vehicleTypes: ['Car', 'Truck', 'Van'],
      fuelTypes: ['Gasoline', 'Diesel', 'Electric', 'Hybrid']
    };
  } catch (error) {
    console.error("Error fetching vehicle data:", error);
  }
};

export const fetchVehicleAssignments = async (vehicleId: number) => {
  try {
    console.log(`[DEMO MODE] fetchVehicleAssignments for vehicle ${vehicleId} - returning demo data`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      {
        id: 1,
        vehicleId: vehicleId,
        driverId: 1,
        driver: { firstName: 'John', lastName: 'Doe' },
        assignedAt: '2024-01-15T09:00:00Z',
        status: 'Active'
      }
    ];
  } catch (error) {
    console.error("Error fetching vehicle assignments data:", error);
  }
};

export const uploadVehicleCoverImage = async (
  vehicleId: number,
  image: string
) => {
  try {
    console.log(`[DEMO MODE] uploadVehicleCoverImage for vehicle ${vehicleId} - simulating upload`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful upload
    return {
      data: {
        coverImageUrl: `https://demo-images.example.com/vehicle-${vehicleId}-${Date.now()}.jpg`
      }
    };
  } catch (error) {
    console.error("Failed to uploadVehicleCoverImage:", error);
    throw error;
  }
};

export const createVehicle = async (data: any): Promise<any> => {
  try {
    console.log("[DEMO MODE] createVehicle - simulating vehicle creation", data);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate creating a new vehicle
    const newVehicle = {
      id: Date.now(), // Use timestamp as ID
      ...data,
      createdAt: new Date().toISOString()
    };
    
    console.log("[DEMO MODE] Vehicle created successfully:", newVehicle);
    return newVehicle;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw new Error('Failed to create vehicle in demo mode');
  }
};

export const fetchReports = async (vehicleId: number) => {
  try {
    console.log(`[DEMO MODE] fetchReports for vehicle ${vehicleId} - returning demo data`);
    await new Promise(resolve => setTimeout(resolve, 400));
    return demoVehicleReports.filter(report => report.vehicleId === vehicleId);
  } catch (error) {
    console.error("Error fetching vehicle inspection report data:", error);
  }
};

export const fetchLogs = async (vehicleId: number) => {
  try {
    console.log(`[DEMO MODE] fetchLogs for vehicle ${vehicleId} - returning demo data`);
    await new Promise(resolve => setTimeout(resolve, 400));
    return demoVehicleLogs.filter(log => log.vehicleId === vehicleId);
  } catch (error) {
    console.error("Error fetching vehicle logs data:", error);
  }
};

export const fetchVehicleNotes = async (vehicleId: number) => {
  try {
    console.log(`[DEMO MODE] fetchVehicleNotes for vehicle ${vehicleId} - returning demo data`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return demoVehicleNotes.filter(note => note.vehicleId === vehicleId);
  } catch (error) {
    console.error("Error fetching vehicle notes data:", error);
  }
};

export const createVehicleNote = async (
  vehicleId: number,
  content: string,
): Promise<any> => {
  try {
    console.log(`[DEMO MODE] createVehicleNote for vehicle ${vehicleId}:`, content);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newNote = {
      id: Date.now(),
      vehicleId: vehicleId,
      content: content,
      createdAt: new Date().toISOString(),
      createdBy: { firstName: 'Demo', lastName: 'User' }
    };
    
    // Add to demo data
    demoVehicleNotes.push(newNote);
    
    console.log("[DEMO MODE] Vehicle note created successfully:", newNote);
    return newNote;
  } catch (error) {
    console.error('Error creating vehicle note:', error);
    throw new Error('Failed to create vehicle note in demo mode');
  }
};

export const deleteVehicleNote = async (
  vehicleId: number,
  noteId: number,
) => {
  try {
    console.log(`[DEMO MODE] deleteVehicleNote ${noteId} for vehicle ${vehicleId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Remove from demo data
    const index = demoVehicleNotes.findIndex(note => note.id === noteId && note.vehicleId === vehicleId);
    if (index > -1) {
      demoVehicleNotes.splice(index, 1);
    }
    
    console.log("[DEMO MODE] Vehicle note deleted successfully");
    return { success: true };
  } catch (error) {
    console.error('Error deleting vehicle note:', error);
    throw error;
  }
}

export const requestImmobilizer = async (vehicleId: number, active: boolean): Promise<any> => {
  try {
    console.log(`[DEMO MODE] requestImmobilizer for vehicle ${vehicleId}:`, { active });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update demo vehicle data
    const vehicle = demoVehicles.find(v => v.id === vehicleId);
    if (vehicle && vehicle.device) {
      vehicle.device.immobilizer = active;
    }
    
    console.log("[DEMO MODE] Immobilizer request completed successfully");
    return { success: true, active: active };
  } catch (error) {
    console.error('Error requesting Immobilizer:', error);
    throw new Error('Failed to request Immobilizer in demo mode');
  }
};

export const requestSpeedControl = async (vehicleId: number, maxSpeed: number): Promise<any> => {
  try {
    console.log(`[DEMO MODE] requestSpeedControl for vehicle ${vehicleId}:`, { maxSpeed });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update demo vehicle data
    const vehicle = demoVehicles.find(v => v.id === vehicleId);
    if (vehicle && vehicle.device) {
      vehicle.device.maxSpeed = maxSpeed;
    }
    
    console.log("[DEMO MODE] Speed control request completed successfully");
    return { success: true, maxSpeed: maxSpeed };
  } catch (error) {
    console.error('Error requesting Speed Control:', error);
    throw new Error('Failed to request Speed Control in demo mode');
  }
};
