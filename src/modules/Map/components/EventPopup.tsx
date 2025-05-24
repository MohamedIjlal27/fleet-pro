import React, { useState } from 'react';
import { Box, Typography, IconButton, Tooltip, Button } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import red_alert from '/src/assets/maps/red_alert.png';
import yellow_alert from '/src/assets/maps/yellow_alert.png';
import green_alert from '/src/assets/maps/yellow_alert.png';
import { IMedia } from '../../../modules/core/interfaces/interfaces';

interface EventPopupProps {
  name: string;
  flag: string;
  media1?: IMedia;
  media2?: IMedia;
  location: string;  // Added location
}

const EventPopup: React.FC<EventPopupProps> = ({ name, flag, media1, media2, location }) => {
  const [currentMedia, setCurrentMedia] = useState<IMedia | undefined>(media1); // Default to media1 (front cam)

  // Function to get the icon URL based on the event flag
  const getIconUrlBasedOnFlag = (flag: string): string => {
    switch (flag) {
      case 'High':
        return red_alert;
      case 'Medium':
        return yellow_alert;
      default:
        return green_alert;
    }
  };

  // Function to switch the media
  const switchMedia = () => {
    setCurrentMedia(currentMedia === media1 ? media2 : media1); // Toggle between media1 and media2
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
    return date.toLocaleString('en-GB', {
      //weekday: 'short', // Optional: Show short day (e.g., 'Mon')
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // Use 24-hour format
    });
  };

  return (
    <Box
      sx={{
        minWidth: '300px',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box display="flex" alignItems="center">
        <img
          src={getIconUrlBasedOnFlag(flag)}
          alt="Event Flag"
          style={{ width: 40, height: 40, marginRight: 8 }}
        />
        <Typography variant="h6" component="strong">
          {name}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <FmdGoodOutlinedIcon sx={{ marginRight: 1 }} />
        <Typography variant="body2" color="textSecondary">
          {location ?? 'Location: N/A'}
        </Typography>
      </Box>


    
  {/* Left box for time */}
  <Box sx={{ display: 'flex', alignItems: 'center'}}>
    <AccessTimeIcon sx={{ marginRight: 1 }} />
    <Typography variant="body2" color="textSecondary">
      {currentMedia?.timestamp ? formatTimestamp(currentMedia.timestamp) : "N/A"}
    </Typography>
  </Box>



      {/* Display the selected media */}
      {currentMedia?.uploadedMedia ? (
        <Box
          sx={{
            mt: 2,
            width: '100%',
            height: 'auto',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <iframe
            src={currentMedia.uploadedMedia}
            frameBorder="0"
            allowFullScreen
            style={{ width: '100%', height: '200px', borderRadius: '4px' }}
          ></iframe>
        </Box>
      ) : (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
          No video provided.
        </Typography>
      )}



  {/* Right box for button */}
  {media1 && media2 && (
      <Button
        variant="contained"
        color="primary"
        size="small" // Makes the button smaller
        onClick={switchMedia}
        sx={{
          backgroundColor: 'gray', // Set the background color to gray
          color: 'white', // Set text color to white
          padding: '4px 8px', // Adjust padding for a smaller size
          width: '100%', // Ensure button takes full width within the right box
        }}
      >
        {currentMedia === media1 ? "Front Camera" : "Inner Camera"}
      </Button>
  )}
    </Box>
  );
};

export default EventPopup;
