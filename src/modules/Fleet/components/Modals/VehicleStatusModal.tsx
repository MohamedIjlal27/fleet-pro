// VehicleStatusModal.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';

interface VehicleStatusModalProps {
  open: boolean;
  onClose: () => void;
  currentStatus: string;
  onUpdateStatus: (status: string) => void;
}

const VehicleStatusModal: React.FC<VehicleStatusModalProps> = ({
  open,
  onClose,
  currentStatus,
  onUpdateStatus,
}) => {
  const [selectedStatus, setSelectedStatus] = React.useState(currentStatus);

  const handleStatusChange = (event: SelectChangeEvent) => {
    setSelectedStatus(event.target.value as string);
  };

  const handleSubmit = () => {
    onUpdateStatus(selectedStatus);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Update Vehicle Status</DialogTitle>
      <DialogContent>
        <Select value={selectedStatus} onChange={handleStatusChange} fullWidth>
          <MenuItem value="InUse">InUse</MenuItem>
          <MenuItem value="Maintenance">Maintenance</MenuItem>
          <MenuItem value="Reserved">Reserved</MenuItem>
          <MenuItem value="Available">Available</MenuItem>
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: 'gray', fontWeight: 'bold' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          sx={{ color: 'gray', fontWeight: 'bold' }}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VehicleStatusModal;
