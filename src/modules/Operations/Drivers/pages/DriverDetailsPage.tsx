import React, { useState, useEffect } from 'react';
import PageMeta from '@/components/common/PageMeta';
import { useParams } from 'react-router';
import { Box, Typography, Tabs, Tab } from '@mui/material';
// Comment out unused import for demo mode
// import axiosInstance from '../../../../utils/axiosConfig';
import { DriverGeneralInfo } from '../components/tabs/DriverGeneralInfoTab';
import { DriverVehicleAssignment } from '../components/tabs/DriverVehicleAssignmentTab';
import { BehaviourAnalytics } from '../components/tabs/BehaviourAnalyticsTab';
import { DriverKeys } from '../components/tabs/DriverKeysTab';
import { IDriver } from '../interfaces/driver.interface';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { systemPlan, systemModule } from '@/utils/constants'
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from "@/modules/core/pages/Error404Page";
import LockedFeature from '@/modules/core/components/LockedFeature'

export const DriverDetailsPage: React.FC = () => {
  if (!checkModuleExists(systemModule.OperationsDrivers)) {
    return checkPlanExists(systemPlan.FreeTrial) ? <LockedFeature featureName="Drivers" /> : <Error404Page />;
  }
  const isDriversGeneralModuleAvailable = checkModuleExists(systemModule.OperationsDriversGeneral);
  const isDriversVehicleAssignmentModuleAvailable = checkModuleExists(systemModule.OperationsDriversVehicleAssignment);
  const isDriversBehaviourAnalyticsModuleAvailable = checkModuleExists(systemModule.OperationsDriversBehaviourAndAnalytics);
  const isDriversKeysModuleAvailable = checkModuleExists(systemModule.OperationsDriversKeys);
  
  const { id } = useParams<{ id: string }>();
  const [driver, setDriver] = useState<IDriver | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Local state for form inputs
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    status: '',
    driverLicenseNumber: '',
    licenseExpirationDate: '',
    licenseType: '',
    homeAddress: '',
    emergencyNumber: '',
    emergencyName: '',
    bloodGroup: '',
    insuranceNumber: '',
    driverDigitalNumber: '',
    user: {},
  });

  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        // Comment out API call for demo mode
        // const res = await axiosInstance.get(`/api/drivers/${id}`);
        // setDriver(res.data);

        console.log('fetchDriverDetails (demo mode)', { id });
        
        // Demo driver details data
        const demoDriverDetails = {
          id: parseInt(id || '1'),
          userId: 101 + parseInt(id || '1'),
          phoneNumber: "+1-555-0101",
          firstName: "John",
          lastName: "Smith",
          email: "john.smith@example.com",
          status: "ON",
          driverLicenseNumber: "DL123456789",
          licenseExpirationDate: "2025-12-31",
          licenseType: "Machinery",
          homeAddress: "123 Main St, New York, NY 10001",
          emergencyNumber: "+1-555-0911",
          emergencyName: "Jane Smith",
          bloodGroup: "O_plus",
          insuranceNumber: "INS123456789",
          driverDigitalNumber: "DDN123456789",
          garageId: 1,
          thirdPartyCompanyId: null,
          user: {
            id: 101 + parseInt(id || '1'),
            createdAt: "2023-01-15T10:30:00Z",
            updatedAt: "2024-01-15T10:30:00Z",
            email: "john.smith@example.com",
            username: "johnsmith",
            firstName: "John",
            lastName: "Smith",
            phone: "+1-555-0101",
            accessToken: null,
            refreshToken: null,
            picture: "/src/assets/admin/default-avatar-150x150.jpg",
            organizationId: 1,
            password: "hashed_password",
            isDriver: true
          }
        };
        
        setDriver(demoDriverDetails);

        setFormState({
          firstName: demoDriverDetails.user?.firstName || '',
          lastName: demoDriverDetails.user?.lastName || '',
          phoneNumber: demoDriverDetails.user?.phone || '',
          email: demoDriverDetails.user?.email,
          status: demoDriverDetails.status,
          driverLicenseNumber: demoDriverDetails.driverLicenseNumber || '',
          licenseExpirationDate: new Date(demoDriverDetails.licenseExpirationDate)
            .toISOString()
            .split('T')[0],
          licenseType: demoDriverDetails.licenseType,
          homeAddress: demoDriverDetails.homeAddress || '',
          emergencyNumber: demoDriverDetails.emergencyNumber || '',
          emergencyName: demoDriverDetails.emergencyName || '',
          bloodGroup: demoDriverDetails.bloodGroup || '',
          insuranceNumber: demoDriverDetails.insuranceNumber || '',
          driverDigitalNumber: demoDriverDetails.driverDigitalNumber || '',
          user: demoDriverDetails.user || {},
        });
      } catch (error) {
        console.log('Error fetching driver details', error);
      }
    };
    fetchDriverDetails();
  }, [id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      // Comment out API call for demo mode
      // await axiosInstance.put(`/api/drivers/${id}`, formState);
      
      console.log('handleSubmit (demo mode)', { id, formState });
      
      toast.success('Driver details updated successfully (demo mode)');
    } catch (error) {
      console.log('Error updating driver details', error);
    }
  };

  if (!driver) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <>
      <PageMeta
        title="Driver | Synops AI"
        description="This is Driver page for Synops AI"
      />
      <Box sx={{ width: '100%' }}>
        <div className="flex gap-4">
          <Typography
            variant="h5"
            sx={{ marginTop: '5px', marginRight: '10px' }}
            gutterBottom
          >
            Driver Details
          </Typography>

          <Tabs
            value={tabValue}
            variant='fullWidth'
            onChange={handleTabChange}
            aria-label="Driver details tabs"
            sx={{
              '& .MuiTabs-indicator': {
                display: 'none',
              },
              '& .MuiTab-root': {
                color: 'black',
                borderRadius: '24px',
                padding: '4px 16px',
                transition: 'background-color 0.3s ease',
                marginRight: '16px',
              },
              '& .MuiTab-root.Mui-selected': {
                color: 'white',
                backgroundColor: '#1E293B',
              },
              '& .MuiTab-root.Mui-selected:hover': {
                color: 'white',
                backgroundColor: '#1E293B',
              },
              '& .MuiTab-root:hover': {
                color: 'black',
              },
            }}
          >
            <Tab label="General" />
            <Tab label="Vehicle Assignment" />
            <Tab label="Behaviour & Analytics" />
            <Tab label="Keys" />
          </Tabs>
        </div>

        <div className="bg-white mt-2 rounded-lg shadow-lg" >
          <motion.div
            initial={{ y: 250 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            key={tabValue}
          >
            {tabValue === 0 && id && (
              isDriversGeneralModuleAvailable ? <DriverGeneralInfo
                formState={formState}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                handleSubmit={handleSubmit}
                id={id}
              /> : <LockedFeature featureName="General" />
            )}
            {tabValue === 1 && id && (
              isDriversVehicleAssignmentModuleAvailable ? <DriverVehicleAssignment id={id} /> : <LockedFeature featureName="Vehicle Assignment" />
            )}
            {tabValue === 2 && id && (
              isDriversBehaviourAnalyticsModuleAvailable ? <BehaviourAnalytics id={id} /> : <LockedFeature featureName="Behaviour & Analytics" />
            )}
            {tabValue === 3 && id && (
              isDriversKeysModuleAvailable ? <DriverKeys id={id} /> : <LockedFeature featureName="Keys" />
            )}
          </motion.div>
        </div>
      </Box>
    </>
  );
};
