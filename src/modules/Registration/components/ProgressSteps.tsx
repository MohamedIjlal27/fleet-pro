import React from "react";

interface ProgressStepsProps {
  currentStep: number;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep }) => {
  const steps = [
    { step: 1, label: "Select Base Module" },
    { step: 2, label: "Choose Add-ons" },
    { step: 3, label: "Complete Registration" },
  ];

  const getStepClass = (step: number) => {
    if (step <= currentStep) {
      return "border-purple-300 text-purple-300"; // Completed step
    } else {
      return "border-[#9CA3AF] text-[#9CA3AF]"; // Inactive step
    }
  };

  return (
    <div className="flex justify-between md:items-center max-w-6xl mx-auto p-4 font-raleway space-y-2 flex-col md:flex-row">
      {steps.map((stepObj, index) => (
        <React.Fragment key={stepObj.step}>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 min-w-[2rem] my-auto rounded-full border-2 flex items-center justify-center ${getStepClass(
                stepObj.step
              )}`}
            >
              <span className="text-sm">{stepObj.step}</span>
            </div>
            <span
              className={`ml-2 text-sm font-medium ${
                stepObj.step <= currentStep
                  ? "text-purple-300"
                  : "text-[#9CA3AF]"
              }`}
            >
              {stepObj.label}
            </span>
          </div>

          {index < steps.length - 1 && (
            <div
              className={`hidden md:block w-[227px] h-[2px] mx-2 ${
                currentStep > stepObj.step
                  ? "bg-gradient-to-l from-purple-300 to-[rgba(255, 255, 255, 0.4)]"
                  : "bg-gradient-to-l from-[#E5E7EB] to-[rgba(255, 255, 255, 0.4)]"
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProgressSteps;
