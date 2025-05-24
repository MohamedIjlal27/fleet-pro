import {
  Box,
  TextField,
  Select,
  MenuItem,
  Typography,
  Grid2 as Grid,
  Button,
  Divider,
  Input,
} from '@mui/material';
import {
  fetchSettingsBusinessInfo,
  updateSettingsBusinessInfo,
  uploadSettingsBusinessInfo,
} from '../apis/apis'; // Import the API function
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { systemPlan, systemModule } from '@/utils/constants';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from '@/modules/core/pages/Error404Page';
import LockedFeature from '@/modules/core/components/LockedFeature';

export const BusinessInfoPage: React.FC = () => {
  if (!checkModuleExists(systemModule.SettingsBusinessInformation)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Business Information" />
    ) : (
      <Error404Page />
    );
  }

  const [data, setData] = useState([]);
  const [currentBusinessInfo, setCurrentBusinessInfo] = useState({
    biz_icon: '',
    biz_icon_dark: '',
    biz_icon_small: '',
    biz_name: '',
    pickup_addr: [],
    pickup_hours: [],
  });

  const [bizIcon, setBizIcon] = useState<File | null>(null);
  const [bizIconPreview, setBizIconPreview] = useState('');
  const [bizIconDark, setBizIconDark] = useState<File | null>(null);
  const [bizIconDarkPreview, setBizIconDarkPreview] = useState('');
  const [bizIconSmall, setBizIconSmall] = useState<File | null>(null);
  const [bizIconSmallPreview, setBizIconSmallPreview] = useState('');

  useEffect(() => {
    const loadSettingsBusinessInfo = async () => {
      const response_data = await fetchSettingsBusinessInfo();
      if (response_data?.metadata) {
        setData(response_data);
        setCurrentBusinessInfo({
          ...currentBusinessInfo,
          biz_icon: response_data.metadata.biz_icon,
          biz_icon_dark: response_data.metadata.biz_icon_dark,
          biz_icon_small: response_data.metadata.biz_icon_small,
          biz_name: response_data.metadata.biz_name,
          pickup_addr: response_data.metadata.pickup_addr,
          pickup_hours: response_data.metadata.pickup_hours,
        });
        setBizIconPreview(response_data.metadata.biz_icon);
        setBizIconDarkPreview(response_data.metadata.biz_icon_dark);
        setBizIconSmallPreview(response_data.metadata.biz_icon_small);
      }
    };
    loadSettingsBusinessInfo();
  }, []);

  const updatePickupAddrChanged =
    (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      let newArr: string[] = currentBusinessInfo.pickup_addr;
      newArr[index] = event.target.value;

      setCurrentBusinessInfo({ ...currentBusinessInfo, pickup_addr: newArr });
    };

  const updatePickupHoursChanged =
    (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      let newArr: string[] = currentBusinessInfo.pickup_hours;
      newArr[index] = event.target.value;

      setCurrentBusinessInfo({ ...currentBusinessInfo, pickup_hours: newArr });
    };

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    //console.log(event.target.files);
    if (event.target.files && event.target.files[0]) {
      setBizIcon(event.target.files[0]);
      setBizIconPreview(URL.createObjectURL(event.target.files[0]));
    }
  }
  function handleImageDarkChange(event: React.ChangeEvent<HTMLInputElement>) {
    //console.log(event.target.files);
    if (event.target.files && event.target.files[0]) {
      setBizIconDark(event.target.files[0]);
      setBizIconDarkPreview(URL.createObjectURL(event.target.files[0]));
    }
  }
  function handleIconChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      setBizIconSmall(event.target.files[0]);
      setBizIconSmallPreview(URL.createObjectURL(event.target.files[0]));
    }
  }

  const handleSave = async () => {
    // Update existing settings perference via API
    try {
      //handle upload biz_icon
      let newbizIcon = null;
      let newbizIconDark = null;
      let newbizIconSmall = null;
      if (bizIcon) {
        try {
          const result = await uploadSettingsBusinessInfo(data.id, bizIcon);
          newbizIcon = result.url; //cloudflare storage
        } catch (error) {
          console.error('Error uploading picture:', error);
          toast.error('Error uploading picture');
        }
      }
      if (bizIconDark) {
        try {
          const result = await uploadSettingsBusinessInfo(data.id, bizIconDark);
          newbizIconDark = result.url; //cloudflare storage
        } catch (error) {
          console.error('Error uploading picture:', error);
          toast.error('Error uploading picture');
        }
      }
      if (bizIconSmall) {
        try {
          const result = await uploadSettingsBusinessInfo(
            data.id,
            bizIconSmall
          );
          newbizIconSmall = result.url; // Cloudflare storage
        } catch (error) {
          console.error('Error uploading bizIconSmall:', error);
          toast.error('Error uploading small business icon.');
        }
      }
      const updatedBusinessInfo = await updateSettingsBusinessInfo(
        currentBusinessInfo,
        newbizIcon,
        newbizIconDark,
        newbizIconSmall
      );

      toast.success('Business Info updated successfully.');
    } catch (error) {
      console.error('Error updating business-info:', error);
    }
  };

  const handleRemovePickup = async (idx: number) => {
    let pickupAddr = currentBusinessInfo.pickup_addr;
    let pickupHours = currentBusinessInfo.pickup_hours;

    delete pickupAddr[idx];
    delete pickupHours[idx];

    setCurrentBusinessInfo({
      ...currentBusinessInfo,
      pickup_addr: pickupAddr,
      pickup_hours: pickupHours,
    });
  };

  const handleAddPickup = async () => {
    let pickupAddr = currentBusinessInfo.pickup_addr;
    let pickupHours = currentBusinessInfo.pickup_hours;

    pickupAddr.push('');
    pickupHours.push('');

    setCurrentBusinessInfo({
      ...currentBusinessInfo,
      pickup_addr: pickupAddr,
      pickup_hours: pickupHours,
    });
  };

  return (
    <>
      <Typography variant="h6" fontWeight="bold">
        Business Information
      </Typography>
      <Box padding="16px" bgcolor="#f9f9f9" marginTop="15px">
        <Box>
          <Typography variant="h6" fontWeight="bold" marginBottom="1rem">
            Business Icons
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                marginBottom="0.5rem"
              >
                Light Mode Icon
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: '150px',
                  height: '100px',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px dashed gray',
                }}
              >
                {bizIconPreview ? (
                  <Box
                    component="img"
                    src={bizIconPreview}
                    alt="Business Icon Light"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      display: 'block',
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No Icon
                  </Typography>
                )}
              </Box>
              <div className="flex items-center justify-center">
                <label>
                  <input
                    type="file"
                    hidden
                    id="file_input"
                    onChange={handleImageChange}
                    // accept="image/*"
                  />
                  <div className="flex w-28 h-9 px-2 flex-col bg-indigo-600 rounded-full shadow text-white text-xs font-semibold leading-4 items-center justify-center cursor-pointer focus:outline-none">
                    Choose File
                  </div>
                </label>
              </div>
              {/* <Input
                type="file"
                onChange={handleImageChange}
                inputProps={{ accept: "image/*" }}
                sx={{
                  "&::file-selector-button": {
                    bgcolor: "primary.light",
                    color: "white",
                    fontWeight: "bold",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                }}
              /> */}
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                marginBottom="0.5rem"
              >
                Dark Mode Icon
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: '150px',
                  height: '100px',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px dashed gray',
                }}
              >
                {bizIconDarkPreview ? (
                  <Box
                    component="img"
                    src={bizIconDarkPreview}
                    alt="Business Icon Dark"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      display: 'block',
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No Icon
                  </Typography>
                )}
              </Box>
              <div className="flex items-center justify-center">
                <label>
                  <input
                    type="file"
                    hidden
                    id="file_input"
                    onChange={handleImageDarkChange}
                    // accept="image/*"
                  />
                  <div className="flex w-28 h-9 px-2 flex-col bg-indigo-600 rounded-full shadow text-white text-xs font-semibold leading-4 items-center justify-center cursor-pointer focus:outline-none">
                    Choose File
                  </div>
                </label>
              </div>
              {/* <Input
                type="file"
                onChange={handleImageDarkChange}
                inputProps={{ accept: "image/*" }}
                sx={{
                  "&::file-selector-button": {
                    bgcolor: "primary.light",
                    color: "white",
                    fontWeight: "bold",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                }}
              /> */}
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                marginBottom="0.5rem"
              >
                Small Icon
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: '150px',
                  height: '100px',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px dashed gray',
                }}
              >
                {bizIconSmallPreview ? (
                  <Box
                    component="img"
                    src={bizIconSmallPreview}
                    alt="Business Icon Small"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      display: 'block',
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No Icon
                  </Typography>
                )}
              </Box>
              <div className="flex items-center justify-center">
                <label>
                  <input
                    type="file"
                    hidden
                    id="file_input"
                    onChange={handleIconChange}
                    // accept="image/*"
                  />
                  <div className="flex w-28 h-9 px-2 flex-col bg-indigo-600 rounded-full shadow text-white text-xs font-semibold leading-4 items-center justify-center cursor-pointer focus:outline-none">
                    Choose File
                  </div>
                </label>
              </div>
            </Grid>
          </Grid>

          <Typography variant="h6" fontWeight="bold" marginTop="2rem">
            Customer Pick-Up Locations
          </Typography>
          <Divider sx={{ marginBottom: '1rem' }} />

          {currentBusinessInfo.pickup_addr.map((item, idx) => (
            <Grid
              key={idx}
              container
              spacing={2}
              marginBottom="1.5rem"
              alignItems="flex-start"
            >
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Business Name"
                  InputLabelProps={{ shrink: true }}
                  value={currentBusinessInfo.biz_name}
                  onChange={(e) =>
                    setCurrentBusinessInfo({
                      ...currentBusinessInfo,
                      biz_name: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location Address"
                  InputLabelProps={{ shrink: true }}
                  value={currentBusinessInfo.pickup_addr[idx]}
                  onChange={updatePickupAddrChanged(idx)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Business Hours"
                  multiline
                  rows={4}
                  InputLabelProps={{ shrink: true }}
                  value={currentBusinessInfo.pickup_hours[idx]}
                  onChange={updatePickupHoursChanged(idx)}
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" gap={1}>
                  <Button
                    onClick={() => handleRemovePickup(idx)}
                    variant="outlined"
                    color="error"
                    sx={{ textTransform: 'none' }}
                  >
                    Remove Location
                  </Button>
                </Box>
              </Grid>
            </Grid>
          ))}
          <Box marginTop={4} marginBottom={2}>
            <Button
              onClick={handleAddPickup}
              variant="outlined"
              sx={{ textTransform: 'none' }}
            >
              Add Another Location
            </Button>
          </Box>
        </Box>

        <Divider sx={{ marginY: 2 }} />

        {/* Footer */}
        <Box display="flex" justifyContent="flex-end" marginTop={3}>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default BusinessInfoPage;
