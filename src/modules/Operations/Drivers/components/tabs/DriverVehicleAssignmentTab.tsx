import React, { useState, useEffect } from 'react';
import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  InputLabel,
  Button,
  Grid,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Avatar,
  CircularProgress,
} from '@mui/material';
import defaultImg from '/src/assets/admin/default-avatar-150x150.jpg';
import { SectionHeading } from '../../utils/SectionHeading';
// Comment out unused import for demo mode
// import axiosInstance from '../../../../../utils/axiosConfig';
import { toast } from 'react-toastify';
import { IDriverVehicleAssignmentTabProps, IVehicleAssignment, IVehicle, IFilterOptions } from '../../interfaces/driver.interface';
import { formatDate } from '../../utils/FormatDate';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { fetchDriverAvailableVehicles, fetchDriverVehicleHistory, fetchFilterOptions, createDriverVehicleAssignment } from "../../apis/apis"; // Import API function
import car_model from '/src/assets/car_models/car_model_1_big.png';

export const DriverVehicleAssignment: React.FC<IDriverVehicleAssignmentTabProps> = ({
  id,
}) => {
  const [loading, setLoading] = useState(false);
  const [availableVehicle, setAvailableVehicle] = useState<IVehicle[]>([]);
  const [pendingVehicle, setPendingVehicle] = useState<IVehicleAssignment[]>([]);
  const [currentVehicle, setCurrentVehicle] = useState<IVehicleAssignment[]>([]);
  const [completedVehicle, setCompletedVehicle] = useState<IVehicleAssignment[]>([]);
  const [editableFormState, setEditableFormState] = useState({
    driverId: Number(id),
    vehicleId: '',
    startDate: '',
    endDate: '',
  });
  const [filter, setFilter] = useState('');
  const [filterOptions, setFilterOptions] = useState<IFilterOptions | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<any>({
    model: [],
    make: [],
    trim: [],
    status: [],
    garage: [],
  });

  useEffect(() => {
    loadDriverAvailableVehicles();
    loadDriverVehicleHistory();
    loadFilterOptions();
  }, []);

  const loadDriverAvailableVehicles = async () => {
    try {
      const data = await fetchDriverAvailableVehicles();
      setAvailableVehicle(data?.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const loadDriverVehicleHistory = async () => {
    try {
      const data = await fetchDriverVehicleHistory(id);
      //console.log("loadDriverVehicleHistory data",data);
      setPendingVehicle(data?.assignments?.pending || []);
      setCurrentVehicle(data?.assignments?.current || []);
      setCompletedVehicle(data?.assignments?.completed || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const data = await fetchFilterOptions();
      //console.log("loadFilterOptions data",data);
      setFilterOptions(data || null);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleFieldChange = (e: any) => {
    const { name, value } = e.target;
    setEditableFormState({ ...editableFormState, [name]: value });
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleFilterSelection = (category: string, value: string) => {
    setSelectedFilters((prevFilters: any) => {
      const updatedCategory = prevFilters[category].includes(value)
        ? prevFilters[category].filter((item: string) => item !== value)
        : [...prevFilters[category], value];
      return { ...prevFilters, [category]: updatedCategory };
    });
  };
  
  const filterVehicles = (assignment: IVehicleAssignment) => {
    let matches = true;

    // Make filter
    if (
      selectedFilters.make.length > 0 &&
      !selectedFilters.make.includes(assignment.vehicle?.make)
    ) {
      matches = false;
    }

    // Model filter
    if (
      selectedFilters.model.length > 0 &&
      !selectedFilters.model.includes(assignment.vehicle?.model)
    ) {
      matches = false;
    }

    // Trim filter
    if (
      selectedFilters.trim.length > 0 &&
      assignment.vehicle?.trim &&
      !selectedFilters.trim.includes(assignment.vehicle?.trim)
    ) {
      matches = false;
    }

    // Status filter
    if (
      selectedFilters.status.length > 0 &&
      !selectedFilters.status.includes(assignment.vehicle?.status)
    ) {
      matches = false;
    }

    // Garage filter
    if (
      selectedFilters.garage.length > 0 &&
      (!assignment.vehicle?.garage || !selectedFilters.garage.includes(assignment.vehicle?.garage.name))
    ) {
      matches = false;
    }

    // Year filter
    if (selectedFilters.minYear || selectedFilters.maxYear) {
      const minYear = selectedFilters.minYear
        ? parseInt(selectedFilters.minYear, 10)
        : null;
      const maxYear = selectedFilters.maxYear
        ? parseInt(selectedFilters.maxYear, 10)
        : null;

      if (
        (minYear && assignment.vehicle?.year && assignment.vehicle?.year < minYear) ||
        (maxYear && assignment.vehicle?.year && assignment.vehicle?.year > maxYear)
      ) {
        matches = false;
      }
    }

    return matches;
  };

  const filteredCompletedVehicle = (completedVehicle || [])
    .filter(
      (assignment) =>
        assignment.vehicle?.plateNumber.toLowerCase().includes(filter.toLowerCase()) ||
        (assignment.vehicle?.vin &&
          assignment.vehicle?.vin.toLowerCase().includes(filter.toLowerCase()))
    )
    .filter(filterVehicles);

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const response = await createDriverVehicleAssignment(editableFormState);
      if (response.status === 200 || response.status === 201) {
        loadDriverAvailableVehicles();
        loadDriverVehicleHistory();
        toast.success('Changes saved successfully');
      }
    } catch (error) {
      toast.error('Error saving changes');
      console.error('Error saving changes:', error);
    }
    setLoading(false);
  };

  return (
    <Box p={2}>
      <Grid container spacing={4}>
        {/* First Half: Driver Details Form */}
        <Grid item xs={12} sm={12} md={12}>
          <Box
            component="form"
            noValidate
            autoComplete="off"
            p={3}
            className="bg-slate-50 rounded-lg shadow-sm"
          >
            <Grid container spacing={2}>
              {/* Vehicle Section */}
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="vehicleId-label">Vehicle</InputLabel>
                  <Select
                      labelId="vehicleId-label"
                      name="vehicleId"
                      value={editableFormState.vehicleId}
                      onChange={handleFieldChange}
                      label="Vehicle"
                  >
                      {availableVehicle.map((vehicle) => (
                        <MenuItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.color} | Plate:{vehicle.plateNumber}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Date"
                  name="startDate"
                  type="datetime-local"
                  required
                  value={editableFormState.startDate}
                  onChange={handleFieldChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End Date"
                  name="endDate"
                  type="datetime-local"
                  required
                  value={editableFormState.endDate}
                  onChange={handleFieldChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
              </Grid>

              {/* Save and Cancel buttons */}
              <Grid
                item
                xs={12}
                sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveChanges}
                  sx={{
                    mr: 2,
                    fontWeight: 'bold',
                    backgroundColor: '#1E293B',
                    '&:hover': { backgroundColor: '#111827' },
                  }}
                  disabled={loading} // Disable button while loading
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Assign'
                  )}
                </Button>
              </Grid>

              {/* Current Vehicle */}
              <Grid
                item xs={12}
                sx={{ marginBottom: 5 }}
              >
                <TableContainer component={Paper} elevation={3}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
                      <TableRow>
                        <TableCell>Vehicle Detail</TableCell>
                        <TableCell>Asset Type</TableCell>
                        <TableCell>VIN</TableCell>
                        <TableCell>Chasis No.</TableCell>
                        {/*<TableCell>Odometer</TableCell>*/}
                        <TableCell>Garage</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentVehicle?.map((assignment: IVehicleAssignment) => (
                        <TableRow
                          key={assignment.vehicle?.id}
                          hover
                          //onClick={() => handleRowClick(vehicle.id)}
                          sx={{ cursor: 'pointer' }}
                        >
                                <TableCell sx={{ position: "relative", minWidth: "200px" }}>
                            <Box
                              sx={{
                                backgroundImage: "url('/path-to-car-icon.png')", // Use your car icon or SVG
                                backgroundRepeat: "no-repeat",
                                backgroundSize: "contain",
                                backgroundPosition: "right bottom",
                                position: "absolute",
                                inset: 0,
                                opacity: 0.1,
                              }}
                            />
                            <Grid container spacing={2}>
                              <Grid item xs={4}>
                                <Avatar src={assignment.vehicle?.coverImage || car_model } sx={{ width: 48, height: 48 }} />
                              </Grid>
                              <Grid item xs={8}>
                                <Typography variant="body1">
                                  {assignment.vehicle?.make} {assignment.vehicle?.model} {assignment.vehicle?.year}
                                </Typography>
                                <Typography variant="body2" color="#0a122499">
                                  {assignment.vehicle?.color}
                                </Typography>
                                <Typography variant="body2">{assignment.vehicle?.plateNumber}</Typography>
                              </Grid>
                            </Grid>
                          </TableCell>
                          <TableCell className="capitalize">
                            {assignment.vehicle?.category
                              ? assignment.vehicle?.category
                              : assignment.vehicle?.otherCategory}
                          </TableCell>
                          <TableCell className="uppercase">{assignment.vehicle?.vin}</TableCell>
                          <TableCell className="uppercase">
                            {assignment.vehicle?.chasisNo}
                          </TableCell>
                          {/*<TableCell>{assignment.vehicle?.odometer}</TableCell>*/}
                          <TableCell>{assignment.vehicle?.garage?.name}</TableCell>
                          <TableCell>{assignment.vehicle?.status}</TableCell>
                          <TableCell>{new Date(assignment.startDate).toLocaleString()}</TableCell>
                          <TableCell>{new Date(assignment.endDate).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              </Grid>

              {/* Pending Vehicle */}
              <Grid
                item xs={12}
                sx={{ marginBottom: 5 }}
              >
                <Typography fontWeight="bold" sx={{ marginBottom: "10px" }}>
                  Pending Vehicle(s)
                </Typography>
                <TableContainer component={Paper} elevation={3}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
                      <TableRow>
                        <TableCell>Vehicle Detail</TableCell>
                        <TableCell>Asset Type</TableCell>
                        <TableCell>VIN</TableCell>
                        <TableCell>Chasis No.</TableCell>
                        {/*<TableCell>Odometer</TableCell>*/}
                        <TableCell>Garage</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingVehicle?.map((assignment: IVehicleAssignment) => (
                        <TableRow
                          key={assignment.vehicle?.id}
                          hover
                          //onClick={() => handleRowClick(vehicle.id)}
                          sx={{ cursor: 'pointer' }}
                        >
                                <TableCell sx={{ position: "relative", minWidth: "200px" }}>
                            <Box
                              sx={{
                                backgroundImage: "url('/path-to-car-icon.png')", // Use your car icon or SVG
                                backgroundRepeat: "no-repeat",
                                backgroundSize: "contain",
                                backgroundPosition: "right bottom",
                                position: "absolute",
                                inset: 0,
                                opacity: 0.1,
                              }}
                            />
                            <Grid container spacing={2}>
                              <Grid item xs={4}>
                                <Avatar src={assignment.vehicle?.coverImage || car_model } sx={{ width: 48, height: 48 }} />
                              </Grid>
                              <Grid item xs={8}>
                                <Typography variant="body1">
                                  {assignment.vehicle?.make} {assignment.vehicle?.model} {assignment.vehicle?.year}
                                </Typography>
                                <Typography variant="body2" color="#0a122499">
                                  {assignment.vehicle?.color}
                                </Typography>
                                <Typography variant="body2">{assignment.vehicle?.plateNumber}</Typography>
                              </Grid>
                            </Grid>
                          </TableCell>
                          <TableCell className="capitalize">
                            {assignment.vehicle?.category
                              ? assignment.vehicle?.category
                              : assignment.vehicle?.otherCategory}
                          </TableCell>
                          <TableCell className="uppercase">{assignment.vehicle?.vin}</TableCell>
                          <TableCell className="uppercase">
                            {assignment.vehicle?.chasisNo}
                          </TableCell>
                          {/*<TableCell>{assignment.vehicle?.odometer}</TableCell>*/}
                          <TableCell>{assignment.vehicle?.garage?.name}</TableCell>
                          <TableCell>{assignment.vehicle?.status}</TableCell>
                          <TableCell>{new Date(assignment.startDate).toLocaleString()}</TableCell>
                          <TableCell>{new Date(assignment.endDate).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            
            {/* Completed Vehicle(s) */}
            <Grid item xs={12}>
              <Typography fontWeight="bold" sx={{ marginBottom: "10px" }}>
                Completed Vehicle(s)
              </Typography>
              {/* Vehicle Model Filter */}
              {filterOptions && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px', // Adjust the gap between items
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Status Filter */}
                  <FormControl component="fieldset" sx={{ flex: '1 1 250px' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Status
                    </Typography>
                    <FormGroup
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                      }}
                    >
                      {filterOptions.statuses.map((status) => (
                        <FormControlLabel
                          key={status}
                          control={
                            <Checkbox
                              checked={selectedFilters.status.includes(status)}
                              onChange={() => handleFilterSelection('status', status)}
                            />
                          }
                          label={status}
                          sx={{ marginRight: '10px' }}
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
      
                  {/* Garages Filter */}
                  <FormControl component="fieldset" sx={{ flex: '1 1 250px' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Garages
                    </Typography>
                    <FormGroup
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                      }}
                    >
                      {filterOptions.garages.map((garage) => (
                        <FormControlLabel
                          key={garage}
                          control={
                            <Checkbox
                              checked={selectedFilters.garage.includes(garage)}
                              onChange={() => handleFilterSelection('garage', garage)}
                            />
                          }
                          label={garage}
                          sx={{ marginRight: '10px' }}
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
                </div>
              )}
              <TableContainer component={Paper} elevation={3}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
                    <TableRow>
                      <TableCell>Vehicle Detail</TableCell>
                      <TableCell>Asset Type</TableCell>
                      <TableCell>VIN</TableCell>
                      <TableCell>Chasis No.</TableCell>
                      {/*<TableCell>Odometer</TableCell>*/}
                      <TableCell>Garage</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCompletedVehicle?.map((assignment: IVehicleAssignment) => (
                      <TableRow
                        key={assignment.vehicle?.id}
                        hover
                        //onClick={() => handleRowClick(vehicle.id)}
                        sx={{ cursor: 'pointer' }}
                      >
                              <TableCell sx={{ position: "relative", minWidth: "200px" }}>
                          <Box
                            sx={{
                              backgroundImage: "url('/path-to-car-icon.png')", // Use your car icon or SVG
                              backgroundRepeat: "no-repeat",
                              backgroundSize: "contain",
                              backgroundPosition: "right bottom",
                              position: "absolute",
                              inset: 0,
                              opacity: 0.1,
                            }}
                          />
                          <Grid container spacing={2}>
                            <Grid item xs={4}>
                              <Avatar src={assignment.vehicle?.coverImage || car_model } sx={{ width: 48, height: 48 }} />
                            </Grid>
                            <Grid item xs={8}>
                              <Typography variant="body1">
                                {assignment.vehicle?.make} {assignment.vehicle?.model} {assignment.vehicle?.year}
                              </Typography>
                              <Typography variant="body2" color="#0a122499">
                                {assignment.vehicle?.color}
                              </Typography>
                              <Typography variant="body2">{assignment.vehicle?.plateNumber}</Typography>
                            </Grid>
                          </Grid>
                        </TableCell>
                        <TableCell className="capitalize">
                          {assignment.vehicle?.category
                            ? assignment.vehicle?.category
                            : assignment.vehicle?.otherCategory}
                        </TableCell>
                        <TableCell className="uppercase">{assignment.vehicle?.vin}</TableCell>
                        <TableCell className="uppercase">
                          {assignment.vehicle?.chasisNo}
                        </TableCell>
                        {/*<TableCell>{vehicle?.odometer}</TableCell>*/}
                        <TableCell>{assignment.vehicle?.garage?.name}</TableCell>
                        <TableCell>{assignment.vehicle?.status}</TableCell>
                        <TableCell>{new Date(assignment.startDate).toLocaleString()}</TableCell>
                        <TableCell>{new Date(assignment.endDate).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
