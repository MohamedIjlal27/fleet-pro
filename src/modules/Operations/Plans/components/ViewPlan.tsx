import React, { useEffect, useState } from "react";
import {
    Box,
    Modal,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Button,
} from "@mui/material";
import { toast } from "react-toastify";
import { getPlanDetails } from "../apis/apis"; // Import the API function

interface ViewPlanProps {
    open: boolean;
    handleClose: () => void;
    planId: number; // ID of the plan to fetch details for
}

const ViewPlan: React.FC<ViewPlanProps> = ({ open, handleClose, planId }) => {
    const [loading, setLoading] = useState(true);
    const [planDetails, setPlanDetails] = useState<any>(null);

    useEffect(() => {
        if (open && planId) {
            const fetchPlanDetails = async () => {
                try {
                    const response = await getPlanDetails(planId);
                    setPlanDetails(response.data);
                } catch (error) {
                    console.error("Error fetching plan details:", error);
                    toast.error("Failed to fetch plan details. Please try again.");
                } finally {
                    setLoading(false);
                }
            };

            fetchPlanDetails();
        }
    }, [open, planId]);

    if (loading) {
        return (
            <Modal open={open} onClose={handleClose} disableAutoFocus={true}>
                <Box
                    sx={{
                        width: "500px",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        padding: "20px",
                        margin: "50px auto",
                        textAlign: "center",
                    }}
                >
                    <CircularProgress />
                    <Typography variant="h6" sx={{ marginTop: "10px" }}>
                        Loading Plan Details...
                    </Typography>
                </Box>
            </Modal>
        );
    }

    return (
        <Modal open={open} onClose={handleClose} disableAutoFocus={true}>
            <Box
                sx={{
                    width: "800px",
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
                    Plan Details
                </Typography>

                <Divider sx={{ marginBottom: "20px" }} />

                {planDetails ? (
                    <>
                        {/* Plan Summary */}
                        <Box sx={{ marginBottom: "20px" }}>
                            <Typography fontWeight="bold">Plan Name:</Typography>
                            <Typography>{planDetails.name}</Typography>
                        </Box>
                        <Box sx={{ marginBottom: "20px" }}>
                            <Typography fontWeight="bold">Description:</Typography>
                            <Typography>{planDetails.description}</Typography>
                        </Box>
                        <Box sx={{ marginBottom: "20px" }}>
                            <Typography fontWeight="bold">Basic Price:</Typography>
                            <Typography>${planDetails.pricing}</Typography>
                        </Box>
                        <Box sx={{ marginBottom: "20px" }}>
                            <Typography fontWeight="bold">Charge Period:</Typography>
                            <Typography>{planDetails.chargePeriod}</Typography>
                        </Box>

                        {/* Services */}
                        <Typography fontWeight="bold" sx={{ marginBottom: "10px" }}>
                            Included Services:
                        </Typography>
                        <List>
                            {planDetails.services.split(", ").map((service: string, index: number) => (
                                <ListItem key={index}>
                                    <ListItemText primary={service} />
                                </ListItem>
                            ))}
                        </List>

                        {/* Vehicles */}
                        <Typography fontWeight="bold" sx={{ marginTop: "20px", marginBottom: "10px" }}>
                            Vehicles:
                        </Typography>
                        <List>
                            {planDetails.vehicles?.map((vehicle: any) => (
                                <ListItem key={vehicle.id}>
                                    <ListItemText
                                        primary={`Vehicle ID: ${vehicle.id}`}
                                        secondary={`Make: ${vehicle.make}, Model: ${vehicle.model}`}
                                    />
                                </ListItem>
                            )) || <Typography>No vehicles linked to this plan.</Typography>}
                        </List>

                        {/* Conditions */}
                        <Typography fontWeight="bold" sx={{ marginTop: "20px", marginBottom: "10px" }}>
                            Conditions:
                        </Typography>
                        <Box display="flex" gap={4}>
                            <Box>
                                <Typography fontWeight="bold">Duration:</Typography>
                                <Typography>{planDetails.duration} days</Typography>
                            </Box>
                            <Box>
                                <Typography fontWeight="bold">Duration Price:</Typography>
                                <Typography>${planDetails.durationPrice}</Typography>
                            </Box>
                            <Box>
                                <Typography fontWeight="bold">Distance:</Typography>
                                <Typography>{planDetails.distance} km</Typography>
                            </Box>
                            <Box>
                                <Typography fontWeight="bold">Distance Price:</Typography>
                                <Typography>${planDetails.distancePrice}</Typography>
                            </Box>
                        </Box>
                    </>
                ) : (
                    <Typography>No plan details available.</Typography>
                )}

                {/* Action Buttons */}
                <Box display="flex" justifyContent="center" mt={3}>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "#000",
                            borderRadius: "20px",
                            padding: "10px 20px",
                        }}
                        onClick={handleClose}
                    >
                        Close
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ViewPlan;
