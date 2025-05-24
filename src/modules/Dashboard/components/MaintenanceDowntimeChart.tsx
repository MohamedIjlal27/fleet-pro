import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Typography, IconButton, Popover, Box } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';
import FilterDropdown, { FilterType } from '../../../components/ui/FilterDropdown';
import { fetchWidgetData } from '../apis/apis';
import { DashboardFilterParams } from '../apis/apis';

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

interface MaintenanceDowntimeChartProps {
    filters?: {
        frequency?: string;
        garageGroup?: string;
        garageId?: number;
    };
}

const MaintenanceDowntimeChart: React.FC<MaintenanceDowntimeChartProps> = ({ filters = {} }) => {
    const [infoAnchorEl, setInfoAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [filterState, setFilterState] = useState<{ type: FilterType; selectedItems: string[] }>({
        type: 'both',
        selectedItems: []
    });
    const [chartLabels, setChartLabels] = useState<string[]>([]);
    const [downtimeData, setDowntimeData] = useState<number[]>([]);
    const [highlightedMonth, setHighlightedMonth] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    // Format labels based on frequency (similar to AssetAvailabilityChart)
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

    const handleInfoClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setInfoAnchorEl(event.currentTarget);
    };

    const handleInfoClose = () => {
        setInfoAnchorEl(null);
    };

    const handleFilterChange = (type: FilterType, selectedItems: string[]) => {
        setFilterState({ type, selectedItems });
    };

    // Handle cases when API call fails or returns empty data
    const resetToDefaultData = (frequency: string = 'monthly') => {
        console.log("No data available for frequency:", frequency);

        // Set empty data instead of dummy data
        setChartLabels([]);
        setDowntimeData([]);
        setHighlightedMonth(0);
    };

    // Fetch downtime data from the backend
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Merge global dashboard filters with our widget-specific parameter
                const apiParams: DashboardFilterParams = {
                    ...(filters || {}),
                    wg21: true
                };

                // Set a default frequency if none provided
                if (!apiParams.frequency) {
                    apiParams.frequency = 'monthly';
                }

                const response = await fetchWidgetData(apiParams);

                // Process the API response based on expected format
                if (response && Array.isArray(response)) {
                    // Find the specific downtime chart data in the response array
                    const widgetData = response.find(
                        (item: any) => item.wgAverageDowntimeChart !== undefined
                    )?.wgAverageDowntimeChart;

                    if (Array.isArray(widgetData) && widgetData.length > 0) {
                        // Extract data properly from the API response format
                        const extractedLabels: string[] = [];
                        const extractedValues: number[] = [];

                        widgetData.forEach(item => {
                            if (Array.isArray(item) && item.length === 2) {
                                const label = item[0]; // e.g., "2025-W12" or "2025-04"
                                const value = item[1]?.maintenance_hours || 0;

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

                            setChartLabels(extractedLabels);
                            setDowntimeData(extractedValues);
                            setHighlightedMonth(maxIndex >= 0 ? maxIndex : 0);
                        } else {
                            resetToDefaultData(apiParams.frequency);
                        }
                    } else {
                        resetToDefaultData(apiParams.frequency);
                    }
                } else {
                    resetToDefaultData(apiParams.frequency);
                }
            } catch (error) {
                console.error('Error fetching downtime data:', error);
                resetToDefaultData(filters.frequency);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [filters, filterState]); // Re-fetch when filters or filterState changes

    const infoOpen = Boolean(infoAnchorEl);

    // Configure ApexCharts options - adjust dynamically based on data
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
                borderRadius: 4,
                distributed: true,
                dataLabels: {
                    position: 'top',
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: false
        },
        annotations: {
            yaxis: [{
                y: Math.max(...downtimeData) * 0.8, // Set annotation at 80% of max value
                borderColor: '#7d8cff',
                strokeDashArray: 5,
                label: {
                    borderColor: 'transparent',
                    text: '',
                }
            }]
        },
        colors: downtimeData.map((_, index) =>
            index === highlightedMonth ? '#00B894' : '#a5f3e2' // Darker teal for highlighted, light mint for others
        ),
        yaxis: {
            min: 0,
            max: Math.max(...downtimeData, 0.1) * 1.2, // Set max to 120% of highest value, minimum of 0.1
            tickAmount: 4,
            labels: {
                formatter: (value) => value === 0 ? value.toString() : `${value.toFixed(1)} hr`,
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
            strokeDashArray: 0,
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
            custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
                const value = series[0][dataPointIndex];
                const label = chartLabels[dataPointIndex];
                return `<div class="custom-tooltip" style="background:#1e293b;border-radius:10px;padding:10px 15px;box-shadow:0 4px 12px rgba(0,0,0,0.1);font-weight:bold;color:white;font-size:20px;text-align:center;">${value.toFixed(1)} hr</div>`;
            },
            onDatasetHover: {
                highlightDataSeries: false,
            },
        },
        legend: {
            show: false
        }
    };

    const series = [
        {
            name: 'Downtime',
            data: downtimeData
        }
    ];

    return (
        <Box>
            <ChartHeader>
                <ChartTitle>
                    <Typography variant="h5" sx={{ fontSize: '28px', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center' }}>
                        Average Downtime
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
                                    This chart shows the average downtime for assets per {filters.frequency || 'month'}. Downtime refers to periods when assets are unavailable due to maintenance, repairs, or other issues.
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
                        type="bar"
                        height={300}
                    />
                )}
            </div>
        </Box>
    );
};

export default MaintenanceDowntimeChart;
