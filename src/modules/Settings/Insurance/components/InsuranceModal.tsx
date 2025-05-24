import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  Avatar,
  Input,
  Link,
} from "@mui/material";
import { IAddress, IInsurance } from "../interfaces/interfaces";
import { createInsurance, fetchInsurance, updateInsurance, uploadInsuranceDocument } from '../apis/apis';
import { fetchVehicles } from '../../../Fleet/apis/apis';
import { IVehicle } from '../../../core/interfaces/interfaces';
import car_model from '/src/assets/car_models/car_model_1_big.png';
import { toast } from "react-toastify";

interface InsuranceModalProps {
  open: boolean;
  onClose: () => void;
  mode: "Edit" | "Create";
  selectedInsurance?: IInsurance | null;
}

const dummyInsurance: IInsurance = {
  policyNumber: "",
  insuranceCompany: "",
  effectiveDate: new Date().toISOString(),
  expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
  namedInsured: "",
  insuredAddress: {
    city: "",
    unit: 0,
    address: "",
    country: "",
    province: "",
    postal_code: "",
  },
  cars: [],
  coverage: "",
};

const InsuranceModal: React.FC<InsuranceModalProps> = ({
  open,
  onClose,
  mode,
  selectedInsurance,
}) => {
  const [insurance, setInsurance] = useState<IInsurance>(dummyInsurance);
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {

    setSearchQuery('');
    loadModal()
    loadVehicles();

  }, [open, mode, selectedInsurance]);

  const loadModal = async () => {
    if (selectedInsurance && selectedInsurance.id) {

      const res = await fetchInsurance(selectedInsurance.id);
      console.log("fetchInsurance res=", res);
      setInsurance({
        ...res,
        insuredAddress: res.insuredAddress || {
          city: "",
          unit: 0,
          address: "",
          country: "",
          province: "",
          postal_code: "",
        },
      });
    } else {
      setInsurance(dummyInsurance);
    }
  }

  const loadVehicles = async () => {
    try {
      const data = await fetchVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const handleChange = (field: keyof IInsurance, value: any) => {
    setInsurance((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field: keyof IAddress, value: any) => {
    setInsurance((prev) => ({
      ...prev,
      insuredAddress: {
        ...(prev.insuredAddress || {}),
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    // Validate required fields
    if (
      !insurance.policyNumber ||
      !insurance.insuranceCompany ||
      !insurance.effectiveDate ||
      !insurance.expiryDate ||
      !insurance.coverage
    ) {
      console.error("All fields are required.");
      toast.error("Please fill in all required fields before proceeding.");
      return; // Prevent API call and closing
    }

    if (mode === 'Edit') {
      console.log("Saving insurance details:", insurance);
      await updateInsurance(insurance);
    } else {
      console.log("Create insurance details:", insurance);
      await createInsurance(insurance);
    }
    onClose();
  };

  const toggleVehicleSelection = (id: number) => {
    setInsurance((prev) => ({
      ...prev,
      cars: prev.cars.includes(id)
        ? prev.cars.filter((carId) => carId !== id)
        : [id, ...prev.cars], // Ensures selected vehicle moves to top
    }));
  };

  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter(
        (vehicle) =>
          vehicle.vin?.toLowerCase().includes(searchQuery) ||
          vehicle.make.toLowerCase().includes(searchQuery)
      )
      .sort((a, b) => {
        const aSelected = insurance.cars.includes(a.id) ? -1 : 1;
        const bSelected = insurance.cars.includes(b.id) ? -1 : 1;
        return aSelected - bSelected; // Moves selected vehicles to top
      });
  }, [searchQuery, vehicles, insurance.cars]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // should not be call when not in edit mode
    const file = event.target.files?.[0];
    console.log("Selected file:", file);

    if (!file) {
      alert("No file selected.");
      return;
    }

    // Allow only images and PDFs
    const allowedTypes = ["image/png", "image/jpeg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only images and PDF files are allowed.");
      return;
    }

    try {
      if (insurance.id) {
        const res = await uploadInsuranceDocument(insurance.id, file);
        console.log("uploadMaintenanceDocument res = ", res);
        toast.success("File uploaded");
      }
      loadModal();
    } catch (error: any) {
      toast.error(`Error uploading file: ${error.message}`);
    }
  };




  return (
    <Modal open={open} onClose={onClose} disableAutoFocus={true}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%", // Wider modal
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <Typography variant="h6" gutterBottom>
          {mode === "Edit" ? "Edit Insurance" : "New Insurance"}
        </Typography>

        <Grid container spacing={2}>
          {/* Left Side - Form */}
          <Grid item xs={6}>
            <Grid container spacing={2}>
              {/* Policy Number */}
              <Grid item xs={6}>
                <TextField
                  label="Policy Number"
                  fullWidth
                  required
                  value={insurance.policyNumber}
                  onChange={(e) => handleChange("policyNumber", e.target.value)}
                />
              </Grid>

              {/* Insurance Company */}
              <Grid item xs={6}>
                <TextField
                  label="Insurance Company"
                  fullWidth
                  required
                  value={insurance.insuranceCompany}
                  onChange={(e) => handleChange("insuranceCompany", e.target.value)}
                />
              </Grid>

              {/* Effective Date */}
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Effective Date"
                  type="datetime-local"
                  required
                  value={insurance.effectiveDate
                    ? (() => {
                      const date = new Date(insurance.effectiveDate);
                      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                      return localDate.toISOString().slice(0, 16);
                    })()
                    : ""}
                  onChange={(e) => handleChange("effectiveDate", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Expiry Date */}
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  type="datetime-local"
                  required
                  value={insurance.expiryDate
                    ? (() => {
                      const date = new Date(insurance.expiryDate);
                      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                      return localDate.toISOString().slice(0, 16);
                    })()
                    : ""}
                  onChange={(e) => handleChange("expiryDate", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Named Insured */}
              <Grid item xs={6}>
                <TextField
                  label="Named Insured"
                  fullWidth
                  value={insurance.namedInsured}
                  onChange={(e) => handleChange("namedInsured", e.target.value)}
                />
              </Grid>

              {/* Coverage (Multi-line) */}
              <Grid item xs={12}>
                <TextField
                  label="Coverage"
                  fullWidth
                  multiline
                  required
                  minRows={3}
                  value={insurance.coverage}
                  onChange={(e) => handleChange("coverage", e.target.value)}
                />
              </Grid>

              {/* Address Fields */}
              <Grid item xs={6}>
                <TextField
                  label="City"
                  fullWidth
                  value={insurance.insuredAddress?.city || ""}
                  onChange={(e) => handleAddressChange("city", e.target.value)}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Unit"
                  fullWidth
                  type="number"
                  value={insurance.insuredAddress?.unit || ""}
                  onChange={(e) => handleAddressChange("unit", Number(e.target.value))}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Street Address"
                  fullWidth
                  value={insurance.insuredAddress?.address || ""}
                  onChange={(e) => handleAddressChange("address", e.target.value)}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Country"
                  fullWidth
                  value={insurance.insuredAddress?.country || ""}
                  onChange={(e) => handleAddressChange("country", e.target.value)}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Province"
                  fullWidth
                  value={insurance.insuredAddress?.province || ""}
                  onChange={(e) => handleAddressChange("province", e.target.value)}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Postal Code"
                  fullWidth
                  value={insurance.insuredAddress?.postal_code || ""}
                  onChange={(e) => handleAddressChange("postal_code", e.target.value)}
                />
              </Grid>

            </Grid>
          </Grid>

          {/* Right Side - Cars List */}
          <Grid item xs={6}>
            <Typography variant="subtitle1">Select Vehicles</Typography>

            {/* Search Input */}
            <TextField
              fullWidth
              label="Search by VIN or Make"
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
            />

            <Box
              sx={{
                Height: 300,
                overflowY: "auto",
                border: "1px solid #ccc",
                borderRadius: 1,
                p: 1,
              }}
            >
              {filteredVehicles.map((vehicle) => (
                <MenuItem
                  key={vehicle.id}
                  selected={insurance.cars.includes(vehicle.id)}
                  onClick={() => toggleVehicleSelection(vehicle.id)}
                  sx={{
                    bgcolor: insurance.cars.includes(vehicle.id) ? "#f0f8ff" : "inherit",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={4}>
                      <Avatar
                        src={vehicle.coverImage || car_model}
                        sx={{ width: 48, height: 48 }}
                      />
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {vehicle.make} {vehicle.model} {vehicle.year}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {vehicle.color} - {vehicle.plateNumber}
                      </Typography>
                    </Grid>
                  </Grid>
                </MenuItem>
              ))}
            </Box>
            {mode === 'Edit' && (
              <Box>
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#2C3E50",
                    borderBottom: "4px solid #0070f3",
                    display: "inline-block",
                    paddingBottom: "4px",
                    marginBottom: "16px",
                  }}
                >
                  Upload Document
                </Typography>
                <Box marginBottom={2}>
                  <Grid container spacing={2}>
                    {insurance.insuranceFiles?.map((file, index) => (
                      <Grid item xs={12} key={index}>
                        <Link
                          target="_blank"
                          href={file.fileUrl}
                          sx={{ marginRight: 2, color: "#0070f3" }}
                        >
                          {file.fileName}
                        </Link>
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <Button variant="outlined" component="label" sx={{ textTransform: "none" }}>
                        + Upload Documents
                        <Input
                          type="file"
                          sx={{ display: "none" }}
                          onChange={handleFileUpload}
                          inputProps={{ accept: "image/png, image/jpeg, application/pdf" }}
                        />
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )
            }

          </Grid>

        </Grid>

        {/* Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSave()}
          >
            {mode === "Edit" ? "Save" : "Create"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default InsuranceModal;
