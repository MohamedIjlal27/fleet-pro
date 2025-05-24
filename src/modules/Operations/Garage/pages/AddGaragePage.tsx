import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Autocomplete,
} from "@mui/material";
import ThemeButton from "../../../../modules/core/components/ThemeButton";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
// Comment out Mapbox imports for demo mode
// import mapboxgl from "mapbox-gl";
import { customCoordinate } from "../../../../utils/constants";
import { useNavigate, useParams } from "react-router";
import { IGarageFormData } from "../interfaces/garage.interface";
import AddressAutocomplete from "../../../../modules/core/components/AddressAutocomplete";
import { getLocationDetails } from "../../../../utils/loadGoogleMaps";
// Comment out Mapbox marker import for demo mode
// import { createMarkerElement } from "../../../../utils/map/pulsating_dot";
import axiosInstance from "../../../../utils/axiosConfig";
import { toast } from "react-toastify";
import { systemPlan, systemModule } from "@/utils/constants";
import { checkModuleExists, checkPlanExists } from "@/lib/moduleUtils";
import Error404Page from "@/modules/core/pages/Error404Page";
import LockedFeature from "@/modules/core/components/LockedFeature";

const initialFormData: IGarageFormData = {
  name: "",
  phoneNumber: "",
  operationDays: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: false,
  },
  operationStarts: "09:00",
  operationEnds: "17:00",
  parkingLimit: 10,
  taxRate: 0,
  address: "",
  city: "",
  province: "",
  postalCode: "",
  country: "",
  googlePlaceId: "",
  latitude: 0,
  longitude: 0,
  remarks: "",
  garageGroup: "",
  //organizationId: 1,
};

export const AddGaragePage: React.FC = () => {
  if (!checkModuleExists(systemModule.OperationsGarages)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Garages" />
    ) : (
      <Error404Page />
    );
  }

  const { id } = useParams<{ id: string }>();
  // Comment out Mapbox-related refs for demo mode
  // const mapContainerRef = useRef<HTMLDivElement | null>(null);
  // const [map, setMap] = useState<mapboxgl.Map | null>(null);
  // const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const navigate = useNavigate();
  const [formData, setFormData] = useState<IGarageFormData>(initialFormData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [garageGroups, setGarageGroups] = useState<string[]>([]);
  const [useCustomCoordinates, setUseCustomCoordinates] = useState<boolean>(false);

  // Fetch garage groups
  async function fetchGarageGroups() {
    try {
      // Comment out API call for demo mode
      // const response = await axiosInstance.get('/api/garages/groups/all');
      // setGarageGroups(response.data || []);
      
      console.log('fetchGarageGroups (demo mode)');
      
      // Demo garage groups data
      const demoGarageGroups = ["Group A", "Group B", "Group C"];
      setGarageGroups(demoGarageGroups);
    } catch (error) {
      console.error("Error fetching garage groups:", error);
      setGarageGroups([]);
    }
  }

  async function fetchGarageById(id: string) {
    try {
      // Comment out API call for demo mode
      // const response = await axiosInstance.get(`/api/garages/${id}`);
      // return response.data;
      
      console.log('fetchGarageById (demo mode)', { id });
      
      // Demo garage data for editing that matches IGarageFormData - using realistic data
      const demoGarage: IGarageFormData = {
        name: "Downtown Garage",
        address: "123 Main St, Downtown",
        city: "New York",
        province: "NY",
        postalCode: "10001",
        country: "United States",
        phoneNumber: "+1-555-0101",
        latitude: 40.7128,
        longitude: -74.0060,
        garageGroup: "Group A",
        operationStarts: "06:00",
        operationEnds: "22:00",
        parkingLimit: 50,
        taxRate: 8.5,
        operationDays: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: false
        }
      };
      
      return demoGarage;
    } catch (error) {
      console.error("Error fetching garage:", error);
      return null;
    }
  }

  async function updateGarage(id: string) {
    try {
      // Comment out API call for demo mode
      // const response = await axiosInstance.put(`/api/garages/${id}`, formData);
      // return response.data;
      
      console.log('updateGarage (demo mode)', { id, formData });
      
      // Mock successful update
      return {
        id: parseInt(id),
        ...formData,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error updating garage:", error);
      return null;
    }
  }

  useEffect(() => {
    // Comment out Mapbox map initialization for demo mode
    // if (!mapContainerRef.current) return;
    // const map = new mapboxgl.Map({
    //   container: mapContainerRef.current,
    //   style: "mapbox://styles/mapbox/streets-v11",
    //   center: [customCoordinate.longitude, customCoordinate.latitude],
    //   zoom: 9,
    // });
    // map.addControl(new mapboxgl.NavigationControl());
    // map.addControl(new mapboxgl.FullscreenControl());
    // setMap(map);
    // return () => map.remove();
  }, []);

  useEffect(() => {
    // Comment out Mapbox marker functionality for demo mode
    // if (map && formData.longitude && formData.latitude) {
    //   map.setCenter([formData.longitude, formData.latitude]);
    //   markersRef.current.forEach((marker) => marker.remove());
    //   const marker = new mapboxgl.Marker(createMarkerElement())
    //     .setLngLat([formData.longitude, formData.latitude])
    //     .addTo(map);
    //   markersRef.current.push(marker);
    // }
  }, [formData.latitude, formData.longitude]);

  useEffect(() => {
    // Fetch garage groups when component mounts
    fetchGarageGroups();

    if (id) {
      fetchGarageById(id).then((data) => {
        if (data) {
          setFormData(data);
          console.log("fetchGarageById", data);
        }
      });
    }
  }, [id]);

  // eslint-disable-next-line
  const onAddressChange = (address: any) => {
    const locationDetails = getLocationDetails(address);
    setFormData((prev) => ({
      ...prev,
      address: locationDetails.formatted_address,
      city: locationDetails.city,
      province: locationDetails.province,
      postalCode: locationDetails.postalCode,
      country: locationDetails.country,
      googlePlaceId: locationDetails.place_id,
      // Only update coordinates if custom coordinates are not enabled
      ...(useCustomCoordinates ? {} : {
        latitude: locationDetails.latitude,
        longitude: locationDetails.longitude,
      }),
    }));
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  // Handle checkbox changes for operation days
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      operationDays: {
        ...prev.operationDays,
        [name]: checked,
      },
    }));
  };

  // Validation function
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = "Garage name is required.";
    if (!formData.phoneNumber)
      newErrors.phoneNumber = "Phone number is required.";
    if (!formData.address) newErrors.address = "Address is required.";
    if (!formData.city) newErrors.city = "City is required.";
    if (!formData.province) newErrors.province = "Province is required.";
    if (!formData.postalCode) newErrors.postalCode = "Postal code is required.";
    if (!formData.country) newErrors.country = "Country is required.";

    // Coordinate validations
    if (formData.latitude === 0 && formData.longitude === 0) {
      newErrors.location = "Location must be selected.";
    }

    // Validate latitude: must be between -90 and 90
    if (useCustomCoordinates) {
      if (formData.latitude < -90 || formData.latitude > 90) {
        newErrors.latitude = "Latitude must be between -90 and 90 degrees.";
      }

      // Validate longitude: must be between -180 and 180
      if (formData.longitude < -180 || formData.longitude > 180) {
        newErrors.longitude = "Longitude must be between -180 and 180 degrees.";
      }
    }

    if (formData.parkingLimit <= 0)
      newErrors.parkingLimit = "Parking limit must be greater than 0.";
    return newErrors;
  };

  // Prevent form submission on Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // Stop submission if there are validation errors
    }

    try {
      // Comment out API call for demo mode
      // const response = await axiosInstance.post("/api/garages", formData);
      // console.log("Garage added:", response.data);
      
      console.log('handleSubmit (demo mode)', formData);
      
      // Mock successful garage creation
      const mockResponse = {
        data: {
          id: Date.now(),
          ...formData,
          createdAt: new Date().toISOString()
        }
      };
      
      console.log("Garage added:", mockResponse.data);
      setFormData(initialFormData);
      // Comment out Mapbox map removal for demo mode
      // setMap(null);
      // Comment out Mapbox marker removal for demo mode
      // markersRef.current.forEach((marker) => marker.remove());
      setErrors({});
      toast.success("Garage added successfully");
      navigate("/operations/garages");
    } catch (error) {
      console.error("Error adding garage:", error);
      // Handle error (e.g., show an error message)
    }
  };

  const handleUpdate = async () => {
    if (!id) {
      toast.error("Garage ID is required");
      return;
    }
    try {
      // Add console log to see what we're sending
      console.log("Sending garage data:", formData);
      const updatedGarage = await updateGarage(id);
      console.log("Garage updated:", updatedGarage);
      toast.success("Garage updated successfully");
      navigate("/operations/garages");
    } catch (error) {
      console.error("Error updating garage:", error);
      toast.error("Error updating garage");
    }
  };

  // Prevent default form submission - more robust version
  const preventFormSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <div className="min-h-screen">
      <main className="mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <ThemeButton
              icon={<KeyboardArrowLeftIcon />}
              name=""
              onClick={() => navigate("/operations/garages")}
            />
            <h1 className="text-2xl font-bold text-gray-900">
              {id ? "Edit" : "Add"} Garage
            </h1>
          </div>
        </div>

        {/* Map Section */}
        <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <div className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] w-full">
            {/* Map placeholder for demo mode */}
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-500 text-lg mb-2">🗺️</div>
                <p className="text-gray-600">Map View</p>
                <p className="text-sm text-gray-500">Demo Mode - Location: {formData.latitude}, {formData.longitude}</p>
              </div>
            </div>
            {/* Comment out Mapbox map for demo mode */}
            {/* <div ref={mapContainerRef} className="w-full h-full" /> */}
          </div>
        </div>

        {/* Form Section */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
          className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm"
        >
          {/* Basic info section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Garage Name *"
                name="name"
                variant="outlined"
                fullWidth
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />
              <TextField
                label="Phone *"
                name="phoneNumber"
                variant="outlined"
                fullWidth
                value={formData.phoneNumber}
                onChange={handleChange}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
              />
            </div>
          </div>

          {/* Operation Hours section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Operation Hours
            </h2>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-1/2">
                <Typography variant="subtitle1" className="mb-2">
                  Operation Days *
                </Typography>
                <FormControl component="fieldset" className="w-full">
                  <FormGroup row className="flex flex-wrap">
                    <div className="flex flex-col sm:flex-row flex-wrap w-full">
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="monday"
                            checked={formData.operationDays.monday}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label="Monday"
                        className="w-full sm:w-1/2 md:w-1/3"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="tuesday"
                            checked={formData.operationDays.tuesday}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label="Tuesday"
                        className="w-full sm:w-1/2 md:w-1/3"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="wednesday"
                            checked={formData.operationDays.wednesday}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label="Wednesday"
                        className="w-full sm:w-1/2 md:w-1/3"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="thursday"
                            checked={formData.operationDays.thursday}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label="Thursday"
                        className="w-full sm:w-1/2 md:w-1/3"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="friday"
                            checked={formData.operationDays.friday}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label="Friday"
                        className="w-full sm:w-1/2 md:w-1/3"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="saturday"
                            checked={formData.operationDays.saturday}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label="Saturday"
                        className="w-full sm:w-1/2 md:w-1/3"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="sunday"
                            checked={formData.operationDays.sunday}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label="Sunday"
                        className="w-full sm:w-1/2 md:w-1/3"
                      />
                    </div>
                  </FormGroup>
                </FormControl>
              </div>

              <div className="w-full lg:w-1/2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TextField
                    label="Starts"
                    type="time"
                    name="operationStarts"
                    variant="outlined"
                    fullWidth
                    value={formData.operationStarts}
                    onChange={handleChange}
                  />
                  <TextField
                    label="Ends"
                    type="time"
                    name="operationEnds"
                    variant="outlined"
                    fullWidth
                    value={formData.operationEnds}
                    onChange={handleChange}
                  />
                  <TextField
                    label="Parking Limit *"
                    type="number"
                    name="parkingLimit"
                    variant="outlined"
                    fullWidth
                    value={formData.parkingLimit}
                    onChange={handleChange}
                    error={!!errors.parkingLimit}
                    helperText={errors.parkingLimit}
                  />
                </div>

              </div>
            </div>
          </div>

          {/* Address section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Location Details
            </h2>
            <div className="mb-4">
              <Typography variant="subtitle1" className="mb-2">
                Address *
              </Typography>
              <AddressAutocomplete
                onAddressChange={onAddressChange}
                initialAddress={formData.address}
              />
              {errors.address && (
                <Typography color="error" className="mt-1 text-sm">
                  {errors.address}
                </Typography>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <TextField
                label="City *"
                name="city"
                variant="outlined"
                fullWidth
                value={formData.city}
                onChange={handleChange}
                error={!!errors.city}
                helperText={errors.city}
              />
              <TextField
                label="State/Province *"
                name="province"
                variant="outlined"
                fullWidth
                value={formData.province}
                onChange={handleChange}
                error={!!errors.province}
                helperText={errors.province}
              />
              <TextField
                label="Zip/Postal Code *"
                name="postalCode"
                variant="outlined"
                fullWidth
                value={formData.postalCode}
                onChange={handleChange}
                error={!!errors.postalCode}
                helperText={errors.postalCode}
              />
              <TextField
                label="Country *"
                name="country"
                variant="outlined"
                fullWidth
                value={formData.country}
                onChange={handleChange}
                error={!!errors.country}
                helperText={errors.country}
              />
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 mb-2">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={useCustomCoordinates}
                      onChange={(e) => setUseCustomCoordinates(e.target.checked)}
                    />
                  }
                  label="Use custom coordinates"
                />
              </div>
              <TextField
                label="Latitude *"
                // Changed from type="number" to type="text" with pattern validation
                type="text"
                name="latitude"
                variant="outlined"
                fullWidth
                value={formData.latitude}
                onChange={(e) => {
                  // Only allow numeric input with decimal point
                  const value = e.target.value;
                  if (value === '' || value === '-' || value === '.' || value === '-.' || /^-?\d*\.?\d*$/.test(value)) {
                    // Store input as string for display but convert to number for state
                    const parsedValue = parseFloat(value);

                    setFormData(prev => ({
                      ...prev,
                      // Only set valid numbers, keep previous value for incomplete input
                      latitude: !isNaN(parsedValue) ? parsedValue : (value === '' ? 0 : prev.latitude)
                    }));
                  }
                }}
                disabled={!useCustomCoordinates}
                error={!!errors.latitude}
                helperText={errors.latitude}
                onKeyDown={handleKeyDown}
                inputProps={{ inputMode: "decimal" }}
              />
              <TextField
                label="Longitude *"
                // Changed from type="number" to type="text" with pattern validation
                type="text"
                name="longitude"
                variant="outlined"
                fullWidth
                value={formData.longitude}
                onChange={(e) => {
                  // Only allow numeric input with decimal point
                  const value = e.target.value;
                  if (value === '' || value === '-' || value === '.' || value === '-.' || /^-?\d*\.?\d*$/.test(value)) {
                    // Store input as string for display but convert to number for state
                    const parsedValue = parseFloat(value);

                    setFormData(prev => ({
                      ...prev,
                      // Only set valid numbers, keep previous value for incomplete input
                      longitude: !isNaN(parsedValue) ? parsedValue : (value === '' ? 0 : prev.longitude)
                    }));
                  }
                }}
                disabled={!useCustomCoordinates}
                error={!!errors.longitude}
                helperText={errors.longitude}
                onKeyDown={handleKeyDown}
                inputProps={{ inputMode: "decimal" }}
              />
            </div>
          </div>
          {/* Garage Group */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Garage Group
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
              <Autocomplete
                freeSolo
                options={garageGroups}
                value={formData.garageGroup || null}
                onChange={(_, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    garageGroup: newValue || ""
                  }));
                }}
                ListboxProps={{
                  style: {
                    maxHeight: '200px',
                    overflow: 'auto'
                  }
                }}
                ListboxComponent={(props) => (
                  <ul {...props} style={{
                    maxHeight: garageGroups.length > 5 ? '200px' : 'none',
                    overflowY: garageGroups.length > 5 ? 'auto' : 'visible'
                  }} />
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Garage Group"
                    name="garageGroup"
                    variant="outlined"
                    fullWidth
                    helperText="Type or select a garage group"
                    onChange={(e) => {
                      handleChange(e as React.ChangeEvent<HTMLInputElement>);
                    }}
                  />
                )}
              />
            </div>
          </div>
          {/* Additional info section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Additional Information
            </h2>

            <TextField
              label="Remarks (Optional)"
              name="remarks"
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              value={formData.remarks}
              onChange={handleChange}
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
            <Button
              type="button"
              onClick={() => navigate("/operations/garages")}
              variant="outlined"
              color="secondary"
              className="px-6 py-2"
            >
              Back
            </Button>
            {id ? (
              <Button
                type="button"
                onClick={handleUpdate}
                variant="contained"
                color="primary"
                className="px-6 py-2"
              >
                Update
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className="px-6 py-2"
              >
                Add
              </Button>
            )}
          </div>
        </Box>
      </main>
    </div>
  );
};

export default AddGaragePage;
