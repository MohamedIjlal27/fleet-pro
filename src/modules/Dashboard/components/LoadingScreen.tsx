import { Box, CircularProgress, Typography } from "@mui/material";

interface LoadingScreenProps {
    label?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ label = "Loading..." }) => {
    return (
        <Box className="w-full h-full flex justify-center items-center">
            <Box 
                position="relative" 
                width="40%" 
                display="flex" 
                justifyContent="center" 
                alignItems="center"
            >
                <CircularProgress 
                    size="100%" // 100% of the parent container (40% of the screen width)
                    thickness={2} // Reduced thickness for a sleeker look
                    color="primary" 
                />
                {/* <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    textAlign="center" // Centers text within the box
                    width="80%" // Limits label width
                >
                    <Typography 
                        variant="h6" 
                        fontWeight="bold" 
                        noWrap={false} 
                        sx={{
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 2, // Limit to 2 lines
                            overflow: "hidden",
                            wordBreak: "break-word",
                            textAlign: "center",
                        }}
                    >
                        {label}
                    </Typography>
                </Box> */}
            </Box>
        </Box>
    );
};

export default LoadingScreen;
