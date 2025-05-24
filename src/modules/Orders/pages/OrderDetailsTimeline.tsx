import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface TimelineItem {
    label: string;
    date: string;
    status: string;
}

export const OrderDetailsTimeline: React.FC<{ timeline: TimelineItem[] }> = ({ timeline }) => {
    return (
        <Box padding="16px" border="1px solid #e0e0e0" borderRadius="8px">
            <Typography variant="h6" fontWeight="bold">Order Progress</Typography>
            <Divider sx={{ marginY: 2 }} />
            {timeline.map((item, index) => (
                <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    gap="16px"
                    marginBottom="16px"
                >
                    <CheckCircleIcon
                        color={item.status === "completed" ? "success" : "disabled"}
                    />
                    <Box>
                        <Typography variant="body1">{item.label}</Typography>
                        <Typography variant="body2" color="textSecondary">
                            {item.date}
                        </Typography>
                    </Box>
                </Box>
            ))}
        </Box>
    );
};


