import React, { useRef, useEffect, useState } from "react";
import SignatureCanvas from 'react-signature-canvas';
import {
    Typography,
    Box,
    Grid,
    Button,
    Paper
} from "@mui/material";
import { fetchSettingsCustomerAgreement, fetchCustomerAgreementFromToken, signAgreement, ISignatureData } from '../apis/apis'; // Import the API function
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { fetchOrderDetail } from "../../../Orders/apis/apis";
import { toast } from "react-toastify";

const CustomerAgreementSignaturePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [pageType, setPageType] = useState<'public' | 'preview' | null>(null);
    const path = window.location.pathname;
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');


    const [tmpSignImg, setTmpSignImg] = useState<string>('');
    const [isSignatureDisabled, setIsSignatureDisabled] = useState(false);
    const [currentCustomerAgreement, setCurrentCustomerAgreement] = useState({ content: 'Here is your Contract content' });
    const signatureCanvasRef = useRef<SignatureCanvas | null>(null);
    const [signatureData, setSignatureData] = useState<string | null>(null);

    const navigate = useNavigate();


    useEffect(() => {
        // only three mode for now
        if (!token && path.includes('/preview') && id) {
            setPageType('preview');
            loadSettingsCustomerAgreement();
            getSignature(id);
        }

        if (token && path.includes('/public')) {
            setPageType('public');
            loadAgreementByToken(token);
        }

    }, []);



    const getSignature = async (id: string) => {
        const response_data = await fetchOrderDetail(id);
        console.log(`getSignature = ${JSON.stringify(response_data)}`);

        if (response_data) {
            // Find the last driver license with fileType 99 and set it to state
            const lastLicense = response_data.driverLicense
                .filter((license: any) => license.fileType === 99)
                .pop(); // Get the last license
            if (lastLicense) {
                setTmpSignImg(lastLicense.fileUrl); // Update state with the image URL
            }
        }
    };


    const loadAgreementByToken = async (token: string) => {
        const response_data = await fetchCustomerAgreementFromToken(token);
        console.log(`response_data = ${response_data}`);
        if (response_data) {
            setCurrentCustomerAgreement({
                ...currentCustomerAgreement,
                content: response_data,
            })
        }
    };

    const loadSettingsCustomerAgreement = async () => {
        const response_data = await fetchSettingsCustomerAgreement();
        if (response_data) {
            setCurrentCustomerAgreement({
                ...currentCustomerAgreement,
                content: response_data.metadata.content,
            })
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
            console.log("Base64 Signature:", { signature: base64Data }); // Log clean Base64 data

            // Prepare SignatureData object
            const signatureData: ISignatureData = {
                signatureAgreement: currentCustomerAgreement.content, // Replace with actual agreement text
                signatureImage: base64Data, // Pass cleaned Base64 data
            };

            signAgreement(token, signatureData)
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


    const sendSignatureToAPI = async (base64Image: string) => {
        try {
            //passing base 64 image
            console.log(`signature = ${JSON.stringify({ signature: base64Image })}`);
        } catch (error) {
            console.error('Error saving signature:', error);
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{
                padding: 3,
                backgroundColor: "#f9f9f9",
                minHeight: '100vh',
            }}
        >
            <Paper
                sx={{
                    width: "100%",
                    maxWidth: 1320,
                    padding: 4,
                    bgcolor: "#1A2332",
                    color: "#fff",
                    borderRadius: 2,
                    boxShadow: 3,
                }}
            >
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        bgcolor: "#ccc",
                        paddingY: 2,
                        color: "#000",
                        textAlign: "center",
                        fontWeight: "bold",
                    }}
                    gutterBottom
                >
                    {pageType === 'public' ? `The Agreement` : `Agreement For Order ID ${id}`}

                </Typography>
                <Typography
                    component="pre"
                    sx={{
                        whiteSpace: "pre-wrap",
                        color: "#fff",
                        marginBottom: 2,
                    }}
                >
                    {currentCustomerAgreement.content}
                </Typography>

                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        marginBottom: 2,
                        padding: 2,
                    }}
                >

                    <Box>
                        {pageType === 'public' && (
                            <>
                                <Typography
                                    variant="h6"
                                    component="h2"
                                    sx={{ marginBottom: 2 }}
                                >
                                    Lessee Signature
                                </Typography>
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
                                {!isSignatureDisabled && (
                                    <Box
                                        display="flex"
                                        justifyContent="center"
                                        sx={{ marginTop: 2, gap: 2 }}
                                    >
                                        <Button
                                            variant="outlined"
                                            onClick={handleClear}
                                            sx={{
                                                borderColor: "#fff",
                                                color: "#fff",
                                                paddingX: 3,
                                            }}
                                        >
                                            Clear
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleSave}
                                            sx={{
                                                backgroundColor: "#1976d2",
                                                paddingX: 3,
                                            }}
                                        >
                                            Save and Continue
                                        </Button>
                                    </Box>
                                )}
                                {isSignatureDisabled && (
                                    <Typography
                                        variant="h6"
                                        color="#fff"
                                        sx={{ marginTop: 2 }}
                                    >
                                        Signature has been submitted.
                                    </Typography>
                                )}
                            </>
                        )}
                        {pageType === 'preview' && (
                            <Box
                                display="flex"
                                flexDirection="column"  // Arrange items in a vertical column
                                justifyContent="center"
                                alignItems="center"     // Center the content horizontally
                                sx={{ marginTop: 2 }}
                            >
                                {tmpSignImg ? (
                                    // If tmpSignImg has a value, show the image
                                    <img
                                        src={tmpSignImg}
                                        alt="Lessee Signature"
                                        style={{
                                            width: '300px',
                                            height: '200px',
                                            border: '1px solid #000',
                                            borderRadius: '8px',
                                            backgroundColor: 'white',
                                            marginBottom: '16px', // Space between image and button
                                        }}
                                    />
                                ) : (
                                    // If tmpSignImg is empty, show the "Not Signed" text
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: '#ff0000', // Optional: Make the text red or any other color
                                            marginBottom: '16px',
                                        }}
                                    >
                                        Not Signed
                                    </Typography>
                                )}

                                <Button
                                    variant="outlined"
                                    onClick={() => navigate(-1)}  // Go back to the previous page
                                    sx={{
                                        borderColor: "#fff",
                                        color: "#fff",
                                        paddingX: 3,
                                    }}
                                >
                                    Go Back
                                </Button>
                            </Box>
                        )}

                    </Box>

                </Box>
            </Paper>
        </Box>
    );
};

export default CustomerAgreementSignaturePage;
