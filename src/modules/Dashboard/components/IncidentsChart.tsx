import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Typography, IconButton, Popover, Box, Button, CircularProgress } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';
import { DashboardFilterParams, fetchWidgetData } from '../apis/apis';
import { format } from 'date-fns';

const ChartHeader = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '24px',
    width: '100%'
});

const ChartTitle = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
});

const AssetFilter = styled('div')({
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
});

// Define incident types based on the image
const incidentTypes = [
    'Total Incidents',
    'Idling',
    'Rough Drive',
    'Cornering',
    'Acceleration',
    'Speeding',
    'Braking'
];

interface IncidentsChartProps {
  filters?: DashboardFilterParams;
  showFilter?: boolean;
}

const IncidentsChart: React.FC<IncidentsChartProps> = ({filters, showFilter = false}) => {
    const [infoAnchorEl, setInfoAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [selectedIncident, setSelectedIncident] = useState('Total Incidents');
    const [filter, setFilter] = useState<string>("all");
    const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(showFilter); // Toggle filter dropdown visibility
    
    // API data states
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [incidentData, setIncidentData] = useState<number[]>([]);
    const [timeLabels, setTimeLabels] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [noData, setNoData] = useState<boolean>(false);

    const computedMax = Math.max(...incidentData, 10); // fallback to 10
    const yAxisMax = Math.ceil(computedMax * 1.2); // Add 20% buffer
    const dataMax = Math.max(...incidentData, 10);

    const handleInfoClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setInfoAnchorEl(event.currentTarget);
    };

    const handleInfoClose = () => {
        setInfoAnchorEl(null);
    };
    
    // Format labels based on frequency
    const formatTimeLabel = (label: string, frequency?: string) => {
        // If label is undefined or null, return a default value
        if (!label) {
            return 'Unknown';
        }

        let formattedLabel = label;

        // Format based on data format and frequency
        if (typeof label === 'string' && label.includes('W')) {
            // Weekly data - e.g. "2025-W12"
            try {
                const parts = label.split('-W');
                if (parts.length > 1) {
                    const weekNum = parts[1];
                    formattedLabel = `Week ${weekNum}`;
                }
            } catch (error) {
                console.warn('Error formatting weekly label:', error);
                formattedLabel = label;
            }
        } else if (label.match && label.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Daily data - e.g. "2025-04-15"
            try {
                const date = new Date(label);
                if (!isNaN(date.getTime())) {
                    formattedLabel = format(date, 'MMM d');
                }
            } catch (error) {
                console.warn('Error formatting daily label:', error);
                formattedLabel = label;
            }
        } else if (label.match && label.match(/^\d{4}-\d{2}$/)) {
            // Monthly data - e.g. "2025-04"
            try {
                const parts = label.split('-');
                if (parts.length > 1) {
                    const year = parts[0];
                    const month = parts[1];
                    const date = new Date(parseInt(year), parseInt(month) - 1);
                    formattedLabel = format(date, 'MMM yyyy');
                }
            } catch (error) {
                console.warn('Error formatting monthly label:', error);
                formattedLabel = label;
            }
        } else if (label.match && label.match(/^\d{4}$/)) {
            // Yearly data - e.g. "2025"
            formattedLabel = label; // Just the year
        }

        return formattedLabel;
    };
    
    // Fetch incident data from API
    useEffect(() => {
      const fetchIncidentData = async () => {
        try {
          setIsLoading(true);
          setError(null);
          setNoData(false);

          // Merge global dashboard filters with our widget-specific parameter
          const apiParams: DashboardFilterParams = {
            ...(filters || {}),
            wg25: true,
            wg25a: filter,
          };

          // Set a default frequency if none provided
          if (!apiParams.frequency) {
            apiParams.frequency = 'monthly';
          }

          // Make sure frequency matches expected backend values
          if (apiParams.frequency === 'mothly') {
            apiParams.frequency = 'monthly';
          }
          if (apiParams.frequency === 'yarly') {
            apiParams.frequency = 'yearly';
          }

          // Call API with merged parameters
          const responseData = await fetchWidgetData(apiParams);
          //console.log('fetchIncidentData response:', responseData);

          // Process the API response based on backend structure in dashboard.service.ts
          if (responseData && Array.isArray(responseData) && responseData.length > 0) {
            // The backend returns an array of objects, with one object containing our data:
            const widgetData = responseData.find(item => item.wgNumberOfIncidentsChart !== undefined)?.wgNumberOfIncidentsChart;

            if (Array.isArray(widgetData) && widgetData.length > 0) {
              // Extract data and labels from the API response
              const extractedLabels: string[] = [];
              const extractedData: number[] = [];

              widgetData.forEach(item => {
                const label = item.period;
                const value = item.count;

                // Format the label based on frequency setting
                const formattedLabel = formatTimeLabel(label, apiParams.frequency);

                extractedLabels.push(formattedLabel);
                extractedData.push(value);
              });

              if (extractedLabels.length > 0 && extractedData.length > 0) {
                setTimeLabels(extractedLabels);
                setIncidentData(extractedData);
              } else {
                console.warn('Number of Incidents: No valid data points found');
                setNoData(true);
              }
            } else {
              console.warn('Number of Incidents: Widget data not found or invalid format');
              setNoData(true);
            }
          } else {
            console.warn('Number of Incidents: Invalid API response format');
            setNoData(true);
          }
        } catch (err) {
          console.error('Error fetching incidents data:', err);
          setError('Failed to load equipment availability data');
          setNoData(true);
        } finally {
          setIsLoading(false);
        }
      };

      fetchIncidentData();
    }, [filters, filter]); // Re-fetch when filters change

    const handleIncidentChange = (incident: string) => {
        setSelectedIncident(incident);
        //console.log(`Incident filter changed to: ${incident}`);
    };

    const infoOpen = Boolean(infoAnchorEl);

    // Highlight June (index 5)
    const highlightedMonth = 5;

    // Configure the colors for the bars
    const barColors = incidentData.map((_, index) =>
        index === highlightedMonth ? '#F97316' : '#FEE2E2'
    );

    // Configure ApexCharts options
    const options: ApexOptions = {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: {
                show: false
            },
            fontFamily: 'Outfit, sans-serif',
            animations: {
                enabled: true
            }
        },
        plotOptions: {
            bar: {
                columnWidth: '60%',
                borderRadius: 3,
                dataLabels: {
                    position: 'top'
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        colors: barColors,
        xaxis: {
            categories: timeLabels,
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '14px',
                    fontWeight: 500
                },
                rotate: 0
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            min: 0,
            max: yAxisMax,
            tickAmount: 3,
            labels: {
                formatter: (value) => Math.round(value).toString(),
                style: {
                    colors: '#6B7280',
                    fontSize: '14px',
                    fontWeight: 500
                }
            }
        },
        grid: {
            borderColor: '#E5E7EB',
            strokeDashArray: 5,
            xaxis: {
                lines: {
                    show: false
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            }
        },
        annotations: {
            yaxis: [{
                y: dataMax,
                borderColor: '#6366F1',
                borderWidth: 1,
                strokeDashArray: 5,
                label: {
                    borderColor: '#6366F1',
                    style: {
                        background: 'transparent'
                    },
                    text: ''
                }
            }]
        },
        tooltip: {
            enabled: true,
            custom: function ({ seriesIndex, dataPointIndex, w }) {
                const value = w.globals.series[seriesIndex][dataPointIndex];
                return `<div style="
                    background: #121826; 
                    color: white; 
                    border-radius: 8px; 
                    padding: 8px 14px;
                    font-weight: 600;
                    font-size: 18px;
                    text-align: center;
                    margin: 0;
                ">
                    ${value}
                </div>`;
            }
        },
        states: {
            hover: {
                filter: {
                    type: 'none'
                }
            },
            active: {
                filter: {
                    type: 'none'
                }
            }
        }
    };

    const series = [{
        name: 'Incidents',
        data: incidentData
    }];

    return (
        <>
            <ChartHeader>
                {/* <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '16px', fontWeight: 400 }}>
                    Safety & Compliance
                </Typography> */}

                <ChartTitle>
                    <Typography variant="h5" sx={{ fontSize: '28px', fontWeight: 600, color: '#374151' }}>
                        Number of Incidents
                        <IconButton
                            size="small"
                            sx={{ ml: 1 }}
                            onClick={handleInfoClick}
                            className="MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeSmall css-lk7kvc-MuiButtonBase-root-MuiIconButton-root"
                        >
                            <InfoIcon sx={{ color: '#9CA3AF', fontSize: '24px' }} />
                        </IconButton>
                        <Popover
                            open={infoOpen}
                            anchorEl={infoAnchorEl}
                            onClose={handleInfoClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'center',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                            }}
                        >
                            <Box sx={{ p: 2, maxWidth: '300px' }}>
                                <Typography variant="body2" color="text.secondary">
                                    This chart shows the number of safety incidents reported each month. The horizontal dashed line indicates the average incident threshold (10).
                                </Typography>
                            </Box>
                        </Popover>
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
                        <option value="all">Total Incidents</option>
                        <option value="geofence">Geofences</option>
                        <option value="fuel.level">Fuel Level</option>
                        <option value="speed.control">Speed Control</option>
                        <option value="immobillize">Immobillize</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="idle">Idle</option>
                        <option value="crash">Impact Sensing</option>
                        <option value="tamper">Tamper</option>
                        <option value="adas.*">AI Dash Cam - ADAS</option>
                        <option value="dsm.*">AI Dash Cam - DSM</option>
                      </select>
                    )}

                    {/* <AssetFilter>
                        <Box sx={{ position: 'relative' }}>
                            <Button
                                variant="outlined"
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    backgroundColor: '#F1F3F5',
                                    color: '#374151',
                                    border: 'none',
                                    padding: '8px 16px',
                                    '&:hover': {
                                        backgroundColor: '#E5E7EB',
                                        border: 'none',
                                    }
                                }}
                            >
                                {selectedIncident}
                            </Button>
                            <Popover
                                open={Boolean(anchorEl)}
                                anchorEl={anchorEl}
                                onClose={() => setAnchorEl(null)}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'center',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'center',
                                }}
                                PaperProps={{
                                    sx: {
                                        borderRadius: '16px',
                                        boxShadow: '0px 4px 25px rgba(0, 0, 0, 0.08)',
                                        overflow: 'hidden',
                                        width: '200px'
                                    }
                                }}
                            >
                                <Box sx={{ backgroundColor: 'white', py: 1 }}>
                                    {incidentTypes.map((incident) => (
                                        <Typography
                                            key={incident}
                                            sx={{
                                                padding: '12px 16px',
                                                fontSize: '16px',
                                                color: '#4B5563',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    backgroundColor: '#F9FAFB'
                                                }
                                            }}
                                            onClick={() => {
                                                handleIncidentChange(incident);
                                                setAnchorEl(null);
                                            }}
                                        >
                                            {incident}
                                        </Typography>
                                    ))}
                                </Box>
                            </Popover>
                        </Box>
                    </AssetFilter> */}
                </ChartTitle>
            </ChartHeader>

            <div style={{ flex: 1, marginTop: '10px', width: '100%' }}>
              {isLoading ? (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '300px'
                }}>
                    <CircularProgress />
                </Box>
              ) : error ? (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '300px'
                }}>
                    <Typography color="error">{error}</Typography>
                </Box>
              ) : noData || incidentData.length === 0 ? (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '300px'
                }}>
                    <Typography>No data available for the selected filters</Typography>
                </Box>
              ) : (
                <Chart
                    options={options}
                    series={series}
                    type="bar"
                    height="100%"
                />
              )}
            </div>
        </>
    );
};

export default IncidentsChart;
