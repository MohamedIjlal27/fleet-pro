import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Typography, IconButton, Popover, Box } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';

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

const MaintenanceCostChart: React.FC = () => {
    const [infoAnchorEl, setInfoAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleInfoClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setInfoAnchorEl(event.currentTarget);
    };

    const handleInfoClose = () => {
        setInfoAnchorEl(null);
    };

    const infoOpen = Boolean(infoAnchorEl);

    // Sample data for demonstration
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Sample data matching the image
    const costData = [2100, 3000, 2100, 3600, 2100, 2500, 1700, 3452, 1200, 2700, 1300, 2500];

    // For highlighting August as shown in the image
    const highlightedMonth = 7; // August (0-indexed)

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
                borderRadius: 10,
                distributed: true,
                dataLabels: {
                    position: 'top',
                }
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: "vertical",
                shadeIntensity: 0.2,
                gradientToColors: undefined,
                inverseColors: false,
                opacityFrom: 0.85,
                opacityTo: 0.85,
                stops: [0, 100]
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: false
        },
        colors: costData.map((_, index) =>
            index === highlightedMonth ? '#0070f3' : '#bfdbfe' // Darker blue for highlighted, light blue for others
        ),
        yaxis: {
            min: 0,
            max: 5000,
            tickAmount: 5,
            labels: {
                formatter: (value) => `$ ${value / 1000}k`,
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
            categories: months,
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
            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                const value = series[0][dataPointIndex];
                return `<div class="custom-tooltip" style="
                    background: #1e293b; 
                    border-radius: 10px; 
                    padding: 10px 15px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    font-weight: bold;
                    color: white;
                    font-size: 20px;
                    text-align: center;
                ">
                    $${value}
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
                    <Typography variant="h5" sx={{ fontSize: '28px', fontWeight: 600, color: '#374151' }}>
                        Total Cost of Ownership Per Asset
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
                                    This chart displays the total cost of ownership per asset on a monthly basis. It includes maintenance, repairs, operational costs, and other expenses associated with each vehicle in the fleet.
                                </Typography>
                            </Box>
                        </Popover>
                    </Typography>
                </ChartTitle>
            </ChartHeader>

            <div style={{ marginTop: '35px' }}>
                <Chart
                    options={options}
                    series={series}
                    type="bar"
                    height={300}
                />
            </div>
        </Box>
    );
};

export default MaintenanceCostChart;
