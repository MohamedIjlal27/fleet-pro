import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Typography, IconButton, Popover, Box, Button, CircularProgress } from '@mui/material';
import { fetchWidgetData, DashboardFilterParams } from '../apis/apis';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';
import FilterDropdown, { FilterType } from '../../../components/ui/FilterDropdown';
import { format } from 'date-fns';

// const AssetAvailabilityWrapper = styled('div')({
//     background: '#fff',
//     borderRadius: '16px',
//     padding: '24px',
//     boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
//     width: '100%',
//     height: '100%'
// });

const ChartHeader = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '16px'
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

// Define incident types
const incidentTypes = [
    'Total Incidents',
    'Idling',
    'Rough Driving',
    'Cornering',
    'Acceleration',
    'Speeding',
    'Braking'
];

interface AssetAvailabilityChartProps {
    filters?: DashboardFilterParams;
}

const AssetAvailabilityChart: React.FC<AssetAvailabilityChartProps> = ({ filters }) => {
    const [filterType, setFilterType] = useState<FilterType>('assets');
    const [selectedIncident, setSelectedIncident] = useState('Total Incidents');
    const [infoAnchorEl, setInfoAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    // API data states
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [equipmentData, setEquipmentData] = useState<number[]>([]);
    const [timeLabels, setTimeLabels] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [noData, setNoData] = useState<boolean>(false);

    const handleInfoClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setInfoAnchorEl(event.currentTarget);
    };

    const handleInfoClose = () => {
        setInfoAnchorEl(null);
    };

    const infoOpen = Boolean(infoAnchorEl);

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

    // Fetch equipment availability data from API
    useEffect(() => {
        const fetchEquipmentData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                setNoData(false);

                console.log('Fetching asset availability data with filters:', filters);

                // Merge global dashboard filters with our widget-specific parameter
                const apiParams: DashboardFilterParams = {
                    ...(filters || {}),
                    wg15: true // Always enable this widget's data for Asset Availability
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

                console.log('Requesting asset availability with frequency:', apiParams.frequency);

                // Call API with merged parameters
                const responseData = await fetchWidgetData(apiParams);
                console.log('Asset Availability API response:', responseData);

                // Process the API response based on backend structure in dashboard.service.ts
                if (responseData && Array.isArray(responseData) && responseData.length > 0) {
                    // The backend returns an array of objects, with one object containing our data:
                    // [{ "wgAssetAvailabilityChart": [["2025-W12", {"asset_availability": 100}], ...] }]
                    const widgetData = responseData.find(item => item.wgAssetAvailabilityChart !== undefined)?.wgAssetAvailabilityChart;

                    if (Array.isArray(widgetData) && widgetData.length > 0) {
                        // Extract data and labels from the API response
                        const extractedLabels: string[] = [];
                        const extractedData: number[] = [];

                        widgetData.forEach(item => {
                            if (Array.isArray(item) && item.length === 2) {
                                const label = item[0]; // e.g. "2025-W12"
                                const value = item[1]?.asset_availability || 0;

                                // Format the label based on frequency setting
                                const formattedLabel = formatTimeLabel(label, apiParams.frequency);

                                extractedLabels.push(formattedLabel);
                                extractedData.push(value);
                            }
                        });

                        if (extractedLabels.length > 0 && extractedData.length > 0) {
                            setTimeLabels(extractedLabels);
                            setEquipmentData(extractedData);
                            console.log('Asset Availability Chart data loaded:', { labels: extractedLabels, data: extractedData });
                        } else {
                            console.warn('Asset Availability Chart: No valid data points found');
                            setNoData(true);
                        }
                    } else {
                        console.warn('Asset Availability Chart: Widget data not found or invalid format');
                        setNoData(true);
                    }
                } else {
                    console.warn('Asset Availability Chart: Invalid API response format');
                    setNoData(true);
                }
            } catch (err) {
                console.error('Error fetching equipment availability data:', err);
                setError('Failed to load equipment availability data');
                setNoData(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEquipmentData();
    }, [filters]); // Re-fetch when filters change

    const handleFilterChange = (type: FilterType, selectedItems: string[]) => {
        setFilterType(type);
        console.log(`Filter changed to: ${type}`);
    };

    const handleIncidentChange = (incident: string) => {
        setSelectedIncident(incident);
        console.log(`Incident filter changed to: ${incident}`);
    };

    // Configure ApexCharts options
    const options: ApexOptions = {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: {
                show: false
            },
            fontFamily: 'Outfit, sans-serif',
        },
        plotOptions: {
            bar: {
                borderRadius: 10,
                columnWidth: '75%',
                dataLabels: {
                    position: 'top',
                },
            },
        },
        dataLabels: {
            enabled: false,
            formatter: function (val) {
                return val + "%";
            },
            offsetY: -20,
            style: {
                fontSize: '12px',
                colors: ["#304758"]
            }
        },
        stroke: {
            show: true,
            width: 0,
            colors: ['transparent']
        },
        colors: ['#4B96FF'],
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: "vertical",
                shadeIntensity: 0.4,
                gradientToColors: ['#1967D2'],
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100]
            },
        },
        annotations: {
            // Dynamically set annotations based on the highest value in the dataset
            points: (() => {
                if (equipmentData.length > 0) {
                    // Find the index of the highest value
                    const maxIndex = equipmentData.indexOf(Math.max(...equipmentData));
                    // Use the corresponding label, or default to first label if none found
                    const xValue = timeLabels[maxIndex] || timeLabels[0];
                    const yValue = equipmentData[maxIndex] || 0;

                    return [{
                        x: xValue,
                        y: yValue,
                        marker: {
                            size: 8,
                            fillColor: '#1967D2',
                            strokeColor: '#FFFFFF',
                            strokeWidth: 2,
                            shape: 'circle'
                        }
                    }];
                }
                return []; // Return empty array if no data
            })(),
            xaxis: (() => {
                if (equipmentData.length > 0) {
                    // Find the index of the highest value
                    const maxIndex = equipmentData.indexOf(Math.max(...equipmentData));
                    // Use the corresponding label, or default to first label if none found
                    const xValue = timeLabels[maxIndex] || timeLabels[0];

                    return [{
                        x: xValue,
                        strokeDashArray: 5,
                        borderColor: '#1967D2',
                        label: {
                            borderColor: 'transparent',
                            style: {
                                color: '#fff',
                                background: 'transparent',
                            },
                            text: ''
                        }
                    }];
                }
                return []; // Return empty array if no data
            })()
        },
        yaxis: {
            min: 0,
            max: 100,
            tickAmount: 4, // Creates ticks at 0, 25, 50, 75, 100
            labels: {
                formatter: (value) => `${value}%`,
                style: {
                    colors: '#6B7280',
                    fontSize: '12px'
                }
            },
            axisTicks: {
                show: true
            },
            axisBorder: {
                show: true
            }
        },
        xaxis: {
            categories: timeLabels,
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '12px'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
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
        tooltip: {
            enabled: true,
            y: {
                formatter: function (val) {
                    return val + "%";
                }
            }
        }
    };

    const series = [
        {
            name: 'Asset Availability',
            data: equipmentData
        }
    ];

    return (
        <Box>
            <ChartHeader>
                <ChartTitle>
                    <Typography variant="h5" sx={{ fontSize: '28px', fontWeight: 600, color: '#374151' }}>
                        Asset Availability
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
                                    This chart displays the asset availability percentage by month. Higher percentages indicate better asset availability with fewer operational interruptions. The visual emphasizes overall availability trends and highlights any seasonal patterns.
                                </Typography>
                            </Box>
                        </Popover>
                    </Typography>

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

            <div style={{ marginTop: '35px', position: 'relative', minHeight: '300px' }}>
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
                ) : noData || equipmentData.length === 0 ? (
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
                        height={300}
                    />
                )}
            </div>
        </Box>
    );
};

export default AssetAvailabilityChart;
