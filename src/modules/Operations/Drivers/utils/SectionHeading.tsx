import React from 'react';
import { Typography } from '@mui/material';

interface SectionHeadingProps {
  title: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ title }) => (
  <div className="flex items-center mb-4">
    <div
      style={{
        backgroundColor: 'black',
        width: '4px',
        height: '24px',
        marginRight: '10px',
      }}
    />
    <Typography variant="h6" color="textPrimary">
      {title}
    </Typography>
  </div>
);
