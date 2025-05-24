import {
    Box,
    Card,
    Checkbox,
    FormControlLabel,
    Grid,
    LinearProgress,
    List,
    ListItem,
    Typography,
    Rating,
    Button,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { useEffect, useRef, useState } from "react";
import { fetchInspectionReport, signReport, ISignatureData } from "./apis/apis"; // Ensure this path is correct
import { useLocation } from "react-router";
import { toast } from "react-toastify";
import SignatureCanvas from 'react-signature-canvas';

interface Report {
    id: number;
    createdAt: string;
    vin: string;
    rating: {
        item: string;
        points: string;
    }[];
    operationNotes: string;
    inspectionItems: {
        desc: string;
        item: string;
    }[];
    aiImages: string[];
    images: string[];
    imagesInfo: {
        capturedCount: number;
        uploadedCount: number;
    };
    orderInfo: {
        status: number;
        serviceType: number;
    };
    customerInfo: {
        phone: string;
        email: string;
        firstName: string;
        lastName: string;
        address: string;
        licenseNumber: string;
        expiryDate: string;
        age: string;
    };
    vehicleDetail: {
        plateNumber: string;
        make: string;
        model: string;
        "KM in": string;
        "KM out": string;
    };
    companyInfo: {
        name: string;
        address: string;
    };
}


const defaultReport: Report = {
    id: 0,
    createdAt: "N/A",
    vin: "N/A",
    rating: [], // Empty array for ratings
    operationNotes: "N/A",
    inspectionItems: [], // Empty array for inspection items
    aiImages: [], // Empty array for AI images
    images: [], // Empty array for images
    imagesInfo: {
        capturedCount: 0,
        uploadedCount: 0,
    },
    orderInfo: {
        status: 0, // Default status value
        serviceType: 0, // Default service type value
    },
    customerInfo: {
        phone: "N/A",
        email: "N/A",
        firstName: "N/A",
        lastName: "N/A",
        address: "N/A",
        licenseNumber: "N/A",
        expiryDate: "N/A",
        age: "N/A",
    },
    vehicleDetail: {
        plateNumber: "N/A",
        make: "N/A",
        model: "N/A",
        "KM in": "N/A",
        "KM out": "N/A",
    },
    companyInfo: {
        name: "N/A",
        address: "N/A",
    }
};


export const InspectionReportPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');


    const [report, setReport] = useState<Report>(defaultReport);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSignatureDisabled, setIsSignatureDisabled] = useState(false);
    const signatureCanvasRef = useRef<SignatureCanvas | null>(null);
    const [signatureData, setSignatureData] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadReport(id as string);
        }
    }, [id]);

    const loadReport = async (reportId: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchInspectionReport(reportId);
            console.log("fetchInspectionReport data= ", data);
            setReport(data);
        } catch (err) {
            console.error("Failed to load report:", err);
            setError("Failed to load the report. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        signatureCanvasRef.current?.clear();
    };

    const handleSave = () => {
        if (signatureCanvasRef.current) {
            const base64Image = signatureCanvasRef.current.toDataURL(); // Full data URL
            const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, ""); // Remove the prefix
            setSignatureData(base64Data); // Store clean Base64 data
            //console.log("Base64 Signature:", { signature: base64Data }); // Log clean Base64 data

            signReport(parseInt(queryParams.get('id') || '0', 10), base64Data)
                .then((isSuccessful) => {
                    toast.success("Signature posted successfully:", isSuccessful);
                    setIsSignatureDisabled(true);
                })
                .catch((error) => {
                    // Check if the error is a 401 Unauthorized
                    if (error.response && error.response.status === 401) {
                        toast.error("Unauthorized: 401 error", error);
                    } else {
                        toast.error("Error posting signature:", error);
                    }
                    setIsSignatureDisabled(true);
                });
        }

    };

    if (error) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ backgroundColor: "#F6F6F6", minHeight: "100vh", p: 3 }}>
            <Box mb={4}>
                <Typography variant="h5" fontWeight="bold">
                    Inspection Report
                </Typography>
                <Typography variant="subtitle2" ml={2}>
                    Report Number: {report.id}
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: "12px" }}>
                        <Typography variant="subtitle1" mb={1} sx={{ borderBottom: "1px solid #F0F0F0" }}>
                            Summary
                        </Typography>
                        <List>
                            <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="body2">Inspection Date:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {report.createdAt}
                                </Typography>
                            </ListItem>
                            <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="body2">Vehicle Number:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {report.vin}
                                </Typography>
                            </ListItem>
                        </List>
                    </Card>


                    <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: "12px" }}>
                        <Typography
                            variant="subtitle1"
                            mb={1}
                            sx={{ borderBottom: "1px solid #F0F0F0" }}
                        >
                            Rating
                        </Typography>
                        {Array.isArray(report.rating) && report.rating.length > 0 && (
                            <List>
                                {report.rating.map((r, idx) => (
                                    <ListItem key={idx} sx={{ flexDirection: "column", mb: 1 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                            <Typography variant="body2">{r.item}</Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {r.points} / 5
                                            </Typography>
                                        </Box>
                                        <Rating
                                            value={Number(r.points)} // Convert string points to number
                                            max={5} // Maximum rating value
                                            precision={0.5} // Allow half-star ratings
                                            readOnly // Make it read-only
                                            sx={{ mt: 0.5 }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}

                    </Card>

                    <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: "12px" }}>
                        <Typography variant="subtitle1" mb={1} sx={{ borderBottom: "1px solid #F0F0F0" }}>
                            Order Information
                        </Typography>
                        <List>
                            <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="body2">Status:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {report.orderInfo?.status ?? "N/A"}
                                </Typography>
                            </ListItem>
                            <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="body2">Service Type:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {report.orderInfo?.serviceType ?? "N/A"}
                                </Typography>
                            </ListItem>
                        </List>
                    </Card>

                    <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: "12px" }}>
                        <Typography variant="subtitle1" mb={1} sx={{ borderBottom: "1px solid #F0F0F0" }}>
                            Customer Information
                        </Typography>
                        <List>
                            <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="body2">Name:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {report.customerInfo?.firstName ?? "N/A"} {report.customerInfo?.lastName ?? "N/A"}
                                </Typography>
                            </ListItem>
                            <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="body2">Phone:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {report.customerInfo?.phone ?? "N/A"}
                                </Typography>
                            </ListItem>
                            <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="body2">Email:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {report.customerInfo?.email ?? "N/A"}
                                </Typography>
                            </ListItem>
                            <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="body2">Address:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {report.customerInfo?.address ?? "N/A"}
                                </Typography>
                            </ListItem>
                        </List>
                    </Card>

                    <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: "12px" }}>
                        <Typography variant="subtitle1" mb={1} sx={{ borderBottom: "1px solid #F0F0F0" }}>
                            Vehicle Details
                        </Typography>
                        <List>
                            <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="body2">Plate Number:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {report.vehicleDetail.plateNumber}
                                </Typography>
                            </ListItem>
                            <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="body2">Make:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {report.vehicleDetail.make}
                                </Typography>
                            </ListItem>
                            <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="body2">Model:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {report.vehicleDetail.model}
                                </Typography>
                            </ListItem>
                            <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="body2">KM In:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {report.vehicleDetail["KM in"]}
                                </Typography>
                            </ListItem>
                            <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="body2">KM Out:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {report.vehicleDetail["KM out"]}
                                </Typography>
                            </ListItem>
                        </List>
                    </Card>

                </Grid>

                <Grid item xs={12} md={6}>

                <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: "12px" }}>
                        <Typography variant="subtitle1" mb={1} sx={{ borderBottom: "1px solid #F0F0F0" }}>
                            Company Information
                        </Typography>
                        <List>
                            <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="body2">Name:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {report.companyInfo.name}
                                </Typography>
                            </ListItem>
                            <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="body2">Address:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {report.companyInfo.address}
                                </Typography>
                            </ListItem>
                        </List>
                    </Card>


                    <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: "12px" }}>
                        <Typography variant="subtitle1" mb={1} sx={{ borderBottom: "1px solid #F0F0F0" }}>
                            Operator Notes
                        </Typography>
                        <Typography variant="body2">{report.operationNotes}</Typography>
                    </Card>
                    {Array.isArray(report.inspectionItems) && report.inspectionItems.length > 0 && (
                      <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: "12px" }}>
                        <Typography variant="subtitle1" mb={1} sx={{ borderBottom: "1px solid #F0F0F0" }}>
                            Inspection Items
                        </Typography>
                        <List>
                            {report.inspectionItems.map((item, idx) => (
                                <ListItem key={idx} sx={{ alignItems: "flex-start", mb: 2 }}>
                                    <Checkbox
                                        checked={true}
                                        icon={<RadioButtonUncheckedIcon />}
                                        checkedIcon={<CheckCircleOutlineIcon color="primary" />}
                                        disabled
                                        sx={{ mr: 2, mt: 0.5 }}
                                    />
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            {item.item}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {item.desc}
                                        </Typography>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                      </Card>
                    )}
                </Grid>

                <Grid item xs={12}>

                    {/* AI Images Card */}
                    {Array.isArray(report.aiImages) && report.aiImages.length > 0 && (
                        <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: "12px" }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    borderBottom: "1px solid #F0F0F0",
                                    pb: 1,
                                    mb: 1,
                                }}
                            >
                                <Typography variant="subtitle1"> AI Images</Typography>
                                <Typography fontWeight="bold">AI Captured: {report.imagesInfo?.capturedCount}</Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                {report.aiImages
                                    .filter((src) => typeof src === "string")
                                    .map((src, idx) => (
                                        <img
                                            key={idx}
                                            src={src}
                                            alt={`AI Image ${idx + 1}`}
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: "300px",
                                                borderRadius: "12px",
                                                objectFit: "contain",
                                            }}
                                        />
                                    ))}
                            </Box>
                        </Card>
                    )}

                    {/* Uploaded Images Card */}
                    {Array.isArray(report.images) && report.images.length > 0 && (
                        <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: "12px" }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    borderBottom: "1px solid #F0F0F0",
                                    pb: 1,
                                    mb: 1,
                                }}
                            >
                                <Typography variant="subtitle1">Images</Typography>
                                <Typography fontWeight="bold">Uploaded: {report.imagesInfo?.uploadedCount}</Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                {report.images
                                    .filter((src) => typeof src === "string")
                                    .map((src, idx) => (
                                        <img
                                            key={idx}
                                            src={src}
                                            alt={`Uploaded Image ${idx + 1}`}
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: "300px",
                                                borderRadius: "12px",
                                                objectFit: "contain",
                                            }}
                                        />
                                    ))}
                            </Box>
                        </Card>
                    )}

                    <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: "12px" }}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                borderBottom: "1px solid #F0F0F0",
                                pb: 1,
                                mb: 1,
                            }}
                        >
                            <Typography variant="subtitle1">Signature</Typography>
                            {!isSignatureDisabled && ( // Show buttons when isSignatureDisabled is false
                                <Box>
                                    <Button variant="contained" onClick={handleClear}>
                                        Clear
                                    </Button>
                                    <Button variant="contained" onClick={handleSave}>
                                        Save
                                    </Button>
                                </Box>
                            )}
                        </Box>

                        <SignatureCanvas
                            ref={signatureCanvasRef}
                            disabled={false} // Keep the canvas active
                            penColor="black"
                            canvasProps={{
                                width: 300,
                                height: 200,
                                className: 'signature-canvas',
                                style: {
                                    border: '1px solid #000',
                                    borderRadius: '8px',
                                    backgroundColor: 'white',
                                    cursor: 'crosshair',
                                },
                            }}
                        />

                    </Card>

                </Grid>

            </Grid>
        </Box>
    );
};

export default InspectionReportPage;
