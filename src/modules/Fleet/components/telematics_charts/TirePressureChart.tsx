import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Box, Typography } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface TirePressureChartProps {
  pressures: number[]; // Expecting an array [FL, FR, RL, RR]
}

const TirePressureChart: React.FC<TirePressureChartProps> = ({ pressures }) => {
  const maxPressure = 50;

  const options = {
    scales: {
      x: {
        display: false,
      },
      y: {
        beginAtZero: true,
        max: maxPressure,
        display: false,
      },
    },
    plugins: {
      tooltip: {
        enabled: true,
      },
      legend: {
        display: false, // Disable legend
      },
    },

    responsive: true,
    maintainAspectRatio: false,
  };

  const barSettings = (pressure: number, label: string) => ({
    labels: [label],
    datasets: [
      {
        label: '',
        data: [pressure === 0 || pressure === null ? maxPressure : pressure],
        backgroundColor: ['#1E293B'],
        borderRadius: {
          topLeft: 10,
          topRight: 10,
          bottomLeft: 10,
          bottomRight: 10,
        },
        borderSkipped: false,
        barThickness: 20,
      },
    ],
  });

  const displayPressure = (pressure: number) =>
    pressure === 0 ? 'N/A' : pressure;

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      {/* Main chart container */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="100%"
        height="130px"
        marginLeft="10px"
      >
        {/* Left Side (FL, RL) */}
        <Box display="flex" flexDirection="column" alignItems="center">
          {/* Front Left (FL) */}
          <Box display="flex" alignItems="center">
            <Typography fontSize={12}>
              {displayPressure(pressures[0])}
            </Typography>
            <Box width="40px" height="60px">
              <Bar data={barSettings(pressures[0], 'FL')} options={options} />
            </Box>
          </Box>

          {/* Rear Left (RL) */}
          <Box display="flex" alignItems="center">
            <Typography fontSize={12}>
              {displayPressure(pressures[2])}
            </Typography>
            <Box width="40px" height="60px">
              <Bar data={barSettings(pressures[2], 'RL')} options={options} />
            </Box>
          </Box>
        </Box>

        {/* Right Side (FR, RR) */}
        <Box display="flex" flexDirection="column" alignItems="center">
          {/* Front Right (FR) */}
          <Box display="flex" alignItems="center">
            <Box width="40px" height="60px">
              <Bar data={barSettings(pressures[1], 'FR')} options={options} />
            </Box>
            <Typography fontSize={12}>
              {displayPressure(pressures[1])}
            </Typography>
          </Box>

          {/* Rear Right (RR) */}
          <Box display="flex" alignItems="center">
            <Box width="40px" height="60px">
              <Bar data={barSettings(pressures[3], 'RR')} options={options} />
            </Box>
            <Typography fontSize={12}>
              {displayPressure(pressures[3])}
            </Typography>
          </Box>
        </Box>
      </Box>
      {/* Title at the bottom */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="100%"
      >
        <Typography fontSize={12} fontWeight="bold">
          Tire Pressures (KPA)
        </Typography>
      </Box>
    </Box>
  );
};

export default TirePressureChart;
