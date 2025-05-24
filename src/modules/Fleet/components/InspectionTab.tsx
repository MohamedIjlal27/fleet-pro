import type React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  List,
  Skeleton,
  Divider,
} from '@mui/material';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { fetchReports } from '../apis/apis';

interface InspectionTabPros {
  vehicle: any;
}

export const InspectionTab: React.FC<InspectionTabPros> = ({ vehicle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState<boolean>(true);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    loadInspectionReport();
  }, []);

  const loadInspectionReport = async () => {
    setLoading(true);
    const response = await fetchReports(vehicle.id);
    console.log('fetchReports response=', response);
    setReports(response);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isMobile
      ? date.toLocaleDateString()
      : date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
  };

  return (
    <Box flex="1" borderRadius="8px" padding={isMobile ? '8px' : '16px'}>
      {/* Header */}
      <Box
        padding={isMobile ? '12px' : '16px'}
        bgcolor="#f9f9f9"
        borderRadius={isMobile ? '8px' : '4px'}
        mb={isMobile ? 2 : 0}
      >
        <Typography
          variant={isMobile ? 'subtitle1' : 'h6'}
          fontWeight={isMobile ? '500' : 'normal'}
        >
          Inspection Report
        </Typography>
      </Box>

      {isMobile ? (
        // Mobile view - Card list
        <Box sx={{ px: 1 }}>
          {loading ? (
            // Loading skeleton for mobile
            <Box sx={{ mt: 2 }}>
              {[1, 2, 3].map((item) => (
                <Card key={item} sx={{ mb: 2, borderRadius: '8px' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Skeleton
                      variant="text"
                      width="60%"
                      height={24}
                      sx={{ mb: 1 }}
                    />
                    <Skeleton variant="text" width="40%" height={20} />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        mt: 2,
                      }}
                    >
                      <Skeleton
                        variant="rectangular"
                        width={100}
                        height={36}
                        sx={{ borderRadius: '4px' }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : reports && reports.length > 0 ? (
            <List sx={{ p: 0, mt: 2 }}>
              {reports.map((report) => (
                <Card
                  key={report.id}
                  sx={{
                    mb: 2,
                    borderRadius: '8px',
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                    overflow: 'visible',
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <QueryBuilderIcon
                        sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(report.createdAt)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PeopleOutlineIcon
                        sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {report.reporter?.firstName} {report.reporter?.lastName}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box
                      sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}
                    >
                      <a
                        href={`/public/inspection-report?id=${report.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none', width: '100%' }}
                      >
                        <Button
                          variant="outlined"
                          fullWidth
                          size="small"
                          sx={{
                            borderRadius: '20px',
                            textTransform: 'none',
                            py: 0.75,
                          }}
                        >
                          View Details
                        </Button>
                      </a>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </List>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                mt: 2,
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No inspection records found.
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        // Desktop view - Table
        <div className="flex flex-col md:flex-row lg:flex-row gap-4 p-4 bg-[#f9f9f9] min-h-screen">
          <div className="md:w-2/3 lg:w-4/5 flex-1">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {/* Table */}
              <div className="overflow-x-auto scrollbar-thin">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      {['Inspection Date', 'Operator', 'Details'].map(
                        (heading) => (
                          <th
                            key={heading}
                            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports && reports.length > 0 ? (
                      reports.map((report) => {
                        return (
                          <tr
                            key={report.id}
                            className="hover:bg-gray-50 cursor-pointer"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {report.reporter?.firstName}{' '}
                              {report.reporter?.lastName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                              <a
                                href={`/public/inspection-report?id=${report.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="outlined" size="small">
                                  View Details
                                </Button>
                              </a>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          {loading
                            ? 'Loading inspection records...'
                            : 'No inspection records found.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </Box>
  );
};
