// Comment out unused import for demo mode
// import axiosInstance from '../../../utils/axiosConfig';

// Demo data for order filters
const demoOrderFilters = {
    status: {
        "pending": "Pending",
        "confirmed": "Confirmed",
        "in_progress": "In Progress",
        "completed": "Completed",
        "cancelled": "Cancelled"
    },
    customer: {
        "1": "John Smith",
        "2": "Sarah Johnson", 
        "3": "Mike Davis",
        "4": "Emily Brown"
    },
    plan: {
        "basic": "Basic Plan",
        "premium": "Premium Plan",
        "enterprise": "Enterprise Plan"
    }
};

// Demo data for orders
const demoOrders = [
    {
        id: 1,
        date: "2024-01-15",
        time: "09:00:00",
        customer: {
            id: 1,
            name: "John Smith",
            firstName: "John",
            lastName: "Smith",
            email: "john.smith@example.com",
            phone: "+1-555-0101"
        },
        vehicle: {
            id: 1001,
            make: "Ford",
            model: "Transit",
            plateNumber: "ABC-123",
            coverImage: "/src/assets/car_models/car_model_1_big.png"
        },
        location: "123 Main St, Toronto, ON",
        plan: "Basic Plan",
        status: "completed",
        statusName: "Completed",
        orderNumber: "ORD-2024-001",
        amount: 299.99,
        createdAt: "2024-01-15T09:00:00Z",
        updatedAt: "2024-01-15T17:30:00Z",
        paymentStatus: "paid",
        deliveryDate: "2024-01-16",
        notes: "Standard delivery completed successfully"
    },
    {
        id: 2,
        date: "2024-01-20",
        time: "14:00:00",
        customer: {
            id: 2,
            name: "Sarah Johnson",
            firstName: "Sarah",
            lastName: "Johnson",
            email: "sarah.johnson@example.com",
            phone: "+1-555-0102"
        },
        vehicle: {
            id: 1002,
            make: "Chevrolet",
            model: "Express",
            plateNumber: "XYZ-456",
            coverImage: "/src/assets/car_models/car_model_1_big.png"
        },
        location: "456 Downtown Ave, Toronto, ON",
        plan: "Premium Plan",
        status: "in_progress",
        statusName: "In Progress",
        orderNumber: "ORD-2024-002",
        amount: 499.99,
        createdAt: "2024-01-20T14:00:00Z",
        updatedAt: "2024-01-20T16:45:00Z",
        paymentStatus: "paid",
        deliveryDate: "2024-01-21",
        notes: "Premium service in progress"
    },
    {
        id: 3,
        date: "2024-01-25",
        time: "10:30:00",
        customer: {
            id: 3,
            name: "Mike Davis",
            firstName: "Mike",
            lastName: "Davis",
            email: "mike.davis@example.com",
            phone: "+1-555-0103"
        },
        vehicle: {
            id: 1003,
            make: "Mercedes",
            model: "Sprinter",
            plateNumber: "DEF-789",
            coverImage: "/src/assets/car_models/car_model_1_big.png"
        },
        location: "789 East St, Toronto, ON",
        plan: "Enterprise Plan",
        status: "pending",
        statusName: "Pending",
        orderNumber: "ORD-2024-003",
        amount: 799.99,
        createdAt: "2024-01-25T10:30:00Z",
        updatedAt: "2024-01-25T10:30:00Z",
        paymentStatus: "pending",
        deliveryDate: "2024-01-26",
        notes: "Enterprise order awaiting confirmation"
    }
];

// Demo data for users (for delivery assignment)
const demoOrderUsers = [
    {
        id: 1,
        firstName: "Alex",
        lastName: "Wilson",
        email: "alex.wilson@company.com",
        phone: "+1-555-0201",
        role: "driver",
        status: "active"
    },
    {
        id: 2,
        firstName: "Maria",
        lastName: "Garcia",
        email: "maria.garcia@company.com",
        phone: "+1-555-0202",
        role: "driver",
        status: "active"
    },
    {
        id: 3,
        firstName: "David",
        lastName: "Chen",
        email: "david.chen@company.com",
        phone: "+1-555-0203",
        role: "supervisor",
        status: "active"
    }
];

export const fetchOrdersFilters = async () => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get('/api/orders/filters');
        // console.log("filter data =" + JSON.stringify(response.data));
        // return response.data;
        
        console.log('fetchOrdersFilters (demo mode)');
        return demoOrderFilters;
    } catch (error) {
        console.error('Error fetching orders data:', error);
    }
};

export const fetchOrders = async (
  page: number = 1,
	size: number = 10,
	status: string = '',
  customerId: number | null = null,
) => {
    try {
        // Comment out API call for demo mode
        // const params = {
        //     page: page,
        //     size: size,
        //     status: status,
        //     customerId: customerId,
        // };
        // const response = await axiosInstance.get('/api/orders', { params });
        // return response.data;
        
        console.log('fetchOrders (demo mode)', { page, size, status, customerId });
        
        // Filter demo data based on parameters
        let filteredData = [...demoOrders];
        
        if (status) {
            const statusFilters = status.split(',');
            filteredData = filteredData.filter(item => statusFilters.includes(item.status));
        }
        if (customerId) {
            filteredData = filteredData.filter(item => item.customer.id === customerId);
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
        console.error('Error fetching orders data:', error);
    }
};

export const resendSMS = async (id: string) => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get(`/api/orders/initiate/signature/${id}`);
        // console.log("resend sms res=",response);
        // return response.data;
        
        console.log('resendSMS (demo mode)', { orderId: id });
        
        // Mock successful SMS resend
        const mockResponse = {
            success: true,
            message: 'SMS resent successfully (demo mode)',
            orderId: id,
            sentAt: new Date().toISOString(),
            recipientPhone: '+1-555-0123'
        };
        
        return mockResponse;
    } catch (error) {
        console.error('Error resend SMS:', error);
    }
};

export const fetchOrderDetail = async (id: string) => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get(`/api/orders/${id}`);
        // return response.data;
        
        console.log('fetchOrderDetail (demo mode)', { orderId: id });
        
        // Find order by id
        const orderDetail = demoOrders.find(order => order.id.toString() === id);
        
        if (orderDetail) {
            // Return enhanced order detail with additional fields
            return {
                ...orderDetail,
                timeline: [
                    {
                        id: 1,
                        status: "Order Created",
                        timestamp: orderDetail.createdAt,
                        description: "Order has been created successfully"
                    },
                    {
                        id: 2,
                        status: "Payment Confirmed",
                        timestamp: orderDetail.createdAt,
                        description: "Payment has been processed"
                    },
                    {
                        id: 3,
                        status: "In Progress",
                        timestamp: orderDetail.updatedAt,
                        description: "Order is being processed"
                    }
                ],
                additionalDetails: {
                    tracking: `TRK-${orderDetail.orderNumber}`,
                    estimatedDelivery: orderDetail.deliveryDate,
                    signature: null,
                    documents: []
                }
            };
        } else {
            throw new Error(`Order with id ${id} not found`);
        }
    } catch (error) {
        console.error('Error fetching order detail data:', error);
        throw error;
    }
};

export const createPayment = async (id: string) => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get(`/api/orders/paymentInitialization/${id}`);
        // return response.data;
        
        console.log('createPayment (demo mode)', { orderId: id });
        
        // Mock payment initialization
        const mockPayment = {
            success: true,
            paymentId: `PAY-${Date.now()}`,
            orderId: id,
            amount: demoOrders.find(o => o.id.toString() === id)?.amount || 299.99,
            currency: 'USD',
            paymentUrl: `https://demo-payment.example.com/pay/${id}`,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
            message: 'Payment initialized successfully (demo mode)'
        };
        
        return mockPayment;
    } catch (error) {
        console.error('Error creating payment:', error);
    }
};

export const assignDeliveryTask = async (payload: object) => {
    try {
        // Comment out API call for demo mode
        // console.log('assignDeliveryTask Payload:', payload);
        // const response = await axiosInstance.post(`/api/tasks/delivery/assign-task/`,payload);
        // console.log('assignDeliveryTask send successfully:', response.data);
        // return response.data;
        
        console.log('assignDeliveryTask (demo mode)', payload);
        
        // Mock successful task assignment
        const mockAssignment = {
            success: true,
            taskId: Date.now(),
            message: 'Delivery task assigned successfully (demo mode)',
            assignedTo: demoOrderUsers[0],
            assignedAt: new Date().toISOString(),
            expectedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
            payload: payload
        };
        
        console.log('assignDeliveryTask completed successfully (demo mode):', mockAssignment);
        return mockAssignment;
    } catch (error: any) {
        console.error('Error assignDeliveryTask (demo mode):', error);
        throw new Error('Failed to assign delivery task in demo mode. Please try again.');
    }
};

export const fetchOrderUsers = async () => {
    try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get('/api/user/all');
        // return response.data.data;
        
        console.log('fetchOrderUsers (demo mode)');
        return demoOrderUsers;
    } catch (error) {
        console.error('Error fetching users (demo mode)', error);
        throw error;
    }
};