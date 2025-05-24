import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Typography, IconButton, Popover, Box, CircularProgress } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';
import FilterDropdown, { FilterType } from '../../../components/ui/FilterDropdown';
import { fetchWidgetData, DashboardFilterParams } from '../apis/apis';
import { format } from 'date-fns';

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

interface AssetUtilizationChartProps {
    filters?: DashboardFilterParams;
}

const AssetUtilizationChart: React.FC<AssetUtilizationChartProps> = ({ filters = {} }) => {
    const [filterType, setFilterType] = useState<FilterType>('both');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [infoAnchorEl, setInfoAnchorEl] = useState<HTMLButtonElement | null>(null);

    // API data states
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [utilizationData, setUtilizationData] = useState<number[]>([]);
    const [timeLabels, setTimeLabels] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

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

    // Fetch asset utilization data from API
    useEffect(() => {
        const fetchUtilizationData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Merge global dashboard filters with our widget-specific parameter
                const apiParams: DashboardFilterParams = {
                    ...(filters || {}),
                    wg16: true // Always enable this widget's data
                };

                // Set a default frequency if none provided
                if (!apiParams.frequency) {
                    apiParams.frequency = 'monthly';
                }

                // Call API with merged parameters
                const responseData = await fetchWidgetData(apiParams);

                // Process the API response based on the format shown in Swagger
                if (responseData && Array.isArray(responseData) && responseData.length > 0) {
                    // The API response structure looks like:
                    // [{ "wgAssetUtilizationChart": [["2025-W12", {"asset_utilization": 25.4}], ...] }]
                    const widgetData = responseData[0]?.wgAssetUtilizationChart;

                    if (Array.isArray(widgetData) && widgetData.length > 0) {
                        // Extract data and labels from the API response
                        const extractedLabels: string[] = [];
                        const extractedData: number[] = [];

                        widgetData.forEach((item: any) => {
                            if (Array.isArray(item) && item.length === 2) {
                                const label = item[0]; // e.g. "2025-W12"
                                const value = item[1]?.asset_utilization || 0;

                                // Format the label based on frequency setting
                                const formattedLabel = formatTimeLabel(label, apiParams.frequency);

                                extractedLabels.push(formattedLabel);
                                extractedData.push(value);
                            }
                        });

                        if (extractedLabels.length > 0 && extractedData.length > 0) {
                            setTimeLabels(extractedLabels);
                            setUtilizationData(extractedData);
                            console.log('Asset Utilization Chart data loaded:', {
                                labels: extractedLabels,
                                data: extractedData
                            });
                        } else {
                            setDefaultData();
                        }
                    } else {
                        setDefaultData();
                    }
                } else {
                    setDefaultData();
                }
            } catch (err) {
                console.error('Error fetching asset utilization data:', err);
                setError('Failed to load asset utilization data');
                setDefaultData();
            } finally {
                setIsLoading(false);
            }
        };

        fetchUtilizationData();
    }, [filters]); // Re-fetch when filters change

    // Set empty data when no real data is available
    const setDefaultData = () => {
        setTimeLabels([]);
        setUtilizationData([]);
    };

    const handleFilterChange = (type: FilterType, items: string[]) => {
        setFilterType(type);
        setSelectedItems(items);
        console.log(`Filter changed to: ${type}, selected items:`, items);
    };

    const chartOptions: ApexOptions = {
        chart: {
            type: 'area',
            height: 350,
            toolbar: {
                show: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'straight',
            width: 3,
            colors: ['#1967D2']
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.3,
                opacityTo: 0.1,
                stops: [0, 100]
            }
        },
        markers: {
            size: 6,
            colors: ['#FFFFFF'],
            strokeColors: '#1967D2',
            strokeWidth: 3,
            hover: {
                size: 8
            }
        },
        yaxis: {
            min: 0,
            max: 100,
            tickAmount: 4,
            labels: {
                formatter: function (val: number) {
                    return val + "%";
                }
            }
        },
        xaxis: {
            categories: timeLabels
        },
        tooltip: {
            enabled: true
        }
    };

    const getChartTitle = () => {
        switch (filterType) {
            case 'vehicles':
                return 'Vehicle Utilization';
            case 'assets':
                return 'Asset Utilization';
            default:
                return 'Vehicle Utilization';
        }
    };

    const chartSeries = [{
        name: getChartTitle(),
        data: utilizationData
    }];

    return (
        <Box>
            <ChartHeader>
                <ChartTitle>
                    <Typography variant="h5" sx={{ fontSize: '20px', fontWeight: 600, color: '#374151' }}>
                        {getChartTitle()} Trend
                        <IconButton
                            size="small"
                            sx={{ ml: 1 }}
                            onClick={handleInfoClick}
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
                                    This chart displays the asset utilization percentage over time. The trend line shows how efficiently assets are being used, with higher percentages indicating better utilization.
                                </Typography>
                            </Box>
                        </Popover>
                    </Typography>

                    <AssetFilter>
                        <FilterDropdown
                            onFilterChange={handleFilterChange}
                            defaultType="both"
                            simpleMode={false}
                        />
                    </AssetFilter>
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
                ) : utilizationData.length === 0 ? (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '300px'
                    }}>
                        <Typography variant="body1" color="text.secondary">No data available</Typography>
                    </Box>
                ) : (
                    <Chart
                        options={chartOptions}
                        series={chartSeries}
                        type="area"
                        height={300}
                    />
                )}
            </div>
        </Box>
    );
};

export default AssetUtilizationChart;
