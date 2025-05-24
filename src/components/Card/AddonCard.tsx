import { CheckCircle, PlusCircle } from "lucide-react";

const AddonCard = ({
  title,
  description,
  features,
  price,
  selected,
  onToggle,
}: {
  title: string;
  description: string;
  features: string[];
  price: string;
  selected: boolean;
  onToggle: () => void;
}) => {
  return (
    <div
      className={`border rounded-lg p-5 transition-all ${
        selected
          ? "border-green-500 ring-1 ring-green-500 bg-green-50"
          : "border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-base font-medium text-gray-900">{title}</h3>
        <div
          onClick={onToggle}
          className={`flex items-center justify-center w-6 h-6 cursor-pointer rounded-full ${
            selected
              ? "bg-green-100 text-green-600"
              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
          }`}
        >
          {selected ? <CheckCircle size={20} /> : <PlusCircle size={20} />}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 mb-1">Features:</p>
        <ul className="space-y-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-xs text-gray-600">
              <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <div className="text-sm text-gray-800 font-medium">{price}</div>
    </div>
  );
};

export default AddonCard;
