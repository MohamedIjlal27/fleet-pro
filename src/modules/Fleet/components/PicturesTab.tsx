import type React from 'react';
import { type ChangeEvent, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import UploadIcon from '@mui/icons-material/Upload';
import EditIcon from '@mui/icons-material/Edit';
// import axiosInstance from '../../../utils/axiosConfig'; // Commented out for demo mode

type PictureView = 'exterior' | 'interior';

interface Picture {
  id: number;
  documentType: string;
  fileUrl: string;
  fileName: string;
}

interface PicturesTabPros {
  vehicle: any;
}

export const PicturesTab: React.FC<PicturesTabPros> = ({ vehicle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [pictureView, setPictureView] = useState<PictureView>('exterior');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [exteriorCount, setExteriorCount] = useState<number>(0);
  const [interiorCount, setInteriorCount] = useState<number>(0);

  useEffect(() => {
    fetchPictures();
  }, []);

  useEffect(() => {
    fetchPictures();
  }, [pictureView]);

  const fetchPictures = async () => {
    try {
      console.log(`[DEMO MODE] fetchPictures for vehicle ${vehicle.id}, view: ${pictureView}`);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Demo pictures data
      const demoPictures = [
        {
          id: 1,
          documentType: 'exterior',
          fileUrl: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Exterior+1',
          fileName: 'exterior_front.jpg'
        },
        {
          id: 2,
          documentType: 'exterior',
          fileUrl: 'https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Exterior+2',
          fileName: 'exterior_side.jpg'
        },
        {
          id: 3,
          documentType: 'interior',
          fileUrl: 'https://via.placeholder.com/300x200/FF9800/FFFFFF?text=Interior+1',
          fileName: 'interior_dashboard.jpg'
        }
      ];

      const filteredPictures = demoPictures.filter(
        (pic: Picture) => pic.documentType === pictureView
      );
      setPictures(filteredPictures);
      setExteriorCount(
        demoPictures.filter((pic: Picture) => pic.documentType === 'exterior')
          .length
      );
      setInteriorCount(
        demoPictures.filter((pic: Picture) => pic.documentType === 'interior')
          .length
      );
    } catch (error) {
      console.error('Error fetching pictures:', error);
    }
  };

  const handlePictureViewChange = (
    _: React.MouseEvent<HTMLElement>,
    newView: PictureView | null
  ) => {
    if (newView !== null) {
      setPictureView(newView);
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode); // Toggle edit mode
  };

  const handleFileUpload = async (file: File) => {
    console.log(`[DEMO MODE] handleFileUpload for file: ${file.name}, type: ${pictureView}`);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('[DEMO MODE] Picture upload simulated');
      toast.success('Picture uploaded successfully (Demo Mode)');
      fetchPictures(); // Refresh pictures after upload
      setIsEditMode(false);
    } catch (error) {
      console.error('Error uploading picture:', error);
      toast.error('Error uploading picture');
    }
  };

  const handleDeletePicture = async (pictureId: number) => {
    // Integrate the delete API call
    console.error('Delete picture is not implemented');
  };

  const renderPictureContent = () => {
    if (pictures.length === 0) {
      return (
        <Typography sx={{ padding: '10px' }}>
          No {pictureView.charAt(0).toUpperCase() + pictureView.slice(1)}{' '}
          Pictures Uploaded
        </Typography>
      );
    }

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? 'repeat(2, 1fr)'
            : 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 2,
          width: '100%',
        }}
      >
        {pictures.map((picture) => (
          <Card
            key={picture.id}
            sx={{
              position: 'relative',
              borderRadius: isMobile ? '8px' : '4px',
              overflow: 'hidden',
              boxShadow: isMobile ? 'none' : undefined,
            }}
          >
            <CardMedia
              component="img"
              height={isMobile ? '100' : '140'}
              image={picture.fileUrl}
              alt={picture.fileName}
              sx={{ objectFit: 'cover' }}
            />
            {!isMobile && (
              <Typography variant="body2" align="center" mt={1}>
                {picture.fileName}
              </Typography>
            )}
            {isEditMode && (
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  width: '24px',
                  height: '24px',
                  padding: '2px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
                onClick={() => handleDeletePicture(picture.id)}
              >
                <Box
                  component="span"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  ✕
                </Box>
              </IconButton>
            )}
          </Card>
        ))}

        {isMobile && (
          <Card
            component="label"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: isMobile ? '100px' : '140px',
              border: '1px dashed #ccc',
              borderRadius: isMobile ? '8px' : '4px',
              cursor: 'pointer',
              boxShadow: 'none',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            }}
          >
            <input
              type="file"
              hidden
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const file = event.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: '#999',
              }}
            >
              <UploadIcon sx={{ mb: 1 }} />
              <Typography variant="caption">Upload Image</Typography>
            </Box>
          </Card>
        )}
      </Box>
    );
  };

  const toggleButtonStyles = (view: PictureView) => ({
    height: '36px',
    fontSize: isMobile ? '0.875rem' : '0.875rem',
    backgroundColor: pictureView === view ? '#fff' : 'transparent',
    color: pictureView === view ? '#000' : '#666',
    '&.Mui-selected': {
      backgroundColor: pictureView === view ? '#fff' : 'transparent',
      color: pictureView === view ? '#000' : '#666',
      fontWeight: pictureView === view ? '500' : 'normal',
    },
    '&:hover': {
      backgroundColor: pictureView === view ? '#fff' : 'rgba(0, 0, 0, 0.04)',
    },
    borderRadius: isMobile ? '20px' : '4px',
    padding: isMobile ? '6px 16px' : '6px 16px',
    border: isMobile ? 'none' : undefined,
    boxShadow:
      isMobile && pictureView === view
        ? '0px 2px 4px rgba(0, 0, 0, 0.1)'
        : 'none',
  });

  const actionButtonStyles = {
    height: '36px',
    backgroundColor: isMobile ? 'transparent' : '#1E293B',
    color: isMobile ? '#000' : 'white',
    fontSize: '0.875rem',
    padding: '6px 16px',
    minWidth: isMobile ? 'auto' : '64px',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: isMobile ? 'rgba(0, 0, 0, 0.04)' : '#1C2533',
      boxShadow: 'none',
    },
  };

  return (
    <Box sx={{ height: '100%' }}>
      {/* Responsive layout for buttons */}
      {isMobile ? (
        <>
          {/* Mobile layout: Top navigation */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              px: 1,
            }}
          >
            <ToggleButtonGroup
              value={pictureView}
              exclusive
              onChange={handlePictureViewChange}
              size="small"
              sx={{
                backgroundColor: '#f0f0f0',
                borderRadius: '20px',
                padding: '2px',
                height: '40px',
                flex: 1,
                maxWidth: '220px',
              }}
            >
              <ToggleButton
                value="exterior"
                sx={toggleButtonStyles('exterior')}
              >
                Exterior
              </ToggleButton>
              <ToggleButton
                value="interior"
                sx={toggleButtonStyles('interior')}
              >
                Interior
              </ToggleButton>
            </ToggleButtonGroup>

            <Button
              sx={actionButtonStyles}
              onClick={toggleEditMode}
              startIcon={isEditMode ? null : <EditIcon fontSize="small" />}
            >
              {isEditMode ? 'Done' : 'Edit'}
            </Button>
          </Box>
        </>
      ) : (
        /* Desktop layout: Side by side */
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <ToggleButtonGroup
            value={pictureView}
            exclusive
            onChange={handlePictureViewChange}
            sx={{ padding: '10px' }}
          >
            <ToggleButton value="exterior" sx={toggleButtonStyles('exterior')}>
              Exterior ({exteriorCount})
            </ToggleButton>
            <ToggleButton value="interior" sx={toggleButtonStyles('interior')}>
              Interior ({interiorCount})
            </ToggleButton>
          </ToggleButtonGroup>

          <Box display="flex" gap={1}>
            <Button
              sx={actionButtonStyles}
              onClick={toggleEditMode}
              startIcon={<EditIcon />}
            >
              {isEditMode ? 'Cancel' : 'Edit'}
            </Button>

            {isEditMode && (
              <Button
                component="label"
                sx={actionButtonStyles}
                startIcon={<UploadIcon />}
              >
                Upload
                <input
                  type="file"
                  hidden
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const file = event.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* Content container */}
      <Box sx={{ px: isMobile ? 1 : 0 }}>{renderPictureContent()}</Box>
    </Box>
  );
};
