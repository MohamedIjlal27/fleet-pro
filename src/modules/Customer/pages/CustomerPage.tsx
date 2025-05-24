import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Modal,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Pagination,
  Divider,
  Grid,
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router';
import { createBrowserHistory } from 'history';
import ImportModal from '../components/ImportModal';
import { fetchCustomers, sendText } from '../apis/apis';
import { systemPlan, systemModule } from '@/utils/constants';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from '@/modules/core/pages/Error404Page';
import LockedFeature from '@/modules/core/components/LockedFeature';
import { toast } from 'react-toastify';

export const CustomerPage: React.FC = () => {
  if (!checkModuleExists(systemModule.Customer)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Customer" />
    ) : (
      <Error404Page />
    );
  }

  const [activeLetter, setActiveLetter] = useState<string | null>('All');
  const [openImportModal, setOpenImportModal] = useState(false);
  const navigate = useNavigate(); // React Router navigation hook
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // State for pagination
  const defaultPagin = {
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
  };
  const [pagination, setPagination] = useState(defaultPagin);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState('createdAt');
  const [filter, setFilter] = useState<string>('');

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const filteredCustomers =
    activeLetter === 'All'
      ? customers
      : customers.filter((customer) => customer.name.startsWith(activeLetter));

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [pagination.currentPage, sortBy, sortOrder]);

  // const handleLetterClick = (letter: string) => {
  //   setActiveLetter(letter);
  // };

  // const handleViewAllClick = () => {
  //   setActiveLetter("All");
  // };

  const handleCustomerClick = (id: number) => {
    navigate(`/customer/${id}`); // Navigate to customer details page
  };

  const handleSendText = async (id: number) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to text this customer?'
    );

    if (isConfirmed) {
      setLoading(true);
      try {
        await sendText(id);
        toast.success('Text sent successfully.');
      } catch (error: any) {
        console.log('Error sending text: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetchCustomers(
        pagination.currentPage,
        pagination.perPage,
        sortBy || 'createdAt',
        sortOrder || 'asc',
        filter || ''
      );
      if (response && response.data) {
        setCustomers(response.data); // Update the state with the API response
        setPagination((prev) => ({
          ...prev,
          currentPage: response.meta.currentPage,
          lastPage: response.meta.lastPage,
          total: response.meta.total,
        }));
      }
    } catch (err) {
      setError('Failed to fetch customer data');
    } finally {
      setLoading(false);
    }
  };

  // Handle search change for filters
  const handleFilterChange = () => {
    setPagination(defaultPagin);
    loadCustomers();
  };

  const handleRequestSort = (property: string) => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  // Handle pagination change
  const handlePaginationChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  return (
    <Box sx={{ padding: '20px' }} bgcolor="#f4f6f8">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Customer List</h1>
        </div>
      </div>

      {/* Import and Alphabet Navigation */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Grid
          container
          spacing={2}
          alignItems="center"
          wrap="wrap"
          sx={{ mb: 2 }}
        >
          {/* First Name, Last Name, Phone or Email */}
          <Grid item xs={12} sm={6} md={10} lg={10}>
            <TextField
              label="First Name, Last Name, Phone or Email"
              fullWidth
              variant="outlined"
              size="small"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onBlur={handleFilterChange}
            />
          </Grid>
          {/* Import Button */}
          <Grid item xs={12} sm={6} md={2} lg={2}>
            <Button
              variant="contained"
              color="primary"
              sx={{
                width: '100%',
                textTransform: 'none',
                backgroundColor: '#0A1224',
              }}
              className="rounded-md"
              onClick={() => setOpenImportModal(true)}
            >
              + Import
            </Button>
          </Grid>

          {/* <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "3px",
              padding: "8px 16px",
              backgroundColor: "#edf0f2",
              borderRadius: "20px",
              overflowX: "auto",
            }}
          >
            {alphabet.map((letter) => (
              <Button
                key={letter}
                sx={{
                  minWidth: "30px",
                  padding: 0,
                  fontWeight: activeLetter === letter ? "bold" : "normal",
                  textDecoration: "none",
                  color: activeLetter === letter ? "black" : "#636363",
                  backgroundColor: activeLetter === letter ? "#dfe4ea" : "transparent",
                  borderRadius: "50%",
                }}
                onClick={() => handleLetterClick(letter)}
              >
                {letter}
              </Button>
            ))}
          </Box> */}

          {/* <Button
            variant="outlined"
            sx={{
              padding: "6px 16px",
              color: "black",
              borderColor: "#dfe4ea",
              textTransform: "none",
              borderRadius: "20px",
            }}
            onClick={handleViewAllClick}
          >
            View all
          </Button> */}
        </Grid>
      </Box>

      <Divider sx={{ marginBottom: '20px' }} />

      {/* Customer Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {[
                'id',
                'createdAt',
                'firstName',
                'lastName',
                'phone',
                'email',
              ].map((column) => (
                <TableCell
                  key={column}
                  sortDirection={sortBy === column ? sortOrder : false}
                >
                  <TableSortLabel
                    active={sortBy === column}
                    direction={sortBy === column ? sortOrder : 'asc'}
                    onClick={() => handleRequestSort(column)}
                  >
                    {column.charAt(0).toUpperCase() + column.slice(1)}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell>Status</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow
                key={
                  customer.id
                } /*onClick={() => handleCustomerClick(customer.id)} sx={{ cursor: "pointer" }}*/
              >
                <TableCell>{customer.id}</TableCell>
                <TableCell>
                  {new Date(customer.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>{customer.firstName}</TableCell>
                <TableCell>{customer.lastName}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>
                  <Box
                    display="flex"
                    alignItems="center"
                    sx={{
                      color: customer.orders?.length > 0 ? 'green' : 'gray',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor:
                          customer.orders?.length > 0 ? 'green' : 'gray',
                        marginRight: '8px',
                      }}
                    ></span>
                    {customer.orders?.length > 0 ? 'Active' : 'Inactive'}
                  </Box>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    sx={{
                      mr: 1,
                      textTransform: 'none',
                      borderColor: '#007BFF',
                      color: '#007BFF',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        borderColor: '#007BFF',
                      },
                    }}
                    onClick={() => handleSendText(customer.id)}
                  >
                    Text
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      textTransform: 'none',
                      borderColor: '#0A1224',
                      color: '#0A1224',
                      '&:hover': {
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        borderColor: '#0A1224',
                      },
                    }}
                    onClick={() => handleCustomerClick(customer.id)}
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" marginTop="16px">
        <Pagination
          count={pagination.lastPage}
          page={pagination.currentPage}
          onChange={handlePaginationChange}
          variant="outlined"
          shape="rounded"
        />
      </Box>

      {/* Import Modal */}
      <ImportModal
        open={openImportModal}
        handleClose={() => setOpenImportModal(false)}
        loadCustomers={loadCustomers}
      />
    </Box>
  );
};
