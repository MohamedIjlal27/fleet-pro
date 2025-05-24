import React, { useState } from 'react';
import { Card, Typography, Grid, Avatar, Box } from '@mui/material';
import defaultImg from '/src/assets/admin/default-avatar-150x150.jpg';
import { IUserCard } from '../interfaces/interface';
import UpdateUserModal from './UpdateUserModal';

export const UserCard: React.FC<IUserCard> = ({
  id,
  firstName,
  lastName,
  email,
  phone,
  username,
  picture,
  organizationId,
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Grid item xs={12} sm={6} md={4}>
        <Card
          sx={{
            width: '100%',
            maxWidth: 400,
            height: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 2,
            border: '1px solid #e0e0e0',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
          className="cursor-pointer hover:bg-slate-100"
          onClick={handleOpen}
        >
          <Box display="flex" alignItems="center">
            <Avatar
              src={picture || defaultImg}
              alt={`${firstName} ${lastName}`}
              sx={{ width: 60, height: 60, marginRight: 2 }}
            />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {`${firstName} ${lastName}`}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Username: {username}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Email: {email}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Phone: {phone}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Organization ID: {organizationId}
              </Typography>
            </Box>
          </Box>
        </Card>
      </Grid>

      <UpdateUserModal
        open={open}
        handleClose={handleClose}
        userId={id}
        picture={picture}
        onSave={() => {
          handleClose();
        }}
      />
    </>
  );
};
