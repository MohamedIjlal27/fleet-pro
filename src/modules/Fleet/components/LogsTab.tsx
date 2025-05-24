'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Divider,
  Modal,
  Button,
  Card,
  IconButton,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
  InputAdornment,
  List,
  Collapse,
  SwipeableDrawer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { ILogsData } from '../interfaces/interfaces';
import { fetchLogs } from '../apis/apis';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import { SlidersHorizontal } from 'lucide-react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface LogsTabPros {
  vehicle: any;
}

export const LogsTab: React.FC<LogsTabPros> = ({ vehicle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [logs, setLogs] = useState<ILogsData>({
    vehicleHistory: [],
    driverHistory: [],
    fuelHistory: [],
    commandHistory: [], // Added for command history
  });
  const [vehicleHistoryfilters, setVehicleHistoryFilters] = useState({
    firstName: '',
    lastName: '',
    createdAt: '',
    type: '',
    description: '',
  });
  const [driverHistoryfilters, setDriverHistoryFilters] = useState({
    firstName: '',
    lastName: '',
    startDate: '',
    endDate: '',
  });
  const [fuelHistoryfilters, setFuelHistoryFilters] = useState({
    date: '',
    latitude: '',
    longitude: '',
    amount: '',
  });
  const [commandHistoryfilters, setCommandHistoryFilters] = useState({
    command: '',
    date: '',
    user: '',
    status: '',
    location: '',
  });
  const [open, setOpen] = useState(false); // Modal open/close state
  const [driverData, setDriverData] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDrivers, setExpandedDrivers] = useState<
    Record<string, boolean>
  >({});
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const respone = await fetchLogs(vehicle.id);
    if (respone) {
      setLogs({
        vehicleHistory: respone.vehicleHistory || [],
        driverHistory: respone.driverHistory || [],
        fuelHistory: respone.fuelHistory || [],
        commandHistory: respone.commandHistory || [],
      });
    }
  };

  const filterVehicleHistoryData = () => {
    return logs.vehicleHistory?.filter((item) => {
      return (
        (vehicleHistoryfilters.firstName === '' ||
          item.firstName
            ?.toLowerCase()
            .includes(vehicleHistoryfilters.firstName.toLowerCase())) &&
        (vehicleHistoryfilters.lastName === '' ||
          item.lastName
            ?.toLowerCase()
            .includes(vehicleHistoryfilters.lastName.toLowerCase())) &&
        (vehicleHistoryfilters.createdAt === '' ||
          item.createdAt
            ?.toLowerCase()
            .includes(vehicleHistoryfilters.createdAt.toLowerCase())) &&
        (vehicleHistoryfilters.type === '' ||
          item.type
            ?.toLowerCase()
            .includes(vehicleHistoryfilters.type.toLowerCase())) &&
        (vehicleHistoryfilters.description === '' ||
          item.description
            ?.toLowerCase()
            .includes(vehicleHistoryfilters.description.toLowerCase()))
      );
    });
  };

  const filterDriverHistoryData = () => {
    return logs.driverHistory?.filter((item) => {
      const fullName = `${item.driver?.user?.firstName || ''} ${
        item.driver?.user?.lastName || ''
      }`.toLowerCase();

      if (isMobile && searchTerm) {
        return fullName.includes(searchTerm.toLowerCase());
      }

      return (
        (driverHistoryfilters.firstName === '' ||
          item.driver?.user?.firstName
            ?.toLowerCase()
            .includes(driverHistoryfilters.firstName.toLowerCase())) &&
        (driverHistoryfilters.lastName === '' ||
          item.driver?.user?.lastName
            ?.toLowerCase()
            .includes(driverHistoryfilters.lastName.toLowerCase())) &&
        (driverHistoryfilters.startDate === '' ||
          item.startDate
            ?.toLowerCase()
            .includes(driverHistoryfilters.startDate.toLowerCase())) &&
        (driverHistoryfilters.endDate === '' ||
          item.endDate
            ?.toLowerCase()
            .includes(driverHistoryfilters.endDate.toLowerCase()))
      );
    });
  };

  const filterFuelHistoryData = () => {
    return logs.fuelHistory?.filter((item) => {
      return (
        (fuelHistoryfilters.date === '' ||
          item.date
            ?.toLowerCase()
            .includes(fuelHistoryfilters.date.toLowerCase())) &&
        (fuelHistoryfilters.latitude === '' ||
          item.latitude
            ?.toLowerCase()
            .toString()
            .includes(fuelHistoryfilters.latitude.toLowerCase())) &&
        (fuelHistoryfilters.longitude === '' ||
          item.longitude
            ?.toLowerCase()
            .toString()
            .includes(fuelHistoryfilters.longitude.toLowerCase())) &&
        (fuelHistoryfilters.amount === '' ||
          item.amount
            ?.toLowerCase()
            .includes(fuelHistoryfilters.amount.toLowerCase()))
      );
    });
  };

  const filterCommandHistoryData = () => {
    if (!logs.commandHistory) return [];

    return logs.commandHistory.filter((item) => {
      if (isMobile && searchTerm) {
        return (
          item.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return (
        (commandHistoryfilters.command === '' ||
          item.command
            .toLowerCase()
            .includes(commandHistoryfilters.command.toLowerCase())) &&
        (commandHistoryfilters.date === '' ||
          item.date
            .toLowerCase()
            .includes(commandHistoryfilters.date.toLowerCase())) &&
        (commandHistoryfilters.user === '' ||
          item.user
            .toLowerCase()
            .includes(commandHistoryfilters.user.toLowerCase())) &&
        (commandHistoryfilters.status === '' ||
          item.status
            .toLowerCase()
            .includes(commandHistoryfilters.status.toLowerCase())) &&
        (commandHistoryfilters.location === '' ||
          item.location
            .toLowerCase()
            .includes(commandHistoryfilters.location.toLowerCase()))
      );
    });
  };

  // Handle filter input changes
  const handleFilterVehicleHistoryChange = (e: any) => {
    const { name, value } = e.target;
    setVehicleHistoryFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Handle filter input changes
  const handleFilterDriverHistoryChange = (e: any) => {
    const { name, value } = e.target;
    setDriverHistoryFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };
  // Handle filter input changes
  const handleFilterFuelHistoryChange = (e: any) => {
    const { name, value } = e.target;
    setFuelHistoryFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Handle filter input changes for command history
  const handleFilterCommandHistoryChange = (e: any) => {
    const { name, value } = e.target;
    setCommandHistoryFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredVehicleHistoryData = filterVehicleHistoryData();
  const filteredDriverHistoryData = filterDriverHistoryData();
  const filteredFuelHistoryData = filterFuelHistoryData();
  const filteredCommandHistoryData = filterCommandHistoryData();

  const handleOpenModal = (data: any) => {
    setDriverData(data);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const toggleDriverDetails = (driverId: string) => {
    setExpandedDrivers((prev) => ({
      ...prev,
      [driverId]: !prev[driverId],
    }));
  };

  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSearchTerm(''); // Clear search when changing tabs
  };

  const toggleFilterDrawer = () => {
    setIsFilterDrawerOpen(!isFilterDrawerOpen);
  };

  const handleApplyFilter = () => {
    // Apply filters based on current tab
    if (tabValue === 0) {
      // Command tab
      // Apply command filters
    } else if (tabValue === 1) {
      // Fuel tab
      // Apply fuel filters
    } else if (tabValue === 2) {
      // Vehicle tab
      // Apply vehicle filters
    } else if (tabValue === 3) {
      // Driver tab
      // Apply driver filters
      if (startDate) {
        setDriverHistoryFilters((prev) => ({
          ...prev,
          startDate: startDate.toISOString().split('T')[0],
        }));
      }
      if (endDate) {
        setDriverHistoryFilters((prev) => ({
          ...prev,
          endDate: endDate.toISOString().split('T')[0],
        }));
      }
    }
    setIsFilterDrawerOpen(false);
  };

  function TabPanel(props: any) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`history-tabpanel-${index}`}
        aria-labelledby={`history-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box padding={isMobile ? '8px' : '16px'}>{children}</Box>
        )}
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ', ' +
      date.toLocaleDateString()
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Render filter content based on current tab
  const renderFilterContent = () => {
    switch (tabValue) {
      case 0: // Command tab
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Filter Commands
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Command"
                  name="command"
                  value={commandHistoryfilters.command}
                  onChange={handleFilterCommandHistoryChange}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="User"
                  name="user"
                  value={commandHistoryfilters.user}
                  onChange={handleFilterCommandHistoryChange}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={commandHistoryfilters.status}
                    onChange={handleFilterCommandHistoryChange}
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={commandHistoryfilters.location}
                  onChange={handleFilterCommandHistoryChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1: // Fuel tab
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Filter Fuel History
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date"
                  name="date"
                  value={fuelHistoryfilters.date}
                  onChange={handleFilterFuelHistoryChange}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  value={fuelHistoryfilters.amount}
                  onChange={handleFilterFuelHistoryChange}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Latitude"
                  name="latitude"
                  value={fuelHistoryfilters.latitude}
                  onChange={handleFilterFuelHistoryChange}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Longitude"
                  name="longitude"
                  value={fuelHistoryfilters.longitude}
                  onChange={handleFilterFuelHistoryChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2: // Vehicle tab
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Filter Vehicle History
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={vehicleHistoryfilters.firstName}
                  onChange={handleFilterVehicleHistoryChange}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={vehicleHistoryfilters.lastName}
                  onChange={handleFilterVehicleHistoryChange}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date"
                  name="createdAt"
                  value={vehicleHistoryfilters.createdAt}
                  onChange={handleFilterVehicleHistoryChange}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Type"
                  name="type"
                  value={vehicleHistoryfilters.type}
                  onChange={handleFilterVehicleHistoryChange}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={vehicleHistoryfilters.description}
                  onChange={handleFilterVehicleHistoryChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 3: // Driver tab
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Filter
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Driver Name"
                    name="firstName"
                    value={driverHistoryfilters.firstName}
                    onChange={handleFilterDriverHistoryChange}
                    variant="outlined"
                    size="small"
                    placeholder="Search Name"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Start Date
                  </Typography>
                  <DatePicker
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        placeholder: 'Select a date',
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Date"
                    name="date"
                    value={fuelHistoryfilters.date}
                    onChange={handleFilterFuelHistoryChange}
                    variant="outlined"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    End Date
                  </Typography>
                  <DatePicker
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        placeholder: 'Select a date',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </LocalizationProvider>
        );
      default:
        return null;
    }
  };

  return (
    <Box flex="1" borderRadius="8px" paddingTop={isMobile ? '0' : '16px'}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="history tabs"
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? 'fullWidth' : 'scrollable'}
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: isMobile ? '#1976d2' : '#1E293B',
              display: isMobile ? 'block' : undefined,
            },
            '& .MuiTab-root.Mui-selected': {
              color: isMobile ? '#1976d2' : 'black',
            },
            '& .MuiTab-root': {
              fontSize: isMobile ? '14px' : undefined,
              minWidth: isMobile ? 'auto' : undefined,
              padding: isMobile ? '12px 8px' : undefined,
            },
            '& .MuiTab-root:hover': {
              color: 'black',
            },
          }}
        >
          <Tab
            label="Command"
            id="history-tab-0"
            aria-controls="history-tabpanel-0"
          />
          <Tab
            label="Fuel"
            id="history-tab-1"
            aria-controls="history-tabpanel-1"
          />
          <Tab
            label="Vehicle"
            id="history-tab-2"
            aria-controls="history-tabpanel-2"
          />
          <Tab
            label="Driver"
            id="history-tab-3"
            aria-controls="history-tabpanel-3"
          />
        </Tabs>
      </Box>

      {/* Mobile Search Bar */}
      {isMobile && (
        <Box sx={{ p: 2, pb: 1, display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '8px',
                backgroundColor: '#f5f5f5',
                '& fieldset': { border: 'none' },
              },
            }}
          />
          <Button
            size="small"
            onClick={toggleFilterDrawer}
            sx={{
              ml: 1,
              textTransform: 'none',
              color: '#1E293B',
              borderRadius: '8px',
              minWidth: 'auto',
              padding: '6px',
              backgroundColor: '#f5f5f5',
            }}
          >
            <SlidersHorizontal size={20} />
          </Button>
        </Box>
      )}

      {/* Filter Bottom Sheet */}
      <SwipeableDrawer
        anchor="bottom"
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        onOpen={() => setIsFilterDrawerOpen(true)}
        disableSwipeToOpen
        PaperProps={{
          sx: {
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            maxHeight: '80vh',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid #eee',
          }}
        >
          <Typography variant="h6">Filter</Typography>
          <IconButton edge="end" onClick={() => setIsFilterDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        {renderFilterContent()}

        <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleApplyFilter}
            sx={{
              backgroundColor: '#0E1F47',
              color: 'white',
              borderRadius: '24px',
              textTransform: 'none',
              py: 1.5,
              '&:hover': {
                backgroundColor: '#0b1a3b',
              },
            }}
          >
            Apply Filter
          </Button>
        </Box>
      </SwipeableDrawer>

      <TabPanel value={tabValue} index={0}>
        {!isMobile ? (
          // Desktop view for Command History
          <>
            <Box marginBottom="20px">
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={3}>
                  <TextField
                    label="Filter by Command"
                    variant="outlined"
                    size="small"
                    name="command"
                    value={commandHistoryfilters.command}
                    onChange={handleFilterCommandHistoryChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Filter by Date"
                    variant="outlined"
                    size="small"
                    name="date"
                    value={commandHistoryfilters.date}
                    onChange={handleFilterCommandHistoryChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Filter by User"
                    variant="outlined"
                    size="small"
                    name="user"
                    value={commandHistoryfilters.user}
                    onChange={handleFilterCommandHistoryChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Filter by Status"
                    variant="outlined"
                    size="small"
                    name="status"
                    value={commandHistoryfilters.status}
                    onChange={handleFilterCommandHistoryChange}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>

            {filteredCommandHistoryData.length > 0 ? (
              <TableContainer>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {['Command', 'Date', 'User', 'Status', 'Location'].map(
                        (heading) => (
                          <TableCell key={heading}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {heading}
                            </Typography>
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCommandHistoryData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.command}</TableCell>
                        <TableCell>
                          {new Date(row.date).toLocaleString()}
                        </TableCell>
                        <TableCell>{row.user}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{row.location}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography
                variant="body2"
                color="textSecondary"
                textAlign="center"
              >
                No Command History
              </Typography>
            )}
          </>
        ) : (
          // Mobile view for Command History
          <Box>
            {filteredCommandHistoryData.length > 0 ? (
              <List sx={{ p: 0 }}>
                {filteredCommandHistoryData.map((item, index) => (
                  <Card
                    key={index}
                    sx={{
                      mb: 1.5,
                      borderRadius: '8px',
                      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                      overflow: 'visible',
                    }}
                  >
                    <Box sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 1,
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="500">
                          {item.command}
                        </Typography>
                        <Box
                          sx={{
                            backgroundColor:
                              item.status === 'Completed'
                                ? '#e6f7ed'
                                : '#fff8e6',
                            color:
                              item.status === 'Completed'
                                ? '#4caf50'
                                : '#ff9800',
                            borderRadius: '16px',
                            px: 1.5,
                            py: 0.5,
                            fontSize: '12px',
                            fontWeight: 'medium',
                          }}
                        >
                          {item.status}
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: 'text.secondary',
                          fontSize: '13px',
                          mb: 0.5,
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mr: 1 }}
                        >
                          {formatDate(item.date)}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mx: 0.5 }}
                        >
                          |
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.user}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: 'text.secondary',
                          fontSize: '13px',
                        }}
                      >
                        <LocationOnIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {item.location}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </List>
            ) : (
              <Typography
                variant="body2"
                color="textSecondary"
                textAlign="center"
                sx={{ py: 4 }}
              >
                No Command History
              </Typography>
            )}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {!isMobile ? (
          // Desktop view for Fuel History
          <>
            <Box marginBottom="20px" marginTop={2}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={3}>
                  <TextField
                    label="Filter by Date"
                    variant="outlined"
                    size="small"
                    name="date"
                    value={fuelHistoryfilters.date}
                    onChange={handleFilterFuelHistoryChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Filter by Latitude"
                    variant="outlined"
                    size="small"
                    name="latitude"
                    value={fuelHistoryfilters.latitude}
                    onChange={handleFilterFuelHistoryChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Filter by Longitude"
                    variant="outlined"
                    size="small"
                    name="longitude"
                    value={fuelHistoryfilters.longitude}
                    onChange={handleFilterFuelHistoryChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Filter by Amount"
                    variant="outlined"
                    size="small"
                    name="amount"
                    value={fuelHistoryfilters.amount}
                    onChange={handleFilterFuelHistoryChange}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>

            {logs.fuelHistory?.length > 0 ? (
              <TableContainer>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {['Date', 'Latitude', 'Longitude', 'Amount'].map(
                        (heading) => (
                          <TableCell key={heading}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {heading}
                            </Typography>
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredFuelHistoryData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(row.date).toLocaleString()}
                        </TableCell>
                        <TableCell>{row.latitude}</TableCell>
                        <TableCell>{row.longitude}</TableCell>
                        <TableCell>{row.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography
                variant="body2"
                color="textSecondary"
                textAlign="center"
              >
                No Fuel History
              </Typography>
            )}
          </>
        ) : (
          // Mobile view for Fuel History
          <Box>
            {logs.fuelHistory?.length > 0 ? (
              <List sx={{ p: 0 }}>
                {filteredFuelHistoryData.map((item, index) => (
                  <Card
                    key={index}
                    sx={{
                      mb: 1.5,
                      borderRadius: '8px',
                      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                      overflow: 'visible',
                    }}
                  >
                    <Box sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 1,
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="500">
                          Fuel Refill
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="500">
                          {item.amount}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: 'text.secondary',
                          fontSize: '13px',
                          mb: 0.5,
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(item.date)}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: 'text.secondary',
                          fontSize: '13px',
                        }}
                      >
                        <LocationOnIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {item.latitude}, {item.longitude}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </List>
            ) : (
              <Typography
                variant="body2"
                color="textSecondary"
                textAlign="center"
                sx={{ py: 4 }}
              >
                No Fuel History
              </Typography>
            )}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {!isMobile ? (
          // Desktop view for Vehicle History
          <Box>
            <Box marginBottom="20px" marginTop={2}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={2}>
                  <TextField
                    label="Filter by First Name"
                    variant="outlined"
                    size="small"
                    name="firstName"
                    value={vehicleHistoryfilters.firstName}
                    onChange={handleFilterVehicleHistoryChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    label="Filter by Last Name"
                    variant="outlined"
                    size="small"
                    name="lastName"
                    value={vehicleHistoryfilters.lastName}
                    onChange={handleFilterVehicleHistoryChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    label="Filter by Date"
                    variant="outlined"
                    size="small"
                    name="createdAt"
                    value={vehicleHistoryfilters.createdAt}
                    onChange={handleFilterVehicleHistoryChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    label="Filter by Type"
                    variant="outlined"
                    size="small"
                    name="type"
                    value={vehicleHistoryfilters.type}
                    onChange={handleFilterVehicleHistoryChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    label="Filter by Description"
                    variant="outlined"
                    size="small"
                    name="description"
                    value={vehicleHistoryfilters.description}
                    onChange={handleFilterVehicleHistoryChange}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>

            {logs.vehicleHistory?.length > 0 ? (
              <TableContainer>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {[
                        'First Name',
                        'Last Name',
                        'Date',
                        'Type',
                        'Description',
                      ].map((heading) => (
                        <TableCell key={heading}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {heading}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredVehicleHistoryData.map((history, index) => (
                      <TableRow key={index}>
                        <TableCell>{history.firstName}</TableCell>
                        <TableCell>{history.lastName}</TableCell>
                        <TableCell>
                          {new Date(history.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>{history.type}</TableCell>
                        <TableCell>{history.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography
                variant="body2"
                color="textSecondary"
                textAlign="center"
              >
                No Vehicle History
              </Typography>
            )}
          </Box>
        ) : (
          // Mobile view for Vehicle History
          <Box>
            {logs.vehicleHistory?.length > 0 ? (
              <List sx={{ p: 0 }}>
                {filteredVehicleHistoryData.map((item, index) => (
                  <Card
                    key={index}
                    sx={{
                      mb: 1.5,
                      borderRadius: '8px',
                      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                      overflow: 'visible',
                    }}
                  >
                    <Box sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 1,
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="500">
                          {item.type}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: 'text.secondary',
                          fontSize: '13px',
                          mb: 0.5,
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mr: 1 }}
                        >
                          {formatDate(item.createdAt)}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mx: 0.5 }}
                        >
                          |
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.firstName} {item.lastName}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </List>
            ) : (
              <Typography
                variant="body2"
                color="textSecondary"
                textAlign="center"
                sx={{ py: 4 }}
              >
                No Vehicle History
              </Typography>
            )}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {!isMobile ? (
          // Desktop view for Driver History
          <Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              marginBottom="16px"
            >
              <Typography variant="h6">Driver History</Typography>
            </Box>

            <Box marginBottom="20px">
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={3}>
                  <TextField
                    label="Filter by First Name"
                    variant="outlined"
                    size="small"
                    name="firstName"
                    value={driverHistoryfilters.firstName}
                    onChange={handleFilterDriverHistoryChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Filter by Last Name"
                    variant="outlined"
                    size="small"
                    name="lastName"
                    value={driverHistoryfilters.lastName}
                    onChange={handleFilterDriverHistoryChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Filter by Start Date"
                    variant="outlined"
                    size="small"
                    name="startDate"
                    value={driverHistoryfilters.startDate}
                    onChange={handleFilterDriverHistoryChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Filter by End Date"
                    variant="outlined"
                    size="small"
                    name="endDate"
                    value={driverHistoryfilters.endDate}
                    onChange={handleFilterDriverHistoryChange}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>

            {logs.driverHistory?.length > 0 ? (
              <TableContainer>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {[
                        'First Name',
                        'Last Name',
                        'Start Date',
                        'End Date',
                      ].map((heading) => (
                        <TableCell key={heading}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {heading}
                          </Typography>
                        </TableCell>
                      ))}
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDriverHistoryData.map((history, index) => (
                      <TableRow key={index}>
                        <TableCell>{history.driver?.user?.firstName}</TableCell>
                        <TableCell>{history.driver?.user.lastName}</TableCell>
                        <TableCell>
                          {new Date(history.startDate).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(history.endDate).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            onClick={() => handleOpenModal(history)}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography
                variant="body2"
                color="textSecondary"
                textAlign="center"
              >
                No Driver History
              </Typography>
            )}
          </Box>
        ) : (
          // Mobile view for Driver History
          <Box>
            {logs.driverHistory?.length > 0 ? (
              <List sx={{ p: 0 }}>
                {filteredDriverHistoryData.map((item, index) => {
                  const driverId = `driver-${index}`;
                  const isExpanded = expandedDrivers[driverId] || false;

                  // Mock data for odometer readings
                  const odometerStart =
                    item.assignmentMetadata?.[0]?.odoMeterStartReading || 'N/A';
                  const odometerEnd =
                    item.assignmentMetadata?.[0]?.odoMeterEndReading || 'N/A';
                  const totalMinutes =
                    item.assignmentMetadata?.[0]?.totalMinutes ||
                    Math.round(
                      (new Date(item.endDate).getTime() -
                        new Date(item.startDate).getTime()) /
                        (1000 * 60)
                    );
                  const totalKm =
                    item.assignmentMetadata?.[0]?.totalKm || 'N/A';

                  return (
                    <Card
                      key={index}
                      sx={{
                        mb: 1.5,
                        borderRadius: '8px',
                        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                        overflow: 'visible',
                      }}
                    >
                      <Box sx={{ p: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 1,
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="500">
                            {item.driver?.user?.firstName}{' '}
                            {item.driver?.user?.lastName}
                          </Typography>
                          <Box
                            sx={{
                              backgroundColor: '#e6f7ed',
                              color: '#4caf50',
                              borderRadius: '16px',
                              px: 1.5,
                              py: 0.5,
                              fontSize: '12px',
                              fontWeight: 'medium',
                            }}
                          >
                            Completed
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            color: 'text.secondary',
                            fontSize: '13px',
                            mb: 0.5,
                          }}
                        >
                          <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(item.startDate)} |{' '}
                            {formatDuration(
                              (new Date(item.endDate).getTime() -
                                new Date(item.startDate).getTime()) /
                                (1000 * 60)
                            )}
                          </Typography>
                        </Box>

                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ mt: 2, mb: 1 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Odometer start:
                                </Typography>
                                <Typography variant="body2">
                                  {odometerStart}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Odometer end:
                                </Typography>
                                <Typography variant="body2">
                                  {odometerEnd}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Total minutes:
                                </Typography>
                                <Typography variant="body2">
                                  {totalMinutes}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Total km:
                                </Typography>
                                <Typography variant="body2">
                                  {totalKm}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        </Collapse>

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            mt: 1,
                          }}
                        >
                          <Button
                            size="small"
                            onClick={() => toggleDriverDetails(driverId)}
                            sx={{
                              textTransform: 'none',
                              color: '#1976d2',
                              p: 0,
                              minWidth: 'auto',
                              fontWeight: 'normal',
                              fontSize: '13px',
                            }}
                            endIcon={
                              <ExpandMoreIcon
                                sx={{
                                  transform: isExpanded
                                    ? 'rotate(180deg)'
                                    : 'rotate(0deg)',
                                  transition: 'transform 0.2s',
                                }}
                              />
                            }
                          >
                            {isExpanded ? 'Less Details' : 'More Details'}
                          </Button>
                        </Box>
                      </Box>
                    </Card>
                  );
                })}
              </List>
            ) : (
              <Typography
                variant="body2"
                color="textSecondary"
                textAlign="center"
                sx={{ py: 4 }}
              >
                No Driver History
              </Typography>
            )}
          </Box>
        )}

        <Modal
          open={open}
          onClose={handleCloseModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: isMobile ? '90%' : '80%',
              maxHeight: '90vh',
              bgcolor: 'white',
              borderRadius: '8px',
              boxShadow: 24,
              overflowY: 'auto',
              p: isMobile ? 3 : 4,
            }}
          >
            {/* Title */}
            <Typography
              variant="h6"
              sx={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: 3,
                color: '#333',
              }}
            >
              Details
            </Typography>

            <Divider sx={{ marginBottom: '16px' }} />

            {/* Information Section */}
            <Box sx={{ marginBottom: '24px' }}>
              {/* Adding the additional details here */}
              <Typography
                variant="body1"
                sx={{ fontWeight: '500', marginBottom: '8px' }}
              >
                <strong>First Name:</strong>{' '}
                {driverData.driver?.user?.firstName}
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: '500', marginBottom: '8px' }}
              >
                <strong>Last Name:</strong> {driverData.driver?.user?.lastName}
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: '500', marginBottom: '8px' }}
              >
                <strong>Start Date:</strong>{' '}
                {new Date(driverData.startDate).toLocaleString()}
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: '500', marginBottom: '16px' }}
              >
                <strong>End Date:</strong>{' '}
                {new Date(driverData.endDate).toLocaleString()}
              </Typography>
            </Box>

            <Divider sx={{ marginBottom: '16px' }} />

            {/* Information Section */}
            <Box>
              <TableContainer>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {[
                        'Driver Start Date',
                        'Driver End Date',
                        'Odometer Start Reading',
                        'Odometer End Reading',
                        'Total Minutes',
                        'Total KM',
                      ].map((heading) => (
                        <TableCell key={heading}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {heading}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {driverData?.assignmentMetadata?.map((assignment: any) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          {new Date(
                            assignment.driverStartDate
                          ).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(assignment.driverEndDate).toLocaleString()}
                        </TableCell>
                        <TableCell>{assignment.odoMeterStartReading}</TableCell>
                        <TableCell>{assignment.odoMeterEndReading}</TableCell>
                        <TableCell>{assignment.totalMinutes}</TableCell>
                        <TableCell>{assignment.totalKm}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Footer */}
            <Divider sx={{ margin: '16px 0' }} />
            <Box textAlign="right">
              <Button
                variant="outlined"
                sx={{ textTransform: 'none' }}
                onClick={handleCloseModal}
              >
                Close
              </Button>
            </Box>
          </Box>
        </Modal>
      </TabPanel>
    </Box>
  );
};
