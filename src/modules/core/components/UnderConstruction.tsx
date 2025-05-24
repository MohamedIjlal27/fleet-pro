import React from 'react';
import { Box, Typography } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

interface UnderConstructionProps {
  pageName: string;
}

const UnderConstruction: React.FC<UnderConstructionProps> = ({ pageName }) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    height="100%"
    color="gray"
    textAlign="center"
  >
    <ConstructionIcon sx={{ fontSize: 48, color: '#1E293B', mb: 2 }} />
    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111827' }}>
      {pageName} is under construction
    </Typography>
    <Typography variant="body2" sx={{ mt: 1, color: '#374151' }}>
      We're working hard to bring you this page. Stay tuned for updates!
    </Typography>
  </Box>
);

export default UnderConstruction;