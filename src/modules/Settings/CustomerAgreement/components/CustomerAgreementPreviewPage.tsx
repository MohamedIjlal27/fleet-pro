import React, { useEffect, useState } from "react";
import { 
    Typography,
    Box,
    Grid2 as Grid,
    Button,
} from "@mui/material";
import { fetchSettingsCustomerAgreement } from '../apis/apis'; // Import the API function
import { systemPlan, systemModule } from '@/utils/constants'
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from "@/modules/core/pages/Error404Page";
import LockedFeature from '@/modules/core/components/LockedFeature'

const CustomerAgreementPreviewPage: React.FC = () => {
  if (!checkModuleExists(systemModule.SettingsCustomerAgreement)) {
    return checkPlanExists(systemPlan.FreeTrial) ? <LockedFeature featureName="Customer Agreement" /> : <Error404Page />;
  }
  
    const [data, setData] = useState([]);
    const [currentCustomerAgreement, setCurrentCustomerAgreement] = useState({ content: '' });

    useEffect(() => {
        const loadSettingsCustomerAgreement = async () => {
            const response_data = await fetchSettingsCustomerAgreement();
            if (response_data) {
                setData(response_data);
                setCurrentCustomerAgreement({
                  ...currentCustomerAgreement,
                  content: response_data.metadata.content,
                })
            }
        };
        loadSettingsCustomerAgreement();
    }, []);

    return (
        <Box
            display="flex"
            padding="16px"
            bgcolor="#f9f9f9"
            justifyContent="center"
            alignItems="center"
        >
            <Box
                width="80%"
                maxWidth="1320px"
                bgcolor="#1A2332"
                color="#fff"
                border="1px solid #e0e0e0"
                borderRadius="8px"
                padding="12px"
                marginRight="16px"
                boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
            >
                <Typography variant="h4" fontWeight="bold" style={{ backgroundColor:"#ccc", height:"100px", lineHeight:"90px", color:"#000", textAlign:"center" }} marginBottom="15px">
                    Preview Mode
                </Typography>
                <Typography component="pre" style={{ whiteSpace:"pre-wrap" }}>
                    {currentCustomerAgreement.content}
                </Typography>
                <Typography>
                    Lessee Signature
                </Typography>
                <Box
                    display="flex"
                    padding="16px"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Button variant="contained" sx={{ textTransform: "none", padding: "3rem" }}>
                        Save and Continue
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default CustomerAgreementPreviewPage;
