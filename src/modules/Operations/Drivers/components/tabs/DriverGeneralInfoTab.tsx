import React, { useState, useEffect } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import defaultImg from '/src/assets/admin/default-avatar-150x150.jpg';
import { SectionHeading } from '../../utils/SectionHeading';
import { DocumentUploadModal } from './DocumentUploadModal';
// Comment out unused import for demo mode
// import axiosInstance from '../../../../../utils/axiosConfig';
import { toast } from 'react-toastify';
import { IGeneralTabProps, IDocument } from '../../interfaces/driver.interface';
import { formatDate } from '../../utils/FormatDate';
import DocumentsUploadModal from './DocumentsUploadModal'

export const DriverGeneralInfo: React.FC<IGeneralTabProps> = ({
  formState,
  handleSelectChange,
  handleSubmit,
  id,
}) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editableFormState, setEditableFormState] = useState(formState);

  const [isUploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      // Comment out API call for demo mode
      // const response = await axiosInstance.get(`/api/drivers/${id}/documents`);
      // setDocuments(response.data);
      
      console.log('fetchDocuments (demo mode)', { id });
      
      // Demo documents data
      const demoDocuments: IDocument[] = [
        {
          id: 1,
          documentType: "Driver License",
          fileName: "john_smith_license.pdf",
          fileUrl: "/demo/documents/john_smith_license.pdf",
          uploadType: "driver-doc",
          createdAt: "2023-06-15T10:30:00Z",
          metadata: [
            {
              url: "/demo/documents/john_smith_license.pdf",
              fileType: "application/pdf",
              fileName: "john_smith_license.pdf"
            }
          ]
        },
        {
          id: 2,
          documentType: "Insurance",
          fileName: "john_smith_insurance.pdf",
          fileUrl: "/demo/documents/john_smith_insurance.pdf",
          uploadType: "driver-doc",
          createdAt: "2023-06-20T10:30:00Z",
          metadata: [
            {
              url: "/demo/documents/john_smith_insurance.pdf",
              fileType: "application/pdf",
              fileName: "john_smith_insurance.pdf"
            }
          ]
        },
        {
          id: 3,
          documentType: "Medical Certificate",
          fileName: "john_smith_medical.pdf",
          fileUrl: "/demo/documents/john_smith_medical.pdf",
          uploadType: "driver-doc",
          createdAt: "2023-07-01T10:30:00Z",
          metadata: [
            {
              url: "/demo/documents/john_smith_medical.pdf",
              fileType: "application/pdf",
              fileName: "john_smith_medical.pdf"
            }
          ]
        }
      ];
      
      setDocuments(demoDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      handleSubmit();
    }
    setIsEditing(!isEditing);
  };

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);


  const handleUploadModalOpen = () => setUploadModalOpen(true);
  const handleUploadModalClose = () => {
    fetchDocuments();
    setUploadModalOpen(false);
  }

  const handleFileUpload = async (file: File, selectedDocumentType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', selectedDocumentType);
    formData.append('uploadType', 'driver-doc');
    formData.append('driverId', id.toString());
    const driverName = `${editableFormState.firstName}_${editableFormState.lastName}`;

    formData.append(
      'fileName',
      `${driverName}_driverId_${id}_${selectedDocumentType}`
    );

    try {
      // Comment out API call for demo mode
      // const response = await axiosInstance.post('/api/file-upload', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });

      console.log('handleFileUpload (demo mode)', { 
        fileName: file.name, 
        documentType: selectedDocumentType,
        driverId: id 
      });

      // Mock successful upload response
      const mockResponse = {
        status: 200,
        data: { message: 'File uploaded successfully' }
      };

      if (mockResponse.status === 200 || mockResponse.status === 201) {
        toast.success('File uploaded successfully (demo mode)');
        setModalOpen(false);
        fetchDocuments();
      } else {
        console.error('Upload failed:', mockResponse.data.message);
        setModalOpen(false);
        toast.error('File upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error uploading file');
    }
  };

  const handleDocumentTypeChange = (
    e: React.ChangeEvent<{ value: unknown }>
  ) => {
    setSelectedDocumentType(e.target.value as string);
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableFormState({
      ...editableFormState,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveChanges = async () => {
    try {
      // Comment out API call for demo mode
      // const response = await axiosInstance.put(
      //   `/api/drivers/${id}`,
      //   editableFormState
      // );
      
      console.log('handleSaveChanges (demo mode)', { id, editableFormState });
      
      // Mock successful save response
      const mockResponse = { status: 200 };
      
      if (mockResponse.status === 200 || mockResponse.status === 201) {
        toast.success('Changes saved successfully (demo mode)');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Error saving changes');
      console.error('Error saving changes:', error);
    }
  };

  return (
    <Box p={2}>
      <Grid container spacing={4}>
        {/* First Half: Driver Details Form */}
        <Grid item xs={12} sm={12} md={6}>
          <Box
            component="form"
            noValidate
            autoComplete="off"
            p={3}
            className="bg-slate-50 rounded-lg shadow-sm"
          >
            {/* Top row */}
            <div className="flex justify-between items-center mb-4">
              <Avatar
                src={editableFormState.user.picture || defaultImg}
                alt={`driver profile photo`}
                sx={{ width: 120, height: 120, marginRight: 2 }}
              />
              <TextField
                label="Driver ID"
                name="driverId"
                value={id}
                margin="normal"
                disabled
                className="w-1/3"
              />
              <FormControl margin="normal" className="w-1/3">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={editableFormState.status}
                  onChange={handleSelectChange}
                  label="Status"
                  disabled={!isEditing}
                >
                  <MenuItem value="ON">ON</MenuItem>
                  <MenuItem value="OFF">OFF</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* Personal information */}
            <SectionHeading title="Personal Information" />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={editableFormState.firstName}
                  onChange={handleFieldChange}
                  margin="normal"
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={editableFormState.lastName}
                  onChange={handleFieldChange}
                  margin="normal"
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={editableFormState.email}
                  onChange={handleFieldChange}
                  margin="normal"
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={editableFormState.phoneNumber}
                  onChange={handleFieldChange}
                  margin="normal"
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} className="mb-4">
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Home Address"
                  name="homeAddress"
                  value={editableFormState.homeAddress}
                  onChange={handleFieldChange}
                  margin="normal"
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Insurance Number"
                  name="insuranceNumber"
                  value={editableFormState.insuranceNumber}
                  onChange={handleFieldChange}
                  margin="normal"
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>

            {/* License Details */}
            <SectionHeading title="License Details" />
            <Grid container spacing={2} className="mb-4">
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Driver License Number"
                  name="driverLicenseNumber"
                  value={editableFormState.driverLicenseNumber}
                  onChange={handleFieldChange}
                  margin="normal"
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="License Expiration"
                  name="licenseExpirationDate"
                  value={editableFormState.licenseExpirationDate}
                  onChange={handleFieldChange}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>License Type</InputLabel>
                  <Select
                    name="licenseType"
                    value={editableFormState.licenseType}
                    onChange={handleSelectChange}
                    label="License Type"
                    disabled={!isEditing}
                  >
                    <MenuItem value="Machinery">Machinery</MenuItem>
                    <MenuItem value="Bus">Bus</MenuItem>
                    <MenuItem value="Heavy_vehicle">Heavy Vehicle</MenuItem>
                    <MenuItem value="Light_vehicle">Light Vehicle</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Emergency Details */}
            <SectionHeading title="Emergency Details" />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Name"
                  name="emergencyName"
                  value={editableFormState.emergencyName}
                  onChange={handleFieldChange}
                  margin="normal"
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Number"
                  name="emergencyNumber"
                  value={editableFormState.emergencyNumber}
                  onChange={handleFieldChange}
                  margin="normal"
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Blood Group</InputLabel>
                  <Select
                    name="bloodGroup"
                    value={editableFormState.bloodGroup}
                    onChange={handleSelectChange}
                    label="Blood Group"
                    disabled={!isEditing}
                  >
                    <MenuItem value="A_plus">A+</MenuItem>
                    <MenuItem value="A_minus">A-</MenuItem>
                    <MenuItem value="B_plus">B+</MenuItem>
                    <MenuItem value="B_minus">B-</MenuItem>
                    <MenuItem value="AB_plus">AB+</MenuItem>
                    <MenuItem value="AB_minus">AB-</MenuItem>
                    <MenuItem value="O_plus">O+</MenuItem>
                    <MenuItem value="O_minus">O-</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={isEditing ? handleSaveChanges : handleEditToggle}
                sx={{
                  mt: 3,
                  padding: '10px 6px',
                  fontWeight: 'bold',
                  backgroundColor: '#1E293B',
                  '&:hover': { backgroundColor: '#111827' },
                }}
              >
                {isEditing ? 'Save Changes' : 'Edit'}
              </Button>
            </Box>
          </Box>
        </Grid>
        {/* Second Half: Documents Section */}
        <Grid item xs={12} md={6}>
          <Box
            p={3}
            className="bg-slate-50 rounded-lg shadow-md"
            sx={{
              borderRadius: '8px',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Documents
            </Typography>

            {/* Placeholder documents */}
            <Box mt={4}>
              <Typography variant="subtitle1" gutterBottom>
                Uploaded Documents
              </Typography>
              <Box
                p={2}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {documents.map((doc) => (
                  <Box
                    key={doc.id}
                    sx={{
                      backgroundColor: 'white',
                      p: 2,
                      borderRadius: 2,
                      boxShadow: 1,
                      minWidth: '100%',
                      display: 'flex',
                      flexDirection: 'column', // Stack items vertically
                      gap: 1,
                    }}
                  >
                    {/* Top Row: Document Type & Uploaded Date */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      {/* Document Type (Leftmost) */}
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {doc.documentType}
                      </Typography>

                      {/* Uploaded Date (Rightmost) */}
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                          fontStyle: 'italic',
                          textAlign: 'right',
                        }}
                      >
                        Uploaded: {formatDate(doc.createdAt)}
                      </Typography>
                    </Box>

                    {/* Bottom Row: View Buttons */}
                    {doc.metadata && doc.metadata.length > 0 && (
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1,
                          backgroundColor: '#F3F4F6',
                          p: 2,
                          borderRadius: 1,
                        }}
                      >
                        {doc.metadata.map((item, index) => (
                          <Button
                            key={index}
                            variant="contained"
                            size="small"
                            sx={{
                              backgroundColor: '#1E293B',
                              '&:hover': { backgroundColor: '#111827' },
                              minWidth: 80,
                            }}
                            onClick={() => window.open(item.url, '_blank')}
                          >
                            View {index + 1}
                          </Button>
                        ))}
                      </Box>
                    )}

                  </Box>
                ))}
              </Box>
            </Box>



            <Box sx={{ textAlign: 'center' }}>
              {/* <Button
                variant="contained"
                onClick={handleModalOpen}
                sx={{
                  mt: 3,
                  padding: '10px 6px',
                  fontWeight: 'bold',
                  backgroundColor: '#1E293B',
                  '&:hover': {
                    backgroundColor: '#111827',
                  },
                }}
              >
                Upload Documents
                <input type="file" hidden />
              </Button> */}
              <Button
                variant="contained"
                onClick={handleUploadModalOpen}
                sx={{
                  mt: 3,
                  padding: '10px 6px',
                  fontWeight: 'bold',
                  backgroundColor: '#1E293B',
                  '&:hover': {
                    backgroundColor: '#111827',
                  },
                }}
              >
                Upload Driver Documents
                <input type="file" hidden />
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Modal for Upload */}
      <DocumentUploadModal
        open={isModalOpen}
        handleClose={handleModalClose}
        handleFileUpload={(file: File) =>
          handleFileUpload(file, selectedDocumentType)
        }
        handleSelectChange={handleDocumentTypeChange}
        selectedDocumentType={selectedDocumentType}
        formState={formState}
      />

      <DocumentsUploadModal
        open={isUploadModalOpen}
        handleClose={handleUploadModalClose}
        driverId={id}
      />
    </Box>
  );
};
