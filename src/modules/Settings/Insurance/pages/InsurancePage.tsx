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
import { fetchInsurances } from '../apis/apis'
import InsuranceModal from "../components/InsuranceModal";
import {IAddress , IInsurance} from '../interfaces/interfaces'
import { systemPlan, systemModule } from '@/utils/constants'
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from "@/modules/core/pages/Error404Page";
import LockedFeature from '@/modules/core/components/LockedFeature'

export const InsurancePage: React.FC = () => {
  if (!checkModuleExists(systemModule.SettingsInsurance)) {
    return checkPlanExists(systemPlan.FreeTrial) ? <LockedFeature featureName="Insurance" /> : <Error404Page />;
  }

  // State for filters

  const [filters, setFilters] = useState({
    filterType1: [] as string[],
    filterType2: [] as string[],
  });

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
  const [insurances, setInsurancess] = useState<IInsurance[]>([]);
  const [selectedInsurance, setSelectedInsurance] = useState<IInsurance | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'Edit' | 'Create'>('Create');
  

  useEffect(() => {
    loadData();
  }, [filters, pagination.currentPage]);

  // Load data (mock API call)
  const loadData = async () => {
    console.log("Fetching data with:", { filters, pagination });

    const response = await fetchInsurances(
      pagination.currentPage,
      pagination.perPage);

    console.log("fetchInsurances res=", response)

    if (response) {
      console.log("fetchSystemLogs response =", response);
      setInsurancess(response.data);
      setPagination((prev) => ({
        ...prev,
        currentPage: response.meta.currentPage,
        lastPage: response.meta.lastPage,
        total: response.meta.total,
      }));
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


  const handleRowClick = (insurance: IInsurance) => {
    setModalMode('Edit');
    setSelectedInsurance(insurance);
    console.log("setSelectedInsurance = ", insurance)
    setModalOpen(true);
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
        <Button
          variant="contained"
          onClick={() => {
            setSelectedInsurance(null);
            setModalMode('Create');
            setModalOpen(true) 
          }}
          sx={{
            mt: 2,
            mb: 2,
            padding: '10px 6px',
            fontWeight: 'bold',
            backgroundColor: '#1E293B',
            '&:hover': {
              backgroundColor: '#111827',
            },
          }}
        >
          Add Insurance
        </Button>

        {/* <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            Filters
          </Typography>
          <Button
            variant="text"
            onClick={() => setFilters({ filterType1: [], filterType2: [] })}
            sx={{
              textTransform: "none",
              fontSize: "10px",
              color: "#2158DB",
            }}
          >
            Clear all
          </Button>
        </Box> */}

        {/* Filter Type 1 */}
        {/* <Box
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
        </Box> */}

      </Box>

      {/* Table */}
      <Box flex="1" bgcolor="#ffffff" borderRadius="8px" padding="16px" width="80%">
        <TableContainer>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {[
                  "Insurance Id",
                  "Company",
                  "Policy Number",
                  "Start Date",
                  "Expiry Date",
                  "Status",
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
              {insurances.map((insurance) => (
                <TableRow key={insurance.id}  onClick={() => handleRowClick(insurance)}>
                  <TableCell>{insurance.id}</TableCell>
                  <TableCell>{insurance.insuranceCompany}</TableCell>
                  <TableCell>{insurance.policyNumber}</TableCell>
                  <TableCell>{insurance.effectiveDate}</TableCell>
                  <TableCell>{insurance.expiryDate}</TableCell>
                  <TableCell>{insurance.status}</TableCell>
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


      <InsuranceModal
        open={isModalOpen}
        onClose={() => {
          reFreshTable()
          setModalOpen(false)
        }}
        selectedInsurance={selectedInsurance}
        mode={modalMode}
      />

    </Box>
  );
};

export default InsurancePage;
