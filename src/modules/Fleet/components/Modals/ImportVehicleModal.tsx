import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  IconButton,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  Box,
  Typography, Input, Divider, Link,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
// import axiosInstance from '../../../../utils/axiosConfig'; // Commented out for demo mode
import { IVehicleData } from '../../interfaces/interfaces';
import { IDriver } from '../../../Operations/Drivers/interfaces/driver.interface';
import { RootState } from '../../../../redux/app/store';
import { useSelector } from 'react-redux';
import { fetchVehicleFilters, createVehicle } from '../../apis/apis';

interface ImportVehicleModalProps {
  open: boolean;
  onClose: () => void;
  vehicleData?: IVehicleData;
}

const ImportVehicleModal: React.FC<ImportVehicleModalProps> = ({
  open,
  onClose,
  vehicleData,
}) => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [garages, setGarages] = useState<{ id: number; name: string }[]>([]);
  const [fuelTypeOptions, setFuelTypeOptions] = useState<Record<string, string>>({});
  const [transmissionTypeOptions, setTransmissionTypeOptions] = useState<Record<string, string>>({});
  const [statusOptions, setStatusOptions] = useState<Record<string, string>>({});
  const [categoryOptions, setCategoryOptions] = useState<Record<string, string>>({});

  useEffect(() => {
      if (open) {
        fetchGarages();
        loadOptions()
      }
    }, [open]);

  const fetchGarages = async () => {
    try {
      console.log('[DEMO MODE] fetchGarages - returning demo data');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Demo garages data
      const garagesData = [
        { id: 1, name: 'Main Depot' },
        { id: 2, name: 'North Branch' }
      ];
      setGarages(garagesData);
    } catch (error: any) {
      toast.error('Error fetching garages: ' + error.message);
    }
  };
  
  const loadOptions = async () => {
    try {
      const response = await fetchVehicleFilters();

      // Use demo data for missing properties
      setFuelTypeOptions({
        'Gasoline': 'Gasoline',
        'Diesel': 'Diesel',
        'Electric': 'Electric',
        'Hybrid': 'Hybrid'
      });
      setTransmissionTypeOptions({
        'Automatic': 'Automatic',
        'Manual': 'Manual',
        'CVT': 'CVT'
      });
      setStatusOptions(response?.status || {
        'Available': 'Available',
        'InUse': 'In Use',
        'Maintenance': 'Maintenance'
      });
      setCategoryOptions({
        'Sedan': 'Sedan',
        'SUV': 'SUV',
        'Truck': 'Truck',
        'Van': 'Van'
      });

    } catch (error: any) {
      toast.error('Error fetching filters: ' + error.message);
    }
  };
  
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
      for (const vehicle of csvData) {
        try {
          const createdVehicle = await createVehicle({
            make: vehicle["Vehicle Make"],
            model: vehicle["Vehicle Model"],
            trim: vehicle["Vehicle Trim"] || null,
            vin: vehicle["VIN Number"] || null,
            chasisNo: vehicle["Chassis Number"] || null,
            plateNumber: vehicle["Plate Number"],
            year: Number(vehicle["Year"]),
            bodyClass: vehicle["Vehicle Body Type"] || null,
            driveType: vehicle["Driven Wheel"] || null,
            fuelType: vehicle["Fuel Type"] || null,
            color: vehicle["Color"] || null,
            doors: Number(vehicle["Doors"]) || null,
            odometer: Number(vehicle["Odometer"]) || null,
            transmissionType: vehicle["Transmission Type"] || null,
            status: vehicle["Status"],
            garageId: Number(vehicle["Parking"]),
            category: vehicle["Category"] || null,
            otherCategory: vehicle["Other Category"] || null,
          });

          toast.success(`Vehicle for ${vehicle["VIN Number"]} ${vehicle["Chassis Number"]} created successfully.`);
        } catch (error: any) {
          toast.error(`Failed to create vehicle for ${vehicle["VIN Number"]} ${vehicle["Chassis Number"]}: ${error.message}`);
        }
      }
  
      setCsvData([]);
      setFileName("");
      //loadLeads(); // Refresh the bills list after all submissions
      onClose();
    } catch (error: any) {
      console.error("Error processing CSV data:", error.message);
      toast.error("Failed to process CSV data. Please try again.");
    }
  };

  return (
    <Dialog
      key={vehicleData ? vehicleData.id : 'new-vehicle'}
      open={open}
      onClose={onClose}
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
        Import Vehicles
        <IconButton
          aria-label="close"
          onClick={onClose}
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
              // onChange={handleFileUpload}
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
              <li>Fuel Type: {Object.entries(fuelTypeOptions).map(([key, value]) => `${key}`).join(', ')}</li>
              <li>Parking: {garages.map((garage) => `${garage.id}:${garage.name}`).join(', ')}</li>
              <li>Transmission Type: {Object.entries(transmissionTypeOptions).map(([key, value]) => `${key}`).join(', ')}</li>
              <li>Status: {Object.entries(statusOptions).map(([key, value]) => `${key}`).join(', ')}</li>
              <li>Category: {Object.entries(categoryOptions).map(([key, value]) => `${key}`).join(', ')}</li>
          </ul>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1">CSV Example</Typography>
          Download the CSV template: <Link
          target="_blank"
          href="/download/csv/tpl-import-vehicles.csv"
          sx={{ marginRight: 2, color: "#0070f3" }}
          >
          tpl-import-vehicles.csv
          </Link>
      </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: '', pt: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ mr: 1, backgroundColor: '#6C757D' }} >
            Close
        </Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ mr: 1, backgroundColor: '#727cf5' }}>
            Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportVehicleModal;
