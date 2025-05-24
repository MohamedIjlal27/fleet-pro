import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from '@mui/material';
import Button from '../../../core/components/ThemeButton';
import { ITelemetryDevice } from '../interfaces/ITelemetryDevice';
import AddDeviceModal from '../components/AddDeviceModal';
import { useEffect, useState } from 'react';
import {
  deleteTelemetryDevice,
  getTelemetryDevices,
  getVehicles,
} from '../apis/apis';
import { IVehicle } from '../../../core/interfaces/interfaces';
import { systemPlan, systemModule } from '@/utils/constants'
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from "@/modules/core/pages/Error404Page";
import LockedFeature from '@/modules/core/components/LockedFeature'

const TelemetryDevicePage: React.FC = () => {
  if (!checkModuleExists(systemModule.SettingsTelemetryDevice)) {
    return checkPlanExists(systemPlan.FreeTrial) ? <LockedFeature featureName="Telemetry Device" /> : <Error404Page />;
  }

  const [devices, setDevices] = useState<ITelemetryDevice[]>([]);
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);

  const refresh = () => {
    getVehicles().then((data) => {
      console.log('vehicles', data);
      setVehicles(data);
    });
    getTelemetryDevices().then((data) => {
      console.log('devices', data);
      setDevices(data);
    });
  };
  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = async (deviceId: number) => {
    console.log(`Delete device with ID: ${deviceId}`);
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this device?'
    );
    if (confirmDelete) {
      try {
        await deleteTelemetryDevice(deviceId);
        setDevices(devices.filter((device) => device.id !== deviceId));
      } catch (error) {
        console.error('Error deleting device:', error);
      }
    }
  };

  return (
    <div>
      {/* Right Side (Table and Add Vehicle Button) */}
      <Box flex={3} p={2}>
        <Box display="flex" justifyContent="center" mb={2} alignItems="center">
          <AddDeviceModal
            devices={devices}
            vehicles={vehicles}
            refresh={refresh}
          />
        </Box>
        <Box display="flex" justifyContent="center" mb={2} alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            {/* Vehicles */}
          </Typography>
        </Box>

        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Device Protocol</TableCell>
                <TableCell>Device Type</TableCell>
                <TableCell>Device ID</TableCell>
                <TableCell>Device Name</TableCell>
                <TableCell>Vehicle Plate Number</TableCell>
                <TableCell>Ident</TableCell>
                <TableCell>Renewal Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    {<a href={`/vehicle/${device.vehicleId}`}>{device.type}</a>}
                  </TableCell>
                  <TableCell>
                    {<a href={`/vehicle/${device.vehicleId}`}>{device.deviceProtocol}</a>}
                  </TableCell>
                  <TableCell>
                    {<a href={`/vehicle/${device.vehicleId}`}>{device.deviceType}</a>}
                  </TableCell>
                  <TableCell>
                    {
                      <a href={`/vehicle/${device.vehicleId}`}>
                        {device.deviceId}
                      </a>
                    }
                  </TableCell>
                  <TableCell>
                    {
                      <a href={`/vehicle/${device.vehicleId}`}>
                        {device.deviceName}
                      </a>
                    }
                  </TableCell>
                  <TableCell>
                    {
                      <a href={`/vehicle/${device.vehicleId}`}>
                        {
                          vehicles.find(
                            (vehicle) => vehicle.id === device.vehicleId
                          )?.plateNumber
                        }
                      </a>
                    }
                  </TableCell>
                  <TableCell>
                    {
                      <a href={`/vehicle/${device.vehicleId}`}>
                        {device.ident}
                      </a>
                    }
                  </TableCell>
                  <TableCell>
                    {
                      new Date('2026-07-11').toLocaleDateString()
                    }
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleDelete(device.id)}
                      name="Delete"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  );
};

export default TelemetryDevicePage;
