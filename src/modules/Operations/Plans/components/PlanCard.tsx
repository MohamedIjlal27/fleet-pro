import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Divider,
    Modal,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    Select,
    MenuItem,
    IconButton,
} from "@mui/material";
import axios, { AxiosError } from 'axios';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import axiosInstance from '../../../../utils/axiosConfig';
import { updatePlan } from "../apis/apis"; // Import API function
import { toast } from "react-toastify";

interface PlansCardProps {
    loadPlans: () => void;
    id:number,
    name: string;
    description: string;
    pricing: number;
    deposit: number;
    chargePeriod: string;
    duration: number;
    durationAdditional: number;
    durationPrice: number;
    distance: number;
    distanceAdditional: number;
    distancePrice: number;
    services: string[];
    organization: {};
    planVehicles: [];
}

const PlanCard: React.FC<PlansCardProps> = ({
    loadPlans,
    id ,
    name,
    description,
    pricing,
    deposit,
    chargePeriod,
    duration,
    durationAdditional,
    durationPrice,
    distance,
    distanceAdditional,
    distancePrice,
    services,
    organization,
    planVehicles,

}) => {
    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [currServices, setCurrServices] = useState<string[]>(services);
    const [newService, setNewService] = useState<string>("");
    const [vehicleList, setVehicleList] = useState<string[]>([]);
    const [currVehicles, setCurrVehicles] = useState<string[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [readOnlyMode, setReadOnlyMode] = useState(true);

    // Plan-related states
    const [editName, setName] = useState<string>(name);
    const [editDescription, setDescription] = useState<string>(description);
    const [editPricing, setPricing] = useState<number>(pricing);
    const [editDeposit, setDeposit] = useState<number>(deposit);
    const [editChargePeriod, setChargePeriod] = useState<string>(chargePeriod);
    const [editDuration, setDuration] = useState<number>(duration);
    const [editDurationAdditional, setDurationAdditional] = useState<number>(durationAdditional);
    const [editDurationPrice, setDurationPrice] = useState<number>(durationPrice);
    const [editDistance, setDistance] = useState<number>(distance);
    const [editDistanceAdditional, setDistanceAdditional] = useState<number>(distanceAdditional);
    const [editDistancePrice, setDistancePrice] = useState<number>(distancePrice);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await axiosInstance.get('/api/vehicle/list');
                //console.log("Vehicles", response)
                //const data = await response.json();
                //const vehicleIds = response.data.map((vehicle: { id: number }) => vehicle.id);
                //setVehicles(vehicleIds); // Save API response to state
                setVehicleList(response.data);
            } catch (error) {
                console.error("Error fetching vehicles:", error);
            } finally {
                setLoading(false); // Hide loader once data is fetched
            }
        };

        fetchVehicles();

        let vehicleIds = [];
        vehicleIds.push(...planVehicles.map(vehicle => vehicle?.vehicle?.id));
        setCurrVehicles(vehicleIds);
    }, []);

    const handleOpen = (id: number) => {
        //console.log("Clicked Plan id:", id);
        setSelectedId(id);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const addService = () => {
        if (newService.trim()) {
            setCurrServices([...currServices, newService]);
            setNewService("");
        }
    };

    const removeService = (index: number) => {
        const updatedServices = currServices.filter((_, i) => i !== index);
        setCurrServices(updatedServices);
    };

    const addVehicle = () => {
        if (/*selectedVehicle.trim() &&*/ !currVehicles.includes(selectedVehicle)) {
            setCurrVehicles([...currVehicles, selectedVehicle]);
            setSelectedVehicle("");
        }
    };

    const removeVehicle = (vehicle_id: number) => {
        const updatedVehicles = currVehicles.filter((id) => id !== vehicle_id);
        setCurrVehicles(updatedVehicles);
    };

    const deletePlan = async (planId: number) => {
        console.log("Deleting Plan ID:", planId); 
        if (window.confirm("Are you sure you want to delete this plan?")) {
            try {
                // Make the DELETE API call
               
                const response = await axiosInstance.delete(`/api/plans/${planId}`);

                // Check response status for success
                if (response.status === 200 || response.status === 204) {
                    toast.success("Plan deleted successfully.");
                    // Reload or refresh data from the server after deletion
                    // Example: fetchPlans(); // Re-fetch plans from API
                    handleClose(); // Close the modal after successful deletion
                } else {
                    toast.error("Failed to delete the plan. Please try again.");
                }
            } catch (error) {
                console.error("Error deleting the plan:", error);
                alert("An error occurred while deleting the plan.");
            }
        }
    };

    const handleSave = async () => {
        const vehicleIds = currVehicles.map((v) => v); // Adjust based on your vehicle ID mapping
        const payload = {
            name: editName,
            description: editDescription,
            pricing: Number(editPricing),
            deposit: Number(editDeposit),
            chargePeriod: editChargePeriod,
            duration: Number(editDuration),
            durationAdditional: Number(editDurationAdditional),
            durationPrice: Number(editDurationPrice),
            distance: Number(editDistance),
            distanceAdditional: Number(editDistanceAdditional),
            distancePrice: Number(editDistancePrice),
            services: JSON.stringify(currServices),
            vehicleIds: currVehicles,
            organizationId: organization,
        };

        try {
            await updatePlan(id, payload); // Call the API

            loadPlans();

            toast.success("Plan updated successfully!");
            handleClose(); // Close the modal after saving
        } catch (error) {
            console.error("Failed to create plan:", error);
            toast.error("Failed to create plan. Please try again.");
        }
    };

    return (
        <>
            {/* Card Component */}
            <Box
                onClick={() => handleOpen(id)}
                sx={{
                    width: "300px",
                    height: "250px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    overflow: "hidden",
                    padding: "16px",
                    transition: "all 0.3s ease",
                    backgroundColor: "#ffffff",
                    cursor: "pointer",
                    "&:hover": {
                        backgroundColor: "#2158DB",
                        color: "#ffffff",
                    },
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
            >
                {/* Top Section */}
                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="8px">
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ transition: "color 0.3s ease" }}>
                        {name}
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "24px",
                            height: "24px",
                            transition: "color 0.3s ease",
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="20"
                            viewBox="0 0 24 24"
                            width="20"
                            fill="currentColor"
                            style={{ transition: "fill 0.3s ease" }}
                        >
                            <path d="M0 0h24v24H0V0z" fill="none" />
                            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 6h10.29l1.57 4H5.28l1.57-4zM19 17c-.83 0-1.5-.67-1.5-1.5S18.17 14 19 14s1.5.67 1.5 1.5S19.83 17 19 17zm-14 0c-.83 0-1.5-.67-1.5-1.5S4.17 14 5 14s1.5.67 1.5 1.5S5.83 17 5 17z" />
                        </svg>
                        <Typography variant="body1" marginLeft="4px" sx={{ transition: "color 0.3s ease" }}>
                            {/*cars*/}{planVehicles?.length || 0}
                        </Typography>
                    </Box>
                </Box>

                {/* Price Section */}
                <Typography
                    variant="h6"
                    fontWeight="bold"
                    marginBottom="8px"
                    sx={{
                        color: "#1E88E5",
                        transition: "color 0.3s ease",
                        "&:hover": { color: "inherit" },
                    }}
                >
                    $ {pricing} {chargePeriod}
                </Typography>

                {/* Dotted Divider */}
                <Divider
                    sx={{
                        borderTop: "2px dotted",
                        borderBottom: "none",
                        marginBottom: "8px",
                        borderColor: "rgba(0, 0, 0, 0.2)",
                        transition: "border-color 0.3s ease",
                        "&:hover": { borderColor: "inherit" },
                    }}
                />

                {/* Details Section */}
                <Box display="flex" justifyContent="space-between" marginBottom="8px">
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: "bold", marginBottom: "4px" }}>
                            Duration
                        </Typography>
                        <Typography variant="body2">{duration} Months</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: "bold", marginBottom: "4px" }}>
                            Distance Allowance
                        </Typography>
                        <Typography variant="body2">{distance} km</Typography>
                    </Box>
                </Box>

                {/* Dotted Divider */}
                <Divider
                    sx={{
                        borderTop: "2px dotted",
                        borderBottom: "none",
                        marginBottom: "8px",
                        borderColor: "rgba(0, 0, 0, 0.2)",
                        transition: "border-color 0.3s ease",
                        "&:hover": { borderColor: "inherit" },
                    }}
                />

                {/* Services Section */}
                <Box>
                    {services.map((service, index) => (
                        <Typography key={index} variant="body2">
                            {service}
                        </Typography>
                    ))}
                </Box>
            </Box>

            {/* Modal Component */}
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
                        sx={{
                            fontWeight: "bold",
                            marginBottom: "20px",
                            textAlign: "center",
                        }}
                    >
                        Subscription Plan 
                    </Typography>

                    <Divider sx={{ marginBottom: "20px" }} />

                    {/* Form Sections */}
                    <Box display="flex" gap={6} mb={3}>
                        {/* Left Column */}
                        <Box flex={2}>
                            <Typography fontWeight="bold" sx={{ marginBottom: "10px" }}>
                                Plan Details
                            </Typography>
                            <TextField
                                label="Plan Name"
                                fullWidth
                                variant="outlined"
                                size="small"
                                sx={{ marginBottom: "10px" }}
                                value={editName}
                                onChange={(e) => setName(e.target.value)}
                                InputProps={{ readOnly: readOnlyMode }}
                            />
                            <TextField
                                label="Description"
                                fullWidth
                                variant="outlined"
                                size="small"
                                sx={{ marginBottom: "10px" }}
                                value={editDescription}
                                onChange={(e) => setDescription(e.target.value)}
                                InputProps={{ readOnly: readOnlyMode }}
                            />
                            <TextField
                                label="Deposit"
                                fullWidth
                                variant="outlined"
                                size="small"
                                sx={{ marginBottom: "10px" }}
                                value={editDeposit}
                                onChange={(e) => setDeposit(e.target.value)}
                                InputProps={{ readOnly: readOnlyMode }}
                            />
                            <Box display="flex" gap={2} mb={2}>
                                <TextField
                                    label="Basic Price"
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    value={editPricing}
                                    onChange={(e) => setPricing(e.target.value)}
                                    InputProps={{ readOnly: readOnlyMode }}
                                />
                                <TextField
                                    select
                                    label="Charge Period"
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    value={editChargePeriod}
                                    onChange={(e) => setChargePeriod(e.target.value)}
                                    InputProps={{ readOnly: readOnlyMode }}
                                >
                                    <MenuItem value="Monthly">Monthly</MenuItem>
                                    <MenuItem value="Weekly">Weekly</MenuItem>
                                    <MenuItem value="Daily">Daily</MenuItem>
                                </TextField>
                            </Box>
                        </Box>

                        {/* Right Column - Service Include */}
                        <Box flex={1} bgcolor="#f4f6f8" sx={{ padding: "20px" }}>
                            <Typography fontWeight="bold" sx={{ marginBottom: "10px" }}>
                                Service Include *
                            </Typography>
                            <Box display="flex" gap={1} alignItems="center" sx={{ marginBottom: "10px" }}>
                                <TextField
                                    placeholder="Add Service"
                                    value={newService}
                                    onChange={(e) => setNewService(e.target.value)}
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                />
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={addService}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: "20px",
                                        height: "36px",
                                        width: "30px",
                                    }}
                                >
                                    Add
                                </Button>
                            </Box>
                            <List>
                                {currServices.map((service, index) => (
                                    <ListItem
                                        key={index}
                                        secondaryAction={
                                            <IconButton edge="end" onClick={() => removeService(index)}>
                                                <DeleteOutlineIcon />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText primary={service} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        {/* Vehicle Section */}
                        <Box flex={1}>
                            <Typography fontWeight="bold" sx={{ marginBottom: "10px" }}>
                                Vehicles
                            </Typography>
                            <Typography sx={{ marginBottom: "10px" }}>
                                {currVehicles.length} Vehicles total
                            </Typography>
                            <Box display="flex" gap={1} alignItems="center" sx={{ marginBottom: "10px" }}>
                                <Select
                                    fullWidth
                                    size="small"
                                    value={selectedVehicle}
                                    onChange={(e) => setSelectedVehicle(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="" disabled>Select</MenuItem>
                                    {vehicleList.map((vehicle) => (
                                        <MenuItem key={vehicle.id} value={vehicle.id}>
                                            Plate:{vehicle.plateNumber} Vin:{vehicle.vin}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    //onClick={() => {
                                    //    const vehicle = vehicles.find((v) => v.id === selectedVehicle);
                                    //    if (vehicle && !vehicles.some((v) => v.id === vehicle.id)) {
                                    //        setVehicles([...vehicles, vehicle]);
                                    //    }
                                    //}}
                                    onClick={addVehicle}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: "20px",
                                        height: "36px",
                                        width: "35px",
                                    }}
                                >
                                    Add
                                </Button>
                            </Box>
                            <List>
                                {vehicleList.map((vehicle) => (
                                    <div key={vehicle.id}>
                                        {currVehicles.includes(vehicle.id) && <ListItem
                                            key={vehicle.id}
                                            secondaryAction={
                                                <IconButton edge="end" onClick={() => removeVehicle(vehicle.id)}>
                                                    <DeleteOutlineIcon />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText
                                                primary={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                                                secondary={`${vehicle.color} | ${vehicle.plateNumber}`}
                                            />
                                        </ListItem>
                                        }
                                    </div>
                                ))}
                            </List>
                        </Box>
                    </Box>

                    {/* Condition Section */}
                    <Box mt={3}>
                        <Typography fontWeight="bold" sx={{ marginBottom: "10px" }}>
                            Conditions
                        </Typography>
                        <Box display="flex" gap={2} mb={2}>
                            <TextField
                                label="Duration"
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={editDuration}
                                onChange={(e) => setDuration(e.target.value)}
                                InputProps={{ readOnly: readOnlyMode }}
                            />
                            <TextField
                                label="Duration Additional"
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={editDurationAdditional}
                                onChange={(e) => setDurationAdditional(e.target.value)}
                                InputProps={{ readOnly: readOnlyMode }}
                            />
                            <TextField
                                label="Duration Price"
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={editDurationPrice}
                                onChange={(e) => setDurationPrice(e.target.value)}
                                InputProps={{ readOnly: readOnlyMode }}
                            />
                        </Box>
                        <Box display="flex" gap={2}>
                            <TextField
                                label="Distance"
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={editDistance}
                                onChange={(e) => setDistance(e.target.value)}
                                InputProps={{ readOnly: readOnlyMode }}
                            />
                            <TextField
                                label="Distance Additional"
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={editDistanceAdditional}
                                onChange={(e) => setDistanceAdditional(e.target.value)}
                                InputProps={{ readOnly: readOnlyMode }}
                            />
                            <TextField
                                label="Distance Price"
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={editDistancePrice}
                                onChange={(e) => setDistancePrice(e.target.value)}
                                InputProps={{ readOnly: readOnlyMode }}
                            />
                        </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box display="flex" justifyContent="center" mt={3} gap={2}>
                        {readOnlyMode && <Button
                            variant="contained"
                            sx={{
                                backgroundColor: "#000",
                                borderRadius: "5px",
                                padding: "10px 20px",
                            }}
                            onClick={ () => setReadOnlyMode(false) }
                        >
                            Edit
                        </Button>}
                        {!readOnlyMode && 
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: "#000",
                                borderRadius: "5px",
                                padding: "10px 20px",
                            }}
                            onClick={handleSave}
                        >
                            Save
                        </Button>}
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: "#000",
                                borderRadius: "5px",
                                padding: "10px 20px",
                            }}
                            onClick={() => deletePlan(id)}
                        >
                            Delete
                        </Button>
                    </Box>
                </Box>
            </Modal>

        </>
    );
};

export default PlanCard;
