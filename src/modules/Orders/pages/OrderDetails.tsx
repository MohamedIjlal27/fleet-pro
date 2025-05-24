import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Divider,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    MenuItem,
    Avatar,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
} from "@mui/material";
import Timeline from "@mui/lab/Timeline";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import CheckIcon from "@mui/icons-material/Check";
import car_model from "/src/assets/car_models/car_model_1_big.png";
import { fetchOrderDetail, createPayment, assignDeliveryTask, fetchOrderUsers, resendSMS } from "../apis/apis";
import { useNavigate, useParams } from "react-router";
import { createScreening } from "../../Operations/ScreeningLogs/apis/apis";
import { toast } from "react-toastify";
import { systemPlan, systemModule } from '@/utils/constants'
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from "@/modules/core/pages/Error404Page";
import LockedFeature from '@/modules/core/components/LockedFeature'

interface TimelineItem {
    label: string;
    date: string;
    status: "completed" | "pending";
    content?: React.ReactNode;
}

export const OrderDetails: React.FC = () => {
  if (!checkModuleExists(systemModule.Orders)) {
    return checkPlanExists(systemPlan.FreeTrial) ? <LockedFeature featureName="Orders" /> : <Error404Page />;
  }
  
    const { id } = useParams<{ id: string }>();
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [openModal, setOpenModal] = useState(false);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [deliveryData, setDeliveryData] = useState({
        Date: '',
        assignedTo: '',
        type: '',
    });
    const [users, setUsers] = useState([]);
    const [showAgreement, setShowAgreement] = useState(false);



    useEffect(() => {
        loadOrderDetail();
        loadUsers();
    }, []);

    const loadOrderDetail = async () => {
        if (!id) {
            console.error("Order ID is required");
            return;
        }
        try {
            const response = await fetchOrderDetail(id);
            //console.log("fetchOrderDetail response = ",response);
            setOrderDetails(response);
        } catch (error) {
            console.error("Error loading orders:", error);
        }
    };


    const loadUsers = async () => {
        const usersData = await fetchOrderUsers();
        setUsers(usersData);
    };


    // Use response data or fallback to dummy data

    const screening = orderDetails?.screening || {
        status: "Dummy"
    }

    const payment = orderDetails?.payment || {
        planName: "Basic VIP",
        deposit: "$1,000.00",
        subscriptionFee: "$600.00",
        tax: "$78.00",
        grandTotal: "$1,678.00",
        orderPackages: [
            {
                name: "Subscription Fee",
                amount: "$100.00"
            },
        ],
        status: "Await",
    };

    const schedule = orderDetails?.schedule || {
        pickupDate: "N/A",
        pickupTime: "N/A",
        pickupAddress: "N/A",
        dropOffDate: "N/A",
        dropOffTime: "N/A",
        dropOffAddress: "N/A",
        rangeUnit: "",
        range: "N/A",
    };

    const vehicle = orderDetails?.vehicle || {
        make: "FORD",
        model: "Escape",
        engineType: "Gasoline",
        bodyClass: "SUV",
        garageName: "Toronto Auto Group",
        vin: "not-provided",
        plateNumber: "N/A",
        vehicleFiles: [],
    };

    const customer = orderDetails?.customer || {
        id: 1,
        name: "dummy",
        email: "test@gmail.com",
        phone: "12345678",
        location: "Toronto, Canada",
    };

    const timeStamp = orderDetails?.metadata?.logs;

    const driverLicense = orderDetails?.driverLicense || [];

    const agreement = driverLicense.find((license: any) => license.fileType === 99) || null;

    const handleToggleVisibility = () => {
        // Toggle the visibility of the Paper component
        setShowAgreement(!showAgreement);
    };


    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleSubmit = () => {
        console.log("Reason for closing the order:", reason);
        // You can add logic to send the reason to the server here
        setOpenModal(false); // Close the modal after submit
    };

    const handleScreening = async () => {
        console.log(`screening.status  = ${screening.status}`)
        if (screening.status == "Start" && id && !loading) {
            setLoading(true); // Set loading state to true when the screening is being processed
            try {
                await createScreening(parseInt(id))
            } catch (error) {
                console.error("Error during screening processing:", error);
            } finally {
                await loadOrderDetail();
                setLoading(false); // Reset loading state after API calls
            }
        } else {
            navigate(`/operations/screening-logs/`);
            // pass id later
        }
    };

    const handlePayment = async () => {
        if (payment.status == "INITIATE" && id && !loading) {
            setLoading(true); // Set loading state to true when the payment is being processed
            try {
                await createPayment(id); // Call the createPayment API
            } catch (error) {
                console.error("Error during payment processing:", error);
            } finally {
                await loadOrderDetail(); // Fetch the updated order details
                setLoading(false); // Reset loading state after API calls
            }
        }
    };

    const handlePreviewClick = () => {
        navigate(`/preview/customer-agreement-signature/${id}`);
    };

    const handleResendSms = () => {
        resendSMS(id);
    };

    const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setOrderDetails((prevDetails) => {
            if (name === "assignedTo") {
                // Update assigneeId inside the task object
                return {
                    ...prevDetails,
                    task: {
                        ...prevDetails?.task,
                        assigneeId: value, // Update assigneeId with the selected value
                    },
                };
            }

            if (name === "type") {
                // Update deliveryType inside the metadata object
                return {
                    ...prevDetails,
                    task: {
                        ...prevDetails?.task,
                        metadata: {
                            ...prevDetails?.task?.metadata,
                            deliveryType: value, // Update deliveryType with the selected value
                        },
                    },
                };
            }

            if (name === "Date") {
                // Update scheduleDate inside the task object
                return {
                    ...prevDetails,
                    task: {
                        ...prevDetails?.task,
                        scheduleDate: value, // Update scheduleDate with the selected value
                    },
                };
            }

            // If the field does not match any specific condition, return the previous state
            return prevDetails;
        });
    };


    const handleAssignClick = async () => {
        const missingFields = [];
        if (orderDetails?.task.status > 20) {
            toast.error("Task already started");
            return;
        }
        // Check each required field and collect missing fields
        if (!orderDetails?.task?.assigneeId) missingFields.push("Assigned To");
        if (!orderDetails?.task?.scheduleDate) missingFields.push("Date");
        if (!orderDetails?.task?.metadata?.deliveryType) missingFields.push("Type");

        console.log("orderDetails?.task? = ", orderDetails?.task);


        // If there are missing fields, show an error message
        if (missingFields.length > 0) {
            const missingFieldsMessage = missingFields.join(", ");
            toast.error(`Please fill in the following required fields: ${missingFieldsMessage}.`);
            return;
        }

        const payload = {
            orderId: id ? parseInt(id) : null,
            assigneeId: parseInt(orderDetails?.task?.assigneeId),
            scheduleDate: orderDetails?.task?.scheduleDate,
            deliveryType: orderDetails?.task?.metadata?.deliveryType,
        };

        try {
            const response = await assignDeliveryTask(payload);
            //console.log("fetchOrderDetail response = ",response);
            toast.success('Assign Delivery Task Success');
        } catch (error) {
            toast.error('Error Assign Delivery Task');
            console.error("Error loading orders:", error);
        }

        
    }

    // function getSectionStatus(sectionName: string): 'completed' | 'pending' {

    //     const OrdersPaymentStatusMapConstant = {
    //         10: 'New',
    //         15: 'Viewed',
    //         20: 'Confirmed',
    //         30: 'Driver Verified',
    //         40: 'Vehicle Confirmed',
    //         50: 'Pay Pending',
    //         60: 'Paid',
    //         100: 'Subscribing',
    //         110: 'Completed',
    //         '-10': 'Closed',
    //     } as const;

    //     type SectionName = keyof typeof OrdersPaymentStatusMapConstant;


    //     // Convert section name to number using reverse map
    //     const sectionStatusNumber = Number(
    //         Object.keys(OrdersPaymentStatusMapConstant).find(
    //             (key) => OrdersPaymentStatusMapConstant[key as SectionName] === sectionName
    //         )
    //     );
    //     const currentStatusNumber = Number(
    //         Object.keys(OrdersPaymentStatusMapConstant).find(
    //             (key) => OrdersPaymentStatusMapConstant[key as SectionName] === orderDetails?.status
    //         )
    //     );
    //     //console.log(`currentStatusNumber = ${currentStatusNumber} sectionStatusNumber = ${sectionStatusNumber}`);
    //     // If the currentStatus is greater than or equal to the section's status, it's completed
    //     if (currentStatusNumber >= sectionStatusNumber) {
    //         return 'completed';
    //     }

    //     return 'pending';
    // }

    const timeline: TimelineItem[] = [
        {
            label: "Order Accepted",
            date: orderDetails?.createdAt ?? "N/A",
            status: orderDetails?.createdAt ? "completed" : "pending",
        },
        {
            label: "Vehicle Confirmation",
            date: timeStamp?.vehicle_confirmation ?? "N/A",
            status: timeStamp?.vehicle_confirmation ? "completed" : "pending",
            content: (
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        {vehicle.vehicleFiles.length > 0 ? (
                            <img
                                src={vehicle.vehicleFiles[0].fileUrl}
                                alt="Car"
                                style={{ width: "100%", borderRadius: "8px" }}
                            />
                        ) : (
                            <Typography>No vehicle images available</Typography>
                        )}
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Typography variant="body2">
                            <strong>VehicleID:</strong> {vehicle.id || "N/A"}
                        </Typography>
                        <Typography variant="body2">
                            <strong>VIN:</strong> {vehicle.vin || "N/A"}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Plate#:</strong> {vehicle.plateNumber || "N/A"}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Status:</strong> {vehicle.status || "N/A"}
                        </Typography>
                    </Grid>
                </Grid>
            ),
        },
        {
            label: "Driver License Screening",
            date: timeStamp?.screening_approval ?? "N/A",
            status: timeStamp?.screening_approval ? "completed" : "pending",
            content: (
                <Grid container spacing={2}>
                    {[
                        ...driverLicense.filter((license: any) => license.fileType === 1),
                        ...driverLicense.filter((license: any) => license.fileType === 2)
                    ].map((license: any, index: number) => (
                        <Grid item xs={6} key={index}>
                            <img
                                src={license.fileUrl}
                                alt={`License ${index + 1}`}
                                style={{
                                    width: "100%",
                                    borderRadius: "8px",
                                    objectFit: "cover",
                                }}
                            />
                        </Grid>
                    ))}
                    <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                        {/* <Typography variant="body1" sx={{ color: "#0A1224", marginBottom: 1 }}>
                            Expiry Date: --/--/----
                        </Typography> */}
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            onClick={handleScreening}
                        >
                            {screening.status}
                        </Button>
                    </Grid>


                </Grid>
            ),
        },
        {
            label: "Payment",
            date: timeStamp?.payment_successful ?? "N/A",
            status: timeStamp?.payment_successful ? "completed" : "pending",
            content: (
                <Grid container justifyContent="space-between" alignItems="center">
                    {/* <Typography variant="body2">VISA **** **** 4242 12/28</Typography> */}
                    <Typography variant="h6" fontWeight="bold">
                        Total: {payment.grandTotal}
                    </Typography>
                    <Button
                        variant="contained"
                        color={payment?.status === 'INITIATE' ? 'success' : 'default'}
                        disabled={payment?.status !== 'INITIATE' || loading}
                        onClick={handlePayment}
                    >
                        {payment?.status ? (
                            payment.status === 'INITIATE' ? (
                                'Initiate Payment'
                            ) : (
                                payment.status
                            )
                        ) : (
                            'Await'
                        )}
                    </Button>

                </Grid>
            ),
        },
        {
            label: "Digital Signature",
            date: timeStamp?.digital_signature ?? "N/A",
            status: timeStamp?.digital_signature ? "completed" : "pending",
            content: (
                <Box display="flex" flexDirection="row" alignItems="center" gap={2} justifyContent="center">
                    {/* Conditional Box Content */}
                    {agreement && agreement.fileUrl ? (
                        <Box >
                            {!showAgreement ? (
                                // Button that shows the agreement when clicked
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleToggleVisibility}
                                >
                                    View Signed Agreement
                                </Button>
                            ) : (
                                // Paper that shows the agreement and image
                                <Paper
                                    sx={{
                                        width: "100%",
                                        maxWidth: 1320,
                                        padding: 4,
                                        bgcolor: "#1A2332",
                                        color: "#fff",
                                        borderRadius: 2,
                                        boxShadow: 3,
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginTop: 2,
                                    }}
                                    onClick={handleToggleVisibility} // Clicking on the Paper hides it
                                >
                                    {/* Agreement Text */}
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            marginBottom: 2,
                                            whiteSpace: "pre-line", // Preserve line breaks
                                        }}
                                        dangerouslySetInnerHTML={{ __html: agreement.metadata?.agreement || "No agreement content available." }}
                                    />
                                    {/* Agreement Image */}
                                    <Box
                                        component="img"
                                        src={agreement.fileUrl}
                                        alt="Customer Agreement Image"
                                        sx={{
                                            backgroundColor: "#fff",
                                            maxWidth: "100%",
                                            height: "auto",
                                            borderRadius: "8px",
                                            marginTop: 2,
                                        }}
                                    />
                                </Paper>
                            )}
                        </Box>
                    ) : (
                        // Default Box to show when no agreement or no fileUrl
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            gap="16px"
                        >
                            <Box
                                border="1px dashed #ccc"
                                borderRadius="8px"
                                padding="8px"
                                flex="1"
                                onClick={handlePreviewClick}
                                sx={{ cursor: "pointer" }}
                            >
                                <Typography variant="body2">Check Customer Agreement</Typography>
                            </Box>

                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleResendSms}
                            >
                                Resend SMS
                            </Button>
                        </Box>

                    )}
                </Box>
            ),
        },
        {
            label: "Delivery",
            date: orderDetails?.task?.actuallyTime ? orderDetails.task.actuallyTime : "N/A",
            status: orderDetails?.task?.actuallyTime ? "completed" : "pending",
            content: (
                <Grid container spacing={2}>

                    {/* Type */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Type"
                            select
                            fullWidth
                            name="type"
                            value={orderDetails?.task?.metadata?.deliveryType || "PICKUP"} // Default to "PICKUP" if undefined
                            onChange={handleTaskChange}
                        >
                            <MenuItem value="PICKUP">Pick up</MenuItem>
                            <MenuItem value="DROP_OFF">Drop Off</MenuItem>
                        </TextField>
                    </Grid>

                    {/* Assign To */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Assign To"
                            select
                            fullWidth
                            name="assignedTo"
                            value={orderDetails?.task?.assigneeId || ""} // Default to "" if undefined
                            onChange={handleTaskChange}
                        >
                            {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Scheduled Delivery Date */}
                    <Grid item xs={12} sm={8}>
                        <TextField
                            label="Scheduled Delivery Date"
                            type="datetime-local"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            name="Date"
                            value={orderDetails?.task?.scheduleDate ? orderDetails.task.scheduleDate.slice(0, 16) : ""} // Slice to match the input format
                            onChange={handleTaskChange}
                        />
                    </Grid>

                    {/* Assign Button */}
                    <Grid item xs={12} sm={4}>
                        <Button variant="contained" color="primary" onClick={handleAssignClick}>
                            Assign
                        </Button>
                    </Grid>
                </Grid>

            ),
        },
        {
            label: "Order Completed",
            date: orderDetails?.task?.actuallyTime ? orderDetails.task.actuallyTime : "N/A",
            status: orderDetails?.task?.actuallyTime ? "completed" : "pending",
            content: (
                <Grid container spacing={2}>
                    {/* Left Column */}
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Delivered Date:
                        </Typography>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                            {orderDetails?.task?.actuallyTime || "Not available"}
                        </Typography>

                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Task Number:
                        </Typography>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                            {orderDetails?.task?.id || "Not assigned yet"}
                        </Typography>
                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={12} sm={6} >
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Delivered By:
                        </Typography>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                            {orderDetails?.task?.assigneeId
                                ? (() => {
                                    const assignedUser = users.find(user => user.id === orderDetails.task.assigneeId);
                                    return assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : "User not found";
                                })()
                                : "Not assigned yet"}
                        </Typography>

                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Inspection Report:
                        </Typography>
                        {typeof orderDetails?.inspection?.id === "number" ? (
                            <Typography
                                component="a"
                                href={`/public/inspection-report?id=${orderDetails?.inspection?.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="body1"
                                color="primary"
                                sx={{ textDecoration: "underline", cursor: "pointer" }}
                            >
                                View Report {orderDetails?.inspection?.id}
                            </Typography>
                        ) : (
                            <Typography variant="body1" color="text.secondary">
                                No report available
                            </Typography>
                        )}
                    </Grid>
                </Grid>
            ),
        },
    ];

    return (
        <Box padding="24px">
            {/* Header */}

            <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Order Details
                </Typography>
            </Grid>
            <Grid container spacing={3}>
                {/* Left Column */}
                <Grid item xs={12} md={6}>
                    {/* Subscription Card */}
                    <Card sx={{ borderRadius: "8px", border: "1px solid #e0e0e0", marginBottom: "16px" }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Subscription
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                {payment.planName || "N/A"}
                            </Typography>

                            {payment.deposit && (
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2">
                                        Deposit
                                    </Typography>
                                    <Typography variant="body2">
                                        {payment.deposit}
                                    </Typography>
                                </Box>
                            )}
                            {(payment.orderPackages?.length > 0 ? payment.orderPackages : []).map((pkg: any, index: number) => (

                                <Box display="flex" justifyContent="space-between" key={index}>
                                    <Typography variant="body2">{pkg.name}</Typography>
                                    <Typography variant="body2">{pkg.amount}</Typography>
                                </Box>
                            ))}
                            <Divider sx={{ marginY: "16px" }} />
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body1" fontWeight="bold">
                                    Tax
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {payment.tax}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body1" fontWeight="bold">
                                    Total
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {payment.grandTotal}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Schedule Card */}
                    <Card sx={{ borderRadius: "8px", border: "1px solid #e0e0e0", marginBottom: "16px" }}>
                        <CardContent>

                            {/* delivery-info */}
                            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="nowrap" marginBottom="16px">
                                <Box textAlign="left">
                                    <Typography variant="body2" fontWeight="bold">
                                        Pick-up:
                                    </Typography>
                                    <Typography variant="body2">{schedule.pickupDate}</Typography>
                                    <Typography variant="body2">{schedule.pickupTime}</Typography>
                                    <Typography variant="body2">{schedule.pickupAddress}</Typography>
                                </Box>
                                <Box textAlign="center" sx={{ marginX: "16px", whiteSpace: "nowrap" }}>
                                    <Typography variant="body2">{schedule.range} {schedule.rangeUnit}</Typography>
                                    <Typography variant="body2">--------------&gt;</Typography>
                                </Box>
                                <Box textAlign="right">
                                    <Typography variant="body2" fontWeight="bold">
                                        Drop-off:
                                    </Typography>
                                    <Typography variant="body2">{schedule.dropOffDate}</Typography>
                                    <Typography variant="body2">{schedule.dropOffTime}</Typography>
                                    <Typography variant="body2">{schedule.dropOffAddress}</Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ marginY: "16px" }} />

                            {/* car-info */}
                            <Box display="flex" marginBottom="16px">
                                <Box width="100%" display="flex" alignItems="center" justifyContent="center">
                                    <img
                                        src={vehicle.vehicleFiles[0]?.fileUrl || car_model}
                                        alt="Vehicle"
                                        style={{ width: "100%", borderRadius: "8px" }}
                                    />
                                </Box>
                                <Box paddingLeft="16px">
                                    <Typography variant="body2">
                                        <strong>{vehicle.make} {vehicle.model}</strong>
                                    </Typography>
                                    <Divider sx={{ marginY: 1 }} /> {/* Divider between vehicle make/model and next element */}

                                    <Typography variant="body2">Engine Type: {vehicle.fuelType || "Gasoline"}</Typography>
                                    <Divider sx={{ marginY: 1 }} /> {/* Divider between engine type and next element */}

                                    <Typography variant="body2">Body Type: {vehicle.bodyClass || "SUV"}</Typography>
                                    <Divider sx={{ marginY: 1 }} /> {/* Divider between body type and next element */}

                                    <Typography variant="body2">Garage: {vehicle.garageName}</Typography>
                                    <Divider sx={{ marginY: 1 }} /> {/* Divider between garage and button */}

                                    {/* <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => console.log('Check Function')}
                                    >
                                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                            Check Availability
                                        </Typography>
                                    </Button> */}

                                </Box>

                            </Box>
                        </CardContent>
                    </Card>

                    {/* Customer Details */}
                    <Card sx={{ borderRadius: "8px", border: "1px solid #e0e0e0", marginBottom: "16px" }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box display="flex" alignItems="center">
                                    <Avatar sx={{ width: 48, height: 48, marginRight: "16px" }} />
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            {customer.name}
                                        </Typography>
                                        <Typography variant="body2">ID: {customer.id}</Typography>
                                    </Box>
                                </Box>
                                <Divider orientation="vertical" flexItem sx={{ marginX: "8px", borderColor: "#e0e0e0" }} />
                                <Box>
                                    <Typography variant="body2">Phone: {customer.phone}</Typography>
                                    <Typography variant="body2">Email: {customer.email}</Typography>
                                    <Typography variant="body2">Location: {customer.location || 'Toronto, Canada'}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column: Timeline */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ width: "100%", paddingTop: "20px" }}>
                        <Timeline
                            position="right"
                            sx={{
                                [`& .${timelineItemClasses.root}:before`]: {
                                    flex: 0,
                                    padding: 0,
                                },
                            }}
                        >
                            {timeline.map((item, index) => {
                                return (
                                    <TimelineItem key={index}>
                                        <TimelineSeparator>
                                            <TimelineDot
                                                sx={{
                                                    bgcolor: item.status === "completed" ? "primary.main" : "transparent",
                                                    borderColor: item.status === "completed" ? "primary.main" : "grey.500",
                                                    borderStyle: "solid",
                                                    borderWidth: 2,
                                                    width: 24, // Fixed size for alignment
                                                    height: 24, // Fixed size for alignment
                                                    display: "flex", // Enable flexbox for centering the icon
                                                    alignItems: "center", // Vertically center the icon
                                                    justifyContent: "center", // Horizontally center the icon

                                                }}
                                            >
                                                {item.status === "completed" && (
                                                    <CheckIcon sx={{ fontSize: 16, color: "white" }} />
                                                )}
                                            </TimelineDot>
                                            {index < timeline.length - 1 && (
                                                <TimelineConnector
                                                    sx={{
                                                        bgcolor: item.status === "completed" ? "primary.main" : "grey.500",
                                                        width: 2,
                                                    }}
                                                />
                                            )}
                                        </TimelineSeparator>
                                        <TimelineContent sx={{ textAlign: "left" }}>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <Typography variant="h6" sx={{ marginRight: "8px" }}>
                                                    {item.label}
                                                </Typography>
                                                {item.status === "completed" && (
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ fontSize: "0.875rem", color: "text.secondary" }}
                                                    >
                                                        {item.date}
                                                    </Typography>
                                                )}
                                            </Box>
                                            {item.content && (
                                                <Box
                                                    sx={{
                                                        marginTop: "10px",
                                                        textAlign: "left",
                                                        border: "1px dashed",
                                                        borderRadius: "8px",
                                                        padding: "10px",
                                                    }}
                                                >
                                                    {item.content}
                                                </Box>
                                            )}
                                        </TimelineContent>
                                    </TimelineItem>
                                );
                            })}
                        </Timeline>
                    </Box>
                </Grid>
            </Grid>

            {/* Modal */}
            <Dialog open={openModal} onClose={handleCloseModal}>
                <DialogTitle>Close Order</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" gutterBottom>
                        Please provide a reason for closing the order:
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        variant="outlined"
                        placeholder="Enter reason"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

