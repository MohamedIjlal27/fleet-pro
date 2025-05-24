import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { createVehicleNote } from '../../apis/apis'

interface VehicleNotesModalProps {
  open: boolean;
  onClose: () => void;
  vehicle: any;
  loadVehicleNotes: () => void;
}

const VehicleNotesModal: React.FC<VehicleNotesModalProps> = ({
  open,
  onClose,
  vehicle,
  loadVehicleNotes,
}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setContent(event.target.value);
  };

  const handleSubmit = async () => {
    if (!vehicle?.id || !content.trim()) return;

    try {
      setLoading(true);
      await createVehicleNote(vehicle.id, content.trim());
      loadVehicleNotes();
      setContent('');
      onClose();
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Add new note</DialogTitle>
      <DialogContent>
        <TextField
            fullWidth
            //multiline
            //minRows={4}
            label="Note Content"
            value={content}
            onChange={handleContentChange}
            required
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || loading}
          variant="contained"
          color="primary"
        >
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VehicleNotesModal;
