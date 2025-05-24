import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import {
  Box,
  Modal,
  Typography,
  TextField,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid2 as Grid,
} from "@mui/material";
import {
  createBill,
  updateBill,
  fetchBillDetails,
  refundBill,
} from "../apis/apis"; // Import API function
import { toast } from "react-toastify";
import { fetchOrders } from "../../Orders/apis/apis";
import { IBill, IBillDetailsData } from "../interfaces/interfaces";

interface BillDetailsProps {
  mode: "edit" | "create" | "refund";
  editBill: IBill | null;
  loadBills: () => void;
  open: boolean;
  handleClose: () => void;
  customerId?: string;
}

interface Bill {
  name: string;
  invoice_number: string;
  updated_at: string;
  payment_time: string;
  expect_payment_time: string;
  currency: string;
  customer_id: string;
  orderid: number;
  amount: number;
  subtotal: number;
  tax: number;
  discount: number;
  describe: string;
  type: string;
  status: string;
  balance: string;
  tax_gst: number;
  tax_hst: number;
  tax_pst: number;
  ticket_date: string;
  ticket_time: string;
  ticket_type: string;
  statement_period_from: string;
  statement_period_to: string;
}

const BillDetails: React.FC<BillDetailsProps> = ({
  mode,
  editBill,
  loadBills,
  open,
  handleClose,
  customerId,
}) => {
  const initBill: Bill = {
    name: "",
    invoice_number: "",
    updated_at: "",
    payment_time: "",
    expect_payment_time: "",
    currency: "",
    customer_id: customerId || "",
    orderid: 0,
    amount: 0,
    subtotal: 0,
    tax: 0,
    discount: 0,
    describe: "",
    type: "",
    status: "Unpaid",
    balance: "",
    tax_gst: 0,
    tax_hst: 0,
    tax_pst: 0,
    ticket_date: "",
    ticket_time: "",
    ticket_type: "",
    statement_period_from: "",
    statement_period_to: "",
  };

  const [customerList, setCustomerList] = useState<string[]>([]);
  const [orderList, setOrderList] = useState<string[]>([]);
  const [bill, setBill] = useState<Bill>(initBill);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState<string>("");

  useEffect(() => {
    const loadBillsDetails = async () => {
      if ((mode === "edit" || mode === "refund") && editBill) {
        let updatedBill = { ...initBill, ...editBill };

        try {
          // Fetch bill details and set the default customer based on the email
          const billDetails = await fetchBillDetails(editBill.id);
          const matchingCustomer = customerList.data?.find(
            (customer) => customer.email === billDetails.customer.email
          );

          updatedBill.orderid = billDetails.orderId;

          if (matchingCustomer) {
            updatedBill.customer_id = matchingCustomer.id; // Update the customer_id
          }
          if (billDetails.metadata) {
            // Parse the metadata JSON string
            const metadata = billDetails.metadata;

            // Extract and update tax information
            if (metadata.tax) {
              updatedBill.tax_gst = parseFloat(metadata.tax.GST) || 0;
              updatedBill.tax_hst = parseFloat(metadata.tax.HST) || 0;
              updatedBill.tax_pst = parseFloat(metadata.tax.PST) || 0;
            }

            // Extract and update statement period
            updatedBill.statement_period_from = metadata.period.from || "";
            updatedBill.statement_period_to = metadata.period.to || "";

            // Extract and update ticket-related fields
            updatedBill.ticket_date = metadata.ticket_date || "";
            updatedBill.ticket_time = metadata.ticket_time || "";
            updatedBill.ticket_type = metadata.ticket_type || "";
          }
        } catch (error) {
          console.error("Error loading customer details:", error);
        }
        console.log(`updatedbill = ${JSON.stringify(updatedBill)}`);
        // Update the state with the modified bill
        console.log(`bill = ${JSON.stringify(updatedBill)}`);
        setBill(updatedBill);
      } else {
        setBill(initBill);
      }
    };
    loadBillsDetails();

    setOrders();
    fetchCustomers();
  }, [mode, editBill?.id]);

  useEffect(() => {
    if (open && mode === "refund") {
      setRefundAmount(0);
      setRefundReason("");
    }
  }, [open, mode]);

  // Function to reset the bill state and close the modal
  const handleModalClose = () => {
    setBill(initBill); // Reset the bill state to its initial values
    handleClose(); // Close the modal
  };

  const fetchCustomers = async () => {
    try {
      const response = await axiosInstance.get("/api/customers");
      //console.log("Customers",response.data);
      setCustomerList(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const setOrders = async () => {
    try {
      const response = await fetchOrders();
      console.log("Orders in bill", response.data);
      setOrderList(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleFieldChange = (key: keyof Bill, value: string | number) => {
    const updatedBill: Bill = { ...bill, [key]: String(value) }; // Ensure value is always a string

    // Ensure discount is not greater than subtotal
    if (key === "discount") {
      const subtotal = parseFloat(updatedBill.subtotal) || 0;
      const discount = parseFloat(updatedBill.discount) || 0;
      if (discount > subtotal) {
        updatedBill.discount = "0"; // Set discount to string "0" if greater than subtotal
      }
    }

    // Auto-calculate tax and amount
    if (
      key === "subtotal" ||
      key === "discount" ||
      ["tax_gst", "tax_hst", "tax_pst"].includes(key)
    ) {
      const subtotal = parseFloat(updatedBill.subtotal) || 0;
      const discount = parseFloat(updatedBill.discount) || 0;
      const gst = updatedBill.tax_gst;
      const hst = updatedBill.tax_hst;
      const pst = updatedBill.tax_pst;

      // Calculate tax and amount
      const tax = (subtotal - discount) * (gst + hst + pst);
      const amount = subtotal - discount + tax;

      updatedBill.tax = tax.toFixed(2); // Set tax as string with two decimals
      updatedBill.amount = amount.toFixed(2); // Set amount as string with two decimals
    }

    setBill(updatedBill);
  };

  const handleSave = async () => {
    if (mode === "refund") {
      if (editBill) {
        try {
          await refundBill(editBill.id, refundAmount, refundReason);
          toast.success("Refund requested successfully!");
          handleModalClose();
          loadBills();
        } catch (error: any) {
          toast.error(error.message || "Failed to request refund.");
        }
      } else {
        console.error("editBill is null in refund mode");
        toast.error("Could not perform refund. Bill data missing.");
        return;
      }
      return;
    }

    // Check if the required fields are present
    const missingFields = [];

    // Check each required field and collect missing fields
    if (!bill.customer_id) missingFields.push("Customer");
    if (!bill.type) missingFields.push("Type");
    if (!bill.status) missingFields.push("Status");
    if (!bill.currency) missingFields.push("Currency");
    if (!bill.subtotal) missingFields.push("Subtotal");
    if (!bill.amount) missingFields.push("Amount");
    if (!bill.expect_payment_time) missingFields.push("expect_payment_time");

    if (bill.type === "Subscribe") {
      if (!bill.statement_period_from)
        missingFields.push("statement_period_from");
      if (!bill.statement_period_to) missingFields.push("statement_period_to");
      if (!bill.orderid) missingFields.push("Order ID");
    }

    if (bill.type === "Ticket") {
      if (!bill.ticket_date) missingFields.push("ticket_date");
      if (!bill.ticket_time) missingFields.push("ticket_time");
      if (!bill.ticket_type) missingFields.push("ticket_type");
    }

    // If there are missing fields, show an error message
    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(", ");
      toast.error(
        `Please fill in the following required fields: ${missingFieldsMessage}.`
      );
      return;
    }

    const payload: IBillDetailsData = {
      expect_payment_time: bill.expect_payment_time,
      currency: bill.currency,
      customer_id: Number(bill.customer_id), // Convert to number if needed
      order_id: bill.orderid ? Number(bill.orderid) : 1, // Hardcoded for now
      amount: parseFloat(bill.amount), // Convert to float
      balance: parseFloat(bill.amount) || 0, // Default to 0 if empty
      subTotal: parseFloat(bill.subtotal), // Convert to float
      tax: parseFloat(bill.tax), // Convert to float
      discount: parseFloat(bill.discount) || 0, // Default to 0 if empty
      describe: bill.describe || "",
      type:
        bill.type === "Deposit"
          ? 1
          : bill.type === "Subscribe"
          ? 2
          : bill.type === "Ticket"
          ? 3
          : 0, // Map type to an integer
      metadata: {
        tax: {
          GST: bill.tax_gst,
          HST: bill.tax_hst,
          PST: bill.tax_pst,
        },
        period: {
          from: bill.statement_period_from || null,
          to: bill.statement_period_to || null,
        },
        ticket_date: bill.ticket_date || null,
        ticket_time: bill.ticket_time || null,
        ticket_type: bill.ticket_type || null,
      },
      car_id: 0, // hardcode for now
      admin_id: 0, // hardcode for now
    };

    try {
      console.log(`payload = ${JSON.stringify(payload)}`);
      if (mode == "edit" && editBill) {
        await updateBill(editBill.id, payload);
        loadBills();
        toast.success("Bill updated successfully!");
      } else {
        await createBill(payload); // Call the API
        loadBills();
        toast.success("Bill created successfully!");
      }

      handleModalClose(); // Close the modal after saving
    } catch (error) {
      console.error(`Failed to ${mode} bill: `, error);
      toast.error(`Failed to ${mode} bill. Please try again.`);
    }
  };

  return (
    <Modal open={open} onClose={handleModalClose} disableAutoFocus={true}>
      <Box
        sx={{
          width: "80%",
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "20px",
          margin: "50px auto",
          overflow: "hidden",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {mode === "edit"
            ? "Edit Bill"
            : mode === "refund"
            ? "Refund Bill"
            : "Create Bill"}
        </Typography>

        <Divider sx={{ marginBottom: "20px" }} />

        {/* Form Sections */}
        <Box>
          <Typography fontWeight="bold" sx={{ marginBottom: "10px" }}>
            {mode === "refund" ? "Refund Details" : "Create Invoice"}
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            gutterBottom
            sx={{ marginBottom: "10px" }}
          >
            * Indicates a required field
          </Typography>
          <Grid container spacing={2} marginBottom={3}>
            <Grid size={4}>
              <TextField
                label="Invoice Number"
                fullWidth
                variant="outlined"
                size="small"
                sx={{ marginBottom: "10px" }}
                value={bill.invoice_number}
                InputLabelProps={{ shrink: true }}
                disabled
              />
            </Grid>
            <Grid size={4}>
              <TextField
                label="Updated Time"
                fullWidth
                variant="outlined"
                size="small"
                sx={{ marginBottom: "10px" }}
                value={bill.updated_at}
                InputLabelProps={{ shrink: true }}
                disabled
              />
            </Grid>
            <Grid size={4}>
              <TextField
                label="Last Operator"
                fullWidth
                variant="outlined"
                size="small"
                sx={{ marginBottom: "10px" }}
                value=""
                InputLabelProps={{ shrink: true }}
                disabled
              />
            </Grid>
            <Grid size={4}>
              <TextField
                required
                label="Expect Payment Time"
                fullWidth
                variant="outlined"
                type="datetime-local"
                disabled={mode === "refund"}
                value={
                  bill.expect_payment_time
                    ? (() => {
                        const date = new Date(bill.expect_payment_time);
                        // Ensure the date is formatted to YYYY-MM-DDTHH:mm (local timezone)
                        const localDate = new Date(
                          date.getTime() - date.getTimezoneOffset() * 60000
                        );
                        return localDate.toISOString().slice(0, 16); // Formats to YYYY-MM-DDTHH:mm
                      })()
                    : ""
                }
                onChange={(e) =>
                  setBill({ ...bill, expect_payment_time: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={4}>
              <TextField
                label="Payment Time"
                fullWidth
                variant="outlined"
                size="small"
                sx={{ marginBottom: "10px" }}
                value={bill.payment_time}
                InputLabelProps={{ shrink: true }}
                disabled
              />
            </Grid>
            <Grid size={4}>
              <FormControl fullWidth required>
                <InputLabel id="customer-select-label">Customer</InputLabel>
                <Select
                  labelId="customer-select-label"
                  id="customer-select"
                  value={bill.customer_id}
                  disabled={mode === "refund"}
                  onChange={(e) =>
                    setBill({ ...bill, customer_id: e.target.value })
                  }
                  label="Customer"
                >
                  {customerList.data?.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={4}>
              <FormControl fullWidth required>
                <InputLabel id="type-select-label">Type</InputLabel>
                <Select
                  labelId="type-select-label"
                  id="type-select"
                  value={bill.type}
                  onChange={(e) => setBill({ ...bill, type: e.target.value })}
                  disabled={mode === "edit" || mode === "refund"}
                  label="Type"
                >
                  <MenuItem value="Deposit">Deposit</MenuItem>
                  <MenuItem value="Subscribe">Subscribe</MenuItem>
                  <MenuItem value="Ticket">Ticket</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={4}>
              <FormControl fullWidth required>
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  id="status-select"
                  value={bill.status}
                  onChange={(e) => setBill({ ...bill, status: e.target.value })}
                  label="Status"
                  disabled
                >
                  <MenuItem value="Unpaid">Unpaid</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                  <MenuItem value="Partially Refunded">
                    Partially Refunded
                  </MenuItem>
                  <MenuItem value="Refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={4}>
              <FormControl fullWidth required>
                <InputLabel id="currency-select-label">Currency</InputLabel>
                <Select
                  labelId="currency-select-label"
                  id="currency-select"
                  value={bill.currency}
                  onChange={(e) =>
                    setBill({ ...bill, currency: e.target.value })
                  }
                  disabled={mode === "refund"}
                  label="Currency"
                >
                  <MenuItem value="cad">CAD</MenuItem>
                  <MenuItem value="usd">USD</MenuItem>
                  <MenuItem value="eur">EUR</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {bill.type == "Subscribe" && (
              <>
                <Grid size={4}>
                  <TextField
                    select
                    required
                    label="Order ID"
                    fullWidth
                    size="small"
                    value={bill.orderid}
                    onChange={(e) =>
                      setBill({ ...bill, orderid: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value="" disabled>
                      Select Order ID
                    </MenuItem>
                    {orderList.map((order) => (
                      <MenuItem key={order.id} value={order.id}>
                        {order.id}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={4}>
                  <TextField
                    required
                    label="Statement Period Start"
                    fullWidth
                    variant="outlined"
                    type="date"
                    value={bill.statement_period_from}
                    onChange={(e) =>
                      setBill({
                        ...bill,
                        statement_period_from: e.target.value,
                      })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={4}>
                  <TextField
                    required
                    label="Statement Period End"
                    fullWidth
                    variant="outlined"
                    type="date"
                    value={bill.statement_period_to}
                    onChange={(e) =>
                      setBill({ ...bill, statement_period_to: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
            {bill.type == "Ticket" && (
              <>
                <Grid size={4}>
                  <TextField
                    required
                    label="Ticket Date"
                    fullWidth
                    variant="outlined"
                    type="date"
                    value={bill.ticket_date}
                    onChange={(e) =>
                      setBill({ ...bill, ticket_date: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={4}>
                  <TextField
                    required
                    label="Ticket Time"
                    fullWidth
                    variant="outlined"
                    type="time"
                    value={bill.ticket_time}
                    onChange={(e) =>
                      setBill({ ...bill, ticket_time: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={4}>
                  <TextField
                    required
                    label="Ticket Type"
                    fullWidth
                    variant="outlined"
                    value={bill.ticket_type}
                    onChange={(e) =>
                      setBill({ ...bill, ticket_type: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
            <Grid size={3}>
              <TextField
                required
                label="Subtotal"
                type="number"
                fullWidth
                variant="outlined"
                size="small"
                disabled={mode === "refund"}
                sx={{ marginBottom: "10px" }}
                value={bill.subtotal}
                onChange={(e) => handleFieldChange("subtotal", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={3}>
              <TextField
                label="Discount"
                type="number"
                fullWidth
                variant="outlined"
                size="small"
                sx={{ marginBottom: "10px" }}
                disabled={mode === "refund"}
                value={bill.discount}
                onChange={(e) => handleFieldChange("discount", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={3}>
              <TextField
                label="Tax"
                fullWidth
                variant="outlined"
                size="small"
                sx={{ marginBottom: "10px" }}
                value={bill.tax}
                InputLabelProps={{ shrink: true }}
                disabled
              />
            </Grid>
            <Grid size={3}>
              <TextField
                required
                label="Amount"
                fullWidth
                variant="outlined"
                size="small"
                sx={{ marginBottom: "10px" }}
                value={bill.amount}
                InputLabelProps={{ shrink: true }}
                disabled
              />
            </Grid>
            {mode !== "refund" && (
              <>
                <Grid size={4}>
                  <TextField
                    label="Tax Detail (GST)"
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{ marginBottom: "10px" }}
                    value={bill.tax_gst}
                    onChange={(e) =>
                      handleFieldChange("tax_gst", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                    type="number"
                    inputProps={{ min: 0, max: 1, step: 0.01 }}
                  />
                </Grid>
                <Grid size={4}>
                  <TextField
                    label="Tax Detail (HST)"
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{ marginBottom: "10px" }}
                    value={bill.tax_hst}
                    onChange={(e) =>
                      handleFieldChange("tax_hst", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                    type="number"
                    inputProps={{ min: 0, max: 1, step: 0.01 }}
                  />
                </Grid>
                <Grid size={4}>
                  <TextField
                    label="Tax Detail (PST)"
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{ marginBottom: "10px" }}
                    value={bill.tax_pst}
                    onChange={(e) =>
                      handleFieldChange("tax_pst", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                    type="number"
                    inputProps={{ min: 0, max: 1, step: 0.01 }}
                  />
                </Grid>
              </>
            )}

            {mode !== "refund" && (
              <Grid size={12}>
                <TextField
                  multiline
                  label="Description"
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{ marginBottom: "10px" }}
                  value={bill.describe}
                  onChange={(e) =>
                    setBill({ ...bill, describe: e.target.value })
                  }
                  rows={5}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}
            {mode === "refund" && (
              <>
                <Grid size={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Quick Refund Options:
                  </Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => setRefundAmount(bill.subtotal)}
                    >
                      Full Refund
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setRefundAmount(bill.subtotal * 0.6)}
                    >
                      Refund 60%
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setRefundAmount(bill.subtotal / 2)}
                    >
                      Refund 50%
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setRefundAmount(bill.subtotal * 0.25)}
                    >
                      Refund 25%
                    </Button>
                  </Box>
                </Grid>
                <Grid size={6}>
                  <TextField
                    label="Refund Amount"
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{ marginBottom: "10px" }}
                    value={refundAmount}
                    onChange={(e) => {
                      const inputValue = parseFloat(e.target.value);
                      if (!isNaN(inputValue) && inputValue > bill.subtotal) {
                        setRefundAmount(bill.subtotal);
                      } else if (!isNaN(inputValue)) {
                        setRefundAmount(inputValue);
                      } else {
                        setRefundAmount(0);
                      }
                    }}
                    InputLabelProps={{ shrink: true }}
                    type="number"
                    inputProps={{ min: 0, max: bill.subtotal, step: 1 }}
                    helperText={`Maximum refund amount: ${bill.subtotal}`}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    label="Refund Reason"
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{ marginBottom: "10px" }}
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}

            <Grid size={12}>
              <Divider sx={{ marginBottom: "20px" }} />
            </Grid>
          </Grid>
        </Box>

        {/* Action Buttons */}
        <Box display="flex" justifyContent="center" mt={3} gap={2}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#000",
              borderRadius: "20px",
              padding: "10px 20px",
            }}
            onClick={handleSave}
          >
            {mode === "edit"
              ? "Save"
              : mode === "refund"
              ? "Request Refund"
              : "Create"}
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#000",
              borderRadius: "20px",
              padding: "10px 20px",
            }}
            onClick={handleModalClose}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default BillDetails;
