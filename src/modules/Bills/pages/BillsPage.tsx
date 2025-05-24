import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Pagination,
  TextField,
  MenuItem,
  Grid as Grid,
} from "@mui/material";
import { fetchBills, fetchBillFilters } from "../apis/apis"; // Import API function
import ImportBill from "../components/ImportBill";
import BillDetails from "../components/BillDetails";
import BillStatusChart from "../components/BillStatusChart";
import DetailsMenu from "../components/DetailsMenu";
import { IBill } from "../interfaces/interfaces";
import BillRefund from "../components/BillRefund";

interface BillsPagePros {
  isEdit?: boolean;
  customerId?: number;
  onRefresh?: (fn: () => void) => void; // Callback to pass refresh function
}

export const BillsPage: React.FC<BillsPagePros> = ({
  isEdit = true,
  customerId = null,
  onRefresh,
}) => {

  // State for bills and filters
  const [bills, setBills] = useState<IBill[]>([]);
  const [editBill, setEditBill] = useState<IBill | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // State to handle loading
  const [filter, setFilter] = useState("");
  const [filters, setFilters] = useState<{
    status: Record<string, string>;
    type: Record<string, string>;
  } | null>(null);
  const defaultFilters = {
    status: { key: "", value: "All Status" },
    type: { key: "", value: "All Type" },
  };
  const [selectedFilters, setSelectedFilters] = useState<any>(defaultFilters);
  const defaultPagin = {
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
  };
  const [pagination, setPagination] = useState(defaultPagin);

  // Fetch bills from the API
  const loadBills = async () => {
    try {
      setLoading(true); // Start loading

      //console.log(`selectedFilters = ${JSON.stringify(selectedFilters)}`);

      const response = await fetchBills(
        pagination.currentPage,
        pagination.perPage,
        filter || "",
        selectedFilters.status.key || "",
        selectedFilters.type.key || "",
        customerId
      ); // Fetch bills from the API

      // Transform the API response into the format expected by the component
      const transformedBills = response.data.map((bill: any) => ({
        id: bill.id,
        currency: bill.currency,
        amount: bill.amount,
        subtotal: bill.subTotal,
        tax: bill.tax,
        discount: bill.discount,
        status: bill.status,
        type: bill.type,
        invoice_number: bill.invoiceNumber,
        customer: bill.customer?.name || "Unknown",
        expect_payment_time: bill.expectPaymentTime,
        created_at: bill.expectPaymentTime, // Assuming created_at is the same as expectPaymentTime
      }));
      if (response) {
        setPagination((prev) => ({
          ...prev,
          currentPage: response.meta.currentPage,
          lastPage: response.meta.lastPage,
          total: response.meta.total,
        }));
      }

      setBills(transformedBills); // Set the transformed bills into state
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const loadBillFilters = async () => {
    const filterData = await fetchBillFilters();
    setFilters(filterData);
    console.log(`fetchBillFilters(); = ${JSON.stringify(filterData)}`);
  };
  useEffect(() => {
    loadBills();
    loadBillFilters();
  }, []);

  useEffect(() => {
    // pagin update
    loadBills();
    // loadBillFilters();
  }, [pagination.currentPage]);

  useEffect(() => {
    reFreshTable();
  }, [selectedFilters]);

  useEffect(() => {
    if (onRefresh) {
      onRefresh(() => reFreshTable());
    }
  }, [onRefresh]);

  const reFreshTable = () => {
    setPagination((prev) => {
      if (prev.currentPage === defaultPagin.currentPage) {
        // If already on the first page, directly load bills
        loadBills();
        return prev;
      }
      // Otherwise, reset pagination to the first page
      return defaultPagin;
    });
  };

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const handleOpenImport = () => {
    setIsImportModalOpen(true);
  };
  const handleCloseImport = () => {
    setIsImportModalOpen(false);
  };

  const [mode, setMode] = useState<"edit" | "create" | "refund">("create");
  const [isDetailsModalOpen, setisDetailsModalOpen] = useState(false);
  const handleOpenDetails = (bill: IBill | null, mode: "edit" | "create") => {
    setEditBill(bill); // Set the bill (or null)
    setMode(mode); // Set the mode (either 'edit' or 'create')
    setisDetailsModalOpen(true); // Open the modal
  };

  const handleCloseEdit = () => {
    setisDetailsModalOpen(false);
    setEditBill(null);
  };

  const statusColors = {
    Paid: "#C6D2EE",
    Unpaid: "#2158DB",
    Refunded: "#CBE1EC",
    Failed: "#D9DCE0",
  };

  const handlePaginationChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  // Handle search change for filters
  const handleFilterChange = () => {
    setPagination(defaultPagin);
    loadBills();
  };

  const handleFilterSelection = (
    category: string,
    key: string,
    value: string
  ) => {
    setSelectedFilters({
      ...selectedFilters,
      [category]: { key, value }, // Store both key and value
    });
  };

  const handleFilterReset = () => {
    setFilter("");
    setPagination(defaultPagin);
    setSelectedFilters(defaultFilters);
  };

  return (
    <Box padding="16px" bgcolor="#f9f9f9">
      {/* Bill Status Chart */}
      {isEdit && (
        <Box bgcolor="#ffffff" borderRadius="8px" padding="16px">
          <BillStatusChart />
        </Box>
      )}

      {/* Bills Table */}
      <Box bgcolor="#ffffff" borderRadius="8px" padding="16px">
        <Grid container spacing={2} alignItems="center" wrap="wrap">
          {isEdit && (
            <>
              {/* Customer Name or Invoice Number Input */}
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  label="Customer Name or Invoice Number"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  onBlur={handleFilterChange}
                />
              </Grid>

              {/* Status Dropdown */}
              <Grid item xs={12} sm={6} md={3} lg={2}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={selectedFilters.status.value}
                  onChange={(e) => {
                    const selectedKey = Object.keys(filters?.status || {}).find(
                      (key) => filters.status[key] === e.target.value
                    );
                    handleFilterSelection(
                      "status",
                      selectedKey || "",
                      e.target.value
                    );
                  }}
                >
                  <MenuItem key="" value="All Status">
                    All Status
                  </MenuItem>
                  {filters?.status &&
                    Object.entries(filters.status).map(([key, value]) => (
                      <MenuItem key={key} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>

              {/* Type Dropdown */}
              <Grid item xs={12} sm={6} md={3} lg={2}>
                <TextField
                  select
                  label="Type"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={selectedFilters.type.value}
                  onChange={(e) => {
                    const selectedKey = Object.keys(filters?.type || {}).find(
                      (key) => filters.type[key] === e.target.value
                    );
                    handleFilterSelection(
                      "type",
                      selectedKey || "",
                      e.target.value
                    );
                  }}
                >
                  <MenuItem key="" value="All Type">
                    All Type
                  </MenuItem>
                  {filters?.type &&
                    Object.entries(filters.type).map(([key, value]) => (
                      <MenuItem key={key} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>

              {/* Clear All Button */}
              <Grid item xs={12} sm={6} md={2} lg={2}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    backgroundColor: "black",
                    width: "100%",
                    textTransform: "none",
                  }}
                  onClick={handleFilterReset}
                >
                  Clear All
                </Button>
              </Grid>

              {/* Import Button */}
              <Grid item xs={12} sm={6} md={2} lg={1}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: 20,
                    width: "100%",
                    textTransform: "none",
                  }}
                  onClick={handleOpenImport}
                >
                  Import
                </Button>
              </Grid>
            </>
          )}

          {/* Create Invoice Button */}
          <Grid item xs={12} sm={6} md={2} lg={2}>
            <Button
              variant="contained"
              color="primary"
              sx={{
                backgroundColor: "black",
                width: "100%",
                textTransform: "none",
              }}
              onClick={() => handleOpenDetails(null, `create`)}
            >
              + Create Invoice
            </Button>
          </Grid>
        </Grid>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  "Bill ID",
                  "Amount",
                  "Status",
                  "Refund %",
                  "Type",
                  "Invoice Number",
                  "Customer",
                  "Due",
                  "Created",
                  "",
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
              {bills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell>{bill.id}</TableCell>
                  <TableCell>{bill.amount}</TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        backgroundColor:
                          statusColors[
                            bill.status as keyof typeof statusColors
                          ] ?? "#ff0000",
                        padding: "4px 8px",
                        borderRadius: "16px",
                        display: "inline-block",
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: ["Paid", "Unpaid"].includes(bill.status)
                          ? "#fff"
                          : "#000",
                      }}
                    >
                      {bill.status}
                    </Typography>
                  </TableCell>
                  <TableCell>{bill.discount}</TableCell>
                  <TableCell>{bill.type}</TableCell>
                  <TableCell>{bill.invoice_number}</TableCell>
                  <TableCell>{bill.customer}</TableCell>
                  <TableCell>
                    {new Date(bill.expect_payment_time).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(bill.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleOpenDetails(bill, `edit`)}
                      sx={{
                        textTransform: "none",
                        fontSize: "12px",
                        padding: "4px 8px",
                        backgroundColor: "#000",
                        "&:hover": { backgroundColor: "#1E50C0" },
                      }}
                    >
                      Edit
                    </Button>
                    <DetailsMenu
                      id={bill.id}
                      status={bill.status}
                      hasDeletePermission={true}
                      noInvoiceStatusArray={[]}
                      loadBills={loadBills}
                      isEdit={isEdit}
                      bill={bill}
                      handleOpenDetails={handleOpenDetails}
                    />
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
      </Box>
      <ImportBill
        loadBills={loadBills}
        open={isImportModalOpen}
        handleClose={handleCloseImport}
      />
      <BillDetails
        mode={mode}
        editBill={editBill}
        loadBills={loadBills}
        open={isDetailsModalOpen}
        handleClose={handleCloseEdit}
        customerId={customerId}
      />
    </Box>
  );
};

export default BillsPage;
