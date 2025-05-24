import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import EnterpriseCTA from "./components/EnterpriseCTA";
import PricingCard from "./components/PricingCard";
import { getBaseModuleIconBySlug } from "@/lib/utils";
import AssetIcon from "./svg/assetIcon.svg";
import { usePricing } from "@/context/SignUpContext";
import { useQuestionnaireContext } from "@/context/QuestionnaireContext";
import { postQuestionnaireData } from "@/utils/api";

// Define types for module and props
interface Module {
  slug: string;
  name: string;
  description: string;
  amount: number;
  chargeDuration: string;
  features?: string[];
  amountPerAssetType: {
    [key: string]: {
      max: number | null;
      min: number;
      amount: number;
      currency: string;
    }[];
  };
}

interface PricingPageProps {
  onSelectModule: (module: string) => void;
  moduleList: Record<string, Module>;
  selectedModule: string;
  setSuggestedBaseModule: (module: string) => void;
  updateModuleList?: (modules: any[]) => void;
}

export default function PricingPage({
  setSuggestedBaseModule,
  selectedModule,
  onSelectModule,
  moduleList,
  updateModuleList,
}: Readonly<PricingPageProps>) {
  const scrollToTop = (moduleSlug: string) => {
    onSelectModule(moduleSlug);
    window.scrollTo({
      top: 80,
      behavior: "smooth",
    });
  };

  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const {
    currency,
    setCurrency,
    billingCycle,
    ratingMap,
    setBillingCycle,
    rating,
    selectedModulePrice,
    setSelectedModulePrice,
    updateAssetQuantity,
  } = usePricing();
  const [label, setLabel] = useState("Recommended");
  const questionnaireContext = useQuestionnaireContext();
  const [hasCalledApi, setHasCalledApi] = useState(false);
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current += 1;
    // Only run API call once when component mounts
    if (!hasCalledApi) {

      const resubmitQuestionnaireData = async () => {
        try {

          let questionnaireData;
          let token;

          // Try to get data from context
          if (questionnaireContext) {
            questionnaireData = questionnaireContext.getQuestionnaireData();
            token = questionnaireContext.getToken();
          }

          // If not found in context, try localStorage
          if (!questionnaireData || !token) {
            const storedData = localStorage.getItem("questionnaire_data");
            const storedToken = localStorage.getItem("auth_token");

            if (storedData && storedToken) {
              questionnaireData = JSON.parse(storedData);
              token = storedToken;
            }
          }

          // If we have data, call API
          if (questionnaireData && token) {
            const data = await postQuestionnaireData(questionnaireData, token);
            // Process the data if needed
            if (data && data.systemPlansMapped) {
              // Process custom plans
              const customPlans = Object.values(data.systemPlansMapped).filter(
                (plan: any) => plan.type === "custom"
              );

              if (customPlans.length > 0) {
                const customPlan = customPlans[0];
                setSuggestedBaseModule(customPlan.slug);
                setLabel("Custom");

                setSelectedModulePrice({
                  slug: customPlan.slug,
                  basePrice: customPlan.amount,
                  adjustedPrice:
                    customPlan.amount *
                    rating *
                    (billingCycle === "year" ? 12 : 1),
                  chargeDuration: customPlan.chargeDuration || "month",
                  perAssetType: [],
                  addOns: [],
                });
              }

              // Update module list if needed
              if (
                customPlans.length > 0 &&
                !Object.values(moduleList).some(
                  (plan: any) => plan.type === "custom"
                ) &&
                updateModuleList
              ) {
                const allModulePlans = Object.values(
                  data.systemPlansMapped
                ).filter(
                  (plan: any) => plan.type === "basic" || plan.type === "custom"
                );

                updateModuleList(allModulePlans);
              }
            }
          } else {
            console.log(
              "No questionnaire data found in context or localStorage"
            );
          }
        } catch (error) {
          console.error("Error in fetching questionnaire data:", error);
        } finally {
          setHasCalledApi(true);
        }
      };

      // Call the function
      resubmitQuestionnaireData();
    }
  }, []);

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

  // Handle quantity change
  const handleQuantityChange = (assetType: string, value: string) => {
    const quantity = parseInt(value) || 0;
    updateAssetQuantity(assetType, quantity);
  };

  // Calculate costs for each asset type
  const calculateAssetCosts = (module: Module) => {
    const costs: Record<string, { pricePerAsset: number; total: number }> = {};

    Object.entries(module.amountPerAssetType).forEach(([assetType, tiers]) => {
      let quantity =
        selectedModulePrice?.perAssetType.find((a) => a.type === assetType)
          ?.assets || 0;
      let discountedQuantity = quantity;
      if (module.slug === "free-trial") {
        discountedQuantity = Math.max(0, quantity - 10);
      }
      const pricePerAsset = getPricePerAsset(quantity, tiers);

      costs[assetType] = {
        pricePerAsset,
        total:
          discountedQuantity *
          pricePerAsset *
          rating *
          (billingCycle === "year" ? 12 : 1),
      };
    });
    return costs;
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 font-raleway">
      <h2 className="text-xl mb-8 text-purple-200">
        Step 1: Select a Base Module
      </h2>
      {/* Billing Toggle */}
      <div
        id="selection"
        className="flex items-center justify-between max-w-[724px] mx-auto mb-8"
      >
        <div className="flex items-center gap-4">
          <span
            className={`${
              billingCycle === "month" ? "text-white" : "text-gray-400"
            }`}
          >
            Monthly
          </span>
          <button
            className="w-12 h-6 bg-purple-700 rounded-full p-1 flex items-center"
            onClick={() =>
              setBillingCycle(billingCycle === "month" ? "year" : "month")
            }
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                billingCycle === "year" ? "translate-x-6" : ""
              }`}
            />
          </button>
          <span
            className={`${
              billingCycle === "year" ? "text-white" : "text-gray-400"
            }`}
          >
            Annually
          </span>
        </div>

        {/* Currency Selector */}
        <div className="relative w-full sm:w-auto">
          <button
            className="flex items-center justify-between w-full sm:w-auto gap-2 border-gray-600 rounded px-3 py-1.5 dark:border-neutral-800"
            onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
          >
            <span>Choose your currency</span>
            <div className="flex items-center gap-1">
              {currency === "CAD" && <span className="text-xs">🇨🇦</span>}
              {currency === "USD" && <span className="text-xs">🇺🇸</span>}
              {currency === "EUR" && <span className="text-xs">🇪🇺</span>}
              {currency === "GBP" && <span className="text-xs">🇬🇧</span>}
              <span>{currency}</span>
              <ChevronDown size={16} />
            </div>
          </button>

          {showCurrencyDropdown && (
            <div className="absolute right-0 mt-1 bg-white text-black rounded shadow-lg z-10 w-full sm:w-auto">
              <button
                className="flex items-center gap-2 px-4 py-2 w-full rounded hover:bg-gray-100"
                onClick={() => {
                  setCurrency("USD");
                  setShowCurrencyDropdown(false);
                }}
              >
                <span className="text-xs">🇺🇸</span> USD
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 w-full rounded hover:bg-gray-100"
                onClick={() => {
                  setCurrency("EUR");
                  setShowCurrencyDropdown(false);
                }}
              >
                <span className="text-xs">🇪🇺</span> EUR
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100"
                onClick={() => {
                  setCurrency("GBP");
                  setShowCurrencyDropdown(false);
                }}
              >
                <span className="text-xs">🇬🇧</span> GBP
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 w-full rounded hover:bg-gray-100"
                onClick={() => {
                  setCurrency("CAD");
                  setShowCurrencyDropdown(false);
                }}
              >
                <span className="text-xs">🇨🇦</span> CAD
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Main Pricing Card */}
      {Object.values(moduleList)
        .filter((module) => {
          return module.slug === selectedModule;
        })
        .map((module: any) => {
          const assetCosts = calculateAssetCosts(module);
          const total = Object.values(assetCosts).reduce(
            (sum, cost) => sum + cost.total,
            0
          );

          return (
            <div key={module.slug} className="flex flex-col md:flex-row gap-9">
              <div className="relative w-full md:w-[724px] mx-auto bg-[#D9DBE9] text-black rounded-3xl overflow-hidden mb-16 p-5 md:p-10 shadow-[0px_2px_12px_0px_rgba(20,20,43,0.08)] flex-grow">
                <div>
                  <div className="place-content-center hidden lg:block lg:absolute text-xs top-[46px] right-11 p-2 px-5 h-[40px] bg-[#2510CC66] text-white items-center justify-center rounded-[10px] font-sans">
                    {module.type === "custom" ? "Custom" : label}
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white flex-shrink-0">
                      <img
                        src={getBaseModuleIconBySlug(module.slug)}
                        className="w-10 h-10"
                        alt={`${module.name}-icon`}
                      />
                    </div>
                    <div>
                      <span className="text-neutral-900 text-xl font-bold font-sans">
                        {module.name}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mb-4">
                    {module.description}
                  </p>

                  <div className="mb-4">
                    <span className="text-5xl font-medium font-sans">
                      {currency === "CAD" ? "$" : currency}{" "}
                      {(billingCycle === "year"
                        ? module.amount * 12 * ratingMap[currency]
                        : module.amount * ratingMap[currency]
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                      /
                      {billingCycle === "year" ? "year" : module.chargeDuration}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="font-semibold mb-6 font-sans text-sm">
                      What's included
                    </div>
                    <ul className="space-y-4">
                      {module.features?.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="mt-0.5 w-5 h-5 rounded-full bg-[#2510CC] hover:bg-[#1045cc] flex items-center justify-center text-white">
                            <Check size={12} />
                          </div>
                          <span className="text-sm text-[#170F49] font-sans">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Card */}
              <div className="bg-[#D9DBE9] p-8 rounded-3xl max-w-md w-full text-black md:self-start place-self-center mb-12">
                {/* Loop through each asset type */}
                {Object.entries(module.amountPerAssetType).map(
                  ([assetType]) => {
                    const quantity =
                      selectedModulePrice?.perAssetType.find(
                        (a) => a.type === assetType
                      )?.assets || 0;

                    return (
                      <div
                        key={assetType}
                        className="flex items-center rounded-lg justify-between mb-3 bg-[#F9FAFB99] p-3"
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md">
                            <img src={AssetIcon} alt={assetType} />
                          </div>
                          <span className="font-medium">
                            {assetType.charAt(0).toUpperCase() +
                              assetType.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-20">
                          <span className="text-gray-700">
                            $
                            {(
                              assetCosts[assetType].pricePerAsset *
                              rating *
                              (billingCycle === "year" ? 12 : 1)
                            ).toFixed(2)}
                            /Units
                          </span>
                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) =>
                              handleQuantityChange(assetType, e.target.value)
                            }
                            className="w-[60px] bg-white border-gray-200 rounded p-1 text-center"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>
                    );
                  }
                )}

                {/* Total Section */}
                <div className="flex flex-col mb-6 border-b-2 border-gray-200 pb-4 items-end">
                  <div className="flex items-end justify-end gap-2 mb-2">
                    <span className="font-bold text-base font-sans text-indigo-950">
                      Total
                    </span>
                    <div>
                      <span className="text-5xl font-bold text-indigo-950 font-sans">
                        $
                        {(
                          total + (selectedModulePrice?.adjustedPrice || 0)
                        ).toFixed(2)}
                      </span>
                      <span className="font-sans font-medium text-[#6F6C90] ml-1">
                        /{billingCycle}
                      </span>
                    </div>
                  </div>
                  {selectedModulePrice?.slug === "free-trial" && (
                    <span className="text-red-600 text-sm font-bold">
                      *After 30 days will charge $69 /monthly
                    </span>
                  )}
                </div>

                {/* Button */}
                <Button
                  onClick={() => scrollToTop(module.slug)}
                  className="w-full py-6 px-9 bg-[#2510CC] hover:bg-[#1045cc] font-sans text-white rounded-[96px] font-medium"
                >
                  Get started
                </Button>
              </div>
            </div>
          );
        })}

      {/* Additional Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {Object.values(moduleList)
          .filter((module) => {
            return module.slug !== selectedModule;
          })
          .map((module: any) => (
            <PricingCard
              key={module.slug}
              title={module.name}
              description={module.description}
              price={(billingCycle === "year"
                ? module.amount * 12 * ratingMap[currency]
                : module.amount * ratingMap[currency]
              ).toLocaleString(undefined, {
                minimumFractionDigits: currency === "CAD" ? 2 : 0,
                maximumFractionDigits: currency === "CAD" ? 2 : 0,
              })}
              duration={billingCycle === "month" ? "monthly" : "annually"}
              features={module.features}
              icon={getBaseModuleIconBySlug(module.slug)}
              isCustom={module.type === "custom"}
              onButtonClick={() => {
                setSuggestedBaseModule(module.slug);
                const selectedModuleData = (moduleList as any[]).find(
                  (item) => item.slug === module.slug
                );
                if (selectedModuleData) {
                  setSelectedModulePrice({
                    slug: selectedModuleData.slug,
                    basePrice: selectedModuleData.amount,
                    adjustedPrice:
                      selectedModuleData.amount *
                      rating *
                      (billingCycle === "year" ? 12 : 1),
                    chargeDuration: selectedModuleData.chargeDuration,
                    perAssetType: [],
                    addOns: [],
                  });
                }
                const selectionElement = document.getElementById("selection");
                if (selectionElement) {
                  selectionElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                    inline: "nearest",
                  });
                }
                setLabel(module.type === "custom" ? "Custom" : "Selected");
              }}
            />
          ))}
      </div>
      {/* Enterprise & Government */}
      <EnterpriseCTA />
    </main>
  );
}
