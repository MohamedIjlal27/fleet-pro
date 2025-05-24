import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Typography, IconButton, Popover, Box } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';
import FilterDropdown, { FilterType } from '../../../components/ui/FilterDropdown';
import { fetchWidgetData } from '../apis/apis';
import { DashboardFilterParams } from '../apis/apis';

// const MaintenanceCostWrapper = styled('div')({
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

interface MaintenanceCostAreaChartProps {
    filters?: {
        frequency?: string;
        garageGroup?: string;
        garageId?: number;
    };
}

const MaintenanceCostAreaChart: React.FC<MaintenanceCostAreaChartProps> = ({ filters = {} }) => {
    const [infoAnchorEl, setInfoAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [filterState, setFilterState] = useState<{ type: FilterType; selectedItems: string[] }>({
        type: 'both',
        selectedItems: []
    });
    const [chartLabels, setChartLabels] = useState<string[]>([]);
    const [costData, setCostData] = useState<number[]>([]);
    const [highlightedMonth, setHighlightedMonth] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    // Format labels based on frequency (similar to MaintenanceDowntimeChart)
    const formatTimeLabel = (label: string, frequency?: string) => {
        let formattedLabel = label;

        // Format based on data format and frequency
        if (label.includes('W')) {
            // Weekly data - e.g. "2025-W12"
            const weekNum = label.split('-W')[1];
            formattedLabel = `Week ${weekNum}`;
        } else if (label.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Daily data - e.g. "2025-04-15"
            const date = new Date(label);
            formattedLabel = `${date.getDate()}/${date.getMonth() + 1}`; // DD/MM format
        } else if (label.match(/^\d{4}-\d{2}$/)) {
            // Monthly data - e.g. "2025-04"
            const [year, month] = label.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            formattedLabel = monthNames[parseInt(month) - 1] || label;
        } else if (label.match(/^\d{4}$/)) {
            // Yearly data - e.g. "2025"
            formattedLabel = label; // Just the year
        }

        return formattedLabel;
    };

    // Fetch maintenance cost data from the backend
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Merge global dashboard filters with our widget-specific parameter
                const apiParams: DashboardFilterParams = {
                    ...(filters || {}),
                    wg22: true // Request average maintenance cost chart data
                };

                // Set a default frequency if none provided
                if (!apiParams.frequency) {
                    apiParams.frequency = 'monthly';
                }

                // Use frequency directly as provided - no mapping needed
                console.log(`Using frequency directly from UI: ${apiParams.frequency}`);

                console.log(`Requesting maintenance cost data with frequency: ${apiParams.frequency}`);

                const response = await fetchWidgetData(apiParams);
                console.log(`Maintenance Cost Data (${apiParams.frequency} frequency):`, response);

                // Process the API response based on expected format
                if (response && Array.isArray(response)) {
                    // Find the specific maintenance cost chart data in the response array
                    const widgetData = response.find(
                        (item: any) => item.wgAverageMaintenanceCostChart !== undefined
                    )?.wgAverageMaintenanceCostChart;

                    if (Array.isArray(widgetData) && widgetData.length > 0) {
                        // Extract data properly from the API response format
                        const extractedLabels: string[] = [];
                        const extractedValues: number[] = [];

                        widgetData.forEach(item => {
                            if (Array.isArray(item) && item.length === 2) {
                                const label = item[0]; // e.g., "2025-W12" or "2025-04"
                                const value = item[1]?.maintenance_cost || 0;

                                // Format the label based on frequency
                                const formattedLabel = formatTimeLabel(label, apiParams.frequency);

                                extractedLabels.push(formattedLabel);
                                extractedValues.push(value);
                            }
                        });

                        if (extractedLabels.length > 0 && extractedValues.length > 0) {
                            // Find the highest value to highlight it
                            let maxIndex = 0;
                            const maxValue = Math.max(...extractedValues);
                            if (maxValue > 0) {
                                maxIndex = extractedValues.indexOf(maxValue);
                            }

                            console.log("Chart data from API:", {
                                labels: extractedLabels,
                                values: extractedValues,
                                maxIndex
                            });

                            setChartLabels(extractedLabels);
                            setCostData(extractedValues);
                            setHighlightedMonth(maxIndex >= 0 ? maxIndex : 0);
                        } else {
                            console.warn("Maintenance Cost Chart: No valid data points extracted");
                            resetToDefaultData(apiParams.frequency);
                        }
                    } else {
                        console.warn("Maintenance Cost Chart: Widget data not found or invalid format");
                        resetToDefaultData(apiParams.frequency);
                    }
                } else {
                    console.warn("Maintenance Cost Chart: Invalid API response format");
                    resetToDefaultData(apiParams.frequency);
                }
            } catch (error) {
                console.error('Error fetching maintenance cost data:', error);
                resetToDefaultData(filters.frequency);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [filters, filterState]);

    // Handle cases when API call fails or returns empty data
    const resetToDefaultData = (frequency: string = 'monthly') => {
        console.log("No data available for frequency:", frequency);

        // Set empty data instead of dummy data
        setChartLabels([]);
        setCostData([]);
        setHighlightedMonth(0);
    };

    const handleInfoClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setInfoAnchorEl(event.currentTarget);
    };

    const handleInfoClose = () => {
        setInfoAnchorEl(null);
    };

    const handleFilterChange = (type: FilterType, selectedItems: string[]) => {
        setFilterState({ type, selectedItems });
    };

    const infoOpen = Boolean(infoAnchorEl);

    // Configure ApexCharts options - dynamic based on data
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
                distributed: false,
                dataLabels: {
                    position: 'top',
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: [3, 0], // Line width for series[0] (line), 0 width for series[1] (bar)
            colors: ['#FF9B73'], // Main orange color for line
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
                            color: '#FEE8E0', // Light orange
                            opacity: 0.8
                        },
                        {
                            offset: 100,
                            color: '#FEE8E0', // Light orange
                            opacity: 0.2
                        }
                    ],
                    [
                        {
                            offset: 0,
                            color: '#FF7A50', // Orange
                            opacity: 1
                        },
                        {
                            offset: 100,
                            color: '#FFDED0', // Light orange
                            opacity: 0.8
                        }
                    ]
                ]
            }
        },
        colors: costData.map((_, index) =>
            index === highlightedMonth ? '#FF7A50' : '#FFDED0' // Darker orange for highlighted, light peach for others
        ),
        markers: {
            size: 5,
            colors: ['#FFFFFF'],
            strokeColors: '#FF7A50', // Match line color
            strokeWidth: 2,
            hover: {
                size: 7
            }
        },
        yaxis: {
            min: 0,
            max: Math.max(...costData, 0.1) * 1.2, // Set max to 120% of highest value
            tickAmount: 3,
            labels: {
                formatter: (value) => `$ ${value}`,
                style: {
                    colors: '#6B7280',
                    fontSize: '14px'
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
            categories: chartLabels,
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '14px'
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
            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                const value = series[0][dataPointIndex];
                const label = chartLabels[dataPointIndex];
                return `<div class="custom-tooltip" style="
                    background: white; 
                    border-radius: 10px; 
                    padding: 10px 15px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    font-weight: bold;
                    color: #1e293b;
                    font-size: 20px;
                    text-align: center;
                ">
                    $ ${value}
                </div>`;
            }
        },
        legend: {
            show: false
        }
    };

    const series = [
        {
            name: 'Cost',
            type: 'line',
            data: costData
        },
        {
            name: 'Cost',
            type: 'column',
            data: costData
        }
    ];

    return (
        <Box>
            <ChartHeader>
                {/* <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '16px', fontWeight: 400 }}>
                    Maintenance
                </Typography> */}

                <ChartTitle>
                    <Typography variant="h5" sx={{ fontSize: '28px', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center' }}>
                        Average Maintenance Cost
                        <IconButton
                            size="small"
                            sx={{ ml: 1 }}
                            onClick={handleInfoClick}
                            className="MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeSmall"
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
                                    This chart displays the average {filters.frequency || 'monthly'} maintenance cost per vehicle. It shows trends over time and helps identify patterns in maintenance spending.
                                </Typography>
                            </Box>
                        </Popover>
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FilterDropdown
                            onFilterChange={handleFilterChange}
                            defaultType={filterState.type}
                            defaultSelected={filterState.selectedItems}
                        />
                    </Box>
                </ChartTitle>
            </ChartHeader>

            <div style={{ marginTop: '35px' }}>
                {loading ? (
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography>Loading chart data...</Typography>
                    </div>
                ) : (
                    <Chart
                        options={options}
                        series={series}
                        type="line"
                        height={300}
                    />
                )}
            </div>
        </Box>
    );
};

export default MaintenanceCostAreaChart;
