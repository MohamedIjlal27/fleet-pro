import { Check, Plus } from "lucide-react";

interface AddOnCardProps {
  title: string;
  description?: string;
  features: string[];
  price: string;
  icon: string;
  isSelected: boolean;
  onToggle: () => void;
}
const AddOnCard: React.FC<AddOnCardProps> = ({
  title,
  description,
  features,
  price,
  icon,
  isSelected,
  onToggle,
}) => {
  return (
    <div className="bg-gradient-to-b from-[rgba(21,38,87,0.35)] to-[#010111] border border-[#1A1A2D] relative rounded-3xl transition-transform duration-300 hover:scale-105 hover:shadow-[0px_-27px_59px_0px_#8932F854] active:shadow-[0px_-27px_59px_0px_#8932F854] hover:transition-transform">
      <div className="absolute -top-6 left-6">
        <div className="w-12 h-12 rounded-full border-2 border-[#1F5ADB] bg-[#090014] flex items-center justify-center">
          <img src={icon} className="w-6 h-6" alt={`${title} icon`} />
        </div>
      </div>
      <div className="p-6 pt-12 flex flex-col h-full">
        <h3 className="text-xl font-raleway font-extralight mb-2">{title}</h3>
        <p className="text-sm font-raleway font-normal text-gray-300 mb-4">
          {description}
        </p>

        <div className="mb-6">
          <div className="font-raleway font-extralight mb-2 text-base">
            Features
          </div>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="mt-0.5 w-4 h-4 rounded-full bg-[#DAD8FE80] flex items-center justify-center text-white">
                  <Check size={12} />
                </div>
                <span className="text-sm font-sans font-extralight text-[#D9DBE9]">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between pt-3 border-t-[0.1px] border-t-[#a7a7a7] mt-auto">
          <div>
            <div className="text-xs text-gray-400">Per Item Fee</div>
            <div className="font-semibold">{price}</div>
          </div>
          <button
            className={`rounded-[76px] py-3 px-6 font-medium flex items-center gap-1 border-white ${
              isSelected
                ? "bg-[#2510CC] text-white"
                : "bg-[#2510CC]/35 text-white border-[0.1px]"
            }`}
            onClick={onToggle}
          >
            {isSelected ? (
              "Added"
            ) : (
              <>
                Add <Plus size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOnCard;
