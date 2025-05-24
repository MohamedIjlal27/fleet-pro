import { IVehicle } from '../../core/interfaces/interfaces';
import {
  BatteryChargingFull,
  Close,
  LocalGasStation,
  Timeline,
  ZoomIn,
} from '@mui/icons-material';
import RouteHistorySection from './RouteHistorySection';
import { formatEportTimeStamp } from '../utils/utils';
import { IRouteHistoryData, ITrip } from '../../core/interfaces/interfaces';
import LocationAddress from '../../../utils/addressForLatLong';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { getLiveStreaming } from '../apis/apis';
import VideoStream from './VideoStream';
import { INotification } from '../../core/interfaces/interfaces';
import { systemModule } from '@/utils/constants';
import { checkModuleExists } from '@/lib/moduleUtils';
import { getVehicleStatus } from '@/modules/Map/utils/getVehicleStatus';
import { getStatusColor } from '@/modules/Map/utils/getStatusColor';

export interface IRouteHistory {
  timestamp: number;
  latitude: number;
  longitude: number;
}

interface StreamData {
  response: {
    hls: string;
    channel: number;
  };
  device_id: number;
}

interface VehicleDetailsProps {
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
}

const VehicleDetails = ({
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
}: VehicleDetailsProps) => {
  const isAiDashcamModuleAvailable = checkModuleExists(
    systemModule.MapAIDashCam
  );

  const [showLiveStream, setShowLiveStream] = useState(false);
  const [streams, setStreams] = useState<StreamData[]>([]);
  const [seletedDate, setSeletedDate] = useState<string>();

  useEffect(() => {
    setShowLiveStream(false);
    setStreams([]);
  }, [vehicle, onClose, showLiveStream]);

  useEffect(() => {
    console.log('alert.metadata.date a showRouteHistory =', showRouteHistory);
    if (!showRouteHistory && alert) {
      console.log('alert b =', alert);
      handleToggleRouteHistory();
      setSeletedDate(alert.metadata.map.date);
    }
  }, [alert, showRouteHistory]);

  const handleToggleRouteHistory = () => {
    if (showRouteHistory) {
      // If turning off the trip history, plot the device marker
      onPlotDeviceLocation();
    }
    setShowRouteHistory(!showRouteHistory);
  };

  return (
    <div
      className="h-full overflow-y-auto shadow-lg rounded-lg border border-gray-200 w-full md:w-full lg:w-[350px]"
      style={{
        maxWidth: '100%',
        flexShrink: 0,
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-300">
        <h2 className="text-lg font-semibold">General Information</h2>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
          <Close />
        </button>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8">
            <div className="space-y-2">
              {/* Vehicle ID */}
              <div className="flex items-center justify-start space-x-2">
                <p className="text-gray-500">Vehicle ID:</p>
                <a
                  href={`/vehicle/${vehicle.id}`}
                  className="font-medium text-blue-600 underline"
                >
                  {vehicle.id}
                </a>
              </div>

              {/* Device ID */}
              <div className="flex items-center justify-start space-x-2">
                <p className="text-gray-500">Device ID:</p>
                {vehicle.device?.deviceId ? (
                  <a
                    href={`/geotab-stat/${vehicle.device.deviceId}/${vehicle.id}`}
                    className="font-medium text-blue-600 underline"
                  >
                    {vehicle.device.deviceId}
                  </a>
                ) : (
                  <span className="font-medium text-blue-600 underline">
                    No Device ID
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-start space-x-2">
            <p className="text-gray-500">Vehicle Status:</p>
            <span className="font-medium">
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
            </span>
          </div>

          <div className="flex items-center justify-start space-x-2">
            <p className="text-gray-500">Driver:</p>
            <span className="font-medium">
              {vehicle.currentAssignedDriver &&
              typeof vehicle.currentAssignedDriver === 'object' &&
              Object.keys(vehicle.currentAssignedDriver).length > 0 ? (
                <a
                  href={`/operations/drivers/${vehicle.currentAssignedDriver.id}`}
                  className="font-medium text-blue-600 underline"
                >
                  {vehicle.currentAssignedDriver.firstName}{' '}
                  {vehicle.currentAssignedDriver.lastName}
                </a>
              ) : (
                <span className="font-medium">No driver assigned</span>
              )}
            </span>
          </div>

          <div>
            {vehicle.device?.timestamp !== undefined && (
              <>
                <p className="text-gray-500">Latest Reported Time:</p>
                <p className="font-medium">
                  {formatEportTimeStamp(Number(vehicle.device.timestamp))}
                </p>
              </>
            )}
          </div>
          <div>
            <p className="text-gray-500">Latest Reported Location:</p>
            <LocationAddress
              latitude={vehicle.device?.latitude ?? 0}
              longitude={vehicle.device?.longitude ?? 0}
            />
          </div>
          {isAiDashcamModuleAvailable &&
            vehicle.device?.deviceProtocol === 'Howen' &&
            vehicle.device?.deviceTypeName === 'FLESPI' && (
              <div className="w-full">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-500">Live Stream:</p>
                  <Button
                    onClick={async () => {
                      console.log('vehicle', vehicle);

                      if (vehicle.device?.deviceId && showLiveStream) {
                        try {
                          const res = await getLiveStreaming(
                            vehicle.device.deviceId
                          );
                          console.log('getLiveStreaming response:', res); // Debugging

                          if (!res) {
                            console.error('No live stream data returned');
                          }

                          // If res is an array of streams, update state
                          if (Array.isArray(res)) {
                            setStreams(res);
                          } else {
                            console.warn('Unexpected API response format', res);
                          }
                        } catch (error) {
                          console.error('Error fetching live stream:', error);
                        }
                      }
                      setShowLiveStream(!showLiveStream);
                    }}
                    variant="contained"
                    className="bg-slate-800 text-white hover:bg-black px-4 py-2 rounded-md"
                  >
                    {showLiveStream ? 'Hide Live Stream' : 'Show Live Stream'}
                  </Button>
                </div>

                {/* Live Stream Box */}
                {showLiveStream && (
                  <div>
                    {streams && streams.length > 0 ? (
                      streams.map((stream) => (
                        <div className="border p-2 rounded-lg">
                          <h2 className="text-lg font-semibold">
                            Channel {stream.response.channel}
                          </h2>
                          <VideoStream hlsUrl={stream.response.hls} />
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No live stream available</p>
                    )}
                  </div>
                )}
              </div>
            )}

          <div className="p-4 bg-gray-100 rounded-md flex">
            <div className="flex-1 flex items-center">
              <LocalGasStation className="mr-2" />
              <div>
                <p className="text-gray-500">Fuel:</p>
                <p className="font-medium">
                  {Math.round(vehicle.device?.fuelLevel ?? 0)}%
                </p>
              </div>
            </div>
            <div className="border-l border-white h-8 mx-4" />
            <div className="flex-1 flex items-center">
              <BatteryChargingFull className="mr-2" />
              <div>
                <p className="text-gray-500">Battery:</p>
                <p className="font-medium">
                  {vehicle.device?.batteryVoltage ?? 'N/A'} V
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-100 rounded-md flex">
            <div
              className="bg-slate-800 text-white hover:bg-black flex-1 flex items-center rounded-lg cursor-pointer"
              onClick={handleToggleRouteHistory}
            >
              <Timeline className="mr-2 ml-2" />
              <div>
                <p className="text-white">Trip History</p>
              </div>
            </div>
            <div className="border-l border-white h-8 mx-4" />
            <div
              className="bg-slate-800 text-white hover:bg-black flex-1 flex items-center rounded-lg cursor-pointer"
              onClick={onZoomToLocation}
            >
              <ZoomIn className="mr-2 ml-2" />
              <div>
                <p className="text-white">Locate Vehicle</p>
              </div>
            </div>
          </div>

          <div style={{ maxWidth: '50vh', overflowY: 'auto' }}>
            {showRouteHistory && (
              <RouteHistorySection
                routeHistory={routeHistory}
                onDateChange={onDateChange}
                selectedVehicle={vehicle}
                onTripSelectionChange={onTripSelectionChange}
                alertDate={seletedDate}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
