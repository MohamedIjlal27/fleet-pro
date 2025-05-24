import type React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Grid,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import { MaintenancePage } from '../../Maintenance/MaintenanceRecord/pages/MaintenancePage';
import { MaintenanceModal } from '../../Maintenance/MaintenanceRecord/components/Modals/MaintenanceModal';
import type { IMaintenanceDetail } from '../../Maintenance/MaintenanceRecord/interfaces/interfaces';
import { fetchMaintenances } from '../../Maintenance/MaintenanceRecord/apis/apis';

interface MaintenanceTabPros {
  vehicle: any;
}

export const MaintenanceTab: React.FC<MaintenanceTabPros> = ({ vehicle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isModalOpen, setModalOpen] = useState(false);
  const [refreshTableFn, setRefreshTableFn] = useState<(() => void) | null>(
    null
  );
  const [selectedMakeModel, setSelectedMakeModel] = useState<string | null>(
    null
  );
  const [currentMaintenances, setCurrentMaintenances] = useState<
    IMaintenanceDetail[]
  >([]);

  useEffect(() => {
    loadCurrentMaintenance();
  }, []);

  const addMaintenance = () => {
    setSelectedMakeModel('123123');
    setModalOpen(true);
  };

  const loadCurrentMaintenance = async () => {
    const response = await fetchMaintenances(1, 10, vehicle.id, '40');
    console.log('fetchMaintenances response=', response);
    setCurrentMaintenances(response.data);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isMobile
      ? date.toLocaleDateString() +
          ' ' +
          date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleString();
  };

  return (
    <Box flex="1" borderRadius="8px" padding={isMobile ? '8px' : '16px'}>
      <Box
        padding={isMobile ? '12px' : '16px'}
        bgcolor="#f9f9f9"
        borderRadius={isMobile ? '8px' : '4px'}
      >
        {/* Header Section */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          marginBottom={isMobile ? '12px' : '16px'}
        >
          <Typography
            variant={isMobile ? 'subtitle1' : 'h6'}
            fontWeight={isMobile ? '500' : 'normal'}
          >
            Current Maintenance
          </Typography>

          {isMobile ? (
            <IconButton
              onClick={addMaintenance}
              sx={{
                backgroundColor: '#1E293B',
                padding: '8px',
                '&:hover': {
                  backgroundColor: '#1C2533',
                },
              }}
            >
              <Add sx={{ color: 'white', fontSize: '20px' }} />
            </IconButton>
          ) : (
            <Box display="flex" gap={2}>
              {/* Show All Button */}
              <Button
                variant="outlined"
                color="secondary"
                onClick={() =>
                  (window.location.href = '/maintenance/work-order')
                }
              >
                Show All
              </Button>

              {/* Add Icon Button */}
              <IconButton
                onClick={addMaintenance}
                sx={{
                  backgroundColor: '#1E293B',
                  padding: '8px',
                  '&:hover': {
                    backgroundColor: '#1C2533',
                  },
                }}
              >
                <Add sx={{ color: 'white' }} />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Maintenance Status */}
        {currentMaintenances.length === 0 ? (
          <Typography variant="body2" color="textSecondary" textAlign="center">
            No maintenance in progress
          </Typography>
        ) : (
          <Box
            display="flex"
            alignItems={isMobile ? 'center' : 'center'}
            flexDirection={isMobile ? 'row' : 'row'}
            sx={{
              backgroundColor: 'rgba(255, 0, 0, 0.05)',
              p: isMobile ? 1.5 : 2,
              borderRadius: '8px',
              mb: 2,
              gap: isMobile ? 1 : 0,
            }}
          >
            <ErrorOutlineIcon
              sx={{
                color: 'red',
                marginRight: isMobile ? 0 : 1,
                marginBottom: isMobile ? 0.5 : 0,
                fontSize: isMobile ? 20 : 24,
              }}
            />
            <Typography
              variant={isMobile ? 'body1' : 'h6'}
              sx={{
                color: 'red',
                fontWeight: isMobile ? '500' : 'normal',
                fontSize: isMobile ? '0.9rem' : undefined,
              }}
            >
              Maintenance in progress - Vehicle unavailable
            </Typography>
          </Box>
        )}

        {/* Maintenance Items */}
        {isMobile ? (
          // Mobile view for maintenance items
          <Box sx={{ mt: 2 }}>
            {currentMaintenances.map((maintenance) => (
              <Card
                key={maintenance.id}
                sx={{
                  mb: 2,
                  borderRadius: '8px',
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box>
                    <Box
                      display="flex"
                      alignItems="flex-start"
                      marginBottom={1}
                    >
                      <QueryBuilderIcon
                        fontSize="small"
                        sx={{
                          marginRight: 1,
                          marginTop: '2px',
                          color: 'text.secondary',
                        }}
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Start Time
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(maintenance.startTime)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      display="flex"
                      alignItems="flex-start"
                      marginBottom={1}
                    >
                      <CheckCircleOutlineIcon
                        fontSize="small"
                        sx={{
                          marginRight: 1,
                          marginTop: '2px',
                          color: 'text.secondary',
                        }}
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Expected Completion
                        </Typography>
                        <Typography variant="body2">
                          {maintenance.repairEta
                            ? formatDate(maintenance.repairEta)
                            : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box
                      display="flex"
                      alignItems="flex-start"
                      marginBottom={1}
                    >
                      <PeopleOutlineIcon
                        fontSize="small"
                        sx={{
                          marginRight: 1,
                          marginTop: '2px',
                          color: 'text.secondary',
                        }}
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Responsible Team
                        </Typography>
                        <Typography variant="body2">
                          {maintenance.user?.name || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="flex-start">
                      <LocationOnOutlinedIcon
                        fontSize="small"
                        sx={{
                          marginRight: 1,
                          marginTop: '2px',
                          color: 'text.secondary',
                        }}
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Location
                        </Typography>
                        <Typography variant="body2">
                          {maintenance.maintenanceDelivery?.location ||
                            'Location not available'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}

            {/* Show All Button for Mobile */}
            <Box
              sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 2 }}
            >
              <Button
                variant="outlined"
                size="small"
                onClick={() =>
                  (window.location.href = '/maintenance/work-order')
                }
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  py: 0.75,
                  px: 3,
                }}
              >
                Show All
              </Button>
            </Box>
          </Box>
        ) : (
          // Desktop view for maintenance items
          <Grid container spacing={2} marginTop={2} direction="column">
            {currentMaintenances.map((maintenance) => (
              <Grid item xs={12} sm={6} md={4} key={maintenance.id}>
                <Card>
                  <CardContent>
                    <Box>
                      <Box display="flex" alignItems="center" marginBottom={1}>
                        <QueryBuilderIcon
                          fontSize="small"
                          style={{ marginRight: 8 }}
                        />
                        <Typography variant="body2">
                          <strong>Start Time:</strong>{' '}
                          {formatDate(maintenance.startTime)}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" marginBottom={1}>
                        <CheckCircleOutlineIcon
                          fontSize="small"
                          style={{ marginRight: 8 }}
                        />
                        <Typography variant="body2">
                          <strong>Expected Completion:</strong>{' '}
                          {maintenance.repairEta
                            ? formatDate(maintenance.repairEta)
                            : 'N/A'}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" marginBottom={1}>
                        <PeopleOutlineIcon
                          fontSize="small"
                          style={{ marginRight: 8 }}
                        />
                        <Typography variant="body2">
                          <strong>Responsible Team:</strong>{' '}
                          {maintenance.user?.name || 'N/A'}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" marginBottom={1}>
                        <LocationOnOutlinedIcon
                          fontSize="small"
                          style={{ marginRight: 8 }}
                        />
                        <Typography variant="body2">
                          <strong>Location:</strong>{' '}
                          {maintenance.maintenanceDelivery?.location ||
                            'Location not available'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Box
        padding={isMobile ? '12px' : '16px'}
        bgcolor="#f9f9f9"
        borderRadius={isMobile ? '8px' : '4px'}
        mt={2}
      >
        <Typography
          variant={isMobile ? 'subtitle1' : 'h6'}
          fontWeight={isMobile ? '500' : 'normal'}
        >
          Maintenance History
        </Typography>
      </Box>
      <MaintenancePage
        isEdit={false}
        vehicleId={vehicle.id}
        status={['10', '20', '60', '100', '-10']}
      />
      <MaintenanceModal
        open={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          // if (refreshTableFn) {
          //   refreshTableFn(); // Call the refresh function
          // }
        }}
        mode="Create"
        vehicle={vehicle}
      />
    </Box>
  );
};
