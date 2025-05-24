// Not in use

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axiosInstance from '../../../utils/axiosConfig';
import qs from 'qs';

import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import WarningIcon from '@mui/icons-material/Warning';

import { IVehicle } from '../../core/interfaces/interfaces';

import MapWithGarages from '../components/MapWithGarages';
import MapWithGaragesVehicles from '../components/MapWithGaragesVehicles';
import StatusChart from '../components/StatusChart';
import GarageChart from '../components/GarageChart';
import TopVehicleStatsChart from '../components/TopVehicleStatsChart';
import BadDriversChart from '../components/BadDriversChart';
import { fetchWidgetData } from '../apis/apis.tsx';
import BillStatusChart from '../../Bills/components/BillStatusChart';
import { Typography } from '@mui/material';

import { systemPlan, systemModule } from '@/utils/constants';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from '@/modules/core/pages/Error404Page';
import LockedFeature from '@/modules/core/components/LockedFeature';

interface BackendGarage {
  id: number;
  name: string;
  city: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
}

interface GarageWithCount {
  id: number;
  name: string;
  city: string;
  vehicleCount: number;
}

interface ReminderItem {
  key: string;
  title: string;
  details: string;
  count?: string;
  route: string;
}

interface VehicleAnalytics {
  vehicleId: number;
  totalKmDriven: number;
  totalFuelUsed: number;
  totalIdleTime: number;
}
interface VehicleStats {
  vehicle: string;
  distance: number;
  fuelConsumption: number;
  idling: number;
}

interface BadDriverApiResponse {
  driverId: number;
  driverName: string;
  speeding: number;
  harshBraking: number;
  idling: number;
  category: string;
}

interface DriverStats {
  driver: string;
  speeding: number;
  harshBraking: number;
  idling: number;
}

interface DashboardItem {
  wgAvailableVehicles?: number;
  wgNewReservations?: number;
  wgNewScreening?: number;
  wgTopVehicleStats?: any[]; // Empty array or objects
  wgFleetStatusChart?: {
    Available: number;
    Unavailable: number;
    InService: number;
    Reserved: number;
  };
  wgGaragesChart?: {
    id: number;
    name: string;
    city: string;
    vehicleCount: number;
  }[];
  wgBadDriversChart?: any[]; // Empty array or objects
  wgReminders?: {
    insuranceUpload: number;
    newMaintenance: number;
    newLeads: number;
    billRequestToPay: number;
    invoiceUpdate: number;
    requestFromCustomer: number;
    devicesActivated: number;
    deliveredCompleted: number;
  };
  wgMaintenanceStatusChart?: {
    New: number;
    Confirmed: number;
    InProcessing: number;
    Paid: number;
    Completed: number;
    Cancelled: number;
  };
  wgMapwithGarages?: {
    garages: {
      id: number;
      latitude: number;
      longitude: number;
      name: string;
      address: string;
      phoneNumber: string;
    }[];
    vehicles: {
      id: number;
      coverImage?: string | null;
      make: string;
      model: string;
      year: number;
      color: string;
      plateNumber: string;
      device: {
        deviceId?: string;
      };
    }[];
  };
  wgTaskStatusChart?: {
    [taskType: string]: {
      PENDING: number;
      ASSIGNED: number;
      IN_PROCESS: number;
      COMPLETED: number;
      CLOSED: number;
    };
  };
}

const availableDates = ['24hrs', '3days', 'weekly', 'monthly', 'yearly'];

export const Dashboard: React.FC = () => {
  if (!checkModuleExists(systemModule.Dashboard)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Dashboard" />
    ) : (
      <Error404Page />
    );
  }

  const [garageLocations, setGarageLocations] = useState<BackendGarage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [vehicleStatuses, setVehicleStatuses] = useState([
    { label: 'Available', quantity: 0, color: '#14B8A6' },
    { label: 'Unavailable', quantity: 0, color: '#3B82F6' },
    { label: 'In Service', quantity: 0, color: '#F59E0B' },
    { label: 'Reserved', quantity: 0, color: '#FACC15' },
  ]);
  const [garagesWithCount, setGaragesWithCount] = useState<GarageWithCount[]>(
    []
  );
  const [maintenanceStatuses, setMaintenanceStatuses] = useState([
    { label: 'New', quantity: 2, color: '#14B8A6' },
    { label: 'Confirmed', quantity: 2, color: '#3B82F6' },
    { label: 'InProcessing', quantity: 2, color: '#6366F1' },
    { label: 'Paid', quantity: 2, color: '#EC4899' },
    { label: 'Completed', quantity: 2, color: '#F59E0B' },
    { label: 'Cancelled', quantity: 2, color: '#FACC15' },
  ]);
  const [reminderCounts, setReminderCounts] = useState<{
    [key: string]: string;
  }>({});
  //showing tmp data
  const isDisplay = true;

  //vehicle analytics
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  const [vehicleData, setVehicleData] = useState<VehicleStats[]>([]);
  const [badDriversData, setBadDriversData] = useState<DriverStats[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [alerts, setAlerts] = useState<ReminderItem[]>([
    {
      key: 'expiring_documents',
      title: 'Expiring Documents',
      details: 'expiring_documents',
      count: '3',
      route: '/',
    },
    {
      key: 'device_tampered',
      title: 'Device Tampered',
      details: 'device_tampered',
      count: '2',
      route: '/',
    },
    {
      key: 'geofence',
      title: 'Geofence',
      details: 'geofence',
      count: '1',
      route: '/',
    },
    {
      key: 'failed_Ai_inspection',
      title: 'Failed Ai Inspection',
      details: 'failed_Ai_inspection',
      count: '2',
      route: '/',
    },
    {
      key: 'impact',
      title: 'Impact',
      details: 'impact',
      count: '0',
      route: '/',
    },
  ]);

  // State to manage selected dataset
  const [selectedTaskChart, setSelectedTaskChart] =
    useState<keyof typeof chartOptions>('DELIVERY');
  const [chartOptions, setChartOptions] = useState<
    Record<string, { label: string; quantity: number; color: string }[]>
  >({
    DELIVERY: [
      { label: 'PENDING', quantity: 10, color: '#14B8A6' },
      { label: 'ASSIGNED', quantity: 15, color: '#3B82F6' },
      { label: 'IN_PROCESS', quantity: 8, color: '#6366F1' },
      { label: 'COMPLETED', quantity: 20, color: '#F59E0B' },
      { label: 'CLOSED', quantity: 5, color: '#FACC15' },
    ],
    MAINTENANCE_DELIVERY: [
      { label: 'PENDING', quantity: 2, color: '#14B8A6' },
      { label: 'ASSIGNED', quantity: 2, color: '#3B82F6' },
      { label: 'IN_PROCESS', quantity: 2, color: '#6366F1' },
      { label: 'COMPLETED', quantity: 2, color: '#F59E0B' },
      { label: 'CLOSED', quantity: 2, color: '#FACC15' },
    ],
    CANCEL_SUBSCRIPTION: [
      { label: 'PENDING', quantity: 3, color: '#14B8A6' },
      { label: 'ASSIGNED', quantity: 10, color: '#3B82F6' },
      { label: 'IN_PROCESS', quantity: 8, color: '#6366F1' },
      { label: 'COMPLETED', quantity: 2, color: '#F59E0B' },
      { label: 'CLOSED', quantity: 15, color: '#FACC15' },
    ],
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch general dashboard data
    const fetchDashboardData = async () => {
      try {
        const results = await Promise.allSettled([
          axiosInstance.get('/api/garages'),
          axiosInstance.get('/api/vehicle/list'),
          axiosInstance.get('/api/device'),
        ]);

        const garageResponse =
          results[0].status === 'fulfilled' ? results[0].value : { data: [] };
        const vehicleResponse =
          results[1].status === 'fulfilled' ? results[1].value : { data: [] };
        const devicesResponse =
          results[2].status === 'fulfilled' ? results[2].value : { data: [] };

        const garages: BackendGarage[] = garageResponse.data;
        const vehicles: IVehicle[] = vehicleResponse.data;
        const devicesCount = devicesResponse.data.length;

        // Calculate vehicle count per garage
        // const garagesWithVehicleCount = garages.map((garage) => {
        //   const vehicleCount = vehicles.filter(
        //     (vehicle) => vehicle.garage?.id === garage.id
        //   ).length;
        //   return {
        //     id: garage.id,
        //     name: garage.name,
        //     city: garage.city,
        //     vehicleCount,
        //   };
        // });

        // if (isDisplay) {
        //   setGaragesWithCount([
        //     { id: 1, name: "Central Garage", city: "Toronto", vehicleCount: 5 },
        //     { id: 2, name: "West End Garage", city: "Mississauga", vehicleCount: 2 },
        //     { id: 3, name: "Downtown Garage", city: "Vancouver", vehicleCount: 3 },
        //     { id: 4, name: "North Garage", city: "Ottawa", vehicleCount: 2 },
        //   ]);
        // } else {
        //   setGaragesWithCount(garagesWithVehicleCount);
        // }

        setGarageLocations(garages);

        const statusCounts = {
          Available: 0,
          Unavailable: 0,
          InService: 0,
          Reserved: 0,
          Maintenance: 0,
        };

        vehicles.forEach((vehicle: IVehicle) => {
          if (vehicle.status === 'Available') {
            statusCounts.Available += 1;
          } else if (vehicle.status === 'Unavailable') {
            statusCounts.Unavailable += 1;
          } else if (vehicle.status === 'InUse') {
            statusCounts.InService += 1;
          } else if (vehicle.status === 'Reserved') {
            statusCounts.Reserved += 1;
          } else if (vehicle.status === 'Maintenance') {
            statusCounts.Maintenance += 1;
          }
        });

        // if (isDisplay) {
        //   setVehicleStatuses([
        //     {
        //       label: 'Available',
        //       quantity: 12,
        //       color: '#97CCE4',
        //     },
        //     {
        //       label: 'Unavailable',
        //       quantity: 2,
        //       color: '#91959E',
        //     },
        //     {
        //       label: 'In Use',
        //       quantity: 3,
        //       color: '#0A1224',
        //     },
        //     {
        //       label: 'Reserved',
        //       quantity: 4,
        //       color: '#164FD5',
        //     },
        //   ]);
        // } else {
        //   setVehicleStatuses([
        //     {
        //       label: 'Available',
        //       quantity: statusCounts.Available,
        //       color: '#97CCE4',
        //     },
        //     {
        //       label: 'Unavailable',
        //       quantity: statusCounts.Unavailable,
        //       color: '#91959E',
        //     },
        //     {
        //       label: 'In Use',
        //       quantity: statusCounts.InService,
        //       color: '#0A1224',
        //     },
        //     {
        //       label: 'Reserved',
        //       quantity: statusCounts.Reserved,
        //       color: '#164FD5',
        //     },
        //     {
        //       label: 'Maintenance',
        //       quantity: statusCounts.Maintenance,
        //       color: '#164FD5',
        //     },
        //   ]);
        // }

        // for future dashboard update
        const res = await fetchWidgetData({
          wg1: true,
          wg2: true,
          wg3: true,
          wg5: true,
          wg6: true,
          wg7: true,
          wg8: true,
          wg10: true,
          wg12: true,
        });

        setDashboardData(res);

        // update Reminders
        const wgReminders = res.find(
          (item) => item.wgReminders !== undefined
        ).wgReminders;
        updateReminders(wgReminders);

        const wgFleetStatusChart = res.find(
          (item) => item.wgFleetStatusChart !== undefined
        ).wgFleetStatusChart;
        updateVehicleStatuses(wgFleetStatusChart);

        const wgGaragesChart = res.find(
          (item) => item.wgGaragesChart !== undefined
        ).wgGaragesChart;
        updateGaragesChart(wgGaragesChart);

        const wgBadDriversChart = res.find(
          (item) => item.wgBadDriversChart !== undefined
        ).wgBadDriversChart;
        updateBadDriversChartt(wgBadDriversChart);

        const wgMaintenanceStatusChart = res.find(
          (item) => item.wgMaintenanceStatusChart !== undefined
        ).wgMaintenanceStatusChart;
        updateMaintenanceStatuses(wgMaintenanceStatusChart);

        const wgTaskStatusChart = res.find(
          (item) => item.wgTaskStatusChart !== undefined
        ).wgTaskStatusChart;
        generateChartOptions(wgTaskStatusChart);

        console.log('wgTaskStatusChart =', wgTaskStatusChart);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Function to update the reminders based on wgReminders
  const updateReminders = (wgReminders: any) => {
    const updatedReminders = [
      {
        key: 'insurance',
        title: 'Insurance',
        details: 'Insurance upload',
        count: wgReminders?.insuranceUpload.toString(),
        route: '/settings/insurance',
      },
      {
        key: 'maintenance',
        title: 'Maintenance',
        details: 'New Maintenance',
        count: wgReminders?.newMaintenance.toString(),
        route: '/maintenance',
      },
      {
        key: 'leads',
        title: 'Leads',
        details: 'New leads',
        count: wgReminders?.newLeads.toString(),
        route: '/leads',
      },
      {
        key: 'tickets',
        title: 'Ticket',
        details: 'Bill request to pay',
        count: wgReminders?.billRequestToPay.toString(),
        route: '/bills',
      },
      {
        key: 'invoices',
        title: 'Invoices',
        details: 'Invoice update',
        count: wgReminders?.invoiceUpdate.toString(),
        route: '/bills',
      },
      {
        key: 'requests',
        title: 'Request',
        details: 'From customer',
        count: wgReminders?.requestFromCustomer.toString(),
        route: '/customer',
      },
      {
        key: 'devices',
        title: 'Devices',
        details: 'Activated',
        count: wgReminders?.devicesActivated
          ? wgReminders?.devicesActivated.toString()
          : undefined,
        route: '/settings/telemetry-devices',
      },
      {
        key: 'delivered',
        title: 'Delivered',
        details: 'Completed',
        count: wgReminders?.deliveredCompleted.toString(),
        route: '/customer',
      },
    ];

    // Update the reminders state
    setReminders(updatedReminders);
  };

  const updateVehicleStatuses = (wgFleetStatusChart: any) => {
    setVehicleStatuses((prevStatuses) =>
      prevStatuses.map((status) => {
        if (status.label === 'Available') {
          return { ...status, quantity: wgFleetStatusChart.Available };
        }
        if (status.label === 'Unavailable') {
          return { ...status, quantity: wgFleetStatusChart.Unavailable };
        }
        if (status.label === 'In Service') {
          return { ...status, quantity: wgFleetStatusChart.InService };
        }
        if (status.label === 'Reserved') {
          return { ...status, quantity: wgFleetStatusChart.Reserved };
        }
        return status;
      })
    );
  };

  const updateMaintenanceStatuses = (wgMaintenanceStatusChart: any) => {
    setMaintenanceStatuses((prevStatuses) =>
      prevStatuses.map((status) => {
        if (status.label === 'New') {
          return { ...status, quantity: wgMaintenanceStatusChart.New };
        }
        if (status.label === 'Confirmed') {
          return { ...status, quantity: wgMaintenanceStatusChart.Confirmed };
        }
        if (status.label === 'InProcessing') {
          return { ...status, quantity: wgMaintenanceStatusChart.InProcessing };
        }
        if (status.label === 'Paid') {
          return { ...status, quantity: wgMaintenanceStatusChart.Paid };
        }
        if (status.label === 'Completed') {
          return { ...status, quantity: wgMaintenanceStatusChart.Completed };
        }
        if (status.label === 'Cancelled') {
          return { ...status, quantity: wgMaintenanceStatusChart.Cancelled };
        }
        return status;
      })
    );
  };

  const generateChartOptions = (wgTaskStatusChart: any) => {
    const colors = {
      PENDING: '#14B8A6',
      ASSIGNED: '#3B82F6',
      IN_PROCESS: '#6366F1',
      COMPLETED: '#F59E0B',
      CLOSED: '#FACC15',
    };

    const updatedChartOptions: Record<
      string,
      { label: string; quantity: number; color: string }[]
    > = {};

    Object.keys(wgTaskStatusChart).forEach((taskType) => {
      const statuses = wgTaskStatusChart[taskType];
      updatedChartOptions[taskType] = Object.keys(statuses).map((status) => ({
        label: status,
        quantity: statuses[status],
        color: colors[status as keyof typeof colors] || '#000000', // Fallback color
      }));
    });

    console.log('updatedChartOptions =', updatedChartOptions);
    // Update the state with the generated chart options
    setChartOptions(updatedChartOptions);
  };

  const updateBadDriversChartt = (wgBadDriversChart: any[]) => {
    if (Array.isArray(wgBadDriversChart)) {
      // Validate input and set the state with the provided data
      setBadDriversData(
        wgBadDriversChart.map((badDriver) => ({
          driver: badDriver.driver || 'Unknown Driver',
          speeding: badDriver.speeding || 0,
          harshBraking: badDriver.harshBraking || 0,
          idling: badDriver.idling || 0,
        }))
      );
    } else {
      console.error(
        'Invalid data format for wgBadDriversChart. Expected an array.'
      );
      setBadDriversData([]); // Reset to empty array if invalid data is passed
    }
  };

  const updateGaragesChart = (wgGaragesChart: any[]) => {
    if (Array.isArray(wgGaragesChart)) {
      // Validate input and set the state with the provided data
      setGaragesWithCount(
        wgGaragesChart.map((garage) => ({
          id: garage.id || 0,
          name: garage.name || 'Unknown Garage',
          city: garage.city || 'Unknown City',
          vehicleCount: garage.vehicleCount || 0,
        }))
      );
    } else {
      console.error(
        'Invalid data format for wgGaragesChart. Expected an array.'
      );
      setGaragesWithCount([]); // Reset to empty array if invalid data is passed
    }
  };

  useEffect(() => {
    // Fetch vehicle analytics data based on selected date
    const fetchVehicleAnalytics = async () => {
      try {
        const response = await axiosInstance.get(
          '/api/vehicle/analytics/data',
          {
            params: { dateRange: selectedDate },
            paramsSerializer: (params) =>
              qs.stringify(params, { encode: false }),
          }
        );
        const vehicleAnalytics: VehicleAnalytics[] = response.data;
        if (isDisplay) {
          setVehicleData([
            {
              vehicle: 'Vehicle 21',
              distance: 5600.5,
              fuelConsumption: 450.6,
              idling: 3.2,
            },
            {
              vehicle: 'Vehicle 12',
              distance: 4320.0,
              fuelConsumption: 400.5,
              idling: 2.1,
            },
            {
              vehicle: 'Vehicle 3',
              distance: 50,
              fuelConsumption: 10.0,
              idling: 1.0,
            },
            {
              vehicle: 'Vehicle 4',
              distance: 3401.0,
              fuelConsumption: 300.2,
              idling: 0,
            },
            {
              vehicle: 'Vehicle 5',
              distance: 8900.2,
              idling: 6.0,
              fuelConsumption: 800.3,
            },
            {
              vehicle: 'Vehicle 2',
              distance: 3200.7,
              idling: 1.0,
              fuelConsumption: 280.4,
            },
            {
              vehicle: 'Vehicle 8',
              distance: 2700.0,
              idling: 3.2,
              fuelConsumption: 230.0,
              category: 'Moderate Usage',
            },
            {
              vehicle: 'Vehicle 9',
              distance: 5300.0,
              idling: 2.0,
              fuelConsumption: 490.5,
              category: 'Top by Fuel Efficiency',
            },
          ]);
        } else {
          setVehicleData(
            vehicleAnalytics.map(
              ({ vehicleId, totalKmDriven, totalFuelUsed, totalIdleTime }) => ({
                vehicle: `Vehicle ${vehicleId}`,
                distance: totalKmDriven,
                fuelConsumption: totalFuelUsed,
                idling: totalIdleTime,
              })
            )
          );
        }
      } catch (error) {
        console.error('Error fetching vehicle analytics:', error);
      }
    };

    //fetchVehicleAnalytics();
  }, [selectedDate]);

  useEffect(() => {
    // Fetch bad drivers data
    // const fetchBadDriversData = async () => {
    //   try {
    //     const response = await axiosInstance.get(
    //       '/api/drivers/top-bad-drivers'
    //     );
    //     const formattedBadDriversData = (
    //       response.data as BadDriverApiResponse[]
    //     ).map((item) => ({
    //       driver: `${item.driverName}`,
    //       speeding: item.speeding,
    //       harshBraking: item.harshBraking,
    //       idling: item.idling,
    //     }));
    //     if (isDisplay) {
    //       setBadDriversData([
    //         { driver: "John Smith", speeding: 12, harshBraking: 5, idling: 20 },
    //         { driver: "Jane Doe", speeding: 8, harshBraking: 10, idling: 15 },
    //       ]
    //       )
    //     } else {
    //       setBadDriversData(formattedBadDriversData);
    //     }
    //   } catch (error) {
    //     console.error('Error fetching bad drivers data:', error);
    //   }
    // };
    // fetchBadDriversData();
  }, []);

  const getIconForTitle = (title: string) => {
    switch (title) {
      case 'Delivered':
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.7338 0C18.0338 0 17.4675 0.5675 17.4675 1.26625V4.21875C16.04 2.49 14.395 0 9.8675 0C4.4275 0 0 4.42625 0 9.8675C0 15.3088 4.4275 19.735 9.8675 19.735C11.947 19.7372 13.9739 19.0816 15.6583 17.862C17.3426 16.6424 18.5981 14.9213 19.245 12.945C19.2979 12.7841 19.3187 12.6144 19.306 12.4455C19.2934 12.2766 19.2476 12.1119 19.1713 11.9607C19.0949 11.8095 18.9896 11.6749 18.8612 11.5644C18.7329 11.4539 18.584 11.3698 18.4231 11.3169C18.2623 11.2639 18.0925 11.2432 17.9237 11.2559C17.7548 11.2685 17.59 11.3143 17.4388 11.3906C17.1335 11.5447 16.9019 11.8139 16.795 12.1388C16.3173 13.599 15.39 14.8707 14.1457 15.772C12.9014 16.6732 11.4039 17.1577 9.8675 17.1562C5.8475 17.1562 2.5775 13.8863 2.5775 9.86625C2.5775 5.84625 5.8475 2.59125 9.8675 2.59125C12.7137 2.59125 14.295 4.3625 15.585 6.22H12.4012C12.0654 6.22 11.7433 6.35341 11.5059 6.59088C11.2684 6.82834 11.135 7.15042 11.135 7.48625C11.135 7.82208 11.2684 8.14416 11.5059 8.38162C11.7433 8.61909 12.0654 8.7525 12.4012 8.7525H18.7338C18.8999 8.75291 19.0646 8.72052 19.2182 8.65719C19.3719 8.59386 19.5115 8.50082 19.6292 8.38343C19.7468 8.26603 19.8401 8.12657 19.9037 7.97304C19.9674 7.81952 20.0001 7.65494 20 7.48875V1.26625C19.9998 0.93047 19.8664 0.608491 19.6289 0.371059C19.3915 0.133627 19.0695 0.000165613 18.7338 0Z"
              fill="black"
            />
          </svg>
        );
      case 'Insurance':
        return (
          <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.3094 3.11721C18.1125 3.11721 17.8828 3.0844 17.6859 3.05159C17.1938 2.98596 16.7016 2.95315 16.275 2.88752C14.5688 2.5594 12.9609 1.87034 11.4516 0.820337C11.1891 0.623462 10.8609 0.525024 10.5656 0.525024H10.4672C10.1719 0.525024 9.84375 0.623462 9.58125 0.820337C8.03906 1.90315 6.46406 2.59221 4.75781 2.88752C4.29844 2.95315 3.83906 3.01877 3.34688 3.05159C3.15 3.05159 2.92031 3.0844 2.72344 3.11721C1.77188 3.21565 1.3125 3.97034 1.3125 4.6594C1.3125 7.94065 1.90312 10.6641 3.01875 13.0922C4.42969 16.111 6.69375 18.5391 9.77813 20.2782C9.975 20.3766 10.2047 20.4422 10.4672 20.475H10.5656C10.8281 20.475 11.0578 20.4094 11.2547 20.2782C14.3391 18.5063 16.6031 16.111 18.0141 13.0922C19.1297 10.6641 19.6875 7.90784 19.7531 4.6594C19.7203 3.97034 19.2609 3.21565 18.3094 3.11721ZM16.3406 12.2063C15.1266 14.8313 13.125 16.9641 10.4344 18.5391V10.4672H3.83906C3.28125 8.79377 3.01875 7.05471 2.98594 5.02034H3.15C3.24844 5.02034 3.31406 4.98752 3.4125 4.98752L3.675 4.95471C4.10156 4.9219 4.56094 4.85627 5.02031 4.79065C6.95625 4.42971 8.72813 3.67502 10.4672 2.46096V10.4672H17.0953C16.8984 11.0578 16.6359 11.6157 16.3406 12.2063Z"
              fill="black"
            />
          </svg>
        );
      case 'Maintenance':
        return (
          <svg
            width="23"
            height="23"
            viewBox="0 0 23 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.34375 12.2187H12.9404V9.34372H5.42081L6.51044 6.90428C6.62472 6.63978 6.88419 6.46872 7.17169 6.46872H11.6064C11.4661 5.75672 11.4671 5.0241 11.6093 4.31247H7.17169C6.60905 4.31216 6.05871 4.47711 5.589 4.78685C5.11929 5.09658 4.7509 5.53745 4.52956 6.05472L2.97131 9.6916C2.06353 10.1753 1.4375 11.1205 1.4375 12.2187V13.6562C1.4375 14.7157 2.01969 15.6328 2.875 16.1316V18.6875C2.875 19.4803 3.51972 20.125 4.3125 20.125H6.46875C7.26153 20.125 7.90625 19.4803 7.90625 18.6875V16.5312H12.9404V13.6562H9.34375C9.15313 13.6562 8.97031 13.5805 8.83552 13.4457C8.70073 13.3109 8.625 13.1281 8.625 12.9375C8.625 12.7468 8.70073 12.564 8.83552 12.4292C8.97031 12.2944 9.15313 12.2187 9.34375 12.2187ZM5.39063 14.7343C4.91406 14.7343 4.45702 14.545 4.12004 14.2081C3.78306 13.8711 3.59375 13.414 3.59375 12.9375C3.59375 12.4609 3.78306 12.0039 4.12004 11.6669C4.45702 11.3299 4.91406 11.1406 5.39063 11.1406C5.86719 11.1406 6.32423 11.3299 6.66121 11.6669C6.99819 12.0039 7.1875 12.4609 7.1875 12.9375C7.1875 13.414 6.99819 13.8711 6.66121 14.2081C6.32423 14.545 5.86719 14.7343 5.39063 14.7343ZM21.5064 4.65531C21.2096 2.95403 19.7822 1.73719 18.9642 1.48922C18.8262 1.44753 18.6904 1.55678 18.6904 1.70053V5.3065C18.6905 5.43998 18.6533 5.57084 18.5831 5.68436C18.5129 5.79787 18.4124 5.88955 18.2929 5.94906L17.5742 6.30844C17.4744 6.3584 17.3644 6.38441 17.2529 6.38441C17.1413 6.38441 17.0313 6.3584 16.9316 6.30844L16.2128 5.94906C16.0935 5.88942 15.9931 5.79771 15.9229 5.68422C15.8527 5.57074 15.8154 5.43995 15.8154 5.3065V1.70053C15.8154 1.55606 15.6788 1.44681 15.5401 1.48922C14.7214 1.74294 13.2947 2.97847 13 4.66538C12.747 6.11438 13.2904 7.53535 14.1479 8.39353C14.2888 8.53441 14.3772 8.71625 14.3772 8.91535V18.6882C14.3772 19.4503 14.6799 20.1812 15.2188 20.7201C15.7577 21.259 16.4886 21.5618 17.2507 21.5618C18.0128 21.5618 18.7437 21.259 19.2826 20.7201C19.8215 20.1812 20.1243 19.4503 20.1243 18.6882L20.1264 8.91894C20.1264 8.71769 20.2177 8.53225 20.36 8.38922C21.2233 7.52672 21.7587 6.09928 21.5064 4.65531ZM17.2565 19.7656C16.9704 19.7655 16.6962 19.6518 16.494 19.4495C16.2918 19.2471 16.1783 18.9728 16.1783 18.6868C16.1784 18.4007 16.2922 18.1264 16.4945 17.9243C16.6968 17.7221 16.9712 17.6085 17.2572 17.6086C17.5432 17.6087 17.8175 17.7224 18.0197 17.9248C18.2219 18.1271 18.3354 18.4014 18.3353 18.6875C18.3352 18.9735 18.2215 19.2478 18.0192 19.45C17.8169 19.6522 17.5425 19.7657 17.2565 19.7656Z"
              fill="black"
            />
          </svg>
        );
      case 'Leads':
        return (
          <svg
            width="29"
            height="29"
            viewBox="0 0 29 29"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.83594 20.8438C11.2134 20.8438 13.1406 18.9165 13.1406 16.5391C13.1406 14.1616 11.2134 12.2344 8.83594 12.2344C6.45852 12.2344 4.53125 14.1616 4.53125 16.5391C4.53125 18.9165 6.45852 20.8438 8.83594 20.8438Z"
              stroke="#010101"
              stroke-width="2"
              stroke-miterlimit="10"
            />
            <path
              d="M2.71875 27.6406C2.71875 25.838 3.43485 24.1092 4.70951 22.8345C5.98417 21.5598 7.71298 20.8438 9.51562 20.8438M15.8594 27.6406C15.8594 26.748 15.6836 25.8642 15.342 25.0396C15.0004 24.2149 14.4998 23.4657 13.8686 22.8345C13.2375 22.2034 12.4882 21.7027 11.6636 21.3611C10.8389 21.0196 9.95508 20.8438 9.0625 20.8438"
              stroke="#010101"
              stroke-width="2"
              stroke-miterlimit="10"
            />
            <path
              d="M19.2578 9.96875C21.6352 9.96875 23.5625 8.04148 23.5625 5.66406C23.5625 3.28665 21.6352 1.35938 19.2578 1.35938C16.8804 1.35938 14.9531 3.28665 14.9531 5.66406C14.9531 8.04148 16.8804 9.96875 19.2578 9.96875Z"
              stroke="#010101"
              stroke-width="2"
              stroke-miterlimit="10"
            />
            <path
              d="M13.1406 16.3125C13.1406 12.8053 16.1811 9.96875 19.9375 9.96875M26.2812 16.3125C26.2812 12.8053 23.2408 9.96875 19.4844 9.96875"
              stroke="#010101"
              stroke-width="2"
              stroke-miterlimit="10"
            />
          </svg>
        );
      case 'Ticket':
        return (
          <svg
            width="27"
            height="27"
            viewBox="0 0 27 27"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_6647_454)">
              <path
                d="M13.5 14.3438C9.77822 14.3438 6.75 11.3155 6.75 7.59375C6.75 3.87197 9.77822 0.84375 13.5 0.84375C17.2218 0.84375 20.25 3.87197 20.25 7.59375C20.25 11.3155 17.2218 14.3438 13.5 14.3438ZM13.5 2.53125C10.708 2.53125 8.4375 4.80178 8.4375 7.59375C8.4375 10.3857 10.708 12.6562 13.5 12.6562C16.292 12.6562 18.5625 10.3857 18.5625 7.59375C18.5625 4.80178 16.292 2.53125 13.5 2.53125Z"
                fill="black"
              />
              <path
                d="M13.8375 11.1375H13.1625C12.6896 11.1357 12.2298 10.9818 11.851 10.6986C11.4723 10.4154 11.1946 10.0179 11.059 9.5648C11.0248 9.45772 11.0124 9.34488 11.0224 9.23292C11.0324 9.12095 11.0647 9.01212 11.1174 8.91281C11.17 8.8135 11.242 8.72571 11.3291 8.65461C11.4161 8.5835 11.5165 8.53051 11.6244 8.49875C11.7322 8.46698 11.8453 8.45709 11.957 8.46964C12.0687 8.48219 12.1768 8.51693 12.2749 8.57184C12.373 8.62674 12.4591 8.70068 12.5282 8.78934C12.5973 8.87799 12.648 8.97956 12.6773 9.08808C12.7406 9.30155 12.9406 9.45089 13.1625 9.45089H13.8375C13.9719 9.45089 14.1008 9.39751 14.1958 9.30249C14.2908 9.20747 14.3442 9.0786 14.3442 8.94422C14.3442 8.80984 14.2908 8.68097 14.1958 8.58595C14.1008 8.49093 13.9719 8.43755 13.8375 8.43755H13.1625C11.9526 8.43755 10.9688 7.45289 10.9688 6.2438C10.9688 5.03471 11.9526 4.05005 13.1625 4.05005H13.8375C14.7833 4.05005 15.6187 4.65249 15.9182 5.55024C15.955 5.65576 15.9704 5.76753 15.9636 5.87907C15.9568 5.9906 15.928 6.09968 15.8787 6.19998C15.8294 6.30027 15.7607 6.38977 15.6766 6.46329C15.5924 6.53681 15.4945 6.59288 15.3885 6.62825C15.2825 6.66362 15.1705 6.67759 15.0591 6.66933C14.9477 6.66108 14.839 6.63077 14.7393 6.58016C14.6397 6.52956 14.5511 6.45967 14.4787 6.37456C14.4063 6.28944 14.3516 6.19079 14.3176 6.08433C14.2843 5.9833 14.22 5.89537 14.1338 5.83309C14.0476 5.77081 13.9439 5.73737 13.8375 5.73755H13.1625C13.0282 5.73755 12.8995 5.79089 12.8045 5.88583C12.7096 5.98077 12.6562 6.10953 12.6562 6.2438C12.6562 6.37806 12.7096 6.50683 12.8045 6.60177C12.8995 6.69671 13.0282 6.75005 13.1625 6.75005H13.8375C15.0474 6.75005 16.0312 7.73471 16.0312 8.9438C16.0312 10.1529 15.0474 11.1375 13.8375 11.1375Z"
                fill="black"
              />
              <path
                d="M13.5 5.06245C13.2713 5.06245 13.0604 4.96964 12.9009 4.81776C12.8672 4.77558 12.825 4.73339 12.7997 4.68276C12.7662 4.63973 12.7405 4.59119 12.7238 4.53933C12.6995 4.4914 12.6822 4.44026 12.6723 4.38745C12.6647 4.32839 12.6562 4.27776 12.6562 4.2187C12.6562 3.99933 12.7482 3.77995 12.9009 3.61964C13.2131 3.30745 13.7784 3.30745 14.0991 3.61964C14.2509 3.77995 14.3438 3.99933 14.3438 4.2187C14.3438 4.27776 14.3353 4.32839 14.326 4.38745C14.3172 4.44042 14.3002 4.49167 14.2754 4.53933C14.2583 4.59104 14.2326 4.63953 14.1995 4.68276C14.1657 4.73339 14.132 4.77558 14.0982 4.81776C13.9387 4.96964 13.7194 5.06245 13.5 5.06245ZM13.5 11.8125C13.2713 11.8125 13.0604 11.7196 12.9009 11.5678C12.8672 11.5256 12.825 11.4834 12.7997 11.4328C12.7662 11.3897 12.7405 11.3412 12.7238 11.2893C12.6995 11.2414 12.6822 11.1903 12.6723 11.1375C12.6647 11.0784 12.6562 11.0278 12.6562 10.9687C12.6562 10.7493 12.7482 10.53 12.9009 10.3696C13.2131 10.0575 13.7784 10.0575 14.0991 10.3696C14.2509 10.53 14.3438 10.7493 14.3438 10.9687C14.3438 11.0278 14.3353 11.0784 14.326 11.1375C14.3172 11.1904 14.3002 11.2417 14.2754 11.2893C14.2583 11.341 14.2326 11.3895 14.1995 11.4328C14.1657 11.4834 14.132 11.5256 14.0982 11.5678C13.9387 11.7196 13.7194 11.8125 13.5 11.8125ZM15.1875 26.1562H1.6875C1.46372 26.1562 1.24911 26.0673 1.09088 25.9091C0.932645 25.7508 0.84375 25.5362 0.84375 25.3125V17.7187C0.84375 17.4951 0.932344 17.28 1.09097 17.1222C1.28841 16.9239 3.08222 15.1875 5.0625 15.1875C6.70275 15.1875 8.81887 16.4269 9.53016 16.875H13.5C13.8693 16.8755 14.234 16.9568 14.5687 17.113C14.9033 17.2693 15.1997 17.4968 15.4372 17.7796C15.6747 18.0625 15.8475 18.3938 15.9436 18.7504C16.0396 19.107 16.0566 19.4803 15.9933 19.8441L22.6513 17.0699C23.0359 16.9092 23.4542 16.8461 23.8691 16.8863C24.2839 16.9265 24.6824 17.0687 25.029 17.3002C25.3761 17.531 25.6607 17.844 25.8574 18.2115C26.0541 18.579 26.1567 18.9894 26.1562 19.4062C26.1563 19.5537 26.1177 19.6986 26.0442 19.8265C25.9708 19.9544 25.8651 20.0609 25.7377 20.1352L15.6128 26.0415C15.4836 26.1166 15.3369 26.1562 15.1875 26.1562ZM2.53125 24.4687H14.9588L24.3582 18.986C24.2927 18.873 24.202 18.7766 24.0933 18.7042C23.9782 18.6261 23.8454 18.5781 23.7069 18.5647C23.5685 18.5513 23.4289 18.5728 23.301 18.6274L15.5132 21.8725C15.41 21.9153 15.2993 21.9374 15.1875 21.9375H8.4375C8.21372 21.9375 7.99911 21.8486 7.84088 21.6903C7.68264 21.5321 7.59375 21.3175 7.59375 21.0937C7.59375 20.8699 7.68264 20.6553 7.84088 20.4971C7.99911 20.3388 8.21372 20.25 8.4375 20.25H13.5C13.7172 20.2402 13.9224 20.1471 14.0727 19.9899C14.223 19.8328 14.3069 19.6237 14.3069 19.4062C14.3069 19.1887 14.223 18.9796 14.0727 18.8225C13.9224 18.6653 13.7172 18.5722 13.5 18.5625H9.28125C9.11503 18.5625 8.95134 18.5127 8.81297 18.4215C8.1675 17.9912 6.23278 16.875 5.0625 16.875C4.14281 16.875 3.08222 17.6174 2.53125 18.0891V24.4687Z"
                fill="black"
              />
            </g>
            <defs>
              <clipPath id="clip0_6647_454">
                <rect width="27" height="27" fill="white" />
              </clipPath>
            </defs>
          </svg>
        );
      case 'Invoices':
        return (
          <svg
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.2916 11.375H13C13.2873 11.375 13.5628 11.2609 13.766 11.0577C13.9692 10.8545 14.0833 10.579 14.0833 10.2917C14.0833 10.0043 13.9692 9.72879 13.766 9.52563C13.5628 9.32246 13.2873 9.20833 13 9.20833H11.9166V8.66666C11.9166 8.37934 11.8025 8.10379 11.5993 7.90063C11.3962 7.69746 11.1206 7.58333 10.8333 7.58333C10.546 7.58333 10.2704 7.69746 10.0673 7.90063C9.86411 8.10379 9.74997 8.37934 9.74997 8.66666V9.26249C9.09176 9.39615 8.50669 9.7696 8.10835 10.3104C7.71 10.8511 7.52679 11.5206 7.59429 12.1888C7.66179 12.8571 7.97518 13.4764 8.47362 13.9266C8.97206 14.3768 9.61999 14.6257 10.2916 14.625H11.375C11.5186 14.625 11.6564 14.6821 11.758 14.7836C11.8596 14.8852 11.9166 15.023 11.9166 15.1667C11.9166 15.3103 11.8596 15.4481 11.758 15.5497C11.6564 15.6513 11.5186 15.7083 11.375 15.7083H8.66664C8.37932 15.7083 8.10377 15.8225 7.9006 16.0256C7.69744 16.2288 7.5833 16.5043 7.5833 16.7917C7.5833 17.079 7.69744 17.3545 7.9006 17.5577C8.10377 17.7609 8.37932 17.875 8.66664 17.875H9.74997V18.4167C9.74997 18.704 9.86411 18.9795 10.0673 19.1827C10.2704 19.3859 10.546 19.5 10.8333 19.5C11.1206 19.5 11.3962 19.3859 11.5993 19.1827C11.8025 18.9795 11.9166 18.704 11.9166 18.4167V17.8208C12.5748 17.6872 13.1599 17.3137 13.5583 16.773C13.9566 16.2322 14.1398 15.5627 14.0723 14.8945C14.0048 14.2262 13.6914 13.6069 13.193 13.1567C12.6945 12.7066 12.0466 12.4577 11.375 12.4583H10.2916C10.148 12.4583 10.0102 12.4013 9.90862 12.2997C9.80704 12.1981 9.74997 12.0603 9.74997 11.9167C9.74997 11.773 9.80704 11.6352 9.90862 11.5336C10.0102 11.4321 10.148 11.375 10.2916 11.375ZM22.75 13H19.5V3.24999C19.5007 3.0591 19.451 2.87139 19.3559 2.70588C19.2608 2.54037 19.1236 2.40294 18.9583 2.30749C18.7936 2.21241 18.6068 2.16235 18.4166 2.16235C18.2265 2.16235 18.0397 2.21241 17.875 2.30749L14.625 4.17083L11.375 2.30749C11.2103 2.21241 11.0235 2.16235 10.8333 2.16235C10.6431 2.16235 10.4563 2.21241 10.2916 2.30749L7.04164 4.17083L3.79163 2.30749C3.62695 2.21241 3.44013 2.16235 3.24997 2.16235C3.0598 2.16235 2.87299 2.21241 2.7083 2.30749C2.54298 2.40294 2.40581 2.54037 2.31069 2.70588C2.21557 2.87139 2.16588 3.0591 2.16663 3.24999V20.5833C2.16663 21.4453 2.50904 22.2719 3.11854 22.8814C3.72803 23.4909 4.55468 23.8333 5.41663 23.8333H20.5833C21.4453 23.8333 22.2719 23.4909 22.8814 22.8814C23.4909 22.2719 23.8333 21.4453 23.8333 20.5833V14.0833C23.8333 13.796 23.7192 13.5205 23.516 13.3173C23.3128 13.1141 23.0373 13 22.75 13ZM5.41663 21.6667C5.12932 21.6667 4.85377 21.5525 4.6506 21.3494C4.44744 21.1462 4.3333 20.8706 4.3333 20.5833V5.12416L6.49997 6.35916C6.66717 6.44649 6.853 6.4921 7.04164 6.4921C7.23027 6.4921 7.4161 6.44649 7.5833 6.35916L10.8333 4.49583L14.0833 6.35916C14.2505 6.44649 14.4363 6.4921 14.625 6.4921C14.8136 6.4921 14.9994 6.44649 15.1666 6.35916L17.3333 5.12416V20.5833C17.3362 20.9529 17.4022 21.3193 17.5283 21.6667H5.41663ZM21.6666 20.5833C21.6666 20.8706 21.5525 21.1462 21.3493 21.3494C21.1462 21.5525 20.8706 21.6667 20.5833 21.6667C20.296 21.6667 20.0204 21.5525 19.8173 21.3494C19.6141 21.1462 19.5 20.8706 19.5 20.5833V15.1667H21.6666V20.5833Z"
              fill="black"
            />
          </svg>
        );
      case 'Request':
        return (
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.40625 13.2031C7.06209 13.2031 7.59375 12.6715 7.59375 12.0156C7.59375 11.3598 7.06209 10.8281 6.40625 10.8281C5.75041 10.8281 5.21875 11.3598 5.21875 12.0156C5.21875 12.6715 5.75041 13.2031 6.40625 13.2031Z"
              fill="black"
            />
            <path
              d="M10.5469 13.2031C11.2027 13.2031 11.7344 12.6715 11.7344 12.0156C11.7344 11.3598 11.2027 10.8281 10.5469 10.8281C9.89104 10.8281 9.35938 11.3598 9.35938 12.0156C9.35938 12.6715 9.89104 13.2031 10.5469 13.2031Z"
              fill="black"
            />
            <path
              d="M14.6875 13.2031C15.3433 13.2031 15.875 12.6715 15.875 12.0156C15.875 11.3598 15.3433 10.8281 14.6875 10.8281C14.0317 10.8281 13.5 11.3598 13.5 12.0156C13.5 12.6715 14.0317 13.2031 14.6875 13.2031Z"
              fill="black"
            />
            <path
              d="M22.1953 4.50779C21.5299 3.83909 20.7385 3.30902 19.8668 2.94829C18.9951 2.58755 18.0606 2.40331 17.1172 2.40622H11.7891C10.7476 2.40082 9.7177 2.6248 8.77254 3.06227C7.82739 3.49975 6.99016 4.13997 6.32032 4.93747C5.00783 5.21958 3.80116 5.86519 2.83817 6.80052C1.87518 7.73586 1.1947 8.9232 0.874481 10.2269C0.554257 11.5306 0.607202 12.8981 1.02727 14.1732C1.44733 15.4482 2.21758 16.5794 3.25 17.4375V22.625L7.26563 19.1015C7.44532 19.1015 7.64844 19.1015 7.86719 19.1015H13.1953C15.0388 19.107 16.8122 18.3954 18.1406 17.1172L21.7188 20.2422V15.0703C22.4812 14.4317 23.1023 13.6414 23.5425 12.7496C23.9828 11.8578 24.2325 10.8841 24.2759 9.89057C24.3192 8.89699 24.1553 7.90527 23.7944 6.97854C23.4335 6.05181 22.8836 5.21037 22.1797 4.50779H22.1953ZM7.88282 17.539C7.62172 17.5383 7.36088 17.5226 7.10157 17.4922H6.75781L4.82813 19.1562V16.6406L4.51563 16.4062C3.63918 15.7498 2.97403 14.8512 2.60219 13.8213C2.23036 12.7913 2.16811 11.675 2.42312 10.6101C2.67814 9.54524 3.23926 8.57826 4.03728 7.82846C4.83531 7.07865 5.83535 6.57882 6.91407 6.3906C7.23344 6.33064 7.55788 6.30186 7.88282 6.30466H13.2109C14.2816 6.30502 15.3299 6.61137 16.2323 7.18764C17.1347 7.7639 17.8536 8.58606 18.3043 9.55727C18.755 10.5285 18.9188 11.6083 18.7763 12.6694C18.6338 13.7306 18.191 14.729 17.5 15.5468C17.3906 15.664 17.2891 15.7812 17.1797 15.8984C16.6608 16.423 16.0426 16.839 15.3612 17.122C14.6798 17.405 13.9488 17.5494 13.2109 17.5468L7.88282 17.539Z"
              fill="black"
            />
          </svg>
        );
      default:
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.72428 -0.00219727C1.22876 -0.00219727 -0.00402832 1.23058 -0.00402832 2.72611V6.35991C-0.00402832 7.85543 1.22876 9.08821 2.72428 9.08821H6.35807C7.8536 9.08821 9.08637 7.85543 9.08637 6.35991V2.72611C9.08637 1.23058 7.8536 -0.00219727 6.35807 -0.00219727H2.72428ZM13.6329 -0.00219727C12.1374 -0.00219727 10.9046 1.23058 10.9046 2.72611V6.35991C10.9046 7.85543 12.1374 9.08821 13.6329 9.08821H17.2704C18.7659 9.08821 19.995 7.85543 19.995 6.35991V2.72611C19.995 1.23058 18.7659 -0.00219727 17.2704 -0.00219727H13.6329ZM2.72428 1.81697H6.35807C6.87082 1.81697 7.26721 2.21336 7.26721 2.72611V6.35991C7.26721 6.87266 6.87082 7.26904 6.35807 7.26904H2.72428C2.21153 7.26904 1.81515 6.87266 1.81515 6.35991V2.72611C1.81515 2.21336 2.21153 1.81697 2.72428 1.81697ZM13.6329 1.81697H17.2704C17.7831 1.81697 18.1804 2.21336 18.1804 2.72611V6.35991C18.1804 6.87266 17.7831 7.26904 17.2704 7.26904H13.6329C13.1202 7.26904 12.7238 6.87266 12.7238 6.35991V2.72611C12.7238 2.21336 13.1202 1.81697 13.6329 1.81697ZM2.72428 10.9065C1.22876 10.9065 -0.00402832 12.1393 -0.00402832 13.6348V17.2722C-0.00402832 18.7677 1.22876 19.9969 2.72428 19.9969H6.35807C7.8536 19.9969 9.08637 18.7677 9.08637 17.2722V13.6348C9.08637 12.1393 7.8536 10.9065 6.35807 10.9065H2.72428ZM13.6329 10.9065C12.1374 10.9065 10.9046 12.1393 10.9046 13.6348V17.2722C10.9046 18.7677 12.1374 19.9969 13.6329 19.9969H17.2704C18.7659 19.9969 19.995 18.7677 19.995 17.2722V13.6348C19.995 12.1393 18.7659 10.9065 17.2704 10.9065H13.6329ZM2.72428 12.7256H6.35807C6.87082 12.7256 7.26721 13.122 7.26721 13.6348V17.2722C7.26904 17.3921 7.24678 17.5112 7.20176 17.6224C7.15673 17.7336 7.08985 17.8346 7.00508 17.9195C6.9203 18.0043 6.81935 18.0713 6.70821 18.1165C6.59707 18.1616 6.47802 18.184 6.35807 18.1822H2.72428C2.21153 18.1822 1.81515 17.785 1.81515 17.2722V13.6348C1.81515 13.122 2.21153 12.7256 2.72428 12.7256ZM13.6329 12.7256H17.2704C17.7831 12.7256 18.1804 13.122 18.1804 13.6348V17.2722C18.1821 17.3922 18.1598 17.5113 18.1146 17.6225C18.0695 17.7337 18.0025 17.8347 17.9177 17.9195C17.8328 18.0044 17.7318 18.0713 17.6207 18.1165C17.5095 18.1616 17.3904 18.184 17.2704 18.1822H13.6329C13.1202 18.1822 12.7238 17.785 12.7238 17.2722V13.6348C12.7238 13.122 13.1202 12.7256 13.6329 12.7256Z"
              fill="black"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className="grid grid-cols-5 grid-rows-[0.1fr,0.75fr,0.4fr] gap-4 h-screen"
      style={{ marginBottom: '16px' }}
    >
      {/* First Column */}
      {/* Available Vehicles */}
      <div
        className="col-span-1 row-span-1 border p-4 rounded-xl flex items-center cursor-pointer"
        onClick={() => navigate('/fleet-management')}
      >
        {/* Icon */}
        <div className="cornerCut cornerCut-large">
          <DirectionsCarIcon style={{ fontSize: '24px', color: '#000' }} />
        </div>

        {/* Text Content */}
        <div className="ml-4">
          <h2>Available Vehicles</h2>

          <div className="flex items-center">
            {(() => {
              const item = dashboardData.find(
                (item) => item.wgAvailableVehicles !== undefined
              );
              return item && item.wgAvailableVehicles > 0 ? (
                <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-1 text-sm">
                  {item.wgAvailableVehicles}
                </span>
              ) : (
                <p className="text-2xl font-bold">0</p>
              );
            })()}
          </div>
        </div>
      </div>

      {/* New Reservations */}
      <div
        className="col-span-1 row-span-1 border p-4 rounded-xl flex items-center cursor-pointer"
        onClick={() => navigate('/orders')}
      >
        {/* Icon */}
        <div className="cornerCut cornerCut-large">
          <EventAvailableIcon />
        </div>

        {/* Text Content */}
        <div className="ml-4">
          <h2>New Reservations</h2>
          <div className="flex items-center">
            {(() => {
              const item = dashboardData.find(
                (item) => item.wgNewReservations !== undefined
              );
              return item && item.wgNewReservations > 0 ? (
                <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-1 text-sm">
                  {item.wgNewReservations}
                </span>
              ) : (
                <p className="text-2xl font-bold">0</p>
              );
            })()}
          </div>
        </div>
      </div>

      {/* New Screening */}
      <div
        className="col-span-1 row-span-1 border p-4 rounded-xl flex items-center cursor-pointer"
        onClick={() => navigate('/operations/screening-logs')}
      >
        {/* Icon */}
        <div className="cornerCut cornerCut-large">
          <DocumentScannerIcon />
        </div>

        {/* Text Content */}
        <div className="ml-4">
          <h2>New Screening</h2>
          <div className="flex items-center">
            {(() => {
              const item = dashboardData.find(
                (item) => item.wgNewScreening !== undefined
              );
              return item && item.wgNewScreening > 0 ? (
                <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-1 text-sm">
                  {item.wgNewScreening}
                </span>
              ) : (
                <p className="text-2xl font-bold">0</p>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="col-span-2 row-span-2 border p-4 rounded-xl">
        {loading ? (
          <p>Loading map...</p>
        ) : (
          //<MapWithGarages />
          <MapWithGaragesVehicles />
        )}
      </div>

      {/* Live Metrics */}
      <div className="col-span-3 row-span-1 border p-4 rounded-xl">
        <TopVehicleStatsChart />
      </div>

      {/* Vehicle Status */}
      <div className="col-span-1 row-span-1 border p-4 rounded-xl">
        <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
          Vehicle Status
        </Typography>
        <StatusChart name="Vehicle" data={vehicleStatuses} />
      </div>

      {/* Garages */}
      <div className="col-span-1 row-span-1 border p-4 rounded-xl">
        <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
          Garages
        </Typography>
        <GarageChart garages={garagesWithCount} />
      </div>

      {/* New Feature */}
      <div className="col-span-2 row-span-1 border p-4 rounded-xl">
        <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
          Driver's behavior: 7 days
        </Typography>
        <BadDriversChart badDriversData={badDriversData} />
      </div>

      {/* Reminders Section */}
      <div className="col-span-1 row-span-1 border p-4 rounded-xl">
        <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
          Reminders
        </Typography>
        <div className="h-96 mt-6 overflow-y-auto">
          {reminders.map((reminder, index) => (
            <div
              key={index}
              className="border p-4 rounded-xl flex justify-between items-center hover:bg-slate-300 cursor-pointer mb-4"
              onClick={() => navigate(reminder.route)}
            >
              {/* Icon */}
              <div
                className="cornerCut cornerCut-small"
                style={{ marginRight: '8px' }}
              >
                {getIconForTitle(reminder.title)}
              </div>

              {/* Text Content */}
              <div className="flex-grow">
                <h2 className="text-sm">{reminder.title}</h2>
                <p className="text-xs">{reminder.details}</p>
              </div>

              {/* Count Badge */}
              <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-1 text-sm">
                {reminder.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Section */}
      <div className="col-span-1 row-span-1 border p-4 rounded-xl">
        <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
          Alerts
        </Typography>
        <div className="h-96 mt-6 overflow-y-auto">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="border p-4 rounded-xl flex justify-between items-center hover:bg-slate-300 cursor-pointer mb-4"
              onClick={() => navigate(alert.route)}
            >
              {/* Icon */}
              <div
                className="cornerCut cornerCut-small"
                style={{ marginRight: '8px' }}
              >
                <WarningIcon />
              </div>

              {/* Text Content */}
              <div className="flex-grow">
                <h2 className="text-sm">{alert.title}</h2>
                <p className="text-xs">{alert.details}</p>
              </div>

              {/* Count Badge */}
              <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-1 text-sm">
                {alert.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance Status */}
      <div className="col-span-1 row-span-1 border p-4 rounded-xl">
        <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
          Maintenance Status
        </Typography>
        <StatusChart name="Maintenance" data={maintenanceStatuses} />
      </div>

      {/* Bill Status Chart */}
      <div className="col-span-3 row-span-1 border p-4 rounded-xl">
        <BillStatusChart showFilter={true} />
      </div>

      {/* Task Status Chart */}
      <div className="col-span-2 row-span-1 border p-4 rounded-xl">
        <div className="flex justify-between items-center">
          <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
            Task Status Chart
          </Typography>
          {/* Dropdown for selecting chart type */}
          <select
            value={selectedTaskChart}
            onChange={(e) =>
              setSelectedTaskChart(e.target.value as keyof typeof chartOptions)
            }
            className="p-2 border rounded-md"
          >
            {Object.keys(chartOptions).map((option) => (
              <option key={option} value={option}>
                {option
                  .replace('_', ' ')
                  .toLowerCase()
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        {/* StatusChart Component */}
        <StatusChart
          width={2}
          name={selectedTaskChart
            .replace('_', ' ')
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase())}
          data={chartOptions[selectedTaskChart]}
        />
      </div>
    </div>
  );
};
