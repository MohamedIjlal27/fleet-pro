import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Typography, IconButton, Popover, Box, CircularProgress } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';
import { fetchWidgetData, DashboardFilterParams } from '../apis/apis';
import { format } from 'date-fns';
import FilterDropdown, { FilterType } from '../../../components/ui/FilterDropdown';

// const AssetIdleRateWrapper = styled('div')({
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

interface AssetIdleRateChartProps {
    filters?: DashboardFilterParams;
}

interface FilterState {
    type: FilterType;
    selectedItems: string[];
}

const AssetIdleRateChart: React.FC<AssetIdleRateChartProps> = ({ filters = {} }) => {
    const [infoAnchorEl, setInfoAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [filterState, setFilterState] = useState<FilterState>({
        type: 'both',
        selectedItems: []
    });

    // API data states
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [idleRateData, setIdleRateData] = useState<number[]>([]);
    const [timeLabels, setTimeLabels] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

    const handleInfoClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setInfoAnchorEl(event.currentTarget);
    };

    const handleInfoClose = () => {
        setInfoAnchorEl(null);
    };

    const infoOpen = Boolean(infoAnchorEl);

    // Format labels based on frequency
    const formatTimeLabel = (label: string, frequency?: string): string => {
        try {
            if (label.includes('W')) {
                // Weekly data - e.g. "2025-W12"
                const weekNum = label.split('-W')[1];
                return `Week ${weekNum}`;
            } else if (label.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // Daily data - e.g. "2025-04-15"
                const date = new Date(label);
                return format(date, 'MMM d');
            } else if (label.match(/^\d{4}-\d{2}$/)) {
                // Monthly data - e.g. "2025-04"
                const [year, month] = label.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1);
                return format(date, 'MMM yyyy');
            } else if (label.match(/^\d{4}$/)) {
                // Yearly data - e.g. "2025"
                return label; // Just the year
            }
            return label;
        } catch (e) {
            console.error('Error formatting time label:', e);
            return label;
        }
    };

    // Fetch asset idle rate data from API
    useEffect(() => {
        const fetchIdleRateData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Merge global dashboard filters with our widget-specific parameter
                const apiParams: DashboardFilterParams = {
                    ...(filters || {}),
                    wg18: true // Enable this widget's data
                };

                // Set a default frequency if none provided
                if (!apiParams.frequency) {
                    apiParams.frequency = 'weekly';
                }

                // Call API with merged parameters
                const responseData = await fetchWidgetData(apiParams);

                // Process the API response
                if (responseData && Array.isArray(responseData) && responseData.length > 0) {
                    // The API response structure looks like:
                    // [{ "wgAverageIdleRateChart": [["2025-04-04", {"idle_time_hours": 49.57}], ...] }]
                    const widgetData = responseData[0]?.wgAverageIdleRateChart;

                    if (Array.isArray(widgetData) && widgetData.length > 0) {
                        // Extract data and labels from the API response
                        const extractedLabels: string[] = [];
                        const extractedData: number[] = [];

                        widgetData.forEach((item: any) => {
                            if (Array.isArray(item) && item.length === 2) {
                                const label = item[0]; // e.g. "2025-04-04"
                                const value = item[1]?.idle_time_hours || 0;

                                // Format the label based on frequency setting
                                const formattedLabel = formatTimeLabel(label, apiParams.frequency);

                                extractedLabels.push(formattedLabel);
                                extractedData.push(value);
                            }
                        });

                        if (extractedLabels.length > 0 && extractedData.length > 0) {
                            setTimeLabels(extractedLabels);
                            setIdleRateData(extractedData);

                            // Find the index with the highest idle rate to highlight
                            const maxIndex = extractedData.indexOf(Math.max(...extractedData));
                            setHighlightedIndex(maxIndex >= 0 ? maxIndex : 0);

                            console.log('Asset Idle Rate Chart data loaded:', {
                                labels: extractedLabels,
                                data: extractedData,
                                highlightedIndex: maxIndex
                            });
                        } else {
                            setEmptyData();
                        }
                    } else {
                        setEmptyData();
                    }
                } else {
                    setEmptyData();
                }
            } catch (err) {
                console.error('Error fetching asset idle rate data:', err);
                setError('Failed to load asset idle rate data');
                setEmptyData();
            } finally {
                setIsLoading(false);
            }
        };

        fetchIdleRateData();
    }, [filters]); // Re-fetch when filters change

    // Set empty data when API fails or returns no data
    const setEmptyData = () => {
        setTimeLabels([]);
        setIdleRateData([]);
        setHighlightedIndex(-1);
        setError('No data available');
    };

    // Only render chart if we have actual data
    const hasData = idleRateData.length > 0;

    // Create custom bar colors array
    const barColors = hasData ? idleRateData.map((_, index: number) =>
        index === highlightedIndex ? '#047857' : '#10b981' // Emerald-700 for highlighted, Emerald-500 for others
    ) : [];

    const series = hasData ? [
        {
            name: 'Idle Rate',
            type: 'area',
            data: idleRateData,
            curve: 'smooth'
        },
        {
            name: 'Idle Rate',
            type: 'column',
            data: idleRateData,
            colors: barColors,
            columnWidth: '60%',
        }
    ] : [];

    // Configure ApexCharts options
    const options: ApexOptions = {
        chart: {
            type: 'line',
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
                borderRadius: 5, // Rounded column tops
                borderRadiusApplication: 'end', // Only round the top of the columns
                colors: {
                    ranges: [{
                        from: 0,
                        to: 100,
                        color: '#10b981' // Emerald-500 for non-selected bars
                    }]
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: [3, 0], // Line width for series[0] (line), 0 width for series[1] (bar)
            colors: ['#10B981'], // Main teal color for line
            lineCap: 'round',
        },
        fill: {
            type: ['gradient', 'gradient'],
            opacity: [0.3, 1],
            gradient: {
                shade: 'light',
                type: "vertical",
                shadeIntensity: 0.4,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                inverseColors: false,
                stops: [0, 100],
                colorStops: [
                    [
                        {
                            offset: 0,
                            color: '#ECFDF5', // Light teal
                            opacity: 0.8
                        },
                        {
                            offset: 100,
                            color: '#ECFDF5', // Light teal
                            opacity: 0.2
                        }
                    ],
                    [
                        {
                            offset: 0,
                            color: '#10B981', // Teal
                            opacity: 1
                        },
                        {
                            offset: 100,
                            color: '#34D399', // Light teal
                            opacity: 0.8
                        }
                    ]
                ]
            }
        },
        markers: {
            size: 6,
            colors: ['#FFFFFF'],
            strokeColors: '#10B981', // Updated to match line color
            strokeWidth: 3,
            hover: {
                size: 8
            }
        },
        yaxis: {
            min: 0,
            max: function (max: number) {
                // Dynamically set the max value based on data
                // Round up to the nearest multiple of 10 and add some padding
                return Math.ceil(max * 1.2 / 10) * 10;
            },
            tickAmount: 4,
            labels: {
                formatter: function (value: number) {
                    return `${value.toFixed(1)} hr`;
                },
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
            categories: timeLabels.length > 0 ? timeLabels : [],
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
            shared: true,
            intersect: false,
            custom: function (options: { series: any; seriesIndex: any; dataPointIndex: any; w: any }) {
                const value = options.series[0][options.dataPointIndex];
                return `<div class="custom-tooltip" style="
                    background: white; 
                    border-radius: 10px; 
                    padding: 10px 15px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    font-weight: bold;
                    font-size: 20px;
                    text-align: center;
                ">
                    ${value.toFixed(1)} hr
                </div>`;
            }
        },
        annotations: {
            // No static annotations
        },
        legend: {
            show: false
        },
        colors: ['#047857', '#10b981'] // Emerald-700 for line, Emerald-500 for bars
    };

    const handleFilterChange = (type: FilterType, selectedItems: string[]) => {
        setFilterState({ type, selectedItems });
        // You can update your API call here with the new filter values
        // For now, we'll just update the state
    };

    return (
        <Box>
            <ChartHeader>
                <ChartTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="h5" sx={{ fontSize: '28px', fontWeight: 600, color: '#374151' }}>
                            Average Idle Rate
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <FilterDropdown
                                onFilterChange={handleFilterChange}
                                defaultType={filterState.type}
                                defaultSelected={filterState.selectedItems}
                            />
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
                                        This chart displays the average idle time of assets in hours. Lower idle hours indicate better asset utilization. The highlighted bar shows the period with the highest idle rate.
                                    </Typography>
                                </Box>
                            </Popover>
                        </Box>
                    </Box>
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
                ) : error || !hasData ? (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '300px'
                    }}>
                        <Typography sx={{ color: '#6B7280', fontWeight: 500 }}>
                            {error || 'No data available'}
                        </Typography>
                    </Box>
                ) : (
                    <Chart
                        options={options}
                        series={series}
                        type="area"
                        height={300}
                    />
                )}
            </div>
        </Box>
    );
};

export default AssetIdleRateChart;
