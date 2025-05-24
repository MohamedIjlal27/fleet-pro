import React, { useEffect, useState } from 'react';
import {
  Settings,
  CarFront,
  Waypoints,
  MoveRight,
  MoveLeft,
  ChevronDown,
  ChevronsUpDown,
  X,
  Plus,
  OctagonAlert,
  Edit,
  Trash,
} from 'lucide-react';
import { tagGeoFencetoDevice } from '../apis/apis';
import VehicleAssignmentPopup from './VehicleAssignmentPopup';
import { toast } from 'react-toastify';
import GeofenceDeleteButton from './GeofenceDeleteButton';

const GeofenceInfo = ({
  geofence,
  loadGeofences,
  closeInfo,
  onClickEdit,
  onClickDelete,
}: {
  geofence: any;
  loadGeofences: () => Promise<void>;
  closeInfo: () => void;
  onClickEdit: (geofenceId: string) => void;
  onClickDelete: (geofenceId: string) => void;
}) => {
  const [activeTab, setActiveTab] = useState('vehicles');
  const [currentGeofence, setCurrentGeofence] = useState(geofence);
  // const [geofence, setGeofence] = useState<null | any>();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    setCurrentGeofence(geofence);
  }, [geofence]);

  // useEffect(() => {
  //   const loadGeofence = async () => {
  //     const response = await fetchGeoFence(Number(geofenceId));
  //     console.log('geofence details', response);
  //     if (response) {
  //       setGeofence(response);
  //     }
  //   };
  //   loadGeofence();
  // }, [geofenceId]);

  const handleAssign = async (data: any) => {
    try {
      // Loop through selected devices and assign each to the geofence
      await Promise.all(
        data.deviceIds.map(async (deviceId: string) => {
          await tagGeoFencetoDevice(
            parseInt(deviceId),
            parseInt(data.geofenceId),
            data.action
          );
        })
      );

      toast.success('All devices successfully assigned to geofence.');
    } catch (error) {
      console.error('Failed to assign geofence to devices:', error);
      toast.error('Failed to assign geofence to devices');
    } finally {
      await loadGeofences();
    }
  };

  // Dummy Data
  const alertsData = [
    {
      id: 1,
      type: 'Moving inside the Geofence',
      vin: 'VIN 123456789',
      isNew: true,
      day: 'Today',
      isOutGoing: false,
    },
    {
      id: 2,
      type: 'Moving outside the Geofence',
      vin: 'VIN 123456789',
      isNew: true,
      day: 'Today',
      isOutGoing: true,
    },
    {
      id: 4,
      type: 'Moving outside the Geofence',
      vin: 'VIN 123456789',
      isNew: false,
      day: 'Yesterday',
      isOutGoing: true,
    },
    {
      id: 5,
      type: 'Moving outside the Geofence',
      vin: 'VIN 123456789',
      isNew: false,
      day: 'Yesterday',
      isOutGoing: false,
    },
    {
      id: 6,
      type: 'Moving inside of the Gefence',
      vin: 'VIN 123456789',
      isNew: false,
      day: 'Yesterday',
      isOutGoing: false,
    },
  ];

  const renderSummaryCard = (
    icon: React.ReactNode,
    title: string,
    value: number | string,
    isClickable = false
  ) => {
    const isActive = activeTab === title.toLowerCase();
    return (
      <div
        className={`rounded-lg capitalize p-4 flex-1 shadow-sm border ${
          isClickable ? 'bg-white cursor-pointer' : ' bg-[#F9FAFB] border-none'
        } ${isActive ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => isClickable && setActiveTab(title.toLowerCase())}
      >
        <div className="flex items-center">
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-lg ${
              title === 'Vehicles'
                ? 'bg-blue-100'
                : title === 'Alerts'
                ? 'bg-red-100'
                : title === 'Type'
                ? 'bg-yellow-100'
                : 'bg-green-100'
            }`}
          >
            {icon}
          </div>
          <div className="ml-4">
            <div className="text-gray-500 text-sm">{title}</div>
            <div className="font-semibold text-lg">{value}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderStatusBadge = (status: string) => {
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm ${
          status === 'Active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-200 text-gray-700'
        }`}
      >
        {status}
      </span>
    );
  };

  const renderAlertIcon = (isOutGoing: boolean) => {
    return (
      <div
        className={`w-10 h-10 rounded-md flex items-center justify-center ${
          isOutGoing ? 'bg-[#50AC9920]' : 'bg-[#8CAEFF20]'
        }`}
      >
        <div
          className={`w-5 h-5 relative flex items-center justify-center rounded-full ${
            isOutGoing
              ? 'bg-[#6EE4CC] text-[#009072]'
              : 'bg-[#C6D7FF] text-[#2158DB]'
          }`}
        >
          {isOutGoing ? (
            <MoveRight size={17} className="absolute right-2" />
          ) : (
            <MoveLeft size={17} className="absolute right-2.5" />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {currentGeofence ? (
        <div className="max-w-6xl mx-auto p-4 flex flex-col bg-white h-full rounded-lg">
          <div className="flex-none">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-semibold">{currentGeofence.name}</h1>
              <div className="flex items-center space-x-4">
                {/* <div className="flex items-center bg-white rounded-md border px-4 py-2">
              <Calendar size={16} className="text-gray-500 mr-2" />
              <span>January 2023</span>
              <div className="flex ml-6">
                <button className="text-gray-500 mx-1">
                  <ChevronLeft size={16} />
                </button>
                <button className="text-gray-500 mx-1">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div> */}
                {/* <span
                  title="Delete Geofence"
                  className="cursor-pointer"
                  onClick={() => onClickDelete(currentGeofence.id)}
                >
                  <Trash
                    size={22}
                    className=" text-red-500 hover:text-red-700"
                  />
                </span> */}
                <GeofenceDeleteButton
                  currentGeofence={currentGeofence}
                  onClickDelete={onClickDelete}
                />
                <span
                  title="Edit Geofence"
                  className="cursor-pointer"
                  onClick={() => onClickEdit(currentGeofence.id)}
                >
                  <Edit size={22} className="text-gray-500 hover:text-black" />
                </span>
                <span
                  title="Close"
                  className="cursor-pointer"
                  onClick={closeInfo}
                >
                  <X size={22} className="text-gray-500 hover:text-black" />
                </span>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="flex flex-wrap gap-6 mb-6">
              {renderSummaryCard(
                <div className="text-blue-600">
                  <CarFront size={22} />
                </div>,
                'Vehicles',
                currentGeofence.geoFenceVehicleCount,
                true
              )}
              {renderSummaryCard(
                <div className="text-red-500">
                  <OctagonAlert size={22} />
                </div>,
                'Alerts',
                'N/A',
                true
              )}
              {renderSummaryCard(
                <div className="text-yellow-500">
                  <Waypoints size={22} />
                </div>,
                'Type',
                currentGeofence.type,
                false
              )}
              {/* {renderSummaryCard(
                <div className="text-green-500">
                  <LandPlot size={22} />
                </div>,
                'Area',
                currentGeofence.area ?? 'N/A',
                false
              )} */}
            </div>
          </div>

          {/* Content based on active tab */}
          <div className="flex-grow flex flex-col overflow-hidden">
            {activeTab === 'vehicles' && (
              <div className="bg-white rounded-lg shadow-sm flex-grow flex flex-col overflow-hidden">
                <div className="w-full flex justify-end mb-4">
                  <button
                    className="bg-[#0A1224] text-white px-4 py-2 rounded-lg flex items-center"
                    onClick={() => setIsAssignModalOpen(true)}
                  >
                    <Plus size={16} className="mr-2" />
                    Assign Vehicles
                  </button>
                </div>
                <div className=" flex-grow flex overflow-hidden">
                  <div className="p-4 overflow-auto w-full">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Assigned Vehicles
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap flex items-center">
                            <span className="mr-1">Status</span>
                            <ChevronDown size={16} />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            VIN Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Plate Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap flex items-center">
                            <span className="mr-1">Assigned Date & Time</span>
                            <ChevronsUpDown size={16} />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <span>Asset Type</span>
                              <ChevronDown size={16} />
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Odometer
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentGeofence.geoFenceDevices.length > 0 ? (
                          currentGeofence.geoFenceDevices.map((item: any) => (
                            <tr key={item.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0">
                                    {item.devices.vehicle.coverImage ? (
                                      <img
                                        src={item.devices.vehicle.coverImage}
                                        alt={`${item.devices.vehicle.make} ${item.devices.vehicle.model}`}
                                        className="w-full h-full object-cover rounded-full"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gray-200 rounded-full"></div>
                                    )}
                                  </div>
                                  <div className="ml-4 text-sm font-medium text-gray-900">
                                    {item.devices.vehicle.make}{' '}
                                    {item.devices.vehicle.model}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {renderStatusBadge(item.devices.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.devices.vehicle.vin ?? 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.devices.vehicle.plateNumber ?? 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.createdAt
                                  ? new Date(item.createdAt).toLocaleString(
                                      'en-US',
                                      {}
                                    )
                                  : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.devices.vehicle.assetType ?? 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.devices.vehicle.odometer ?? 'N/A'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={6}
                              className="text-center py-4 text-gray-400"
                            >
                              No vehicles assigned
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div>
                <div className="bg-white rounded-lg mb-6">
                  <div className="flex items-center p-4 ">
                    <div className="flex-1">
                      <button className="flex items-center bg-white border rounded-lg px-4 py-2 text-black">
                        All Vehicles
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </button>
                    </div>
                    <div className="flex">
                      <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg mr-2">
                        Mark all as completed
                      </button>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
                        <Settings size={16} className="mr-2" />
                        Action Settings
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <div className="text-base font-medium text-gray-500">
                        Today
                      </div>
                    </div>
                    {alertsData
                      .filter((alert) => alert.day === 'Today')
                      .map((alert) => (
                        <div
                          key={alert.id}
                          className="border rounded-lg p-4 mb-3 flex items-center"
                        >
                          {renderAlertIcon(alert.isOutGoing)}
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{alert.type}</div>
                              {alert.isNew && (
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                  New Alert
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {alert.vin}
                            </div>
                          </div>
                        </div>
                      ))}

                    <div className="mt-8 mb-4">
                      <div className="text-base font-medium text-gray-500">
                        Yesterday
                      </div>
                    </div>
                    {alertsData
                      .filter((alert) => alert.day === 'Yesterday')
                      .map((alert) => (
                        <div
                          key={alert.id}
                          className="border rounded-lg p-4 mb-3 flex items-center"
                        >
                          {renderAlertIcon(alert.isOutGoing)}
                          <div className="ml-4">
                            <div className="font-medium">{alert.type}</div>
                            <div className="text-sm text-gray-500">
                              {alert.vin}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <VehicleAssignmentPopup
            isOpen={isAssignModalOpen}
            currentVehicles={currentGeofence.geoFenceDevices.map(
              (item: any) => item.deviceId
            )}
            onClose={() => setIsAssignModalOpen(false)}
            geofenceId={currentGeofence.id}
            onAssign={handleAssign}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full w-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      )}
    </>
  );
};

export default GeofenceInfo;
