import {
  INotification,
  IRouteHistoryData,
  ITrip,
  IVehicle,
} from '@/modules/core/interfaces/interfaces';
import { Timeline } from '@mui/icons-material';
import {
  ArrowLeft,
  BatteryMedium,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Locate,
  MapPin,
  Truck,
  User,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import RouteHistorySectionMobile from './RouteHistorySectionMobile';
import moment from 'moment';
import { getVehicleStatus } from '@/modules/Map/utils/getVehicleStatus';
import { getStatusColor } from '@/modules/Map/utils/getStatusColor';

type Props = {
  vehicle: IVehicle;
  onClose: () => void;
  routeHistory: IRouteHistoryData | null;
  onDateChange: (date: string) => void;
  onZoomToLocation: () => void;
  onPlotDeviceLocation: () => void;
  showRouteHistory: boolean;
  setShowRouteHistory: React.Dispatch<React.SetStateAction<boolean>>;
  onTripSelectionChange: (selectedTrips: ITrip[]) => void;
  alert?: INotification;
  setSearchBarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};

function VehicleDetailsMobile({
  vehicle,
  onClose,
  routeHistory,
  onDateChange,
  onZoomToLocation,
  onPlotDeviceLocation,
  showRouteHistory,
  setShowRouteHistory,
  onTripSelectionChange,
  alert,
  setSearchBarExpanded,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const dateInputRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDisplayDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    const formattedDate = moment(newDate).format('YYYY-MM-DD');
    console.log('newDate', formattedDate);
    setSelectedDate(formattedDate);
    onDateChange(formattedDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);

    if (newDate <= today) {
      const formattedDate = moment(newDate).format('YYYY-MM-DD');
      console.log('newDate', formattedDate);
      setSelectedDate(formattedDate);
      onDateChange(formattedDate);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const inputDate: Date = new Date(e.target.value);

    if (inputDate <= today) {
      const formattedDate = moment(inputDate).format('YYYY-MM-DD');
      console.log('newDate', formattedDate);
      setSelectedDate(formattedDate);
      onDateChange(formattedDate);
    } else {
      const formattedDate = moment(today).format('YYYY-MM-DD');
      console.log('newDate', formattedDate);
      setSelectedDate(formattedDate);
      onDateChange(formattedDate);
    }
  };

  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const isNextDaySelectable = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay <= today;
  };

  useEffect(() => {
    if (isExpanded) {
      setSearchBarExpanded(false);
    } else {
      setSearchBarExpanded(true);
    }
  }, [isExpanded, setSearchBarExpanded]);

  useEffect(() => {
    console.log('alert.metadata.date a showRouteHistory =', showRouteHistory);
    if (!showRouteHistory && alert) {
      console.log('alert b =', alert);
      handleToggleRouteHistory();
      setSelectedDate(alert.metadata.map.date);
    }
  }, [alert, showRouteHistory]);

  const handleToggleRouteHistory = () => {
    if (showRouteHistory) {
      // If turning off the trip history, plot the device marker
      onPlotDeviceLocation();
    }
    setShowRouteHistory(!showRouteHistory);
  };

  const onShowRouteHistory = () => {
    setShowRouteHistory(true);
    setIsExpanded(false);
    console.log('onShowRouteHistory', vehicle);
  };

  const onCloseRouteHistory = () => {
    onPlotDeviceLocation();
    setShowRouteHistory(false);
    setIsExpanded(true);
  };

  return (
    <>
      {showRouteHistory ? (
        // className={`min-h-[350px] max-h-[calc(100vh-300px)] overflow-hidden ${
        //     isExpanded ? 'h-fit' : 'h-[350px]'
        //   }`}
        <div
          className={`flex flex-col min-h-[350px] max-h-[calc(100vh-300px)] ${
            isExpanded ? 'h-fit' : 'h-[350px]'
          }`}
        >
          {/* Header with vehicle name and status - fixed position */}
          <div className="flex-shrink-0 bg-white z-10 border-b border-gray-100">
            <div
              onClick={() => {
                setIsExpanded(!isExpanded);
              }}
              className="p-4 pb-2 flex justify-between items-center"
            >
              <div className="flex items-center">
                <ArrowLeft
                  onClick={onCloseRouteHistory}
                  className="h-5 w-5 mr-2"
                />
                <h2 className="text-xl font-medium mr-2">
                  Trip History{' '}
                  <span className="font-medium text-lg text-gray-500">
                    ({vehicle.make} {vehicle.model})
                  </span>
                </h2>
              </div>
              <button className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
                {isExpanded ? (
                  <ChevronDown size={20} className="text-gray-500" />
                ) : (
                  <ChevronUp size={20} className="text-gray-500" />
                )}
              </button>
            </div>
            <div className="px-4 py-3">
              <div className="flex w-full items-center justify-center rounded-full p-1">
                <button
                  onClick={handlePreviousDay}
                  className="flex items-center justify-center p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  <ChevronLeft size={22} />
                </button>
                <div className="relative mx-2 flex-1">
                  <div
                    onClick={openDatePicker}
                    className="text-center flex items-center justify-center py-1 font-medium cursor-pointer"
                  >
                    <div className="flex items-center bg-gray-200 p-2 px-4 w-fit rounded-full">
                      <Calendar size={18} className="mr-2 text-gray-600" />
                      {formatDisplayDate(selectedDate)}
                    </div>
                  </div>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    max={moment(today).format('YYYY-MM-DD')}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <button
                  onClick={handleNextDay}
                  className={`flex items-center justify-center p-2 rounded-full bg-gray-200 ${
                    isNextDaySelectable()
                      ? 'hover:bg-gray-200'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!isNextDaySelectable()}
                >
                  <ChevronRight size={22} />
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable content area */}
          {showRouteHistory && (
            <div className="flex-grow overflow-y-auto">
              <RouteHistorySectionMobile
                routeHistory={routeHistory}
                onTripSelectionChange={onTripSelectionChange}
              />
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Header with vehicle name and status */}
          <div
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
            className="p-4 pb-2 flex justify-between items-center sticky top-0 bg-white z-10 border-gray-100"
          >
            <div className="flex items-center">
              <ArrowLeft onClick={onClose} className="h-5 w-5 mr-2" />
              <h2 className="text-xl font-semibold mr-2">
                {vehicle.make} {vehicle.model}
              </h2>
              <div className="flex items-center">
                <div
                  className="w-2 h-2 rounded-full mr-1.5"
                  style={{
                    backgroundColor: getStatusColor(getVehicleStatus(vehicle.device?.ignition, vehicle.device?.movement)),
                  }}
                ></div>
                <span
                  className="text-sm"
                  style={{
                    color: getStatusColor(getVehicleStatus(vehicle.device?.ignition, vehicle.device?.movement)),
                  }}
                >
                  {getVehicleStatus(vehicle.device?.ignition, vehicle.device?.movement)}
                </span>
              </div>
            </div>
            <button className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
              {isExpanded ? (
                <ChevronDown size={20} className="text-gray-500" />
              ) : (
                <ChevronUp size={20} className="text-gray-500" />
              )}
            </button>
          </div>

          {/* Battery status */}
          <div className="px-4 pb-2 flex items-center text-gray-500 text-sm">
            <BatteryMedium size={20} className="mr-2" />
            <span>
              {vehicle.device?.battery ? `${vehicle.device.battery}%` : 'N/A'}
            </span>
          </div>

          {/* Vehicle info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center text-gray-600">
                <User size={20} className="mr-2" />
                <span>Driver:</span>
              </div>
              {vehicle.currentAssignedDriver?.user?.firstName ||
              vehicle.currentAssignedDriver?.user?.lastName ? (
                <span className="text-blue-600 font-medium">{`${
                  vehicle.currentAssignedDriver.user?.firstName || ''
                } ${vehicle.currentAssignedDriver.user?.lastName || ''}`}</span>
              ) : (
                <span className="text-gray-500">No Driver Assigned</span>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center text-gray-600">
                <Truck size={20} className="mr-2" />
                <span>{vehicle.entityType === 'vehicle' ? `Vehicle ID` : `Asset Id`}:</span>
              </div>
              <span className="text-gray-800">{vehicle.id}</span>
            </div>
          </div>

          {/* Last updated */}
          {isExpanded && (
            <>
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center text-gray-600">
                    <Clock size={20} className="mr-2" />
                    <span>Last Updated:</span>
                  </div>
                  <span className="text-gray-800">
                    {new Date(vehicle.updatedAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </span>
                </div>

                <div className="flex justify-between gap-5">
                  <div className="flex items-start text-gray-600">
                    <MapPin size={20} className="mr-2 mt-1 flex-shrink-0" />
                    <span>Location:</span>
                  </div>
                  <div className="text-right text-gray-800">
                    {vehicle.garage?.address || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 grid grid-cols-2 gap-4">
                <button
                  onClick={onShowRouteHistory}
                  className="flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50"
                >
                  <Timeline className="mr-2" />
                  <span>Trip History</span>
                </button>
                <button
                  disabled={!vehicle.device}
                  onClick={() => {
                    console.log('Zooming to location...');
                    onZoomToLocation();
                  }}
                  className="flex items-center justify-center py-2.5 px-4 bg-blue-900 text-white rounded-full font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Locate size={18} className="mr-2" />
                  <span>Locate Vehicle</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default VehicleDetailsMobile;
