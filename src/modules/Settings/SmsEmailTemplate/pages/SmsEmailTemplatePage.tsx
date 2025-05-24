import {
  Box,
  TextField,
  Select,
  MenuItem,
  Typography,
  Grid2 as Grid,
  Button,
  Divider,
  Link,
  Tabs, Tab,
} from '@mui/material';
import { fetchSettingsSmsEmailTemplate, updateSettingsSmsEmailTemplate } from '../apis/apis'; // Import the API function
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { IOrganizationSettingsFormData } from '../interfaces/setting.interface';
import {GeneralTab} from "../components/GeneralTab";
import {FleetManagementTab} from "../components/FleetManagementTab";
import {SubscriptionRentalTab} from "../components/SubscriptionRentalTab";
import {DispatchCentreTab} from "../components/DispatchCentreTab";
import { systemPlan, systemModule } from '@/utils/constants'
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from "@/modules/core/pages/Error404Page";
import LockedFeature from '@/modules/core/components/LockedFeature'

const initialFormData: IOrganizationSettingsFormData = {
  login_sms: '',
  ordering_sms: '',
  order_payment_request_sms: '',
  customer_signature_sms: '',
  task_assigned_sms: '',
  bill_payment_request_sms: '',
};

export const SmsEmailTemplatePage = () => {
  if (!checkModuleExists(systemModule.SettingsSmsEmailTemplate)) {
    return checkPlanExists(systemPlan.FreeTrial) ? <LockedFeature featureName="SMS / Email Template" /> : <Error404Page />;
  }
  const isSmsEmailTemplateGeneralModuleAvailable = checkModuleExists(systemModule.SettingsSmsEmailTemplateGeneral);
  const isSmsEmailTemplateFleetManagementModuleAvailable = checkModuleExists(systemModule.SettingsSmsEmailTemplateFleetManagement);
  const isSmsEmailTemplateSubscriptionRentalModuleAvailable = checkModuleExists(systemModule.SettingsSmsEmailTemplateSubscriptionRental);
  const isSmsEmailTemplateDispatchCentreModuleAvailable = checkModuleExists(systemModule.SettingsSmsEmailTemplateDispatchCentre);
  const isFleetManagementPlanAvailable = checkPlanExists(systemPlan.FleetManagement);
  const isSubscriptionRentalPlanAvailable = checkPlanExists(systemPlan.SubscriptionRental);
  const isDispatchCentrePlanAvailable = checkPlanExists(systemPlan.DispatchCentre);

  //const [data, setData] = useState([]);
  const [formData, setFormData] = useState<IOrganizationSettingsFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState("General");

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    loadSettingsSmsEmailTemplate();
  }, []);

  const loadSettingsSmsEmailTemplate = async () => {
    const response_data = await fetchSettingsSmsEmailTemplate();
    if (response_data) {
      //setData(response_data);
      setFormData({
        login_sms: response_data.metadata.login_sms,
        ordering_sms: response_data.metadata.ordering_sms,
        order_payment_request_sms: response_data.metadata.order_payment_request_sms,
        customer_signature_sms: response_data.metadata.customer_signature_sms,
        task_assigned_sms: response_data.metadata.task_assigned_sms,
        bill_payment_request_sms: response_data.metadata.bill_payment_request_sms,
      })
    }
  };
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateSettingsSmsEmailTemplate(formData);
      toast.success('SMS / Email Template updated successfully.');
    } catch (error) {
      console.error('Error updating SMS / Email Template:', error);

      if (error instanceof Error) {
        toast.error(`Failed to update: ${error.message}`);
      } else {
        toast.error('An unknown error occurred.');
      }
    }
  };

  return (
    <Box sx={{ padding: "20px", bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          SMS / Email Template
        </Typography>
        
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          marginBottom: "20px",
          "& .MuiTabs-flexContainer": {
            justifyContent: "flex-start",
          },
          "& .MuiTab-root": {
            textTransform: "none",
            padding: "8px 16px",
            fontWeight: "bold",
          },
          "& .Mui-selected": {
            color: "black",
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "black",
          },
        }}
      >
        <Tab label="General" value="General" />
        {isFleetManagementPlanAvailable && <Tab label="Fleet Management" value="Fleet Management" />}
        {isSubscriptionRentalPlanAvailable && <Tab label="Subscription/ Rental" value="Subscription/ Rental" />}
        {isDispatchCentrePlanAvailable && <Tab label="Dispatch Centre" value="Dispatch Centre" />}
      </Tabs>

      {/* Tab Content */}
      {activeTab === "General" && (isSmsEmailTemplateGeneralModuleAvailable ? <GeneralTab formData={formData} handleChange={handleChange} handleSave={handleSave} /> : <LockedFeature featureName="General" />)}
      {activeTab === "Fleet Management" && (isSmsEmailTemplateFleetManagementModuleAvailable ? <FleetManagementTab formData={formData} handleChange={handleChange} handleSave={handleSave} /> : <LockedFeature featureName="Fleet Management" />)}
      {activeTab === "Subscription/ Rental" && (isSmsEmailTemplateSubscriptionRentalModuleAvailable ? <SubscriptionRentalTab formData={formData} handleChange={handleChange} handleSave={handleSave} /> : <LockedFeature featureName="Subscription/ Rental" />)}
      {activeTab === "Dispatch Centre" && (isSmsEmailTemplateDispatchCentreModuleAvailable ? <DispatchCentreTab formData={formData} handleChange={handleChange} handleSave={handleSave} /> : <LockedFeature featureName="Dispatch Centre" />)}
    </Box>
  );
};

export default SmsEmailTemplatePage;
