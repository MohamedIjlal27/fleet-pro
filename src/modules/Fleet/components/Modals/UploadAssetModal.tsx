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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddAssetModal from './ManualAddAssetModal';
import ImportAssetModal from './ImportAssetModal';
import assetImage1 from '/src/assets/asset_choose/asset_choose_1.svg';
import assetImage2 from '/src/assets/asset_choose/asset_choose_2.svg';
import assetImage3 from '/src/assets/asset_choose/asset_choose_3.svg';

interface UploadAssetModalProps {
  open: boolean;
  onClose: () => void;
}

const UploadAssetModal: React.FC<UploadAssetModalProps> = ({
  open,
  onClose,
}) => {
  const [openAddAssetModal, setOpenAddAssetModal] = useState(false);
  const [openImportAssetModal, setOpenImportAssetModal] = useState(false);

  const handleManualUpload = () => {
    onClose();
    setOpenAddAssetModal(true);
  };

  const handleCloseAddAssetModal = () => {
    setOpenAddAssetModal(false);
  };

  const handleImportAssetModal = () => {
    onClose();
    setOpenImportAssetModal(true);
  };

  const handleCloseImportAssetModal = () => {
    setOpenImportAssetModal(false);
  };

  const uploadOptions = [
    {
      id: 1,
      text: 'Manual Uploading',
      imgSrc: assetImage1,
      onClick: handleManualUpload,
    },
    {
      id: 2,
      text: 'API Synchronize',
      imgSrc: assetImage2,
      onClick: () => console.log('API Synchronize clicked'),
    },
    {
      id: 3,
      text: 'Local Uploading',
      imgSrc: assetImage3,
      onClick: handleImportAssetModal,
    },
  ];

  return (
    <>
      {/* Upload Asset Modal */}
      <Dialog open={open} onClose={onClose} maxWidth="md">
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 600,
            fontSize: '1.35rem',
          }}
        >
          Upload Asset
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <hr className="p-2" />
        <DialogContent sx={{ pt: 1, pb: 3 }}>
          <Typography sx={{ mb: 2 }}>
            Please select the way to upload assets.
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
        <DialogActions>
          <Button onClick={onClose} sx={{ bgcolor: '', color: 'gray' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <AddAssetModal
        open={openAddAssetModal}
        onClose={handleCloseAddAssetModal}
      />

      <ImportAssetModal
        open={openImportAssetModal}
        onClose={handleCloseImportAssetModal}
      />
    </>
  );
};

export default UploadAssetModal;
