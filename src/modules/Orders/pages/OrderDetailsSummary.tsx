import React from "react";
import { Box, Typography, Divider } from "@mui/material";

interface OrderDetailsSummaryProps {
    subscriptionType: string;
    planName: string;
    pickUpDate: string;
    dropOffDate: string;
    pickUpLocation: string;
    dropOffLocation: string;
    duration: string;
    deposit: string;
    subscriptionFee: string;
    tax: string;
    totalCost: string;
}

export const OrderDetailsSummary: React.FC<OrderDetailsSummaryProps> = ({
    subscriptionType,
    planName,
    pickUpDate,
    dropOffDate,
    pickUpLocation,
    dropOffLocation,
    duration,
    deposit,
    subscriptionFee,
    tax,
    totalCost,
}) => {
    return (
        <Box padding="16px" border="1px solid #e0e0e0" borderRadius="8px">
            <Typography variant="h6" fontWeight="bold">
                Subscription: {subscriptionType}
            </Typography>
            <Typography variant="body1">Plan: {planName}</Typography>
            <Divider sx={{ marginY: 2 }} />
            <Typography variant="body2">Pick-up: {pickUpDate} - {pickUpLocation}</Typography>
            <Typography variant="body2">Drop-off: {dropOffDate} - {dropOffLocation}</Typography>
            <Typography variant="body2">Duration: {duration}</Typography>
            <Divider sx={{ marginY: 2 }} />
            <Typography variant="body1">Deposit: {deposit}</Typography>
            <Typography variant="body1">Subscription Fee: {subscriptionFee}</Typography>
            <Typography variant="body1">Tax: {tax}</Typography>
            <Divider sx={{ marginY: 2 }} />
            <Typography variant="h6" fontWeight="bold">Total: {totalCost}</Typography>
        </Box>
    );
};


