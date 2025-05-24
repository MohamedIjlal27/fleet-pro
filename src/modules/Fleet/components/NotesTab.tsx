import type React from 'react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  List,
} from '@mui/material';
import { Add, Delete, AccessTime, Person } from '@mui/icons-material';
import VehicleNotesModal from './Modals/VehicleNotesModal';
import { fetchVehicleNotes, deleteVehicleNote } from '../apis/apis';

interface NotesTabPros {
  vehicle: any;
}

export const NotesTab: React.FC<NotesTabPros> = ({ vehicle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    loadVehicleNotes();
  }, []);

  const addVehicleNote = () => {
    setModalOpen(true);
  };

  const loadVehicleNotes = async () => {
    try {
      setLoading(true);
      const response = await fetchVehicleNotes(vehicle.id);
      setNotes(response);
    } catch (error) {
      toast.error('Failed to load vehicle notes');
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this note?'
    );
    if (!confirmDelete) return;

    try {
      await deleteVehicleNote(vehicle.id, noteId);
      toast.success('Note deleted successfully');
      loadVehicleNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast.error('Failed to delete note');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ', ' +
      date.toLocaleDateString()
    );
  };

  return (
    <Box flex="1" borderRadius="8px" padding={isMobile ? '8px' : '16px'}>
      {/* Header with title and add button */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        marginBottom={isMobile ? '12px' : '16px'}
        paddingX={isMobile ? '8px' : 0}
      >
        <Typography
          variant={isMobile ? 'subtitle1' : 'h6'}
          fontWeight={isMobile ? '500' : 'normal'}
        >
          Notes
        </Typography>

        {isMobile ? (
          <IconButton
            onClick={addVehicleNote}
            sx={{
              backgroundColor: '#1E293B',
              padding: '8px',
              '&:hover': {
                backgroundColor: '#1C2533',
              },
            }}
          >
            <Add sx={{ color: 'white', fontSize: '20px' }} />
          </IconButton>
        ) : (
          <Box display="flex" gap={2}>
            <IconButton
              onClick={addVehicleNote}
              sx={{
                backgroundColor: '#1E293B',
                padding: '8px',
                '&:hover': {
                  backgroundColor: '#1C2533',
                },
              }}
            >
              <Add sx={{ color: 'white' }} />
            </IconButton>
          </Box>
        )}
      </Box>

      {isMobile ? (
        // Mobile view - Card list
        <Box sx={{ px: 1 }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Loading notes...
              </Typography>
            </Box>
          ) : notes && notes.length > 0 ? (
            <List sx={{ p: 0 }}>
              {notes.map((note) => (
                <Card
                  key={note.id}
                  sx={{
                    mb: 1.5,
                    borderRadius: '8px',
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                    overflow: 'visible',
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person
                          sx={{
                            fontSize: 16,
                            color: 'text.secondary',
                            mr: 0.5,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {note.creator?.firstName} {note.creator?.lastName}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteNote(note.id)}
                        sx={{ p: 0.5, color: '#f44336' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography
                      variant="body1"
                      sx={{ mb: 1.5, lineHeight: 1.4 }}
                    >
                      {note.content}
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.secondary',
                      }}
                    >
                      <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                      <Typography variant="caption">
                        {formatDate(note.createdAt)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </List>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No notes found.
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        // Desktop view - Table
        <div className="flex flex-col md:flex-row lg:flex-row gap-4 p-4 bg-[#f9f9f9] min-h-screen">
          <div className="md:w-2/3 lg:w-4/5 flex-1">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {/* Table */}
              <div className="overflow-x-auto scrollbar-thin">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      {['Date', 'Created By', 'Content', 'Action'].map(
                        (heading) => (
                          <th
                            key={heading}
                            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {notes && notes.length > 0 ? (
                      notes.map((note) => {
                        return (
                          <tr key={note.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(note.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {note.creator?.firstName} {note.creator?.lastName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {note.content}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleDeleteNote(note.id)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          {loading ? 'Loading notes...' : 'No notes found.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <VehicleNotesModal
        open={isModalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        vehicle={vehicle}
        loadVehicleNotes={loadVehicleNotes}
      />
    </Box>
  );
};
