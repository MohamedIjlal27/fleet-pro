import React, { useState, useEffect } from "react";
import axios, { AxiosError } from 'axios';
import axiosInstance from '../../../utils/axiosConfig';
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
    Input,
    MenuItem,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Grid2 as Grid,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { createBill } from "../apis/apis"; // Import API function
import { toast } from "react-toastify";
import { fetchOrders } from "../../Orders/apis/apis";

interface AddBillProps {
    loadBills: () => void;
    open: boolean;
    handleClose: () => void;
}

interface Bill {
    name: string;
    invoice_number: string;
    updated_at: string;
    payment_time: string;
    expect_payment_time: string;
    currency: string;
    customer_id: string;
    order_id: string;
    amount: string;
    subtotal: string;
    tax: string;
    discount: string;
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

const initBill : Bill = {
    name: '',
    invoice_number: '',
    updated_at: '',
    payment_time: '',
    expect_payment_time: '',
    currency: '',
    customer_id: '',
    order_id: '',
    amount: '',
    subtotal: '',
    tax: '',
    discount: '',
    describe: '',
    type: '',
    status: 'Unpaid',
    balance: '',
    tax_gst: 0,
    tax_hst: 0,
    tax_pst: 0,
    ticket_date: '',
    ticket_time: '',
    ticket_type: '',
    statement_period_from: '',
    statement_period_to: '',
}


const AddBill: React.FC<AddBillProps> = ({ loadBills, open, handleClose }) => {
    const [customerList, setCustomerList] = useState<string[]>([]);
    const [orderList, setOrderList] = useState<string[]>([]);
    const [bill, setBill] = useState(initBill);

    useEffect(() => {

        const fetchCustomers = async () => {
            try {
                const response = await axiosInstance.get('/api/customers');
                setCustomerList(response.data);
            } catch (error) {
                console.error("Error fetching customers:", error);
            }
        };


        console.log("Orders in bill fetchOrders");
        setOrders();
        fetchCustomers();
    }, []);

    // Function to reset the bill state and close the modal
    const handleModalClose = () => {
        setBill(initBill); // Reset the bill state to its initial values
        handleClose(); // Close the modal
    };



    const setOrders = async () => {
        fetchOrders
        try {
            const response = await fetchOrders();
            console.log("Orders in bill",response.data);
            setOrderList(response.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    }

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
        if (!bill.describe) missingFields.push("describe");

        // If there are missing fields, show an error message
        if (missingFields.length > 0) {
            const missingFieldsMessage = missingFields.join(", ");
            toast.error(`Please fill in the following required fields: ${missingFieldsMessage}.`);
            return;
        }
    
    
        const payload = {
            expect_payment_time: bill.expect_payment_time,
            currency: bill.currency,
            customer_id: Number(bill.customer_id), // Convert to number if needed
            order_id: bill.order_id ? Number(bill.order_id) : 1, // Hardcoded for now
            amount: parseFloat(bill.amount), // Convert to float
            balance: parseFloat(bill.balance) || 0, // Default to 0 if empty
            subTotal: parseFloat(bill.subtotal), // Convert to float
            tax: parseFloat(bill.tax), // Convert to float
            discount: parseFloat(bill.discount) || 0, // Default to 0 if empty
            describe: bill.describe,
            type: bill.type === "Deposit" ? 1 : bill.type === "Subscribe" ? 2 : bill.type === "Ticket" ? 3 : null, // Map type to an integer
            //organizationId: 1, // Hardcoded for now
            metadata: JSON.stringify({
                ticket_date: bill.ticket_date || null,
                ticket_time: bill.ticket_time || null,
                ticket_type: bill.ticket_type || null,
                statement_period_from: bill.statement_period_from || null,
                statement_period_to: bill.statement_period_to || null,
                tax_details: {
                    gst: bill.tax_gst,
                    hst: bill.tax_hst,
                    pst: bill.tax_pst,
                },
            }),
            car_id: 0, // hardcode for now 
            admin_id: 0, // hardcode for now 
        };


        try {
            console.log(`payload = ${JSON.stringify(payload)}`)
            await createBill(payload); // Call the API

            loadBills();

            toast.success("Bill created successfully!");
            handleModalClose(); // Close the modal after saving
        } catch (error) {
            console.error("Failed to create bill:", error);
            toast.error("Failed to create bill. Please try again.");
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
                    add Bills
                </Typography>

                <Divider sx={{ marginBottom: "20px" }} />

                {/* Form Sections */}
                <Box>
                    <Typography fontWeight="bold" sx={{ marginBottom: "10px" }}>
                        Create Invoice
                    </Typography>
                    <Typography variant="body1" color="textSecondary" gutterBottom sx={{ marginBottom: "10px" }}>
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
                                value={bill.expect_payment_time}
                                onChange={(e) => setBill({ ...bill, expect_payment_time: e.target.value })}
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
                                    onChange={(e) => setBill({ ...bill, customer_id: e.target.value })}
                                    label="Customer"
                                >
                                    {customerList.data?.map((customer) => (
                                        <MenuItem key={customer.id} value={customer.id}>
                                            {customer.firstName} {customer.lastName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/*<FormControl fullWidth variant="outlined" required>
                                    <InputLabel shrink htmlFor="customer">Customer</InputLabel>
                                    <Select
                                        fullWidth
                                        displayEmpty
                                        value={bill.customer_id}
                                        onChange={(e) => setBill({ ...bill, customer_id: e.target.value })}
                                        input={<Input name="customer" id="customer" />}
                                    >
                                        <MenuItem value="" selected disabled>Select</MenuItem>
                                        {customerList.data?.map((customer) => (
                                            <MenuItem key={customer.id} value={customer.id}>
                                                {customer.firstName} {customer.lastName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>*/}
                        </Grid>
                        <Grid size={4}>
                            <FormControl fullWidth required>
                                <InputLabel id="type-select-label">Type</InputLabel>
                                <Select
                                    labelId="type-select-label"
                                    id="type-select"
                                    value={bill.type}
                                    onChange={(e) => setBill({ ...bill, type: e.target.value })}
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
                                    <MenuItem value="Partially Refunded">Partially Refunded</MenuItem>
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
                                    onChange={(e) => setBill({ ...bill, currency: e.target.value })}
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
                                        value={bill.order_id}
                                        onChange={(e) => setBill({ ...bill, order_id: e.target.value })}
                                        InputLabelProps={{ shrink: true }}
                                    >
                                        <MenuItem value="" disabled>Select</MenuItem>
                                        {orderList.data?.map((order) => (
                                            <MenuItem key={order.id} value={order.id}>
                                                {order.Name}
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
                                        onChange={(e) => setBill({ ...bill, statement_period_from: e.target.value })}
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
                                        onChange={(e) => setBill({ ...bill, statement_period_to: e.target.value })}
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
                                        onChange={(e) => setBill({ ...bill, ticket_date: e.target.value })}
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
                                        onChange={(e) => setBill({ ...bill, ticket_time: e.target.value })}
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
                                        onChange={(e) => setBill({ ...bill, ticket_type: e.target.value })}
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
                        <Grid size={4}>
                            <TextField
                                label="Tax Detail (GST)"
                                fullWidth
                                variant="outlined"
                                size="small"
                                sx={{ marginBottom: "10px" }}
                                value={bill.tax_gst}
                                onChange={(e) => handleFieldChange("tax_gst", e.target.value)}
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
                                onChange={(e) => handleFieldChange("tax_hst", e.target.value)}
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
                                onChange={(e) => handleFieldChange("tax_pst", e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                type="number"
                                inputProps={{ min: 0, max: 1, step: 0.01 }}
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                multiline
                                required
                                label="Description"
                                fullWidth
                                variant="outlined"
                                size="small"
                                sx={{ marginBottom: "10px" }}
                                value={bill.describe} onChange={(e) => setBill({ ...bill, describe: e.target.value })}
                                rows={5}
                                InputLabelProps={{ shrink: true }}
                            />
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
                        Save
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

export default AddBill;
