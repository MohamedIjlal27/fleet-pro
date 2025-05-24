import React, { useState } from "react";
import {
  Box,
  Modal,
  Typography,
  Input,
  Button,
  Divider,
  Link,
} from "@mui/material";
import { toast } from "react-toastify";
import { createBill } from "../apis/apis";
import { IBillDetailsData } from "../interfaces/interfaces";
import { useAppSelector } from '/src/redux/app/store.ts';

interface ImportBillProps {
  loadBills: () => void;
  open: boolean;
  handleClose: () => void;
}

const ImportBill: React.FC<ImportBillProps> = ({ loadBills, open, handleClose }) => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const user = useAppSelector((state) => state.user);

  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    if (file.type !== "text/csv") {
      toast.error("Only CSV files are allowed.");
      return;
    }

    setFileName(file.name); // Save file name for reference
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      parseCSV(content);
    };

    reader.readAsText(file);
  };

  const parseCSV = (content: string) => {
    try {
      const rows = content
        .split("\n")
        .map((row) => row.trim())
        .filter((row) => row);

      if (rows.length === 0) {
        toast.error("CSV is empty.");
        return;
      }

      // Assuming first row contains headers
      const headers = rows[0].split(",").map((header) => header.trim());
      const data = rows.slice(1).map((row) => {
        const values = row.split(",").map((value) => value.trim());
        return headers.reduce((acc, header, index) => {
          acc[header] = values[index] || null;
          return acc;
        }, {} as Record<string, any>);
      });

      setCsvData(data);
      toast.success("CSV parsed successfully.");
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast.error("Failed to parse the CSV. Please check its format.");
    }
  };

  const handleSubmit = async () => {
    if (!csvData.length) {
      toast.error("No data to submit. Please upload a valid CSV file.");
      return;
    }
  
    try {
      for (const bill of csvData) {
        const billData: IBillDetailsData = {
          expect_payment_time: bill["Expect Payment Time"],
          currency: bill.Currency,
          customer_id: 1, // Replace with actual customer ID logic
          order_id: 1, // Replace with actual order ID logic
          car_id: 1, // Replace with actual car ID logic
          admin_id: 1, // Replace with actual admin ID logic
          amount: parseFloat(bill.Amount),
          balance: 0, // Set to 0 if no balance logic
          subTotal: parseFloat(bill.Subtotal),
          tax: parseFloat(bill.Tax),
          discount: parseFloat(bill.Discount),
          describe: bill.Describe || "",
          metadata: {}, // Optional: store raw data for debugging
          type: parseInt(bill.Type, 10),
        };
        console.log(`billData = ${JSON.stringify(billData)}`)
        try {   
          await createBill(billData);
          toast.success(`Bill for invoice ${bill["Invoice Number"]} created successfully.`);
        } catch (error: any) {
          toast.error(`Failed to create bill for invoice ${bill["Invoice Number"]}: ${error.message}`);
        }
      }
  
      loadBills(); // Refresh the bills list after all submissions
      handleClose();
    } catch (error: any) {
      console.error("Error processing CSV data:", error.message);
      toast.error("Failed to process CSV data. Please try again.");
    }
  };
  

  return (
    <Modal open={open} onClose={handleClose} disableAutoFocus={true}>
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
          sx={{ fontWeight: "bold", marginBottom: "20px", textAlign: "center" }}
        >
          Import Bills
        </Typography>

        <Divider sx={{ marginBottom: "20px" }} />

        <Typography fontWeight="bold" sx={{ marginBottom: "10px" }}>
          Upload CSV File
        </Typography>
        <Input
          type="file"
          onChange={handleFileChange}
          inputProps={{ accept: ".csv" }}
          sx={{ mb: 2 }}
        />

        {fileName && (
          <Typography variant="subtitle1" color="textSecondary">
            Selected File: {fileName}
          </Typography>
        )}

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Directions
        </Typography>
        <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginBottom: "16px" }}>
          <li>Ensure that your CSV file is no larger than 5MB.</li>
          <li>Make sure that the first row contains column headers.</li>
          <li>Bill Type: 1: Deposit, 2: Subscribe, 3: Ticket.</li>
          <li>Bill Status: 0: Unpaid, 1: Paid, 3: Refunded, 4: Part Refunded.</li>
        </ul>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1">CSV Example</Typography>
        <Link
          target="_blank"
          href="/download/csv/tpl-import-bills.csv"
          sx={{ marginRight: 2, color: "#0070f3" }}
        >
          tpl-import-bills.csv
        </Link>

        <Box display="flex" justifyContent="center" mt={3} gap={2}>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#000", borderRadius: "20px", padding: "10px 20px" }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#000", borderRadius: "20px", padding: "10px 20px" }}
            onClick={handleClose}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ImportBill;
