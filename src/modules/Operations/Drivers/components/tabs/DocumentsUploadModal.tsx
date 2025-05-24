import { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { filesUpload } from '../../apis/apis';

interface DocumentsUploadModalProps {
  open: boolean;
  handleClose: () => void;
  driverId: string; 
}

const DocumentsUploadModal: React.FC<DocumentsUploadModalProps> = ({ open, handleClose, driverId }) => {
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; base64: string }[]>([]);


  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSelectedDocumentType('');
      setUploadedFiles([]);
    }
  }, [open]);

  // Convert file to Base64
  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        const result = fileReader.result as string;
        resolve(result.replace(/^data:image\/\w+;base64,/, '')); // ✅ Remove prefix
      };

      fileReader.onerror = (error) => reject(error);
    });
  };

  // Handle file selection
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const imageFiles = filesArray.filter((file) => file.type.startsWith('image/')); // Accept only images

      try {
        const newFiles = await Promise.all(
            imageFiles.map(async (file) => ({
              name: file.name,
              base64: await toBase64(file),
            }))
          );
          
          setUploadedFiles((prevFiles) => [...prevFiles, ...newFiles]);
          
      } catch (error) {
        toast.error('Error converting file to Base64');
        console.error('Base64 conversion error:', error);
      }
    }
  };

  // Remove selected file by index
  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };
  
  // Handle upload
  const handleUploadClick = async () => {
    try {
        await filesUpload(parseInt(driverId, 10), selectedDocumentType, 'driver-doc', uploadedFiles.map(file => file.base64));
      toast.success('Files uploaded successfully');
      handleClose();
    } catch (error) {
      toast.error('Failed to upload files');
      console.error('Upload error:', error);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} disableAutoFocus={true}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'white',
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
        }}
      >
        {/* Modal Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Upload Document</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Document Type Selection */}
        <FormControl margin="normal" fullWidth>
          <InputLabel>Document Type</InputLabel>
          <Select value={selectedDocumentType} onChange={(e) => setSelectedDocumentType(e.target.value)} label="Document Type">
            <MenuItem value="License-Scan">License Scan</MenuItem>
            <MenuItem value="Insurance-Paper">Insurance Paper</MenuItem>
            <MenuItem value="Driver-Agreement">Driver Agreement</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>

        {/* File Upload (Multiple Images) */}
        <TextField
          type="file"
          onChange={handleFileChange}
          margin="normal"
          inputProps={{ multiple: true, accept: 'image/*' }} // Restrict to images only
          fullWidth
        />

        {/* Display selected files */}
        {uploadedFiles.map((file) => (
  <ListItem key={file.name}>
    <ListItemText primary={file.name} />
    <ListItemSecondaryAction>
      <IconButton edge="end" onClick={() => handleRemoveFile(file.name)}>
        <DeleteIcon color="error" />
      </IconButton>
    </ListItemSecondaryAction>
  </ListItem>
))}

        {/* Modal Actions */}
        <Box mt={3} display="flex" justifyContent="center" gap={2}>
          <Button
            onClick={handleUploadClick}
            disabled={uploadedFiles.length === 0} // Disable if no file selected
          >
            Upload
          </Button>
          <Button onClick={handleClose} >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DocumentsUploadModal;
