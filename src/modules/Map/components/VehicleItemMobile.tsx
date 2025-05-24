import { IVehicle } from '../../core/interfaces/interfaces';
import noImageCar from '../../../assets/fleet/no_image_car.png';
import { ArrowUp, Gauge, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getVehicleStatus } from '@/modules/Map/utils/getVehicleStatus';
import { getStatusColor } from '@/modules/Map/utils/getStatusColor';

interface VehicleItemsProps {
  vehicle: IVehicle;
  onClick: () => void;
  isSelected: boolean;
  isSearchingAddress: boolean;
  getDistance: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => number;
  searchLocationCoordinates: {
    latitude: number;
    longitude: number;
  } | null;
}

const VehicleItemMobile = ({
  vehicle,
  onClick,
  isSelected,
  isSearchingAddress,
  getDistance,
  searchLocationCoordinates,
}: VehicleItemsProps) => {
  const [distanceToVehicle, setDistanceToVehicle] = useState<number>(0);

  useEffect(() => {
    if (isSearchingAddress && searchLocationCoordinates && vehicle.device) {
      const { latitude, longitude } = searchLocationCoordinates;
      const distance = getDistance(
        vehicle.device?.latitude,
        vehicle.device?.longitude,
        latitude,
        longitude
      );
      setDistanceToVehicle(distance);
      console.log('Distance:', distance);
    }
  }, [isSearchingAddress, searchLocationCoordinates, vehicle.device]);

  return (
    <div
      className={`flex items-center p-4 bg-gray-100 rounded-lg cursor-pointer ${
        isSelected ? 'bg-gray-100' : ''
      }`}
      onClick={onClick}
    >
      <div className="w-12 h-12 mr-4">
        <img
          src={vehicle.coverImage || noImageCar}
          alt={vehicle.model}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="flex-1 flex flex-row items-center justify-between">
        <div className="flex flex-col ">
          <h3 className="font-medium text-lg">
            {vehicle.make} {vehicle.model}
          </h3>
          <p className="text-gray-600">
            {vehicle.currentAssignedDriver && 
             (vehicle.currentAssignedDriver.firstName || vehicle.currentAssignedDriver.LastName)
              ? `${vehicle.currentAssignedDriver.firstName || ''} ${
                  vehicle.currentAssignedDriver.LastName || ''
                }`
              : 'No Driver Assigned'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p style={{ color: getStatusColor(getVehicleStatus(vehicle.device?.ignition, vehicle.device?.movement)) }}>
            {getVehicleStatus(vehicle.device?.ignition, vehicle.device?.movement)}
          </p>
          <div className="flex gap-3">
            {isSearchingAddress && vehicle.device && distanceToVehicle ? (
              <>
                <div className="flex flex-row gap-1 text-gray-500 items-center text-nowrap">
                  <MapPin className="w-4 h-4" />
                  <p>
                    {distanceToVehicle.toFixed(2)} {' km'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  {vehicle.device?.speed ? (
                    <div className="flex flex-row gap-2 text-gray-500 items-center text-nowrap">
                      <Gauge className="w-4 h-4" />
                      <p>{vehicle.device.speed} km/h</p>
                    </div>
                  ) : (
                    ''
                  )}
                </div>
                {vehicle.device?.direction ? (
                  <div className="flex items-center gap-2 px-3 bg-blue-600 text-white rounded-lg h-fit">
                    <div
                      style={{
                        transform: `rotate(${vehicle.device.direction}deg)`,
                      }}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </div>
                    <p>
                      {(() => {
                        const direction = vehicle.device.direction;
                        if (direction >= 0 && direction <= 22.5) return 'N';
                        if (direction > 22.5 && direction <= 67.5) return 'NE';
                        if (direction > 67.5 && direction <= 112.5) return 'E';
                        if (direction > 112.5 && direction <= 157.5)
                          return 'SE';
                        if (direction > 157.5 && direction <= 202.5) return 'S';
                        if (direction > 202.5 && direction <= 247.5)
                          return 'SW';
                        if (direction > 247.5 && direction <= 292.5) return 'W';
                        if (direction > 292.5 && direction <= 337.5)
                          return 'NW';
                        return 'N'; // Default to North for edge cases
                      })()}
                    </p>
                  </div>
                ) : (
                  ''
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleItemMobile;
