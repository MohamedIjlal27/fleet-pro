import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import GaugeComponent from 'react-gauge-component';
// Comment out unused import for demo mode
// import axiosInstance from '../../../../../utils/axiosConfig';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SectionHeading } from '../../utils/SectionHeading';
import { IAnalyticsTabProps, IVehicle } from '../../interfaces/driver.interface';
import { fetchDriverBehavior } from "../../apis/apis"; // Import API function
import { Bar, Line } from 'react-chartjs-2';
import { LineChart } from '@mui/x-charts/LineChart';
import driven_kilometers_icon from "/src/assets/driver_behaviour/driven_kilometers_icon.svg";
import active_hours_icon from "/src/assets/driver_behaviour/active_hours_icon.svg";
import idle_time_icon from "/src/assets/driver_behaviour/idle_time_icon.svg";
import vehicles_used_icon from "/src/assets/driver_behaviour/vehicles_used_icon.svg";


export const BehaviourAnalytics: React.FC<IAnalyticsTabProps> = ({
  id,
}) => {
  const navigate = useNavigate();

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [driverBehaviorData, setDriverBehaviorDataData] = useState<any>(null);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState('yearly');
  const historicalData = driverBehaviorData?.historical_data || [];

  const [flippedStates, setFlippedStates] = useState<{ [key: string]: boolean }>({});
  const handleFlip = (key: string) => {
    setFlippedStates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const metrics = [
    { title: "Km Driven", icon: driven_kilometers_icon , value: `${analyticsData?.totalKmDriven || 0} km` },
    { title: "Active Hours", icon: active_hours_icon, value: `${analyticsData?.totalDrivingTime || 0} hrs` },
    { title: "Idle Time", icon: idle_time_icon, value: `${analyticsData?.totalIdlingTime || 0} hrs` },
  ];



  useEffect(() => {
    fetchAnalyticsData();
    loadDriverBehavior();
  }, [dateRange, fromDate, toDate]);

  const loadDriverBehavior = async () => {
    try {
      const data = await fetchDriverBehavior(dateRange, id);
      console.log(`fetchDriverBehavior dateRange = ${dateRange} | data`, data.data[0]);
      setDriverBehaviorDataData(data.data[0]);


      // const dummy = {
      //   "driver_id": "5",
      //   "overall_score": 70,
      //   "scores": {
      //     "idling": 100,
      //     "rough_drive": 10,
      //     "hard_braking": 100,
      //     "harsh_cornering": 72,
      //     "sudden_acceleration": 72
      //   },
      //   "event_counts": {
      //     "idling": 0,
      //     "rough_drive": 18,
      //     "hard_braking": 0,
      //     "harsh_cornering": 14,
      //     "sudden_acceleration": 14
      //   },
      //   "processed_at": 1737382816,
      //   "historical_data": [
      //     {
      //       "label": "Feb-2024",
      //       "scores": {
      //         "idling": 100,
      //         "rough_drive": 100,
      //         "hard_braking": 100,
      //         "harsh_cornering": 100,
      //         "sudden_acceleration": 100
      //       },
      //       "event_counts": {
      //         "idling": 0,
      //         "rough_drive": 0,
      //         "hard_braking": 0,
      //         "harsh_cornering": 0,
      //         "sudden_acceleration": 0
      //       },
      //       "overall_score": 96
      //     },
      //     {
      //       "label": "Mar-2024",
      //       "scores": {
      //         "idling": 100,
      //         "rough_drive": 100,
      //         "hard_braking": 100,
      //         "harsh_cornering": 100,
      //         "sudden_acceleration": 100
      //       },
      //       "event_counts": {
      //         "idling": 0,
      //         "rough_drive": 0,
      //         "hard_braking": 0,
      //         "harsh_cornering": 0,
      //         "sudden_acceleration": 0
      //       },
      //       "overall_score": 100
      //     },
      //     {
      //       "label": "Apr-2024",
      //       "scores": {
      //         "idling": 100,
      //         "rough_drive": 100,
      //         "hard_braking": 100,
      //         "harsh_cornering": 100,
      //         "sudden_acceleration": 100
      //       },
      //       "event_counts": {
      //         "idling": 0,
      //         "rough_drive": 0,
      //         "hard_braking": 0,
      //         "harsh_cornering": 0,
      //         "sudden_acceleration": 0
      //       },
      //       "overall_score": 100
      //     },
      //     {
      //       "label": "May-2024",
      //       "scores": {
      //         "idling": 100,
      //         "rough_drive": 100,
      //         "hard_braking": 100,
      //         "harsh_cornering": 100,
      //         "sudden_acceleration": 100
      //       },
      //       "event_counts": {
      //         "idling": 0,
      //         "rough_drive": 0,
      //         "hard_braking": 0,
      //         "harsh_cornering": 0,
      //         "sudden_acceleration": 0
      //       },
      //       "overall_score": 80
      //     },
      //     {
      //       "label": "Jun-2024",
      //       "scores": {
      //         "idling": 100,
      //         "rough_drive": 100,
      //         "hard_braking": 100,
      //         "harsh_cornering": 100,
      //         "sudden_acceleration": 100
      //       },
      //       "event_counts": {
      //         "idling": 0,
      //         "rough_drive": 0,
      //         "hard_braking": 0,
      //         "harsh_cornering": 0,
      //         "sudden_acceleration": 0
      //       },
      //       "overall_score": 100
      //     },
      //     {
      //       "label": "Jul-2024",
      //       "scores": {
      //         "idling": 100,
      //         "rough_drive": 100,
      //         "hard_braking": 100,
      //         "harsh_cornering": 100,
      //         "sudden_acceleration": 80
      //       },
      //       "event_counts": {
      //         "idling": 0,
      //         "rough_drive": 0,
      //         "hard_braking": 0,
      //         "harsh_cornering": 0,
      //         "sudden_acceleration": 0
      //       },
      //       "overall_score": 94
      //     },
      //     {
      //       "label": "Aug-2024",
      //       "scores": {
      //         "idling": 100,
      //         "rough_drive": 100,
      //         "hard_braking": 100,
      //         "harsh_cornering": 100,
      //         "sudden_acceleration": 100
      //       },
      //       "event_counts": {
      //         "idling": 0,
      //         "rough_drive": 0,
      //         "hard_braking": 0,
      //         "harsh_cornering": 0,
      //         "sudden_acceleration": 0
      //       },
      //       "overall_score": 100
      //     },
      //     {
      //       "label": "Sep-2024",
      //       "scores": {
      //         "idling": 100,
      //         "rough_drive": 100,
      //         "hard_braking": 100,
      //         "harsh_cornering": 100,
      //         "sudden_acceleration": 100
      //       },
      //       "event_counts": {
      //         "idling": 0,
      //         "rough_drive": 0,
      //         "hard_braking": 0,
      //         "harsh_cornering": 0,
      //         "sudden_acceleration": 0
      //       },
      //       "overall_score": 100
      //     },
      //     {
      //       "label": "Oct-2024",
      //       "scores": {
      //         "idling": 100,
      //         "rough_drive": 100,
      //         "hard_braking": 100,
      //         "harsh_cornering": 100,
      //         "sudden_acceleration": 100
      //       },
      //       "event_counts": {
      //         "idling": 0,
      //         "rough_drive": 0,
      //         "hard_braking": 0,
      //         "harsh_cornering": 0,
      //         "sudden_acceleration": 0
      //       },
      //       "overall_score": 100
      //     },
      //     {
      //       "label": "Nov-2024",
      //       "scores": {
      //         "idling": 100,
      //         "rough_drive": 100,
      //         "hard_braking": 100,
      //         "harsh_cornering": 100,
      //         "sudden_acceleration": 100
      //       },
      //       "event_counts": {
      //         "idling": 0,
      //         "rough_drive": 0,
      //         "hard_braking": 0,
      //         "harsh_cornering": 0,
      //         "sudden_acceleration": 0
      //       },
      //       "overall_score": 98
      //     },
      //     {
      //       "label": "Dec-2024",
      //       "scores": {
      //         "idling": 100,
      //         "rough_drive": 10,
      //         "hard_braking": 100,
      //         "harsh_cornering": 72,
      //         "sudden_acceleration": 72
      //       },
      //       "event_counts": {
      //         "idling": 0,
      //         "rough_drive": 18,
      //         "hard_braking": 0,
      //         "harsh_cornering": 14,
      //         "sudden_acceleration": 14
      //       },
      //       "overall_score": 47
      //     },
      //     {
      //       "label": "Jan-2025",
      //       "scores": {
      //         "idling": 100,
      //         "rough_drive": 100,
      //         "hard_braking": 100,
      //         "harsh_cornering": 100,
      //         "sudden_acceleration": 100
      //       },
      //       "event_counts": {
      //         "idling": 0,
      //         "rough_drive": 0,
      //         "hard_braking": 0,
      //         "harsh_cornering": 0,
      //         "sudden_acceleration": 0
      //       },
      //       "overall_score": 100
      //     }
      //   ],
      //   "driver": {
      //     "id": 5,
      //     "driverLicenseNumber": "51231231",
      //     "licenseExpirationDate": "2025-01-29T00:00:00.000Z",
      //     "licenseType": "Machinery",
      //     "user": {
      //       "firstName": "Tech",
      //       "lastName": "Henry",
      //       "picture": "https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fwww.gravatar.com%2Favatar%2F2c7d99fe281ecd3bcd65ab915bac6dd5%3Fs%3D250"
      //     }
      //   }
      // };
      // setDriverBehaviorDataData(dummy);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };


  const fetchAnalyticsData = async () => {
    try {
      const validFromDate = fromDate || new Date();
      const validToDate = toDate || new Date();

      console.log("analytics params (demo mode) =", {
        dateRange,
        fromDate: validFromDate.toISOString(),
        toDate: validToDate.toISOString(),
      });
      
      // Comment out API call for demo mode
      // const res = await axiosInstance.get(`/api/drivers/${id}/analytics`, {
      //   params: {
      //     dateRange,
      //     fromDate: validFromDate.toISOString(),
      //     toDate: validToDate.toISOString(),
      //   },
      // });
      // console.log("analytics api res =",res);
      // setAnalyticsData(res.data);
      
      const dummy = await getDummyAnalyticsData(dateRange);
      setAnalyticsData(dummy);
    } catch (error) {
      setAnalyticsData(null);
      console.log('Error fetching analytics data', error);
    }
  };

  const getDummyAnalyticsData = (dateRange: string) => {
    switch (dateRange) {
      case "daily":
        return {
          totalKmDriven: 120,
          totalActiveHours: 8,
          totalIdleTime: 1,
          vehiclesUsed: [{ vehicleId: "V003", startDate: "2025-01-12", endDate: "2025-01-13" },],
        };

      case "weekly":
        return {
          totalKmDriven: 750,
          totalActiveHours: 55,
          totalIdleTime: 10,
          vehiclesUsed: [
            { vehicleId: "V002", startDate: "2025-01-10", endDate: "2025-01-11" },
            { vehicleId: "V003", startDate: "2025-01-12", endDate: "2025-01-13" },],
        };

      case "monthly":
        return {
          totalKmDriven: 3200,
          totalActiveHours: 220,
          totalIdleTime: 25,
          vehiclesUsed: [{ vehicleId: "V001", startDate: "2025-01-08", endDate: "2025-01-09" },
          { vehicleId: "V002", startDate: "2025-01-10", endDate: "2025-01-11" },
          { vehicleId: "V003", startDate: "2025-01-12", endDate: "2025-01-13" },],
        };

      case "yearly":
        return {
          totalKmDriven: 38000,
          totalActiveHours: 2400,
          totalIdleTime: 300,
          vehiclesUsed: [
            { vehicleId: "V001", startDate: "2025-01-08", endDate: "2025-01-09" },
            { vehicleId: "V002", startDate: "2025-01-10", endDate: "2025-01-11" },
            { vehicleId: "V003", startDate: "2025-01-12", endDate: "2025-01-13" },
          ],
        };

      default:
        return {
          totalKmDriven: 0,
          totalActiveHours: 0,
          totalIdleTime: 0,
          vehiclesUsed: 0,
        };
    }
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
  };



  function humanize(str: string) {
    var i, frags = str.split('_');
    for (i = 0; i < frags.length; i++) {
      frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
    }
    return frags.join(' ');
  }

  const handleVehicleClick = (vehicleId: string) => {
    // navigate(`/vehicle/${vehicleId}`);
  };

  return (
    <Box p={2}>
      <Grid container spacing={2}>

        {/* Driver Behaviour */}
        <Grid item xs={5} spacing={2}>
          <Box
            p={3}
            className="rounded-lg shadow-sm"
            sx={{ marginBottom: '20px' }}
          >
            <SectionHeading title="Driver Behaviour" />
            {/* Filter */}

            <Grid container spacing={2} alignItems="center" sx={{ marginBottom: '8px' }}>
              {/* Date Range Cards */}
              {[
                { label: 'Day', value: 'daily' },
                { label: 'Week', value: 'weekly' },
                { label: 'Month', value: 'monthly' },
                { label: 'Year', value: 'yearly' }
              ].map((option) => (
                <Grid item xs={12} sm={3} key={option.value}>
                  <Card
                    className="shadow-sm"
                    sx={{
                      cursor: dateRange !== option.value ? 'pointer' : 'not-allowed',
                      transition: 'transform 0.3s, background-color 0.3s',
                      '&:hover': {
                        transform: dateRange !== option.value ? 'scale(1.05)' : '',
                        backgroundColor: dateRange !== option.value ? '#f3f4f6' : '#d1d5db', // Darker background for disabled card
                      },
                      backgroundColor: dateRange === option.value ? '#d1d5db' : 'transparent', // Dark background for selected option
                    }}
                    onClick={() => dateRange !== option.value && handleDateRangeChange(option.value)}
                  >
                    <CardContent>
                      <Typography variant="h6" align="center">
                        {option.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Overall Score */}
            <Box
              p={3}
              className="rounded-lg shadow-sm flex flex-col items-center"
              sx={{ marginBottom: '8px', backgroundColor: '' }}
            >
              {/* <Gauge
                  value={driverBehaviorData?.overall_score || 0}
                  startAngle={-90}
                  endAngle={90}
                  sx={(theme) => ({
                    width: 200,
                    height: 200,
                    [`& .${gaugeClasses.valueText}`]: {
                      fontSize: 40,
                    },
                    [`& .${gaugeClasses.valueArc}`]: {
                      fill: '#52b202',
                    },
                    [`& .${gaugeClasses.referenceArc}`]: {
                      fill: theme.palette.text.disabled,
                    },
                  })}
                /> */}
              <GaugeComponent
                type="semicircle"
                arc={{
                  width: 0.4,
                  padding: 0.005,
                  cornerRadius: 1,
                  subArcs: [
                    {
                      limit: 30,
                      color: '#EA4228', // Red for 0-30
                      showTick: true,
                      tooltip: {
                        text: 'Low score!',
                      },
                    },
                    {
                      limit: 70,
                      color: '#F5CD19', // Orange for 40-70
                      showTick: true,
                      tooltip: {
                        text: 'Medium score!',
                      },
                    },
                    {
                      limit: 100,
                      color: '#5BE12C', // Green for 70-100
                      showTick: true,
                      tooltip: {
                        text: 'High score!',
                      },
                    },
                  ],
                }}
                pointer={{ type: "arrow", elastic: true }}
                labels={{
                  valueLabel: {
                    formatTextValue: (value) => `${value}`, // Show score directly (no units)
                    matchColorWithArc: true,
                    style: {
                      fontSize: '30px',  // Font size set to 30px
                      textShadow: 'none', // No shadow
                    },

                  },
                  tickLabels: {
                    type: 'outer',
                    defaultTickValueConfig: {
                      formatTextValue: (value: any) => `${value}`, // Show ticks as score
                      style: { fontSize: 10 },
                    },
                    ticks: [
                      { value: 10 },
                      { value: 20 },
                      { value: 30 },
                      { value: 40 },
                      { value: 50 },
                      { value: 60 },
                      { value: 70 },
                      { value: 80 },
                      { value: 90 },
                      { value: 100 },
                    ],
                  },
                }}
                value={driverBehaviorData?.overall_score || 0} // Update the value of the score as needed
                minValue={0}  // Min score
                maxValue={100} // Max score
              />
              <Typography
                variant="body2"
                className="text-center mt-2 text-gray-500"
                sx={{ marginTop: 2 }}
              >
                Overall Score
              </Typography>

            </Box>


            {/* Score Section */}
            <Grid container spacing={2} sx={{ backgroundColor: '' }} >
              {driverBehaviorData?.scores && Object.entries(driverBehaviorData.scores).length > 0 ? (
                Object.entries(driverBehaviorData.scores).map(([key, value], index) => (
                  <Grid
                    key={key}
                    item
                    xs={12}
                    sm={4} 
                  >
                    <Box
                      p={3}
                      className=" rounded-lg shadow-sm flex flex-col items-center"
                      onClick={() => handleFlip(key)} // Flip the box on click
                      style={{
                        perspective: "1000px",
                        cursor: "pointer",
                      }}
                    >
                      <Box
                        style={{
                          position: "relative",
                          transformStyle: "preserve-3d",
                          transform: flippedStates[key] ? "rotateY(180deg)" : "rotateY(0deg)",
                          transition: "transform 0.6s",
                          width: "150px",
                          height: "150px",
                        }}
                      >
                        {/* Front Side */}
                        <Box
                          style={{
                            position: "absolute",
                            backfaceVisibility: "hidden",
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f8fafc",
                            borderRadius: "8px",
                            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          <Box position="relative" display="inline-flex">
                            <CircularProgress
                              variant="determinate"
                              value={value}
                              size={100}
                              thickness={5}
                              color="primary"
                            />
                            <Box
                              top={0}
                              left={0}
                              bottom={0}
                              right={0}
                              position="absolute"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Typography variant="h6" fontWeight="bold">
                                {value}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" className="text-center text-gray-500" sx={{ marginTop: 2 }}>
                            {humanize(key)}
                          </Typography>
                        </Box>

                        {/* Back Side */}
                        <Box
                          style={{
                            position: "absolute",
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          <Typography
                            variant="body2"
                            className="text-center text-gray-500"
                            sx={{ marginTop: 2 }}
                          >
                            Count: {driverBehaviorData.event_counts?.[key] || 0}
                          </Typography>
                          <Typography variant="body2" className="text-center text-gray-500">
                            {humanize(key)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  className="text-center"
                  sx={{ width: "100%" }}
                >
                  No driver behavior data available.
                </Typography>
              )}
            </Grid>

          </Box>
        </Grid>


        {/* Analytics Cards */}
        <Grid item xs={7}>
          {/* Row for the first three metrics */}
          <Grid container spacing={2}>
            {metrics.map((item, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Card className="shadow-sm">
                  <CardContent>
                    <Grid container alignItems="center">
                      {/* Icon Section */}
                      <Grid item>
                        {item.icon && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              width: 50,
                              height: 50,
                              borderRadius: "50%",
                              backgroundColor: "#E5E7EB", // Optional: Add a background color
                              marginRight: 16, // Add spacing between icon and text
                            }}
                          >
                            <img
                              src={item.icon}
                              alt={`${item.title} icon`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                        )}
                      </Grid>

                      {/* Text Section */}
                      <Grid item>
                        <Typography variant="h6" color="black">
                          {item.value}
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                          {item.title}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Row for vehiclesUsed */}
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <Grid item xs={12}>
              <Card className="shadow-sm">
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center", // Align items to the top
                    gap: 2, // Add spacing between sections
                  }}
                >
                  {/* Left Section: Icon and Vehicle Info */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      minWidth: "150px", // Set a fixed width for the left section
                      padding: "16px", // Optional: Add padding for spacing
                    }}
                  >
                    <Grid container alignItems="center">
                      {/* Icon Section */}
                      <Grid item >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: 50,
                            height: 50,
                            borderRadius: "50%",
                            backgroundColor: "#E5E7EB", // Optional: Add a background color
                            marginRight: 16, // Add spacing between icon and text
                          }}
                        >
                          <img
                            src={vehicles_used_icon}
                            alt={`icon`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                      </Grid>

                      {/* Text Section */}
                      <Grid item>
                        <Typography variant="h6" color="black">
                          {analyticsData?.vehiclesUsed?.length || 0}
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                          Vehicles Used
                        </Typography>
                      </Grid>
                    </Grid>
                  </div>

                  {/* Right Section: Scrollable Horizontal Grid */}
                  <div
                    style={{
                      flex: 1,
                      overflowX: "auto", // Enable horizontal scrolling
                      display: "flex",
                      gap: 16, // Spacing between cards
                    }}
                  >
                    {analyticsData?.vehiclesUsed?.length > 0 ? (
                      analyticsData.vehiclesUsed.map((vehicle: any) => (
                        <div
                          key={vehicle.vehicleId}
                          onClick={() => handleVehicleClick(vehicle.vehicleId)}
                          style={{
                            cursor: "pointer",
                            minWidth: "250px", // Set a fixed card width
                            flexShrink: 0, // Prevent shrinking when scrolling
                          }}
                        >
                          <Card
                            className="shadow-sm"
                            sx={{
                              backgroundColor: "lightgray",
                              transition: "background-color 0.3s, color 0.3s",
                              "&:hover": {
                                backgroundColor: "rgb(30, 41, 59)", // slate-800
                                color: "white",
                                "& .MuiTypography-body2": {
                                  color: "white",
                                },
                              },
                            }}
                          >
                            <CardContent>
                              <Typography variant="h6">
                                Vehicle ID: {vehicle.vehicleId}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                From: {new Date(vehicle.startDate).toLocaleDateString()}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                To:{" "}
                                {vehicle.endDate
                                  ? new Date(vehicle.endDate).toLocaleDateString()
                                  : "Present"}
                              </Typography>
                            </CardContent>
                          </Card>
                        </div>
                      ))
                    ) : (
                      <Typography>No vehicle usage data available.</Typography>
                    )}
                  </div>
                </CardContent>
              </Card>

            </Grid>
          </Grid>


          {/* Bar Chart */}

          <Card className="shadow-sm" sx={{ marginTop: 2 }}>
            <CardContent>
              <Box mt={4}>
                <Typography variant="h6" mb={3}>
                  Driver Behavior Trend
                </Typography>
                <Line
                  data={{
                    labels: historicalData.map((item) =>
                    dateRange === 'daily'
                    ? new Date(item.label).toLocaleString(undefined, {
                        // year: 'numeric',
                        // month: '2-digit',
                        // day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false, // Ensures 24-hour format
                      })
                    : item.label
                    ),// Use the `label` as x-axis labels
                    datasets: [
                      {
                        label: "Overall Score",  // Dataset label
                        data: historicalData.map((item) => item.overall_score),  // Use `overall_score` as y-axis data
                        backgroundColor: "rgba(54, 162, 235, 0.6)", // Line fill color
                        borderColor: "rgba(54, 162, 235, 1)", // Line border color
                        borderWidth: 2, // Line width
                        tension: 0.4, // Optional, adds curve to the line
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      x: {
                        beginAtZero: true, // Optional, if you want to ensure the X-axis starts at 0
                      },
                      y: {
                        beginAtZero: true, // Optional, if you want to ensure the Y-axis starts at 0
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>


      {/* Filters Section */}
      {/* <Grid item xs={12}>
          <Box
            p={3}
            className=" rounded-lg shadow-sm"
            sx={{ marginBottom: '20px' }}
          >
            <SectionHeading title="Filter Data" />
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    label="Date Range"
                  >
                    <MenuItem value="day">Day</MenuItem>
                    <MenuItem value="custom">Custom</MenuItem>
                    <MenuItem value="weekly">Week</MenuItem>
                    <MenuItem value="monthly">Month</MenuItem>
                    <MenuItem value="yearly">Year</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {dateRange === 'custom' && (
                <Grid item xs={12} sm={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="From Date"
                      value={fromDate}
                      onChange={(newValue: Date | null) =>
                        setFromDate(newValue)
                      }
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                    <DatePicker
                      label="To Date"
                      value={toDate}
                      onChange={(newValue: Date | null) => setToDate(newValue)}
                      slotProps={{ textField: { fullWidth: true } }}
                      sx={{ marginTop: '15px' }}
                    />
                  </LocalizationProvider>
                </Grid>
              )}
              <Grid item xs={12} sm={4}>
                <Button
                  variant="contained"
                  onClick={fetchAnalyticsData}
                  disabled={dateRange === 'custom' && (!fromDate || !toDate)}
                  sx={{
                    mt: { xs: 2, sm: 0 },
                    backgroundColor: '#1E293B',
                    '&:hover': { backgroundColor: '#111827' },
                  }}
                >
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid> */}

      {/* Vehicles Used List */}
      {/* <Grid item xs={12}>
          <Box
            p={3}
            className=" rounded-lg shadow-sm"
            sx={{ marginBottom: '20px' }}
          >
            <SectionHeading title="Vehicles Used" />
            {analyticsData && analyticsData.vehiclesUsed.length > 0 ? (
              <Grid container spacing={2}>
                {analyticsData.vehiclesUsed.map((vehicle: any) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={vehicle.vehicleId}
                    onClick={() => handleVehicleClick(vehicle.vehicleId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card
                      className="shadow-sm"
                      sx={{
                        transition: 'background-color 0.3s, color 0.3s',
                        '&:hover': {
                          backgroundColor: 'rgb(30, 41, 59)', // slate-800
                          color: 'white',
                          '& .MuiTypography-body2': {
                            color: 'white',
                          },
                        },
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6">
                          Vehicle ID: {vehicle.vehicleId}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          From:{' '}
                          {new Date(vehicle.startDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          To:{' '}
                          {vehicle.endDate
                            ? new Date(vehicle.endDate).toLocaleDateString()
                            : 'Present'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>No vehicle usage data available.</Typography>
            )}
          </Box>
        </Grid> */}

      {/* Driver Behaviour Alerts */}
      {/* <Grid item xs={12}>
          <Box
            p={3}
            className=" rounded-lg shadow-sm"
            sx={{ marginBottom: '20px' }}
          >
            <SectionHeading title="Driver Behaviour Alerts" />
            {analyticsData && analyticsData.behaviourAlerts.length > 0 ? (
              <Grid container spacing={2}>
                {analyticsData.behaviourAlerts.map(
                  (alert: any, index: number) => (
                    <Grid item xs={12} key={index}>
                      <Card className="shadow-sm">
                        <CardContent>
                          <Typography variant="h6">{alert.type}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            Date & Time:{' '}
                            {new Date(alert.dateTime).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Vehicle ID: {alert.vehicleId}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                )}
              </Grid>
            ) : (
              <Typography>No behaviour alerts available.</Typography>
            )}
          </Box>
        </Grid> */}

    </Box>
  );
};
