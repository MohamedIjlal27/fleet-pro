import { useState } from 'react';
import MapWithPulsatingMarker from '../utils/MapWithPulsatingMarker';
import {
  ArrowLeft,
  BatteryMedium,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Truck,
  User,
} from 'lucide-react';
import { getStatusColor } from '@/modules/Map/utils/getStatusColor';

type Props = {
  deviceData: any;
  vehicle: any;
};

function MapViewMobile({ deviceData, vehicle }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Start */}
      <div className="flex flex-col w-full h-full md:hidden">
        {/* Map Container - takes remaining height */}
        <div
          className="relative w-full flex-1 mb-[-40px]"
          style={{ minHeight: '200px' }}
        >
          <MapWithPulsatingMarker
            latitude={deviceData.latitude || 0}
            longitude={deviceData.longitude || 0}
            zoom={12}
          />
        </div>

        {/* Vehicle Details Panel - fixed height that can be resized */}

        <div
          className="bg-white w-full rounded-2xl overflow-y-auto border-t border-gray-200"
          style={{ height: `fit-content` }}
        >
          <div>
            {/* Header with vehicle name and status */}
            <div
              onClick={() => {
                setIsExpanded(!isExpanded);
              }}
              className="p-4 pb-2 flex justify-between items-center sticky top-0 bg-white z-10 border-gray-100"
            >
              <div className="flex items-center">
                {/* <ArrowLeft onClick={onClose} className="h-5 w-5 mr-2" /> */}
                <h2 className="text-xl font-semibold mr-2">
                  {vehicle.make} {vehicle.model}
                </h2>
                <div className="flex items-center">
                  <div
                    className="w-2 h-2 rounded-full mr-1.5"
                    style={{
                      backgroundColor: getStatusColor(vehicle.status),
                    }}
                  ></div>
                  <span
                    className="text-sm"
                    style={{
                      color: getStatusColor(vehicle.status),
                    }}
                  >
                    {vehicle.status}
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
                {vehicle.currentAssignedDriver?.firstName ||
                vehicle.currentAssignedDriver?.LastName ? (
                  <span className="text-blue-600 font-medium">{`${
                    vehicle.currentAssignedDriver.firstName || ''
                  } ${vehicle.currentAssignedDriver.LastName || ''}`}</span>
                ) : (
                  <span className="text-gray-500">No Driver Assigned</span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-600">
                  <Truck size={20} className="mr-2" />
                  <span>Vehicle ID:</span>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* End */}
    </>
  );
}

export default MapViewMobile;
