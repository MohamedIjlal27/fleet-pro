'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Modal,
  TextField,
  MenuItem,
  InputAdornment,
  Button,
  Divider,
  Link,
  Grid2,
  Grid,
  Input,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { IMaintenanceDetail } from '../../interfaces/interfaces';
import {
  fetchMaintenanceDetail,
  createMaintenance,
  updateMaintenance,
  uploadMaintenanceDocument,
} from '../../apis/apis';
import { fetchOrderUsers } from '../../../../Orders/apis/apis';
import { toast } from 'react-toastify';
import type { IAiMaintenance } from '../../../AiMaintenance/interfaces/interfaces';
import { aiRecommendationAction } from '../../../AiMaintenance/apis/apis';
import { fetchMaintenanceOptions } from '../../apis/apis';

interface MaintenanceModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'Edit' | 'Create' | 'AiCreate';
  vehicle?: any | null;
  maintenanceData?: IMaintenanceDetail | null;
  aiMaintenance?: IAiMaintenance | null;
  start_time?: string;
  end_time?: string;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  open,
  onClose,
  mode,
  vehicle = null,
  maintenanceData = null,
  aiMaintenance = null,
  start_time = '',
  end_time = '',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  //const [currentLead, setCurrentLead] = useState({ id: null, firstName: '', lastName: '', phone: '', email: '' });
  const defaultMaintenanceData: IMaintenanceDetail = {
    carId: vehicle?.id || 1,
    status: 10,
    serviceType: 1,
    amount: 0,
    work_shop: '',
    notes: '',
    service_detail: '',
    estimated_cost: 0,
    practical_cost: 0,
    paid_date: '',
    paid_resource: '',
    maintenanceRecordFiles: [],
    repairEta: end_time,
    startTime: start_time,
    endTime: '',
    id: 0,
    userId: 0,
    plateNumber: '',
    statusName: '',
    serviceTypeName: '',
    coverImage: '',
    make: '',
    model: '',
    year: 0,
    color: '',
  };

  const [statusOptions, setStatusOptions] = useState<Record<string, string>>(
    {}
  );
  const [serviceTypeOptions, setServiceTypeOptions] = useState<
    Record<string, string>
  >({});
  const [maintenanceInfo, setMaintenanceInfo] = useState<IMaintenanceDetail>(
    defaultMaintenanceData
  );
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadMaintenanceOptions = async () => {
      try {
        const response = await fetchMaintenanceOptions();
        console.log('response = ', response);
        // Update the state with the fetched options
        setStatusOptions(response.status || {});
        setServiceTypeOptions(response.serviceType || {});
      } catch (error) {
        console.error('Failed to fetch maintenance options:', error);
      }
    };
    loadMaintenanceOptions();
  }, []);

  useEffect(() => {
    console.log(`mode = ${mode} vehicle =`, vehicle);
    loadUsers();
    loadModal();
  }, [open, mode, vehicle?.id]);

  const loadModal = () => {
    console.log('maintenanceData = ', maintenanceData);
    if (mode === 'Edit' && maintenanceData) {
      loadMaintenanceDetail();
    } else if (mode === 'Create' && vehicle) {
      // call from Vehicle page will pass vehicle data
      setMaintenanceInfo(defaultMaintenanceData);
    } else if (mode === 'AiCreate' && aiMaintenance) {
      // Update defaultMaintenanceData with aiMaintenance
      console.log('aiMaintenance =', aiMaintenance);

      const updatedInfo: IMaintenanceDetail = {
        ...defaultMaintenanceData, // Start with default data
        serviceTypeName: aiMaintenance.service_type, // Set the service type name specifically
        serviceType: Object.entries(serviceTypeOptions).find(
          ([, value]) => value === aiMaintenance.service_type
        )?.[0]
          ? Number.parseInt(
              Object.entries(serviceTypeOptions).find(
                ([, value]) => value === aiMaintenance.service_type
              )?.[0]!,
              10
            )
          : defaultMaintenanceData.serviceType, // Fallback to default if not found
      };

      setMaintenanceInfo(updatedInfo);
    }

    console.log('maintenanceInfo = ', maintenanceInfo);
  };

  const handleFieldChange = (field: keyof IMaintenanceDetail, value: any) => {
    setMaintenanceInfo((prev) => ({
      ...prev,
      [field]: field === 'amount' ? Number(value) || 0 : value,
    }));
  };

  const loadUsers = async () => {
    const usersData = await fetchOrderUsers();
    setUsers(usersData);
  };

  const loadMaintenanceDetail = async () => {
    if (mode !== 'Edit' && !maintenanceData) {
      return;
    }

    try {
      // Fetch the maintenance detail using the provided ID
      const res = await fetchMaintenanceDetail(maintenanceData.id);
      console.log('fetchMaintenanceDetail res = ', res);

      // Update the maintenance data with the response
      const updatedMaintenanceData = {
        ...maintenanceData,
        odometer: res.vehicle?.odometer || 0,
        fuelType: res.vehicle?.fuelType || '',
        vin: res.vehicle?.vin || '',
        garage_name: res.vehicle?.garage?.name || '',
        garage_address: res.vehicle?.garage?.address || '',
        maintenanceRecordFiles: res.maintenanceRecordFiles || [],
        dropOffAssigneeId:
          res.maintenanceDeliveryReturn?.assigneeId ||
          maintenanceData?.dropOffAssigneeId,
        dropOffScheduleDate:
          res.maintenanceDeliveryReturn?.scheduleDate ||
          maintenanceData?.dropOffScheduleDate,
        pickupAssigneeId:
          res.maintenanceDelivery?.assigneeId ||
          maintenanceData?.pickupAssigneeId,
        pickupScheduleDate:
          res.maintenanceDelivery?.scheduleDate ||
          maintenanceData?.pickupScheduleDate,
      };
      // Sanitize the data
      const sanitizedData = sanitizeMaintenanceData(updatedMaintenanceData);
      console.log('sanitizedData = ', sanitizedData);

      // Update the state with the sanitized data
      setMaintenanceInfo((prev) => ({ ...prev, ...sanitizedData }));
    } catch (error) {
      console.error('Error fetching maintenance detail: ', error);
    }
  };

  const sanitizeMaintenanceData = (
    data: Partial<IMaintenanceDetail>
  ): IMaintenanceDetail => {
    return {
      ...data,
      amount: data.amount ? Number(data.amount) : 0,
      estimated_cost: data.estimated_cost ? Number(data.estimated_cost) : 0,
      practical_cost: data.practical_cost ? Number(data.practical_cost) : 0,
    } as IMaintenanceDetail;
  };

  const handleSave = async () => {
    console.log('maintenanceInfo =', maintenanceInfo);
    // Validate mandatory fields
    const mandatoryFields = [
      'startTime',
      'repairEta',
      'serviceType',
      'status',
      'practical_cost',
    ];
    const missingFields = mandatoryFields.filter(
      (field) => !maintenanceInfo[field as keyof IMaintenanceDetail]
    );

    if (missingFields.length > 0) {
      toast.error(
        `Please fill in all mandatory fields: ${missingFields.join(', ')}`
      );
      return;
    }

    try {
      if (mode == 'Edit') {
        await updateMaintenance(maintenanceInfo);
        toast.success('Bill updated successfully!');
        onClose();
      } else if (mode == 'Create') {
        console.log('maintenanceInfo =', maintenanceInfo);
        await createMaintenance(maintenanceInfo);
        toast.success('Maintenance created successfully!');
        onClose();
      } else if (mode == 'AiCreate' && aiMaintenance) {
        console.log('maintenanceInfo =', maintenanceInfo);
        const res = await createMaintenance(maintenanceInfo);
        toast.success('Maintenance created successfully!');
        console.log('createMaintenance res = ', res);
        await aiRecommendationAction(true, aiMaintenance, res.id);
        onClose();
      }

      // handleModalClose(); // Close the modal after saving
    } catch (error) {
      console.error(`Failed to ${mode} bill: `, error);
      toast.error(`Failed to ${mode} bill. Please try again.`);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // should not be call when not in edit mode
    const file = event.target.files?.[0];
    console.log('Selected file:', file);

    if (!file) {
      alert('No file selected.');
      return;
    }

    // Allow only images and PDFs
    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only images and PDF files are allowed.');
      return;
    }

    try {
      // Call the API function
      const res = await uploadMaintenanceDocument(maintenanceInfo.id, file);

      console.log('uploadMaintenanceDocument res = ', res);
      toast.success('File uploaded');
      loadModal();
    } catch (error: any) {
      alert(`Error uploading file: ${error.message}`);
      toast.error(`Error uploading file: ${error.message}`);
    }
  };

  return (
    <Modal open={open} onClose={onClose} disableAutoFocus={true}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isMobile ? '95%' : '80%',
          maxHeight: '90vh',
          bgcolor: 'white',
          borderRadius: '8px',
          boxShadow: 24,
          overflowY: 'auto',
          p: isMobile ? 2 : 4,
        }}
      >
        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: 3,
            color: '#333',
          }}
        >
          {mode} Maintenance
        </Typography>

        <Divider sx={{ marginBottom: '16px' }} />

        {/* Vehicle Information Section */}
        <Box>
          <Typography
            sx={{
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: 'bold',
              color: '#2C3E50',
              borderBottom: '4px solid #0070f3',
              display: 'inline-block',
              paddingBottom: '4px',
              marginBottom: isMobile ? '12px' : '16px',
            }}
          >
            Vehicle Information
          </Typography>
          <Grid2
            container
            spacing={isMobile ? 1 : 2}
            marginBottom={isMobile ? 2 : 3}
          >
            <Grid2 xs={12} md={3}>
              <Box
                component="img"
                src={
                  mode != 'Edit' && vehicle
                    ? vehicle.coverImage
                    : maintenanceInfo
                    ? maintenanceInfo.coverImage
                    : '/src/assets/car_models/car_model_1_big.png'
                }
                alt="Vehicle"
                sx={{
                  width: isMobile ? '100%' : undefined,
                  maxHeight: '150px',
                  borderRadius: '4px',
                  marginRight: 2,
                  marginBottom: isMobile ? 2 : 0,
                  border: '1px solid #ccc',
                  objectFit: 'contain',
                }}
              />
            </Grid2>
            <Grid2 xs={12} md={9}>
              <Grid2 container spacing={isMobile ? 1 : 2}>
                <Grid2 xs={6} md={3}>
                  <Typography
                    sx={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#4A4A4A',
                    }}
                  >
                    <strong>Vehicle Make/Model</strong>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#4A4A4A',
                    }}
                  >
                    {mode != 'Edit' && vehicle
                      ? `${vehicle?.make} ${vehicle?.model}`
                      : maintenanceInfo
                      ? `${maintenanceInfo?.make} ${maintenanceInfo?.model}`
                      : 'N/A'}
                  </Typography>
                </Grid2>
                <Grid2 xs={6} md={3}>
                  <Typography
                    sx={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#4A4A4A',
                    }}
                  >
                    <strong>Plate Number</strong>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#4A4A4A',
                    }}
                  >
                    {mode != 'Edit' && vehicle
                      ? `${vehicle?.plateNumber}`
                      : maintenanceInfo
                      ? `${maintenanceInfo?.plateNumber}`
                      : 'N/A'}
                  </Typography>
                </Grid2>
                <Grid2 xs={6} md={3}>
                  <Typography
                    sx={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#4A4A4A',
                    }}
                  >
                    <strong>Odometer</strong>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#4A4A4A',
                    }}
                  >
                    {mode != 'Edit' && vehicle
                      ? `${vehicle?.odometer} km`
                      : maintenanceInfo
                      ? `${maintenanceInfo?.odometer} km`
                      : 'N/A'}
                  </Typography>
                </Grid2>
                <Grid2 xs={6} md={3}>
                  <Typography
                    sx={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#4A4A4A',
                    }}
                  >
                    <strong>Vehicle Type</strong>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#4A4A4A',
                    }}
                  >
                    {mode != 'Edit' && vehicle
                      ? `${vehicle?.fuelType}`
                      : maintenanceInfo
                      ? `${maintenanceInfo?.fuelType}`
                      : 'N/A'}
                  </Typography>
                </Grid2>
                <Grid2 xs={6} md={3}>
                  <Typography
                    sx={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#4A4A4A',
                    }}
                  >
                    <strong>VIN</strong>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#4A4A4A',
                    }}
                  >
                    {mode != 'Edit' && vehicle
                      ? `${vehicle?.vin}`
                      : maintenanceInfo
                      ? `${maintenanceInfo?.vin}`
                      : 'N/A'}
                  </Typography>
                </Grid2>
                <Grid2 xs={6} md={3}>
                  <Typography
                    sx={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#4A4A4A',
                    }}
                  >
                    <strong>Garage</strong>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#4A4A4A',
                    }}
                  >
                    {mode != 'Edit' && vehicle
                      ? `${vehicle?.garage?.name}`
                      : maintenanceInfo
                      ? `${maintenanceInfo?.garage_name}`
                      : 'N/A'}
                  </Typography>
                </Grid2>
                <Grid2 xs={12} md={3}>
                  <Typography
                    sx={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#4A4A4A',
                    }}
                  >
                    <strong>Parking Location</strong>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#4A4A4A',
                    }}
                  >
                    {mode != 'Edit' && vehicle
                      ? `${vehicle?.garage?.address}`
                      : maintenanceInfo
                      ? `${maintenanceInfo?.garage_address}`
                      : 'N/A'}
                  </Typography>
                </Grid2>
              </Grid2>
            </Grid2>
          </Grid2>
        </Box>

        {/* Maintenance Information Section */}
        <Typography
          sx={{
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: 'bold',
            color: '#2C3E50',
            borderBottom: '4px solid #0070f3',
            display: 'inline-block',
            paddingBottom: '4px',
            marginBottom: isMobile ? '12px' : '16px',
          }}
        >
          Maintenance Information
        </Typography>
        <Grid2
          container
          spacing={isMobile ? 1 : 2}
          marginBottom={isMobile ? 2 : 3}
        >
          <Grid2 xs={12} md={4}>
            <TextField
              fullWidth
              label="Start Date"
              type="datetime-local"
              required
              value={
                maintenanceInfo?.startTime
                  ? (() => {
                      const date = new Date(maintenanceInfo.startTime);
                      // Ensure the date is formatted to YYYY-MM-DDTHH:mm (local timezone)
                      const localDate = new Date(
                        date.getTime() - date.getTimezoneOffset() * 60000
                      );
                      return localDate.toISOString().slice(0, 16); // Formats to YYYY-MM-DDTHH:mm
                    })()
                  : ''
              }
              onChange={(e) => handleFieldChange('startTime', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size={isMobile ? 'small' : 'medium'}
              margin={isMobile ? 'dense' : 'normal'}
            />
          </Grid2>
          <Grid2 xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Service"
              required
              InputLabelProps={{ shrink: true }}
              value={maintenanceInfo?.serviceType || ''}
              onChange={(e) =>
                handleFieldChange('serviceType', Number(e.target.value))
              }
              size={isMobile ? 'small' : 'medium'}
              margin={isMobile ? 'dense' : 'normal'}
            >
              {Object.entries(serviceTypeOptions).map(
                ([serviceValue, serviceLabel]) => (
                  <MenuItem key={serviceValue} value={serviceValue}>
                    {serviceLabel}
                  </MenuItem>
                )
              )}
            </TextField>
          </Grid2>
          <Grid2 xs={12} md={4}>
            <TextField
              fullWidth
              label="Paid Amount"
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              value={maintenanceInfo.amount || 0}
              onChange={(e) =>
                handleFieldChange(
                  'amount',
                  Number.parseFloat(e.target.value) || 0
                )
              }
              size={isMobile ? 'small' : 'medium'}
              margin={isMobile ? 'dense' : 'normal'}
            />
          </Grid2>
          <Grid2 xs={12} md={4}>
            <TextField
              fullWidth
              label="Expect Pick Up Date"
              type="datetime-local"
              required
              value={
                maintenanceInfo?.repairEta
                  ? (() => {
                      const date = new Date(maintenanceInfo.repairEta);
                      // Ensure the date is formatted to YYYY-MM-DDTHH:mm (local timezone)
                      const localDate = new Date(
                        date.getTime() - date.getTimezoneOffset() * 60000
                      );
                      return localDate.toISOString().slice(0, 16); // Formats to YYYY-MM-DDTHH:mm
                    })()
                  : ''
              }
              onChange={(e) => handleFieldChange('repairEta', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size={isMobile ? 'small' : 'medium'}
              margin={isMobile ? 'dense' : 'normal'}
            />
          </Grid2>
          <Grid2 xs={12} md={4}>
            <TextField
              fullWidth
              label="Service Detail"
              value={maintenanceInfo?.service_detail || ''}
              onChange={(e) =>
                handleFieldChange('service_detail', e.target.value)
              }
              size={isMobile ? 'small' : 'medium'}
              margin={isMobile ? 'dense' : 'normal'}
            />
          </Grid2>
          <Grid2 xs={12} md={4}>
            <TextField
              required
              fullWidth
              select
              label="Status"
              InputLabelProps={{ shrink: true }}
              value={maintenanceInfo?.status || ''}
              onChange={(e) =>
                handleFieldChange('status', Number(e.target.value))
              }
              size={isMobile ? 'small' : 'medium'}
              margin={isMobile ? 'dense' : 'normal'}
            >
              {Object.entries(statusOptions).map(
                ([statusValue, statusLabel]) => (
                  <MenuItem key={statusValue} value={statusValue}>
                    {statusLabel}
                  </MenuItem>
                )
              )}
            </TextField>
          </Grid2>
          <Grid2 xs={12} md={4}>
            <TextField
              fullWidth
              label="Actual Pick Up Date"
              type="datetime-local"
              value={
                maintenanceInfo?.endTime
                  ? (() => {
                      const date = new Date(maintenanceInfo.endTime);
                      // Ensure the date is formatted to YYYY-MM-DDTHH:mm (local timezone)
                      const localDate = new Date(
                        date.getTime() - date.getTimezoneOffset() * 60000
                      );
                      return localDate.toISOString().slice(0, 16); // Formats to YYYY-MM-DDTHH:mm
                    })()
                  : ''
              }
              onChange={(e) => handleFieldChange('endTime', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size={isMobile ? 'small' : 'medium'}
              margin={isMobile ? 'dense' : 'normal'}
            />
          </Grid2>
          <Grid2 xs={12} md={4}>
            <TextField
              fullWidth
              label="Estimated Cost"
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              value={maintenanceInfo?.estimated_cost || 0}
              onChange={(e) =>
                handleFieldChange(
                  'estimated_cost',
                  Number.parseFloat(e.target.value) || 0
                )
              }
              size={isMobile ? 'small' : 'medium'}
              margin={isMobile ? 'dense' : 'normal'}
            />
          </Grid2>
          <Grid2 xs={12} md={4}>
            <TextField
              fullWidth
              label="Paid Date"
              type="datetime-local"
              value={
                maintenanceInfo?.paid_date
                  ? (() => {
                      const date = new Date(maintenanceInfo.paid_date);
                      // Ensure the date is formatted to YYYY-MM-DDTHH:mm (local timezone)
                      const localDate = new Date(
                        date.getTime() - date.getTimezoneOffset() * 60000
                      );
                      return localDate.toISOString().slice(0, 16); // Formats to YYYY-MM-DDTHH:mm
                    })()
                  : ''
              }
              onChange={(e) => handleFieldChange('paid_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size={isMobile ? 'small' : 'medium'}
              margin={isMobile ? 'dense' : 'normal'}
            />
          </Grid2>
          <Grid2 xs={12} md={4}>
            <TextField
              fullWidth
              label="Body Shop Location"
              value={maintenanceInfo?.work_shop || ''}
              onChange={(e) => handleFieldChange('work_shop', e.target.value)}
              size={isMobile ? 'small' : 'medium'}
              margin={isMobile ? 'dense' : 'normal'}
            />
          </Grid2>
          <Grid2 xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="Practical Cost"
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              value={maintenanceInfo.practical_cost || 0}
              onChange={(e) =>
                handleFieldChange('practical_cost', Number(e.target.value))
              }
              size={isMobile ? 'small' : 'medium'}
              margin={isMobile ? 'dense' : 'normal'}
            />
          </Grid2>
          <Grid2 xs={12} md={4}>
            <TextField
              fullWidth
              label="Paid Resource"
              value={maintenanceInfo?.paid_resource || ''}
              onChange={(e) =>
                handleFieldChange('paid_resource', e.target.value)
              }
              size={isMobile ? 'small' : 'medium'}
              margin={isMobile ? 'dense' : 'normal'}
            />
          </Grid2>
          <Grid2 xs={12}>
            <TextField
              fullWidth
              label="Comment"
              multiline
              rows={3}
              value={maintenanceInfo?.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              size={isMobile ? 'small' : 'medium'}
              margin={isMobile ? 'dense' : 'normal'}
            />
          </Grid2>
        </Grid2>

        {/* Assignment Section */}
        <Typography
          sx={{
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: 'bold',
            color: '#2C3E50',
            borderBottom: '4px solid #0070f3',
            display: 'inline-block',
            paddingBottom: '4px',
            marginBottom: isMobile ? '12px' : '16px',
          }}
        >
          Assignment
        </Typography>

        <Grid
          container
          spacing={isMobile ? 1 : 2}
          marginBottom={isMobile ? 2 : 3}
        >
          {/* Drop Off Agent */}
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Drop Off Agent"
              required
              value={maintenanceInfo?.dropOffAssigneeId || ''}
              onChange={(e) =>
                handleFieldChange('dropOffAssigneeId', Number(e.target.value))
              }
              InputLabelProps={{ shrink: true }}
              size={isMobile ? 'small' : 'medium'}
              margin={isMobile ? 'dense' : 'normal'}
            >
              {users.map((agent) => (
                <MenuItem key={agent.id} value={agent.id}>
                  {agent.firstName} {agent.lastName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Pick Up Agent */}
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              required
              label="Pick Up Agent"
              value={maintenanceInfo?.pickupAssigneeId || ''}
              onChange={(e) =>
                handleFieldChange('pickupAssigneeId', Number(e.target.value))
              }
              InputLabelProps={{ shrink: true }}
              size={isMobile ? 'small' : 'medium'}
              margin={isMobile ? 'dense' : 'normal'}
            >
              {users.map((agent) => (
                <MenuItem key={agent.id} value={agent.id}>
                  {agent.firstName} {agent.lastName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Drop Off DateTime */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Drop Off DateTime"
              type="datetime-local"
              required
              value={
                maintenanceInfo?.dropOffScheduleDate
                  ? (() => {
                      const date = new Date(
                        maintenanceInfo.dropOffScheduleDate
                      );
                      // Ensure the date is formatted to YYYY-MM-DDTHH:mm (local timezone)
                      const localDate = new Date(
                        date.getTime() - date.getTimezoneOffset() * 60000
                      );
                      return localDate.toISOString().slice(0, 16); // Formats to YYYY-MM-DDTHH:mm
                    })()
                  : ''
              }
              onChange={(e) =>
                handleFieldChange('dropOffScheduleDate', e.target.value)
              }
              InputLabelProps={{ shrink: true }}
              size={isMobile ? 'small' : 'medium'}
              margin={isMobile ? 'dense' : 'normal'}
            />
          </Grid>

          {/* Pick Up DateTime */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Pick Up DateTime"
              type="datetime-local"
              required
              value={
                maintenanceInfo?.pickupScheduleDate
                  ? (() => {
                      const date = new Date(maintenanceInfo.pickupScheduleDate);
                      // Ensure the date is formatted to YYYY-MM-DDTHH:mm (local timezone)
                      const localDate = new Date(
                        date.getTime() - date.getTimezoneOffset() * 60000
                      );
                      return localDate.toISOString().slice(0, 16); // Formats to YYYY-MM-DDTHH:mm
                    })()
                  : ''
              }
              onChange={(e) =>
                handleFieldChange('pickupScheduleDate', e.target.value)
              }
              InputLabelProps={{ shrink: true }}
              size={isMobile ? 'small' : 'medium'}
              margin={isMobile ? 'dense' : 'normal'}
            />
          </Grid>
        </Grid>

        {/* Upload Document Section */}
        {mode === 'Edit' && (
          <Box>
            <Typography
              sx={{
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 'bold',
                color: '#2C3E50',
                borderBottom: '4px solid #0070f3',
                display: 'inline-block',
                paddingBottom: '4px',
                marginBottom: isMobile ? '12px' : '16px',
              }}
            >
              Upload Document
            </Typography>
            <Box marginBottom={2}>
              <Grid container spacing={2}>
                {maintenanceInfo.maintenanceRecordFiles?.map((file, index) => (
                  <Grid item xs={12} key={index}>
                    <Link
                      target="_blank"
                      href={file.fileUrl}
                      sx={{ marginRight: 2, color: '#0070f3' }}
                    >
                      {file.fileName}
                    </Link>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{ textTransform: 'none' }}
                  >
                    + Upload Documents
                    <Input
                      type="file"
                      sx={{ display: 'none' }}
                      onChange={handleFileUpload}
                      inputProps={{
                        accept: 'image/png, image/jpeg, application/pdf',
                      }}
                    />
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
        {/* Footer */}
        <Divider sx={{ margin: '16px 0' }} />
        <Box textAlign="right">
          <Button
            variant="contained"
            sx={{
              textTransform: 'none',
              marginRight: 2,
              fontSize: isMobile ? '13px' : '14px',
              padding: isMobile ? '6px 12px' : '8px 16px',
            }}
            onClick={handleSave}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontSize: isMobile ? '13px' : '14px',
              padding: isMobile ? '6px 12px' : '8px 16px',
            }}
            onClick={onClose}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
