import axiosInstance from '../../../utils/axiosConfig';

// Demo alerts data
const demoAlerts = [
  {
    id: 1,
    title: 'Speed Limit Exceeded',
    description: 'Vehicle ABC-123 exceeded speed limit on Highway 401',
    note: 'Driver: John Doe',
    read: false,
    metadata: { map: true }
  },
  {
    id: 2,
    title: 'Maintenance Due',
    description: 'Vehicle XYZ-789 is due for scheduled maintenance',
    note: 'Next service: Oil change',
    read: false,
    metadata: { map: false }
  }
];

export const fetchAlerts = async (
  page: number = 1,
  search: string = '',
  vehicleId: string = '',
  alertType: string = '',
  driverId: string = ''
) => {
    try {
        // Return demo alerts for local development
        console.log('Returning demo alerts (demo mode)');
        return demoAlerts;
    } catch (error) {
        console.error('Error fetching alerts data:', error);
    }
};

export const fetchAlertFilterOptions = async () => {
  try {
      // Return demo filter options
      console.log('Returning demo alert filter options (demo mode)');
      return {
        vehicleTypes: ['Sedan', 'SUV', 'Truck'],
        alertTypes: ['Speed', 'Maintenance', 'Fuel'],
        drivers: ['John Doe', 'Jane Smith']
      };
  } catch (error) {
      console.error('Error fetching alert filter data:', error);
  }
};

export const fetchNewAlerts = async () => {
  try {
      // Return unread demo alerts
      console.log('Returning demo new alerts (demo mode)');
      return demoAlerts.filter(alert => !alert.read);
  } catch (error) {
      console.error('Error fetching new alerts data:', error);
  }
};


export const fetchAlert = async (id:string) => {
    try {
        // Return specific demo alert
        console.log(`Returning demo alert ${id} (demo mode)`);
        return demoAlerts.find(alert => alert.id === parseInt(id));
    } catch (error) {
        console.error('Error fetching alerts data:', error);
    }
};

export const readAlert = async (id:number, read: boolean) => {
        try {
            // Demo mode - just mark alert as read locally
            console.log(`Demo mode: Marking alert ${id} as read: ${read}`);
            const alertIndex = demoAlerts.findIndex(alert => alert.id === id);
            if (alertIndex !== -1) {
                demoAlerts[alertIndex].read = read;
            }
            return { success: true };
        } catch (error: any) {
            console.error('Error read Alert :', error);
            throw new Error('Failed to read Alert. Please try again.');
        }
    };