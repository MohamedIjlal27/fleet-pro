// AddOnsPage.tsx
import { useEffect, useState, useMemo } from "react";
import { Info } from "lucide-react";
import AddOnCard from "./components/AddOnCard";
import { Button } from "@/components/ui/button";
import EnterpriseCTA from "./components/EnterpriseCTA";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { getAddOnsIconBySlug, getBaseModuleIconBySlug } from "@/lib/utils";
import CanadaFlagSvg from "./svg/canada-flag.svg";
import { usePricing } from "@/context/SignUpContext";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { activateTrail, postPayment } from "@/utils/api";
import { useNavigate } from "react-router";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Sign } from "crypto";
import { logout } from "../Public/apis/apis";
import { clearUser } from "@/redux/features/user";
import { useAppDispatch } from "@/redux/app/store";

interface AddOnsPageProps {
  onSelectAddOns: (addOns: string[]) => void;
  preSelectAddOns: number[];
  addOnsList: AddOn[];
  selectedBaseModule: BaseModule;
  onBack: () => void;
}

interface AddOn {
  id: number;
  slug: string;
  name: string;
  amount: number;
  chargeDuration: string;
  description?: string;
  modules?: { module: { name: string } }[];
}

interface BaseModule {
  id: number;
  slug: string;
  name: string;
  amount: number;
  chargeDuration: string;
  description: string;
  currency: string;
  amountPerAssetType?: {
    [key: string]: {
      max: number | null;
      min: number;
      amount: number;
      currency: string;
    }[];
  };
}

// Only load Stripe if the publishable key is available
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function AddOnsPage({
  selectedBaseModule,
  addOnsList,
  preSelectAddOns,
  onBack,
}: Readonly<AddOnsPageProps>) {
  const [selectedAddOns, setSelectedAddOns] =
    useState<number[]>(preSelectAddOns);
  const { rating, selectedModulePrice } = usePricing();

  const toggleAddOn = (addOn: number) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOn)
        ? prev.filter((item) => item !== addOn)
        : [...prev, addOn]
    );
  };

  const [loading, setLoading] = useState(false);

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-xl mb-5 font-extralight font-raleway text-purple-200">
        Step 2: Choose Add-ons
      </h2>

      <div className="bg-gradient-to-r from-[rgba(136,136,136,0.6)] to-[rgba(238,238,238,0.6)] border border-blue-300 rounded-lg p-3 mb-12 flex items-center">
        <Info size={16} className="mr-3" />
        <p className="text-sm">
          You've selected the{" "}
          <span className="font-semibold">{selectedBaseModule.name}</span> as
          base module. Now you can enhance your experience with these add-ons.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        {addOnsList.map((item) => (
          <AddOnCard
            key={item.slug}
            title={item.name}
            description={item.description}
            features={(item.modules || []).map((module) => module.module.name)}
            price={
              rating
                ? `$${(item.amount * rating).toFixed(2)}/${item.chargeDuration}`
                : `$${item.amount}/${item.chargeDuration}` || "$X/month"
            }
            icon={getAddOnsIconBySlug(item.slug)}
            isSelected={selectedAddOns.includes(item.id)}
            onToggle={() => toggleAddOn(item.id)}
          />
        ))}
      </div>

      <div className="flex justify-between mb-24">
        <Button
          onClick={onBack}
          className="bg-[#2510CC]/35 hover:bg-[#1910cc] text-white border-[0.1px] border-white/55 rounded-[76px] py-6 px-8 font-medium flex items-center gap-1"
        >
          Back
        </Button>
        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <RegistrationDialog
              selectedBaseModule={selectedBaseModule}
              selectedAddOns={selectedAddOns}
              addOnsList={addOnsList}
              loading={loading}
              setLoading={setLoading}
            />
          </Elements>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p className="text-sm">
              Payment processing is not available in local development mode. 
              Please configure VITE_STRIPE_PUBLISHABLE_KEY to enable payments.
            </p>
          </div>
        )}
      </div>

      <EnterpriseCTA />
    </main>
  );
}

function RegistrationDialog({
  selectedBaseModule,
  selectedAddOns,
  addOnsList,
  loading,
  setLoading,
}: Readonly<{
  selectedAddOns: number[];
  addOnsList: AddOn[];
  selectedBaseModule: BaseModule;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}>) {
  const stripe = useStripe();
  const elements = useElements();
  const {
    setSubscriptionPlan,
    billingCycle,
    rating,
    currency,
    selectedModulePrice,
    updateAssetQuantity,
    updateAddOnQuantity,
  } = usePricing();

  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "success" | "failed"
  >("idle");

  // Utility function to get price per asset based on quantity
  const getPricePerAsset = (
    quantity: number,
    tiers: {
      max: number | null;
      min: number;
      amount: number;
      currency: string;
    }[]
  ) => {
    const tier = tiers.find((t) =>
      t.max === null
        ? quantity >= t.min
        : quantity >= t.min && quantity <= t.max
    );
    return tier ? tier.amount : tiers[tiers.length - 1].amount;
  };

  const calculateCosts = useMemo(() => {
    const billingMultiplier = billingCycle === "year" ? 12 : 1;

    // Base module cost
    const baseModuleCost =
      selectedModulePrice?.adjustedPrice ||
      selectedBaseModule.amount * billingMultiplier * rating;

    // Add-ons cost with quantities
    const addOnsCost = addOnsList
      .filter((addon) => selectedAddOns.includes(addon.id))
      .reduce((sum, addon) => {
        const quantity =
          selectedModulePrice?.addOns?.find((a) => a.id === addon.id)?.assets ||
          1;
        return sum + addon.amount * quantity * billingMultiplier * rating;
      }, 0);

    // Asset types cost (using base module's amountPerAssetType)
    const assetTypesCost = selectedBaseModule.amountPerAssetType
      ? Object.entries(selectedBaseModule.amountPerAssetType).reduce(
          (sum, [assetType, tiers]) => {
            const quantity =
              selectedModulePrice?.perAssetType?.find(
                (a) => a.type === assetType
              )?.assets || 0;
            if (quantity === 0) return sum; // Skip if no assets
            const pricePerAsset = getPricePerAsset(quantity, tiers);
            return sum + pricePerAsset * quantity * billingMultiplier * rating;
          },
          0
        )
      : 0;

    const totalEstimated = baseModuleCost + addOnsCost + assetTypesCost;

    return {
      baseModuleCost,
      addOnsCost,
      assetTypesCost,
      totalEstimated,
    };
  }, [
    selectedBaseModule,
    selectedAddOns,
    addOnsList,
    selectedModulePrice,
    billingCycle,
    rating,
  ]);

  useEffect(() => {
    // Sync initial asset types and add-ons from context if not set
    if (
      selectedModulePrice &&
      !selectedModulePrice.perAssetType?.length &&
      selectedBaseModule.amountPerAssetType
    ) {
      const initialAssetTypes = Object.keys(
        selectedBaseModule.amountPerAssetType
      ).map((assetType) => ({
        type: assetType,
        assets:
          selectedModulePrice?.perAssetType?.find((a) => a.type === assetType)
            ?.assets || 0,
      }));
      initialAssetTypes.forEach((asset) =>
        updateAssetQuantity(asset.type, asset.assets)
      );
    }

    if (!selectedModulePrice?.addOns?.length) {
      const initialAddOns = addOnsList
        .filter((addon) => selectedAddOns.includes(addon.id))
        .map((addon) => ({ id: addon.id, assets: 1 }));
      initialAddOns.forEach((addon) =>
        updateAddOnQuantity(addon.id, addon.assets)
      );
    }
  }, [
    selectedAddOns,
    addOnsList,
    selectedModulePrice,
    selectedBaseModule,
    updateAssetQuantity,
    updateAddOnQuantity,
  ]);

  const handleQuantityChange = (assetType: string, value: number) => {
    const quantity = Math.max(0, Math.min(10, value));
    updateAssetQuantity(assetType, quantity);
  };

  const handleAddonQuantityChange = (id: number, value: number) => {
    const quantity = Math.max(0, Math.min(10, value));
    updateAddOnQuantity(id, quantity);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError("Payment system not initialized");
      return;
    }

    if (calculateCosts.totalEstimated <= 0) {
      setError("Please select at least one module or addon");
      return;
    }

    setLoading(true);
    setError(null);
    setPaymentStatus("idle");

    const form = e.currentTarget;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Payment form initialization failed");
      setLoading(false);
      return;
    }

    try {
      const { paymentMethod, error: paymentMethodError } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: {
            name: `${form.firstName.value} ${form.lastName.value}`,
            address: {
              line1: form.address.value,
              postal_code: form.zipCode.value,
              country: "CA",
            },
          },
        });

      if (paymentMethodError) throw new Error(paymentMethodError.message);

      const addOnsWithQuantities = addOnsList
        .filter((addon) => selectedAddOns.includes(addon.id))
        .map((addon) => ({
          id: addon.id,
          assets:
            selectedModulePrice?.addOns?.find((a) => a.id === addon.id)
              ?.assets || 1,
        }));

      const updatedSubscriptionPlan = {
        planId: selectedBaseModule.id,
        addOns: addOnsWithQuantities,
        interval: billingCycle,
        paymentMethodId: paymentMethod!.id,
        currency,
        perAssetType: selectedModulePrice?.perAssetType || [],
        address: form.address.value,
        addressCountry: "CA",
        addressZipCode: form.zipCode.value,
      };

      setSubscriptionPlan(updatedSubscriptionPlan);

      const response = await postPayment(updatedSubscriptionPlan);
      const baseSubscriptionClientSecret =
        response?.baseSubscriptionClientSecret;
      const addonSubscriptionClientSecret =
        response?.addonSubscriptionClientSecret;

      const confirmPayment = async (clientSecret: string) => {
        const { error } = await stripe.confirmCardPayment(clientSecret);
        if (error) throw new Error(error.message);
        return true;
      };

      if (baseSubscriptionClientSecret)
        await confirmPayment(baseSubscriptionClientSecret);

      if (addonSubscriptionClientSecret)
        await confirmPayment(addonSubscriptionClientSecret);

      setPaymentStatus("success");
    } catch (err: any) {
      setError(
        err instanceof Error && err.response?.data?.message
          ? err.response.data.message
          : "An unexpected error occurred"
      );
      setPaymentStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (paymentStatus === "success") {
      logout();
      dispatch(clearUser());
      alert(
        "Payment successful! Please check your account details in your email. Redirecting to login page..."
      );
      navigate("/login");
    }
  }, [paymentStatus, navigate]);

  const activateTrial = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const trialData = {
        planId: selectedBaseModule.id,
        perAssetType: selectedModulePrice?.perAssetType || [],
        currency: currency,
      };

      await activateTrail(trialData);
      setPaymentStatus("success");
    } catch (err: any) {
      setError(
        err instanceof Error && (err as any).response?.data?.message
          ? (err as any).response.data.message
          : "An unexpected error occurred during trial activation"
      );
      setPaymentStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      {selectedBaseModule.slug === "free-trial" &&
      selectedAddOns.length === 0 ? (
        <Button
          className="bg-[#2510CC] hover:bg-[#1020cc] rounded-3xl text-white py-6 px-8 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={(e) => activateTrial(e)}
        >
          Sign up and Continue
        </Button>
      ) : (
        <DialogTrigger asChild>
          <Button className="bg-[#2510CC] hover:bg-[#1020cc] rounded-3xl text-white py-6 px-8 font-medium">
            Review & Continue
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="p-0 sm:max-w-[900px] max-h-[85vh] overflow-auto scrollbar-hide">
        <DialogDescription>
          <div className="p-4 md:p-6 bg-[#D9DBE9] rounded-t-lg flex justify-between items-center sticky top-0 z-10">
            <h2 className="text-2xl text-gray-800 font-raleway font-normal">
              Complete Your Registration
            </h2>
          </div>
        </DialogDescription>
        {paymentStatus === "success" ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <span>
              Payment successful! Please check your account details in your
              email. Redirecting to login page...
            </span>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 p-4 md:p-6">
            <div className="space-y-6">
              <div className="border border-[#828FDC] bg-[#D9DBE9]/30 rounded-lg p-6 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <img
                      src={getBaseModuleIconBySlug(selectedBaseModule.slug)}
                      className="w-6 h-6"
                      alt={selectedBaseModule.name}
                    />
                  </div>
                  <h3 className="font-semibold text-lg">
                    {selectedBaseModule.name}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm mt-3">
                  {selectedBaseModule.description}
                </p>
                <p className="font-medium mt-2">
                  Starting at ${calculateCosts.baseModuleCost.toFixed(2)}/
                  {billingCycle === "year"
                    ? "annually"
                    : selectedModulePrice?.chargeDuration || "month"}
                </p>
                {selectedBaseModule.amountPerAssetType &&
                  Object.entries(selectedBaseModule.amountPerAssetType).map(
                    ([assetType, tiers]) => {
                      const quantity =
                        selectedModulePrice?.perAssetType?.find(
                          (a) => a.type === assetType
                        )?.assets || 0;
                      return (
                        <div
                          key={assetType}
                          className="flex items-center justify-between mt-4 rounded-md shadow-sm border border-gray-300 px-4 py-2"
                        >
                          <span className="text-gray-700 capitalize">
                            {assetType.replace(/-/g, " ")}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              id={`quantity-${assetType}`}
                              className="w-20 text-center rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                              value={quantity}
                              min="0"
                              max="10"
                              onChange={(e) =>
                                handleQuantityChange(
                                  assetType,
                                  parseInt(e.target.value) || 0
                                )
                              }
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3">Selected Add-ons</h3>
                <div className="space-y-4 bg-[#F9FAFB99]">
                  {addOnsList
                    .filter((addon) => selectedAddOns.includes(addon.id))
                    .map((addon) => {
                      const quantity =
                        selectedModulePrice?.addOns?.find(
                          (a) => a.id === addon.id
                        )?.assets || 1;
                      return (
                        <div
                          key={addon.slug}
                          className="border rounded-lg p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="bg-primary/10 p-2 rounded-md">
                              <img
                                src={getAddOnsIconBySlug(addon.slug)}
                                alt={addon.name}
                                className="w-6 h-6"
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold">{addon.name}</h4>
                              <p className="text-sm text-gray-500">
                                ${(addon.amount * rating).toFixed(2)}/
                                {addon.chargeDuration}
                              </p>
                            </div>
                          </div>
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            className="text-center w-16"
                            value={quantity}
                            onChange={(e) =>
                              handleAddonQuantityChange(
                                addon.id,
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Estimated Cost</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base Module ({selectedBaseModule.name})</span>
                    <span className="font-medium">
                      ${calculateCosts.baseModuleCost.toFixed(2)}
                    </span>
                  </div>
                  {calculateCosts.assetTypesCost > 0 && (
                    <div className="flex justify-between">
                      <span>Asset Types</span>
                      <span className="font-medium">
                        ${calculateCosts.assetTypesCost.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {calculateCosts.addOnsCost > 0 && (
                    <div className="flex justify-between">
                      <span>Add-ons</span>
                      <span className="font-medium">
                        ${calculateCosts.addOnsCost.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="h-px bg-gray-200 my-2"></div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Estimated Cost</span>
                    <span>
                      ${calculateCosts.totalEstimated.toFixed(2)}/
                      {billingCycle === "year" ? "year" : "month"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * Actual pricing may vary based on usage and specific
                    requirements.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col rounded-lg self-start">
              <h3 className="text-xl font-semibold mb-6">
                Your Payment Information
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name*</Label>
                    <Input id="firstName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name*</Label>
                    <Input id="lastName" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Card Details*</Label>
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#424770",
                          "::placeholder": { color: "#aab7c4" },
                        },
                        invalid: { color: "#9e2146" },
                      },
                      hidePostalCode: true,
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Address*</Label>
                  <div className="relative">
                    <Input id="country" value="Canada" disabled readOnly />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <img
                        src={CanadaFlagSvg}
                        alt="Canada Flag"
                        className="w-6 h-4"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address*</Label>
                  <Input id="address" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code/Postal Code*</Label>
                  <Input id="zipCode" required />
                </div>
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox id="terms" required />
                  <Label htmlFor="terms" className="text-sm leading-none pt-1">
                    I agree to the{" "}
                    <a
                      href="https://www.Synopsfleet.ai/privacy-policy/"
                      className="text-blue-500 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="https://www.Synopsfleet.ai/terms-of-service/"
                      className="text-blue-500 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Synops’s privacy policy
                    </a>
                  </Label>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#2563EB] hover:bg-[#2571eb] py-6 rounded-[6px]"
                  size="lg"
                  disabled={loading || !stripe || !elements}
                >
                  {loading ? "Processing..." : "Submit"}
                </Button>
              </form>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
