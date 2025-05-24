// import axios, { AxiosError } from 'axios';
// import axiosInstance from '../../../utils/axiosConfig';

// Demo data for leads
const demoLeads = [
    {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        assigneeId: 1,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
    },
    {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0124',
        assigneeId: 2,
        createdAt: '2024-01-16T09:15:00Z',
        updatedAt: '2024-01-16T09:15:00Z'
    },
    {
        id: 3,
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        phone: '+1-555-0125',
        assigneeId: 1,
        createdAt: '2024-01-17T14:20:00Z',
        updatedAt: '2024-01-17T14:20:00Z'
    },
    {
        id: 4,
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.williams@example.com',
        phone: '+1-555-0126',
        assigneeId: 3,
        createdAt: '2024-01-18T11:45:00Z',
        updatedAt: '2024-01-18T11:45:00Z'
    },
    {
        id: 5,
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@example.com',
        phone: '+1-555-0127',
        assigneeId: 2,
        createdAt: '2024-01-19T16:30:00Z',
        updatedAt: '2024-01-19T16:30:00Z'
    },
    {
        id: 6,
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@example.com',
        phone: '+1-555-0128',
        assigneeId: 1,
        createdAt: '2024-01-20T08:00:00Z',
        updatedAt: '2024-01-20T08:00:00Z'
    },
    {
        id: 7,
        firstName: 'Robert',
        lastName: 'Miller',
        email: 'robert.miller@example.com',
        phone: '+1-555-0129',
        assigneeId: 3,
        createdAt: '2024-01-21T13:15:00Z',
        updatedAt: '2024-01-21T13:15:00Z'
    },
    {
        id: 8,
        firstName: 'Lisa',
        lastName: 'Wilson',
        email: 'lisa.wilson@example.com',
        phone: '+1-555-0130',
        assigneeId: 2,
        createdAt: '2024-01-22T12:00:00Z',
        updatedAt: '2024-01-22T12:00:00Z'
    }
];

// Demo users data
const demoUsers = [
    {
        id: 1,
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'Admin'
    },
    {
        id: 2,
        firstName: 'Sales',
        lastName: 'Manager',
        email: 'sales@example.com',
        role: 'Sales Manager'
    },
    {
        id: 3,
        firstName: 'Support',
        lastName: 'Agent',
        email: 'support@example.com',
        role: 'Support Agent'
    }
];

// In-memory storage for demo leads (simulates database)
let leadsStorage = [...demoLeads];
let nextId = Math.max(...demoLeads.map(lead => lead.id)) + 1;

export const fetchLeads = async (
    page: number = 1,
    size: number = 10,
    sortBy: string = ``,
    sortOrder: string = `createdAt`,
    search: string = `asc`,
) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
        // Original API call - commented out
        // const params = {
        //     page: page,
        //     size: size,
        //     sortBy: sortBy,
        //     sortOrder: sortOrder,
        //     search: search,
        // };
        // const response = await axiosInstance.get('/api/leads',{params});
        // return response.data;

        // Demo data implementation
        let filteredLeads = [...leadsStorage];

        // Apply search filter
        if (search && search !== 'asc' && search !== 'desc') {
            filteredLeads = filteredLeads.filter(lead => 
                lead.firstName.toLowerCase().includes(search.toLowerCase()) ||
                lead.lastName.toLowerCase().includes(search.toLowerCase()) ||
                lead.email.toLowerCase().includes(search.toLowerCase()) ||
                lead.phone.includes(search)
            );
        }

        // Apply sorting
        if (sortBy) {
            filteredLeads.sort((a, b) => {
                const aValue = a[sortBy as keyof typeof a];
                const bValue = b[sortBy as keyof typeof b];
                
                if (sortOrder === 'desc') {
                    return aValue > bValue ? -1 : 1;
                }
                return aValue > bValue ? 1 : -1;
            });
        }

        // Apply pagination
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

        // Return mock response structure
        return {
            data: paginatedLeads,
            meta: {
                currentPage: page,
                lastPage: Math.ceil(filteredLeads.length / size),
                total: filteredLeads.length,
                perPage: size
            }
        };
    } catch (error) {
        console.error('Error fetching leads data:', error);
        throw error;
    }
};


export interface LeadData {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    assigneeId?: number;
    //organizationId: number;
}

/**
 * Create a new lead.
 *
 * @param {LeadData} leadData - The lead data to be sent in the POST request.
 * @returns {Promise<any>} - The created lead data or an error object.
 */
export const createLead = async (leadData: LeadData): Promise<any> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
        // Original API call - commented out
        // const response = await axiosInstance.post('/api/leads', leadData); // Replace with your API endpoint
        // return response.data; // Return created lead data

        // Demo data implementation
        const newLead = {
            id: nextId++,
            ...leadData,
            assigneeId: leadData.assigneeId || 1, // Default to assignee 1 if not provided
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        leadsStorage.push(newLead);
        return newLead;
    } catch (error: unknown) {
        // Original error handling - commented out
        // if (axios.isAxiosError(error)) {
        //     // Handle Axios errors
        //     const axiosError = error as AxiosError<{ message: string }>;
        //     console.error('Axios error creating lead:', axiosError.response?.data?.message || axiosError.message);
        //     throw new Error(axiosError.response?.data?.message || 'Failed to create lead');
        // } else {
        //     // Handle unknown errors
        //     console.error('Unknown error creating lead:', error);
        //     throw new Error('An unknown error occurred while creating the lead');
        // }

        // Demo error handling
        console.error('Error creating lead (demo):', error);
        throw new Error('Failed to create lead');
    }
};

export const updateLead = async (id: number, leadData: LeadData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
        // Original API call - commented out
        // const response = await axiosInstance.put(`/api/leads/${id}`, leadData);
        // return response.data; // Return updated lead data

        // Demo data implementation
        const leadIndex = leadsStorage.findIndex(lead => lead.id === id);
        if (leadIndex === -1) {
            throw new Error('Lead not found');
        }

        leadsStorage[leadIndex] = {
            ...leadsStorage[leadIndex],
            ...leadData,
            updatedAt: new Date().toISOString()
        };

        return leadsStorage[leadIndex];
    } catch (error) {
        // Original error handling - commented out
        // if (axios.isAxiosError(error)) {
        //     throw new Error(error.response?.data?.message || 'Failed to update lead.');
        // } else {
        //     throw new Error('An unexpected error occurred while updating the lead.');
        // }

        // Demo error handling
        console.error('Error updating lead (demo):', error);
        throw new Error('Failed to update lead');
    }
};


export const deleteLead = async (id: number): Promise<any> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
        // Original API call - commented out
        // const response = await axiosInstance.delete(`/api/leads/${id}`);
        // console.log(response);// DELETE request to the API
        // return response.data; // Return the response data (success message or deleted lead data)

        // Demo data implementation
        const leadIndex = leadsStorage.findIndex(lead => lead.id === id);
        if (leadIndex === -1) {
            throw new Error('Lead not found');
        }

        const deletedLead = leadsStorage.splice(leadIndex, 1)[0];
        return { message: 'Lead deleted successfully', deletedLead };
    } catch (error) {
        // Original error handling - commented out
        // if (axios.isAxiosError(error)) {
        //     throw new Error(error.response?.data?.message || 'Failed to delete lead.');
        // } else {
        //     throw new Error('An unexpected error occurred while deleting the lead.');
        // }

        // Demo error handling
        console.error('Error deleting lead (demo):', error);
        throw new Error('Failed to delete lead');
    }
};


export const sendText = async (id: number): Promise<any> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
        // Original API call - commented out
        // const response = await axiosInstance.post(`/api/leads/text/send/${id}`);
        // return response.data;

        // Demo data implementation
        const lead = leadsStorage.find(lead => lead.id === id);
        if (!lead) {
            throw new Error('Lead not found');
        }

        // Simulate successful text sending
        return { 
            message: `Text sent successfully to ${lead.firstName} ${lead.lastName} at ${lead.phone}`,
            leadId: id,
            sentAt: new Date().toISOString()
        };
    } catch (error) {
        // Original error handling - commented out
        // if (axios.isAxiosError(error)) {
        //     throw new Error(error.response?.data?.message || 'Failed to send text.');
        // } else {
        //     throw new Error('An unexpected error occurred while sending text.');
        // }

        // Demo error handling
        console.error('Error sending text (demo):', error);
        throw new Error('Failed to send text');
    }
};

export const uploadLeads = async (file: File): Promise<any> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Original API call - commented out
    // const formData = new FormData();
    // formData.append('file', file); // Attach the file to the request

    try {
        // Original API call - commented out
        // const response = await axiosInstance.post('/api/leads/upload', formData, {
        //     headers: {
        //         'Content-Type': 'multipart/form-data', // Ensure multipart content type for file upload
        //     },
        // });
        // return response.data; // Return server response

        // Demo data implementation
        return { 
            message: `File ${file.name} uploaded successfully (demo)`,
            fileName: file.name,
            uploadedAt: new Date().toISOString(),
            processed: true
        };
    } catch (error) {
        // Original error handling - commented out
        // if (axios.isAxiosError(error)) {
        //     throw new Error(error.response?.data?.message || 'Failed to upload CSV.');
        // } else {
        //     throw new Error('An unexpected error occurred while uploading the CSV.');
        // }

        // Demo error handling
        console.error('Error uploading CSV (demo):', error);
        throw new Error('Failed to upload CSV');
    }
};

export const fetchUsers = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Original API call - commented out
    // TODO: currently using all user api 
    // try {
    //     const response = await axiosInstance.get('/api/user/all');
    //     return response.data.data;
    // } catch (error) {
    //     console.error('Error fetching users', error);
    //     throw error;
    // }

    // Demo data implementation
    try {
        return demoUsers;
    } catch (error) {
        console.error('Error fetching users (demo)', error);
        throw error;
    }
};
