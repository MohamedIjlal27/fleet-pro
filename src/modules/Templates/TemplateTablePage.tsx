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
} from "@mui/material";

export const TemplateTablePage: React.FC = () => {

  const defualtFilter = {
    filterType1: [] as string[],
    filterType2: [] as string[],
  }

  // State for filters
  const [filters, setFilters] = useState(defualtFilter);

  const [filterOptions, setFilterOptions] = useState({
    filterType1: {} as Record<string, string>, // Key-value pairs from the API
    filterType2: {} as Record<string, string>,
  });

  // State for pagination
  const defaultPagin =
  {
      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: 20,
  };
  const [pagination, setPagination] = useState(defaultPagin);

  // Dummy data for table rows
  const [rows, setRows] = useState([
    { id: 1, column1: "Row 1 Column 1", column2: "Row 1 Column 2" },
    { id: 2, column1: "Row 2 Column 1", column2: "Row 2 Column 2" },
  ]);

  useEffect(() => {
    loadData();
    loadFilters();
  }, []);

  useEffect(() => {
    loadData();
  }, [pagination.currentPage]);

  useEffect(() => {
    reFreshTable();
  }, [filters]);

  // Load data (mock API call)
  const loadData = () => {
    console.log("Fetching data with:", { filters, pagination });
    // Mock API call would go here
    setRows([
      { id: 1, column1: "Row 1 Column 1", column2: "Row 1 Column 2" },
      { id: 2, column1: "Row 2 Column 1", column2: "Row 2 Column 2" },
    ]);
  };

  const loadFilters = async () => {
    try {

      //use your own api 
      const response = {
        filterType1: {} as Record<string, string>, 
        filterType2: {} as Record<string, string>,
      };
      setFilterOptions(response);
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  };

  const reFreshTable = () => {
    setPagination((prev) => {
        if (prev.currentPage === defaultPagin.currentPage) {
            // If already on the first page, directly load bills
            loadData();
            return prev;
        }
        // Otherwise, reset pagination to the first page
        return defaultPagin;
    });
}


  // Handle filter changes
  const handleFilterChange = (filterType: "filterType1" | "filterType2", value: string) => {
    setFilters((prevFilters) => {
      const filterValues = prevFilters[filterType];
      const isSelected = filterValues.includes(value);

      console.log(`filterType = ${filterType} value= ${value} prevFilters=`, prevFilters);
      return {
        ...prevFilters,
        [filterType]: isSelected
          ? filterValues.filter((item) => item !== value)
          : [...filterValues, value],
      };
    });
  };

  // Handle pagination change
  const handlePaginationChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };


  return (
    <Box display="flex" padding="16px" bgcolor="#f9f9f9">
      {/* Filters Sidebar */}
      <Box
        width="15%"
        minWidth="200px"
        bgcolor="#ffffff"
        border="1px solid #e0e0e0"
        borderRadius="8px"
        padding="12px"
        marginRight="16px"
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            Filters
          </Typography>
          <Button
            variant="text"
            onClick={() => setFilters(defualtFilter)}
            sx={{
              textTransform: "none",
              fontSize: "10px",
              color: "#2158DB",
            }}
          >
            Clear all
          </Button>
        </Box>

        {/* Filter Type 1 */}
        <Box
          marginTop="16px"
          padding="8px"
          border="1px solid #e0e0e0"
          borderRadius="8px"
          bgcolor="#f9f9f9"
        >
          <Typography variant="subtitle1" fontWeight="bold" color="#333">
            Filter Type 1
          </Typography>
          <Grid container>
            {Object.entries(filterOptions.filterType1).map(([key, label]) => (
              <Grid item xs={12} key={key}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={filters.filterType1.includes(key)}
                      onChange={() => handleFilterChange("filterType1", key)}
                    />
                  }
                  label={label}
                  sx={{ marginBottom: "4px" }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Filter Type 2 */}
        <Box
          marginTop="16px"
          padding="8px"
          border="1px solid #e0e0e0"
          borderRadius="8px"
          bgcolor="#f9f9f9"
        >
          <Typography variant="subtitle1" fontWeight="bold" color="#333">
            Filter Type 2
          </Typography>
          <Grid container>
            {Object.entries(filterOptions.filterType2).map(([key, label]) => (
              <Grid item xs={12} key={key}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={filters.filterType2.includes(key)}
                      onChange={() => handleFilterChange("filterType2", key)}
                    />
                  }
                  label={label}
                  sx={{ marginBottom: "4px" }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Table */}
      <Box flex="1" bgcolor="#ffffff" borderRadius="8px" padding="16px" width="80%">
        <TableContainer>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {[
                  "Column 1",
                  "Column 2",
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
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.column1}</TableCell>
                  <TableCell>{row.column2}</TableCell>
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
