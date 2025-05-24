import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  CircularProgress,
  Grid,
  Typography,
  TextField,
} from '@mui/material';
import axiosInstance from '../../../../utils/axiosConfig';
import { toast } from 'react-toastify';
import { RootState } from '../../../../redux/app/store';
import defaultImg from '/src/assets/admin/default-avatar-150x150.jpg';

interface IRole {
  id: number;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  isCustom: boolean;
  rolePermissions: [],
}

interface IOrganization {
  id: number;
  name: string;
}

interface IDriverDetails {
  id: number;
  phoneNumber: string;
  status: string;
  driverLicenseNumber: string;
  licenseExpirationDate: string;
  licenseType: string;
  homeAddress: string;
  emergencyNumber: string;
  emergencyName: string;
  bloodGroup: string;
  insuranceNumber: string;
  driverDigitalNumber: string;
  garageId: number;
}

interface IUserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone?: string;
  company?: string;
  type?: string;
  profile_photo_url?: string;
  createdAt: string;
  updatedAt: string;
  organization: IOrganization;
  roles: IRole[];
  driver?: IDriverDetails;
}

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<IUserProfile | null>(null);

  const userId = useSelector((state: RootState) => state.user.id);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get(`/api/user/${userId}`);
        // setUserDetails(response.data);
        
        console.log('fetchUserProfile (demo mode)', { userId });
        
        // Demo user profile data
        const demoUserProfile: IUserProfile = {
          id: userId || 1,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          username: "johndoe",
          phone: "+1-555-0123",
          company: "Demo Company",
          type: "Admin",
          profile_photo_url: undefined,
          createdAt: "2023-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z",
          organization: {
            id: 1,
            name: "Demo Organization"
          },
          roles: [
            {
              id: 1,
              name: "Administrator",
              description: "Full system access",
              slug: "admin",
              isActive: true,
              isCustom: false,
              rolePermissions: []
            },
            {
              id: 2,
              name: "Fleet Manager",
              description: "Fleet management access",
              slug: "fleet-manager",
              isActive: true,
              isCustom: false,
              rolePermissions: []
            }
          ],
          driver: {
            id: 1,
            phoneNumber: "+1-555-0123",
            status: "Active",
            driverLicenseNumber: "DL123456789",
            licenseExpirationDate: "2025-12-31T00:00:00Z",
            licenseType: "Commercial",
            homeAddress: "123 Main St, New York, NY 10001",
            emergencyNumber: "+1-555-0911",
            emergencyName: "Jane Doe",
            bloodGroup: "O+",
            insuranceNumber: "INS123456789",
            driverDigitalNumber: "DDN123456789",
            garageId: 1
          }
        };
        
        setUserDetails(demoUserProfile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId]);

  if (loading || !userDetails) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 900,
        margin: 'auto',
        p: 4,
        borderRadius: '8px',
        boxShadow: 3,
        bgcolor: 'slate.800',
      }}
    >
      <Typography variant="h4" align="center" sx={{ mb: 4, color: 'white' }}>
        Profile
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center' }}>
            <img
              src={userDetails.profile_photo_url || `${defaultImg}`}
              alt="Profile"
              style={{
                borderRadius: '50%',
                width: '150px',
                height: '150px',
              }}
              className="mx-auto"
            />
          </Box>
        </Grid>
        {/* User information fields grouped in columns */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                value={userDetails.firstName}
                fullWidth
                disabled
                variant="outlined"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                value={userDetails.lastName}
                fullWidth
                disabled
                variant="outlined"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                value={userDetails.email}
                fullWidth
                disabled
                variant="outlined"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Username"
                value={userDetails.username}
                fullWidth
                disabled
                variant="outlined"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                value={userDetails.phone || 'N/A'}
                fullWidth
                disabled
                variant="outlined"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Organization"
                value={userDetails.organization?.name || 'N/A'}
                fullWidth
                disabled
                variant="outlined"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Roles"
                value={
                  userDetails.roles.length > 0
                    ? userDetails.roles.map((role) => role.name).join(', ')
                    : 'N/A'
                }
                fullWidth
                disabled
                variant="outlined"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Account Created"
                value={new Date(userDetails.createdAt).toLocaleDateString()}
                fullWidth
                disabled
                variant="outlined"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Updated"
                value={new Date(userDetails.updatedAt).toLocaleDateString()}
                fullWidth
                disabled
                variant="outlined"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            {/* Driver-specific fields */}
            {userDetails.driver && (
              <>
                <Grid item xs={12}>
                  <Typography
                    variant="h5"
                    sx={{ mt: 4, mb: 2, color: 'white' }}
                  >
                    Driver Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Status"
                    value={userDetails.driver.status}
                    fullWidth
                    disabled
                    variant="outlined"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Driver License Number"
                    value={userDetails.driver.driverLicenseNumber}
                    fullWidth
                    disabled
                    variant="outlined"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="License Expiration Date"
                    value={new Date(
                      userDetails.driver.licenseExpirationDate
                    ).toLocaleDateString()}
                    fullWidth
                    disabled
                    variant="outlined"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="License Type"
                    value={userDetails.driver.licenseType}
                    fullWidth
                    disabled
                    variant="outlined"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Home Address"
                    value={userDetails.driver.homeAddress}
                    fullWidth
                    disabled
                    variant="outlined"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Emergency Contact Name"
                    value={userDetails.driver.emergencyName}
                    fullWidth
                    disabled
                    variant="outlined"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Emergency Contact Number"
                    value={userDetails.driver.emergencyNumber}
                    fullWidth
                    disabled
                    variant="outlined"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Blood Group"
                    value={userDetails.driver.bloodGroup}
                    fullWidth
                    disabled
                    variant="outlined"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Insurance Number"
                    value={userDetails.driver.insuranceNumber}
                    fullWidth
                    disabled
                    variant="outlined"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Driver Digital Number"
                    value={userDetails.driver.driverDigitalNumber}
                    fullWidth
                    disabled
                    variant="outlined"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
