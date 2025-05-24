import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Grid, Button } from "@mui/material";
import { toast } from 'react-toastify';
import { IOrganizationSettingsFormData } from '../interfaces/setting.interface';

interface GeneralTabPros {
  formData: IOrganizationSettingsFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: () => Promise<void>;
}

export const GeneralTab: React.FC<GeneralTabPros> = ({ formData, handleChange, handleSave }) => {
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
                label="Login SMS"
                InputLabelProps={{ shrink: true }}
                name="login_sms"
                value={formData.login_sms}
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
