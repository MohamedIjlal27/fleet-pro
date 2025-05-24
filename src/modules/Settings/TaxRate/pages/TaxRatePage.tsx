import {
  Box,
  TextField,
  Select,
  MenuItem,
  Typography,
  Grid2 as Grid,
  Button,
  Divider,
} from '@mui/material';
import { fetchSettingsTaxRate, updateSettingsTaxRate } from '../apis/apis'; // Import the API function
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { systemPlan, systemModule } from '@/utils/constants'
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from "@/modules/core/pages/Error404Page";
import LockedFeature from '@/modules/core/components/LockedFeature'

export const TaxRatePage: React.FC = () => {
  if (!checkModuleExists(systemModule.SettingsTaxRate)) {
    return checkPlanExists(systemPlan.FreeTrial) ? <LockedFeature featureName="Tax Rate" /> : <Error404Page />;
  }

  const [data, setData] = useState({});
  const [currentTaxRate, setCurrentTaxRate] = useState({ AB: '', BC: '', MB: '', NB: '', NL: '', NS: '', NT: '', NU: '', ON: '', PE: '', QC: '', SK: '', YT: '' });

  useEffect(() => {
    const loadSettingsTaxRate = async () => {
        const response_data = await fetchSettingsTaxRate();
        if (response_data) {
          setData(response_data);
          setCurrentTaxRate(response_data.metadata);
          /*Object.entries(response_data.metadata).map(
            ([k, v]) => {
              console.log(k, ' ',v);
              setCurrentTaxRate({ ...currentTaxRate, id: response_data.id, [k]: v });
              console.log(currentTaxRate);
            }
          )*/
        }
    };
    loadSettingsTaxRate();
  }, []);

  const handleSave = async () => {
    // Update existing settings perference via API
    try {
        const updatedTaxRate = await updateSettingsTaxRate(data.id, currentTaxRate);

        // Update the leads state with the updated lead data from the API
        /*setData((prevData) =>
            prevData.map((item) =>
                item.id === updatedLead.id ? { ...item, ...updatedLead } : item
            )
        );*/
        toast.success('Tax Rate updated successfully.');
    } catch (error) {
        console.error('Error updating tax-rate:', error);
    }
  };

  return (
    <>
      <Typography variant="h6" fontWeight="bold">
        Tax Rate
      </Typography>
      <Box padding="16px" bgcolor="#f9f9f9" marginTop="15px">
        <Box>
            <Grid container spacing={2} marginBottom={3}>
              {Object.entries(currentTaxRate).map(([k, v]) => (
              <Grid size={12}>
                <TextField
                  required
                  fullWidth
                  label={k}
                  InputLabelProps={{ shrink: true }}
                  value={v}
                  onChange={(e) => {setCurrentTaxRate({ ...currentTaxRate, [k]: e.target.value })} 
                }
                />
              </Grid>
              ))}
            </Grid>
        </Box>

        {/* Footer */}
        <Box>
            <Button onClick={handleSave} variant="contained" sx={{ textTransform: "none", marginRight: 2 }}>
                Save
            </Button>
        </Box>
      </Box>
    </>
  );
};

export default TaxRatePage;
