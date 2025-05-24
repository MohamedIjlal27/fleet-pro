import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  IconButton,
  InputLabel,
  InputAdornment,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
// import axiosInstance from '../../../../utils/axiosConfig'; // Commented out for demo mode
import { IVehicleData } from '../../interfaces/interfaces';
import { IDriver } from '../../../Operations/Drivers/interfaces/driver.interface';
import { RootState } from '../../../../redux/app/store';
import { useSelector } from 'react-redux';
import { fetchVehicleFilters } from '../../apis/apis';

interface AddVehicleModalProps {
  open: boolean;
  onClose: () => void;
  vehicleData?: IVehicleData;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  open,
  onClose,
  vehicleData,
}) => {
  const organization_id = useSelector((state: RootState) => state.user.organizationId);
  const [idType, setIdType] = useState<string>('VIN');
  const [idPlaceholder, setIdPlaceholder] =
    useState<string>('Enter VIN Number');
  const [vinOrChassis, setVinOrChassis] = useState(vehicleData?.vin || '');
  const [plateNumber, setPlateNumber] = useState(
    vehicleData?.plateNumber || ''
  );
  const [vehicleMake, setVehicleMake] = useState(vehicleData?.make || '');
  const [vehicleModel, setVehicleModel] = useState(vehicleData?.model || '');
  const [vehicleTrim, setVehicleTrim] = useState(vehicleData?.trim || '');
  const [year, setYear] = useState(vehicleData?.year || '');
  const [color, setColor] = useState(vehicleData?.color || '');
  const [odometer, setOdometer] = useState(vehicleData?.odometer || '');
  const [fuelType, setFuelType] = useState(vehicleData?.fuelType || '');
  const [doors, setDoors] = useState(vehicleData?.doors || '');
  const [vehicleBodyType, setVehicleBodyType] = useState(
    vehicleData?.bodyClass || ''
  );
  const [drivenWheel, setDrivenWheel] = useState(vehicleData?.driveType || '');
  const [status, setStatus] = useState(vehicleData?.status || '');
  const [transmissionType, setTransmissionType] = useState(
    vehicleData?.transmissionType || 'Automatic'
  );
  const [category, setCategory] = useState(vehicleData?.category || 'Sedan');
  const [otherCategory, setOtherCategory] = useState('');

  const [garages, setGarages] = useState<{ id: number; name: string }[]>([]);
  const [parking, setParking] = useState(vehicleData?.parking || '');

  const [drivers, setDrivers] = useState<IDriver[]>([]);
  const [driver, setDriver] = useState<number | null>(
    vehicleData?.driver ?? null
  );

  const [fuelTypeOptions, setFuelTypeOptions] = useState<Record<string, string>>({});
  const [transmissionTypeOptions, setTransmissionTypeOptions] = useState<Record<string, string>>({});
  const [statusOptions, setStatusOptions] = useState<Record<string, string>>({});
  const [categoryOptions, setCategoryOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      fetchGarages();
      loadOptions()
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      resetFormFields();
    }
  }, [open]);

  const fetchGarages = async () => {
    try {
      console.log('[DEMO MODE] fetchGarages - returning demo data');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Demo garages data
      const garagesData = [
        { id: 1, name: 'Main Depot' },
        { id: 2, name: 'North Branch' }
      ];
      setGarages(garagesData);
    } catch (error: any) {
      toast.error('Error fetching garages: ' + error.message);
    }
  };

  const loadOptions = async () => {
    try {
      const response = await fetchVehicleFilters();

      // Use demo data for missing properties
      setFuelTypeOptions({
        'Gasoline': 'Gasoline',
        'Diesel': 'Diesel',
        'Electric': 'Electric',
        'Hybrid': 'Hybrid'
      });
      setTransmissionTypeOptions({
        'Automatic': 'Automatic',
        'Manual': 'Manual',
        'CVT': 'CVT'
      });
      setStatusOptions(response?.status || {
        'Available': 'Available',
        'InUse': 'In Use',
        'Maintenance': 'Maintenance'
      });
      setCategoryOptions({
        'Sedan': 'Sedan',
        'SUV': 'SUV',
        'Truck': 'Truck',
        'Van': 'Van'
      });

    } catch (error: any) {
      toast.error('Error fetching filters: ' + error.message);
    }
  };

  useEffect(() => {
    if (open && vehicleData) {
      console.log('veciekd data', vehicleData);
      setVinOrChassis(vehicleData.vin || '');
      setPlateNumber(vehicleData.plateNumber || '');
      setVehicleMake(vehicleData.make || '');
      setVehicleModel(vehicleData.model || '');
      setVehicleTrim(vehicleData.trim || '');
      setYear(vehicleData.year || '');
      setColor(vehicleData.color || '');
      setOdometer(vehicleData.odometer || '');
      setFuelType(vehicleData.fuelType || '');
      setDoors(vehicleData.doors || '');
      setVehicleBodyType(vehicleData.bodyClass || '');
      setDrivenWheel(vehicleData.driveType || '');
      setParking(vehicleData.garageId ? vehicleData.garageId.toString() : '');
      setStatus(vehicleData.status || '');
      setTransmissionType(
        vehicleData.transmissionType?.toLowerCase() || 'Automatic'
      );
      setCategory(vehicleData.category?.toLowerCase() || 'Sedan');
      setOtherCategory(vehicleData.otherCategory || '');
      setDriver(vehicleData.driverId || null);
    } else {
      resetFormFields();
    }
  }, [open, vehicleData]);

  const handleIdTypeChange = (event: SelectChangeEvent) => {
    const selectedIdType = event.target.value;
    setIdType(selectedIdType);
    setIdPlaceholder(
      selectedIdType === 'VIN' ? 'Enter VIN Number' : 'Enter Chassis Number'
    );
  };

  // Fetch vehicle details from carapi.app
  const fetchVehicleDetails = async (vin: string) => {
    try {
      console.log(`[DEMO MODE] fetchVehicleDetails for VIN: ${vin}`);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo vehicle data based on VIN
      const vehicleData = {
        make: 'Ford',
        model: 'Transit',
        trim: 'Base',
        year: '2020',
        specs: {
          color: 'White',
          fuel_type_primary: 'Gasoline',
          doors: '4',
          body_class: 'Van',
          drive_type: 'FWD',
          transmission_style: 'Automatic',
          vehicle_type: 'Van'
        }
      };
      console.log("[DEMO MODE] fetchVehicleDetails", vehicleData);

      // Populate form fields with the fetched vehicle data
      setVehicleMake(vehicleData.make || '');
      setVehicleModel(vehicleData.model || '');
      setVehicleTrim(vehicleData.trim || '');
      setYear(vehicleData.year || '');
      setColor(vehicleData.specs.color || '');
      setFuelType(vehicleData.specs.fuel_type_primary || '');
      setDoors(vehicleData.specs.doors || '');
      setVehicleBodyType(vehicleData.specs.body_class || '');
      setDrivenWheel(vehicleData.specs.drive_type || '');
      setTransmissionType(vehicleData.specs.transmission_style || '');
      setCategory(vehicleData.specs.vehicle_type || '');
      toast.success('Fetch Successful based on VIN (Demo Mode)');
    } catch (error: any) {
      toast.error(error.message);
      console.error('Error fetching vehicle details:', error);
    }
  };

  // Handle changes in VIN field and trigger API call when length is 17 characters
  //const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const handleVinCheck = (e: React.MouseEvent<HTMLButtonElement>) => {
    //const vin = e.target.value;
    //setVinOrChassis(vin);
    const vin = vinOrChassis;

    // Trigger the API call only when the VIN is exactly 17 characters
    if (idType === 'VIN' && vin.length === 17) {
      fetchVehicleDetails(vin);
    } else {
      // Reset form fields if VIN is not complete
      setVehicleMake('');
      setVehicleModel('');
      setVehicleTrim('');
      setYear('');
      setColor('');
      setFuelType('');
      setVehicleBodyType('');
      setDrivenWheel('');
      setTransmissionType('');
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    const selectedCategory = event.target.value;
    setCategory(selectedCategory);

    if (selectedCategory !== 'Others') {
      setOtherCategory('');
    }
  };

  //resets after form saved
  const resetFormFields = () => {
    setIdType('VIN');
    setVinOrChassis('');
    setPlateNumber('');
    setVehicleMake('');
    setVehicleModel('');
    setVehicleTrim('');
    setYear('');
    setColor('');
    setOdometer('');
    setFuelType('');
    setDoors('');
    setVehicleBodyType('');
    setDrivenWheel('');
    setParking('');
    setStatus('');
    setTransmissionType('Automatic');
    setCategory('Sedan');
    setOtherCategory('');
    setDriver(null);
  };

  const handleSave = async () => {
    const selectedGarage = garages.find((g) => g.id === Number(parking));
    const data = {
      make: vehicleMake.toLowerCase(),
      model: vehicleModel.toLowerCase(),
      trim: vehicleTrim.toLowerCase(),
      vin: idType === 'VIN' ? vinOrChassis.toLowerCase() : null,
      chasisNo: idType === 'Chassis' ? vinOrChassis.toLowerCase() : null,
      plateNumber: plateNumber.toLowerCase(),
      year: Number(year),
      bodyClass: vehicleBodyType.toLowerCase(),
      driveType: drivenWheel.toLowerCase(),
      fuelType: fuelType.toLowerCase(),
      color: color.toLowerCase(),
      doors: Number(doors),
      odometer: Number(odometer),
      transmissionType: transmissionType.toLowerCase(),
      metadata: {},
      status: status,
      serviceType: 'Some Service',
      garageId: selectedGarage ? selectedGarage.id : null,
      //organizationId: organization_id ? parseInt(organization_id.toString(), 10) : 0,
      driverId: driver || null,
      category:
        category === 'Others'
          ? otherCategory.toLowerCase()
          : category.toLowerCase(),
    };

    console.log("update vehicle data =", data);
    // APIs, PUT and POST, if vehicle id is present it is PUT else POST
    try {
      console.log('[DEMO MODE] Saving vehicle data:', data);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (vehicleData?.id) {
        console.log(`[DEMO MODE] Updating vehicle ${vehicleData.id}`);
      } else {
        console.log('[DEMO MODE] Creating new vehicle');
      }
      
      toast.success('successfully saved the vehicle (Demo Mode)');
      resetFormFields();
      onClose();
    } catch (error: any) {
      toast.error('Failed to save vehicle in demo mode');
      console.error('Error saving vehicle:', error);
    }
  };

  //Each text field will acquire this style
  const renderTextField = (
    label: string,
    value: string | number,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    type: string = 'text',
    placeholder = '',
    required: boolean = false,
    endAdornment: React.ReactNode = null,
  ) => (
    <TextField
      fullWidth
      label={label}
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={onChange}
      variant="outlined"
      required={required}
      InputProps={{
        endAdornment: endAdornment, // Apply the passed endAdornment here
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
        },
        '& .MuiInputLabel-root': { color: 'var(--THEME_COLOR)' },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
        {
          borderColor: 'var(--THEME_COLOR)',
        },
      }}
    />
  );

  //Each select field will acquire this style
  const renderSelectField = (
    label: string,
    value: string,
    onChange: (e: SelectChangeEvent) => void,
    options: any[] | Record<string, string>,
    optionLabel?: (option: any) => string,
    optionValue?: (option: any) => string | number,
    required: boolean = false
  ) => {
    const renderOptions = () => {
      if (Array.isArray(options)) {
        // Handle the case where options is an array
        return options.map((option, index) => (
          <MenuItem
            key={optionValue ? optionValue(option) : index}
            value={optionValue ? optionValue(option) : option}
          >
            {optionLabel ? optionLabel(option) : option}
          </MenuItem>
        ));
      } else if (typeof options === 'object' && options !== null) {
        // Handle the case where options is an object (Record<string, string>)
        return Object.entries(options).map(([key, value]) => (
          <MenuItem key={key} value={key}>
            {optionLabel ? optionLabel(value) : value}
          </MenuItem>
        ));
      }
      return null;
    };

    return (
      <FormControl
        fullWidth
        variant="outlined"
        required={required}
        sx={{
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
          borderRadius: 2,
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--THEME_COLOR)',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'var(--THEME_COLOR)',
            '&.Mui-focused': {
              color: 'var(--THEME_COLOR)',
            },
          },
        }}
      >
        < InputLabel id={`${label}-label`}>{label}</InputLabel >
        <Select
          labelId={`${label}-label`}
          label={label}
          value={value}
          onChange={onChange}
        >
          {renderOptions()}
        </Select>
      </FormControl>
    )
  };

  const renderButton = (
    label: string,
    onClick: () => void,
    isPrimary = false
  ) => (
    <Button
      onClick={onClick}
      variant="contained"
      sx={{
        bgcolor: isPrimary ? 'gray' : 'gray',
        '&:hover': {
          bgcolor: isPrimary ? 'lightGray' : 'lightGray',
        },
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      {label}
    </Button>
  );

  return (
    <Dialog
      key={vehicleData ? vehicleData.id : 'new-vehicle'}
      open={open}
      onClose={onClose}
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          padding: 2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'var(--THEME_COLOR)',
          color: 'gray',
          fontWeight: 'bold',
        }}
      >
        {vehicleData?.id ? 'Edit Vehicle' : 'Add Vehicle'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'gray',
            '&:hover': { color: '#ff6666' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 2 }}>
          {/* VIN/Chassis Selection Dropdown and Dynamic Input */}
          <Grid item xs={12} md={2}>
            {renderSelectField('Identifier Type', idType, handleIdTypeChange, [
              'VIN',
              'Chassis',
            ])}
          </Grid>
          <Grid item xs={12} md={5}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {renderTextField(
                idType === 'VIN' ? 'VIN Number' : 'Chassis Number',
                vinOrChassis,
                (e) => setVinOrChassis(e.target.value), //handleVinChange,
                'text',
                idPlaceholder,
                true, // Make it required
                (<InputAdornment position="end">
                  <Button variant="contained" color="primary" onClick={handleVinCheck}>
                    Check
                  </Button>
                </InputAdornment>)
              )}
            </div>
          </Grid>

          {/* Plate Number and Vehicle Make */}
          <Grid item xs={12} md={5}>
            {renderTextField('Plate Number', plateNumber, (e) =>
              setPlateNumber(e.target.value)
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderTextField('Vehicle Make', vehicleMake, (e) =>
              setVehicleMake(e.target.value)
            )}
          </Grid>

          {/* Vehicle Model and Trim */}
          <Grid item xs={12} md={6}>
            {renderTextField('Vehicle Model', vehicleModel, (e) =>
              setVehicleModel(e.target.value)
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderTextField('Vehicle Trim', vehicleTrim, (e) =>
              setVehicleTrim(e.target.value)
            )}
          </Grid>

          {/* Year and Color */}
          <Grid item xs={12} md={3}>
            {renderTextField(
              'Year',
              year,
              (e) => setYear(e.target.value),
              'number'
            )}
          </Grid>
          <Grid item xs={12} md={3}>
            {renderTextField('Color', color, (e) => setColor(e.target.value))}
          </Grid>

          <Grid item xs={12} md={6}>
            {renderSelectField(
              'Fuel Type',
              fuelType,
              (e) => setFuelType(e.target.value),
              fuelTypeOptions,
              undefined,
              undefined,
              true // Make it required
            )}
          </Grid>

          {/* Doors and Vehicle Body Type */}
          <Grid item xs={12} md={3}>
            {renderTextField(
              'Doors',
              doors,
              (e) => setDoors(e.target.value),
              'number'
            )}
          </Grid>

          {/* Odometer and Fuel Type */}
          <Grid item xs={12} md={3}>
            {renderTextField(
              'Odometer',
              odometer,
              (e) => setOdometer(e.target.value),
              'number'
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            {renderTextField('Vehicle Body Type', vehicleBodyType, (e) =>
              setVehicleBodyType(e.target.value)
            )}
          </Grid>

          {/* Driven Wheel and Parking */}
          <Grid item xs={12} md={6}>
            {renderTextField('Driven Wheel', drivenWheel, (e) =>
              setDrivenWheel(e.target.value)
            )}
          </Grid>

          {/* Fetched Garages from the backend */}
          <Grid item xs={12} md={6}>
            {renderSelectField(
              'Parking',
              parking,
              (e) => setParking(e.target.value),
              garages,
              (option) => option.name,
              (option) => option.id.toString(),
              true // Make it required
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {renderSelectField(
              'Status',
              status,
              (e) => setStatus(e.target.value),
              statusOptions,
              undefined,
              undefined,
              true // Make it required
            )}
          </Grid>

          {/* Transmission Type and Status */}
          <Grid item xs={12} md={6}>
            {renderSelectField(
              'Transmission Type',
              transmissionType,
              (e) => setTransmissionType(e.target.value),
              transmissionTypeOptions,
              undefined,
              undefined,
              true // Make it required
            )}
          </Grid>

          {/* Category and Conditional "Other" Field */}
          <Grid item xs={12} md={6}>
            {renderSelectField('Category', category, handleCategoryChange, categoryOptions, undefined, undefined, true)}
          </Grid>

          {category === 'Others' && (
            <Grid item xs={12} md={12}>
              {renderTextField(
                'Other Category',
                otherCategory,
                (e) => setOtherCategory(e.target.value),
                'text',
                'Enter other category',
                true // Make it required
              )}
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ bgcolor: '', pt: 2 }}>
        {renderButton('Cancel', onClose)}
        {renderButton('Save', handleSave, true)}
      </DialogActions>
    </Dialog>
  );
};

export default AddVehicleModal;
