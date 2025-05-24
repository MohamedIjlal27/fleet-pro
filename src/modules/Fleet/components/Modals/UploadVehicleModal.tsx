import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  IconButton,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddVehicleModal from './ManualAddVehicleModal';
import ImportVehicleModal from './ImportVehicleModal';
import carImage1 from '/src/assets/car_choose/car_choose_1.svg';
import carImage2 from '/src/assets/car_choose/car_choose_2.svg';
import carImage3 from '/src/assets/car_choose/car_choose_3.svg';

interface UploadVehicleModalProps {
  open: boolean;
  onClose: () => void;
}

const UploadVehicleModal: React.FC<UploadVehicleModalProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openAddVehicleModal, setOpenAddVehicleModal] = useState(false);
  const [openImportVehicleModal, setOpenImportVehicleModal] = useState(false);

  const handleManualUpload = () => {
    onClose();
    setOpenAddVehicleModal(true);
  };

  const handleCloseAddVehicleModal = () => {
    setOpenAddVehicleModal(false);
  };

  const handleImportVehicleModal = () => {
    onClose();
    setOpenImportVehicleModal(true);
  };

  const handleCloseImportVehicleModal = () => {
    setOpenImportVehicleModal(false);
  };

  const uploadOptions = [
    {
      id: 1,
      text: 'Manual Uploading',
      imgSrc: carImage1,
      onClick: handleManualUpload,
    },
    {
      id: 2,
      text: 'API Synchronize',
      imgSrc: carImage2,
      onClick: () => console.log('API Synchronize clicked'),
    },
    {
      id: 3,
      text: 'Local Uploading',
      imgSrc: carImage3,
      onClick: handleImportVehicleModal,
    },
  ];

  return (
    <>
      {/* Upload Vehicle Modal */}
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 600,
            fontSize: '1.35rem',
          }}
        >
          Upload Vehicle
          <IconButton aria-label="close" onClick={onClose} sx={{ padding: 0 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <hr className="p-2" />
        <DialogContent sx={{ pt: 1, pb: 3 }}>
          <Typography sx={{ mb: 3 }}>
            Please select the way to upload vehicles.
          </Typography>
          <Grid container spacing={4}>
            {uploadOptions.map((option) => (
              <Grid item xs={12} md={4} key={option.id}>
                <Box
                  onClick={option.onClick}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: '#f5f5f5',
                    borderRadius: 1,
                    height: '100%',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={option.imgSrc}
                      alt={option.text}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      position: 'absolute',
                      bottom: 0,
                      width: '100%',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      backgroundColor: 'transparent',
                    }}
                  >
                    <Typography
                      component="p"
                      sx={{
                        fontWeight: 600,
                        fontSize: '1rem',
                      }}
                    >
                      {option.text}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>

      <AddVehicleModal
        open={openAddVehicleModal}
        onClose={handleCloseAddVehicleModal}
      />

      <ImportVehicleModal
        open={openImportVehicleModal}
        onClose={handleCloseImportVehicleModal}
      />
    </>
  );
};

export default UploadVehicleModal;
