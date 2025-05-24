import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import freeTrialIcon from "@/assets/svg/freeTrial.svg";
import fleetManagementIcon from "@/assets/svg/fleetManagement.svg";
import dispatchCentreIcon from "@/assets/svg/dispatchCentre.svg";
import driverManagementIcon from "@/assets/svg/driveManagement.svg";
import personLocationIcon from "@/assets/svg/personLocation.svg";
import phoneIcon from "@/assets/svg/phone.svg";
import toolIcon from "@/assets/svg/tool.svg";
import exchangeIcon from "@/assets/svg/exchange.svg";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type IconType = string;  // You can use `string` or more specific types if needed for the icons (e.g., React components or URLs)

export const getAddOnsIconBySlug = (
  slug: string
): IconType => {
  if (slug === "driver-management") {
    return driverManagementIcon;
  } else if (slug === "ai-dashcam") {
    return personLocationIcon;
  } else if (slug === "ai-inspection") {
    return phoneIcon;
  } else if (slug === "maintenance") {
    return toolIcon;
  } else {
    return phoneIcon;
  }
};




export const getBaseModuleIconBySlug = (
  slug: string,
): IconType => {
  switch (slug) {
    case "free-trial":
      return freeTrialIcon;;
    case "fleet_management":
      return fleetManagementIcon;
    case "dispatch-centre":
      return dispatchCentreIcon;
    default:
      return exchangeIcon;
  }
};



