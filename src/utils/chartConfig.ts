import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  LineController,
  BarController,
  DoughnutController,
  ArcElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
  Legend,
  Title,
  Filler
} from 'chart.js';

// Register all Chart.js components that are used in the application
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  LineController,
  BarController,
  DoughnutController,
  ArcElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
  Legend,
  Title,
  Filler
);

export default Chart; 