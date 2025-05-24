import { useEffect, useState } from 'react';
import { fetchDevices, fetchVehicles } from '../apis/apis';

const VehicleAssignmentPopup = ({
  isOpen,
  onClose,
  geofenceId,
  currentVehicles,
  onAssign,
}: {
  isOpen: boolean;
  onClose: () => void;
  geofenceId: string;
  currentVehicles: string[];
  onAssign: (data: {
    geofenceId: string;
    action: string;
    deviceIds: string[];
  }) => void;
}) => {
  const [selectedAction, setSelectedAction] = useState('ALERT');
  const [selectedDevices, setSelectedDevices] =
    useState<string[]>(currentVehicles);
  const [selectAll, setSelectAll] = useState(false);
  const [vehicleList, setVehicleList] = useState<any[]>([]);

  useEffect(() => {
    console.log('vehicleList', vehicleList);
    console.log('currentVehicles', currentVehicles);
    setSelectedDevices(currentVehicles);
  }, [currentVehicles]);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const response = await fetchVehicles();
        console.log('vehicles respone ', response);
        setVehicleList(response.data);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };

    loadVehicles();
  }, []);

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(vehicleList.map((vehicle) => vehicle.deviceId));
    }
    setSelectAll(!selectAll);
  };

  const handleAssignClick = () => {
    const newAssignedDevices = selectedDevices.filter(
      (device) => !currentVehicles.includes(device)
    );

    onAssign({
      geofenceId: geofenceId,
      action: selectedAction,
      deviceIds: newAssignedDevices,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full">
        <h2 className="text-xl font-semibold mb-4">Assign Vehicles</h2>

        {/* Geofence Dropdown */}
        {/* <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Geofence
          </label>
          <select
            value={selectedGeofence}
            onChange={handleGeofenceChange}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select a geofence
            </option>
            {geofenceOptions.map((geofence) => (
              <option key={geofence.id} value={geofence.id}>
                {geofence.name}
              </option>
            ))}
          </select>
        </div> */}

        {/* Action Dropdown */}
        {/* <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Action
          </label>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select an action
            </option>
            <option value="ALERT">Alert</option>
            <option value="SPEED_CONTROL">Speed Control</option>
            <option value="IMMOBILIZE">Immobilize</option>
          </select>
        </div> */}

        {/* Device List */}
        <div className="border border-gray-300 rounded-md mb-4">
          <div className="p-2 border-b border-gray-300 flex items-center">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm font-medium">Select All</span>
          </div>

          <div className="max-h-48 overflow-y-auto p-1">
            {vehicleList.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center p-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedDevices.includes(vehicle.deviceId)}
                  disabled={currentVehicles.includes(vehicle.deviceId)}
                  onChange={() => handleDeviceChange(vehicle.deviceId)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm">
                  {vehicle.make} {vehicle.model}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleAssignClick}
            disabled={selectedDevices.length === 0}
            className={`px-4 py-2 rounded-md text-white ${
              selectedDevices.length === 0
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleAssignmentPopup;
