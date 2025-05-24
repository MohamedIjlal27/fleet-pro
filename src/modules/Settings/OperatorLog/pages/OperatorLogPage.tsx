import React, { useState, useEffect } from "react";
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
  Grid,
  TextField,
} from "@mui/material";

import { fetchSystemLogs } from '../apis/apis'
import { systemPlan, systemModule } from '@/utils/constants'
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from "@/modules/core/pages/Error404Page";
import LockedFeature from '@/modules/core/components/LockedFeature'

export const OperatorLogPage: React.FC = () => {
  if (!checkModuleExists(systemModule.SettingsOperatorLog)) {
    return checkPlanExists(systemPlan.FreeTrial) ? <LockedFeature featureName="Operator Log" /> : <Error404Page />;
  }

  // State for pagination
  const defaultPagin =
  {
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  };
  const [pagination, setPagination] = useState(defaultPagin);

  // Dummy data for table rows
  const [logs, setLogs] = useState<any[]>([]);

  // Load data (mock API call)
  const loadData = async () => {
    try {

      const response = await fetchSystemLogs(
        pagination.currentPage,
        pagination.perPage
      );
      if (response) {
        console.log("fetchSystemLogs response =", response);
        setLogs(response.data);
        setPagination((prev) => ({
          ...prev,
          currentPage: response.meta.currentPage,
          lastPage: response.meta.lastPage,
          total: response.meta.total,
        }));
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  // Load  filters
  useEffect(() => {
    loadData();
  }, []);

  // Load orders 
  useEffect(() => {
    loadData();
  }, [pagination.currentPage]); // Reload when pagination or filters change

  useEffect(() => {
    loadData();
  }, [pagination.currentPage]);

  // Handle pagination change
  const handlePaginationChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const formatLocalTime = (isoString: string) => {
    return new Date(isoString).toLocaleString(); // Converts to local time
  };


  return (
    <Box display="flex" padding="16px" bgcolor="#f9f9f9">

      {/* Table */}
      <Box flex="1" bgcolor="#ffffff" borderRadius="8px" padding="16px" width="80%">
        <TableContainer>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {[
                  "User ID",
                  "Message",
                  "Meta Data",
                  "Created At",
                ].map((heading) => (
                  <TableCell key={heading}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {heading}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.userId}</TableCell>
                  <TableCell>{row.message}</TableCell>
                  <TableCell>
                    <div style={{ maxHeight: 100, overflowY: "auto", width: "100%" }}>
                      <TextField
                        value={JSON.stringify(row.metadata)} // Format JSON as string
                        multiline
                        fullWidth
                        variant="outlined"
                        InputProps={{
                          sx: { overflowY: "hidden" }, // Prevents double scrollbar inside TextField
                        }}
                      />
                    </div>
                  </TableCell>

                  <TableCell>{formatLocalTime(row.createdAt)}</TableCell>
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
    </Box>
  );
};

export default OperatorLogPage;
