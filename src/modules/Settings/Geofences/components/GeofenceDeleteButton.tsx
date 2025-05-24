import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { Trash } from 'lucide-react';

// This would be part of your component
function GeofenceDeleteButton({
  currentGeofence,
  onClickDelete,
}: {
  currentGeofence: any;
  onClickDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirmDelete = () => {
    onClickDelete(currentGeofence.id);
    setOpen(false);
  };

  return (
    <>
      <span
        title="Delete Geofence"
        className="cursor-pointer"
        onClick={handleOpen}
      >
        <Trash size={22} className="text-red-500 hover:text-red-700" />
      </span>

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${
          open ? 'block' : 'hidden'
        }`}
      >
        <div className="bg-white rounded-lg shadow-lg w-96">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Confirm Delete Geofence
            </h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete this geofence?
            </p>
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end px-6 py-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="ml-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default GeofenceDeleteButton;
