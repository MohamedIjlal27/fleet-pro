import React from "react";
import { Box, Typography, Button, TextField, MenuItem, Grid } from "@mui/material";

interface CreateInvoiceModalProps {
  onClose: () => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ onClose }) => {
  return (
    <Box>
      <Button variant="text" onClick={onClose} sx={{ color: "gray", mb: 2 }}>
        Back List
      </Button>
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Create Invoice
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={4}>
          <TextField label="Invoice Number" required fullWidth />
        </Grid>
        <Grid item xs={4}>
          <TextField label="Updated Time" fullWidth />
        </Grid>
        <Grid item xs={4}>
          <TextField label="Last Operator" fullWidth />
        </Grid>
        <Grid item xs={4}>
          <TextField label="Expect Payment Time" required fullWidth type="datetime-local" InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={4}>
          <TextField label="Payment Time" fullWidth type="datetime-local" InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={4}>
          <TextField label="Customer" select required fullWidth>
            <MenuItem value="customer1">Customer 1</MenuItem>
            <MenuItem value="customer2">Customer 2</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={4}>
          <TextField label="Type" select required fullWidth>
            <MenuItem value="type1">Type 1</MenuItem>
            <MenuItem value="type2">Type 2</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={4}>
          <TextField label="Status" select required fullWidth>
            <MenuItem value="unpaid">Unpaid</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={4}>
          <TextField label="Currency" select required fullWidth>
            <MenuItem value="usd">USD</MenuItem>
            <MenuItem value="eur">EUR</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={4}>
          <TextField label="Subtotal" fullWidth />
        </Grid>
        <Grid item xs={4}>
          <TextField label="Discount" fullWidth defaultValue={0} />
        </Grid>
        <Grid item xs={4}>
          <TextField label="Tax" fullWidth defaultValue={0} />
        </Grid>
        <Grid item xs={4}>
          <TextField label="Amount" required fullWidth defaultValue={0} />
        </Grid>
        <Grid item xs={12}>
          <Button variant="outlined" sx={{ mt: 2 }}>
            + Add Another Item
          </Button>
        </Grid>
        <Grid item xs={12}>
          <TextField label="Description" fullWidth multiline rows={4} />
        </Grid>
      </Grid>

      <Box mt={4} display="flex" justifyContent="flex-end">
        <Button variant="contained" color="primary" sx={{ backgroundColor: "#6c5ce7", color: "white", textTransform: "none" }}>
          Save
        </Button>
      </Box>
    </Box>
  );
};


