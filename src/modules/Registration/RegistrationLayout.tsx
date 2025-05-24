"use client";

import { useEffect, useState } from "react";
import PricingPage from "./pricing-page";
import AddOnsPage from "./add-ons-page";
import Header from "./components/header";
import ProgressSteps from "./components/ProgressSteps";
import { useLocation } from "react-router";
import { FullPageLoader } from "@/components/ui/loading";
import { usePricing } from "@/context/SignUpContext";
import { QuestionnaireProvider } from "@/context/QuestionnaireContext";

export default function RegistrationLayout() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBaseModule, setSelectedBaseModule] = useState<{
    id: number;
    slug: string;
    name: string;
    amount: number;
    chargeDuration: string;
  } | null>(null);
  const [addOnsList, setAddOnsList] = useState<
    {
      id: number;
      slug: string;
      name: string;
      amount: number;
      chargeDuration: string;
    }[]
  >([]);
  const [suggestedBaseModule, setSuggestedBaseModule] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState<number[]>([]);
  const [moduleList, setModuleList] = useState<object>([]);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const { data } = location.state || {};

  const {
    currency,
    billingCycle,
    rating,
    setRating,
    setRatingMap,
    ratingMap,
    setSelectedModulePrice,
    setAssetRange,
  } = usePricing();

  useEffect(() => {
    if (data) {

      const suggestedModuleSlug = data.suggestions?.modules[0];
      setSuggestedBaseModule(suggestedModuleSlug);
      const systemPlan = data.systemPlansMapped || {};

      // Check all plans to see if they have a type property
      const allPlans = Object.values(systemPlan);
      const plansWithoutType = allPlans.filter((plan) => !plan.type);

      let finalSystemPlan = systemPlan;
      if (plansWithoutType.length > 0) {
        // Modify the local copy of systemPlan to add missing type
        const fixedSystemPlan = { ...systemPlan };

        for (const key in fixedSystemPlan) {
          const plan = fixedSystemPlan[key];
          if (!plan.type) {
            if (plan.isCustom === true) {
              plan.type = "custom";
            } else {
              plan.type = "basic";
            }
          }
        }

        finalSystemPlan = fixedSystemPlan;
      }

      const suggestedModule = Object.values(finalSystemPlan).find(
        (plan: any) => plan.slug === suggestedModuleSlug
      ) as any;

      if (data.addonAssetRange) {
        setAssetRange(
          data.addonAssetRange?.max ?? 0,
          data.addonAssetRange?.min ?? 0
        );
      }

      if (suggestedModule) {
        setSelectedModulePrice({
          slug: suggestedModule.slug,
          basePrice: suggestedModule.amount,
          adjustedPrice:
            suggestedModule.amount *
            rating *
            (billingCycle === "year" ? 12 : 1),
          chargeDuration: suggestedModule.chargeDuration,
          perAssetType: [],
          addOns: (data.suggestions?.addons || []).map((slug: string) => {
            const addon = Object.values(finalSystemPlan).find(
              (plan: any) => plan.slug === slug
            ) as any;
            return {
              id: addon?.id,
              assets: 1,
            };
          }),
        });
      } else {
        setSelectedModulePrice(null);
      }

      setSelectedAddOns(
        (data.suggestions?.addons || []).map((slug: string) => {
          const addon = Object.values(finalSystemPlan).find(
            (plan: any) => plan.slug === slug
          ) as any;
          return addon?.id;
        })
      );

      setRatingMap(data.currencyMap);
      setRating(ratingMap?.[currency] ?? 0);

      const addonPlans = Object.values(finalSystemPlan).filter(
        (plan: any) => plan.type === "addon"
      );
      setAddOnsList(addonPlans as any);

      // CRITICAL: Include both basic and custom type plans in the moduleList
      const modulePlans = Object.values(finalSystemPlan).filter((plan: any) => {
        const isBasicOrCustom = plan.type === "basic" || plan.type === "custom";
        return isBasicOrCustom;
      });

      setModuleList(modulePlans as any);
    } else {
      window.location.href = "/questionnaire";
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [data]);

  const handleBaseModuleSelection = (module: string) => {

    // Use Object.values() to convert the moduleList object to an array if it's not already
    const modulesArray = Array.isArray(moduleList)
      ? moduleList
      : Object.values(moduleList);

    // Find the selected module by slug
    const selectedModule = modulesArray.find((m: any) => m.slug === module);

    if (selectedModule) {
      // Make sure all required properties are present
      if (!selectedModule.id) {
        console.warn(`Module ${module} is missing id, adding a default one`);
        selectedModule.id = Date.now(); // Generate a temporary ID if missing
      }

      setSelectedBaseModule({
        id: selectedModule.id,
        slug: selectedModule.slug,
        name: selectedModule.name,
        amount: selectedModule.amount,
        chargeDuration: selectedModule.chargeDuration || "month",
      });

      setCurrentStep(2);
    } else {
      console.error(`Could not find module with slug: ${module}`);
    }
  };

  const handleAddOnsSelection = (addOns: number[]) => {
    setSelectedAddOns(addOns);
    setCurrentStep(3);
  };

  const updateModuleList = (newModules: any[]) => {
    setModuleList(newModules);
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <QuestionnaireProvider>
      <>
        {loading ? (
          <div className="fixed inset-0 flex items-center justify-center bg-[#090014] transition-opacity duration-500 opacity-100">
            <FullPageLoader message="Our AI is analyzing your needs to suggest the best plan." />
          </div>
        ) : (
          <div className="min-h-screen bg-[#090014] text-white overflow-hidden">
            <Header />

            <ProgressSteps currentStep={currentStep} />

            {currentStep === 1 && (
              <PricingPage
                onSelectModule={handleBaseModuleSelection}
                moduleList={moduleList}
                selectedModule={suggestedBaseModule}
                setSuggestedBaseModule={setSuggestedBaseModule}
                updateModuleList={updateModuleList}
              />
            )}
            {currentStep === 2 && (
              <AddOnsPage
                addOnsList={addOnsList}
                selectedBaseModule={selectedBaseModule as any}
                preSelectAddOns={selectedAddOns}
                onSelectAddOns={handleAddOnsSelection}
                billingCycle={billingCycle}
                onBack={goBack}
                rating={rating}
              />
            )}
            {currentStep === 3 && (
              <div className="min-h-screen bg-[#090014] text-white flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">
                    Complete Registration
                  </h1>
                  <p className="mb-6">
                    This would be the final step to complete registration.
                  </p>
                  <button
                    onClick={goBack}
                    className="bg-blue-600 text-white rounded-md py-2 px-6 font-medium"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </>
    </QuestionnaireProvider>
  );
}
