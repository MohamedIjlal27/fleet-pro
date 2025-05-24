import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Modal, Box, Typography, Button, TextField, Input, Divider, Link, 
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import { createCustomer } from '../apis/apis';

interface ImportModalProps {
  open: boolean;
  handleClose: () => void;
  loadCustomers: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({
  open,
  handleClose,
  loadCustomers,
}) => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
    
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
      for (const customer of csvData) {
        try {
          const createdCustomer = await createCustomer({
            email: customer["Email"],
            firstName: customer["First Name"],
            lastName: customer["Last Name"],
            phone: customer["Phone"]
          });

          toast.success(`Customer for ${customer["First Name"]} ${customer["Last Name"]} created successfully.`);
        } catch (error: any) {
          toast.error(`Failed to create customer for ${customer["First Name"]} ${customer["Last Name"]}: ${error.message}`);
        }
      }
  
      setCsvData([]);
      setFileName("");
      loadCustomers(); // Refresh the customer list after all submissions
      handleClose();
    } catch (error: any) {
      console.error("Error processing CSV data:", error.message);
      toast.error("Failed to process CSV data. Please try again.");
    }
  };

  return (
    <Dialog
      key='new-customer'
      open={open}
      onClose={handleClose}
      disableAutoFocus={true}
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          padding: 2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'var(--THEME_COLOR)',
          color: 'gray',
          fontWeight: 'bold',
        }}
      >
        Import Customers
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'gray',
            '&:hover': { color: '#ff6666' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box>
          <Typography variant="body1" color="textSecondary" gutterBottom>
              * Indicates a required field
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              * Select your CSV file
          </Typography>
          <Input
            type="file"
            onChange={handleFileChange}
            inputProps={{ accept: ".csv" }}
            sx={{ mb: 2, p: 2 }}
          />

          {fileName && (
            <Typography variant="subtitle1" color="textSecondary">
              Selected File: {fileName}
            </Typography>
          )}
          
          <Typography variant="subtitle1">Directions</Typography>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '16px' }}>
              <li>Ensure that your CSV file is no larger than 5MB.</li>
              <li>Make sure that the first row of your CSV file contains column headers.</li>
          </ul>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1">CSV Example</Typography>
          Download the CSV template: <Link
          target="_blank"
          href="/download/csv/tpl-import-customers.csv"
          sx={{ marginRight: 2, color: "#0070f3" }}
          >
          tpl-import-customers.csv
          </Link>
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: '', pt: 2 }}>
        <Button onClick={handleClose} variant="contained" sx={{ mr: 1, backgroundColor: '#6C757D' }} >
            Close
        </Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ mr: 1, backgroundColor: '#727cf5' }}>
            Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportModal;
