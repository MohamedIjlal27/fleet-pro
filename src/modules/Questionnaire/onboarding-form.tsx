import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CarOptionImg from "./img/car_default.png";
import BusOptionImg from "./img/bus_default.png";
import CarEvOptionImg from "./img/ev_default.png";
import OtherOptionImg from "./img/other_default_new.png";
import TrailerOptionImg from "./img/trailer_default.png";
import TruckOptionImg from "./img/truck_default.png";
import { useNavigate } from "react-router";
import SynopsLogo from "@/assets/Synops-Logo-Light.png"; // Adjust path based on structure

import {
  DashcamSvg,
  DriverSvg,
  InspectionSvg,
  GpsSvg,
  InsightsSvg,
  OtherSvg,
  RouteSvg,
  RepairSvg,
  AppointmentSvg,
} from "@/icons";

import { Label } from "@/components/ui/label";
import { postQuestionnaireData, signUpOrganization } from "@/utils/api";
import { logout } from "../Public/apis/apis";
import { useAppDispatch, useAppSelector } from "../../redux/app/store";
import { clearUser } from "@/redux/features/user";
import {
  QuestionnaireProvider,
  useQuestionnaireContext,
} from "@/context/QuestionnaireContext";


type AssetType = 1 | 2 | 3 | 4 | 5 | 6 | 7;
// type AssetType = "cars" | "vans" | "buses" | "trailers" | "electric" | "other";
type FleetSize = 1 | 2 | 3 | 4 | 5;
// type FleetSize = "1-5" | "6-29" | "30-499" | "500-4999" | "5000+";

type FeatureType =
  | "gps"
  | "eld"
  | "dashCams"
  | "maintenance"
  | "routing"
  | "crm"
  | "driverBehaviour"
  | "aiInspection"
  | "others";

function OnboardingForm() {
  const [step, setStep] = useState<number>(1);
  const [selectedAssets, setSelectedAssets] = useState<AssetType[]>([]);
  const [fleetSize, setFleetSize] = useState<FleetSize>(1);
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureType[]>([]);
  const [isPrivacyPolicyAccepted, setIsPrivacyPolicyAccepted] =
    useState<boolean>(false);
  const [privacyPolicyError, setPrivacyPolicyError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { storeQuestionnaireData } = useQuestionnaireContext();
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
  });
  const navigate = useNavigate();

  // Add state for error messages
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
    message: "",
  });

  // Validation function to check required fields
  const validateUserInfo = () => {
    const newErrors = {
      firstName: userInfo.firstName ? "" : "First name is required",
      lastName: userInfo.lastName ? "" : "Last name is required",
      companyName: userInfo.companyName ? "" : "Company name is required",
      email: userInfo.email ? "" : "Email is required",
      phone: userInfo.phone ? "" : "Phone number is required",
      message: "",
    };
    setErrors(newErrors);

    // Return true if there are no errors (all fields filled)
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleAssetToggle = (asset: AssetType) => {
    if (selectedAssets.includes(asset)) {
      setSelectedAssets(selectedAssets.filter((a) => a !== asset));
    } else {
      setSelectedAssets([...selectedAssets, asset]);
    }
  };

  const handleFeatureToggle = (feature: FeatureType) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (step === 1 && selectedAssets.length === 0) {
      return;
    }
    setStep(step + 1);
  };
  const handleSubmit = async () => {
    if (!isPrivacyPolicyAccepted) {
      setPrivacyPolicyError("You must accept the privacy policy to proceed.");
      return;
    }

    if (!validateUserInfo()) {
      return;
    }
    setLoading(true);
    try {
      const response = await signUpOrganization(userInfo);
      if (response && response.token) {
        const token = response.token;

        const questionnaire = {
          assetTypes: selectedAssets,
          assetCount: fleetSize,
          featureInterests: selectedFeatures,
        };

        storeQuestionnaireData(questionnaire, token);
        postQuestionnaireData(questionnaire, token).then((data) => {
          navigate("/registration", { state: { data } });
        });
      }
    } catch (err: any) {
      console.error("Sign-up error:", err);
      if (err?.response?.data?.message) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          message: err.response.data.message,
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          message: "An unexpected error occurred.",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-[#090014] text-white overflow-hidden flex justify-between flex-col">
      {" "}
      <header className="border-b border-gray-800 p-4 flex justify-center bg-black text-white">
        <div className="text-2xl font-bold">
          <img
            src={SynopsLogo}
            alt="Synops Logo"
            className="object-contain w-24"
          />
        </div>
      </header>
      <div className="bg-[#090014] text-white overflow-hidden items-center justify-center flex">
        <div className="bg-white rounded-3xl w-full max-w-3xl p-8 md:p-12 font-raleway justify-between flex flex-col">
          {step === 1 && (
            <div className="space-y-10">
              <h1 className="text-center text-2xl font-semibold text-[#0E0618] ">
                To help us better understand your needs, what type(s) of assets
                are you working with?
              </h1>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mx-auto max-w-xl justify-items-center">
                <AssetOption
                  image={CarOptionImg}
                  label="Cars"
                  selected={selectedAssets.includes(1)}
                  onClick={() => handleAssetToggle(1)}
                />
                <AssetOption
                  image={TruckOptionImg}
                  label="Vans/Trucks"
                  selected={selectedAssets.includes(2)}
                  onClick={() => handleAssetToggle(2)}
                />
                <AssetOption
                  image={BusOptionImg}
                  label="Buses"
                  selected={selectedAssets.includes(3)}
                  onClick={() => handleAssetToggle(3)}
                />
                <AssetOption
                  image={TrailerOptionImg}
                  label="Trailers"
                  selected={selectedAssets.includes(4)}
                  onClick={() => handleAssetToggle(4)}
                />
                <AssetOption
                  image={CarEvOptionImg}
                  label="Electric Vehicles"
                  selected={selectedAssets.includes(5)}
                  onClick={() => handleAssetToggle(5)}
                />
                <AssetOption
                  image={OtherOptionImg}
                  label="Other"
                  selected={selectedAssets.includes(7)}
                  onClick={() => handleAssetToggle(7)}
                />
              </div>

              {selectedAssets.length === 0 && (
                <p className="text-center text-red-500 text-sm">
                  Please select at least one
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10">
              <h1 className="text-center text-2xl md:text-3xl font-semibold text-[#0E0618]">
                We can definitely help with that! How many vehicles or assets do
                you have?
              </h1>

              <div className="space-y-4">
                <SizeOption
                  label="1 - 5"
                  selected={fleetSize === 1}
                  onClick={() => setFleetSize(1)}
                />
                <SizeOption
                  label="6 - 29"
                  selected={fleetSize === 2}
                  onClick={() => setFleetSize(2)}
                />
                <SizeOption
                  label="30 - 499"
                  selected={fleetSize === 3}
                  onClick={() => setFleetSize(3)}
                />
                <SizeOption
                  label="500 - 4,999"
                  selected={fleetSize === 4}
                  onClick={() => setFleetSize(4)}
                />
                <SizeOption
                  label="5,000+"
                  selected={fleetSize === 5}
                  onClick={() => setFleetSize(5)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10">
              <h1 className="text-center text-2xl md:text-2xl font-semibold text-[#0E0618]">
                What feature(s) are you most interested in?
              </h1>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mx-auto max-w-xl justify-items-center">
                <FeatureOption
                  svg={GpsSvg}
                  imgWidth="w-8"
                  label="GPS & Real-time Tracking"
                  selected={selectedFeatures.includes("gps")}
                  onClick={() => handleFeatureToggle("gps")}
                />
                <FeatureOption
                  svg={InsightsSvg}
                  imgWidth="w-8"
                  label="ELD Compliance & Reporting"
                  selected={selectedFeatures.includes("eld")}
                  onClick={() => handleFeatureToggle("eld")}
                />
                <FeatureOption
                  svg={DashcamSvg}
                  imgWidth="w-9"
                  label="Dashcams"
                  selected={selectedFeatures.includes("dashCams")}
                  onClick={() => handleFeatureToggle("dashCams")}
                />
                <FeatureOption
                  svg={RepairSvg}
                  imgWidth="w-8"
                  label="Maintenance & Work Order Management"
                  selected={selectedFeatures.includes("maintenance")}
                  onClick={() => handleFeatureToggle("maintenance")}
                />
                <FeatureOption
                  svg={RouteSvg}
                  label="Routing & Dispatch"
                  imgWidth="w-9"
                  selected={selectedFeatures.includes("routing")}
                  onClick={() => handleFeatureToggle("routing")}
                />
                <FeatureOption
                  svg={AppointmentSvg}
                  imgWidth="w-9"
                  label="CRM & Lead Management"
                  selected={selectedFeatures.includes("crm")}
                  onClick={() => handleFeatureToggle("crm")}
                />
                <FeatureOption
                  svg={DriverSvg}
                  imgWidth="w-8"
                  label="Driver Behavior Monitoring"
                  selected={selectedFeatures.includes("driverBehaviour")}
                  onClick={() => handleFeatureToggle("driverBehaviour")}
                />
                <FeatureOption
                  svg={InspectionSvg}
                  label="AI Inspection"
                  imgWidth="w-9"
                  selected={selectedFeatures.includes("aiInspection")}
                  onClick={() => handleFeatureToggle("aiInspection")}
                />
                <FeatureOption
                  svg={OtherSvg}
                  label="Other"
                  imgWidth="w-9"
                  selected={selectedFeatures.includes("others")}
                  onClick={() => handleFeatureToggle("others")}
                />
              </div>
              {/* Add this conditional message */}
              {selectedFeatures.length === 0 && (
                <p className="text-center text-red-500 text-sm">
                  Please select at least one
                </p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-10">
              <h1 className="text-center text-2xl font-semibold text-[#0E0618] mx-auto">
                Almost! What's your name and your company name?
              </h1>

              <div className="space-y-6 w-full md:w-4/5 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-medium block text-left text-[#170F49]"
                    >
                      First name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      value={userInfo.firstName}
                      onChange={handleInputChange}
                      className="border-[1.5px] border-[#D1D5DB] text-black focus:border-[3px] focus:border-[#0384FB] ring-0 py-5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="lastName"
                      className="text-sm font-medium block text-left text-[#170F49]"
                    >
                      Last name
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      value={userInfo.lastName}
                      onChange={handleInputChange}
                      className="border-[1.5px] border-[#D1D5DB] text-black focus:border-[3px] focus:border-[#0384FB] focus:outline-none ring-0 py-5"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="companyName"
                    className="text-sm font-medium block text-left text-[#170F49]"
                  >
                    Company Name
                  </label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="Your Org Inc."
                    value={userInfo.companyName}
                    onChange={handleInputChange}
                    className="border-[1.5px] border-[#D1D5DB] text-black focus:border-[3px] focus:border-[#0384FB] focus:outline-none ring-0 py-5"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-10">
              <h1 className="text-center text-2xl font-semibold text-[#0E0618] mx-auto">
                Finally, what's your email and phone number?{" "}
              </h1>
              <div className="space-y-6 w-full md:w-4/5 mx-auto">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium block text-left text-[#170F49]"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      placeholder="john.doe@example.com"
                      value={userInfo.email}
                      onChange={handleInputChange}
                      className="border-[1.5px] border-[#D1D5DB] text-black focus:border-[3px] focus:border-[#0384FB] ring-0 py-5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="phoneNumber"
                      className="text-sm font-medium block text-left text-[#170F49]"
                    >
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="123-456-7890"
                      value={userInfo.phone}
                      onChange={handleInputChange}
                      className="border-[1.5px] border-[#D1D5DB] text-black focus:border-[3px] focus:border-[#0384FB] ring-0 py-5"
                    />
                  </div>
                </div>

                {privacyPolicyError && (
                  <p className="text-center text-red-500 text-sm">
                    {privacyPolicyError}
                  </p>
                )}
                <div>
                  {errors.firstName && (
                    <p className="text-red-500 text-sm text-center">
                      * {errors.firstName}
                    </p>
                  )}
                  {errors.lastName && (
                    <p className="text-red-500 text-sm text-center">
                      * {errors.lastName}
                    </p>
                  )}
                  {errors.companyName && (
                    <p className="text-red-500 text-sm text-center">
                      * {errors.companyName}
                    </p>
                  )}
                  {errors.email && (
                    <p className="text-red-500 text-sm text-center">
                      * {errors.email}
                    </p>
                  )}
                  {errors.phone && (
                    <p className="text-red-500 text-sm text-center">
                      * {errors.phone}
                    </p>
                  )}
                  {errors.message && (
                    <p className="text-red-500 text-sm text-center">
                      * {errors.message}
                    </p>
                  )}
                </div>
                <div className="space-y-4">
                  <label
                    htmlFor="privacyPolicy"
                    className="flex items-center space-x-2"
                  >
                    <Input
                      id="privacyPolicy"
                      type="checkbox"
                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={isPrivacyPolicyAccepted}
                      onChange={() => {
                        setIsPrivacyPolicyAccepted(!isPrivacyPolicyAccepted);
                        setPrivacyPolicyError("");
                      }}
                    />
                    <span className="text-sm text-gray-900">
                      I accept my personal data shall be processed in accordance
                      with the{" "}
                      <a
                        href="https://www.Synopsfleet.ai/privacy-policy/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        Synops’s privacy policy
                      </a>
                      , which also includes information in relation to my
                      rights.
                    </span>
                  </label>
                  <label
                    htmlFor="contactAgreement"
                    className="flex items-center space-x-2"
                  >
                    <Input
                      id="contactAgreement"
                      type="checkbox"
                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-900">
                      I agree that Synops may contact me about their products and
                      services.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-between mt-12">
            <Button
              variant="outline"
              className="w-52 rounded-[96px] px-20 py-6 text-sm border-2 border-[#2510CC] text-[#2510CC] hover:text-[#2510CC] font-sans font-bold hover:bg-[#E0D6FF] disabled:bg-transparent disabled:text-gray-500 disabled:border-gray-400"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            {step === 5 ? (
              <Button
                className="w-52 rounded-full px-20 py-6 bg-[#2510CC] hover:bg-[#1020ccf7]"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            ) : (
              <Button
                className="w-52 rounded-full px-20 py-6 bg-[#2510CC] hover:bg-[#1020ccf7]"
                onClick={handleNext}
                disabled={
                  (step === 1 && selectedAssets.length === 0) ||
                  (step === 3 && selectedFeatures.length === 0)
                }
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="text-center mb-8 text-sm">
        Already have an account?{""}
        <a href="/login" className="font-medium">
          {""} Sign in.
        </a>
      </div>
    </div>
  );
}

interface AssetOptionProps {
  image: string;
  imgWidth?: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

function AssetOption({
  image,
  label,
  selected,
  imgWidth = "w-16",
  onClick,
}: Readonly<AssetOptionProps>) {
  return (
    <button
      className={`flex flex-col items-center justify-center p-6 w-44 h-32 rounded-3xl border transition-all relative ${
        selected
          ? "border-[#1F5ADB] bg-[#EFF1FF]"
          : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      <div className={`mb-2 ${selected ? "text-[#1F5ADB]" : "text-gray-700"}`}>
        <img
          src={image}
          alt={label}
          className={`${imgWidth} h-auto object-contain`}
          draggable="false"
        />
      </div>
      <div
        className={`text-sm ${selected ? "text-[#1F5ADB]" : "text-gray-700"}`}
      >
        {label}
      </div>
      <div className="absolute top-3 right-3">
        <div
          className={`w-6 h-6 rounded-full border flex items-center justify-center ${
            selected ? "border-[#1F5ADB] " : "border-gray-300"
          }`}
        >
          {selected && <div className="w-3 h-3 rounded-full bg-[#1F5ADB]" />}
        </div>
      </div>
    </button>
  );
}

interface SizeOptionProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function SizeOption({ label, selected, onClick }: SizeOptionProps) {
  return (
    <button
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        selected
          ? "border-[#1F5ADB] bg-[#EFF1FF]"
          : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div
          className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
            selected ? "border-[#1F5ADB] " : "border-gray-300"
          }`}
        >
          {selected && <div className="w-3 h-3 rounded-full bg-[#1F5ADB]" />}
        </div>
        <span className={selected ? "text-[#1F5ADB]" : "text-gray-700"}>
          {label}
        </span>
      </div>
    </button>
  );
}

interface FeatureOptionProps {
  svg?: React.FC<React.SVGProps<SVGSVGElement>>;
  imgWidth?: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

function FeatureOption({
  svg: SvgIcon,
  label,
  selected,
  imgWidth = "w-16",
  onClick,
}: FeatureOptionProps) {
  const selectedColor = selected ? "#1F5ADB" : "#747A85";

  return (
    <button
      className={`flex flex-col items-center justify-center p-6 w-44 h-32 rounded-3xl border transition-all relative ${
        selected
          ? "border-[#1F5ADB] bg-[#EFF1FF]"
          : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      <div className="mb-2">
        {SvgIcon && (
          <SvgIcon className={`${imgWidth} h-auto`} stroke={selectedColor} />
        )}
      </div>
      <div
        className={`text-sm ${selected ? "text-[#1F5ADB]" : "text-gray-700"}`}
      >
        {label}
      </div>
      <div className="absolute top-3 right-3">
        <div
          className={`w-6 h-6 rounded-full border flex items-center justify-center ${
            selected ? "border-[#1F5ADB]" : "border-gray-300"
          }`}
        >
          {selected && <div className="w-3 h-3 rounded-full bg-[#1F5ADB]" />}
        </div>
      </div>
    </button>
  );
}

export function OnboardingFormWithContext() {
  return (
    <QuestionnaireProvider>
      <OnboardingForm />
    </QuestionnaireProvider>
  );
}

export default OnboardingFormWithContext;