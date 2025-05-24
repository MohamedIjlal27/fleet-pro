import React from "react";
import { Card, Typography, Box, Grid, Divider } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DataItem {
  label: string;
  quantity: number;
  color: string;
}

interface StatusChartProps {
  data: DataItem[];
  name?: string;
  width?: number;
}

const StatusChart: React.FC<StatusChartProps> = ({ data, name = "", width = 1 }) => {
  const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);

  // Map the items and apply the specific colors based on labels from the image
  const chartItems = data.map(item => {
    let color = item.color;
    // Override colors to match the image exactly with swapped colors
    if (item.label === "In Use") {
      color = "#0078FF"; // Bright blue
    } else if (item.label === "Available") {
      color = "#41B8FF"; // Light blue
    } else if (item.label === "Reserved") {
      color = "#D591FF"; // Light purple
    } else if (item.label === "In Service") {
      color = "#FF91BB"; // Light purple
    }

    return { ...item, color };
  });

  const quantities = chartItems.map((item) => item.quantity);
  const colors = chartItems.map((item) => item.color);
  const labels = chartItems.map((item) => item.label);

  const chartData: ChartData<"doughnut"> = {
    labels,
    datasets: [
      {
        data: quantities,
        backgroundColor: colors,
        spacing: 1,
        borderWidth: 0,
        borderRadius: 1,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    cutout: "80%",
    rotation: 0,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true, // Ensure tooltips are enabled
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value}`; // Customize tooltip (optional)
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <Box p={1.5}>
      <Grid container spacing={1.5}>
        {/* Chart Section */}
        <Grid
          item
          xs={12}
          sm={width === 2 ? 6 : 12} // Adjust layout based on 'width' prop
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            position="relative"
            width="100%"
            height="auto"
            maxWidth={{ xs: "180px", sm: "240px" }} // Adjusted to match image
            maxHeight={{ xs: "180px", sm: "240px" }} // Adjusted to match image
            margin="0 auto"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Doughnut data={chartData} options={options} />
            {/* Centered Text */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              margin="auto"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Typography
                variant="caption"
                color="rgba(102, 102, 102, 1)"
                fontWeight="400"
                fontSize={16}
                sx={{
                  maxWidth: "100px",
                  whiteSpace: "normal",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 1,
                  textOverflow: "ellipsis",
                  textAlign: "center",
                  mb: 0.5,
                }}
              >
                Fleet
              </Typography>
              <Typography
                variant="h4"
                fontWeight="600"
                color="black"
                fontSize={36}
              >
                {totalQuantity}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Legend Section */}
        <Grid
          item
          xs={12}
          sm={width === 2 ? 6 : 12}
          sx={{
            maxHeight: { xs: 150, sm: 200 }, // Responsive max height
            overflow: "visible", // Enable scrolling for overflow
            px: 1, // Padding for better spacing
          }}
        >
          {chartItems.map((item, index) => {
            // Calculate the percentage for each item
            const percentage =
              totalQuantity > 0
                ? ((item.quantity / totalQuantity) * 100).toFixed(1)
                : "0.0"; // Always show one decimal place

            return (
              <div key={index}>
                <Grid container alignItems="center" sx={{ mb: 1.5 }}>
                  {/* Color Box */}
                  <Grid item xs={1} display="flex" justifyContent="start">
                    <Box
                      width={16}
                      height={16}
                      bgcolor={item.color}
                      borderRadius="50%"
                    ></Box>
                  </Grid>

                  {/* Label and Quantity */}
                  <Grid item xs={5} ml={1}>
                    <Typography
                      variant="body2"
                      fontWeight="500"
                      color="#0A1224"
                      fontSize={14}
                      noWrap
                    >
                      {item.label}
                    </Typography>
                  </Grid>

                  {/* Quantity and Percentage Section */}
                  <Grid
                    item
                    xs={4}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    {/* Quantity */}
                    <Typography
                      variant="body2"
                      fontWeight="500"
                      color="#0A1224"
                      fontSize={14}
                    >
                      {item.quantity}
                    </Typography>

                    {/* Percentage with Fixed Width */}
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      color="#0A1224"
                      fontSize={14}
                      sx={{ minWidth: "65px", textAlign: "right", fontWeight: 600 }} // Fixed width for percentage
                    >
                      {percentage}%
                    </Typography>
                  </Grid>
                </Grid>

                {/* Divider for all items except the last one */}
                {index !== data.length - 1 && <Divider sx={{ my: 1 }} />}
              </div>
            );
          })}
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatusChart;
