import React, { useState, useEffect, useRef } from "react";
import { Modal, Box } from "@mui/material";
import { fetchSystemPlans, createCustomPlan, updateCustomPlan, getAllOrganizations } from "../apis/apis";
import { toast } from "react-toastify";
import { Search } from "lucide-react";
import { er } from "node_modules/@fullcalendar/core/internal-common";

interface AddCustomPlanModalProps {
  open: boolean;
  handleClose: () => void;
  onSave: () => void;
  existingPlan?: any;
}

const AddCustomPlanModal: React.FC<AddCustomPlanModalProps> = ({
  open,
  handleClose,
  onSave,
  existingPlan = null,
}) => {
  const [systemPlans, setSystemPlans] = useState([]);
  const [basicModules, setBasicModules] = useState([]);
  const [addonModules, setAddonModules] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const searchRef = useRef(null);
  // State for form data with separate add-on prices
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    whatsIncluded: "",
    moduleBasicId: 0,
    addOns: [],
    amount: "",
    interval: "month",
    setupFee: "",
    assetDriversAmount: "",
    assetVehiclesAmount: "",
    useAddonPriceDriver: false,
    useAddonPriceVehicle: false,
    trial_days: "",
    organizationIds: [0],
  });

  const [user, setUser] = useState<any[] | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUserData();

      // If we have an existing plan, set it up for editing
      if (existingPlan) {
        setIsEditing(true);
        populateFormWithExistingData(existingPlan);
      } else {
        setIsEditing(false);
        resetForm();
      }
    }
  }, [open, existingPlan]);

useEffect(() => {

  if (user && user.length > 0) {
    if (searchQuery.trim() === "") {
      setFilteredOrgs(user);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = user.filter(
        (org) =>
          (org.name && org.name.toLowerCase().includes(query)) ||
          (org.email && org.email.toLowerCase().includes(query))
      );
      setFilteredOrgs(filtered);
    }
  } else {
    setFilteredOrgs([]);
  }
}, [searchQuery, user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearching(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectOrganization = (org) => {
    setFormData({
      ...formData,
      organizationIds: [org.id],
    });
    setIsSearching(false);
    setSearchQuery(org.name || org.email || `Organization ${org.id}`);
  };


  const populateFormWithExistingData = (plan) => {
    // Extract addon IDs from the addons array
    const addonIds = plan.addons ? plan.addons.map((addon) => addon.id) : [];

    let driverAmount = "";
    let vehicleAmount = "";
    let useDriverPrice = false;
    let useVehiclePrice = false;

    if (plan.planAmountPerAssetType) {
      // Check for driver price
      if (
        plan.planAmountPerAssetType.drivers &&
        plan.planAmountPerAssetType.drivers[0].amount !== null &&
        plan.planAmountPerAssetType.drivers[0].amount !== undefined
      ) {
        driverAmount = plan.planAmountPerAssetType.drivers[0].amount;
        useDriverPrice = true;
      }

      // Check for vehicle price
      if (
        plan.planAmountPerAssetType.vehicles &&
        plan.planAmountPerAssetType.vehicles.length > 0 &&
        plan.planAmountPerAssetType.vehicles[0].amount !== null &&
        plan.planAmountPerAssetType.vehicles[0].amount !== undefined
      ) {
        vehicleAmount = plan.planAmountPerAssetType.vehicles[0].amount;
        useVehiclePrice = true;
      }
    }

    let selectedOrg = null;
    if (
      user &&
      user.length > 0 &&
      plan.organizationIds &&
      plan.organizationIds.length > 0
    ) {
      selectedOrg = user.find((org) => org.id === plan.organizationIds[0]);
    }

    // Set the search query to the name or email of the selected organization
    if (selectedOrg) {
      setSearchQuery(
        selectedOrg.name ||
          selectedOrg.email ||
          `Organization ${selectedOrg.id}`
      );
    } else {
      setSearchQuery("");
    }

    setFormData({
      name: plan.name || "",
      description: plan.description || "",
      whatsIncluded: plan.whatsIncluded || "",
      moduleBasicId: plan.basicPlan?.id || 0,
      addOns: addonIds,
      amount:
        plan.amount !== undefined && plan.amount !== null ? plan.amount : "",
      interval: plan.chargeDuration || "month",
      setupFee:
        plan.setupFee !== undefined && plan.setupFee !== null
          ? plan.setupFee
          : "",
      assetDriversAmount: driverAmount,
      assetVehiclesAmount: vehicleAmount,
      useAddonPriceDriver: useDriverPrice,
      useAddonPriceVehicle: useVehiclePrice,
      trial_days:
        plan.trial_days !== undefined && plan.trial_days !== null
          ? plan.trial_days
          : "",
      organizationIds: plan.organizationIds || [0],
    });
  };

  const fetchUserData = async () => {
    try {
      const response = await getAllOrganizations();

      // Store all system plans
      const resSystemPlans = await fetchSystemPlans();
      if (resSystemPlans && Array.isArray(resSystemPlans)) {
        setSystemPlans(resSystemPlans);
        setBasicModules(resSystemPlans.filter((plan) => plan.type === "basic"));
        setAddonModules(resSystemPlans.filter((plan) => plan.type === "addon"));
      }

      // Handle organizations data
      if (response && Array.isArray(response)) {
        setUser(response);
      } else if (response && Array.isArray(response.data)) {
        setUser(response.data);
      } else if (response) {
        setUser([response]);
      } else {
        setUser([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setUser([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle checkbox fields differently
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else if (name === "moduleSelection") {
      // Renamed field to match backend's expected field name
      setFormData({
        ...formData,
        moduleBasicId: value === "" ? 0 : parseInt(value, 10),
      });
    } else if (
      [
        "amount",
        "setupFee",
        "assetDriversAmount",
        "assetVehiclesAmount",
        "trial_days",
      ].includes(name)
    ) {
      // Convert numeric fields to numbers
      setFormData({
        ...formData,
        // [name]: value === "" ? 0 : parseFloat(value),
        [name]: value,
      });
    } else {
      // Handle string fields
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleAddonChange = (e) => {
    const { checked, value } = e.target;
    const addonId = parseInt(value, 10);

    if (checked) {
      setFormData({
        ...formData,
        addOns: [...formData.addOns, addonId],
      });
    } else {
      setFormData({
        ...formData,
        addOns: formData.addOns.filter((id) => id !== addonId),
      });
    }
  };

    const handleSubmit = async (e) => {
      e.preventDefault();

      const payload = {
        name: formData.name,
        description: formData.description,
        whatsIncluded: formData.whatsIncluded,
        moduleBasicId: formData.moduleBasicId,
        addOns: formData.addOns,
        amount: formData.amount === "" ? 0 : Number(formData.amount),
        interval: formData.interval,
        setupFee: formData.setupFee === "" ? 0 : Number(formData.setupFee),
        assetDriversAmount:
          formData.assetDriversAmount === ""
            ? 0
            : Number(formData.assetDriversAmount),
        assetVehiclesAmount:
          formData.assetVehiclesAmount === ""
            ? 0
            : Number(formData.assetVehiclesAmount),
        trial_days:
          formData.trial_days === "" ? 0 : Number(formData.trial_days),
        organizationIds: formData.organizationIds,
      };

      try {

        let response;
        if (isEditing && existingPlan) {
          // Add plan ID to payload for update
          response = await updateCustomPlan(existingPlan.id, payload);
          console.log("Plan updated:", response);
          toast.success("Plan updated successfully!");
        } else {
          // Create new plan
          response = await createCustomPlan(payload);
          toast.success("Plan created successfully!");
        }

        handleClose();
        onSave();
      } catch (error) {
        console.error("Error saving plan:", error);
        toast.error(error.message);
      }
    };

      const resetForm = () => {
        setFormData({
          name: "",
          description: "",
          whatsIncluded: "",
          moduleBasicId: 0,
          addOns: [],
          amount: "",
          interval: "month",
          setupFee: "",
          assetDriversAmount: "",
          assetVehiclesAmount: "",
          useAddonPriceDriver: false,
          useAddonPriceVehicle: false,
          trial_days: "",
          organizationIds: [0],
        });
        setSearchQuery("");
      };

      const modalTitle = isEditing ? "Edit Plan" : "Create New Plan";
      const submitButtonText = isEditing ? "Update Plan" : "Save Plan";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      disableAutoFocus={true}
      aria-labelledby="custom-plan-modal"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "900px",
          maxHeight: "90vh",
          bgcolor: "background.paper",
          borderRadius: "8px",
          boxShadow: 24,
          overflow: "auto",
          p: 0,
        }}
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{modalTitle}</h1>
            <button
              onClick={handleClose}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="mb-6">
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* "What's included" field */}
                <div className="mb-4">
                  <label
                    htmlFor="whatsIncluded"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    What's Included
                  </label>
                  <textarea
                    id="whatsIncluded"
                    name="whatsIncluded"
                    value={formData.whatsIncluded}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="List features and benefits included in this plan"
                  />
                </div>
              </div>

              {/* Module and Add-on Selection */}
              <div className="mb-6">
                <div className="mb-4">
                  <label
                    htmlFor="moduleSelection"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Module Selection
                  </label>
                  <select
                    id="moduleSelection"
                    name="moduleSelection"
                    value={formData.moduleBasicId}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a module</option>
                    {basicModules && basicModules.length > 0 ? (
                      basicModules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        Loading modules...
                      </option>
                    )}
                  </select>
                  {basicModules && basicModules.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">
                      No basic modules available. Please check system
                      configuration.
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="organizationSearch"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Select Organization
                  </label>
                  <div className="relative" ref={searchRef}>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <input
                        type="text"
                        id="organizationSearch"
                        placeholder="Search by name or email"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setIsSearching(true);
                        }}
                        onClick={() => setIsSearching(true)}
                        className="w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <div className="px-3 py-2 text-gray-500">
                        <Search size={20} />
                      </div>
                    </div>

                    {isSearching && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredOrgs.length > 0 ? (
                          filteredOrgs.map((org) => (
                            <div
                              key={org.id}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => selectOrganization(org)}
                            >
                              <div className="font-medium">
                                {org.name || `Organization ${org.id}`}
                              </div>
                              {org.email && (
                                <div className="text-sm text-gray-600">
                                  {org.email}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-gray-500">
                            No organizations found
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hidden field to store the actual selected value */}
                    <input
                      type="hidden"
                      name="organizationId"
                      value={formData.organizationIds[0] || ""}
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add-On Selection
                  </label>
                  <div className="space-y-2">
                    {addonModules.length > 0 ? (
                      addonModules.map((addon) => (
                        <div key={addon.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`addon-${addon.id}`}
                            value={addon.id}
                            checked={formData.addOns.includes(addon.id)}
                            onChange={handleAddonChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`addon-${addon.id}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {addon.name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No add-ons available
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="mb-6">
                <div className="mb-6">
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Plan Price (including Processing Fee)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="interval"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    per
                  </label>
                  <select
                    id="interval"
                    name="interval"
                    value={formData.interval}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
                <div className="mb-6">
                  <div className="mb-4">
                    <label
                      htmlFor="setupFee"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      One Time Set Up Fee
                    </label>
                    <input
                      type="number"
                      id="setupFee"
                      name="setupFee"
                      value={formData.setupFee}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                {/* Add-On Pricing Section with separate driver and vehicle prices */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add-On Price (including Processing Fee)
                  </label>

                  <div className="space-y-4">
                    {/* Driver add-on pricing */}
                    <div className="flex items-start">
                      <div className="flex items-center h-5 mt-1">
                        <input
                          type="checkbox"
                          id="useAddonPriceDriver"
                          name="useAddonPriceDriver"
                          checked={formData.useAddonPriceDriver}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 flex-grow">
                        <label
                          htmlFor="useAddonPriceDriver"
                          className="text-sm font-medium text-gray-700"
                        >
                          Per Driver
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            id="assetDriversAmount"
                            name="assetDriversAmount"
                            value={formData.assetDriversAmount}
                            onChange={handleChange}
                            disabled={!formData.useAddonPriceDriver}
                            className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              !formData.useAddonPriceDriver &&
                              "bg-gray-100 text-gray-500"
                            }`}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Vehicle add-on pricing */}
                    <div className="flex items-start">
                      <div className="flex items-center h-5 mt-1">
                        <input
                          type="checkbox"
                          id="useAddonPriceVehicle"
                          name="useAddonPriceVehicle"
                          checked={formData.useAddonPriceVehicle}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 flex-grow">
                        <label
                          htmlFor="useAddonPriceVehicle"
                          className="text-sm font-medium text-gray-700"
                        >
                          Per Vehicle
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            id="assetVehiclesAmount"
                            name="assetVehiclesAmount"
                            value={formData.assetVehiclesAmount}
                            onChange={handleChange}
                            disabled={!formData.useAddonPriceVehicle}
                            className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              !formData.useAddonPriceVehicle &&
                              "bg-gray-100 text-gray-500"
                            }`}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    You can set pricing per driver, per vehicle, or both
                  </p>
                </div>
              </div>

              {/* Trial Settings */}
              <div>
                <div className="mb-4">
                  <label
                    htmlFor="trial_days"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Trial Period
                  </label>
                  <input
                    type="number"
                    id="trial_days"
                    name="trial_days"
                    value={formData.trial_days}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Number of days for the free trial period before payment is
                    charged
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {submitButtonText}
              </button>
            </div>
          </form>
        </div>
      </Box>
    </Modal>
  );
};

export default AddCustomPlanModal;