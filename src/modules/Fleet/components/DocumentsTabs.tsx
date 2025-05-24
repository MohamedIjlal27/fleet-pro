import type React from 'react';
import { type ChangeEvent, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Button,
  Card,
  IconButton,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import DescriptionIcon from '@mui/icons-material/Description';
// import axiosInstance from '../../../utils/axiosConfig'; // Commented out for demo mode

const editButtonStyles = {
  height: '30px',
  backgroundColor: '#1E293B',
  color: 'white',
  '&:hover': {
    backgroundColor: '#1C2533',
  },
};

interface DocumentsTabPros {
  vehicle: any;
}

interface DocumentItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: string;
  createdAt: string;
  documentType?: string;
}

interface DocumentsData {
  document?: DocumentItem[];
  insurance?: DocumentItem[];
}

export const DocumentsTab: React.FC<DocumentsTabPros> = ({ vehicle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [documents, setDocuments] = useState<DocumentsData>({
    document: [],
    insurance: [],
  });
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(
    null
  );

  useEffect(() => {
    fetchDocument();
  }, []);

  const fetchDocument = async () => {
    try {
      console.log(`[DEMO MODE] fetchDocument for vehicle ${vehicle.id}`);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Demo documents data
      const demoDocuments = {
        document: [
          {
            id: '1',
            fileName: 'vehicle_registration.pdf',
            fileUrl: '#',
            fileSize: '2.5 MB',
            createdAt: new Date().toISOString(),
            documentType: 'registration'
          }
        ],
        insurance: [
          {
            id: '2',
            fileName: 'insurance_policy.pdf',
            fileUrl: '#',
            fileSize: '1.8 MB',
            createdAt: new Date().toISOString(),
            documentType: 'insurance'
          }
        ]
      };
      setDocuments(demoDocuments);
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  };

  const handleDocumentUpload = async (file: File) => {
    console.log(`[DEMO MODE] handleDocumentUpload for file: ${file.name}`);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('[DEMO MODE] Document upload simulated');
      toast.success('Document uploaded successfully (Demo Mode)');
      fetchDocument(); // Refresh documents after upload
      setIsEditMode(false);
    } catch (error) {
      console.error('Error uploading Document:', error);
      toast.error('Error uploading Document');
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    document: DocumentItem
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocument(null);
  };

  const handleDownload = () => {
    if (selectedDocument) {
      window.open(selectedDocument.fileUrl, '_blank');
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (selectedDocument) {
      try {
        // Implement delete functionality here
        // const response = await axiosInstance.delete(`/api/vehicle/documents/${selectedDocument.id}`);
        // toast.success('Document deleted successfully');
        // fetchDocument();
        console.error('Delete functionality not implemented');
        toast.error('Delete functionality not implemented');
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Error deleting document');
      }
    }
    handleMenuClose();
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      return <PictureAsPdfIcon sx={{ color: '#F40F02' }} />;
    } else if (
      ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')
    ) {
      return <InsertPhotoIcon sx={{ color: '#4CAF50' }} />;
    } else if (['zip', 'rar', '7z'].includes(extension || '')) {
      return <InsertDriveFileOutlinedIcon sx={{ color: '#FFC107' }} />;
    } else {
      return <DescriptionIcon sx={{ color: '#2196F3' }} />;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();

    // If today, show "modified X mins/hours ago"
    if (date.toDateString() === now.toDateString()) {
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.round(diffMs / 60000);

      if (diffMins < 60) {
        return `modified ${diffMins} mins ago`;
      } else {
        const diffHours = Math.floor(diffMins / 60);
        return `modified ${diffHours} hours ago`;
      }
    }
    // Otherwise show date in MM/DD/YYYY format
    else {
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
    }
  };

  // Combine all documents for the mobile view
  const allDocuments = [
    ...(documents.document || []),
    ...(documents.insurance || []),
  ];

  return (
    <>
      {isMobile ? (
        // Mobile view
        <Box sx={{ width: '100%' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              mb: 2,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 'medium',
                minHeight: '48px',
              },
              '& .Mui-selected': {
                color: '#1E293B !important',
              },
              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}
          >
            <Tab
              icon={<InsertDriveFileOutlinedIcon />}
              label="Document"
              sx={{
                borderRadius: '20px',
                mx: 0.5,
                backgroundColor: tabValue === 0 ? '#dddddd' : 'transparent',
              }}
            />
            <Tab
              icon={<ImageOutlinedIcon />}
              label="Image"
              sx={{
                borderRadius: '20px',
                mx: 0.5,
                backgroundColor: tabValue === 1 ? '#dddddd' : 'transparent',
                boxShadow:
                  tabValue === 1 ? '0px 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
              }}
            />
          </Tabs>

          {tabValue === 0 && (
            <Box sx={{ px: 2 }}>
              {allDocuments.filter((doc) => {
                const extension = doc.fileName.split('.').pop()?.toLowerCase();
                return ['pdf', 'doc', 'docx', 'txt'].includes(extension || '');
              }).length > 0 ? (
                allDocuments
                  .filter((doc) => {
                    const extension = doc.fileName
                      .split('.')
                      .pop()
                      ?.toLowerCase();
                    return ['pdf', 'doc', 'docx', 'txt'].includes(
                      extension || ''
                    );
                  })
                  .map((doc, index) => (
                    <Card
                      key={doc.id || index}
                      sx={{
                        mb: 1,
                        boxShadow: 'none',
                        border: '1px solid #f0f0f0',
                        borderRadius: '8px',
                      }}
                    >
                      <ListItem
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={(e) => handleMenuClick(e, doc)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {getFileIcon(doc.fileName)}
                        </ListItemIcon>
                        <ListItemText
                          primary={doc.fileName}
                          secondary={`${doc.fileSize || '2.3 mb'}, ${formatDate(
                            doc.createdAt
                          )}`}
                          primaryTypographyProps={{
                            noWrap: true,
                            fontSize: '14px',
                          }}
                          secondaryTypographyProps={{
                            fontSize: '12px',
                            color: 'text.secondary',
                          }}
                        />
                      </ListItem>
                    </Card>
                  ))
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                  No documents available
                </Typography>
              )}
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ px: 2 }}>
              {allDocuments.filter((doc) => {
                const extension = doc.fileName.split('.').pop()?.toLowerCase();
                return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
                  extension || ''
                );
              }).length > 0 ? (
                allDocuments
                  .filter((doc) => {
                    const extension = doc.fileName
                      .split('.')
                      .pop()
                      ?.toLowerCase();
                    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
                      extension || ''
                    );
                  })
                  .map((doc, index) => (
                    <Card
                      key={doc.id || index}
                      sx={{
                        mb: 1,
                        boxShadow: 'none',
                        border: '1px solid #f0f0f0',
                        borderRadius: '8px',
                      }}
                    >
                      <ListItem
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={(e) => handleMenuClick(e, doc)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {getFileIcon(doc.fileName)}
                        </ListItemIcon>
                        <ListItemText
                          primary={doc.fileName}
                          secondary={`${doc.fileSize || '2.3 mb'}, ${formatDate(
                            doc.createdAt
                          )}`}
                          primaryTypographyProps={{
                            noWrap: true,
                            fontSize: '14px',
                          }}
                          secondaryTypographyProps={{
                            fontSize: '12px',
                            color: 'text.secondary',
                          }}
                        />
                      </ListItem>
                    </Card>
                  ))
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                  No images available
                </Typography>
              )}
            </Box>
          )}

          {/* Floating upload button for mobile */}
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 1000,
            }}
          >
            <Button
              component="label"
              variant="contained"
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: '#1E293B',
                '&:hover': {
                  backgroundColor: '#1C2533',
                },
              }}
            >
              <UploadIcon />
              <input
                type="file"
                hidden
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const file = event.target.files?.[0];
                  if (file) handleDocumentUpload(file);
                }}
              />
            </Button>
          </Box>
        </Box>
      ) : (
        // Desktop view (unchanged)
        <>
          <Box display="flex" justifyContent="flex-end" sx={{ px: 2 }} gap={1}>
            <Button
              component="label"
              sx={editButtonStyles}
              startIcon={<UploadIcon />}
            >
              Upload
              <input
                type="file"
                hidden
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const file = event.target.files?.[0];
                  if (file) handleDocumentUpload(file);
                }}
              />
            </Button>
          </Box>

          <div className="space-y-8 px-4 py-6">
            {/* Render Document Section */}
            {documents.document?.length! > 0 && (
              <section className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Documents
                </h2>
                <ul className="space-y-4">
                  {documents.document?.map((doc) => (
                    <li key={doc.id} className="border-b pb-4">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {doc.fileName}
                      </a>
                      <p className="text-sm text-gray-500">
                        <span className="font-bold">Uploaded On:</span>{' '}
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Render Insurance Section */}
            {documents.insurance?.length! > 0 && (
              <section className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Insurance
                </h2>
                <ul className="space-y-4">
                  {documents.insurance?.map((item, index) => (
                    <li key={index} className="border-b pb-4">
                      {/* Render insurance items here (if any) */}
                      <p className="text-lg font-medium text-gray-700">
                        No insurance data available
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Handle empty insurance */}
            {documents.insurance?.length === 0 && (
              <section className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Insurance
                </h2>
                <p className="text-lg text-gray-700">
                  No insurance data available
                </p>
              </section>
            )}
          </div>
        </>
      )}

      {/* Document options menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDownload}>Download</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </>
  );
};
