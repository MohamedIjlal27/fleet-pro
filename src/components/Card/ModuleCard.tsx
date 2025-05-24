import { CheckCircle } from "lucide-react";
import React from "react";

interface ModuleCardProps {
  title: string;
  description: string;
  features: string[];
  price: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  features,
  price,
  selected,
  onSelect,
  disabled = false,
}: ModuleCardProps) => {
  return (
    <div
      className={`border rounded-lg p-6 transition-all ${
        selected
          ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-blue-300"
      } ${disabled ? "opacity-60" : "cursor-pointer"}`}
      onClick={disabled ? undefined : onSelect}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {selected && <CheckCircle className="text-blue-500" size={24} />}
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="mb-4">
        <p className="font-medium text-gray-700 mb-2">Features:</p>
        <ul className="space-y-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-gray-600">
              <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <div className="text-gray-800 font-medium">{price}</div>
    </div>
  );
};

export default ModuleCard;
