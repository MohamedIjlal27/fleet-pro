import { IVehicle } from '../../core/interfaces/interfaces';
import noImageCar from '../../../assets/fleet/no_image_car.png';

interface VehicleItemsProps {
  vehicle: IVehicle;
  onClick: () => void;
  isSelected: boolean;
}

const VehicleItems = ({ vehicle, onClick, isSelected }: VehicleItemsProps) => {
  return (
    <div
      className={`flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-gray-100' : ''}`}
      onClick={onClick}
    >
      <div className="w-12 h-12 mr-4">
        <img
          src={noImageCar}
          alt={vehicle.model}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-bold">
          {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-gray-600">
          {vehicle.year} | {vehicle.color} | Plate# {vehicle.plateNumber}
        </p>
      </div>
    </div>
  );
};

export default VehicleItems;
