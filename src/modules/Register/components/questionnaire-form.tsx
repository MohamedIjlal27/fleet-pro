import type React from "react";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  CircleDot,
  User,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ModuleCard from "@/components/Card/ModuleCard";
import AddonCard from "@/components/Card/AddonCard";
import { Divider } from "@mui/material";
import { signUpOrganization } from "@/utils/api";
import { FullPageLoader } from "@/components/ui/loading";
import { toast } from "react-toastify";

export default function QuestionnairePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    organization: {
      name: "",
      phoneNumber: "",
      country: "",
      province: "",
      city: "",
      postalCode: "",
      address: "",
      email: "",
    },
    user: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    message: {
      needs: "",
    },
  });

  const addonModules = [
    {
      id: "driverManagement",
      title: "Driver Management",
      description:
        "Driver management including scheduling, Synops logs, and driver monitoring.",
      features: [
        "White-label Driver App with Synops log reporting and pre-use and post-use inspection",
        "Driver Management & Driver Behaviour Analysis",
      ],
      price: "Per Driver Fee",
    },
    {
      id: "aiDashcam",
      title: "AI Dashcam",
      description:
        "Access video feed of driver behaviour with customizable alerts and notifications (hardware required).",
      features: [
        "Live video feed from dashcam",
        "Event flags and customizable notifications",
      ],
      price: "Per Asset Fee",
    },
    {
      id: "aiInspection",
      title: "AI Inspection",
      description: "AI image analysis for pre-use and post-use inspection.",
      features: [
        "Available on Asset Care App (iOS & Android)",
        "Available on Driver App (iOS & Android)",
      ],
      price: "Per User (Driver/Agent) Fee",
    },
    {
      id: "maintenance",
      title: "Maintenance",
      description:
        "Predictive/Preventive maintenance and work order management.",
      features: [
        "Asset Care App (available on iOS & Android)",
        "Work Order Management",
        "AI Recommendations for Preventive & Predictive Maintenance",
      ],
      price: "Per Asset Fee",
    },
  ];
  const modules = [
    {
      id: "freeTrial",
      title: "Free Trial",
      description:
        "Real-time asset tracking limited to max of 10 assets. Limit to 1 admin account.",
      features: [
        "Customizable Dashboard",
        "Real-time tracking on map view",
        "Inventory Management",
        "Document Management",
        "Users (limit to 1)",
      ],
      price:
        "Free for 30 days (limit to max 10 assets) $x/ month + $x per asset",
    },
    {
      id: "fleetManagement",
      title: "Fleet Management",
      description: "Real-time asset tracking and inventory management.",
      features: [
        "White-label Admin Portal",
        "Customizable Dashboard",
        "Real-time tracking on map view",
        "Inventory Management across multiple Virtual Garages",
        "Document Management",
        "Users Management",
        "Report Generation",
        "Geofencing Capabilities",
        "Event Notifications",
      ],
      price: "Fixed Monthly Fee + Per Asset Fee",
    },
    {
      id: "subscription",
      title: "Subscription / Rental",
      description:
        "Ability for lead, customer and order management for asset subscription and short-term rental.",
      features: [
        "White-label Admin Portal",
        "Customizable Dashboard",
        "Real-time tracking on map view",
        "Inventory Management across multiple Virtual Garages",
        "Document Management",
        "CRM",
        "Customer Screening",
        "Users Management",
        "Report Generation",
        "Geofencing Capabilities & Event Notification",
        "Digital Inspection",
        "Digital Document Signing",
        "Billing & Payment Processing",
        "White-Label Customer Web App",
        "White-Label Agent App (available on iOS & Android)",
      ],
      price: "Fixed Monthly Fee + Per Asset Fee",
    },
    {
      id: "dispatch",
      title: "Dispatch Centre",
      description: "Ability for order, dispatch and route optimization.",
      features: [
        "White-label Admin Portal",
        "Customizable Dashboard",
        "Real-time tracking on map view",
        "Inventory Management across multiple Virtual Garages",
        "Document Management",
        "CRM",
        "Intelligent Route Planning & Route Optimization",
        "Dispatch & Proof of Delivery",
        "Digital Inspection",
        "Driver Management & Behaviour Analysis",
        "Customer Screening",
        "Users Management",
        "Report Generation",
        "Geofencing Capabilities & Event Notifications",
        "White-Label Driver App (available on iOS & Android)",
      ],
      price: "Fixed Monthly Fee + Per Driver Fee",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();

    // Basic validation
    if (formData.user.password !== formData.user.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    // Construct payload
    const payload = {
      ...formData,
      addons: Object.keys(addons).filter((key) => addons[key]), // Only selected add-ons
    };

    try {
      await signUpOrganization(payload);
      toast.success("Request submitted successfully!");
      setStep(1);
      setFormData({
        organization: {
          name: "",
          phoneNumber: "",
          country: "",
          province: "",
          city: "",
          postalCode: "",
          address: "",
          email: "",
        },
        user: {
          email: "",
          firstName: "",
          lastName: "",
          phone: "",
          password: "",
          confirmPassword: "",
        },
        message: {
          needs: "",
        },
      });

      setLoading(false);
    } catch (error: any) {
      // Log or process the error message
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Something went wrong");
      } else {
        toast.error(error.message || "An unexpected error occurred");
      }
    }
  };

  const [addons, setAddons] = useState<Record<string, boolean>>({});
  const toggleAddon = (addonId: string) => {
    setAddons((prev) => {
      const newAddons = { ...prev, [addonId]: !prev[addonId] };
      setFormData((prevFormData) => ({
        ...prevFormData,
        addons: Object.entries(newAddons)
          .filter(([_, value]) => value)
          .map(([key]) => key),
      }));
      return newAddons;
    });
  };
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const [section, key] = name.split(".");

    setFormData((prevFormData) => ({
      ...prevFormData,
      [section]: {
        ...prevFormData[section],
        [key]: value,
      },
    }));
  };

  const handlePlanChange = (value: string) => {
    setSelectedModule(value);
    setFormData({ ...formData, plan: value });
  };

  const [selectedModule, setSelectedModule] = useState<string>("");

  const handleAddonToggle = (value: string) => {
    setFormData({
      ...formData,
      addons: formData.addons.includes(value)
        ? formData.addons.filter((addon) => addon !== value)
        : [...formData.addons, value],
    });
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const isStepComplete = () => {
    switch (step) {
      case 1:
        // return formData.needs.trim().length > 0;
        return true;
      case 2:
        return (
          formData.user.firstName.trim().length > 0 &&
          formData.user.lastName.trim().length > 0 &&
          formData.user.email.trim().length > 0 &&
          formData.user.email.includes("@") &&
          formData.user.phone.trim().length > 0
        );
      case 3:
        return true;
      // formData.plan.length > 0
      case 4:
        return true; // Add-ons are optional
      default:
        return false;
    }
  };

  return (
    <>
      {" "}
      {loading}
      <div className="container max-w-3xl mx-auto py-10 px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Form</CardTitle>
            <CardDescription className="">
              Please complete all steps to submit your request
            </CardDescription>
            <div className="flex justify-between mt-10">
              <div
                className={`flex flex-col items-center ${
                  step >= 1
                    ? "text-neutral-900 dark:text-neutral-50"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step >= 1
                      ? "border-neutral-900 bg-neutral-900/10 dark:border-neutral-50 dark:bg-neutral-50/10"
                      : "border-neutral-100 dark:border-neutral-800"
                  }`}
                >
                  {step > 1 ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <CircleDot className="h-5 w-5" />
                  )}
                </div>
                <span className="text-sm mt-1">Questions</span>
              </div>
              <div
                className={`flex flex-col items-center ${
                  step >= 2
                    ? "text-neutral-900 dark:text-neutral-50"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step >= 2
                      ? "border-neutral-900 bg-neutral-900/10 dark:border-neutral-50 dark:bg-neutral-50/10"
                      : "border-neutral-100 dark:border-neutral-800"
                  }`}
                >
                  {step > 2 ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <span className="text-sm mt-1">Information</span>
              </div>
              <div
                className={`flex flex-col items-center ${
                  step >= 3
                    ? "text-neutral-900 dark:text-neutral-50"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step >= 3
                      ? "border-neutral-900 bg-neutral-900/10 dark:border-neutral-50 dark:bg-neutral-50/10"
                      : "border-neutral-100 dark:border-neutral-800"
                  }`}
                >
                  {step > 3 ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <CreditCard className="h-5 w-5" />
                  )}
                </div>
                <span className="text-sm mt-1">Selection</span>
              </div>
              <div
                className={`flex flex-col items-center ${
                  step >= 4
                    ? "text-neutral-900 dark:text-neutral-50"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step >= 4
                      ? "border-neutral-900 bg-neutral-900/10 dark:border-neutral-50 dark:bg-neutral-50/10"
                      : "border-neutral-100 dark:border-neutral-800"
                  }`}
                >
                  <CircleDot className="h-5 w-5" />
                </div>
                <span className="text-sm mt-1">Add-ons</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Tell us about your needs
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="message">
                    What are you looking to accomplish?
                  </Label>
                  <Textarea
                    id="message"
                    name="message.needs"
                    placeholder="Please describe your requirements in detail..."
                    rows={5}
                    value={formData.message.needs}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Your Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">First Name</Label>
                    <Input
                      id="name"
                      name="user.firstName"
                      placeholder="John"
                      value={formData.user.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Last Name</Label>
                    <Input
                      id="name"
                      name="user.lastName"
                      placeholder="Doe"
                      value={formData.user.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="user.email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.user.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="user.phone"
                      placeholder="(123) 456-7890"
                      value={formData.user.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="user.password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.user.password}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="user.confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.user.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <Divider className="my-6" />
                <h3 className="text-lg font-medium">
                  Organization Information
                </h3>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">
                        Organization Name
                      </Label>
                      <Input
                        id="organizationName"
                        name="organization.name"
                        placeholder="Enter organization name"
                        value={formData.organization.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organizationPhoneNumber">
                        Phone Number
                      </Label>
                      <Input
                        id="organizationPhoneNumber"
                        name="organization.phoneNumber"
                        placeholder="(123) 456-7890"
                        value={formData.organization.phoneNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizationCity">City</Label>
                      <Input
                        id="organizationCity"
                        name="organization.city"
                        placeholder="Enter city"
                        value={formData.organization.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organizationCountry">Country</Label>
                      <Input
                        id="organizationCountry"
                        name="organization.country"
                        placeholder="Enter country"
                        value={formData.organization.country}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizationProvince">
                        Select Province/State
                      </Label>
                      <Input
                        id="organizationProvince"
                        name="organization.province"
                        placeholder="Enter Province"
                        value={formData.organization.province}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organizationPostalCode">
                        Postal Code
                      </Label>
                      <Input
                        id="organizationPostalCode"
                        name="organization.postalCode"
                        placeholder="Enter postal code"
                        value={formData.organization.postalCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizationEmail">Email</Label>
                      <Input
                        id="organizationEmail"
                        name="organization.email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.organization.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organizationAddress">Address</Label>
                      <Textarea
                        id="organizationAddress"
                        name="organization.address"
                        placeholder="Enter address"
                        value={formData.organization.address}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select a Plan</h3>
                {modules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    title={module.title}
                    description={module.description}
                    features={module.features}
                    price={module.price}
                    selected={selectedModule === module.id}
                    onSelect={() => handlePlanChange(module.id)}
                  />
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Add-ons</h3>
                <div className="grid gap-4">
                  {addonModules.map((addon) => (
                    <AddonCard
                      key={addon.id}
                      title={addon.title}
                      description={addon.description}
                      features={addon.features}
                      price={addon.price}
                      selected={addons[addon.id] || false}
                      onToggle={() => toggleAddon(addon.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Summary</h3>
                <div className="rounded-lg border border-neutral-200 p-4 space-y-4 dark:border-neutral-800">
                  <div>
                    <h4 className="font-medium">Your Needs</h4>
                    <p className="text-sm text-neutral-500 mt-1 dark:text-neutral-400">
                      {formData.message.needs}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">Personal Information</h4>
                      <div className="text-sm text-neutral-500 mt-1 dark:text-neutral-400">
                        <p>
                          Name: {formData.user.firstName}{" "}
                          {formData.user.lastName}
                        </p>
                        <p>Email: {formData.user.email}</p>
                        <p>Phone: {formData.user.phone}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">Organization Details</h4>
                      <div className="text-sm text-neutral-500 mt-1 dark:text-neutral-400">
                        <p>Name: {formData.organization.name}</p>
                        <p>Phone: {formData.organization.phoneNumber}</p>
                        <p>Email: {formData.organization.email}</p>
                        <p>Country: {formData.organization.country}</p>
                        <p>Province: {formData.organization.province}</p>
                        <p>City: {formData.organization.city}</p>
                        <p>Postal Code: {formData.organization.postalCode}</p>
                        <p>Address: {formData.organization.address}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Selected Plan</h4>
                    <p className="text-sm text-neutral-500 mt-1 capitalize dark:text-neutral-400">
                      {/* {formData.plan} Plan */}
                    </p>
                    <h4 className="font-medium mt-2">Add-ons</h4>
                    <div className="text-sm text-neutral-500 mt-1 dark:text-neutral-400">
                      {/* {formData.addons.length === 0 ? (
            <p>No add-ons selected</p>
          ) : (
            <ul className="list-disc list-inside">
              {formData.addons.map((addon) => (
                <li key={addon}>{addon}</li>
              ))}
            </ul>
          )} */}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {step > 1 && (
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
            )}
            {step < 5 ? (
              <Button
                className="ml-auto"
                onClick={nextStep}
                disabled={!isStepComplete()}
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button className="ml-auto" onClick={handleSubmit}>
                Submit
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>{" "}
    </>
  );
}
