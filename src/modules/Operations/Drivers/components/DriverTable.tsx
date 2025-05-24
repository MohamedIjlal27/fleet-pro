import React, { useEffect, useState } from 'react';
import { IDriver } from '../interfaces/driver.interface';
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Box, Pagination, } from "@mui/material";
import {fetchDrivers} from '../apis/apis';

interface DriverTableProps {
    onDriverSelect: (driverId: number) => void; // Add a prop for the callback
}

export const DriverTable: React.FC<DriverTableProps> = ({ onDriverSelect }) => {

    const [drivers, setDrivers] = useState<IDriver[]>([]);
    const [filters, setFilters] = useState({
        status: [] as string[], // Keys of statuses selected
    });
    const defaultPagin = {
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 10,
    };
    const [pagination, setPagination] = useState(defaultPagin);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        loadDrivers();
    }, []);

    useEffect(() => {
        loadDrivers();
    }, [pagination.currentPage]);

    useEffect(() => {
        reFreshTable();
    }, [filters]);

    const reFreshTable = () => {
        setPagination((prev) => {
            if (prev?.currentPage === defaultPagin.currentPage) {
              // If already on the first page, directly load bills
              loadFilters();
              return prev;
            }
            // Otherwise, reset pagination to the first page
            return defaultPagin;
          });
    }

    const handlePaginationChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setPagination((prev) => ({ ...prev, currentPage: page }));
    };

    const loadDrivers = async () => {
        try {
            setLoading(true);
            const response = await fetchDrivers(
                pagination?.currentPage || 1,
                pagination?.perPage || 10,
            );
            if (response) {
                setDrivers(response.data || []);
                setPagination((prev) => ({
                    ...prev,
                    currentPage: response.meta?.currentPage || 1,
                    lastPage: response.meta?.lastPage || 1,
                    total: response.meta?.total || 0,
                }));
            }
        } catch (error) {
            console.log('Error fetching driver details', error);
            setDrivers([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const loadFilters = async () => {
        try {
            // for future filter option api
        } catch (error) {
            console.error("Error loading filters:", error);
        }
    };


    const handleRowClick = (id: number) => {
        onDriverSelect(id);
    };

    return (
        <Box sx={{
            width: '100%',
            height: '100%',
        }}>
            <TableContainer component={Paper}>
                <Table aria-label="drivers table">
                    <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>First Name</TableCell>
                            <TableCell>Last Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone Number</TableCell>
                            <TableCell>License Number</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {drivers.map((driver) => (
                            <TableRow
                                key={driver.id}
                                hover
                                onClick={() => handleRowClick(driver.id)}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell>{driver.id}</TableCell>
                                <TableCell>{driver.user?.firstName}</TableCell>
                                <TableCell>{driver.user?.lastName}</TableCell>
                                <TableCell>{driver.user?.email}</TableCell>
                                <TableCell>{driver.user?.phone}</TableCell>
                                <TableCell>{driver.driverLicenseNumber}</TableCell>
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
        </Box>
    );
}