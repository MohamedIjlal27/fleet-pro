import React, { useEffect, useState } from 'react';
import {
  Modal,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import { ITelemetryDeviceForm } from '../interfaces/ITelemetryDeviceForm';
import { addTelemetryDevice, getTelemetryDeviceOptions } from '../apis/apis';
import { IVehicle } from '../../../core/interfaces/interfaces';
import { ITelemetryDevice } from '../interfaces/ITelemetryDevice';

interface AddDeviceModalProps {
  vehicles: IVehicle[];
  devices: ITelemetryDevice[];
  refresh: () => void;
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  devices,
  vehicles,
  refresh,
}) => {
  const [open, setOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    trackingDeviceType: {} as Record<string, string>,
    deviceProtocol: {} as Record<string, string>,
  });
  const [device, setDevice] = useState<ITelemetryDeviceForm>({
    deviceId: '',
    deviceName: '',
    deviceIdent: '',
    renewalDate: '',
    trackingDeviceType: undefined,
    deviceProtocol: undefined,
    deviceType: undefined,
    vehicleId: '',
    //organizationId: 1,
    status: 'active',
  });
  const [availableVehicles, setAvailableVehicles] = useState<IVehicle[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);

  const resetForm = () => {
    setDevice({
      deviceId: '',
      deviceName: '',
      deviceIdent: '',
      trackingDeviceType: undefined,
      deviceProtocol: undefined,
      deviceType: undefined,
      vehicleId: '',
      //organizationId: 1,
      status: 'active',
    });
    setSelectedDeviceId(null);
  };

  const loadData = () => {
    getTelemetryDeviceOptions().then((data) => {
      console.log('options', data);
      setFilterOptions(data);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const availableVehicles = vehicles.filter(
      (vehicle) =>
        vehicle.device === null ||
        vehicle.device.deviceId === null ||
        vehicle.device.deviceId === 0
    );
    console.log('availableVehicles', availableVehicles);
    setAvailableVehicles(availableVehicles);
  }, [devices, vehicles]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setDevice((prevDevice) => ({
      ...prevDevice,
      [name as string]: value,
    }));
  };

  const handleSubmit = async () => {
    device.vehicleId = selectedDeviceId?.toString() || '';
    console.log('Device submitted:', device);
    try {
      const response = await addTelemetryDevice(device);
      console.log('Device added:', response);
      resetForm();
      refresh();
      handleClose();
    } catch (error) {
      console.error('Error adding device:', error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Vehicle selected:', e.target.value);

    setSelectedDeviceId(Number(e.target.value));
  };

  return (
    <div>
      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{
          mt: 3,
          padding: '10px 6px',
          fontWeight: 'bold',
          backgroundColor: '#1E293B',
          '&:hover': {
            backgroundColor: '#111827',
          },
        }}
      >
        Add Telemetry Device
      </Button>
      <Modal open={open} onClose={handleClose} disableAutoFocus={true}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            width: 500,
          }}
        >
          <h2>Add New Telemetry Device</h2>
          <TextField
            label="Device Name"
            name="deviceName"
            value={device.deviceName}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Device ID"
            name="deviceId"
            value={device.deviceId}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Device Ident"
            name="deviceIdent"
            value={device.deviceIdent}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel id="vehicle-select-label">Select Vehicle</InputLabel>
            <Select
              labelId="vehicle-select-label"
              id="vehicle-select"
              value={selectedDeviceId || ''}
              onChange={
                handleVehicleChange as (
                  event: SelectChangeEvent<number>
                ) => void
              }
              label="Select Vehicle"
            >
              {availableVehicles.map((vehicle) => (
                <MenuItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.make} - {vehicle.model} - {vehicle.year} -{' '}
                  {vehicle.plateNumber}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" required>
            <InputLabel id="device-type-label">Device Type</InputLabel>
            <Select
              labelId="device-type-label"
              id="device-type-select"
              name="trackingDeviceType"
              value={device.trackingDeviceType}
              onChange={
                handleChange as (event: SelectChangeEvent<string>) => void
              }
              label="Device Type"
            >
              {Object.entries(filterOptions.trackingDeviceType).map(([key, label]) => (
                <MenuItem key={key} value={label}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" required={device.trackingDeviceType=='FLESPI'}>
            <InputLabel id="device-protocol-label">Device Protocol</InputLabel>
            <Select
              labelId="device-protocol-label"
              id="device-protocol-select"
              name="deviceProtocol"
              value={device.deviceProtocol}
              onChange={
                handleChange as (event: SelectChangeEvent<string>) => void
              }
              label="Device Protocol"
            >
              {Object.entries(filterOptions.deviceProtocol).map(([key, label]) => (
                <MenuItem key={key} value={label}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Device Type"
            name="deviceType"
            value={device.deviceType}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          <TextField
            fullWidth
            label="Renewal Date"
            type="datetime-local"
            name="renewalDate"
            margin="normal"
            required
            value={device?.renewalDate
                ? (() => {
                    const date = new Date(device.renewalDate);
                    // Ensure the date is formatted to YYYY-MM-DDTHH:mm (local timezone)
                    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                    return localDate.toISOString().slice(0, 16); // Formats to YYYY-MM-DDTHH:mm
                })()
                : ""}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="contained"
              sx={{
                mt: 3,
                padding: '10px 6px',
                fontWeight: 'bold',
                backgroundColor: '#1E293B',
                '&:hover': {
                  backgroundColor: '#111827',
                },
              }}
              onClick={handleClose}
            >
              Close
            </Button>
            <Button
              variant="contained"
              sx={{
                mt: 3,
                padding: '10px 6px',
                fontWeight: 'bold',
                backgroundColor: '#1E293B',
                '&:hover': {
                  backgroundColor: '#111827',
                },
              }}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default AddDeviceModal;
