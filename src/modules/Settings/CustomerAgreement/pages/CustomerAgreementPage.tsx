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
} from '@mui/material';
import { fetchSettingsCustomerAgreement, updateSettingsCustomerAgreement } from '../apis/apis'; // Import the API function
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { systemPlan, systemModule } from '@/utils/constants'
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from "@/modules/core/pages/Error404Page";
import LockedFeature from '@/modules/core/components/LockedFeature'

export const CustomerAgreementPage: React.FC = () => {
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

  const handleSave = async () => {
    // Update existing settings perference via API
    try {
        const updatedCustomerAgreement = await updateSettingsCustomerAgreement(data.id, currentCustomerAgreement);

        // Update the leads state with the updated lead data from the API
        /*setData((prevData) =>
            prevData.map((item) =>
                item.id === updatedLead.id ? { ...item, ...updatedLead } : item
            )
        );*/
        toast.success('Customer Agreement updated successfully.');
    } catch (error) {
        console.error('Error updating customer-agreement:', error);
    }
  };

  return (
    <>
      <Typography variant="h6" fontWeight="bold">
        Customer Agreement
      </Typography>
      <Box padding="16px" bgcolor="#f9f9f9" marginTop="15px">
        <Box>
          <Grid container spacing={2} marginBottom={3}>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={28}
                label="Agreement Content"
                InputLabelProps={{ shrink: true }}
                value={currentCustomerAgreement.content}
                onChange={(e) => setCurrentCustomerAgreement({ ...currentCustomerAgreement, content: e.target.value })}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Footer */}
        <Box>
            <Link target="_blank" href="/preview/customer-agreement" sx={{ marginRight: 2, color: "#0070f3" }}>
                Preview
            </Link>
            <Button onClick={handleSave} variant="contained" sx={{ textTransform: "none", marginRight: 2 }}>
                Save
            </Button>
        </Box>
      </Box>
    </>
  );
};

export default CustomerAgreementPage;
