import React from 'react';
import { Bar } from 'react-chartjs-2';
import pattern from 'patternomaly';
import { TooltipItem } from 'chart.js';

interface BadDriverStats {
  driver: string;
  speeding: number; // Number of speeding incidents
  harshBraking: number; // Number of harsh braking incidents
  idling: number; // High idling time in hours
}

interface BadDriversChartProps {
  badDriversData: BadDriverStats[];
}

const BadDriversChart: React.FC<BadDriversChartProps> = ({
  badDriversData,
}) => {
  const chartLabels = badDriversData.map((data) => data.driver);
  const speedingData = badDriversData.map((data) => data.speeding);
  const brakingData = badDriversData.map((data) => data.harshBraking);
  const idlingData = badDriversData.map((data) => data.idling);

  const chartColors = {
    speeding: '#97CCE4',
    harshBraking: '#0A1224',
    idling: '#164FD5',
  };

  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Speeding Incidents',
        data: speedingData,
        backgroundColor: chartColors.speeding,
        borderColor: pattern.draw('diagonal-right-left', chartColors.speeding),
        borderWidth: 1,
        barThickness: 12,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Harsh Braking',
        data: brakingData,
        backgroundColor: chartColors.harshBraking,
        borderColor: pattern.draw(
          'diagonal-right-left',
          chartColors.harshBraking
        ),
        borderWidth: 1,
        barThickness: 12,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'High Idling (hrs)',
        data: idlingData,
        backgroundColor: chartColors.idling,
        borderColor: pattern.draw('diagonal-right-left', chartColors.idling),
        borderWidth: 1,
        barThickness: 12,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' as const },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: TooltipItem<'bar'>) {
            const label = tooltipItem.dataset.label || 'Unknown';
            const value = tooltipItem.raw as number;
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { display: false },
        ticks: { color: '#000', font: { size: 12 } },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#000', font: { size: 12 } },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '400px', overflow: 'hidden' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BadDriversChart;
