"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
} from "react";

interface AssetType {
  type: string;
  assets: number;
}

export interface ModulePrice {
  slug: string;
  basePrice: number;
  adjustedPrice: number;
  chargeDuration: "month" | "year";
  perAssetType: AssetType[];
  addOns: { id: number; assets: number }[];
}

interface SubscriptionPlan {
  planId: number;
  addOns: { id: number; assets: number }[];
  interval: "month" | "year";
  paymentMethodId: string;
  currency: "CAD" | "USD" | "EUR" | "GBP";
}

interface PricingContextType {
  currency: "CAD" | "USD" | "EUR" | "GBP";
  setCurrency: (currency: "CAD" | "USD" | "EUR" | "GBP") => void;
  billingCycle: "month" | "year";
  setBillingCycle: (cycle: "month" | "year") => void;
  rating: number;
  setRating: (rating: number) => void;
  ratingMap: Record<string, number>;
  setRatingMap: (map: Record<string, number>) => void;
  selectedModulePrice: ModulePrice | null;
  setSelectedModulePrice: (price: ModulePrice | null) => void;
  subscriptionPlan: SubscriptionPlan;
  setSubscriptionPlan: (plan: SubscriptionPlan) => void;
  updateAssetQuantity: (assetType: string, quantity: number) => void;
  updateAddOnQuantity: (addOnId: number, quantity: number) => void;
  assetRange: { max: number; min: number };
  setAssetRange?: (max: number, min: number) => void;
}

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export function PricingProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<"CAD" | "USD" | "EUR" | "GBP">(
    "CAD"
  );
  const [assetRange, setAssetRange] = useState<{ max: number; min: number }>({
    max: 0,
    min: 0,
  });
  const [billingCycle, setBillingCycle] = useState<"month" | "year">("month");
  const [ratingMap, setRatingMap] = useState<Record<string, number>>({
    CAD: 1,
    USD: 0.74,
    EUR: 0.68,
    GBP: 0.58,
  });
  const [rating, setRating] = useState<number>(ratingMap["CAD"]);
  const [selectedModulePrice, setSelectedModulePrice] =
    useState<ModulePrice | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>({
    planId: 0,
    addOns: [],
    interval: "month",
    paymentMethodId: "",
    currency: "CAD",
  });

  useEffect(() => {
    const newRating = ratingMap[currency] || 1;
    setRating(newRating);

    if (selectedModulePrice) {
      const multiplier = billingCycle === "year" ? 12 : 1;
      setSelectedModulePrice({
        ...selectedModulePrice,
        adjustedPrice: selectedModulePrice.basePrice * newRating * multiplier,
        chargeDuration: billingCycle,
      });
    }
  }, [currency, billingCycle, ratingMap]);

  const updateAssetQuantity = (assetType: string, quantity: number) => {
    if (selectedModulePrice) {
      const updatedAssetTypes = [...selectedModulePrice.perAssetType];
      const assetIndex = updatedAssetTypes.findIndex(
        (a) => a.type === assetType
      );
      if (assetIndex !== -1) {
        updatedAssetTypes[assetIndex] = {
          ...updatedAssetTypes[assetIndex],
          assets: quantity,
        };
      } else {
        updatedAssetTypes.push({ type: assetType, assets: quantity });
      }
      setSelectedModulePrice({
        ...selectedModulePrice,
        perAssetType: updatedAssetTypes,
      });
    }
  };
  const updateAddOnQuantity = (addOnId: number, quantity: number) => {
    if (selectedModulePrice) {
      const updatedAddOns = [...selectedModulePrice.addOns];
      const addOnIndex = updatedAddOns.findIndex((a) => a.id === addOnId);
      if (addOnIndex !== -1) {
        updatedAddOns[addOnIndex] = {
          ...updatedAddOns[addOnIndex],
          assets: quantity,
        };
      } else {
        updatedAddOns.push({ id: addOnId, assets: quantity });
      }
      setSelectedModulePrice({
        ...selectedModulePrice,
        addOns: updatedAddOns,
      });
    }
  };

  const value: PricingContextType = useMemo(
    () => ({
      currency,
      setCurrency,
      billingCycle,
      setBillingCycle,
      rating,
      assetRange,
      setAssetRange: (max: number, min: number) => {
        setAssetRange({ max, min });
      },
      setRating,
      ratingMap,
      setRatingMap,
      selectedModulePrice,
      setSelectedModulePrice: (price: ModulePrice | null) => {
        if (price) {
          const multiplier = billingCycle === "year" ? 12 : 1;
          setSelectedModulePrice({
            ...price,
            adjustedPrice: price.basePrice * rating * multiplier,
            chargeDuration: billingCycle,
            perAssetType: price.perAssetType || [],
            addOns: price.addOns || [],
          });
        } else {
          setSelectedModulePrice(null);
        }
      },
      subscriptionPlan,
      setSubscriptionPlan,
      updateAssetQuantity,
      updateAddOnQuantity,
      
    }),
    [
      currency,
      billingCycle,
      rating,
      ratingMap,
      selectedModulePrice,
      subscriptionPlan,
      assetRange
    ]
  );

  return (
    <PricingContext.Provider value={value}>{children}</PricingContext.Provider>
  );
}

export function usePricing() {
  const context = useContext(PricingContext);
  if (context === undefined) {
    throw new Error("usePricing must be used within a PricingProvider");
  }
  return context;
}
