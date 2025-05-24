import React, { useState, useEffect } from "react";
import { useParams } from 'react-router';

import { Box, Typography, TextField, Grid, Button } from "@mui/material";
import { toast } from 'react-toastify';
import { fetchCustomerDetails, updateCustomer } from '../apis/apis';
import { ICustomerFormData, ICustomer } from '../interfaces/customer.interface';

const initialFormData: ICustomerFormData = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  invoiceTitle: '',
  invoicePhoneNumber: '',
  invoiceEmail: '',
  invoiceAddress: '',
  invoiceUnitNumber: '',
  invoicePostCode: '',
  invoiceCity: '',
  invoiceProvince: '',
  invoiceCountry: '',
};

export const GeneralTab: React.FC = () => {
  const { id } = useParams<{ id: string }>();
    const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<ICustomerFormData>(initialFormData);
  const [customerData, setCustomerData] = useState<ICustomer>();
    
    useEffect(() => {
      if (id) {
        loadCustomerDetails(Number(id));
      }
    }, [id]);

    const loadCustomerDetails = async (customerId: number) => {
      try {
        // Fetch bill details and set the default customer based on the email
        const customerDetails = await fetchCustomerDetails(customerId);

        setFormData({
          email: customerDetails.email,
          firstName: customerDetails.firstName,
          lastName: customerDetails.lastName,
          phone: customerDetails.phone,
          invoiceTitle: customerDetails.invoiceTitle,
          invoicePhoneNumber: customerDetails.invoicePhoneNumber,
          invoiceEmail: customerDetails.invoiceEmail,
          invoiceAddress: customerDetails.invoiceAddress,
          invoiceUnitNumber: customerDetails.invoiceUnitNumber,
          invoicePostCode: customerDetails.invoicePostCode,
          invoiceCity: customerDetails.invoiceCity,
          invoiceProvince: customerDetails.invoiceProvince,
          invoiceCountry: customerDetails.invoiceCountry,
        });
        setCustomerData(customerDetails);
      } catch (error) {
          console.error("Error loading customer details:", error);
      }
    };

    // Toggle between Edit and View modes
    const toggleEditMode = () => {
        setIsEditMode((prevMode) => !prevMode);
    };

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
    
    const handleUpdate = () => {
      try {
        updateCustomer(Number(id), formData);
        toast.success('Customer updated successfully');
      } catch (error) {
        toast.error('Error updating customer');
      }
    };

    return (
        <Box sx={{ padding: "20px", backgroundColor: "#f4f6f8" }}>
            {/* Header with Toggle Button */}
            <Box display="flex" justifyContent="flex-end"  mb={3}>
                {isEditMode ? (
                  <Button
                      variant="contained"
                      sx={{
                          backgroundColor: "#6c5ce7",
                          color: "white",
                          textTransform: "none",
                          padding: "8px 16px",
                          
                      }}
                      onClick={handleUpdate}
                  >
                      Save
                  </Button>
                ) : (
                  <Button
                      variant="contained"
                      sx={{
                          backgroundColor: "black",
                          color: "white",
                          textTransform: "none",
                          padding: "8px 16px",
                          
                      }}
                      onClick={toggleEditMode}
                  >
                      Edit
                  </Button>
                )}
            </Box>

            {/* Form Layout */}
            <Grid container spacing={3}>
                {/* Left Section */}
                <Grid item xs={12} md={6}>
                    <Box>
                        {/* Customer ID */}
                        <Grid container spacing={2} marginBottom={3}>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" mb={1}>
                                    Customer ID
                                </Typography>
                                <TextField value={id} size="small" fullWidth disabled />
                            </Grid>
                        
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" mb={1}>
                                    Status
                                </Typography>
                                <TextField value={(customerData?.orders?.length > 0 ? "Active" : "Inactive")} size="small" fullWidth disabled />
                            </Grid>
                        </Grid>

                        {/* Personal Information */}
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
                            Personal Information
                        </Typography>
                        <Box>
                            <Grid container spacing={2} marginBottom={3}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="First Name"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        size="small"
                                        fullWidth
                                        disabled={!isEditMode}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Last Name"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        size="small"
                                        fullWidth
                                        disabled={!isEditMode}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Phone Number"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        size="small"
                                        fullWidth
                                        disabled={!isEditMode}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        size="small"
                                        fullWidth
                                        disabled={!isEditMode}
                                        required
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Company's Information */}
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
                            Company's Information (Optional)
                        </Typography>
                        <Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Company Name"
                                        name="invoiceTitle"
                                        value={formData.invoiceTitle}
                                        onChange={handleChange}
                                        size="small"
                                        fullWidth
                                        disabled={!isEditMode}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Phone Number"
                                        name="invoicePhoneNumber"
                                        value={formData.invoicePhoneNumber}
                                        onChange={handleChange}
                                        size="small"
                                        fullWidth
                                        disabled={!isEditMode}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Email"
                                        name="invoiceEmail"
                                        value={formData.invoiceEmail}
                                        onChange={handleChange}
                                        size="small"
                                        fullWidth
                                        disabled={!isEditMode}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Address"
                                        name="invoiceAddress"
                                        value={formData.invoiceAddress}
                                        onChange={handleChange}
                                        size="small"
                                        fullWidth
                                        disabled={!isEditMode}
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        label="Unit Number"
                                        name="invoiceUnitNumber"
                                        value={formData.invoiceUnitNumber}
                                        onChange={handleChange}
                                        size="small"
                                        fullWidth
                                        disabled={!isEditMode}
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        label="Postal Code"
                                        name="invoicePostCode"
                                        value={formData.invoicePostCode}
                                        onChange={handleChange}
                                        size="small"
                                        fullWidth
                                        disabled={!isEditMode}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        label="City"
                                        name="invoiceCity"
                                        value={formData.invoiceCity}
                                        onChange={handleChange}
                                        size="small"
                                        fullWidth
                                        disabled={!isEditMode}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        label="Province/State"
                                        name="invoiceProvince"
                                        value={formData.invoiceProvince}
                                        onChange={handleChange}
                                        size="small"
                                        fullWidth
                                        disabled={!isEditMode}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        label="Country"
                                        name="invoiceCountry"
                                        value={formData.invoiceCountry}
                                        onChange={handleChange}
                                        size="small"
                                        fullWidth
                                        disabled={!isEditMode}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Grid>

                {/* Right Section */}
                {/* <Grid item xs={12} md={6}>
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            border: "1px dashed #ccc",
                            borderRadius: "8px",
                            minHeight: "200px",
                            textAlign: "center",
                            padding: "20px",
                        }}
                    >
                        <Typography color="textSecondary">No orders found for this client.</Typography>
                    </Box>
                </Grid> */}
            </Grid>
        </Box>
    );
};
