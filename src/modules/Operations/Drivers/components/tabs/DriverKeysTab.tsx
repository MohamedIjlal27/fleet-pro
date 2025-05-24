import React from 'react';
import { Box, Typography } from '@mui/material';
import { IDriverKeysTabProps } from '../../interfaces/driver.interface';

export const DriverKeys: React.FC<IDriverKeysTabProps> = (
  id,
) => {
  return (
    <Box p={2}>
      <Typography variant="h6" color="primary">
        Driver Keys
      </Typography>
      <Typography color="textSecondary">
        No keys information available for this driver.
      </Typography>
    </Box>
  );
};
