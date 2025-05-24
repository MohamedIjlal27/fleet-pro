import { useEffect, useState } from 'react';
import PageMeta from '@/components/common/PageMeta';
import {
  Box,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Pagination,
} from '@mui/material';
import reportsPageImage from '/src/assets/temporary_pages/reports_page.png';
import {
  getReportsList,
  getReportsTypeList,
  genReportByType,
} from '../apis/apis';
import { toast } from 'react-toastify';
import { systemPlan, systemModule } from '@/utils/constants';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from '@/modules/core/pages/Error404Page';
import LockedFeature from '@/modules/core/components/LockedFeature';
import i18n from '@/i18n';
import moment from 'moment';
import { CalenderIcon, EyeCloseIcon, EyeIcon, TimeIcon } from "@/icons";
import Flatpickr from "react-flatpickr";

interface Report {
  id: number;
  fromDate: string;
  toDate: string;
  type: string;
  organizationId: number;
  metadata: Record<string, any>;
  createdAt: string;
  user: {
    name: string;
  };
}

interface ReportType {
  key: string; // API key (e.g., "fuel-consumption-report")
  label: string; // API value (e.g., "Fuel Consumption Report")
}

export const ReportPage: React.FC = () => {
  if (!checkModuleExists(systemModule.OperationsReports)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Reports" />
    ) : (
      <Error404Page />
    );
  }

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [type, setType] = useState<string | null>(null);
  const [typeList, setTypeList] = useState<ReportType[]>([]);
  const [reportHistory, setReportHistory] = useState<
    { id: number; name: string; createdBy: string; createdOn: string }[]
  >([]);
  const defaultPagin = {
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  };
  const [pagination, setPagination] = useState(defaultPagin);

  // Transform API response into the required format
  useEffect(() => {
    const loadReportTypeList = async () => {
      const filterData = await getReportsTypeList();
      if (filterData && filterData.data && filterData.data.type) {
        // Transform the API response into the desired format
        const formattedData: ReportType[] = Object.entries(
          filterData.data.type
        ).map(([key, label]) => ({
          key, // Use the API key
          label, // Use the API label
        }));
        setTypeList(formattedData);
      }
    };
    loadReportHistory();
    loadReportTypeList();
  }, []);

  useEffect(() => {
    loadReportHistory();
  }, [pagination.currentPage]);

  const loadReportHistory = async () => {
    const result = await getReportsList(
      pagination.currentPage,
      pagination.perPage
    );
    console.log('getReportsList result =', result);
    if (result && Array.isArray(result.data)) {
      // Transform API data into the desired format
      const transformedData = result.data.map((report) => ({
        id: report.id,
        name: report.type,
        createdBy: report.user?.name || 'Unknown', // Handle missing user name
        createdOn: new Date(report.createdAt).toLocaleString(), // Format date to a readable string
      }));

      setReportHistory(transformedData);
      setPagination((prev) => ({
        ...prev,
        currentPage: result.meta.currentPage,
        lastPage: result.meta.lastPage,
        total: result.meta.total,
      }));
    } else {
      console.error("Invalid API response: Expected an array in 'data'.");
    }
  };

  const handleRestTable = () => {
    setPagination(defaultPagin);
    loadReportHistory();
  };

  const handlePaginationChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleFromDateChange = (date: Date[]) => {
    const newDate = moment(date[0]).format('YYYY-MM-DD');
    setFromDate(newDate);
  };
  
  const handleToDateChange = (date: Date[]) => {
    const newDate = moment(date[0]).format('YYYY-MM-DD');
    setToDate(newDate);
  };

  const handleGenerateReport = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log('Generating Report for:', { fromDate, toDate, type });

    if (!fromDate || !toDate || type === null) {
      toast.error('All fields must be filled out.');
      return;
    }

    try {
      let responseData: any;
      let filename = 'report.csv';

      const fcr = await genReportByType(type, fromDate, toDate);
      responseData = fcr; // Assigning response to variable
      filename = `${type}.csv`;

      if (responseData?.data) {
        const blob = new Blob([responseData.data], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename; // Set the desired file name
        link.click();
        URL.revokeObjectURL(link.href); // Clean up the object URL
        handleRestTable();
        toast.success(`Report generated successfully (demo mode): ${filename}`);
      } else {
        toast.error('No data available to download.');
      }
    } catch (error: any) {
      toast.error(`Error generating report: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <>
      <PageMeta
        title="Report | Synops AI"
        description="This is Report page for Synops AI"
      />
    <Box padding="16px" bgcolor="#f4f6f8">
      <Box bgcolor="#ffffff" borderRadius="8px" padding="16px">
        <h1 className="text-2xl font-bold text-gray-900">
          {i18n.t('Reports')}
        </h1>

        {/* Form to Generate Report */}
        <Box
          component="form"
          onSubmit={handleGenerateReport}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3,
            mt: 4,
            alignItems: 'center',
          }}
        >
          {/* Date picker fields with consistent height */}
          {/* <FormControl size="small" sx={{ minWidth: 200 }}>
            <TextField
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
              sx={{ height: '100%' }}
            />
          </FormControl> */}
          <Box sx={{ flex: '1 1 200px', minWidth: '200px', position: 'relative' }}>
            <div className="flatpickr-wrapper">
              <Flatpickr
                value={fromDate}
                onChange={handleFromDateChange}
                options={{
                  dateFormat: "Y-m-d", // Set the date format
                }}
                placeholder="From Date"
                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <CalenderIcon className="size-6" />
              </span>
            </div>
          </Box>

          {/* <FormControl size="small" sx={{ minWidth: 200 }}>
            <TextField
              label="To Date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
              sx={{ height: '100%' }}
            />
          </FormControl> */}
          <Box sx={{ flex: '1 1 200px', minWidth: '200px', position: 'relative' }}>
            <div className="flatpickr-wrapper">
              <Flatpickr
                value={toDate}
                onChange={handleToDateChange}
                options={{
                  dateFormat: "Y-m-d", // Set the date format
                }}
                placeholder="To Date"
                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <CalenderIcon className="size-6" />
              </span>
            </div>
          </Box>

          {/* Type dropdown with consistent height */}
          <FormControl size="small" sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              label="Type"
              size="small"
              sx={{ height: '40px' }}
            >
              {typeList.map(({ key, label }) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Submit button with explicit height to match other controls */}
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: '#0A1224',
              height: '40px',
              textTransform: 'none',
              boxShadow: 1,
              '&:hover': {
                backgroundColor: '#1A2234',
                boxShadow: 2,
              },
              flex: '0 1 auto',
            }}
          >
            Generate New Report
          </Button>
        </Box>

        {/* Report History Table */}
        <TableContainer component={Paper} sx={{ mt: 4, boxShadow: 'none' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report ID</TableCell>
                <TableCell>Report Name</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created On</TableCell>
                {/* <TableCell>Download</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {reportHistory.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.id}</TableCell>
                  <TableCell>{report.name}</TableCell>
                  <TableCell>{report.createdBy}</TableCell>
                  <TableCell>{report.createdOn}</TableCell>
                  {/* <TableCell>
            <Button
              variant="contained"
            >
              Download
            </Button>
          </TableCell> */}
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
    </>
  );
};

export default ReportPage;
