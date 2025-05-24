import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Grid, Button } from "@mui/material";
import { toast } from 'react-toastify';
import { IOrganizationSettingsFormData } from '../interfaces/setting.interface';

interface SubscriptionRentalTabPros {
  formData: IOrganizationSettingsFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: () => Promise<void>;
}

export const SubscriptionRentalTab: React.FC<SubscriptionRentalTabPros> = ({ formData, handleChange, handleSave }) => {
  return (
    <Box sx={{ padding: "20px", backgroundColor: "#f4f6f8" }}>
      {/* Form Layout */}
      <Box padding="16px" bgcolor="#f9f9f9" marginTop="15px">
        <Box>
          <Grid container spacing={2} marginBottom={3}>
            <Grid item xs={12} md={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Ordering SMS"
                InputLabelProps={{ shrink: true }}
                name="ordering_sms"
                value={formData.ordering_sms}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Order Payment Request SMS"
                InputLabelProps={{ shrink: true }}
                name="order_payment_request_sms"
                value={formData.order_payment_request_sms}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Customer Signature SMS"
                InputLabelProps={{ shrink: true }}
                name="customer_signature_sms"
                value={formData.customer_signature_sms}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Bill Payment Request SMS"
                InputLabelProps={{ shrink: true }}
                name="bill_payment_request_sms"
                value={formData.bill_payment_request_sms}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Task Assigned SMS"
                InputLabelProps={{ shrink: true }}
                name="task_assigned_sms"
                value={formData.task_assigned_sms}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Footer */}
        <Box>
            <Button onClick={handleSave} variant="contained" sx={{ textTransform: "none", marginRight: 2 }}>
                Save
            </Button>
        </Box>
      </Box>
    </Box>
  );
};
