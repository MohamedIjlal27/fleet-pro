import React from "react";
import { useNavigate } from "react-router"; // Import useNavigate
import { Box, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";

export const OrderDetailsHeader: React.FC = () => {
    const navigate = useNavigate(); // Initialize useNavigate

    // Navigate back to the previous page
    const handleBack = () => {
        navigate(-1); // Goes back to the previous page
    };

    // Navigate to the orders list or close page
    const handleClose = () => {
        navigate("/orders"); // Replace "/orders" with your desired route
    };

    return (
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            p={1}
            bgcolor="#fff"
            borderRadius={1}
            boxShadow={1}
        >
            {/* Back Button and Order Number */}
            <Box display="flex" alignItems="center">
                {/* Back Button */}
                <IconButton
                    onClick={handleBack}
                    sx={{
                        bgcolor: "#f0f0f0",
                        borderRadius: "50%",
                        boxShadow: 1,
                        mr: 2,
                    }}
                >
                    <ArrowBackIcon />
                </IconButton>

                {/* Order Number */}
                <Box>
                    <Typography variant="h6" fontWeight="bold">
                        Order Number 43
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        November 18, 2024 20:08:31
                    </Typography>
                </Box>
            </Box>

            {/* Close Button */}
            <IconButton
                onClick={handleClose}
                sx={{
                    bgcolor: "#f0f0f0",
                    borderRadius: "50%",
                    boxShadow: 1,
                }}
            >
                <CloseIcon />
            </IconButton>
        </Box>
    );
};


