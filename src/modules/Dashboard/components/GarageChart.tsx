import React from 'react';
import { Bar } from 'react-chartjs-2';
import pattern from 'patternomaly';

interface GarageWithCount {
  id: number;
  name: string;
  city: string;
  vehicleCount: number;
}

interface GarageChartProps {
  garages: GarageWithCount[];
}

const GarageChart: React.FC<GarageChartProps> = ({ garages }) => {
  const chartLabels = (garages: GarageWithCount[]) => {
    let labels: string[] = [];
    const truncateWithEllipsis = (inputString: string, maxLength: number) => {
      return inputString.length > maxLength
        ? inputString.substring(0, maxLength - 3) + '...'
        : inputString;
    };

    const screenWidth = window.innerWidth;
    const maxLength = screenWidth > 1450 ? 35 : 25;

    for (const g of garages) {
      labels.push(
        truncateWithEllipsis(g.name, maxLength) + ` (${g.vehicleCount})`
      );
    }
    return labels;
  };

  const chartData = (garages: GarageWithCount[]) => {
    return garages.map((g) => g.vehicleCount);
  };

  const chartColor = (garages: GarageWithCount[]) => {
    const data = chartData(garages);
    const max = Math.max(...data);
    return data.map((count) =>
      count === max ? pattern.draw('diagonal-right-left', '#164FD5') : '#0A1224'
    );
  };

  const labels = chartLabels(garages);
  const vehiclesCount = chartData(garages);
  const chartBackgroundColor = chartColor(garages);
  const chartBorderColor = chartColor(garages);

  const data = {
    labels: labels,
    datasets: [
      {
        axis: 'y',
        data: vehiclesCount,
        backgroundColor: chartBackgroundColor,
        borderColor: chartBorderColor,
        borderWidth: 1,
        barThickness: 22,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false }, // Hide legend
    },
    scales: {
      y: {
        ticks: {
          color: '#000',
          mirror: true,
          labelOffset: -30,
          font: {
            size: 14,
          },
        },
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="mt-4" style={{ height: '330px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default GarageChart;
