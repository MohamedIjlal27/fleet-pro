import type React from 'react';
import { Avatar } from '@mui/material';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { IVehicle } from '@/modules/core/interfaces/interfaces';
import { useEffect, useState } from 'react';
import { IMaintenanceDetail } from '@/modules/Maintenance/MaintenanceRecord/interfaces/interfaces';
import { fetchMaintenances } from '@/modules/Maintenance/MaintenanceRecord/apis/apis';

interface FleetListItemMobileProps {
  vehicle: IVehicle;
  expanded: boolean;
  onToggle: () => void;
  onCardClick: (id: number) => void;
}

const FleetListItemMobile: React.FC<FleetListItemMobileProps> = ({
  vehicle,
  expanded,
  onToggle,
  onCardClick,
}) => {
  const [currentMaintenances, setCurrentMaintenances] = useState<
    IMaintenanceDetail[]
  >([]);

  useEffect(() => {
    const loadCurrentMaintenance = async () => {
      const respone = await fetchMaintenances(1, 10, vehicle.id, '40');
      console.log('fetchMaintenances respone=', respone);
      setCurrentMaintenances(respone.data);
    };

    loadCurrentMaintenance();
  }, [vehicle]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div
          onClick={() => onCardClick(vehicle.id)}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <Avatar
              src={vehicle.coverImage || '/car_model_1_big.png'}
              sx={{ width: 40, height: 40 }}
            />
            <div>
              <h3 className="font-medium">
                {vehicle.make} {vehicle.model}
              </h3>
              <div className="flex items-center text-sm text-gray-600 space-x-2">
                <span className="capitalize bg-gray-100 px-2 py-1 rounded-lg">
                  {vehicle.entityType}
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded-lg">
                  #{vehicle.id}
                </span>
              </div>
              <div className="text-sm mt-2 text-gray-600">
                {vehicle?.currentAssignedDriver && typeof vehicle?.currentAssignedDriver === 'object' &&
                Object.keys(vehicle.currentAssignedDriver).length > 0
                  ? `${vehicle.currentAssignedDriver?.user?.firstName ?? ''} ${vehicle.currentAssignedDriver?.user?.lastName ?? ''}`
                  : 'No driver assigned'}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                vehicle.status === 'Available'
                  ? 'bg-green-100 text-green-800'
                  : vehicle.status === 'In Use' || vehicle.status === 'InUse'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {vehicle.status}
            </span>
            <button
              className="mt-2 text-blue-500 text-sm flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            >
              More Details{' '}
              <span className="ml-1">
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div>
                <p className="text-gray-500">Garage Group:</p>
                <p className="font-medium">
                  {vehicle.garage?.name || 'Main Depot'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">VIN Number:</p>
                <p className="font-medium">{vehicle.vin || '123456789'}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Maintenance:</p>
                <p className="font-medium">
                  {new Date(
                    currentMaintenances.length > 0
                      ? currentMaintenances[currentMaintenances.length - 1]
                          .startTime || Date.now()
                      : Date.now()
                  ).toLocaleDateString()}
                </p>
              </div>
              {/* <div>
                <p className="text-gray-500">Next Maintenance:</p>
                <p className="font-medium text-red-500">
                  {new Date(vehicle.nextMaintenance).toLocaleDateString()}{' '}
                  (Overdue)
                </p>
              </div> */}
            </div>

            <div className="mt-3">
              <p className="text-gray-500">Latest Updated Notes:</p>
              <p className="text-sm">
                {currentMaintenances[currentMaintenances.length - 1]?.notes ||
                  'No notes'}
              </p>
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Specifications</h4>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div>
                  <p className="text-gray-500">Make:</p>
                  <p>{vehicle.make || 'Ford'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Model:</p>
                  <p>{vehicle.model || 'F-150'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Color:</p>
                  <p>{vehicle.color || 'White'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fuel Type:</p>
                  <p>{vehicle.fuelType || 'Gasoline'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Odometer:</p>
                  <p>
                    {(
                      (vehicle.odometer ?? 0) + (vehicle.device?.mileage ?? 0)
                    ).toFixed(0)}{' '}
                    Km
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FleetListItemMobile;
