import React, { ChangeEvent, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Tabs,
  Tab,
  Paper,
  Box,
  Typography,
  Divider,
  Button,
  Card,
  CardMedia,
  IconButton,
  Tooltip,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
// import axiosInstance from '../../../utils/axiosConfig'; // Commented out for demo mode
import SchedulesModal from './SchedulesModal';
import { MaintenanceTab } from './MaintenanceTab';
import { InspectionTab } from './InspectionTab';
import { PicturesTab } from './PicturesTab';
import { DocumentsTab } from './DocumentsTabs';
import { LogsTab } from './LogsTab';
import { NotesTab } from './NotesTab';
import { systemPlan, systemModule } from '@/utils/constants';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import UnderConstruction from '@/modules/core/components/UnderConstruction';
import LockedFeature from '@/modules/core/components/LockedFeature';

interface VehicleInfoTabsProps {
  vehicle: any;
}

const VehicleInfoTabs: React.FC<VehicleInfoTabsProps> = ({ vehicle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isSchedulesModuleAvailable = checkModuleExists(
    systemModule.FleetSchedules
  );
  const isMaintenanceModuleAvailable = checkModuleExists(
    systemModule.FleetMaintenance
  );
  const isInspectionModuleAvailable = checkModuleExists(
    systemModule.FleetInspection
  );
  const isPicturesModuleAvailable = checkModuleExists(
    systemModule.FleetPictures
  );
  const isDocumentsModuleAvailable = checkModuleExists(
    systemModule.FleetDocuments
  );
  const isLogsModuleAvailable = checkModuleExists(systemModule.FleetLogs);
  const isNotesModuleAvailable = checkModuleExists(systemModule.FleetNotes);

  const [selectedTab, setSelectedTab] = useState<number>(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // Define the tab labels with short and long versions
  const tabLabels = [
    { short: 'Sched', long: 'Schedules' },
    { short: 'Maint', long: 'Maintenance' },
    { short: 'Insp', long: 'Inspection' },
    { short: 'Pics', long: 'Pictures' },
    { short: 'Docs', long: 'Documents' },
    { short: 'Logs', long: 'Logs' },
    { short: 'Notes', long: 'Notes' },
  ];

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return isSchedulesModuleAvailable ? (
          <SchedulesModal vehicle={vehicle} />
        ) : (
          <LockedFeature featureName="Schedules" />
        );
      case 1:
        return isMaintenanceModuleAvailable ? (
          <MaintenanceTab vehicle={vehicle} />
        ) : (
          <LockedFeature featureName="Maintenance" />
        );
      case 2:
        return isInspectionModuleAvailable ? (
          <InspectionTab vehicle={vehicle} />
        ) : (
          <LockedFeature featureName="Inspection" />
        );
      case 3:
        return isPicturesModuleAvailable ? (
          <PicturesTab vehicle={vehicle} />
        ) : (
          <LockedFeature featureName="Pictures" />
        );
      case 4:
        return isDocumentsModuleAvailable ? (
          <DocumentsTab vehicle={vehicle} />
        ) : (
          <LockedFeature featureName="Documents" />
        );
      case 5:
        return isLogsModuleAvailable ? (
          <LogsTab vehicle={vehicle} />
        ) : (
          <LockedFeature featureName="Logs" />
        );
      case 6:
        return isNotesModuleAvailable ? (
          <NotesTab vehicle={vehicle} />
        ) : (
          <LockedFeature featureName="Notes" />
        );

      default:
        return null;
    }
  };

  return (
    <Box flex="1" display="flex" flexDirection="column" height="100%">
      <Paper
        elevation={3}
        sx={{
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}
      >
        {/* Tabs Header */}
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          indicatorColor="primary"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#1E293B',
            },
            '& .MuiTab-root': {
              color: 'black',
              fontSize: isMobile ? '0.7rem' : '0.875rem',
              minWidth: isMobile ? '60px' : '90px',
              padding: isMobile ? '6px 8px' : '12px 16px',
            },
            '& .MuiTab-root.Mui-selected': {
              color: 'black',
            },
            '& .MuiTab-root:hover': {
              color: 'black',
            },
          }}
        >
          {tabLabels.map((tab, index) => (
            <Tab key={index} label={isMobile ? tab.short : tab.long} />
          ))}
        </Tabs>
        <Divider />

        {/* Render Content Based on Selected Tab */}
        <Box>{renderTabContent()}</Box>
      </Paper>
    </Box>
  );
};

export default VehicleInfoTabs;
