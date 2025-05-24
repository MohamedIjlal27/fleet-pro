import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, Button, TextField, Grid, Grid2,Divider } from "@mui/material";
import { IRequest } from "../interfaces/interfaces";
import { fetchTaskDetails } from "../apis/apis";

interface RequestDetailModalProps {
    open: boolean;
    onClose: () => void;
    mode: "Edit" | "Create";
    selectedRequest?: IRequest | null;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
    open,
    onClose,
    mode,
    selectedRequest,
}) => {
    const [request, setRequest] = useState<IRequest>(
        {
            id: 0,
            customerId: null,
            organizationId: 0,
            orderId: null,
            adminId: 0,
            relatedId: 0,
            assigneeId: null,
            initiatorType: 0,
            initiatorTypeName: "",
            deliveryCarId: 0,
            returnCarId: null,
            type: 0,
            typeName: "",
            status: 0,
            statusName: "",
            scheduleDate: "",
            scheduleTime: "",
            scheduleLocation: "",
            actuallyTime: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            requestBy: "",
        }
    );



    useEffect(() => {
        loadTaskDetails();
    }, [selectedRequest]);



    const loadTaskDetails = async () => {
        try {
            if (selectedRequest) {
                const response = await fetchTaskDetails(selectedRequest.id);
                console.log("fetchTaskDetails response = ", response);
                // Update the state with the fetched options
                setRequest(response);
            }
        } catch (error) {
            console.error("Failed to fetch maintenance options:", error);
        }
    };

    const handleModalClose = () => {
        onClose();
    }

    const handleChange = (field: keyof IRequest, value: string | number | null) => {
        setRequest((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Modal open={open} onClose={handleModalClose} disableAutoFocus>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "80%",
                    maxHeight: "90vh",
                    bgcolor: "white",
                    borderRadius: "8px",
                    boxShadow: 24,
                    overflowY: "auto",
                    p: 4,
                }}
            >
                {/* Title */}
                <Typography
                    variant="h6"
                    sx={{
                        fontSize: "20px",
                        fontWeight: "600",
                        marginBottom: 3,
                        color: "#333",
                    }}
                >
                    {mode} Request
                </Typography>

                <Divider sx={{ marginBottom: "16px" }} />

                {/* Vehicle Details Section */}
                <Box>
                    <Typography
                        sx={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "#2C3E50",
                            borderBottom: "4px solid #0070f3",
                            display: "inline-block",
                            paddingBottom: "4px",
                            marginBottom: "16px",
                        }}
                    >
                        Vehicle Details
                    </Typography>
                    <Grid2 container spacing={2} marginBottom={3}>
                        <Grid2 size={3}>
                            <Box
                                component="img"
                                src={
                                    mode != 'Edit' && request.underGoingDelivery
                                        ? request.underGoingDelivery?.coverImage
                                        : request.carAwaitingRecycling
                                            ? request.carAwaitingRecycling?.coverImage
                                            : "/src/assets/car_models/car_model_1_big.png"
                                }
                                alt="Vehicle"
                                sx={{
                                    /*width: "150px",*/
                                    maxHeight: "150px",
                                    borderRadius: "4px",
                                    marginRight: 2,
                                    border: "1px solid #ccc",
                                }}
                            />
                        </Grid2>
                        <Grid2 size={9}>
                            <Grid2 container spacing={2}>
                                <Grid2 size={3}>
                                    <Typography sx={{ fontSize: "14px", color: "#4A4A4A" }}>
                                        <strong>Vehicle Make/Model</strong>
                                    </Typography>
                                    <Typography sx={{ fontSize: "14px", color: "#4A4A4A" }}>
                                        {
                                            mode != 'Edit' && request.underGoingDelivery
                                                ? `${request.underGoingDelivery?.make} ${request.underGoingDelivery?.model}`
                                                : request.carAwaitingRecycling
                                                    ? `${request.carAwaitingRecycling?.make} ${request.carAwaitingRecycling?.model}`
                                                    : "N/A"
                                        }
                                    </Typography>
                                </Grid2>
                                <Grid2 size={3}>
                                    <Typography sx={{ fontSize: "14px", color: "#4A4A4A" }}>
                                        <strong>Plate Number</strong>
                                    </Typography>
                                    <Typography sx={{ fontSize: "14px", color: "#4A4A4A" }}>
                                        {
                                            mode != 'Edit' && request.underGoingDelivery
                                                ? `${request.underGoingDelivery?.plateNumber}`
                                                : request.carAwaitingRecycling
                                                    ? `${request.carAwaitingRecycling?.plateNumber}`
                                                    : "N/A"
                                        }
                                    </Typography>
                                </Grid2>
                                <Grid2 size={3}>
                                    <Typography sx={{ fontSize: "14px", color: "#4A4A4A" }}>
                                        <strong>Odometer</strong>
                                    </Typography>
                                    <Typography sx={{ fontSize: "14px", color: "#4A4A4A" }}>
                                        {
                                            mode != 'Edit' && request.underGoingDelivery
                                                ? `${request.underGoingDelivery?.odometer} km`
                                                : request.carAwaitingRecycling
                                                    ? `${request.carAwaitingRecycling?.odometer} km`
                                                    : "N/A"
                                        }
                                    </Typography>
                                </Grid2>
                                <Grid2 size={3}>
                                    <Typography sx={{ fontSize: "14px", color: "#4A4A4A" }}>
                                        <strong>Vehicle Type</strong>
                                    </Typography>
                                    <Typography sx={{ fontSize: "14px", color: "#4A4A4A" }}>
                                        {
                                            mode != 'Edit' && request.underGoingDelivery
                                                ? `${request.underGoingDelivery?.fuelType}`
                                                : request.carAwaitingRecycling
                                                    ? `${request.carAwaitingRecycling?.fuelType}`
                                                    : "N/A"
                                        }
                                    </Typography>
                                </Grid2>
                                <Grid2 size={3}>
                                    <Typography sx={{ fontSize: "14px", color: "#4A4A4A" }}>
                                        <strong>VIN</strong>
                                    </Typography>
                                    <Typography sx={{ fontSize: "14px", color: "#4A4A4A" }}>
                                        {
                                            mode != 'Edit' && request.underGoingDelivery
                                                ? `${request.underGoingDelivery?.vin}`
                                                : request.carAwaitingRecycling
                                                    ? `${request.carAwaitingRecycling?.vin}`
                                                    : "N/A"
                                        }
                                    </Typography>
                                </Grid2>
                                <Grid2 size={3}>
                                    <Typography sx={{ fontSize: "14px", color: "#4A4A4A" }}>
                                        <strong>Garage</strong>
                                    </Typography>
                                    <Typography sx={{ fontSize: "14px", color: "#4A4A4A" }}>
                                        {
                                            mode != 'Edit' && request.underGoingDelivery
                                                ? `${request.underGoingDelivery?.garage?.name}`
                                                : request.carAwaitingRecycling
                                                    ? `${request.carAwaitingRecycling?.garage?.name}`
                                                    : "N/A"
                                        }
                                    </Typography>
                                </Grid2>
                                <Grid2 size={3}>
                                    <Typography sx={{ fontSize: "14px", color: "#4A4A4A" }}>
                                        <strong>Parking Location</strong>
                                    </Typography>
                                    <Typography sx={{ fontSize: "14px", color: "#4A4A4A" }}>
                                        {
                                            mode != 'Edit' && request.underGoingDelivery
                                                ? `${request.underGoingDelivery?.garage?.address}`
                                                : request.carAwaitingRecycling
                                                    ? `${request.carAwaitingRecycling?.garage?.address}`
                                                    : "N/A"
                                        }
                                    </Typography>
                                </Grid2>
                            </Grid2>
                        </Grid2>
                    </Grid2>
                </Box>

                <Divider sx={{ marginBottom: "16px" }} />

                {/* Request Details Section */}
                <Box>
                    <Typography
                        sx={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "#2C3E50",
                            borderBottom: "4px solid #0070f3",
                            display: "inline-block",
                            paddingBottom: "4px",
                            marginBottom: "16px",
                        }}
                    >
                        Request Details
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={4}>
                            <TextField label="ID" fullWidth value={request.id} disabled />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField label="Type Name" fullWidth value={request.typeName} onChange={(e) => handleChange("typeName", e.target.value)} />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField label="Status" fullWidth value={request.statusName} onChange={(e) => handleChange("statusName", e.target.value)} />
                        </Grid>
                        <Grid item xs={1} textAlign="right">
                        </Grid>
                    </Grid>
                    <Box mt={2}>
                        <Grid container spacing={2}>
                            {["customerId", "organizationId", "orderId", "adminId", "relatedId", "assigneeId", "initiatorType", "deliveryCarId", "returnCarId"].map((field) => (
                                <Grid item xs={4} key={field}>
                                    <TextField
                                        label={field.replace(/([A-Z])/g, " $1").trim()}
                                        fullWidth
                                        value={request[field as keyof IRequest] || ""}
                                        onChange={(e) => handleChange(field as keyof IRequest, e.target.value)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Box>

                <Divider sx={{ marginBottom: "16px" }} />

                {/* Vehicle Delivery Section */}
                <Box>
                    <Typography
                        sx={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "#2C3E50",
                            borderBottom: "4px solid #0070f3",
                            display: "inline-block",
                            paddingBottom: "4px",
                            marginBottom: "16px",
                        }}
                    >
                        Vehicle Delivery
                    </Typography>
                </Box>

                <Divider sx={{ marginBottom: "16px" }} />

                {/* Vehicle Delivery Section */}
                <Box>
                    <Typography
                        sx={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "#2C3E50",
                            borderBottom: "4px solid #0070f3",
                            display: "inline-block",
                            paddingBottom: "4px",
                            marginBottom: "16px",
                        }}
                    >
                        Invoice
                    </Typography>
                </Box>

                {/* Footer */}
                <Divider sx={{ margin: "16px 0" }} />
                <Box textAlign="right">
                    <Button variant="contained" sx={{ textTransform: "none", marginRight: 2 }} /*onClick={handleSave}*/>
                        Save
                    </Button>
                    <Button variant="outlined" sx={{ textTransform: "none" }} onClick={onClose}>
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};
