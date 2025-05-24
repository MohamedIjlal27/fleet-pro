import axios from 'axios';
import {store} from '../redux/app/store';
import {clearUser, setUser} from '../redux/features/user';

const axiosInstance = axios.create({
  // Commented out baseURL to run without backend
  // baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
  baseURL: '', // Use empty string to prevent API calls
  withCredentials: true,
});

// Demo mode mock data
const mockVehicles = [
  {
    id: 1,
    plateNumber: 'ABC-123',
    make: 'Ford',
    model: 'Transit',
    vin: '1FTDS1EF5DDA12345',
    entityType: 'vehicle',
    status: 'Available',
    coverImage: null,
    currentAssignedDriver: {
      firstName: 'John',
      LastName: 'Doe',
      user: {
        firstName: 'John',
        lastName: 'Doe'
      }
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
      immobilizer: false,
      tirePressureFrontLeft: 32,
      tirePressureFrontRight: 33,
      tirePressureRearLeft: 31,
      tirePressureRearRight: 32
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
    coverImage: null,
    currentAssignedDriver: {
      firstName: 'Jane',
      LastName: 'Smith',
      user: {
        firstName: 'Jane',
        lastName: 'Smith'
      }
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
      immobilizer: false,
      tirePressureFrontLeft: 30,
      tirePressureFrontRight: 31,
      tirePressureRearLeft: 29,
      tirePressureRearRight: 30
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
    coverImage: null,
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
      immobilizer: true,
      tirePressureFrontLeft: 28,
      tirePressureFrontRight: 29,
      tirePressureRearLeft: 27,
      tirePressureRearRight: 28
    }
  }
];

const mockGarages = [
  { id: 1, name: 'Main Depot', latitude: 43.6532, longitude: -79.3832, address: '123 Main St', phoneNumber: '555-0123', city: 'Toronto', country: 'Canada' },
  { id: 2, name: 'North Branch', latitude: 43.7615, longitude: -79.4111, address: '456 North Ave', phoneNumber: '555-0456', city: 'Toronto', country: 'Canada' }
];

// Add request interceptor for demo mode mock responses
axiosInstance.interceptors.request.use((config) => {
  // Check if we're in demo mode (no backend URL)
  if (!config.baseURL || config.baseURL === '') {
    const url = config.url || '';
    
    // Mock vehicle list API
    if (url === '/api/vehicle/list') {
      return Promise.reject({
        config,
        response: {
          data: mockVehicles,
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      });
    }
    
    // Mock vehicle pagination API (Fleet page)
    if (url === '/api/vehicle') {
      return Promise.reject({
        config,
        response: {
          data: {
            data: mockVehicles,
            meta: {
              currentPage: 1,
              lastPage: 1,
              total: mockVehicles.length,
              perPage: 20
            }
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      });
    }
    
    // Mock garages API
    if (url === '/api/garages') {
      return Promise.reject({
        config,
        response: {
          data: mockGarages,
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      });
    }
    
    // Mock device API
    if (url === '/api/device') {
      return Promise.reject({
        config,
        response: {
          data: [],
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      });
    }
    
    // Mock customers API
    if (url === '/api/customers') {
      return Promise.reject({
        config,
        response: {
          data: [],
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      });
    }
    
    // Mock drivers API
    if (url === '/api/drivers') {
      return Promise.reject({
        config,
        response: {
          data: [],
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      });
    }
    
    // Mock vehicle filters API
    if (url === '/api/vehicle/filters') {
      return Promise.reject({
        config,
        response: {
          data: { 
            makes: ['Ford', 'Mercedes', 'Iveco'], 
            models: ['Transit', 'Sprinter', 'Daily'], 
            trims: ['Base', 'Premium', 'Deluxe']
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      });
    }
    
    // Mock vehicle options API
    if (url === '/api/vehicle/options') {
      return Promise.reject({
        config,
        response: {
          data: { 
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
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      });
    }
    
    // Mock vehicle analytics data API
    if (url === '/api/vehicle/analytics/data') {
      return Promise.reject({
        config,
        response: {
          data: [
            { vehicleId: 1, totalKmDriven: 1200 },
            { vehicleId: 2, totalKmDriven: 950 },
            { vehicleId: 3, totalKmDriven: 800 }
          ],
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      });
    }
    
    // Mock individual vehicle details API
    if (url.startsWith('/api/vehicle/') && url.match(/^\/api\/vehicle\/\d+$/)) {
      const vehicleId = parseInt(url.split('/')[3]);
      const vehicle = mockVehicles.find(v => v.id === vehicleId) || mockVehicles[0];
      
      return Promise.reject({
        config,
        response: {
          data: vehicle,
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      });
    }
    
    // Mock device by vehicle ID API
    if (url.startsWith('/api/device/byVehicleId/')) {
      const vehicleId = parseInt(url.split('/')[4]);
      const vehicle = mockVehicles.find(v => v.id === vehicleId) || mockVehicles[0];
      
      return Promise.reject({
        config,
        response: {
          data: vehicle.device || {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      });
    }
    
    // Mock maintenance options API
    if (url === '/api/maintenance/options') {
      return Promise.reject({
        config,
        response: {
          data: {
            status: {
              '1': 'Scheduled',
              '2': 'In Progress', 
              '3': 'Completed',
              '4': 'Cancelled'
            },
            serviceType: {
              '1': 'Oil Change',
              '2': 'Tire Rotation',
              '3': 'Brake Inspection',
              '4': 'Engine Service',
              '5': 'General Maintenance'
            }
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      });
    }
    
    // Mock maintenance list API
    if (url === '/api/maintenance/') {
      return Promise.reject({
        config,
        response: {
          data: {
            data: [
              {
                id: 1,
                carId: 1,
                userId: 1,
                startTime: '2024-01-15T10:00:00Z',
                statusName: 'Completed',
                serviceTypeName: 'Oil Change',
                work_shop: 'Main Service Center',
                status: 3,
                serviceType: 1,
                amount: 75.50,
                notes: 'Regular oil change completed',
                service_detail: 'Changed oil and filter',
                estimated_cost: 80.00,
                practical_cost: 75.50,
                paid_date: '2024-01-15',
                paid_resource: 'Cash',
                repairEta: '2024-01-15T12:00:00Z',
                endTime: '2024-01-15T11:30:00Z',
                maintenanceRecordFiles: [],
                vehicle: {
                  plateNumber: 'ABC-123',
                  coverImage: null,
                  make: 'Ford',
                  model: 'Transit',
                  year: 2020,
                  color: 'White'
                }
              },
              {
                id: 2,
                carId: 2,
                userId: 1,
                startTime: '2024-01-20T09:00:00Z',
                statusName: 'In Progress',
                serviceTypeName: 'Brake Inspection',
                work_shop: 'North Branch Service',
                status: 2,
                serviceType: 3,
                amount: 150.00,
                notes: 'Brake pads need replacement',
                service_detail: 'Inspecting brake system',
                estimated_cost: 200.00,
                practical_cost: 0,
                paid_date: null,
                paid_resource: null,
                repairEta: '2024-01-22T17:00:00Z',
                endTime: null,
                maintenanceRecordFiles: [],
                vehicle: {
                  plateNumber: 'DEF-456',
                  coverImage: null,
                  make: 'Mercedes',
                  model: 'Sprinter',
                  year: 2019,
                  color: 'Blue'
                }
              }
            ],
            meta: {
              currentPage: 1,
              lastPage: 1,
              total: 2,
              perPage: 10
            }
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      });
    }
    
    // Mock individual maintenance detail API
    if (url.startsWith('/api/maintenance/') && url.match(/^\/api\/maintenance\/\d+$/)) {
      const maintenanceId = parseInt(url.split('/')[3]);
      
      return Promise.reject({
        config,
        response: {
          data: {
            id: maintenanceId,
            carId: 1,
            userId: 1,
            startTime: '2024-01-15T10:00:00Z',
            statusName: 'Completed',
            serviceTypeName: 'Oil Change',
            work_shop: 'Main Service Center',
            status: 3,
            serviceType: 1,
            amount: 75.50,
            notes: 'Regular oil change completed',
            service_detail: 'Changed oil and filter',
            estimated_cost: 80.00,
            practical_cost: 75.50,
            paid_date: '2024-01-15',
            paid_resource: 'Cash',
            repairEta: '2024-01-15T12:00:00Z',
            endTime: '2024-01-15T11:30:00Z',
            maintenanceRecordFiles: [],
            vehicle: {
              plateNumber: 'ABC-123',
              coverImage: null,
              make: 'Ford',
              model: 'Transit',
              year: 2020,
              color: 'White'
            }
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      });
    }
    
    // Mock all users API
    if (url === '/api/user/all') {
      return Promise.reject({
        config,
        response: {
          data: {
            data: [
              {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@demo.com',
                username: 'john_doe'
              },
              {
                id: 2,
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@demo.com', 
                username: 'jane_smith'
              },
              {
                id: 3,
                firstName: 'Mike',
                lastName: 'Johnson',
                email: 'mike.johnson@demo.com',
                username: 'mike_johnson'
              }
            ]
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      });
    }
    
    // Mock orders API endpoints
    if (url === '/api/orders/filters') {
      return Promise.reject({
        config,
        response: {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      });
    }
    
    if (url === '/api/orders') {
      return Promise.reject({
        config,
        response: {
          data: { data: [], meta: { currentPage: 1, lastPage: 1, total: 0, perPage: 10 } },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      });
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle mock responses
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If this is a mock response, return it as a successful response
    if (error.response && error.config.baseURL === '') {
      return Promise.resolve(error.response);
    }
    
    // Original error handling for real API calls would go here
    return Promise.reject(error);
  }
);

// Commented out interceptors for demo mode - they depend on API calls
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     const status = error.response ? error.response.status : null;

//     if (status === 406 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshResponse = await axiosInstance.get('/api/auth/refresh');

//         if (refreshResponse.data === true) {
//           const res = await axiosInstance.get('/api/auth/user');
//           const user = res.data;
//           const resSystemPlans = await axiosInstance.get('/api/system-plans');
//           const systemPlans = resSystemPlans.data;

//           store.dispatch(
//             setUser({
//               id: user.id,
//               email: user.email,
//               username: user.username,
//               picture: user.picture,
//               organizationId: user.organizationId,
//               firstName: user.firstName,
//               lastName: user.lastName,
//               roles: user.roleList,
//               permissions: user.permissionList,
//               subscribedPlans: systemPlans.subscribedPlans,
//               modules: systemPlans.modules,
//             })
//           );

//           return axiosInstance(originalRequest);
//         }
//       } catch (refreshError: any) {
//         store.dispatch(clearUser());
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       }
//     } else if (status === 401) {
//       store.dispatch(clearUser());
//     }

//     return Promise.reject(error);
//   }
// );

// Add a request interceptor (commented out for demo mode)
// axiosInstance.interceptors.request.use((config) => {
//   config.headers['X-Client-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
//   return config;
// }, (error) => {
//   // Handle the error
//   return Promise.reject(error);
// });
export default axiosInstance;
