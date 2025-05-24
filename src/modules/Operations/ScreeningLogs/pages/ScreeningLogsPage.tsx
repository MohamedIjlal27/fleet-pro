import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Pagination,
  InputBase,
  ButtonGroup,
  TextField,
  MenuItem,
  Grid2 as Grid,
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router';
import { fetchScreening, approveScreening } from '../apis/apis'; // Import API function
import { toast } from 'react-toastify';
import { systemPlan, systemModule } from '@/utils/constants';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from '@/modules/core/pages/Error404Page';
import LockedFeature from '@/modules/core/components/LockedFeature';
import i18n from '@/i18n';

interface IScreeningListResp {
  id: number;
  orderId: number;
  organizationId?: number;
  customerId: number;
  status: string;
  isApproved: boolean;
  remark?: string;
  provider: string;
  applicationId?: any;
  date: any;
  screeningType: string;
}

const statusColors = {
  Failed: 'red',
  Completed: 'green',
  'In Process': 'blue',
};

export const ScreeningLogsPage: React.FC = () => {
  if (!checkModuleExists(systemModule.OperationsScreeningLogs)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Screening Logs" />
    ) : (
      <Error404Page />
    );
  }

  const navigate = useNavigate();

  const [screeningList, setScreeningList] = useState<IScreeningListResp[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // State to handle loading

  const loadScreening = async () => {
    try {
      setLoading(true); // Start loading
      const response = await fetchScreening();
      setScreeningList(response?.data || []);
    } catch (error) {
      console.error('Error fetching screening logs:', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    loadScreening();
  }, []);

  const handleApprove = async (id: number) => {
    const isConfirmed = window.confirm('Confirm screening approval?');

    if (isConfirmed) {
      setLoading(true);
      try {
        await approveScreening(id);
        loadScreening();
        toast.success('Screening approved successfully.');
      } catch (error: any) {
        console.log('Error approving screening: ' + (error?.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box padding="16px" bgcolor="#f9f9f9">
      {/* Bills Table */}
      <Box bgcolor="#ffffff" borderRadius="8px" padding="16px">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {i18n.t('Screening Logs')}
        </h1>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  'Log ID',
                  'Type',
                  'Order ID',
                  'Application ID',
                  'Provider',
                  'Provider Status',
                  'Report PDF',
                  'Remark',
                  'Approved',
                  'Time',
                  '',
                ].map((heading) => (
                  <TableCell key={heading}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color="#333"
                    >
                      {heading}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {screeningList.map((screening) => (
                <TableRow key={screening.id}>
                  <TableCell>{screening.id}</TableCell>
                  <TableCell>{screening.screeningType}</TableCell>
                  <TableCell>
                    {screening.orderId ? (
                      <Typography
                        sx={{ cursor: 'pointer', textDecoration: 'none', color: 'blue' }}
                        onClick={() => {
                          navigate(`/orderDetails/${screening.orderId}`);
                        }}
                      >
                        {screening.orderId}
                      </Typography>
                    ) : (
                      <>N/A</>
                    )}
                  </TableCell>
                  <TableCell>{screening.applicationId ?? 'N/A'}</TableCell>
                  <TableCell>{screening.provider ?? 'N/A'}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: `${
                            statusColors[
                              screening.status as keyof typeof statusColors
                            ]
                          }20`, // Using 20% opacity of the color
                          color:
                            statusColors[
                              screening.status as keyof typeof statusColors
                            ] ?? 'grey.500',
                          borderRadius: '16px',
                          px: 1.5,
                          py: 0.5,
                          fontWeight: 'medium',
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor:
                              statusColors[
                                screening.status as keyof typeof statusColors
                              ] ?? 'grey.500',
                            mr: 1,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                          }}
                        >
                          {screening.status}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {screening.status == 'Completed' ? (
                      <a
                        style={{ color: 'blue', textDecoration: 'none', cursor: 'pointer' }}
                        href={`/operations/screening-logs/download-report/${screening.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('Download report (demo mode)', screening.id);
                          toast.info('Report download feature is in demo mode');
                        }}
                      >
                        Download
                      </a>
                    ) : (
                      <>N/A</>
                    )}
                  </TableCell>
                  <TableCell>{screening.remark}</TableCell>
                  <TableCell>{screening.isApproved ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{screening.date}</TableCell>
                  <TableCell>
                    {screening.isApproved ? (
                      <Button color="primary" disabled>
                        Approved
                      </Button>
                    ) : (
                      <Button
                        color="primary"
                        onClick={() => handleApprove(screening.id)}
                      >
                        Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box display="flex" justifyContent="center" marginTop="16px">
          <Pagination count={5} variant="outlined" shape="rounded" />
        </Box>
      </Box>
    </Box>
  );
};

export default ScreeningLogsPage;
