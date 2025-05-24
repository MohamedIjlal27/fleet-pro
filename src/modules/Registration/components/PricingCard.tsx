import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  features: string[];
  icon: string;
  duration: string;
  isCustom?: boolean;
  onButtonClick: () => void;
}

export default function PricingCard({
  title,
  description,
  price,
  duration,
  features,
  icon,
  isCustom = false,
  onButtonClick,
}: Readonly<PricingCardProps>) {
  return (
    <div className="bg-gradient-to-b from-[rgba(50,70,248,0.11)] to-[#090014] border-t-2 border-[#00056B] rounded-3xl p-6 relative">
      {/* Add custom badge if isCustom is true */}
      {isCustom && (
        <div className="absolute top-4 right-4 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
          Custom
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
          <img src={icon} className="w-7 h-7" alt="icon" />
        </div>
        <div className="font-light font-sans">{title}</div>
      </div>

      <p className="text-sm text-gray-400 mb-4">{description}</p>

      <div className="mb-6">
        <span className="text-2xl font-bold">{price}</span>
        <span className="text-gray-500 text-sm">/{duration}</span>
      </div>

      <div className="mb-6">
        <div className="font-semibold mb-2">What's included</div>
        <ul className="space-y-2">
          {features?.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-white">
                <Check size={12} />
              </div>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center mt-16">
        <Button
          onClick={onButtonClick}
          className="w-64 py-6 px-9 bg-[#2510CC] hover:bg-[#1045cc] font-sans text-white rounded-[96px] font-medium"
        >
          Select
        </Button>
      </div>
    </div>
  );
}
