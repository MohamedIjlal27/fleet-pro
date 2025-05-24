import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ChartEvent,
  InteractionItem,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { fetchWidgetData } from '../apis/apis.tsx';
import { Typography } from '@mui/material';

interface VehicleStats {
  vehicle: string;
  distance: number; // in km
  fuelConsumption: number; // in L
  idling: number; // in hours
}
const dummyData: VehicleStats[] = [
  {
    vehicle: 'Vehicle 1',
    distance: 658.4,
    fuelConsumption: 45.6,
    idling: 43.46,
  },
  {
    vehicle: 'Vehicle 2',
    distance: 122.07,
    fuelConsumption: 20.8,
    idling: 25.74,
  },
  {
    vehicle: 'Vehicle 3',
    distance: 94.33,
    fuelConsumption: 15.3,
    idling: 25.17,
  },
  {
    vehicle: 'Vehicle 4',
    distance: 20.03,
    fuelConsumption: 5.4,
    idling: 35.29,
  },
  { vehicle: 'Vehicle 5', distance: 0, fuelConsumption: 123, idling: 0 },
];

const TopVehicleStatsChart: React.FC = () => {
  const [vehicleData, setVehicleData] = useState<VehicleStats[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('distance');
  const [selectedDate, setSelectedDate] = useState<string>('24hrs');
  const [loading, setLoading] = useState<boolean>(false);
  // Dummy Data
  useEffect(() => {
    fetchVehicleStats(selectedDate);
    //setVehicleData(dummyData);
  }, []);

  useEffect(() => {
    fetchVehicleStats(selectedDate);
  }, [selectedDate]);

  const fetchVehicleStats = async (date: string) => {
    setLoading(true);
    try {
      const apiData = await fetchWidgetData({ wg4: true, wg4b: date });

      const wgTopVehicleStats = apiData.find(
        (item) => item.wgTopVehicleStats !== undefined
      ).wgTopVehicleStats;
      console.log('wgTopVehicleStats =', wgTopVehicleStats);
      const transformedData = wgTopVehicleStats.map((item: any) => ({
        vehicle: `Vehicle ${item.vehicleId}`,
        distance: item.totalKmDriven || 0,
        fuelConsumption: item.totalFuelUsed || 0,
        idling: item.totalIdleTime || 0,
      }));

      //console.log("apiData =", apiData);
      //console.log("transformedData =", transformedData);

      setVehicleData(transformedData);
    } catch (error) {
      console.error('Error fetching vehicle stats:', error);
      setVehicleData([]);
    }
    setLoading(false);
  };

  const getMetricData = () => {
    switch (selectedMetric) {
      case 'distance':
        return vehicleData.map((data) => data.distance);
      case 'fuelConsumption':
        return vehicleData.map((data) => data.fuelConsumption);
      case 'idling':
        return vehicleData.map((data) => data.idling);
      default:
        return [];
    }
  };

  const metricLabel =
    selectedMetric === 'distance'
      ? 'Distance (km)'
      : selectedMetric === 'fuelConsumption'
      ? 'Fuel Consumption (L)'
      : 'Idling (hours)';

  const chartColors = {
    distance: '#0A1224',
    fuelConsumption: '#97CCE4',
    idling: '#164FD5',
  };

  const metricData = getMetricData();
  const chartLabels = vehicleData.map(
    (data) => `${data.vehicle} (${selectedDate})`
  );

  // Generate chart configuration dynamically
  const getChartData = () => {
    const metricLabel =
      selectedMetric === 'distance'
        ? 'Distance (km)'
        : selectedMetric === 'fuelConsumption'
        ? 'Fuel Consumption (L)'
        : 'Idling (hours)';

    const chartColors = {
      distance: '#0A1224',
      fuelConsumption: '#97CCE4',
      idling: '#164FD5',
    };

    const metricData = vehicleData.map((data) =>
      selectedMetric === 'distance'
        ? data.distance
        : selectedMetric === 'fuelConsumption'
        ? data.fuelConsumption
        : data.idling
    );

    const chartLabels = vehicleData.map(
      (data) => `${data.vehicle}`
    );

    return {
      labels: chartLabels,
      datasets: [
        {
          label: metricLabel,
          data: metricData,
          backgroundColor:
            chartColors[selectedMetric as keyof typeof chartColors],
          borderColor: chartColors[selectedMetric as keyof typeof chartColors],
          borderWidth: 1,
          barThickness: 16,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    indexAxis: 'x' as const,
    plugins: {
      legend: { display: true },
    },
    layout: {
      padding: {
        bottom: 50,
      },
    },
    scales: {
      x: {
        offset: true,
        grid: { display: false },
        ticks: {
          color: '#000',
          font: { size: 10 },
          padding: 10,
          maxRotation: 60,
          minRotation: 60,
        },
      },
      y: {
        beginAtZero: true,
        grid: { display: false },
      },
    },
    onClick: (
      event: ChartEvent,
      elements: InteractionItem[],
      chart: ChartJS
    ) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const clickedVehicle = vehicleData[index];
        const vehicleId = clickedVehicle.vehicle.replace('Vehicle ', '');
        window.location.href = `/vehicle/${vehicleId}`; // Or use React Router navigation
      }
    },
  };

  return (
    <div
      style={{
        width: '100%',
        height: '400px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between', // Distribute items with space between them
          gap: '1rem',
          marginBottom: '1rem',
          width: '100%', // Ensure the div takes full width of the container
        }}
      >
        <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
          Vehicle Metrics:
        </Typography>

        <div
          style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}
        >
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          >
            <option value="distance">Distance (km)</option>
            <option value="fuelConsumption">Fuel Consumption (L)</option>
            <option value="idling">Idling (hours)</option>
          </select>

          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          >
            {['24hrs', '3days', 'weekly', 'monthly', 'yearly'].map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '300px',
          }}
        >
          <div className="spinner">
            <span>Loading...</span>
          </div>
        </div>
      ) : (
        <Bar data={getChartData()} options={options} />
      )}
    </div>
  );
};

export default TopVehicleStatsChart;
