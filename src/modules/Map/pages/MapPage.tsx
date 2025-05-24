import type React from 'react';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import PageMeta from '@/components/common/PageMeta';
import { getVehicleStatus } from '@/modules/Map/utils/getVehicleStatus';
import { getStatusColor } from '@/modules/Map/utils/getStatusColor';
import { getRouteHistory, getVehiclesWithDeviceData } from '../apis/apis';
import { fetchAlert } from '../../core/apis/apis';
import VehicleDetails from '../components/VehicleDetails';
import type {
  IVehicle,
  ITrip,
  IRouteHistoryData,
} from '../../core/interfaces/interfaces';

import type { INotification } from '../../core/interfaces/interfaces';
import socketService from '../../../Socket';
import { useVehicleLocationUpdates } from '../hooks/useVehicleLocationUpdates';
import Button from '../../core/components/ThemeButton';
import VehicleItems from '../components/VehicleItems';
import {
  Commute,
  DirectionsCar as DirectionsCarIcon,
  Timeline,
  Tune,
} from '@mui/icons-material';
import StreamIcon from '@mui/icons-material/Stream';
import { toast } from 'react-toastify';
import { useParams } from 'react-router';
import { systemPlan, systemModule } from '@/utils/constants';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from '@/modules/core/pages/Error404Page';
import LockedFeature from '@/modules/core/components/LockedFeature';
import {
  BatteryMedium,
  BoxIcon,
  Clock,
  Earth,
  List,
  Locate,
  MapPin,
  Search,
  Truck,
  User,
  X,
} from 'lucide-react';
import VehicleItemMobile from '../components/VehicleItemMobile';
import { VehicleItemMobileSkeletonList } from '../components/VehicleItemMobileSkeleton';
import VehicleDetailsMobile from '../components/VehicleDetailsMobile';
import AddressAutocomplete from "@/modules/core/components/AddressAutocomplete";
import { getLocationDetails } from "@/utils/loadGoogleMaps";
import GoogleMapComponent from '../components/GoogleMapComponent';

// Define types for location coordinates
interface Coordinates {
  latitude: number;
  longitude: number;
}

export const MapPage: React.FC = () => {
  // Check module availability
  if (!checkModuleExists(systemModule.Map)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Map" />
    ) : (
      <Error404Page />
    );
  }

  // State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [routeHistoryData, setRouteHistoryData] =
    useState<IRouteHistoryData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<IVehicle | null>(null);
  const [selectedTrips, setSelectedTrips] = useState<ITrip[]>([]);
  const [showRouteHistory, setShowRouteHistory] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'listView' | 'mapView'>('listView');
  const [alert, setAlert] = useState<INotification>();
  const [vehiclesLoaded, setVehiclesLoaded] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  // Mobile related state
  const [isFilterBottomSheetOpen, setIsFilterBottomSheetOpen] = useState(false);
  const [
    isSelectedVehicleBottomSheetOpen,
    setIsSelectedVehicleBottomSheetOpen,
  ] = useState(false);
  const [status, setStatus] = useState('Both');
  const [equipmentType, setEquipmentType] = useState('Both');
  const [searchBarExpanded, setSearchBarExpanded] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // Address search
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  // Refs for mobile bottom sheets
  const sheetRef = useRef<HTMLDivElement>(null);

  // URL params
  const { alertId } = useParams<{ alertId: string }>();

  // Trigger onShowRouteHistory
  const triggerShowRouteHistory = () => {
    setShowRouteHistory(true);
    setViewMode('mapView');
  };

  // Toggle between search address and vehicle search
  const toggleIsSearchingAddress = useCallback(() => {
    setIsSearchingAddress((prev) => !prev);
    setSearchTerm('');
  }, []);

  // Function to handle live location updates
  const updateVehicleMarkerOnWebSocket = useCallback(
    (data: {
      deviceId: string | number;
      latitude: number;
      longitude: number;
      deviceTypeName: string;
      direction?: number;
      ignition?: boolean;
      movement?: boolean;
      timestamp?: number;
      rssiDistance?: number;
    }) => {
      if (!data.deviceId) return;
      
      // Update the vehicle in the vehicles array
      setVehicles(prevVehicles => 
        prevVehicles.map(vehicle => {
          if (vehicle.device?.deviceId?.toString() === data.deviceId.toString()) {
            return {
              ...vehicle,
              device: {
                ...vehicle.device,
                latitude: data.latitude,
                longitude: data.longitude,
                direction: data.direction ?? vehicle.device.direction ?? 0,
                ignition: data.ignition ?? vehicle.device.ignition ?? false,
                movement: data.movement ?? vehicle.device.movement ?? false,
                rssiDistance: data.rssiDistance ?? vehicle.device.rssiDistance ?? 0,
              }
            };
          }
          return vehicle;
        })
      );
    },
    []
  );

  // Use custom hook for vehicle location updates
  useVehicleLocationUpdates(vehicles, updateVehicleMarkerOnWebSocket);

  // eslint-disable-next-line
  const onAddressChange = (address: any) => {
    console.log("onAddressChange address", address);
    if (address && typeof address === 'object' && !Array.isArray(address)) {
      const locationDetails = getLocationDetails(address);
      const { latitude, longitude } = locationDetails;

      if (latitude && longitude) {
        setSearchTerm(locationDetails.formatted_address);
        setCoordinates({ latitude, longitude });
      } else {
        clearSearch();
      }
    } else {
      clearSearch();
    }
  };

  // Handle date change for route history
  const handleDateChange = useCallback(
    (date: string) => {
      if (!date) return;

      if (
        selectedVehicle &&
        selectedVehicle.device &&
        selectedVehicle.device.deviceId
      ) {
        getRouteHistory(selectedVehicle.device.deviceId.toString(), date)
          .then((data) => {
            console.log('alert getRouteHistory data=', data);
            setRouteHistoryData(data);
          })
          .catch((error) => {
            toast.error(error.message);
          });
      }
    },
    [selectedVehicle]
  );

  // Handle vehicle click
  const handleVehicleClick = useCallback(
    (vehicle: IVehicle) => {
      setSelectedVehicle(vehicle);
      socketService.unsubscribeFromDeviceUpdates();

      if (vehicle.device?.deviceId) {
        socketService.subscribeToDeviceUpdates(
          vehicle.device.deviceId.toString(),
          vehicle.organizationId,
        );
        socketService.onDeviceUpdate((data) => {
          if (vehicle.device && data.deviceId === vehicle.device.deviceId) {
            updateVehicleMarkerOnWebSocket(data);
          }
        });
      } else {
        toast.error('No device data available for this vehicle');
      }

      setRouteHistoryData({ deviceId: 0, trips: [] });
      setSelectedTrips([]);
      handleDateChange('');
    },
    [updateVehicleMarkerOnWebSocket, handleDateChange]
  );

  // Handle God's view (show all vehicles)
  const handleGodsView = useCallback(() => {
    setIsSidebarOpen(false);
    setSelectedVehicle(null);
    setShowRouteHistory(false);
    setSelectedTrips([]);
  }, []);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
    setSelectedVehicle(null);
    setRouteHistoryData({ deviceId: 0, trips: [] });
  }, [vehicles, isSidebarOpen]);

  // Zoom to vehicle location
  const handleZoomToLocation = useCallback(() => {
    if (selectedVehicle?.device) {
      // Google Maps component will handle the zoom
      console.log('Zooming to vehicle location');
    } else {
      toast.error('No location data available for this vehicle.');
    }
  }, [selectedVehicle]);

  // Plot device marker
  const plotDeviceMarker = useCallback(() => {
    if (selectedVehicle) {
      console.log('Plotting device marker for', selectedVehicle.plateNumber);
    }
  }, [selectedVehicle]);

  // Toggle search bar
  const toggleSearchBar = useCallback(() => {
    setSearchBarExpanded(true);
  }, []);

  // Toggle filter bottom sheet
  const toggleFilterBottomSheet = useCallback(() => {
    setIsFilterBottomSheetOpen((prev) => !prev);
  }, []);

  // Handle filter application
  const handleApplyFilter = useCallback(() => {
    console.log('Applied filters:', { status, equipmentType });
    setIsFilterBottomSheetOpen(false);
  }, [status, equipmentType]);

  // Handle bottom sheet close
  const handleClose = useCallback(() => {
    setIsFilterBottomSheetOpen(false);
  }, []);

  // Filter vehicles based on search term
  const filteredVehicles = useMemo(() => {
    const term = searchTerm.toLowerCase();

    if (!isSearchingAddress) {
      return vehicles.filter((vehicle) => {
        // First apply the search term filter
        const matchesSearch = term
          .split(' ')
          .every(
            (subTerm) =>
              vehicle.make?.toLowerCase().includes(subTerm) ||
              vehicle.model?.toLowerCase().includes(subTerm) ||
              vehicle.plateNumber?.toLowerCase().includes(subTerm) ||
              vehicle.vin?.toLowerCase().includes(subTerm)
          );

        if (!matchesSearch) return false;

        // Apply the equipment type filter
        if (equipmentType === 'Vehicles' && vehicle.entityType !== 'vehicle') {
          return false;
        }
        if (equipmentType === 'Assets' && vehicle.entityType !== 'asset') {
          return false;
        }

        // Apply the status filter
        if (status === 'Both') return true;

        if (status === 'Active') {
          const vehicleStatus =
            vehicle.device?.ignition === true
              ? vehicle.device?.movement
                ? 'driving'
                : 'idling'
              : 'parking';
          return vehicleStatus === 'driving' || vehicleStatus === 'idling';
        }

        if (status === 'Inactive') {
          const vehicleStatus =
            vehicle.device?.ignition === true
              ? vehicle.device?.movement
                ? 'driving'
                : 'idling'
              : 'parking';
          return vehicleStatus === 'parking';
        }

        return true;
      });
    } else if (coordinates) {
      return vehicles.filter((vehicle) => {
        if (!vehicle.device) return false;

        const vehicleCoordinates = [
          vehicle.device.longitude,
          vehicle.device.latitude,
        ];

        const distance = getDistance(
          coordinates.latitude,
          coordinates.longitude,
          vehicleCoordinates[1],
          vehicleCoordinates[0]
        );

        if (distance > 10) return false;

        // Apply the equipment type filter
        if (equipmentType === 'Vehicles' && vehicle.entityType !== 'vehicle') {
          return false;
        }
        if (equipmentType === 'Assets' && vehicle.entityType !== 'asset') {
          return false;
        }

        // Apply the status filter
        if (status === 'Both') return true;

        if (status === 'Active') {
          const vehicleStatus =
            vehicle.device?.ignition === true
              ? vehicle.device?.movement
                ? 'driving'
                : 'idling'
              : 'parking';
          return vehicleStatus === 'driving' || vehicleStatus === 'idling';
        }

        if (status === 'Inactive') {
          const vehicleStatus =
            vehicle.device?.ignition === true
              ? vehicle.device?.movement
                ? 'driving'
                : 'idling'
              : 'parking';
          return vehicleStatus === 'parking';
        }

        return true;
      });
    } else {
      return vehicles;
    }
  }, [vehicles, searchTerm, status, equipmentType]);

  // Load alert
  const loadAlert = useCallback(async () => {
    if (alertId) {
      if (!isSidebarOpen) {
        toggleSidebar();
      }

      const res = await fetchAlert(alertId);
      setAlert(res);

      if (res) {
        const foundVehicle = vehicles.find(
          (vehicle) => vehicle.id === Number(res.metadata.map.vehicle)
        );

        if (foundVehicle) {
          await handleVehicleClick(foundVehicle);
        } else {
          console.warn(
            'Vehicle not found for vehicle ID:',
            res.metadata.map.vehicle
          );
        }
      }
    }
  }, [alertId, vehicles, isSidebarOpen, toggleSidebar, handleVehicleClick]);

  // Calculate distance between two coordinates
  function getDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  const clearSearch = (): void => {
    setSearchTerm('');
    setCoordinates(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  // Load vehicles on component mount
  useEffect(() => {
    setIsLoadingVehicles(true);
    getVehiclesWithDeviceData().then((data: IVehicle[]) => {
      setVehicles(data);
      setVehiclesLoaded(true);
      setIsLoadingVehicles(false);
      toggleSidebar();
    });
  }, []);

  // Effect to load alert when vehicles are loaded
  useEffect(() => {
    if (vehiclesLoaded) {
      loadAlert();
    }
  }, [alertId, vehiclesLoaded, loadAlert]);

  // Effect to cleanup on unmount
  useEffect(() => {
    return () => {
      socketService.unsubscribeFromDeviceUpdates();
    };
  }, []);

  return (
    <>
      <PageMeta
        title="Map | Synops AI"
        description="This is Map page for Synops AI"
      />
      <div className="flex flex-col md:flex-row h-full w-full bg-white overflow-hidden">
        {/* Mobile Search Bar */}
        <div
          className={`flex-col md:hidden gap-2 p-3 ${
            viewMode === 'listView' ? 'flex' : 'hidden'
          }`}
        >
          {/* Search input row */}
          <div className="relative w-full">
            {isSearchingAddress ? (
              <AddressAutocomplete
                onAddressChange={onAddressChange}
                initialAddress={searchTerm}
                placeholder='Search for an address'
                containerClassName="flex items-center border bg-gray-100 rounded-lg px-3 py-2"
                showSearchIcon={true}
                iconClassName="h-4 w-4 text-gray-400 mr-2"
                inputClassName="flex-1 outline-none bg-muted text-foreground rounded-lg focus:outline-none"
              />
            ) : (
              <>
                <div className="flex items-center border bg-gray-100 rounded-lg px-3 py-2">
                  <Search className="h-4 w-4 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    placeholder={
                      isSearchingAddress
                        ? 'Search for an address'
                        : 'Search for a vehicle'
                    }
                    className="flex-1 outline-none bg-muted text-foreground rounded-lg focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="focus:outline-none ml-1"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between items-center">
            {/* Toggle for address/vehicle search */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Vehicle</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isSearchingAddress}
                  onChange={toggleIsSearchingAddress}
                />
                <div className="w-8 h-5 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:bg-blue-600"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-3"></div>
              </label>
              <span className="text-gray-600">Address</span>
            </div>

            {/* Filter button */}
            <div
              className="flex items-center p-2 bg-gray-100 rounded-lg"
              onClick={toggleFilterBottomSheet}
            >
              <Tune className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
        {/* end of Mobile Search Bar */}

        {/* Mobile Header & Toggle Component */}
        <div className="flex flex-row items-center justify-between p-4 md:hidden">
          <h2 className="text-lg">Equipment ({filteredVehicles.length})</h2>
          <div className="flex p-1 bg-[#0E1F47] rounded-full">
            <div
              className={`flex py-2 px-3 rounded-full gap-1 items-center ${
                viewMode === 'listView' ? 'bg-white' : 'bg-[#0E1F47] text-white'
              }`}
              onClick={() => setViewMode('listView')}
            >
              <List className="w-5 h-5 text-muted-foreground" />
              <p>List</p>
            </div>
            <div
              className={`flex py-2 px-3 rounded-full gap-1 items-center ${
                viewMode === 'mapView' ? 'bg-white' : 'bg-[#0E1F47] text-white'
              }`}
              onClick={() => setViewMode('mapView')}
            >
              <Earth className="w-5 h-5 text-muted-foreground" />
              <p>Map</p>
            </div>
          </div>
        </div>
        {/* end of Mobile Header & Toggle Component */}

        {/* List View on Mobile */}
        {viewMode === 'listView' && (
          <div className="flex flex-col w-full md:hidden overflow-y-auto thin-scrollbar px-4">
            <div className="text-sm space-y-2">
              {isLoadingVehicles ? (
                <VehicleItemMobileSkeletonList />
              ) : filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle, index) => (
                  <VehicleItemMobile
                    key={index}
                    vehicle={vehicle}
                    onClick={() => {
                      handleVehicleClick(vehicle);
                      setIsSelectedVehicleBottomSheetOpen(true);
                    }}
                    isSelected={selectedVehicle?.id === vehicle.id}
                    isSearchingAddress={isSearchingAddress}
                    getDistance={getDistance}
                    searchLocationCoordinates={coordinates}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center h-full w-full text-gray-500">
                  <p>No vehicles found.</p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* end of List View on Mobile */}

        {/* Map View on Mobile */}
        {viewMode === 'mapView' && (
          <div className="flex flex-col w-full h-full md:hidden">
            {/* Map Container - takes remaining height */}
            <div
              className="relative w-full flex-1 mb-[-40px]"
              style={{ minHeight: '200px' }}
            >
              <GoogleMapComponent
                vehicles={vehicles}
                selectedVehicle={selectedVehicle}
                onVehicleSelect={handleVehicleClick}
                showRouteHistory={showRouteHistory}
                routeHistoryTrips={selectedTrips}
                className="w-full h-full rounded-md overflow-hidden border border-gray-200"
              />
              {!showRouteHistory && (
                <>
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 md:hidden">
                    <div className="flex rounded-full bg-white/80">
                      <div
                        onClick={() => setStatus('Both')}
                        className={`rounded-l-full py-2 px-6 ${
                          status === 'Both' ? 'bg-[#0E1F47] text-white' : ''
                        }`}
                      >
                        <p>All</p>
                      </div>
                      <div
                        onClick={() => setStatus('Active')}
                        className={`py-2 px-6 ${
                          status === 'Active' ? 'bg-[#0E1F47] text-white' : ''
                        }`}
                      >
                        <p>Active</p>
                      </div>
                      <div
                        onClick={() => setStatus('Inactive')}
                        className={`rounded-r-full py-2 px-6 ${
                          status === 'Inactive' ? 'bg-[#0E1F47] text-white' : ''
                        }`}
                      >
                        <p>Inactive</p>
                      </div>
                    </div>
                    <div className="flex rounded-full bg-white/80 w-fit">
                      <div
                        onClick={() => setEquipmentType('Vehicles')}
                        className={`rounded-l-full py-2 px-6 ${
                          equipmentType === 'Vehicles'
                            ? 'bg-[#0E1F47] text-white'
                            : ''
                        }`}
                      >
                        <Commute className="w-5 h-5" />
                      </div>
                      <div
                        onClick={() => setEquipmentType('Assets')}
                        className={`rounded-r-full py-2 px-6 ${
                          equipmentType === 'Assets'
                            ? 'bg-[#0E1F47] text-white'
                            : ''
                        }`}
                      >
                        <BoxIcon />
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-16 left-4 right-4 z-10 md:hidden">
                    {/* TODO */}
                    {searchBarExpanded ? (
                      <div className="relative w-full rounded-lg bg-white px-2 flex items-center">
                        <div className="relative w-full">
                          <div className="flex items-center rounded-lg px-3 py-2">
                            <Search className="h-4 w-4 text-gray-400 mr-2" />
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={handleInputChange}
                              placeholder={
                                isSearchingAddress
                                  ? 'Search for an address'
                                  : 'Search for a vehicle'
                              }
                              className="flex-1 outline-none bg-muted text-foreground rounded-lg focus:outline-none"
                            />
                            {searchTerm && (
                              <button
                                onClick={clearSearch}
                                className="focus:outline-none ml-1"
                              >
                                <X className="h-4 w-4 text-gray-400" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={toggleSearchBar}
                        className="flex w-fit rounded-lg items-center p-2 bg-white"
                      >
                        <Search className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Vehicle Details Panel - fixed height that can be resized */}
            {selectedVehicle && (
              <div
                className="bg-white w-full rounded-2xl overflow-y-auto border-t border-gray-200"
                style={{ height: `fit-content` }}
              >
                <VehicleDetailsMobile
                  setSearchBarExpanded={setSearchBarExpanded}
                  vehicle={selectedVehicle}
                  onClose={() => setSelectedVehicle(null)}
                  routeHistory={routeHistoryData}
                  onDateChange={handleDateChange}
                  onZoomToLocation={handleZoomToLocation}
                  onPlotDeviceLocation={plotDeviceMarker}
                  showRouteHistory={showRouteHistory}
                  setShowRouteHistory={setShowRouteHistory}
                  onTripSelectionChange={setSelectedTrips}
                  alert={alert}
                />
              </div>
            )}
          </div>
        )}
        {/* end of Map View on Mobile */}

        <div className="flex-col w-full md:flex-row md:h-full hidden md:flex">
          {/* Main container - changes to row on desktop */}
          <div className="flex flex-col w-full md:flex-row lg:flex-row md:h-full">
            {/* First column: Sidebar with vehicle list */}
            {isSidebarOpen && (
              <div className="w-full md:w-[275px] lg:w-[275px] flex-shrink-0 bg-white shadow-md h-auto md:h-full overflow-hidden">
                <div className="w-full bg-white text-black p-4 h-full flex flex-col">
                  <div className="flex items-center justify-center mb-4 gap-8">
                    {/* <Button
                      onClick={() => toggleSidebar()}
                      icon={<KeyboardArrowLeftIcon />}
                      name=""
                    /> */}
                    <Button
                      onClick={handleGodsView}
                      icon={<StreamIcon />}
                      name="God's view"
                    />
                  </div>
                  <hr className="my-4" />
                  <div className="relative w-full">
                    {isSearchingAddress ? (
                      <AddressAutocomplete
                        onAddressChange={onAddressChange}
                        initialAddress={searchTerm}
                        placeholder='Search for an address'
                        containerClassName="relative mb-4"
                        showSearchIcon={true}
                        iconClassName="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                        inputClassName="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                      />
                    ) : (
                      <>
                        <div className="relative mb-4">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={handleInputChange}
                            placeholder={
                              isSearchingAddress
                                ? 'Search for an address'
                                : 'Search for a vehicle'
                            }
                            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                          />
                          {searchTerm && (
                            <button
                              onClick={clearSearch}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              <X className="h-4 w-4 text-gray-400" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Vehicle</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isSearchingAddress}
                        onChange={toggleIsSearchingAddress}
                      />
                      <div className="w-8 h-5 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:bg-blue-600"></div>
                      <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-3"></div>
                    </label>
                    <span className="text-gray-600">Address</span>
                  </div>
                  <hr className="my-4" />

                  {/* Vehicle list container */}
                  <div className="divide-y text-sm overflow-y-auto thin-scrollbar flex-1">
                    {filteredVehicles.map((vehicle, index) => (
                      <VehicleItems
                        key={index}
                        vehicle={vehicle}
                        onClick={() => handleVehicleClick(vehicle)}
                        isSelected={selectedVehicle?.id === vehicle.id}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="w-full flex flex-col md:flex-col lg:flex-row md:h-full overflow-hidden">
              {/* Second column: Vehicle details when selected */}
              {isSidebarOpen && selectedVehicle && selectedVehicle.device && (
                <div className="w-full lg:h-auto lg:w-[350px] bg-white shadow-md mb-4 lg:mb-0 lg:mr-4 flex-shrink-0 overflow-y-auto">
                  <VehicleDetails
                    vehicle={selectedVehicle}
                    onClose={() => setSelectedVehicle(null)}
                    routeHistory={routeHistoryData}
                    onDateChange={handleDateChange}
                    onZoomToLocation={handleZoomToLocation}
                    onPlotDeviceLocation={plotDeviceMarker}
                    showRouteHistory={showRouteHistory}
                    setShowRouteHistory={setShowRouteHistory}
                    onTripSelectionChange={setSelectedTrips}
                    alert={alert}
                  />
                </div>
              )}

              {/* Map Container - Always visible, takes remaining space */}
              <div className="relative w-full h-[50vh] md:h-[calc(100vh-20px)] lg:h-full lg:flex-1">
                <GoogleMapComponent
                  vehicles={vehicles}
                  selectedVehicle={selectedVehicle}
                  onVehicleSelect={handleVehicleClick}
                  showRouteHistory={showRouteHistory}
                  routeHistoryTrips={selectedTrips}
                  className="w-full h-full rounded-md overflow-hidden border border-gray-200"
                />

                {/* Sidebar Toggle Button */}
                {!isSidebarOpen && (
                  <div className="absolute top-4 left-4 z-10 space-x-2">
                    <Button
                      onClick={() => toggleSidebar()}
                      name="Vehicles"
                      icon={<DirectionsCarIcon />}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filter Bottom Sheet */}
        {isFilterBottomSheetOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 md:hidden">
            <div
              ref={sheetRef}
              id="bottom-sheet"
              className="bg-white rounded-t-3xl w-full p-6 animate-slide-up"
              style={{
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">Filter</h2>
                <button onClick={handleClose} className="text-gray-500">
                  <X size={24} />
                </button>
              </div>

              {/* Status Filter */}
              <div className="mb-6">
                <label className="block text-gray-800 mb-3">Status</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    className={`py-2 px-4 rounded-md border ${
                      status === 'Both'
                        ? 'bg-gray-200 border-gray-300'
                        : 'bg-white border-gray-300'
                    }`}
                    onClick={() => setStatus('Both')}
                  >
                    Both
                  </button>
                  <button
                    className={`py-2 px-4 rounded-md border ${
                      status === 'Active'
                        ? 'bg-gray-200 border-gray-300'
                        : 'bg-white border-gray-300'
                    }`}
                    onClick={() => setStatus('Active')}
                  >
                    Active
                  </button>
                  <button
                    className={`py-2 px-4 rounded-md border ${
                      status === 'Inactive'
                        ? 'bg-gray-200 border-gray-300'
                        : 'bg-white border-gray-300'
                    }`}
                    onClick={() => setStatus('Inactive')}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              {/* Equipment Types Filter */}
              <div className="mb-8">
                <label className="block text-gray-800 mb-3">
                  Equipment Types
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    className={`py-2 px-4 rounded-md border ${
                      equipmentType === 'Both'
                        ? 'bg-gray-200 border-gray-300'
                        : 'bg-white border-gray-300'
                    }`}
                    onClick={() => setEquipmentType('Both')}
                  >
                    Both
                  </button>
                  <button
                    className={`py-2 px-4 rounded-md border ${
                      equipmentType === 'Vehicles'
                        ? 'bg-gray-200 border-gray-300'
                        : 'bg-white border-gray-300'
                    }`}
                    onClick={() => setEquipmentType('Vehicles')}
                  >
                    Vehicles
                  </button>
                  <button
                    className={`py-2 px-4 rounded-md border ${
                      equipmentType === 'Assets'
                        ? 'bg-gray-200 border-gray-300'
                        : 'bg-white border-gray-300'
                    }`}
                    onClick={() => setEquipmentType('Assets')}
                  >
                    Assets
                  </button>
                </div>
              </div>

              {/* Apply Filter Button */}
              <button
                className="w-full bg-[#0E1F47] text-white py-3 rounded-full font-medium"
                onClick={handleApplyFilter}
              >
                Apply Filter
              </button>
            </div>

            <style>{`
           @keyframes slide-up {
             from {
               transform: translateY(100%);
             }
             to {
               transform: translateY(0);
             }
           }
           
           .animate-slide-up {
             animation: slide-up 0.3s ease-out forwards;
           }
         `}</style>
          </div>
        )}
        {/* end of Mobile Filter Bottom Sheet */}

        {/* Vehicle Details Bottom Sheet */}
        {selectedVehicle &&
          isSelectedVehicleBottomSheetOpen &&
          viewMode !== 'mapView' && (
            <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 md:hidden">
              <div
                ref={sheetRef}
                id="bottom-sheet"
                className="bg-white rounded-t-3xl w-full mt-16 animate-slide-up shadow-xl"
              >
                {/* Header with vehicle name and status */}
                <div className="p-4 pb-2 flex justify-between items-center">
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold mr-2">
                      {selectedVehicle.make} {selectedVehicle.model}
                    </h2>
                    <div className="flex items-center">
                      <div
                        className="w-2 h-2 rounded-full mr-1.5"
                        style={{
                          backgroundColor: getStatusColor(
                            getVehicleStatus(selectedVehicle.device?.ignition, selectedVehicle.device?.movement)
                          ),
                        }}
                      ></div>
                      <span
                        className="text-sm"
                        style={{
                          color: getStatusColor(getVehicleStatus(selectedVehicle.device?.ignition, selectedVehicle.device?.movement)),
                        }}
                      >
                        {getVehicleStatus(selectedVehicle.device?.ignition, selectedVehicle.device?.movement)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVehicle(null)}
                    className="text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Battery status */}
                <div className="px-4 pb-2 flex items-center text-gray-500 text-sm">
                  <BatteryMedium size={20} className="mr-2" />
                  <span>
                    {selectedVehicle.device?.battery
                      ? `${selectedVehicle.device.battery}%`
                      : 'N/A'}
                  </span>
                </div>

                {/* Vehicle info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center text-gray-600">
                      <User size={20} className="mr-2" />
                      <span>Driver:</span>
                    </div>
                    {selectedVehicle.currentAssignedDriver.user?.firstName ||
                    selectedVehicle.currentAssignedDriver.user?.lastName ? (
                      <span className="text-blue-600 font-medium">{`${
                        selectedVehicle.currentAssignedDriver.user?.firstName || ''
                      } ${
                        selectedVehicle.currentAssignedDriver.user?.lastName || ''
                      }`}</span>
                    ) : (
                      <span className="text-gray-500">No Driver Assigned</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-600">
                      <Truck size={20} className="mr-2" />
                      <span>{selectedVehicle.entityType === 'vehicle' ? `Vehicle ID` : `Asset Id`}:</span>
                    </div>
                    <span className="text-gray-800">{selectedVehicle.id}</span>
                  </div>
                </div>

                {/* Last updated */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center text-gray-600">
                      <Clock size={20} className="mr-2" />
                      <span>Last Updated:</span>
                    </div>
                    <span className="text-gray-800">
                      {new Date(selectedVehicle.updatedAt).toLocaleString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        }
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-5">
                    <div className="flex items-start text-gray-600">
                      <MapPin size={20} className="mr-2 mt-1 flex-shrink-0" />
                      <span>Location:</span>
                    </div>
                    <div className="text-right text-gray-800">
                      {selectedVehicle.garage?.address || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="p-4 grid grid-cols-2 gap-4">
                  <button
                    disabled={!selectedVehicle.device}
                    onClick={() => {
                      triggerShowRouteHistory();
                    }}
                    className="flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-full text-gray-700 font-medium disabled:opacity-50"
                  >
                    <Timeline className="mr-2" />
                    <span>Trip History</span>
                  </button>
                  <button
                    disabled={!selectedVehicle.device}
                    onClick={() => {
                      setViewMode('mapView');
                      handleZoomToLocation();
                    }}
                    className="flex items-center justify-center py-2.5 px-4 bg-blue-900 text-white rounded-full font-medium disabled:opacity-50"
                  >
                    <Locate size={18} className="mr-2" />
                    <span>Locate Vehicle</span>
                  </button>
                </div>
              </div>

              <style>{`
                @keyframes slide-up {
                  from {
                    transform: translateY(100%);
                  }
                  to {
                    transform: translateY(0);
                  }
                }
                
                .animate-slide-up {
                  animation: slide-up 0.3s ease-out forwards;
                }
              `}</style>
            </div>
          )}
        {/* end of Vehicle Details Bottom Sheet */}
      </div>
    </>
  );
};
