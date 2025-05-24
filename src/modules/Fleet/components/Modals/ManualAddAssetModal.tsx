import React, { useState, useEffect } from "react";
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
  InputAdornment,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
// import axiosInstance from "../../../../utils/axiosConfig"; // Commented out for demo mode
// import { IAssetData } from "../../interfaces/interfaces"; // Not available in demo mode
import { RootState } from "../../../../redux/app/store";
import { useSelector } from "react-redux";
// import { fetchAssetFilters } from "../../apis/apis"; // Not available in demo mode

// Demo interface for asset data
interface IAssetData {
  id?: number;
  assetId?: string;
  serialNumber?: string;
  make?: string;
  model?: string;
  type?: string;
  description?: string;
  garageId?: number;
  purchaseDate?: string;
  purchaseCost?: string;
  status?: string;
  category?: string;
  warrantyExpiration?: string;
}

interface AddAssetModalProps {
  open: boolean;
  onClose: () => void;
  assetData?: IAssetData;
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({
  open,
  onClose,
  assetData,
}) => {
  const organization_id = useSelector(
    (state: RootState) => state.user.organizationId
  );
  const [idType, setIdType] = useState<string>("Asset ID");
  const [idPlaceholder, setIdPlaceholder] = useState<string>("Enter Asset ID");
  const [assetId, setAssetId] = useState(assetData?.assetId || "");
  const [serialNumber, setSerialNumber] = useState(
    assetData?.serialNumber || ""
  );
  const [assetMake, setAssetMake] = useState(assetData?.make || "");
  const [assetModel, setAssetModel] = useState(assetData?.model || "");
  const [assetType, setAssetType] = useState(assetData?.type || "");
  const [description, setDescription] = useState(assetData?.description || "");
  const [garage, setGarage] = useState(assetData?.garageId?.toString() || "");
  const [purchaseDate, setPurchaseDate] = useState(
    assetData?.purchaseDate || ""
  );
  const [purchaseCost, setPurchaseCost] = useState(
    assetData?.purchaseCost || ""
  );
  const [status, setStatus] = useState(assetData?.status || "");
  const [category, setCategory] = useState(assetData?.category || "");
  const [warrantyExpiration, setWarrantyExpiration] = useState(
    assetData?.warrantyExpiration || ""
  );

  const [garages, setGarages] = useState<{ id: number; name: string }[]>([]);
  const [assetTypeOptions, setAssetTypeOptions] = useState<
    Record<string, string>
  >({});
  const [statusOptions, setStatusOptions] = useState<Record<string, string>>(
    {}
  );
  const [categoryOptions, setCategoryOptions] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (open) {
      fetchGarages();
      loadOptions();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      resetFormFields();
    }
  }, [open]);

  const handleIdTypeChange = (event: SelectChangeEvent) => {
    const selectedIdType = event.target.value;
    setIdType(selectedIdType);

    // Set appropriate placeholder based on selected ID type
    if (selectedIdType === "Asset ID") {
      setIdPlaceholder("Enter Asset ID");
    } else if (selectedIdType === "Serial Number") {
      setIdPlaceholder("Enter Serial Number");
    } else if (selectedIdType === "Barcode") {
      setIdPlaceholder("Enter Barcode");
    }
  };

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
      toast.error("Error fetching garages: " + error.message);
    }
  };

    const loadOptions = async () => {
      try {
        // Define asset type options directly
        const assetTypeOptionsData = {
          Equipment: "Equipment",
          Tools: "Tools",
          Containers: "Containers",
          "Safety Gear": "Safety Gear",
          Electronics: "Electronics",
          Custom: "Custom...",
        };

        // Define status options directly
        const statusOptionsData = {
          Available: "Available",
          "In Use": "In Use",
          Maintenance: "Maintenance",
          Reserved: "Reserved",
        };

        // Define category options directly
        const categoryOptionsData = {
          General: "General",
          Construction: "Construction",
          Electrical: "Electrical",
        };

        setAssetTypeOptions(assetTypeOptionsData);
        setStatusOptions(statusOptionsData);
        setCategoryOptions(categoryOptionsData);

        // If you want to fetch from API later, uncomment below:
        // const response = await fetchAssetFilters();
        // setAssetTypeOptions(response.assetType);
        // setStatusOptions(response.status);
        // setCategoryOptions(response.category);
      } catch (error: any) {
        toast.error("Error setting up asset options: " + error.message);
      }
    };

  useEffect(() => {
    if (open && assetData) {
      setAssetId(assetData.assetId || "");
      setSerialNumber(assetData.serialNumber || "");
      setAssetMake(assetData.make || "");
      setAssetModel(assetData.model || "");
      setAssetType(assetData.type || "");
      setDescription(assetData.description || "");
      setGarage(assetData.garageId ? assetData.garageId.toString() : "");
      setPurchaseDate(assetData.purchaseDate || "");
      setPurchaseCost(assetData.purchaseCost || "");
      setStatus(assetData.status || "");
      setCategory(assetData.category || "");
      setWarrantyExpiration(assetData.warrantyExpiration || "");
    } else {
      resetFormFields();
    }
  }, [open, assetData]);

  // Check asset ID against database
  const handleAssetCheck = (e: React.MouseEvent<HTMLButtonElement>) => {
    const id = assetId;

    if (id.length > 0) {
      fetchAssetDetails(id);
    }
  };

  // Fetch asset details
  const fetchAssetDetails = async (id: string) => {
    try {
      console.log(`[DEMO MODE] fetchAssetDetails for asset ${id}`);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Demo asset data
      const assetData = {
        make: 'Demo Manufacturer',
        model: 'Demo Model',
        type: 'Equipment',
        description: 'Demo asset description'
      };

      // Populate form fields with the fetched asset data
      setAssetMake(assetData.make || "");
      setAssetModel(assetData.model || "");
      setAssetType(assetData.type || "");
      setDescription(assetData.description || "");
      toast.success("Asset details retrieved successfully (Demo Mode)");
    } catch (error: any) {
      toast.error(error.message);
      console.error("Error fetching asset details:", error);
    }
  };

  //resets after form saved
  const resetFormFields = () => {
    setIdType("Asset ID");
    setAssetId("");
    setSerialNumber("");
    setAssetMake("");
    setAssetModel("");
    setAssetType("");
    setDescription("");
    setGarage("");
    setPurchaseDate("");
    setPurchaseCost("");
    setStatus("");
    setCategory("");
    setWarrantyExpiration("");
  };

  const handleSave = async () => {
    const selectedGarage = garages.find((g) => g.id === Number(garage));
    const data = {
      assetId: assetId,
      serialNumber: serialNumber,
      make: assetMake,
      model: assetModel,
      type: assetType,
      description: description,
      garageId: selectedGarage ? selectedGarage.id : null,
      purchaseDate: purchaseDate,
      purchaseCost: purchaseCost ? Number(purchaseCost) : null,
      status: status,
      category: category,
      warrantyExpiration: warrantyExpiration,
      metadata: {},
    };

    try {
      console.log('[DEMO MODE] Saving asset data:', data);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (assetData?.id) {
        console.log(`[DEMO MODE] Updating asset ${assetData.id}`);
      } else {
        console.log('[DEMO MODE] Creating new asset');
      }
      
      toast.success("Successfully saved the asset (Demo Mode)");
      resetFormFields();
      onClose();
    } catch (error: any) {
      toast.error("Failed to save asset in demo mode");
      console.error("Error saving asset:", error);
    }
  };

  //Each text field will acquire this style
  const renderTextField = (
    label: string,
    value: string | number,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    type: string = "text",
    placeholder = "",
    required: boolean = false,
    endAdornment: React.ReactNode = null
  ) => (
    <TextField
      fullWidth
      label={label}
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={onChange}
      variant="outlined"
      required={required}
      InputProps={{
        endAdornment: endAdornment,
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
        },
        "& .MuiInputLabel-root": { color: "var(--THEME_COLOR)" },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
          {
            borderColor: "var(--THEME_COLOR)",
          },
      }}
    />
  );

  //Each select field will acquire this style
  const renderSelectField = (
    label: string,
    value: string,
    onChange: (e: SelectChangeEvent) => void,
    options: any[] | Record<string, string>,
    optionLabel?: (option: any) => string,
    optionValue?: (option: any) => string | number,
    required: boolean = false
  ) => {
    const renderOptions = () => {
      if (Array.isArray(options)) {
        // Handle the case where options is an array
        return options.map((option, index) => (
          <MenuItem
            key={optionValue ? optionValue(option) : index}
            value={optionValue ? optionValue(option) : option}
          >
            {optionLabel ? optionLabel(option) : option}
          </MenuItem>
        ));
      } else if (typeof options === "object" && options !== null) {
        // Handle the case where options is an object (Record<string, string>)
        return Object.entries(options).map(([key, value]) => (
          <MenuItem key={key} value={key}>
            {optionLabel ? optionLabel(value) : value}
          </MenuItem>
        ));
      }
      return null;
    };

    return (
      <FormControl
        fullWidth
        variant="outlined"
        required={required}
        sx={{
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
          borderRadius: 2,
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--THEME_COLOR)",
            },
          },
          "& .MuiInputLabel-root": {
            color: "var(--THEME_COLOR)",
            "&.Mui-focused": {
              color: "var(--THEME_COLOR)",
            },
          },
        }}
      >
        <InputLabel id={`${label}-label`}>{label}</InputLabel>
        <Select
          labelId={`${label}-label`}
          label={label}
          value={value}
          onChange={onChange}
        >
          {renderOptions()}
        </Select>
      </FormControl>
    );
  };

  // Date field with date picker
  const renderDateField = (
    label: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    required: boolean = false
  ) => (
    <TextField
      fullWidth
      label={label}
      type="date"
      value={value}
      onChange={onChange}
      variant="outlined"
      required={required}
      InputLabelProps={{
        shrink: true,
      }}
      placeholder="mm/dd/yyyy"
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
        },
        "& .MuiInputLabel-root": { color: "var(--THEME_COLOR)" },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
          {
            borderColor: "var(--THEME_COLOR)",
          },
      }}
    />
  );

  const renderButton = (
    label: string,
    onClick: () => void,
    isPrimary = false
  ) => (
    <Button
      onClick={onClick}
      variant="contained"
      sx={{
        bgcolor: isPrimary ? "#1976d2" : "gray",
        color: "white",
        "&:hover": {
          bgcolor: isPrimary ? "#1565c0" : "lightGray",
        },
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        textTransform: "uppercase",
      }}
    >
      {label}
    </Button>
  );

  return (
    <Dialog
      key={assetData ? assetData.id : "new-asset"}
      open={open}
      onClose={onClose}
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          padding: 2,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "var(--THEME_COLOR)",
          color: "black",
          fontWeight: "bold",
          fontSize: "1.5rem",
        }}
      >
        Add Asset
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "gray",
            "&:hover": { color: "#ff6666" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 2 }}>
          {/* First row */}
          <Grid item xs={12} md={3}>
            {renderSelectField("Identifier Type", idType, handleIdTypeChange, [
              "Asset ID",
              "Serial Number",
              "Barcode",
            ])}
          </Grid>
          <Grid item xs={12} md={4}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {renderTextField(
                idType,
                assetId,
                (e) => setAssetId(e.target.value),
                "text",
                idPlaceholder,
                true,
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAssetCheck}
                    sx={{ bgcolor: "#2196f3", color: "white" }}
                  >
                    CHECK
                  </Button>
                </InputAdornment>
              )}
            </div>
          </Grid>
          <Grid item xs={12} md={5}>
            {renderTextField("Serial Number", serialNumber, (e) =>
              setSerialNumber(e.target.value)
            )}
          </Grid>

          {/* Second row */}
          <Grid item xs={12} md={6}>
            {renderTextField("Asset Make", assetMake, (e) =>
              setAssetMake(e.target.value)
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderTextField("Asset Model", assetModel, (e) =>
              setAssetModel(e.target.value)
            )}
          </Grid>

          {/* Third row */}
          <Grid item xs={12} md={6}>
            {renderSelectField(
              "Asset Type",
              assetType,
              (e) => setAssetType(e.target.value),
              assetTypeOptions,
              undefined,
              undefined,
              true
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderTextField("Description", description, (e) =>
              setDescription(e.target.value)
            )}
          </Grid>

          {/* Fourth row */}
          <Grid item xs={12} md={6}>
            {renderSelectField(
              "Garage",
              garage,
              (e) => setGarage(e.target.value),
              garages,
              (option) => option.name,
              (option) => option.id.toString(),
              true
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderDateField("Purchase Date", purchaseDate, (e) =>
              setPurchaseDate(e.target.value)
            )}
          </Grid>

          {/* Fifth row */}
          <Grid item xs={12} md={6}>
            {renderTextField(
              "Purchase Cost",
              purchaseCost,
              (e) => setPurchaseCost(e.target.value),
              "number"
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderSelectField(
              "Status",
              status,
              (e) => setStatus(e.target.value),
              statusOptions,
              undefined,
              undefined,
              true
            )}
          </Grid>

          {/* Sixth row */}
          <Grid item xs={12} md={6}>
            {renderSelectField(
              "Category",
              category,
              (e) => setCategory(e.target.value),
              categoryOptions,
              undefined,
              undefined,
              true
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderDateField("Warranty Expiration", warrantyExpiration, (e) =>
              setWarrantyExpiration(e.target.value)
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ padding: 2, justifyContent: "flex-end" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: "gray",
            borderColor: "gray",
            "&:hover": {
              borderColor: "darkgray",
              backgroundColor: "whitesmoke",
            },
          }}
        >
          CANCEL
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            bgcolor: "#2196f3",
            color: "white",
            "&:hover": { bgcolor: "#1976d2" },
          }}
        >
          SAVE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAssetModal;