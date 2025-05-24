// Comment out unused import for demo mode
// import axiosInstance from '../../../utils/axiosConfig';

// Demo data for task filters
const demoTaskFilters = {
    type: {
        "delivery": "Delivery",
        "pickup": "Pickup",
        "maintenance": "Maintenance",
        "inspection": "Inspection",
        "return": "Return"
    },
    status: {
        "pending": "Pending",
        "assigned": "Assigned",
        "in_progress": "In Progress",
        "completed": "Completed",
        "cancelled": "Cancelled"
    },
    initiatorType: {
        "customer": "Customer",
        "admin": "Admin",
        "system": "System",
        "driver": "Driver"
    }
};

// Demo data for tasks/requests
const demoTasks = [
    {
        id: 1,
        customerId: 1,
        organizationId: 1,
        orderId: 1,
        adminId: 101,
        relatedId: 1001,
        assigneeId: 201,
        initiatorType: 1,
        initiatorTypeName: "Customer",
        deliveryCarId: 1001,
        returnCarId: null,
        type: 1,
        typeName: "Delivery",
        status: 3,
        statusName: "Completed",
        scheduleDate: "2024-01-15",
        scheduleTime: "09:00:00",
        scheduleLocation: "123 Main St, Toronto, ON",
        actuallyTime: "2024-01-15T09:30:00Z",
        createdAt: "2024-01-15T08:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
        requestBy: "John Smith",
        metadata: {
            priority: "high",
            specialInstructions: "Handle with care"
        },
        customer: {
            id: 1,
            organizationId: 1,
            phone: "+1-555-0101",
            email: "john.smith@example.com",
            firstName: "John",
            lastName: "Smith",
            stripeId: "cus_demo123",
            metadata: {},
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-15T08:00:00Z"
        },
        vehicle: {
            id: 1001,
            make: "Ford",
            model: "Transit",
            plateNumber: "ABC-123",
            coverImage: "/src/assets/car_models/car_model_1_big.png"
        },
        underGoingDelivery: {
            id: 1001,
            make: "Ford",
            model: "Transit",
            plateNumber: "ABC-123",
            coverImage: "/src/assets/car_models/car_model_1_big.png"
        },
        user: {
            id: 201,
            firstName: "Alex",
            lastName: "Wilson",
            email: "alex.wilson@company.com"
        },
        order: {
            id: 1,
            orderNumber: "ORD-2024-001",
            amount: 299.99
        }
    },
    {
        id: 2,
        customerId: 2,
        organizationId: 1,
        orderId: 2,
        adminId: 101,
        relatedId: 1002,
        assigneeId: 202,
        initiatorType: 2,
        initiatorTypeName: "Admin",
        deliveryCarId: 1002,
        returnCarId: null,
        type: 2,
        typeName: "Pickup",
        status: 2,
        statusName: "In Progress",
        scheduleDate: "2024-01-20",
        scheduleTime: "14:00:00",
        scheduleLocation: "456 Downtown Ave, Toronto, ON",
        actuallyTime: null,
        createdAt: "2024-01-20T13:00:00Z",
        updatedAt: "2024-01-20T14:30:00Z",
        requestBy: "Admin User",
        metadata: {
            priority: "medium",
            specialInstructions: "Customer will be waiting"
        },
        customer: {
            id: 2,
            organizationId: 1,
            phone: "+1-555-0102",
            email: "sarah.johnson@example.com",
            firstName: "Sarah",
            lastName: "Johnson",
            stripeId: "cus_demo456",
            metadata: {},
            createdAt: "2024-01-02T00:00:00Z",
            updatedAt: "2024-01-20T13:00:00Z"
        },
        vehicle: {
            id: 1002,
            make: "Chevrolet",
            model: "Express",
            plateNumber: "XYZ-456",
            coverImage: "/src/assets/car_models/car_model_1_big.png"
        },
        underGoingDelivery: {
            id: 1002,
            make: "Chevrolet",
            model: "Express",
            plateNumber: "XYZ-456",
            coverImage: "/src/assets/car_models/car_model_1_big.png"
        },
        user: {
            id: 202,
            firstName: "Maria",
            lastName: "Garcia",
            email: "maria.garcia@company.com"
        },
        order: {
            id: 2,
            orderNumber: "ORD-2024-002",
            amount: 499.99
        }
    },
    {
        id: 3,
        customerId: 3,
        organizationId: 1,
        orderId: null,
        adminId: 101,
        relatedId: 1003,
        assigneeId: null,
        initiatorType: 3,
        initiatorTypeName: "System",
        deliveryCarId: 1003,
        returnCarId: null,
        type: 3,
        typeName: "Maintenance",
        status: 1,
        statusName: "Pending",
        scheduleDate: "2024-01-25",
        scheduleTime: "10:30:00",
        scheduleLocation: "789 East St, Toronto, ON",
        actuallyTime: null,
        createdAt: "2024-01-25T09:00:00Z",
        updatedAt: "2024-01-25T09:00:00Z",
        requestBy: "System Auto-Generated",
        metadata: {
            priority: "low",
            specialInstructions: "Routine maintenance check"
        },
        customer: {
            id: 3,
            organizationId: 1,
            phone: "+1-555-0103",
            email: "mike.davis@example.com",
            firstName: "Mike",
            lastName: "Davis",
            stripeId: "cus_demo789",
            metadata: {},
            createdAt: "2024-01-03T00:00:00Z",
            updatedAt: "2024-01-25T09:00:00Z"
        },
        vehicle: {
            id: 1003,
            make: "Mercedes",
            model: "Sprinter",
            plateNumber: "DEF-789",
            coverImage: "/src/assets/car_models/car_model_1_big.png"
        },
        underGoingDelivery: {
            id: 1003,
            make: "Mercedes",
            model: "Sprinter",
            plateNumber: "DEF-789",
            coverImage: "/src/assets/car_models/car_model_1_big.png"
        },
        user: null,
        order: null,
        maintenance: {
            id: 1,
            serviceType: "Oil Change",
            estimatedCost: 150
        }
    }
];

export const fetchTaskFilters = async () => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get('/api/tasks/options');
        // return response.data;
        
        console.log('fetchTaskFilters (demo mode)');
        return demoTaskFilters;
    } catch (error) {
        console.error('Error fetching task filters:', error);
    }
};

export const fetchTasks = async (
  page: number = 1,
  size: number = 10,
  type: string = '',
  status: string = '',
  initiatorType: string = '',
  customerId: number | null = null,
) => {
    try {
        // Comment out API call for demo mode
        // const params = {
        //     page: page,
        //     size: size,
        //     type: type,
        //     status: status,
        //     initiatorType: initiatorType,
        //     customerId: customerId,
        // };
        // const response = await axiosInstance.get('/api/tasks',{params});
        // return response.data;
        
        console.log('fetchTasks (demo mode)', { page, size, type, status, initiatorType, customerId });
        
        // Filter demo data based on parameters
        let filteredData = [...demoTasks];
        
        if (type) {
            const typeFilters = type.split(',');
            filteredData = filteredData.filter(item => typeFilters.includes(item.typeName.toLowerCase()));
        }
        if (status) {
            const statusFilters = status.split(',');
            filteredData = filteredData.filter(item => statusFilters.includes(item.statusName.toLowerCase()));
        }
        if (initiatorType) {
            const initiatorFilters = initiatorType.split(',');
            filteredData = filteredData.filter(item => initiatorFilters.includes(item.initiatorTypeName.toLowerCase()));
        }
        if (customerId) {
            filteredData = filteredData.filter(item => item.customerId === customerId);
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
        console.error('Error fetchTasks data:', error);
    }
};

export const fetchTaskDetails = async  (requestId: number) => {
  try {
      // Comment out API call for demo mode
      // const response = await axiosInstance.get(`/api/tasks/${requestId}`);
      // return response.data;
      
      console.log('fetchTaskDetails (demo mode)', { requestId });
      
      // Find task by id
      const taskDetail = demoTasks.find(task => task.id === requestId);
      
      if (taskDetail) {
          // Return enhanced task detail with additional fields
          return {
              ...taskDetail,
              timeline: [
                  {
                      id: 1,
                      status: "Task Created",
                      timestamp: taskDetail.createdAt,
                      description: "Task has been created successfully"
                  },
                  {
                      id: 2,
                      status: taskDetail.assigneeId ? "Task Assigned" : "Awaiting Assignment",
                      timestamp: taskDetail.updatedAt,
                      description: taskDetail.assigneeId ? `Task assigned to ${taskDetail.user?.firstName} ${taskDetail.user?.lastName}` : "Task is awaiting assignment"
                  },
                  {
                      id: 3,
                      status: taskDetail.statusName,
                      timestamp: taskDetail.actuallyTime || taskDetail.updatedAt,
                      description: `Task status: ${taskDetail.statusName}`
                  }
              ],
              additionalDetails: {
                  tracking: `TSK-${taskDetail.id.toString().padStart(6, '0')}`,
                  estimatedCompletion: taskDetail.scheduleDate + 'T' + taskDetail.scheduleTime,
                  notes: taskDetail.metadata?.specialInstructions || 'No special instructions',
                  priority: taskDetail.metadata?.priority || 'normal'
              }
          };
      } else {
          throw new Error(`Task with id ${requestId} not found`);
      }
  } catch (error) {
      console.error('Error fetchTaskDetails data:', error);
      throw error;
  }
};

