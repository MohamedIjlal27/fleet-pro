import React, { useRef } from 'react';
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

Chart.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController
);

const FuelLevelIndicator: React.FC<{ fuel: number }> = ({ fuel }) => {
  const chartRef = useRef<any>(null);

  const getDatasets = () => {
    let data: any[] = [];
    const fuelLevelHeight = (fuel / 100) * 8.5;
    const numOfBlueBlock = Math.ceil((7 * fuel) / 100);

    for (let index = 0; index < 7; index++) {
      const color = index < numOfBlueBlock ? '#1E293B' : '#E2E4E5';

      data.push({
        label: `Dataset ${index}`,
        data: [1],
        backgroundColor: color,
        barThickness: 45,
        borderRadius: {
          topLeft: 10,
          topRight: 10,
          bottomLeft: 10,
          bottomRight: 10,
        },
        borderSkipped: false,
      });

      if (index === 6) break;

      data.push({
        label: `spacer ${index}`,
        data: [0.3],
        backgroundColor: 'transparent',
        barThickness: 22,
        borderRadius: 8,
        borderSkipped: false,
      });
    }

    data.push({
      label: 'line',
      data: [fuelLevelHeight, fuelLevelHeight, fuelLevelHeight],
      borderWidth: 2,
      borderDash: [5],
      borderColor: '#1E293B',
      stack: 'combined',
      type: 'line',
      fill: false,
    });

    return data;
  };

  const data = {
    labels: ['', '', ''],
    datasets: getDatasets(),
  };

  const options = {
    maintainAspectRatio: false,
    events: [],
    plugins: {
      legend: {
        display: false, // Correct way to disable legend
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    scales: {
      x: {
        display: false,
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        stacked: true,
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="relative h-24 w-32 ml-10 mt-1">
      <Bar ref={chartRef} data={data} options={options} />
      <div className="mx-auto flex items-center justify-center mt-1">
        <span className="text-xs font-bold">Fuel: </span>
        <span className="text-xs font-bold mr-6">{fuel}%</span>
      </div>
    </div>
  );
};

export default FuelLevelIndicator;
