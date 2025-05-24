import React, { useEffect, useState } from 'react';
import PageMeta from '@/components/common/PageMeta';
import { useParams, useNavigate } from 'react-router';
// import axiosInstance from '../../../utils/axiosConfig'; // Commented out for demo mode
import socketService from '../../../Socket';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import car_model from '/src/assets/car_models/car_model_1_big.png';
import SpeedChart from './telematics_charts/SpeedChart';
import FuelLevelIndicator from './telematics_charts/FuelChart';
import TripRangeChart from './telematics_charts/TripRangeChart';
import TirePressureChart from './telematics_charts/TirePressureChart';
import VehicleInfoTabs from './VehicleInfoTabs';
import MapWithPulsatingMarker from '../utils/MapWithPulsatingMarker';
import AddVehicleModal from './Modals/ManualAddVehicleModal';
import VehicleStatusModal from './Modals/VehicleStatusModal';
import { toast } from 'react-toastify';
import qs from 'qs';
import type { IDevice } from '../../core/interfaces/interfaces';
import {
  uploadVehicleCoverImage,
  requestImmobilizer,
  requestSpeedControl,
} from '../apis/apis';
import speedIcon from '/src/assets/speed.svg';
import lockIcon from '/src/assets/lock.svg';
import { systemPlan, systemModule } from '@/utils/constants';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import {
  ChevronLeft,
  ChevronLeftIcon,
  ChevronRight,
  CircleDot,
  CloudUpload,
  Copy,
  CornerUpLeft,
  EditIcon,
  EllipsisVertical,
  Fuel,
  Gauge,
  RotateCcwIcon,
  Waypoints,
  X,
} from 'lucide-react';
import LockedFeature from './LockedFeature';
import Error404Page from '@/modules/core/pages/Error404Page';
import { MaintenanceTab } from './MaintenanceTab';
import { PicturesTab } from './PicturesTab';
import { DocumentsTab } from './DocumentsTabs';
import { InspectionTab } from './InspectionTab';
import { LogsTab } from './LogsTab';
import { NotesTab } from './NotesTab';
import MapViewMobile from './MapViewMobile';
import SchedulesModal from './SchedulesModal';

const VehicleDetailsPage: React.FC = () => {
  if (!checkModuleExists(systemModule.Fleet)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Fleet" />
    ) : (
      <Error404Page />
    );
  }
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<any>(null);
  const [deviceData, setDeviceData] = useState<any>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [tripRange, setTripRange] = useState<number>(0);
  const [deviceDetails, setDeviceDetails] = useState<IDevice | null>(null);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [openImmobilizer, setOpenImmobilizer] = useState(false);
  const [openSpeedControl, setOpenSpeedControl] = useState(false);
  const [speedValue, setSpeedValue] = useState<number>(50);
  const [mobileView, setMobileView] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleOpenModal = () => setUploadModalOpen(true);
  const handleCloseModal = () => setUploadModalOpen(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(event); // Use your existing handler
    handleCloseModal(); // Close the modal after file selection
  };

  const handleVehicleStatusUpdate = () => {
    setStatusModalOpen(true);
  };

  const handleStatusUpdateSubmit = async (status: string) => {
    try {
      console.log(`[DEMO MODE] Updating vehicle ${vehicle.id} status to ${status}`);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setVehicle((prevVehicle: any) => ({
        ...prevVehicle,
        status,
      }));
      toast.success('Updated the status successfully');
    } catch (error: any) {
      toast.error('Failed to update status in demo mode');
      console.error('Error updating vehicle status:', error);
    }
  };

  const handleVehicleEdit = () => {
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const fetchTripRange = async () => {
    try {
      console.log('[DEMO MODE] fetchTripRange - returning demo data');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Demo analytics data
      const data: { vehicleId: number; totalKmDriven: number }[] = [
        { vehicleId: 1, totalKmDriven: 125.5 },
        { vehicleId: 2, totalKmDriven: 89.2 },
        { vehicleId: 3, totalKmDriven: 0 }
      ];
      
      const vehicleId = id ? Number.parseInt(id, 10) : null;
      if (vehicleId === null) {
        console.error('Vehicle ID is missing.');
        return;
      }
      const vehicleData = data.find((item) => item.vehicleId === vehicleId);
      const totalKmDriven = vehicleData ? vehicleData.totalKmDriven : 0;
      setTripRange(totalKmDriven);
    } catch (error) {
      console.error('Error fetching trip range:', error);
    }
  };

  useEffect(() => {
    setSpeedValue(50);
  }, []);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        console.log(`[DEMO MODE] fetchVehicleDetails for vehicle ${id}`);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Demo vehicle data
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
        
        const vehicleData = demoVehicles.find(v => v.id === Number(id));
        if (vehicleData) {
          setVehicle(vehicleData);
          setSpeedValue(vehicleData?.device?.maxSpeed);
        }
      } catch (error) {
        console.error('Error fetching vehicle details:', error);
      }
    };
    fetchTripRange();
    fetchVehicleDetails();
  }, [id]);

  useEffect(() => {
    const fetchDeviceDetails = async (id: string) => {
      try {
        console.log(`[DEMO MODE] fetchDeviceDetails for vehicle ${id}`);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Demo device data
        const demoDevice = {
          id: Number(id),
          deviceId: `DEV00${id}`,
          deviceName: `Vehicle Tracker ${id}`,
          deviceProtocol: 'TCP',
          ident: `IDENT${id}`,
          type: 'GPS',
          status: 'Active',
          odometer: '45000',
          metadata: {},
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        };
        
        setDeviceDetails(demoDevice);
        console.log('[DEMO MODE] Device details:', demoDevice);

        // Simulate socket connection for demo
        if (demoDevice && demoDevice.deviceId) {
          console.log(`[DEMO MODE] Simulating socket subscription for device ${demoDevice.deviceId}`);
          
          // Simulate periodic device updates
          const interval = setInterval(() => {
            const mockDeviceData = {
              latitude: -79.3832 + (Math.random() - 0.5) * 0.01,
              longitude: 43.6532 + (Math.random() - 0.5) * 0.01,
              speed: Math.floor(Math.random() * 80),
              direction: Math.floor(Math.random() * 360),
              fuelLevel: 75 + Math.floor(Math.random() * 25),
              tirePressureFrontLeft: 32 + Math.floor(Math.random() * 5),
              tirePressureFrontRight: 32 + Math.floor(Math.random() * 5),
              tirePressureRearLeft: 32 + Math.floor(Math.random() * 5),
              tirePressureRearRight: 32 + Math.floor(Math.random() * 5),
              timestamp: Date.now()
            };
            setDeviceData(mockDeviceData);
          }, 5000); // Update every 5 seconds
          
          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error('Error fetching device details:', error);
      }
    };

    if (vehicle && vehicle.id) {
      fetchDeviceDetails(vehicle.id.toString());
    }
    return () => {
      console.log('[DEMO MODE] Cleaning up device subscriptions');
    };
  }, [vehicle]);

  const tirePressures = [
    Math.round(deviceData?.tirePressureFrontLeft || 0),
    Math.round(deviceData?.tirePressureFrontRight || 0),
    Math.round(deviceData?.tirePressureRearLeft || 0),
    Math.round(deviceData?.tirePressureRearRight || 0),
  ];

  if (!vehicle) {
    return <p className="text-base">Loading vehicle details...</p>;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]; // Get the uploaded file

    if (uploadedFile) {
      try {
        // Convert the file to base64
        const imageBase64 = await toBase64(uploadedFile) as string;
        const response = await uploadVehicleCoverImage(
          vehicle.id,
          imageBase64.replace(/^data:image\/\w+;base64,/, '')
        );
        console.log('Upload successful:', response);
        setVehicle((prevVehicle: any) => ({
          ...prevVehicle,
          coverImage: response.data.coverImageUrl,
        }));
        toast.success('Image uploaded');
      } catch (error) {
        toast.error('Failed to upload image');
        console.error('Failed to process image:', error);
      }
    }
  };

  const toBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // Function to open the dialog with a specific message
  const handleImmobilizerClick = () => {
    setOpenImmobilizer(true); // Open the dialog
  };

  // Function to handle the Cancel action
  const handleImmobilizerClose = () => {
    setOpenImmobilizer(false); // Close the dialog
  };

  // Function to handle the Confirm action
  const handleImmobilizerConfirm = async () => {
    try {
      await requestImmobilizer(
        vehicle.id,
        vehicle.device?.immobilizer ? false : true
      );
      setOpenImmobilizer(false); // Close the dialog
      toast.success('Requested the Immobilizer successfully');
    } catch (error: any) {
      toast.error(error.data.message);
      console.error('Error requesting vehicle Immobilizer:', error);
    }
  };

  // Function to open the dialog with a specific message
  const handleSpeedControlClick = () => {
    setOpenSpeedControl(true); // Open the dialog
  };

  // Function to handle the Cancel action
  const handleSpeedControlClose = () => {
    setOpenSpeedControl(false); // Close the dialog
  };

  // Function to handle the Confirm action
  const handleSpeedControlConfirm = async () => {
    try {
      await requestSpeedControl(vehicle.id, speedValue);
      setOpenSpeedControl(false); // Close the dialog
      toast.success('Requested the Speed Control successfully');
    } catch (error: any) {
      toast.error(error.data.message);
      console.error('Error requesting vehicle Speed Control:', error);
    }
  };

  return (
    <>
      <PageMeta
        title="Fleet | Synops AI"
        description="This is Fleet page for Synops AI"
      />

      {/* Mobile View */}
      {isMobile && (
        <div className="flex flex-col bg-white h-full">
          {/* Header */}
          <div className="p-4 flex flex-none items-center justify-between border-b border-gray-200">
            {mobileView ? (
              <div className="flex items-center">
                <button
                  className="flex gap-1"
                  onClick={() => setMobileView(null)}
                >
                  <CornerUpLeft className="h-5 w-5" />
                  <h2 className="text-lg font-medium ml-2">Back</h2>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate('/fleet-management')}>
                    <ChevronLeftIcon className="h-7 w-7" />
                  </button>
                  <h2 className="text-lg font-semibold">
                    {vehicle.make} {vehicle.model}
                  </h2>
                  <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded ml-2">
                    #{vehicle.id}
                  </span>
                </div>
                <span className="bg-green-100 text-green-600 text-sm px-2 py-1 rounded ml-2">
                  Available
                </span>
              </>
            )}
          </div>

          {/* Mobile View Content */}
          {mobileView ? (
            <div className="h-full">
              {mobileView === 'schedule' && (
                <SchedulesModal vehicle={vehicle} />
              )}

              {mobileView === 'maintenance' && (
                <div className="p-4">
                  <MaintenanceTab vehicle={vehicle} />
                </div>
              )}

              {mobileView === 'inspection' && (
                <div className="p-4">
                  <InspectionTab vehicle={vehicle} />
                </div>
              )}

              {mobileView === 'pictures' && (
                <div className="p-4">
                  <PicturesTab vehicle={vehicle} />
                </div>
              )}

              {mobileView === 'documents' && (
                <div className="p-4">
                  <DocumentsTab vehicle={vehicle} />
                </div>
              )}

              {mobileView === 'logs' && (
                <div className="p-4">
                  <LogsTab vehicle={vehicle} />
                </div>
              )}

              {mobileView === 'notes' && (
                <div className="p-4">
                  <NotesTab vehicle={vehicle} />
                </div>
              )}

              {mobileView === 'vehicle-location' && (
                <MapViewMobile deviceData={deviceData} vehicle={vehicle} />
              )}
            </div>
          ) : (
            <>
              {/* Locate Vehicle Button */}
              <div className="m-4">
                <div className="bg-gray-50 px-2.5 py-4 rounded-lg mb-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      disabled={!deviceData}
                      onClick={() => setMobileView('vehicle-location')}
                      className="w-full flex-1/2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LocationOnIcon className="mr-2 h-5 w-5" />
                      Locate Vehicle
                    </button>
                    <div className="relative flex flex-1/2 items-center justify-end">
                      <button
                        onClick={() => setShowOptionsMenu((prev) => !prev)}
                        className="text-gray-500 hover:bg-gray-100 p-1 rounded-full"
                      >
                        <EllipsisVertical className="h-5 w-5" />
                      </button>
                      {showOptionsMenu && (
                        <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={handleVehicleEdit}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={handleOpenModal}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Upload Photo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vehicle Image */}
                  <div className="mb-4">
                    <img
                      src={vehicle.coverImage || car_model}
                      alt="Vehicle Model"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>

                  {/* Action Buttons */}
                  {vehicle.device?.deviceProtocol == 'Teltonika' && (
                    <div className="flex gap-4">
                      {['FMM650'].includes(
                        vehicle.device?.deviceType || ''
                      ) && (
                        <button
                          className="flex-1 border border-[#0E1F47] py-2 px-4 rounded-full text-[#0E1F47] hover:bg-gray-100 flex items-center justify-center"
                          onClick={() => handleImmobilizerClick()}
                        >
                          <div className="flex items-center">
                            <span className="mr-2">
                              <RotateCcwIcon className="h-5 w-5" />
                            </span>
                            {vehicle.device?.immobilizer
                              ? 'Mobilize'
                              : 'Immobilize'}
                          </div>
                        </button>
                      )}
                      {['FMC920', 'FMM650'].includes(
                        vehicle.device?.deviceType || ''
                      ) && (
                        <button
                          className="flex-1 py-2 px-4 rounded-full text-white bg-[#0E1F47] flex items-center justify-center"
                          onClick={() => handleSpeedControlClick()}
                        >
                          <div className="flex items-center">
                            <span className="mr-2">
                              <Gauge className="h-5 w-5" />
                            </span>
                            Speed Control
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-2.5 py-4 rounded-lg mb-4 border border-gray-100">
                  {/* Equipment Information */}
                  <h3 className="text-lg font-semibold mb-4">
                    Equipment Information
                  </h3>
                  <div>
                    {[
                      { label: 'VIN', value: vehicle.vin },
                      { label: 'Year', value: vehicle.year },
                      { label: 'Color', value: vehicle.color },
                      { label: 'Fuel Type', value: vehicle.fuelType },
                      { label: 'Engine Type', value: vehicle.fuelType },
                      { label: 'Vehicle Body Type', value: vehicle.bodyClass },
                      { label: 'Color', value: vehicle.color },
                      { label: 'Doors', value: vehicle.doors },
                      {
                        label: 'Device Type',
                        value: deviceDetails ? deviceDetails.type : 'N/A',
                      },
                      {
                        label: 'Device Serial Number',
                        value: deviceDetails ? deviceDetails.deviceId : 'N/A',
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className={`flex justify-between py-2 ${
                          index < 9 ? 'border-b border-gray-200' : ''
                        }`}
                      >
                        <span className="text-sm text-gray-500">
                          {item.label}:
                        </span>
                        <div className="flex items-center">
                          {item.label === 'VIN' && (
                            <button
                              className="mr-2"
                              onClick={() => handleCopyToClipboard(vehicle.vin)}
                            >
                              <Copy className="h-5 w-5" />
                            </button>
                          )}
                          <span className="text-sm">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 px-2.5 py-4 rounded-lg mb-4 border border-gray-100">
                  {/* Live Monitoring */}
                  <h3 className="text-lg font-semibold mb-4">
                    Live Monitoring
                  </h3>

                  {/* Current Speed */}
                  <div className="mb-6">
                    {/* <div className="flex items-center mb-2">
                    <div className="w-12 h-12">
                      <SpeedChart speed={deviceData?.speed || 0} />
                    </div>
                    <span className="text-xl ml-4">
                      {deviceData?.speed || 0} km/h
                    </span>
                  </div> */}
                    <div className="flex justify-between mb-2">
                      <div className="flex gap-2 items-center">
                        <Gauge className="w-5 h-5 text-[#2563EB]" />
                        <span className="text-base">Current Speed</span>
                      </div>
                      <span className="text-base">
                        {deviceData?.speed || 0} km/h
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full relative mb-1">
                      <div
                        className="absolute left-0 top-0 h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            (deviceData?.speed || 0) / 2,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">0</span>
                      <span className="text-xs text-gray-500">200 km/h</span>
                    </div>
                  </div>

                  {/* Fuel Level */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <div className="flex gap-2 items-center">
                        <Fuel className="w-5 h-5 text-[#2563EB]" />
                        <span className="text-base">Fuel Level</span>
                      </div>
                      <span className="text-base">
                        {deviceData?.fuelLevel || 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full relative">
                      <div
                        className="absolute left-0 top-0 h-full bg-blue-500 rounded-full"
                        style={{ width: `${deviceData?.fuelLevel || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Daily Trip Range */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <div className="flex gap-2 items-center">
                        <Waypoints className="w-5 h-5 text-[#2563EB]" />
                        <span className="text-base">Daily Trip Range</span>
                      </div>
                      <span className="text-base">{tripRange} km</span>
                    </div>
                  </div>

                  {/* Tire Pressure */}
                  <div className="mb-6">
                    <div className="flex gap-2 items-center mb-4">
                      <CircleDot className="w-5 h-5 text-[#2563EB]" />
                      <span className="text-base">Tire Pressure (KPA)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-100 p-4 rounded-lg text-center">
                        <span className="text-sm text-gray-500 block">
                          Front Left
                        </span>
                        <span className="text-xl text-blue-600">
                          {tirePressures[0] === 0 ? 'N/A' : tirePressures[0]}
                        </span>
                      </div>
                      <div className="bg-gray-100 p-4 rounded-lg text-center">
                        <span className="text-sm text-gray-500 block">
                          Front Right
                        </span>
                        <span className="text-xl text-blue-600">
                          {tirePressures[1] === 0 ? 'N/A' : tirePressures[1]}
                        </span>
                      </div>
                      <div className="bg-gray-100 p-4 rounded-lg text-center">
                        <span className="text-sm text-gray-500 block">
                          Rear Left
                        </span>
                        <span className="text-xl text-blue-600">
                          {tirePressures[2] === 0 ? 'N/A' : tirePressures[2]}
                        </span>
                      </div>
                      <div className="bg-gray-100 p-4 rounded-lg text-center">
                        <span className="text-sm text-gray-500 block">
                          Rear Right
                        </span>
                        <span className="text-xl text-blue-600">
                          {tirePressures[3] === 0 ? 'N/A' : tirePressures[3]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 z-50 mb-6">
                <div className="flex flex-col gap-4">
                  {[
                    { label: 'Schedules', value: 'schedule' },
                    { label: 'Maintenance', value: 'maintenance' },
                    { label: 'Inspection', value: 'inspection' },
                    { label: 'Pictures', value: 'pictures' },
                    { label: 'Documents', value: 'documents' },
                    { label: 'Logs', value: 'logs' },
                    { label: 'Notes', value: 'notes' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      className="w-full py-3 flex items-center justify-between text-gray-700 bg-gray-100 px-4 rounded-lg last:mb-4"
                      onClick={() => setMobileView(item.value)}
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Desktop View - Original Layout */}
      {!isMobile && (
        <div className="flex flex-col md:flex-row gap-4 min-h-screen">
          {/* Left Panel for Vehicle Details */}
          <div className="bg-white rounded-xl p-6 shadow-lg w-full md:w-96 md:min-w-96 md:max-w-96 mb-4 md:mb-0">
            {/* Vehicle Title Section with Upload Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 sm:gap-0">
              <div>
                <h2 className="text-xl font-bold">{vehicle.make}</h2>
                <p className="text-gray-500">{vehicle.model}</p>
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                onClick={handleOpenModal}
              >
                Upload Image
              </button>
            </div>

            {/* Location */}
            <div className="flex items-center mb-4">
              <LocationOnIcon className="mr-2" />
              <span>{vehicle.garage?.name}</span>
            </div>

            <div className="flex items-center justify-start space-x-2 mb-4">
              <span className="text-gray-500">Vehicle Status:</span>
              <span className="font-medium">
                {deviceData?.ignition === false
                  ? 'Parking'
                  : deviceData?.ignition === true &&
                    deviceData?.movement === false
                  ? 'Idling'
                  : deviceData?.ignition === true &&
                    deviceData?.movement === true
                  ? 'Driving'
                  : 'No Device Connected'}
              </span>
            </div>

            {/* Image Placeholder */}
            <div className="mb-6">
              <img
                src={vehicle.coverImage || car_model}
                alt="Vehicle Model"
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>

            {/* Status */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6 flex flex-col">
              {/* Status and Subscription */}
              <div className="flex justify-between items-center mb-4">
                <button
                  className="flex items-center bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-bold cursor-pointer"
                  onClick={handleVehicleStatusUpdate}
                >
                  <FiberManualRecordIcon className="mr-1 h-4 w-4" />
                  {vehicle.status}
                </button>
                <span className="text-sm">Subscription</span>
              </div>

              {/* Immobilize / Speed Control Buttons */}
              {vehicle.device?.deviceProtocol == 'Teltonika' && (
                <div className="flex gap-4">
                  {['FMM650'].includes(vehicle.device?.deviceType || '') && (
                    <button
                      className="flex-1 h-fit border border-[#0E1F47] py-2 px-4 rounded-full text-[#0E1F47] hover:bg-gray-100 flex items-center justify-center"
                      onClick={() => handleImmobilizerClick()}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">
                          <RotateCcwIcon className="h-4 w-4" />
                        </span>
                        {vehicle.device?.immobilizer
                          ? 'Mobilize'
                          : 'Immobilize'}
                      </div>
                    </button>
                  )}
                  {['FMC920', 'FMM650'].includes(
                    vehicle.device?.deviceType || ''
                  ) && (
                    <button
                      className="flex-1 h-fit py-2 px-4 rounded-full text-white bg-[#0E1F47] flex items-center justify-center"
                      onClick={() => handleSpeedControlClick()}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">
                          <Gauge className="h-5 w-5" />
                        </span>
                        <span className="whitespace-nowrap">Speed Control</span>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Vehicle Parameters */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Parameters</h3>
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-full text-sm"
                onClick={handleVehicleEdit}
              >
                Edit
              </button>
            </div>
            <hr className="mb-6" />

            {/* Parameter Grid */}
            <div className="bg-gray-50 rounded-lg p-4">
              {[
                { label: 'VIN', value: vehicle.vin, copyable: true },
                { label: 'Year', value: vehicle.year },
                {
                  label: 'Odometer',
                  value: `${
                    (vehicle.odometer ?? 0) + (vehicle.device?.odometer ?? 0)
                  } km`,
                },
                { label: 'Plate Number', value: vehicle.plateNumber },
                { label: 'Engine Type', value: vehicle.fuelType },
                { label: 'Vehicle Body Type', value: vehicle.bodyClass },
                { label: 'Color', value: vehicle.color },
                { label: 'Doors', value: vehicle.doors },
                {
                  label: 'Device Type',
                  value: deviceDetails ? deviceDetails.type : 'N/A',
                },
                {
                  label: 'Device Serial Number',
                  value: deviceDetails ? deviceDetails.deviceId : 'N/A',
                },
              ].map((item, index) => (
                <React.Fragment key={index}>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-semibold">{item.label}:</span>
                    <div className="flex items-center">
                      {item.copyable && (
                        <button
                          className="mr-2 p-1 hover:bg-gray-200 rounded-full"
                          onClick={() => handleCopyToClipboard(item.value)}
                          title={`Copy ${item.label}`}
                        >
                          <ContentCopyIcon className="h-4 w-4" />
                        </button>
                      )}
                      <span className="text-sm">{item.value}</span>
                    </div>
                  </div>
                  {index < 9 && <hr className="my-1" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex-grow flex flex-col gap-4">
            {/* Top Half with Telematics Data and Map */}
            <div className="flex flex-col lg:flex-row gap-4 w-full">
              <div className="bg-white rounded-lg shadow-md p-4 flex-1 min-h-64">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Live</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Current Speed */}
                  <div className="flex justify-center items-center">
                    <div className="max-w-[150px] max-h-[150px] w-full h-full">
                      <SpeedChart speed={deviceData?.speed || 0} />
                    </div>
                  </div>

                  {/* Current Fuel */}
                  <div className="flex justify-center items-center">
                    <div className="max-w-[120px] max-h-[150px] w-full h-full">
                      <FuelLevelIndicator fuel={deviceData?.fuelLevel || 0} />
                    </div>
                  </div>

                  {/* Daily Trip Range */}
                  <div className="flex justify-center items-center mt-8 sm:mt-12">
                    <div className="max-w-[150px] max-h-[150px] w-full h-full">
                      <TripRangeChart range={tripRange} />
                    </div>
                  </div>

                  {/* Tire Pressure */}
                  <div className="flex justify-center items-center">
                    <div className="max-w-[150px] max-h-[150px] w-full h-full">
                      <TirePressureChart pressures={tirePressures} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md flex-1 w-full h-[300px] sm:h-[350px] flex justify-center items-center overflow-hidden relative m-0 p-0">
                <div className="flex-1 w-full min-h-[350px] sm:min-h-[400px] block">
                  {/* Map with Pulsating Marker */}
                  {deviceData ? (
                    <div className="w-full h-[350px] sm:h-[400px] relative overflow-hidden rounded shadow-md">
                      <MapWithPulsatingMarker
                        latitude={deviceData.latitude || 0}
                        longitude={deviceData.longitude || 0}
                        zoom={12}
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center items-center w-full h-[350px] sm:h-[400px] rounded shadow-md bg-white">
                      <p>No Live Data provided from Provider</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Half for Image Upload */}
            {vehicle.id && <VehicleInfoTabs vehicle={vehicle} />}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Vehicle Image</h3>
              <button
                className="p-1 rounded-full hover:bg-gray-100"
                onClick={handleCloseModal}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drag and drop / click area */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 hover:border-blue-500 cursor-pointer transition-all mb-6"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-blue-500');
                e.currentTarget.classList.add('bg-blue-50');
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-blue-500');
                e.currentTarget.classList.remove('bg-blue-50');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-blue-500');
                e.currentTarget.classList.remove('bg-blue-50');
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const syntheticEvent = {
                    target: {
                      files: e.dataTransfer.files,
                    },
                  } as React.ChangeEvent<HTMLInputElement>;
                  handleFileSelect(syntheticEvent);
                }
              }}
              onClick={() =>
                document.getElementById('vehicle-image-input')?.click()
              }
            >
              <div className="flex flex-col items-center gap-2">
                <CloudUpload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-gray-800 font-medium">
                  Drag and drop your image here
                </p>
                <p className="text-gray-500 text-sm">
                  or click to browse files
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Supports: JPG, PNG, WEBP
                </p>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              id="vehicle-image-input"
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog for Immobilizer */}
      {openImmobilizer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
            <p className="mb-6">
              Are you sure to start{' '}
              {vehicle.device?.immobilizer ? 'mobilize' : 'immobilize'} the
              vehicle
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={handleImmobilizerClose}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleImmobilizerConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog for Speed Control */}
      {openSpeedControl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
            <p className="mb-4">
              Are you sure to start speed control on the vehicle
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Set Max Speed (KM/h) (1-160)
              </label>
              <input
                type="number"
                min="1"
                max="160"
                value={speedValue}
                onChange={(e) => {
                  let value = Number(e.target.value);

                  if (isNaN(value)) {
                    value = 1;
                  }

                  if (value < 1) {
                    value = 1;
                  } else if (value > 160) {
                    value = 160;
                  }

                  setSpeedValue(value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={handleSpeedControlClose}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleSpeedControlConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModalOpen && (
        <VehicleStatusModal
          open={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          currentStatus={vehicle.status}
          onUpdateStatus={handleStatusUpdateSubmit}
        />
      )}

      {isEditModalOpen && (
        <AddVehicleModal
          open={isEditModalOpen}
          onClose={closeEditModal}
          vehicleData={vehicle}
        />
      )}
    </>
  );
};

export default VehicleDetailsPage;
