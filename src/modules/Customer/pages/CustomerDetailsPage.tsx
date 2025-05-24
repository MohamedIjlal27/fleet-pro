import React, { useState } from "react";
import { useParams } from 'react-router';
import { Box, Typography, Tabs, Tab, Button } from "@mui/material";
import {GeneralTab} from "../components/GeneralTab";
import { OrderHistoryTab } from "../components/OrderHistoryTab";
import {BillHistoryTab} from "../components/BillHistoryTab";
import {RequestTab} from "../components/RequestTab";
import { systemPlan, systemModule } from '@/utils/constants'
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from "@/modules/core/pages/Error404Page";
import LockedFeature from '@/modules/core/components/LockedFeature'

export const CustomerDetailsPage: React.FC = () => {
  if (!checkModuleExists(systemModule.Customer)) {
    return checkPlanExists(systemPlan.FreeTrial) ? <LockedFeature featureName="Customer" /> : <Error404Page />;
  }
  
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("General");

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ padding: "20px", bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          Customer Details
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
        <Tab label="Order History" value="Order History" />
        <Tab label="Bill History" value="Bill History" />
        <Tab label="Request" value="Request" />
      </Tabs>

      {/* Tab Content */}
      {activeTab === "General" && <GeneralTab />}
      {activeTab === "Order History" && <OrderHistoryTab customerId={Number(id)} />}
      {activeTab === "Bill History" && <BillHistoryTab customerId={Number(id)} />}
      {activeTab === "Request" && <RequestTab customerId={Number(id)} />}
    </Box>
  );
};

