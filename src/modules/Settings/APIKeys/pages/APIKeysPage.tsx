import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { fetchApiKeys, updateApiKeys } from '../apis/apis';
import { toast } from 'react-toastify';
import { systemPlan, systemModule } from '@/utils/constants'
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from "@/modules/core/pages/Error404Page";
import LockedFeature from '@/modules/core/components/LockedFeature'

export const ApiKeysPage: React.FC  = () => {
  if (!checkModuleExists(systemModule.SettingsAPIKeys)) {
    return checkPlanExists(systemPlan.FreeTrial) ? <LockedFeature featureName="API Keys" /> : <Error404Page />;
  }

  // State to hold the API keys and the visibility of the password
  const [apiKeys, setApiKeys] = useState({
    stripe_secret_key: '',
    stripe_publish_key: '',
    stripe_webhook_key: '',
    geotab_server: '',
    geotab_database: '',
    geotab_password: '',
    geotab_username: '',
    flespi_token: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showStripeWebhook, setShowStripeWebhook] = useState(false);


  // Fetch API keys data on page load
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        const response = await fetchApiKeys();
        //console.log("fetch api response =", response);
        setApiKeys({
          stripe_secret_key: response.metadata?.stripe_secret_key,
          stripe_publish_key: response.metadata?.stripe_publish_key,
          stripe_webhook_key: response.metadata?.stripe_webhook_key,
          geotab_server: response.metadata?.geotab_server,
          geotab_database: response.metadata?.geotab_database,
          geotab_password: response.metadata?.geotab_password,
          geotab_username: response.metadata?.geotab_username,
          flespi_token: response.metadata?.flespi_token,
        });
      } catch (error) {
        //console.error('Error fetching API keys:', error);
      }
    };

    loadApiKeys();
  }, []);

  // Handle input change for text fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiKeys((prevKeys) => ({
      ...prevKeys,
      [name]: value,
    }));
  };

  // Handle saving the updated API keys
  const handleSave = async () => {

    // Show confirmation dialog
    const isConfirmed = window.confirm('Are you sure you want to save the changes?');

    if (!isConfirmed) {
      // Exit the function if the user cancels
      return;
    }

    try {
      const response = await updateApiKeys(apiKeys); // Update the endpoint
      console.log('API keys updated successfully', response);
      toast.success('API keys updated successfully');
      // You can show a success message or update state if needed
      window.location.reload();

    } catch (error) {
      console.error('Error saving API keys:', error);
      toast.error('Fail to save API keys')
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>

      {/* Stripe Secret Key */}
      <TextField
        label="Stripe Secret Key"
        name="stripe_secret_key"
        type={showStripeSecret ? 'text' : 'password'}
        value={apiKeys.stripe_secret_key}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowStripeSecret((prev) => !prev)}
                edge="end"
              >
                {showStripeSecret ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {/* Stripe Publish Key */}
      <TextField
        label="Stripe Publish Key"
        name="stripe_publish_key"
        type={showStripeSecret ? 'text' : 'password'}
        value={apiKeys.stripe_publish_key}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowStripeSecret((prev) => !prev)}
                edge="end"
              >
                {showStripeSecret ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Stripe Webhook Key */}
      <TextField
        label="Stripe Webhook Key"
        name="stripe_webhook_key"
        type={showStripeWebhook ? 'text' : 'password'}
        value={apiKeys.stripe_webhook_key}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowStripeWebhook((prev) => !prev)}
                edge="end"
              >
                {showStripeWebhook ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Geotab Server"
        name="geotab_server"
        value={apiKeys.geotab_server}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Geotab Database"
        name="geotab_database"
        value={apiKeys.geotab_database}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />

      {/* Password Field with Show Password Toggle */}
      <TextField
        label="Geotab Password"
        name="geotab_password"
        type={showPassword ? 'text' : 'password'}
        value={apiKeys.geotab_password}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((prev) => !prev)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Geotab Username"
        name="geotab_username"
        value={apiKeys.geotab_username}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />
      {/* <TextField
        label="Flespi Token"
        name="flespi_token"
        value={apiKeys.flespi_token}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      /> */}

      <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default ApiKeysPage;
