import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface DocumentUploadModalProps {
  open: boolean;
  handleClose: () => void;
  handleFileUpload: (file: File) => void;
  handleSelectChange: (e: any) => void;
  selectedDocumentType: string;
  formState: any;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  open,
  handleClose,
  handleFileUpload,
  handleSelectChange,
  selectedDocumentType,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      handleFileUpload(selectedFile);
    } else {
      console.error('No file selected for upload');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md">
      <DialogTitle>
        Upload Document{' '}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className="flex flex-col">
        <FormControl margin="normal">
          <InputLabel>Document Type</InputLabel>
          <Select
            value={selectedDocumentType}
            onChange={handleSelectChange}
            name="documentType"
            label="Document Type"
          >
            <MenuItem value="License-Scan">License Scan</MenuItem>
            <MenuItem value="Insurance-Paper">Insurance Paper</MenuItem>
            <MenuItem value="Driver-Agreement">Driver Agreement</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
        <TextField
          type="file"
          onChange={handleFileChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>

      <DialogActions className="flex flex-col mx-auto">
        <Button
          onClick={handleUploadClick}
          sx={{ bgcolor: 'black', color: 'white' }}
        >
          Upload
        </Button>
        <Button
          onClick={handleClose}
          sx={{ bgcolor: '', color: 'black', marginTop: '10px' }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
