import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Avatar,
    IconButton,
    CircularProgress,
} from '@mui/material';
import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { fetchWidgetData, DashboardFilterParams } from '../apis/apis';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

interface DriverScores {
    idling: number;
    rough_drive: number;
    hard_braking: number;
    overspeeding: number;
    harsh_cornering: number;
    sudden_acceleration: number;
}

interface Driver {
    driver_id: number;
    organization_id: number;
    garage_id: number | null;
    garage_group: string | null;
    overall_score: number;
    scores: DriverScores;
    // For UI display purposes
    name?: string;
    image?: string;
}

interface TopPerformingDriversProps {
    filters?: DashboardFilterParams;
}

// Define the component
const TopPerformingDrivers: React.FC<TopPerformingDriversProps> = ({ filters }) => {
    // State for API data
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [selectedDriverIndex, setSelectedDriverIndex] = useState(0);

    // Track the last frequency we used to fetch data, to detect changes
    const [lastUsedFrequency, setLastUsedFrequency] = useState<string | undefined>(filters?.frequency);

    // Define the fetch function with useCallback to avoid infinite re-renders
    const fetchDriverData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('Fetching top performing drivers data with filters:', filters);

            // Merge global dashboard filters with our widget-specific parameter
            const apiParams: DashboardFilterParams = {
                ...(filters || {}),
                wg20: true // Use wg20 for top performing drivers chart
            };

            // Set a default frequency if none provided
            if (!apiParams.frequency) {
                apiParams.frequency = 'monthly';
            }

            // Update the last used frequency
            setLastUsedFrequency(apiParams.frequency);

            // Log all filters being used
            console.log('Top Performing Drivers using all filters:', apiParams);
            console.log('Current frequency:', apiParams.frequency);

            // Call API with merged parameters
            const responseData = await fetchWidgetData(apiParams);

            // Process the API response
            console.log('Raw API response:', responseData);

            try {
                if (responseData && Array.isArray(responseData) && responseData.length > 0) {
                    // Find the object containing wgGoodDriversChart
                    const topDriversObj = responseData.find(item => item && typeof item === 'object' && 'wgGoodDriversChart' in item);
                    const widgetData = topDriversObj?.wgGoodDriversChart;

                    console.log('wgGoodDriversChart data:', widgetData);

                    if (widgetData && typeof widgetData === 'object' &&
                        'top_drivers' in widgetData &&
                        Array.isArray(widgetData.top_drivers) &&
                        widgetData.top_drivers.length > 0) {
                        // Add UI display fields to each driver
                        const enhancedDrivers = widgetData.top_drivers.map((driver: Driver, index: number) => {
                            if (!driver || typeof driver !== 'object') {
                                console.warn('Invalid driver object:', driver);
                                return null;
                            }

                            return {
                                ...driver,
                                // Add placeholder names and images for UI display
                                name: `Driver ${driver.driver_id || 'Unknown'}`,
                                image: `/src/assets/admin/default-avatar-150x150.jpg`, // Different set of avatars than DriverBehaviour
                            };
                        }).filter(Boolean); // Remove any null entries

                        if (enhancedDrivers.length > 0) {
                            setDrivers(enhancedDrivers);
                            console.log('Top Performing Drivers data loaded:', enhancedDrivers);
                            console.log('Total drivers found:', enhancedDrivers.length);
                        } else {
                            console.warn('Top Performing Drivers: No valid drivers in the data');
                            setDrivers([]);
                        }
                    } else {
                        console.warn('Top Performing Drivers: No valid top_drivers array found');
                        setDrivers([]);
                    }
                } else {
                    console.warn('Top Performing Drivers: Invalid API response format');
                    setDrivers([]);
                }
            } catch (parseError) {
                console.error('Error parsing driver data:', parseError);
                setError('Failed to parse driver data');
                setDrivers([]);
            }
        } catch (err) {
            console.error('Error fetching top performing drivers data:', err);
            setError('Failed to load top performing drivers data');
            setDrivers([]);
        } finally {
            setIsLoading(false);
        }
    }, [filters]); // Include filters in the dependency array

    // Use effect to fetch data when filters change
    useEffect(() => {
        fetchDriverData();
    }, [fetchDriverData]); // Since fetchDriverData has filters in its dependency array, this will re-run when filters change

    // Additional effect to explicitly handle frequency changes
    useEffect(() => {
        // If the frequency has changed from the last known value, refetch data
        if (filters?.frequency !== lastUsedFrequency && lastUsedFrequency !== undefined) {
            console.log('Frequency changed from', lastUsedFrequency, 'to', filters?.frequency);
            fetchDriverData();
        }
    }, [filters?.frequency, lastUsedFrequency, fetchDriverData]);

    // Get the current driver's score data for the radar chart
    const getCurrentDriverScores = () => {
        if (drivers.length === 0 || selectedDriverIndex >= drivers.length) {
            return [0, 0, 0, 0, 0, 0]; // Default empty data
        }

        const currentDriver = drivers[selectedDriverIndex];
        // Return scores in the same order as the labels
        return [
            currentDriver.scores?.idling || 0,
            currentDriver.scores?.rough_drive || 0,
            currentDriver.scores?.hard_braking || 0,
            currentDriver.scores?.overspeeding || 0,
            currentDriver.scores?.harsh_cornering || 0,
            currentDriver.scores?.sudden_acceleration || 0,
        ];
    };

    // Create radar chart data from the current driver using exact backend naming
    const radarData = {
        labels: [
            'Idling',
            'Rough',
            'Braking',
            'Speed',
            'Cornering',
            'Acceleration',
        ],
        datasets: [
            {
                label: 'Score',
                data: getCurrentDriverScores(),
                backgroundColor: 'rgba(34, 197, 94, 0.2)', // green-500 w/ opacity
                borderColor: '#22C55E',
                borderWidth: 2,
                pointBackgroundColor: '#22C55E',
                pointRadius: 4,
                pointHoverRadius: 5,
            },
        ],
    };

    const radarOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: (context: any) => `${context.raw}%`
                }
            }
        },
        scales: {
            r: {
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: {
                    stepSize: 20,
                    color: '#9CA3AF', // text-gray-400
                    backdropColor: 'transparent',
                    display: false,
                },
                pointLabels: {
                    font: {
                        size: 12,
                        weight: "bold" as const
                    },
                    color: '#6B7280', // text-gray-500
                },
                grid: {
                    color: '#E5E7EB', // gray-200
                },
                angleLines: {
                    color: '#E5E7EB', // gray-200
                }
            },
        },
    };

    const handlePrevDriver = () => {
        setSelectedDriverIndex((prev) => (prev > 0 ? prev - 1 : drivers.length - 1));
    };

    const handleNextDriver = () => {
        setSelectedDriverIndex((prev) => (prev < drivers.length - 1 ? prev + 1 : 0));
    };

    return (
        <Box className="w-full h-full flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 p-4">
            {/* Left Panel - Radar Chart */}
            <Box className="flex-1">
                <Box className="flex items-center space-x-2">
                    <Typography variant="h5" sx={{ fontSize: '28px', fontWeight: 600, color: '#374151' }}>
                        Top Performing Drivers
                    </Typography>
                    <InfoOutlinedIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
                </Box>

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
                ) : (
                    <>
                        {/* Overall Score moved above the chart */}
                        {drivers.length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
                                <Box className="bg-green-50 rounded-lg p-3 text-center" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <Typography sx={{ color: '#22C55E', fontWeight: 'bold', fontSize: '28px', lineHeight: 1 }}>
                                        {drivers[selectedDriverIndex]?.overall_score || 0}%
                                    </Typography>
                                    <Typography sx={{ color: '#22C55E', fontSize: '13px' }}>
                                        overall score
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        <Box className="h-[300px] relative">
                            <Radar data={radarData} options={radarOptions} />
                            {/* Chart navigation controls moved outside the chart area */}
                        </Box>

                        {/* Navigation Controls */}
                        {drivers.length > 1 && (
                            <Box className="absolute top-2 right-2 flex gap-1">
                                <IconButton size="small" sx={{ bgcolor: 'white', width: 30, height: 30 }} onClick={handlePrevDriver}>
                                    <ChevronLeftIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" sx={{ bgcolor: '#22C55E', color: 'white', width: 30, height: 30 }} onClick={handleNextDriver}>
                                    <ChevronRightIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        )}
                    </>
                )}
            </Box>
            {/* Right Panel - Driver List with responsive background */}
            <Box className="flex-1 bg-gray-100 sm:bg-gray-100 md:bg-gray-100 lg:bg-gray-100 xl:bg-gray-100 dark:bg-gray-800 rounded-xl p-3 relative">

                {isLoading ? (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%'
                    }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%'
                    }}>
                        <Typography color="error">{error}</Typography>
                    </Box>
                ) : drivers.length === 0 ? (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%'
                    }}>
                        <Typography>No driver data available</Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                        {drivers.map((driver, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    bgcolor: index === selectedDriverIndex ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                                    borderRadius: '8px',
                                    p: 0.7,
                                    minHeight: '48px',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setSelectedDriverIndex(index)}
                            >
                                <Avatar
                                    src={driver.image}
                                    alt={driver.name}
                                    sx={{ width: 40, height: 40 }}
                                />
                                <Box>
                                    <Typography sx={{ fontWeight: 500, fontSize: '14px', lineHeight: 1.2 }}>
                                        {driver.name}
                                    </Typography>
                                    <Typography sx={{
                                        color: '#6B7280',
                                        fontSize: '12px',
                                        bgcolor: 'rgba(209, 213, 219, 0.5)',
                                        borderRadius: '12px',
                                        px: 1.5,
                                        py: 0.3,
                                        display: 'inline-block',
                                        mt: 0.3
                                    }}>
                                        ID:{driver.driver_id}
                                    </Typography>
                                </Box>
                                <Typography
                                    sx={{
                                        marginLeft: 'auto',
                                        backgroundColor: '#22C55E',
                                        color: 'white',
                                        borderRadius: '12px',
                                        padding: '4px 8px',
                                        fontWeight: 'bold',
                                        fontSize: '14px'
                                    }}
                                >
                                    {driver.overall_score}%
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default TopPerformingDrivers;
