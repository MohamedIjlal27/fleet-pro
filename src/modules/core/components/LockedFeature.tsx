import React from 'react';
import { Box, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

interface LockedFeatureProps {
  featureName: string;
}

const LockedFeature: React.FC<LockedFeatureProps> = ({ featureName }) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    height="100%"
    color="gray"
    textAlign="center"
  >
    <LockIcon sx={{ fontSize: 48, color: '#1E293B', mb: 1 }} />
    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111827' }}>
      {featureName} Feature is under Premium
    </Typography>
    <Typography variant="body2" sx={{ mt: 1, color: '#374151' }}>
      This feature is part of our premium subscription model. Upgrade to access.
    </Typography>
  </Box>
);

export default LockedFeature;
