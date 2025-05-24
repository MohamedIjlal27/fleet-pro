import React, { useState, useEffect } from "react";
import axios, { AxiosError } from 'axios';
import axiosInstance from '../../../../utils/axiosConfig';
import {
    Box,
    Modal,
    Typography,
    TextField,
    Button,
    Divider,
    Select,
    MenuItem,
    IconButton,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { createPlan } from "../apis/apis"; // Import API function
import { toast } from "react-toastify";

interface AddPlanProps {
    loadPlans: () => void;
    open: boolean;
    handleClose: () => void;
}

const AddPlan: React.FC<AddPlanProps> = ({ loadPlans, open, handleClose }) => {
    const [services, setServices] = useState<string[]>(["Insurance Coverage", "Software Updates"]);
    const [newService, setNewService] = useState<string>("");
    const [vehicleList, setVehicleList] = useState<string[]>([]);
    const [vehicles, setVehicles] = useState<string[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<string>("");
    const [loading, setLoading] = useState(true);

    // Plan-related states
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [pricing, setPricing] = useState<number>(0);
    const [deposit, setDeposit] = useState<number>(0);
    const [chargePeriod, setChargePeriod] = useState<string>("Monthly");
    const [duration, setDuration] = useState<number>(0);
    const [durationAdditional, setDurationAdditional] = useState<number>(0);
    const [durationPrice, setDurationPrice] = useState<number>(0);
    const [distance, setDistance] = useState<number>(0);
    const [distanceAdditional, setDistanceAdditional] = useState<number>(0);
    const [distancePrice, setDistancePrice] = useState<number>(0);

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
    }, []);

    const addService = () => {
        if (newService.trim()) {
            setServices([...services, newService]);
            setNewService("");
        }
    };

    const removeService = (index: number) => {
        const updatedServices = services.filter((_, i) => i !== index);
        setServices(updatedServices);
    };

    const addVehicle = () => {
        if (/*selectedVehicle.trim() &&*/ !vehicles.includes(selectedVehicle)) {
            setVehicles([...vehicles, selectedVehicle]);
            setSelectedVehicle("");
        }
    };

    const removeVehicle = (vehicle_id: number) => {
        const updatedVehicles = vehicles.filter((id) => id !== vehicle_id);
        setVehicles(updatedVehicles);
    };

    const handleSave = async () => {
        const vehicleIds = vehicles.map((v) => v); // Adjust based on your vehicle ID mapping
        const payload = {
            name,
            description,
            pricing:Number(pricing),
            deposit:Number(deposit),
            chargePeriod:chargePeriod,
            duration:Number(duration),
            durationAdditional: Number(durationAdditional),
            durationPrice: Number(durationPrice),
            distance:Number(distance),
            distanceAdditional:Number(distanceAdditional),
            distancePrice:Number(distancePrice),
            services: JSON.stringify(services),
            vehicleIds: vehicles,
        };
        console.log("add plan payload = ",payload);
        try {
            await createPlan(payload); // Call the API

            setName("");
            setDescription("");
            setPricing(0);
            setDeposit(0);
            setChargePeriod("Monthly");
            setDuration(0);
            setDurationAdditional(0);
            setDurationPrice(0);
            setDistance(0);
            setDistanceAdditional(0);
            setDistancePrice(0);
            setServices(["Insurance Coverage", "Software Updates"]);
            setVehicles([]);

            loadPlans();

            toast.success("Plan created successfully!");
            handleClose(); // Close the modal after saving
        } catch (error) {
            console.error("Failed to create plan:", error);
            toast.error("Failed to create plan. Please try again.");
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
                            label="Plan Name *"
                            fullWidth
                            variant="outlined"
                            size="small"
                            sx={{ marginBottom: "10px" }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <TextField
                            label="Describe *"
                            fullWidth
                            variant="outlined"
                            size="small"
                            sx={{ marginBottom: "10px" }}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <TextField
                            label="Deposit *"
                            fullWidth
                            variant="outlined"
                            size="small"
                            sx={{ marginBottom: "10px" }}
                            value={deposit}
                            onChange={(e) => setDeposit(e.target.value)}
                        />
                        <Box display="flex" gap={2} mb={2}>
                            <TextField
                                label="Basic Price *"
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={pricing}
                                onChange={(e) => setPricing(e.target.value)}
                            />
                            <Select
                                fullWidth
                                size="small"
                                value={chargePeriod}
                                onChange={(e) => setChargePeriod(e.target.value)}
                            >
                                <MenuItem value="Monthly">Monthly</MenuItem>
                                <MenuItem value="Weekly">Weekly</MenuItem>
                                <MenuItem value="Daily">Daily</MenuItem>
                            </Select>
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
                            {services.map((service, index) => (
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
                            {vehicles.length} Vehicles total
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
                                    {vehicles.includes(vehicle.id) && <ListItem
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
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                        />
                        <TextField
                            label="Duration Additional"
                            fullWidth
                            variant="outlined"
                            size="small"
                            value={durationAdditional}
                            onChange={(e) => setDurationAdditional(e.target.value)}
                        />
                        <TextField
                            label="Duration Price"
                            fullWidth
                            variant="outlined"
                            size="small"
                            value={durationPrice}
                            onChange={(e) => setDurationPrice(e.target.value)}
                        />
                    </Box>
                    <Box display="flex" gap={2}>
                        <TextField
                            label="Distance"
                            fullWidth
                            variant="outlined"
                            size="small"
                            value={distance}
                            onChange={(e) => setDistance(e.target.value)}
                        />
                        <TextField
                            label="Distance Additional"
                            fullWidth
                            variant="outlined"
                            size="small"
                            value={distanceAdditional}
                            onChange={(e) => setDistanceAdditional(e.target.value)}
                        />
                        <TextField
                            label="Distance Price"
                            fullWidth
                            variant="outlined"
                            size="small"
                            value={distancePrice}
                            onChange={(e) => setDistancePrice(e.target.value)}
                        />
                    </Box>
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
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default AddPlan;
