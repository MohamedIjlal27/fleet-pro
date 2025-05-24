import React, { useState, useEffect, useRef, Suspense } from 'react';
import qs from 'qs';
import PageMeta from '@/components/common/PageMeta';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import GridLayout, {
  Layout as RGLLayout,
  Responsive as ResponsiveGridLayout,
  WidthProvider,
} from 'react-grid-layout';

// Extended Layout type with our custom properties
interface Layout extends RGLLayout {
  visible: boolean;
}
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { styled } from '@mui/material/styles';

// Custom styles for widgets
const ChartWrapper = styled('div')({
  background: '#fff',
  borderRadius: '16px',
  padding: '16px',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  '@media (min-width: 400px)': {
    padding: '20px',
  },
  '@media (min-width: 600px)': {
    padding: '12px',
  }
});

// Custom styles for resizable widgets
const StyledCSS = styled('style')({
  '@global': {
    // Make resize handles more visible in edit mode
    '.react-resizable-handle': {
      position: 'absolute',
      width: '24px',
      height: '24px',
      bottom: '0',
      right: '0',
      cursor: 'se-resize',
      backgroundColor: 'transparent',
      zIndex: 10,
      opacity: 0,
      transition: 'opacity 0.2s ease-in-out',
      // Add a diagonal resize icon
      "&::after": {
        content: '""',
        position: 'absolute',
        right: '3px',
        bottom: '3px',
        width: '18px',
        height: '18px',
        borderRight: '2px solid #aaa',
        borderBottom: '2px solid #aaa',
      }
    },
    // Show resize handles when edit mode is active
    '.edit-mode .react-resizable-handle': {
      opacity: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: '0 0 4px 0',
      boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
    },
    // Add a subtle border to widgets in edit mode
    '.edit-mode .react-grid-item': {
      border: '1px dashed #aaa',
      transition: 'all 0.3s ease',
      position: 'relative',
    },
    // Add tooltip for resize in edit mode
    '.edit-mode .react-grid-item::after': {
      content: '"Resize"',
      position: 'absolute',
      right: '25px',
      bottom: '25px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '3px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      opacity: 0,
      transition: 'opacity 0.2s ease',
      pointerEvents: 'none',
    },
    // Show tooltip when hovering over resize handle
    '.edit-mode .react-grid-item:hover .react-resizable-handle:hover + ::after': {
      opacity: 1,
    },
    // Apply styles to the resize handles when hovered
    '.edit-mode .react-resizable-handle:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    // Style the drag handle
    '.drag-handle': {
      transition: 'opacity 0.2s ease',
    },
  }
});

import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import WarningIcon from '@mui/icons-material/Warning';
import { Package } from 'lucide-react';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

import { IVehicle } from '../../core/interfaces/interfaces';

import LoadingScreen from '../components/LoadingScreen';
import MapWithGarages from '../components/MapWithGarages';
import MapWithGaragesVehicles from '../components/MapWithGaragesVehicles';
import StatusChart from '../components/StatusChart';
import GarageChart from '../components/GarageChart';
import TopVehicleStatsChart from '../components/TopVehicleStatsChart';
import BillStatusChart from '../../Bills/components/BillStatusChart';
import DriverBehaviour from '../components/DriverBehaviour';
import TopPerformingDrivers from '../components/TopPerformingDrivers';
import AssetUtilizationChart from '../components/AssetUtilizationChart';
import AssetAvailabilityChart from '../components/AssetAvailabilityChart';


import AssetIdleRateChart from '../components/AssetIdleRateChart';
import MaintenanceCostChart from '../components/MaintenanceCostChart';
import MaintenanceDowntimeChart from '../components/MaintenanceDowntimeChart';
import MaintenanceCostAreaChart from '../components/MaintenanceCostAreaChart';
import AssetTrackerWidget from '../components/AssetTrackerWidget';
import DashboardFilters from '../components/DashboardFilters';



import IncidentsChart from '../components/IncidentsChart';



import { Link, useLocation, useNavigate } from 'react-router';
import { createBrowserHistory } from 'history';
import axiosInstance from '../../../utils/axiosConfig';
import { fetchWidgetData, fetchLayout, updateLayout, DashboardFilterParams } from '../apis/apis.tsx';
import { toast } from 'react-toastify';

import { systemPlan, systemModule } from '@/utils/constants';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from '@/modules/core/pages/Error404Page';
import LockedFeature from '@/modules/core/components/LockedFeature';

import {
  BackendGarage, GarageWithCount, ReminderItem, VehicleAnalytics, VehicleStats, BadDriverApiResponse,
  DriverStats, DashboardItem,
} from '../interfaces/interfaces.ts'

const availableDates = ['24hrs', '3days', 'weekly', 'monthly', 'yearly'];
//const ResponsiveGridLayout = WidthProvider(Responsive);

export const DashboardDND: React.FC = () => {
  if (!checkModuleExists(systemModule.Dashboard)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Dashboard" />
    ) : (
      <Error404Page />
    );
  }
  const isFleetModuleAvailable = checkModuleExists(systemModule.Fleet);
  const isOrdersModuleAvailable = checkModuleExists(systemModule.Orders);
  const isOperationsGaragesModuleAvailable = checkModuleExists(
    systemModule.OperationsGarages
  );
  const isOperationsScreeningLogsModuleAvailable = checkModuleExists(
    systemModule.OperationsScreeningLogs
  );
  const isOperationsDriversModuleAvailable = checkModuleExists(
    systemModule.OperationsDrivers
  );
  const isRequestsModuleAvailable = checkModuleExists(systemModule.Requests);
  const isBillsModuleAvailable = checkModuleExists(systemModule.Bills);
  const isSettingsInsuranceModuleAvailable = checkModuleExists(
    systemModule.SettingsInsurance
  );
  const isMaintenanceModuleAvailable = checkModuleExists(
    systemModule.Maintenance
  );
  const isLeadsModuleAvailable = checkModuleExists(systemModule.Leads);
  const isSettingsTelemetryDeviceModuleAvailable = checkModuleExists(
    systemModule.SettingsTelemetryDevice
  );

  const [garageLocations, setGarageLocations] = useState<BackendGarage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [vehicleStatuses, setVehicleStatuses] = useState([
    { label: 'Available', quantity: 0, color: '#14B8A6' },
    { label: 'Unavailable', quantity: 0, color: '#3B82F6' },
    { label: 'In Service', quantity: 0, color: '#F59E0B' },
    { label: 'Reserved', quantity: 0, color: '#FACC15' },
  ]);

  const [AssetStatuses, setAssetStatuses] = useState([
    { label: 'Available', quantity: 0, color: '#14B8A6' },
    { label: 'In Use', quantity: 0, color: '#F59E0B' },
    { label: 'Maintenance', quantity: 0, color: '#3B82F6' },
    { label: 'Reserved', quantity: 0, color: '#FACC15' },
  ]);

  // State for Preventive & Predictive Maintenance
  const [preventivePredictiveData, setPreventivePredictiveData] = useState({
    preventive_maintenance_percent: 0,
    predictive_maintenance_percent: 0
  });
  const [garagesWithCount, setGaragesWithCount] = useState<GarageWithCount[]>(
    []
  );
  const [maintenanceStatuses, setMaintenanceStatuses] = useState([
    { label: 'New', quantity: 0, color: '#14B8A6' },
    { label: 'Confirmed', quantity: 0, color: '#3B82F6' },
    { label: 'InProcessing', quantity: 0, color: '#6366F1' },
    { label: 'Paid', quantity: 0, color: '#EC4899' },
    { label: 'Completed', quantity: 0, color: '#F59E0B' },
    { label: 'Cancelled', quantity: 0, color: '#FACC15' },
  ]);
  const [reminderCounts, setReminderCounts] = useState<{
    [key: string]: string;
  }>({});

  //vehicle analytics
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  const [vehicleData, setVehicleData] = useState<VehicleStats[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);

  // State to store dashboard filters
  const [dashboardFilters, setDashboardFilters] = useState<DashboardFilterParams>({});

  // State to manage selected dataset
  const [selectedTaskChart, setSelectedTaskChart] =
    useState<keyof typeof chartOptions>('DELIVERY');
  const [chartOptions, setChartOptions] = useState<
    Record<string, { label: string; quantity: number; color: string }[]>
  >({
    DELIVERY: [
      { label: 'PENDING', quantity: 0, color: '#14B8A6' },
      { label: 'ASSIGNED', quantity: 0, color: '#3B82F6' },
      { label: 'IN_PROCESS', quantity: 0, color: '#6366F1' },
      { label: 'COMPLETED', quantity: 0, color: '#F59E0B' },
      { label: 'CLOSED', quantity: 0, color: '#FACC15' },
    ],
    MAINTENANCE_DELIVERY: [
      { label: 'PENDING', quantity: 0, color: '#14B8A6' },
      { label: 'ASSIGNED', quantity: 0, color: '#3B82F6' },
      { label: 'IN_PROCESS', quantity: 0, color: '#6366F1' },
      { label: 'COMPLETED', quantity: 0, color: '#F59E0B' },
      { label: 'CLOSED', quantity: 0, color: '#FACC15' },
    ],
    CANCEL_SUBSCRIPTION: [
      { label: 'PENDING', quantity: 0, color: '#14B8A6' },
      { label: 'ASSIGNED', quantity: 0, color: '#3B82F6' },
      { label: 'IN_PROCESS', quantity: 0, color: '#6366F1' },
      { label: 'COMPLETED', quantity: 0, color: '#F59E0B' },
      { label: 'CLOSED', quantity: 0, color: '#FACC15' },
    ],
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const toggleEditMode = async () => {
    if (isEditMode) {
      // Save the current layout when exiting edit mode
      await saveLayout(layout);
    }
    setIsEditMode(!isEditMode); // Toggle edit mode
  };

  const saveLayout = async (layout: Layout[]) => {
    try {
      const matrix = layout
        .filter((item) => item.visible) // Exclude items with visible = false
        .map(({ w, h, x, y, i }: RGLLayout) => ({ w, h, x, y, i })); // Prepare the matrix

      const response = await updateLayout(matrix); // Call API to update layout
      toast.success(i18n.t('Layout saved'));
      //console.log("Layout saved:", response);
      return response; // Return the response if needed
    } catch (error: any) {
      toast.error('Failed to save layout');
      console.error('Failed to save layout:', error.message);
      throw error; // Re-throw the error if needed for further handling
    }
  };

  const [gridWidth, setGridWidth] = useState(1280);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Define your initial grid layout
  const initialLayout: Layout[] = (
    [
      {
        w: 1,
        h: 4,
        x: 1,
        y: 9.1,
        i: 'calloutAssetStatus',
        moved: false,
        static: false,
        visible: true,
      },
      isFleetModuleAvailable && {
        w: 1,
        h: 0.7,
        x: 0,
        y: 0.4,
        i: 'availableAssets',
        moved: false,
        static: false,
        visible: true,
      },
      isFleetModuleAvailable && {
        w: 1,
        h: 0.7,
        x: 0,
        y: 0.4,
        i: 'availableVehicles',
        moved: false,
        static: false,
        visible: true,
      },
      isFleetModuleAvailable && {
        w: 1,
        h: 0.7,
        x: 0,
        y: 1.1,
        i: 'inUseVehicles',
        moved: false,
        static: false,
        visible: true,
      },
      isMaintenanceModuleAvailable && {
        w: 1,
        h: 0.7,
        x: 0,
        y: 1.8,
        i: 'maintenanceVehicles',
        moved: false,
        static: false,
        visible: true,
      },
      isOrdersModuleAvailable && {
        w: 1,
        h: 0.7,
        x: 1,
        y: 0.4,
        i: 'newReservations',
        moved: false,
        static: false,
        visible: true,
      },
      isOperationsScreeningLogsModuleAvailable && {
        w: 1,
        h: 0.7,
        x: 2,
        y: 0.4,
        i: 'newScreening',
        moved: false,
        static: false,
        visible: true,
      },
      (isOperationsGaragesModuleAvailable || isFleetModuleAvailable) && {
        w: 2,
        h: 5.1,
        x: 3,
        y: 0,
        i: 'map',
        moved: false,
        static: false,
        visible: true,
      },
      isFleetModuleAvailable && {
        w: 3,
        h: 4,
        x: 0,
        y: 13.1,
        i: 'liveMetrics',
        moved: false,
        static: false,
        visible: true,
      },
      isFleetModuleAvailable && {
        w: 1,
        h: 4,
        x: 0,
        y: 1.1,
        i: 'vehicleStatus',
        moved: false,
        static: false,
        visible: true,
      },
      // isOperationsGaragesModuleAvailable && {
      //   w: 1,
      //   h: 4,
      //   x: 1,
      //   y: 5.1,
      //   i: 'garages',
      //   moved: false,
      //   static: false,
      //   visible: true,
      // },
      isOperationsDriversModuleAvailable && {
        w: 2,
        h: 4,
        x: 1,
        y: 1.1,
        i: 'driverBehavior',
        moved: false,
        static: false,
        visible: true,
      },
      {
        w: 3,
        h: 4,
        x: 3,
        y: 5.1,
        i: 'assetUtilization',
        moved: false,
        static: false,
        visible: true,
      },
      {
        w: 3,
        h: 4,
        x: 3,
        y: 9.1,
        i: 'assetAvailability',
        moved: false,
        static: false,
        visible: true,
      },
      {
        w: 1,
        h: 4,
        x: 4,
        y: 5.1,
        i: 'reminders',
        moved: false,
        static: false,
        visible: true,
      },
      isMaintenanceModuleAvailable && {
        w: 1,
        h: 4,
        x: 0,
        y: 5.1,
        i: 'maintenanceStatus',
        moved: false,
        static: false,
        visible: true,
      },
      isBillsModuleAvailable && {
        w: 3,
        h: 4,
        x: 0,
        y: 9.1,
        i: 'billStatus',
        moved: false,
        static: false,
        visible: true,
      },
      isRequestsModuleAvailable && {
        w: 2,
        h: 4,
        x: 2,
        y: 5.1,
        i: 'taskStatus',
        moved: false,
        static: false,
        visible: true,
      },
      // {
      //   w: 2,
      //   h: 4,
      //   x: 0,
      //   y: 13.1,
      //   i: 'performance',
      //   moved: false,
      //   static: false,
      //   visible: false,
      // },
      {
        w: 5,
        h: 5,
        x: 0,
        y: 22.5,
        i: 'topPerformingDrivers',
        moved: false,
        static: false,
        visible: true,
      },
      {
        w: 3,
        h: 4,
        x: 0,
        y: 25.5,
        i: 'incidents',
        moved: false,
        static: false,
        visible: true,
      },
      {
        w: 2,
        h: 4,
        x: 0,
        y: 26.5,
        i: 'maintenanceCost',
        moved: false,
        static: false,
        visible: true,
      },
      {
        w: 2,
        h: 4,
        x: 2,
        y: 26.5,
        i: 'maintenanceDowntime',
        moved: false,
        static: false,
        visible: true,
      },
      {
        w: 3,
        h: 4,
        x: 0,
        y: 30.5,
        i: 'maintenanceCostArea',
        moved: false,
        static: false,
        visible: true,
      },
      {
        w: 2,
        h: 4,
        x: 3,
        y: 30.5,
        i: 'preventivePredictive',
        moved: false,
        static: false,
        visible: true,
      },
      {
        w: 2,
        h: 4,
        x: 3,
        y: 13.1,
        i: 'assetIdleRate',
        moved: false,
        static: false,
        visible: true,
      },
      {
        w: 2,
        h: 4,
        x: 0,
        y: 17.5,
        i: 'assetTracker',
        moved: false,
        static: false,
        visible: true,
      },
    ] as (false | Layout)[])
    .filter((item): item is Layout => Boolean(item)
  );
  const [layout, setLayout] = useState<Layout[]>(initialLayout);
  const [previousLayout, setPreviousLayout] = useState<Layout[]>([]);

  // Widget descriptions mapping
  const widgetInfo: Record<string, { title: string, description: string }> = {
    calloutAssetStatus: {
      title: "Assets",
      description: "Overview of your asset's current status distribution"
    },
    availableAssets: {
      title: "Available Assets",
      description: "Count of assets ready for service"
    },
    availableVehicles: {
      title: "Available Vehicles",
      description: "Count of vehicles ready for service"
    },
    inUseVehicles: {
      title: "In-Use Vehicles",
      description: "Count of vehicles currently in service"
    },
    maintenanceVehicles: {
      title: "Maintenance Vehicles",
      description: "Count of vehicles under maintenance"
    },
    map: {
      title: "Map",
      description: "Visual map of vehicle and garage locations"
    },
    liveMetrics: {
      title: "Live Metrics",
      description: "Real-time performance metrics of your fleet"
    },
    vehicleStatus: {
      title: "Vehicles",
      description: "Overview of your fleet's current status distribution"
    },
    // garages: {
    //   title: "Garages",
    //   description: "Vehicle distribution across different garages"
    // },
    driverBehavior: {
      title: "Driver Behavior",
      description: "Analytics on driver performance and safety metrics"
    },
    assetUtilization: {
      title: "Asset Utilization",
      description: "Metrics on how efficiently assets are being used"
    },
    assetAvailability: {
      title: "Asset Availability",
      description: "Trends of asset availability over time"
    },
    reminders: {
      title: "Reminders",
      description: "Important alerts and notifications requiring attention"
    },
    maintenanceStatus: {
      title: "Maintenance Status",
      description: "Current state of maintenance work orders"
    },
    billStatus: {
      title: "Bill Status",
      description: "Overview of billing and payment statuses"
    },
    taskStatus: {
      title: "Task Status",
      description: "Progress tracker for various operational tasks"
    },
    // performance: {
    //   title: "Performance",
    //   description: "Key performance indicators for your fleet"
    // },
    incidents: {
      title: "Incidents",
      description: "Summary of safety incidents and events"
    },
    maintenanceCost: {
      title: "Maintenance Cost",
      description: "Financial breakdown of maintenance expenses"
    },
    maintenanceDowntime: {
      title: "Maintenance Downtime",
      description: "Analysis of vehicle downtime due to maintenance"
    },
    maintenanceCostArea: {
      title: "Maintenance Cost Area",
      description: "Detailed cost analysis by maintenance area"
    },
    preventivePredictive: {
      title: "Maintenance Type",
      description: "Comparison of preventive vs. predictive maintenance"
    },
    assetIdleRate: {
      title: "Asset Idle Rate",
      description: "Tracking of asset utilization vs. idle time"
    },
    topPerformingDrivers: {
      title: "Top Performing Drivers",
      description: "Analysis of drivers with highest performance scores"
    },
    assetTracker: {
      title: "Vehicle Tracker",
      description: "Track vehicle distribution across garages"
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedWidgets, setSelectedWidgets] = useState([
    'Vehicle Metrics',
    'Vehicle Status',
    'Garages',
    'Driver Behavior',
    'Reminders',
    'Maintenance Status',
    'Bill Status',
    'Task Status',
    'Maintenance Type',
    'Preventive & Predictive'
  ]);

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  const widgetOptions = [
    'Vehicle Metrics',
    'Vehicle Status',
    'Garages',
    'Driver Behavior',
    'Reminders',
    'Maintenance Status',
    'Bill Status',
    'Task Status',
    'Performance',
    'Maintenance Type',
    'Preventive & Predictive'
  ];

  const navigate = useNavigate();

  // Dynamically calculate the width of the parent container
  useEffect(() => {
    const updateGridWidth = () => {
      if (gridContainerRef.current) {
        setGridWidth(gridContainerRef.current.offsetWidth);
      }
    };

    // Set initial width
    updateGridWidth();

    // Update on window resize
    window.addEventListener('resize', updateGridWidth);

    return () => {
      window.removeEventListener('resize', updateGridWidth);
    };
  }, []);

  useEffect(() => {
    const updateLayoutState = async () => {
      //console.log('updateLayoutState');
      try {
        const fetchedData = await fetchLayout();

        // Validate fetched data
        if (fetchedData?.settings?.matrix) {
          const fetchedMatrix = fetchedData.settings.matrix;

          // Update the layout state
          setLayout((prevLayout) => {
            const updatedLayout = prevLayout.map((item) => {
              const matchedItem = fetchedMatrix.find(
                (matrixItem) => matrixItem.i === item.i
              );
              if (matchedItem) {
                // Update properties and set visible to true
                return {
                  ...item,
                  w: matchedItem.w,
                  h: matchedItem.h,
                  x: matchedItem.x,
                  y: matchedItem.y,
                  visible: true,
                };
              }
              // If not found in fetchedMatrix, set visible to false
              return { ...item, visible: false };
            });

            return updatedLayout;
          });
        } else {
          console.warn('Fetched data does not contain settings or matrix.');
        }
      } catch (error) {
        console.error('Failed to update layout:', error.message);
      }
    };

    updateLayoutState();
  }, []);

  useEffect(() => {
    // Fetch general dashboard data
    const fetchDashboardData = async () => {
      //console.log('fetchDashboardData');
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


        const res = await fetchWidgetData({
          wg1: true,
          wg2: true,
          wg3: true,
          wg5: true,
          wg6: true,
          wg7: true,
          wg7a: 5,  // Number of bad drivers to show, not boolean
          wg8: true,
          wg10: true,
          wg10a: '',  // Vehicle IDs as string, not boolean
          wg12: true,
          wg13: true,
          wg14: true,
          wg16: true,
          wg17: true,
          wg20: true,
          wg20a: 5,  // Number of good drivers to show
          wg21: true,
          wg22: true,
          wg23: true,
          wg24: true,
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

        // Check for wg14 (Asset Status) data and update the asset status widget
        const assetStatusData = res.find(item => item.wgAssetStatusChart !== undefined)?.wgAssetStatusChart;
        //console.log("Asset Status Data (wg14):", assetStatusData);
        //console.log("Vehicle Status Data (wg5):", wgFleetStatusChart);
        updateAssetStatuses(assetStatusData);

        const wgGaragesChart = res.find(
          (item) => item.wgGaragesChart !== undefined
        ).wgGaragesChart;
        updateGaragesChart(wgGaragesChart);

        const wgMaintenanceStatusChart = res.find(
          (item) => item.wgMaintenanceStatusChart !== undefined
        ).wgMaintenanceStatusChart;
        updateMaintenanceStatuses(wgMaintenanceStatusChart);

        const wgTaskStatusChart = res.find(
          (item) => item.wgTaskStatusChart !== undefined
        ).wgTaskStatusChart;
        generateChartOptions(wgTaskStatusChart);

        //console.log("wgTaskStatusChart =", wgTaskStatusChart);

        //setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        //setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Function to update the reminders based on wgReminders
  const updateReminders = (wgReminders: any) => {
    const updatedReminders = [
      isSettingsInsuranceModuleAvailable && {
        key: 'insurance',
        title: 'Insurance',
        details: 'Insurance upload',
        count: wgReminders?.insuranceUpload.toString(),
        route: '/settings/insurance',
      },
      isMaintenanceModuleAvailable && {
        key: 'maintenance',
        title: 'Maintenance',
        details: 'New Maintenance',
        count: wgReminders?.newMaintenance.toString(),
        route: '/maintenance/work-order',
      },
      isLeadsModuleAvailable && {
        key: 'leads',
        title: 'Leads',
        details: 'New leads',
        count: wgReminders?.newLeads.toString(),
        route: '/leads',
      },
      isBillsModuleAvailable && {
        key: 'tickets',
        title: 'Ticket',
        details: 'Bill request to pay',
        count: wgReminders?.billRequestToPay.toString(),
        route: '/bills',
      },
      isBillsModuleAvailable && {
        key: 'invoices',
        title: 'Invoices',
        details: 'Invoice update',
        count: wgReminders?.invoiceUpdate.toString(),
        route: '/bills',
      },
      isRequestsModuleAvailable && {
        key: 'requests',
        title: 'Request',
        details: 'From customer',
        count: wgReminders?.requestFromCustomer.toString(),
        route: '/requests',
      },
      isSettingsTelemetryDeviceModuleAvailable && {
        key: 'devices',
        title: 'Devices',
        details: 'Activated',
        count: wgReminders?.devicesActivated
          ? wgReminders?.devicesActivated.toString()
          : undefined,
        route: '/settings/telemetry-devices',
      },
      isOrdersModuleAvailable && {
        key: 'delivered',
        title: 'Delivered',
        details: 'Completed',
        count: wgReminders?.deliveredCompleted.toString(),
        route: '/orders',
      },
    ].filter(Boolean);

    // Update the reminders state
    setReminders(updatedReminders);
  };

  const updateVehicleStatuses = (wgFleetStatusChart: any) => {
    // Update Vehicle Status widget
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
        if (status.label === "New") {
          return { ...status, quantity: wgMaintenanceStatusChart.New };
        }
        if (status.label === "Confirmed") {
          return { ...status, quantity: wgMaintenanceStatusChart.Confirmed };
        }
        if (status.label === "InProcessing") {
          return { ...status, quantity: wgMaintenanceStatusChart.InProcessing };
        }
        if (status.label === "Paid") {
          return { ...status, quantity: wgMaintenanceStatusChart.Paid };
        }
        if (status.label === "Completed") {
          return { ...status, quantity: wgMaintenanceStatusChart.Completed };
        }
        if (status.label === "Cancelled") {
          return { ...status, quantity: wgMaintenanceStatusChart.Cancelled };
        }
        return status;
      })
    );
  };

  // Function to update Asset Statuses from wg14 data only
  const updateAssetStatuses = (wgAssetStatusChart: any) => {
    // Log the received data to debug
    //console.log("Asset Status Data being processed:", wgAssetStatusChart);

    if (wgAssetStatusChart && typeof wgAssetStatusChart === 'object') {
      setAssetStatuses((prevStatuses) =>
        prevStatuses.map((status) => {
          if (status.label === 'Available') {
            return { ...status, quantity: wgAssetStatusChart.Available || 0 };
          }
          if (status.label === 'In Use') {
            // Try multiple possible property names for "In Use"
            const inUseValue = wgAssetStatusChart.InUse ||
              wgAssetStatusChart.InService ||
              wgAssetStatusChart["In Use"] || 0;
            return { ...status, quantity: inUseValue };
          }
          if (status.label === 'Maintenance') {
            return { ...status, quantity: wgAssetStatusChart.Maintenance || 0 };
          }
          if (status.label === 'Reserved') {
            // Try multiple possible property names for "Reserved"
            const reservedValue = wgAssetStatusChart.Reserved ||
              wgAssetStatusChart["Reserved"] ||
              wgAssetStatusChart.OutOfService ||
              wgAssetStatusChart["Out of Service"] || 0;
            return { ...status, quantity: reservedValue };
          }
          return status;
        })
      );
    }
  };

  ;

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

    //console.log("updatedChartOptions =", updatedChartOptions);
    // Update the state with the generated chart options
    setChartOptions(updatedChartOptions);
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
      } catch (error) {
        console.error('Error fetching vehicle analytics:', error);
      }
    };

    //fetchVehicleAnalytics();
  }, [selectedDate]);

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
              strokeWidth="2"
              strokeMiterlimit="10"
            />
            <path
              d="M2.71875 27.6406C2.71875 25.838 3.43485 24.1092 4.70951 22.8345C5.98417 21.5598 7.71298 20.8438 9.51562 20.8438M15.8594 27.6406C15.8594 26.748 15.6836 25.8642 15.342 25.0396C15.0004 24.2149 14.4998 23.4657 13.8686 22.8345C13.2375 22.2034 12.4882 21.7027 11.6636 21.3611C10.8389 21.0196 9.95508 20.8438 9.0625 20.8438"
              stroke="#010101"
              strokeWidth="2"
              strokeMiterlimit="10"
            />
            <path
              d="M19.2578 9.96875C21.6352 9.96875 23.5625 8.04148 23.5625 5.66406C23.5625 3.28665 21.6352 1.35938 19.2578 1.35938C16.8804 1.35938 14.9531 3.28665 14.9531 5.66406C14.9531 8.04148 16.8804 9.96875 19.2578 9.96875Z"
              stroke="#010101"
              strokeWidth="2"
              strokeMiterlimit="10"
            />
            <path
              d="M13.1406 16.3125C13.1406 12.8053 16.1811 9.96875 19.9375 9.96875M26.2812 16.3125C26.2812 12.8053 23.2408 9.96875 19.4844 9.96875"
              stroke="#010101"
              strokeWidth="2"
              strokeMiterlimit="10"
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
            <g clipPath="url(#clip0_6647_454)">
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

  const handleDialogOpen = () => {
    setPreviousLayout(layout);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setLayout(previousLayout);
    setDialogOpen(false);
  };

  const handleCheckboxChange = (widgetId: string) => {
    setLayout((prevLayout) =>
      prevLayout.map((item) =>
        item.i === widgetId ? { ...item, visible: !item.visible } : item
      )
    );
  };

  const handleSave = async () => {
    //console.log("Updated Layout:", layout);
    setDialogOpen(false); // Close the dialog
    await saveLayout(layout);
  };

  const { i18n } = useTranslation();

  return (
    <>
      <PageMeta
        title="Dashboard | Synops AI"
        description="This is Dashboard page for Synops AI"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />

          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div> */}
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full px-4 sm:px-6 py-4 gap-4 md:gap-0">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
          {i18n.t('Dashboard')}
        </h1>

        {/* Filters + Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 w-full md:w-auto">
          {/* Filters - full width on mobile, inline on desktop */}
          <div className="flex flex-wrap gap-3">
            <DashboardFilters
              onFilterChange={(filters) => {
                //console.log('Filter params:', filters);

                // Update the dashboardFilters state with new filters
                setDashboardFilters(filters);

                //console.log("Applied dashboard filters:", filters);

                // Fetch dashboard data with filters from backend
                const fetchFilteredData = async () => {
                  //setLoading(true);
                  try {
                    // Apply the main filter parameters (garageGroup, garageId, frequency)
                    // directly from the backend controller along with widget parameters
                    const res = await fetchWidgetData({
                      ...filters, // Main filters from DashboardFilters component
                      // Widget parameters - match the backend controller structure
                      wg1: true,  // Available Vehicles
                      wg2: true,  // New Reservations 
                      wg3: true,  // New Screening
                      wg5: true,  // Fleet Status Chart
                      wg6: true,  // Garages Chart
                      wg7: true,  // Bad Drivers Chart
                      wg7a: 5,    // Number of bad drivers to show
                      wg8: true,  // Reminders
                      wg10: true, // Maintenance Status Chart
                      wg10a: '',  // Comma-separated vehicle IDs
                      wg12: true, // Task Status Chart
                      wg13: true, // Available Assets
                      wg14: true, // Asset Status Chart
                      wg15: true, // Asset Availability Chart
                      wg16: true, // Asset Utilization Chart
                      wg17: true, // Predictive & Preventive Maintenance Chart
                      wg20: true, // Good Drivers Chart
                      wg20a: 5,   // Number of good drivers to show
                      wg21: true, // Average Downtime Chart (maintenance hours)
                      wg22: true, // Average Maintenance Cost Chart
                      wg23: true, // In Use Vehicles
                      wg24: true, // In Progress Maintenance Vehicles
                    });

                    //console.log("API response with frequency filter:", filters.frequency, res);

                    if (res && res.length > 0) {
                      setDashboardData(res);

                      // Update Reminders
                      const wgReminders = res.find(
                        (item) => item.wgReminders !== undefined
                      )?.wgReminders;
                      if (wgReminders) updateReminders(wgReminders);

                      // Update Vehicle Statuses
                      const wgFleetStatusChart = res.find(
                        (item) => item.wgFleetStatusChart !== undefined
                      )?.wgFleetStatusChart;
                      if (wgFleetStatusChart) updateVehicleStatuses(wgFleetStatusChart);

                      // Update Garages Chart
                      const wgGaragesChart = res.find(
                        (item) => item.wgGaragesChart !== undefined
                      )?.wgGaragesChart;
                      if (wgGaragesChart) updateGaragesChart(wgGaragesChart);

                      // Update Asset Status Chart (Non-Powered Equipment)
                      const assetStatusData = res.find(
                        (item) => item.wgAssetStatusChart !== undefined
                      )?.wgAssetStatusChart;
                      if (assetStatusData) updateAssetStatuses(assetStatusData);

                      // Update Task Status Chart
                      const wgTaskStatusChart = res.find(
                        (item) => item.wgTaskStatusChart !== undefined
                      )?.wgTaskStatusChart;
                      if (wgTaskStatusChart) generateChartOptions(wgTaskStatusChart);
                    }
                  } catch (error) {
                    console.error('Error fetching filtered data:', error);
                    toast.error('Error loading dashboard data');
                  } finally {
                    //setLoading(false);
                  }
                };

                fetchFilteredData();
              }}
            />
          </div>

          {/* Action Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMenuOpen(e);
            }}
            className="bg-white w-[43px] h-[43px] rounded-full shadow-md flex items-center justify-center"
          >
            <AddIcon />
          </button>
        </div>

        {/* Menu for options */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            style: {
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              marginTop: '8px',
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              toggleEditMode();
            }}
            style={{ padding: '10px 16px', minWidth: '150px' }}
          >
            {isEditMode ? i18n.t('Save Layout') : i18n.t('Edit Layout')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              handleDialogOpen();
            }}
            style={{ padding: '10px 16px' }}
          >
            {i18n.t('Add Widget')}
          </MenuItem>
        </Menu>

        {/* Dialog for selecting widgets */}
        <Dialog
          open={dialogOpen}
          onClose={handleDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Select Widgets
            </Typography>
          </DialogTitle>
          <DialogContent sx={{
            '&::-webkit-scrollbar': { display: 'none' },
            'msOverflowStyle': 'none',
            'scrollbarWidth': 'none',
            'overflowY': 'scroll'
          }}>
            <List>
              {layout
                .filter((item) => !item.static)
                .map((item) => {
                  const info = widgetInfo[item.i] || {
                    title: item.i.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                    description: "Dashboard widget"
                  };

                  return (
                    <ListItem
                      key={item.i}
                      onClick={() => handleCheckboxChange(item.i)}
                      sx={{
                        borderRadius: '8px',
                        mb: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.04)'
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={item.visible}
                          tabIndex={-1}
                          disableRipple
                          color="primary"
                        />
                      </ListItemIcon>
                      <div>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {info.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {info.description}
                        </Typography>
                      </div>
                    </ListItem>
                  );
                })}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSave} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 relative">
        {/* Render the custom CSS styles */}
        <StyledCSS />

        {/* Edit mode indicator */}
        {isEditMode && (
          <>
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center">
              <span className="mr-2">📏</span>
              <span className="font-medium">{i18n.t('Edit Mode')} - {i18n.t('Drag and resize widgets')}</span>
            </div>

            {/* Animated helper that shows how to interact with widgets */}
            <div className="fixed bottom-5 right-5 z-50 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
              <div className="mb-2 font-medium text-gray-800">{i18n.t('Tip')}:</div>
              <div className="flex items-center mb-2">
                <DragIndicatorIcon className="mr-2" />
                <span>{i18n.t('Drag from the icon to reposition')}</span>
              </div>
              <div className="flex items-center">
                <svg width="20" height="20" viewBox="0 0 24 24" className="mr-2">
                  <path d="M22 22H2V2h20v20zM3 3v18h18V3H3z" fill="#666" />
                  <path d="M18 18l-4-4 4 4z" fill="#666" />
                  <path d="M18 14v4h-4 4z" fill="#666" />
                </svg>
                <span>{i18n.t('Drag from the corner to resize')}</span>
              </div>
            </div>
          </>
        )}
        <div className="col-span-12">
          <div ref={gridContainerRef} className={`w-full h-full ${isEditMode ? 'edit-mode' : ''}`}>
            <ResponsiveGridLayout
              className="layout"
              layouts={{ lg: layout }}
              breakpoints={{ lg: 1024, md: 768, sm: 640 }}
              cols={{ lg: 5, md: 3, sm: 2 }}
              width={gridWidth}
              rowHeight={110} // Adjust row height
              isResizable={isEditMode}
              isDraggable={isEditMode}
              onLayoutChange={(newLayout) => {
                //console.log("newLayout =", newLayout);
                setLayout((prevLayout) =>
                  prevLayout.map((item) => {
                    const updatedItem = newLayout.find((nl) => nl.i === item.i);
                    return updatedItem ? { ...item, ...updatedItem } : item;
                  })
                );
              }}
              draggableHandle=".drag-handle" // Handle for dragging
            >
              {layout
                .filter((item) => item.visible) // Only render visible widgets
                .map((item) => (
                  <div key={item.i} data-grid={item} className="relative">
                    {/* Delete button - only visible in edit mode */}
                    {isEditMode && (
                      <div className="absolute top-2 right-2 z-50">
                        <IconButton
                          onClick={() => handleCheckboxChange(item.i)}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            width: '28px',
                            height: '28px',
                          }}
                          title="Remove widget"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </IconButton>
                      </div>
                    )}
                    {/* Available Vehicles */}
                    {item.i === 'availableVehicles' && (
                      <ChartWrapper>
                        <div
                          className="flex items-center cursor-pointer w-full h-full"
                          onClick={(e) => {
                            if (!isEditMode) {
                              navigate('/fleet-management'); // Only navigate when isEditMode is false
                            }
                          }}
                        >
                          {/* Drag Handle (only visible when not static) */}
                          {isEditMode && (
                            <div className="absolute bottom-2 right-2 drag-handle cursor-grab">
                              <DragIndicatorIcon
                                style={{ fontSize: '24px', color: 'gray' }}
                              />
                            </div>
                          )}

                          {/* Icon */}
                          <div className="cornerCut cornerCut-large">
                            <DirectionsCarIcon
                              style={{ fontSize: '24px', color: '#000' }}
                            />
                          </div>

                          {/* Text Content */}
                          <div className="ml-4">
                            <h2 style={{ fontSize: '14px' }}>
                              {i18n.t('Available Vehicles')}
                            </h2>

                            <div className="flex items-center">
                              {(() => {
                                const item = dashboardData.find(
                                  (item) => item.wgAvailableVehicles !== undefined
                                );
                                return item && item.wgAvailableVehicles && item.wgAvailableVehicles > 0 ? (
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
                      </ChartWrapper>
                    )}


                    {/* Available Asset */}
                    {item.i === 'availableAssets' && (
                      <ChartWrapper>
                        <div
                          className="flex items-center cursor-pointer w-full h-full"
                          onClick={(e) => {
                            if (!isEditMode) {
                              navigate('/fleet-management'); // Only navigate when isEditMode is false
                            }
                          }}
                        >
                          {/* Drag Handle (only visible when not static) */}
                          {isEditMode && (
                            <div className="absolute bottom-2 right-2 drag-handle cursor-grab">
                              <DragIndicatorIcon
                                style={{ fontSize: '24px', color: 'gray' }}
                              />
                            </div>
                          )}

                          {/* Icon */}
                          <div className="cornerCut cornerCut-large">
                            <Package
                              style={{ fontSize: '24px', color: '#000' }}
                            />
                          </div>

                          {/* Text Content */}
                          <div className="ml-4">
                            <h2 style={{ fontSize: '14px' }}>
                              {i18n.t('Available Assets')}
                            </h2>

                            <div className="flex items-center">
                              {(() => {
                                const item = dashboardData.find(
                                  (item) => item.wgAvailableAssets !== undefined
                                );
                                return item && item.wgAvailableAssets && item.wgAvailableAssets > 0 ? (
                                  <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-1 text-sm">
                                    {item.wgAvailableAssets}
                                  </span>
                                ) : (
                                  <p className="text-2xl font-bold">0</p>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </ChartWrapper>
                    )}

                    {/* In Use Vehicles Powered Equipment */}
                    {item.i === 'inUseVehicles' && (
                      <ChartWrapper>
                        <div
                          className="flex items-center cursor-pointer w-full h-full"
                          onClick={(e) => {
                            if (!isEditMode) {
                              navigate('/fleet-management'); // Only navigate when isEditMode is false
                            }
                          }}
                        >
                          {/* Drag Handle (only visible when not static) */}
                          {isEditMode && (
                            <div className="absolute bottom-2 right-2 drag-handle cursor-grab">
                              <DragIndicatorIcon
                                style={{ fontSize: '24px', color: 'gray' }}
                              />
                            </div>
                          )}

                          {/* Icon */}
                          <div className="cornerCut cornerCut-large">
                            <DirectionsCarIcon
                              style={{ fontSize: '24px', color: '#000' }}
                            />
                          </div>

                          {/* Text Content */}
                          <div className="ml-4">
                            <h2 style={{ fontSize: '14px' }}>
                              {i18n.t('In Use Vehicles')}
                            </h2>

                            <div className="flex items-center">
                              {(() => {
                                const item = dashboardData.find(
                                  (item) => item.wgInUseVehicles !== undefined
                                );
                                return item && item.wgInUseVehicles && item.wgInUseVehicles > 0 ? (
                                  <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-1 text-sm">
                                    {item.wgInUseVehicles}
                                  </span>
                                ) : (
                                  <p className="text-2xl font-bold">0</p>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </ChartWrapper>
                    )}

                    {/* Maintenance Vehicles */}
                    {item.i === 'maintenanceVehicles' && (
                      <ChartWrapper>
                        <div
                          className="flex items-center cursor-pointer w-full h-full"
                          onClick={(e) => {
                            if (!isEditMode) {
                              navigate('/maintenance/work-order'); // Only navigate when isEditMode is false
                            }
                          }}
                        >
                          {/* Drag Handle (only visible when not static) */}
                          {isEditMode && (
                            <div className="absolute bottom-2 right-2 drag-handle cursor-grab">
                              <DragIndicatorIcon
                                style={{ fontSize: '24px', color: 'gray' }}
                              />
                            </div>
                          )}

                          {/* Icon */}
                          <div className="cornerCut cornerCut-large">
                            <WarningIcon
                              style={{ fontSize: '24px', color: '#000' }}
                            />
                          </div>

                          {/* Text Content */}
                          <div className="ml-4">
                            <h2 style={{ fontSize: '14px' }}>
                              {i18n.t('Maintenance Vehicles')}
                            </h2>

                            <div className="flex items-center">
                              {(() => {
                                const item = dashboardData.find(
                                  (item) => item.wgInProgressMaintenances !== undefined
                                );
                                return item && item.wgInProgressMaintenances && item.wgInProgressMaintenances > 0 ? (
                                  <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-1 text-sm">
                                    {item.wgInProgressMaintenances}
                                  </span>
                                ) : (
                                  <p className="text-2xl font-bold">0</p>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </ChartWrapper>
                    )}

                    {/* New Reservations */}
                    {item.i === 'newReservations' && (
                      <ChartWrapper>
                        <div
                          className="flex items-center cursor-pointer w-full h-full"
                          onClick={(e) => {
                            if (!isEditMode) {
                              navigate('/orders'); // Only navigate when isEditMode is false
                            }
                          }}
                        >
                          {/* Drag Handle (only visible when not static) */}
                          {isEditMode && (
                            <div className="absolute bottom-2 right-2 drag-handle cursor-grab">
                              <DragIndicatorIcon
                                style={{ fontSize: '24px', color: 'gray' }}
                              />
                            </div>
                          )}

                          {/* Icon */}
                          <div className="cornerCut cornerCut-large">
                            <EventAvailableIcon />
                          </div>

                          {/* Text Content */}
                          <div className="ml-4">
                            <h2 style={{ fontSize: '15px' }}>
                              {i18n.t('New Reservations')}
                            </h2>
                            <div className="flex items-center">
                              {(() => {
                                const item = dashboardData.find(
                                  (item) => item.wgNewReservations !== undefined
                                );
                                return item && item.wgNewReservations && item.wgNewReservations > 0 ? (
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
                      </ChartWrapper>
                    )}

                    {/* New Screening */}
                    {item.i === 'newScreening' && (
                      <ChartWrapper>
                        <div
                          className="flex items-center cursor-pointer w-full h-full"
                          onClick={(e) => {
                            if (isEditMode) {
                              e.preventDefault(); // Prevent click action if in edit mode
                            } else {
                              navigate('/operations/screening-logs'); // Only navigate when isEditMode is false
                            }
                          }}
                        >
                          {/* Drag Handle (only visible when not static) */}
                          {isEditMode && (
                            <div className="absolute bottom-2 right-2 drag-handle cursor-grab">
                              <DragIndicatorIcon
                                style={{ fontSize: '24px', color: 'gray' }}
                              />
                            </div>
                          )}

                          {/* Icon */}
                          <div className="cornerCut cornerCut-large">
                            <DocumentScannerIcon />
                          </div>

                          {/* Text Content */}
                          <div className="ml-4">
                            <h2 style={{ fontSize: '15px' }}>
                              {i18n.t('New Screening')}
                            </h2>
                            <div className="flex items-center">
                              {(() => {
                                const item = dashboardData.find(
                                  (item) => item.wgNewScreening !== undefined
                                );
                                return item && item.wgNewScreening && item.wgNewScreening > 0 ? (
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
                      </ChartWrapper>
                    )}

                    {/* Map */}

                    {item.i === 'map' && (
                      <ChartWrapper >
                        {/* Drag Handle (only visible when not static) */}
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        {loading ? (
                          <LoadingScreen label="Loading Map" />
                        ) : (
                          // <MapWithGarages />
                          <MapWithGaragesVehicles />
                        )}
                      </ChartWrapper>
                    )}

                    {/* Live Metrics */}
                    {item.i === 'liveMetrics' && (
                      <ChartWrapper>
                        {/* Drag Handle (only visible when not static) */}
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        <TopVehicleStatsChart />
                      </ChartWrapper>
                    )}

                    {/* Vehicle Status */}
                    {/* Powered (Driven) Equipment  */}
                    {item.i === 'vehicleStatus' && (
                      <ChartWrapper
                        key="vehicleStatus"
                        className="p-4 rounded-xl drag-handle  w-full h-full"
                      >
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        <Typography variant="h5" sx={{ fontSize: '20px', fontWeight: 600, color: '#374151' }}>
                          {i18n.t('Vehicles ')}
                        </Typography>
                        <StatusChart name="Vehicle" data={vehicleStatuses} />
                      </ChartWrapper>
                    )}

                    {/* Assets Status */}
                    {/* Non-Powered Equipment */}
                    {item.i === 'calloutAssetStatus' && (
                      <ChartWrapper
                        key="calloutAssetStatus"
                        className="p-4 rounded-xl drag-handle  w-full h-full"
                      >
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        <Typography variant="h5" sx={{ fontSize: '20px', fontWeight: 600, color: '#374151' }}>
                          {i18n.t('Assets')}
                        </Typography>
                        <StatusChart name="Callout Assets" data={AssetStatuses} />
                      </ChartWrapper>
                    )}

                    {/* Garages */}
                    {/* {item.i === 'garages' && (
                      <ChartWrapper>
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        <Typography
                          sx={{ fontWeight: 'bold', fontSize: '20px' }}
                        >
                          Garages
                        </Typography>
                        <GarageChart garages={garagesWithCount} />
                      </ChartWrapper>
                    )} */}

                    {/* Driver Behavior */}
                    {item.i === 'driverBehavior' && (
                      <ChartWrapper>
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        <Suspense fallback={<>Loading Driver Behaviour...</>}>
                          <DriverBehaviour filters={dashboardFilters} />
                        </Suspense>
                      </ChartWrapper>
                    )}

                    {/* Reminders */}
                    {item.i === 'reminders' && (
                      <ChartWrapper>
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        <Typography
                          sx={{ fontWeight: 'bold', fontSize: '20px' }}
                        >
                          Reminders
                        </Typography>
                        <div className="h-96 mt-6 overflow-y-auto">
                          <div className="flex flex-col space-y-4">
                            {reminders.map((reminder, index) => (
                              <div
                                key={index}
                                className="border p-4 rounded-xl flex justify-between items-center hover:bg-slate-300 cursor-pointer"
                                onClick={(e) => {
                                  if (isEditMode) {
                                    e.preventDefault(); // Prevent click action if in edit mode
                                  } else {
                                    navigate(reminder.route); // Only navigate when isEditMode is false
                                  }
                                }}
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
                      </ChartWrapper>
                    )}

                    {/* Maintenance Status */}
                    {item.i === "maintenanceStatus" && (
                      <div className="border p-4 rounded-xl drag-handle w-full h-full">
                        {" "}
                        {/* Drag Handle (only visible when not static) */}
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: "24px", color: "gray" }}
                            />
                          </div>
                        )}
                        <Typography sx={{ fontWeight: "bold", fontSize: "20px" }}>
                          {i18n.t("Maintenance Status")}
                        </Typography>
                        <StatusChart name="Maintenance" data={maintenanceStatuses} />
                      </div>
                    )}

                    {/* Bill Status */}
                    {item.i === 'billStatus' && (
                      <ChartWrapper>
                        {/* Drag Handle (only visible when not static) */}
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        <BillStatusChart showFilter={true} />
                      </ChartWrapper>
                    )}

                    {/* Task Status */}
                    {item.i === 'taskStatus' && (
                      <ChartWrapper>
                        {/* Drag Handle (only visible when not static) */}
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        {/* Title */}
                        <Typography
                          sx={{
                            fontWeight: 'bold',
                            fontSize: '20px',
                            textAlign: 'center',
                            marginBottom: '1rem',
                          }}
                        >
                          Request Status Chart
                        </Typography>
                        {/* Chart and Options Container */}
                        <div className="flex">
                          {/* List of Chart Options (50% width) */}
                          <div className="w-1/2 pl-2 flex items-center justify-center">
                            <ul className="list-none space-y-2">
                              {Object.keys(chartOptions).map((option) => (
                                <li
                                  key={option}
                                  className={`p-2 rounded-md cursor-pointer border ${selectedTaskChart === option
                                    ? 'bg-[#0A1224] text-white'
                                    : 'bg-gray-100 text-gray-700'
                                    }`}
                                  onClick={() =>
                                    setSelectedTaskChart(
                                      option as keyof typeof chartOptions
                                    )
                                  }
                                >
                                  {option
                                    .replace('_', ' ')
                                    .toLowerCase()
                                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* StatusChart Component (50% width) */}
                          <div className="w-1/2 pr-2">
                            <StatusChart
                              name={selectedTaskChart
                                .replace('_', ' ')
                                .toLowerCase()
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                              data={chartOptions[selectedTaskChart]}
                            />
                          </div>
                        </div>
                      </ChartWrapper>
                    )}

                    {/* Performance new dashboard element template */}
                    {/* {item.i === 'performance' && (
                      <ChartWrapper>
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        <LockedFeature featureName="Performance" />
                      </ChartWrapper>
                    )} */}

                    {/* Asset Utilization Chart */}
                    {item.i === 'assetUtilization' && (
                      <ChartWrapper className="drag-handle">
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 z-10 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        <AssetUtilizationChart filters={dashboardFilters} />
                      </ChartWrapper>
                    )}

                    {/* Asset Availability Chart */}
                    {item.i === 'assetAvailability' && (
                      <ChartWrapper className="drag-handle">
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 z-10 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        <AssetAvailabilityChart filters={dashboardFilters} />
                      </ChartWrapper>
                    )}

                    {/* Asset Idle Rate Chart */}
                    {item.i === 'assetIdleRate' && (
                      <ChartWrapper className="drag-handle">
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 z-10 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        <AssetIdleRateChart filters={dashboardFilters} />
                      </ChartWrapper>
                    )}

                    {/* Asset Tracker Widget */}
                    {item.i === 'assetTracker' && (
                      <ChartWrapper className="drag-handle">
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 z-10 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        <AssetTrackerWidget filters={dashboardFilters} />
                      </ChartWrapper>
                    )}

                    {/* Top Performing Drivers */}
                    {item.i === 'topPerformingDrivers' && (
                      <ChartWrapper className="drag-handle">
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 z-10 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        <Suspense fallback={<>Loading Top Performing Drivers...</>}>
                          <TopPerformingDrivers filters={dashboardFilters} />
                        </Suspense>
                      </ChartWrapper>
                    )}


                    {/* Incidents Chart */}
                    {item.i === 'incidents' && (
                      <ChartWrapper className="drag-handle">
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 z-10 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        <IncidentsChart filters={dashboardFilters} showFilter={true} />
                      </ChartWrapper>
                    )}

                    {/* Maintenance Cost Chart */}
                    {item.i === 'maintenanceCost' && (
                      <ChartWrapper className="drag-handle">
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 z-10 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        <MaintenanceCostChart />
                      </ChartWrapper>
                    )}

                    {/* Maintenance Downtime Chart */}
                    {item.i === 'maintenanceDowntime' && (
                      <ChartWrapper className="drag-handle">
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 z-10 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        <MaintenanceDowntimeChart filters={dashboardFilters} />
                      </ChartWrapper>
                    )}

                    {/* Maintenance Cost Area Chart */}
                    {item.i === 'maintenanceCostArea' && (
                      <ChartWrapper className="drag-handle">
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 z-10 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        <MaintenanceCostAreaChart filters={dashboardFilters} />
                      </ChartWrapper>
                    )}



                    {/* Preventive & Predictive Maintenance */}
                    {item.i === 'preventivePredictive' && (
                      <ChartWrapper className="drag-handle">
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 z-10 drag-handle cursor-grab">
                            <DragIndicatorIcon
                              style={{ fontSize: '24px', color: 'gray' }}
                            />
                          </div>
                        )}
                        <div className="flex flex-col h-full">
                          {/* Header */}
                          <div>

                            <div className="flex justify-between items-center">
                              <Typography variant="h5" sx={{ fontSize: '28px', fontWeight: 600, color: '#374151' }}>
                                Maintenance Type
                              </Typography>
                              <IconButton aria-label="info" size="small">
                                <InfoIcon sx={{ color: '#9DA4AE' }} />
                              </IconButton>
                            </div>

                            {/* Asset Filter */}
                            {/* <Select
                              value="All Assets"
                              displayEmpty
                              sx={{
                                width: '200px',
                                height: '36px',
                                backgroundColor: '#E5E7EB',
                                borderRadius: '8px',
                                '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                                marginBottom: '16px'
                              }}
                            >
                              <MenuItem value="All Assets">All Assets</MenuItem>
                              <MenuItem value="Vehicles">Vehicles</MenuItem>
                              <MenuItem value="Equipment">Equipment</MenuItem>
                            </Select> */}
                          </div>

                          {/* Chart */}
                          <div className="flex-grow" style={{ height: '180px' }}>
                            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}>
                                {(() => {
                                  // Get the data from the API
                                  const item = dashboardData.find(
                                    (item) => item.wgPredictiveAndPreventiveChart !== undefined
                                  );

                                  // Default values if data is not available
                                  const preventivePercent = item?.wgPredictiveAndPreventiveChart?.preventive_maintenance_percent || 0;
                                  const predictivePercent = item?.wgPredictiveAndPreventiveChart?.predictive_maintenance_percent || 0;

                                  // Calculate the total for the conic gradient
                                  const total = preventivePercent + predictivePercent;
                                  const preventiveAngle = (preventivePercent / total) * 100;

                                  return (
                                    <div style={{
                                      width: '160px',
                                      height: '160px',
                                      borderRadius: '50%',
                                      overflow: 'hidden',
                                      position: 'relative'
                                    }}>
                                      <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        background: `conic-gradient(#30C7C7 0% ${preventiveAngle}%, #FFCA8A ${preventiveAngle}% 100%)`
                                      }}></div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>

                          {/* Legend */}
                          <div className="mt-4">
                            <div className="flex items-center mb-2">
                              <div
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: '#30C7C7' }}
                              />
                              <Typography className="flex-grow" sx={{ color: '#6B7280' }}>
                                Preventive Maintenance
                              </Typography>
                              <Typography sx={{ fontWeight: 'bold', fontSize: '18px' }}>
                                {(() => {
                                  const item = dashboardData.find(
                                    (item) => item.wgPredictiveAndPreventiveChart !== undefined
                                  );
                                  return `${item?.wgPredictiveAndPreventiveChart?.preventive_maintenance_percent || 0}%`;
                                })()}
                              </Typography>
                            </div>
                            <div className="flex items-center">
                              <div
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: '#FFCA8A' }}
                              />
                              <Typography className="flex-grow" sx={{ color: '#6B7280' }}>
                                Predictive Maintenance
                              </Typography>
                              <Typography sx={{ fontWeight: 'bold', fontSize: '18px' }}>
                                {(() => {
                                  const item = dashboardData.find(
                                    (item) => item.wgPredictiveAndPreventiveChart !== undefined
                                  );
                                  return `${item?.wgPredictiveAndPreventiveChart?.predictive_maintenance_percent || 0}%`;
                                })()}
                              </Typography>
                            </div>
                          </div>
                        </div>
                      </ChartWrapper>
                    )}


                  </div>
                ))}
            </ResponsiveGridLayout>
          </div>
        </div>
      </div>
    </>
  );
};
