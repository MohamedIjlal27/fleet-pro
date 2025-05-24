import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Container,
  Typography,
  Card,
  Box,
  IconButton,
  Modal,
  Divider,

} from '@mui/material';
import {
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { Chart, registerables } from 'chart.js';
import Button from '../../core/components/ThemeButton';
import { systemPlan, systemModule } from '@/utils/constants'
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from "@/modules/core/pages/Error404Page";
import LockedFeature from '@/modules/core/components/LockedFeature'

// Register Chart.js components
Chart.register(...registerables);

interface GeotabStatItem {
  id: string;
  title: string;
  description: string;
  unit: string;
  data: number[];
}

const GeotabStatPage: React.FC = () => {
  if (!checkModuleExists(systemModule.Map)) {
    return checkPlanExists(systemPlan.FreeTrial) ? <LockedFeature featureName="Map" /> : <Error404Page />;
  }
  
  const { deviceID, vehicleID } = useParams();
  const navigate = useNavigate();
  const [geotabStat, setGeotabStat] = useState<GeotabStatItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GeotabStatItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadGeotabStat();
  }, []);

  const loadGeotabStat = async () => {
    if (!deviceID) {
      console.error('Device ID is required');
      return <Typography>Device ID is required</Typography>;
    }

    if (!vehicleID) {
      console.error('Vehicle ID is required');
      return <Typography>Vehicle ID is required</Typography>;
    }

    try {
      // Mock data simulating fetched Geotab stats
      const data: GeotabStatItem[] = [
        {
          id: 'accelerationForwardBraking',
          title: 'Acceleration Forward/Braking',
          description:
            'In automotive testing or reviews, this phrase could describe the vehicle\'s performance characteristics, such as how quickly it can accelerate to a certain speed and how efficiently it can brake to a stop from that speed.',
          unit: 'G force',
          data: [0.3, 0.5, 0.7, 1.2, 0.9, 0.6, 0.8],
        },
        {
          id: 'accelerationSideToSide',
          title: 'Acceleration Side-to-Side',
          description:
            'Acceleration side to side in an automobile, often referred to as lateral acceleration, is a measure of how quickly a vehicle can change its direction. This type of acceleration is crucial in understanding a car\'s handling characteristics, particularly during cornering or sudden maneuvers.',
          unit: 'G force',
          data: [0.2, 0.4, 0.3, 0.6, 0.5, 0.4, 0.3],
        },
        {
          id: 'accelerationUpDown',
          title: 'Acceleration Up/Down',
          description:
            'Acceleration up and down in an automobile refers to the vertical forces experienced by the vehicle due to changes in elevation, such as driving over hills or dips, which can affect ride comfort and suspension dynamics.',
          unit: 'G force',
          data: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
        },
        {
          id: 'engineSpeed',
          title: 'Engine Speed',
          description:
            'Engine speed, often measured in revolutions per minute (RPM), indicates how fast the engine\'s crankshaft is rotating, directly influencing the power output and performance characteristics of the vehicle.',
          unit: 'RPM',
          data: [1500, 1700, 2000, 2300, 1900, 2100, 2200],
        },
        {
          id: 'engineRoadSpeed',
          title: 'Engine Road Speed',
          description:
            'Engine road speed refers to the vehicle\'s speed on the road as a result of the engine\'s power being transmitted through the drivetrain, typically measured in kilometers per hour (km/h).',
          unit: 'KM/h',
          data: [80, 90, 100, 110, 120, 130, 140],
        },
        {
          id: 'engineCoolantTemperature',
          title: 'Engine Coolant Temperature',
          description:
            'Engine coolant temperature refers to the temperature of the fluid used in a vehicle\'s cooling system to absorb and dissipate heat from the engine, ensuring it operates within an optimal temperature range to prevent overheating and maintain efficiency.',
          unit: '°C',
          data: [70, 75, 80, 85, 90, 95, 100],
        },
        {
          id: 'odometer',
          title: 'Odometer',
          description:
            'An odometer is an instrument in a vehicle that measures and displays the total distance the vehicle has traveled.',
          unit: 'KM',
          data: [120, 240, 360, 480, 600, 720, 840],
        },
        {
          id: 'crankingVoltage',
          title: 'Cranking Voltage',
          description:
            'Cranking voltage is the voltage level of a vehicle\'s battery while the starter motor is engaged and the engine is being cranked to start, typically measured to ensure the battery can provide sufficient power for engine ignition.',
          unit: 'V',
          data: [12.5, 12.6, 12.7, 12.6, 12.5, 12.4, 12.8],
        },
        {
          id: 'goDeviceVoltage',
          title: 'Go Device Voltage',
          description:
            'Geotab Device voltage is the voltage level of a Geotab device, typically measured in volts (V).',
          unit: 'V',
          data: [3.7, 3.6, 3.8, 3.9, 4.0, 4.1, 3.7],
        },
        {
          id: 'totalFuelUsed',
          title: 'Total Fuel Used',
          description:
            'Total fuel used refers to the cumulative amount of fuel consumed by a vehicle over a specific period or distance, often measured in liters or gallons, indicating the overall fuel consumption since a particular point in time or since the vehicle was last refueled.',
          unit: 'L',
          data: [5, 6, 7, 8, 7, 6, 5],
        },
      ];

      setGeotabStat(data);

      // Initialize charts
      data.forEach((item) => {
        setTimeout(() => {
          renderChart(item);
        }, 100);
      });
    } catch (error) {
      console.error('Error loading telemetric stats:', error);
    }
  };

  const renderChart = (item: GeotabStatItem) => {
    const ctx = document.getElementById(item.id) as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: item.data.map((_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: `${item.title} (${item.unit})`,
            data: item.data,
            borderColor: 'rgba(33, 88, 219, 1)',
            backgroundColor: 'rgba(33, 88, 219, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  };

  const backtoMap = () => {
    navigate('/map')
  };

  const openModal = (item: GeotabStatItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  return (
    <Container className="py-4" maxWidth="md">
      {/* Button to navigate to /map */}
      <Button
        onClick={() => backtoMap()}
        icon={<KeyboardArrowLeftIcon />}
        name="Back to Map"
      />

      <Typography variant="h4" className="mb-3">
        Telemetric Statistics for the Recent 7 Days
      </Typography>

      <Card className="p-4">
        {geotabStat.length > 0 ? (
          geotabStat.map((item) => (
            <Box key={item.id} display="flex" alignItems="center" mb={3}>
              {/* Title Section */}
              <Box flex={1} display="flex" alignItems="center">
                <Typography variant="body1" className="font-semibold">
                  {item.title}
                </Typography>
                <IconButton onClick={() => openModal(item)}>
                  <InfoIcon color="primary" />
                </IconButton>
              </Box>

              {/* Chart Section */}
              <Box flex={2}>
                <canvas
                  id={item.id}
                  style={{
                    minHeight: '120px',
                    maxHeight: '120px',
                    width: '100%',
                  }}
                />
              </Box>
            </Box>
          ))
        ) : (
          <Typography>No data available</Typography>
        )}
      </Card>

      {/* Modal for Description */}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} disableAutoFocus={true}>
        <Box
          className="p-4 bg-white rounded-lg shadow-lg"
          style={{
            width: '400px',
            margin: '100px auto',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          {/* Header Section */}
          <Box display="flex" alignItems="center" mb={2}>
            {/* Logo */}
            <img
              src="/src/assets/logo-dark.svg"
              alt="logo"
              width={40}
              style={{ borderRadius: '4px', marginRight: '10px' }}
            />
            {/* Title */}
            <Typography variant="h6" className="font-semibold" style={{ flexGrow: 1 }}>
              {selectedItem?.title}
            </Typography>
            {/* Close Button */}
            <IconButton
              onClick={() => setModalOpen(false)}
              style={{
                padding: '0',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Divider */}
          <Divider sx={{ marginBottom: 2 }} />

          {/* Body Section */}
          <Typography
            variant="body1"
            color="text.secondary"
            style={{ fontWeight: 500, paddingBottom: '20px' }}
          >
            {selectedItem?.description}
          </Typography>
        </Box>
      </Modal>


    </Container>
  );
};

export default GeotabStatPage;
