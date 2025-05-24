import { PricingProvider } from "@/context/SignUpContext";
import RegistrationLayout from "./RegistrationLayout";


export default function RegistrationWrap() {
  return (
    <PricingProvider>
      <RegistrationLayout />
    </PricingProvider>
  );
}
