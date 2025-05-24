import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { fetchBillChart } from "../apis/apis"; // Import API function
import { Typography } from "@mui/material";

interface BillStatus {
  date: string;
  paid: number;
  unpaid: number;
  refunded: number;
  failed: number;
}

interface BillStatusChartProps {
  showFilter?: boolean;
}

const BillStatusChart: React.FC<BillStatusChartProps> = ({showFilter = false}) => {
  const [statusData, setStatusData] = useState<BillStatus[]>([]);
  const [metricPaid, setMetricPaid] = useState<number[]>([]);
  const [metricUnpaid, setMetricUnpaid] = useState<number[]>([]);
  const [metricRefunded, setMetricRefunded] = useState<number[]>([]);
  const [metricFailed, setMetricFailed] = useState<number[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(showFilter); // Toggle filter dropdown visibility

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchBillChart();
        const formattedData = response.map((item: any) => ({
          date: item.date,
          paid: item.bills_paid_count,
          unpaid: item.bills_unpaid_count,
          refunded: item.bills_refunded_count,
          failed: item.bills_failed_count,
        }));

        setStatusData(formattedData);

        const dates = formattedData.map((item: BillStatus) => item.date);
        setAvailableDates(dates);

        setMetricPaid(formattedData.map((item: BillStatus) => item.paid));
        setMetricUnpaid(formattedData.map((item: BillStatus) => item.unpaid));
        setMetricRefunded(formattedData.map((item: BillStatus) => item.refunded));
        setMetricFailed(formattedData.map((item: BillStatus) => item.failed));
      } catch (error) {
        console.error("Failed to fetch bill chart data:", error);
      }
    };

    fetchData();
  }, []);

  const filteredDatasets = {
    all: [
      {
        label: "Paid",
        data: metricPaid,
        backgroundColor: "#C6D2EE",
        borderColor: "#C6D2EE",
        borderWidth: 1,
        barThickness: 16,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "Unpaid",
        data: metricUnpaid,
        backgroundColor: "#2158DB",
        borderColor: "#2158DB",
        borderWidth: 1,
        barThickness: 16,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "Refunded",
        data: metricRefunded,
        backgroundColor: "#CBE1EC",
        borderColor: "#CBE1EC",
        borderWidth: 1,
        barThickness: 16,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "Failed",
        data: metricFailed,
        backgroundColor: "#D9DCE0",
        borderColor: "#D9DCE0",
        borderWidth: 1,
        barThickness: 16,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
    paid: [
      {
        label: "Paid",
        data: metricPaid,
        backgroundColor: "#C6D2EE",
        borderColor: "#C6D2EE",
        borderWidth: 1,
        barThickness: 16,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
    unpaid: [
      {
        label: "Unpaid",
        data: metricUnpaid,
        backgroundColor: "#2158DB",
        borderColor: "#2158DB",
        borderWidth: 1,
        barThickness: 16,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
    refunded: [
      {
        label: "Refunded",
        data: metricRefunded,
        backgroundColor: "#CBE1EC",
        borderColor: "#CBE1EC",
        borderWidth: 1,
        barThickness: 16,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
    failed: [
      {
        label: "Failed",
        data: metricFailed,
        backgroundColor: "#D9DCE0",
        borderColor: "#D9DCE0",
        borderWidth: 1,
        barThickness: 16,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const data = {
    labels: availableDates, // Chart labels
    datasets: filteredDatasets[filter], // Filtered datasets based on the selected filter
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    indexAxis: "x" as const,
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
          color: "#000",
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
  };

  return (
    <div
      style={{
        width: "100%",
        height: "400px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
         <Typography sx={{  fontWeight: 'bold', fontSize: '20px', }}>
        Bill Status
        </Typography>

        {/* Filter Dropdown */}
        {showFilterDropdown && (
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "0.5rem",
              borderRadius: "0.25rem",
              border: "1px solid #ccc",
              background: "#fff",
            }}
          >
            <option value="all">Show All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>
        )}
      </div>

      <Bar data={data} options={options} />
    </div>
  );
};

export default BillStatusChart;
