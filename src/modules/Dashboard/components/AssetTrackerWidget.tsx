import React, { useEffect, useState } from 'react';
import { Typography, Box, useTheme, CircularProgress } from '@mui/material';
import { DashboardFilterParams, fetchWidgetData } from '../apis/apis';

interface AssetTrackerWidgetProps {
    filters?: DashboardFilterParams;
}

interface TerminalData {
    name: string;
    count: number;
}

interface GarageData {
    name: string;
    vehicleCount: number;
}

const AssetTrackerWidget: React.FC<AssetTrackerWidgetProps> = ({ filters }) => {
    const theme = useTheme();
    const [loading, setLoading] = useState<boolean>(true);
    const [terminals, setTerminals] = useState<TerminalData[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch data using wg6 parameter (GaragesChart data)
                const response = await fetchWidgetData({
                    ...filters,
                    wg6: true // Garages Chart data
                });

                // Find the garages data in the response
                const garagesData = response.find((item: any) => item.wgGaragesChart !== undefined);

                if (garagesData && Array.isArray(garagesData.wgGaragesChart)) {
                    // Map the data to our terminal format
                    const mappedData: TerminalData[] = garagesData.wgGaragesChart.map((garage: GarageData) => ({
                        name: garage.name,
                        count: garage.vehicleCount
                    }));

                    setTerminals(mappedData);
                } else {
                    // Fallback to sample data if API doesn't return expected format
                    console.warn('No garage data found, using fallback data');
                    // setTerminals([
                    //     { name: 'Terminal 1', count: 27 },
                    //     { name: 'Terminal 2', count: 13 },
                    // ]);
                }
            } catch (err) {
                console.error('Error fetching asset tracker data:', err);
                setError('Failed to load garage data');
                // Use fallback data on error
                // setTerminals([
                //     { name: 'Terminal 1', count: 27 },
                //     { name: 'Terminal 2', count: 13 },
                // ]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [filters]); // Re-fetch when filters change

    // Calculate the maximum value for scaling the bars
    const maxValue = Math.max(...terminals.map(terminal => terminal.count), 30); // Min max of 30 for scaling

    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
        }}>
            {/* Header */}
            <Typography variant="h5" component="h2" sx={{
                fontSize: '28px',
                fontWeight: 600,
                color: '#374151',
                mb: 2
            }}>
                Garage
            </Typography>

            {/* Divider */}
            <Box sx={{
                height: '1px',
                backgroundColor: '#E5E7EB',
                mb: 3
            }} />

            {/* Content Area */}
            <Box sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}>
                {/* Background Grid Lines */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                }}>
                    {/* Vertical lines */}
                    {[0, 7, 14, 21, 28].map((pos, i) => (
                        <Box
                            key={`vline-${i}`}
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: `${(pos / 28) * 100}%`,
                                width: '1px',
                                height: '100%',
                                borderLeft: '1px dashed #E5E7EB',
                            }}
                        />
                    ))}
                </Box>

                {/* X-axis labels */}
                {/* Loading, Error, or Terminals */}
                {loading ? (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%'
                    }}>
                        <CircularProgress color="primary" size={40} />
                    </Box>
                ) : error ? (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        color: 'error.main'
                    }}>
                        <Typography>{error}</Typography>
                    </Box>
                ) : terminals.length === 0 ? (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        color: 'text.secondary'
                    }}>
                        <Typography>No garage data available</Typography>
                    </Box>
                ) : (
                    <Box sx={{ mb: 4, flexGrow: 1 }}>
                        {terminals.map((terminal, index) => (
                            <Box
                                key={terminal.name}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: 4,
                                }}
                            >
                                {/* Terminal Name */}
                                <Typography
                                    sx={{
                                        width: '100px',
                                        fontSize: '16px',
                                        color: '#4B5563',
                                        fontWeight: 500
                                    }}
                                >
                                    {terminal.name}
                                </Typography>

                                {/* Progress Bar Container */}
                                <Box sx={{
                                    flexGrow: 1,
                                    position: 'relative',
                                    height: '12px',
                                }}>
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: `${(terminal.count / maxValue) * 100}%`,
                                            height: '100%',
                                            borderRadius: '4px',
                                            background: index === 0
                                                ? 'linear-gradient(90deg, #3B82F6 0%, #4F46E5 100%)'
                                                : 'linear-gradient(90deg, #BFDBFE 0%, #93C5FD 100%)',
                                        }}
                                    />
                                </Box>

                                {/* Count */}
                                <Typography
                                    sx={{
                                        minWidth: '30px',
                                        textAlign: 'right',
                                        fontWeight: 500,
                                        fontSize: '16px',
                                        color: index === 0 ? '#4F46E5' : '#6B7280',
                                        ml: 2
                                    }}
                                >
                                    {terminal.count}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}

                {/* X-axis labels moved to bottom */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 2,
                    px: 0,
                }}>
                    {[0, 7, 14, 21, 28].map((label, i) => (
                        <Typography
                            key={`x-label-${i}`}
                            variant="body2"
                            sx={{
                                color: '#6B7280',
                                flexBasis: 0,
                                flexGrow: i === 0 ? 0 : 1,
                                textAlign: i === 0 ? 'left' : 'center',
                            }}
                        >
                            {label}
                        </Typography>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default AssetTrackerWidget;
