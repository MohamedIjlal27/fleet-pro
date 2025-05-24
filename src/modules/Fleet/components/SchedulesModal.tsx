'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  useMediaQuery,
  useTheme,
  IconButton,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Tooltip } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MaintenanceModal } from '../../Maintenance/MaintenanceRecord/components/Modals/MaintenanceModal';
import { DriverTable } from '../../Operations/Drivers/components/DriverTable';

import { createDriverVehicleAssignment } from '../../Operations/Drivers/apis/apis';
import { fetchMaintenances } from '../../Maintenance/MaintenanceRecord/apis/apis';
import { deleteDriverAssignment } from '../../Operations/Drivers/apis/apis';
import { fetchVehicleAssignments } from '../apis/apis';
import { systemModule } from '@/utils/constants';
import { checkModuleExists } from '@/lib/moduleUtils';

const localizer = momentLocalizer(moment);

interface SchedulesModalProps {
  vehicle: any;
}

interface EventType {
  start: Date;
  end: Date;
  title: string;
  type: 'assignment' | 'maintenance';
  icon?: JSX.Element;
  detailNote?: string;
  id?: number;
  driverName?: string;
}

const SchedulesModal: React.FC<SchedulesModalProps> = ({ vehicle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isVehicleAssignmentFeatureAvailable = checkModuleExists(
    systemModule.FleetSchedulesVehicleAssignment
  );
  const isMaintenanceFeatureAvailable = checkModuleExists(
    systemModule.FleetSchedulesMaintenance
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [driverId, setDriverId] = useState<number>(0);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  const [events, setEvents] = useState<EventType[]>([]);
  const [newEvent, setNewEvent] = useState<Partial<EventType>>({});
  const [slotInfo, setSlotInfo] = useState<{ start: Date; end: Date } | null>(
    null
  );
  const [eventType, setEventType] = useState<
    'assignment' | 'maintenance' | null
  >(null);

  useEffect(() => {
    updateEvents();
  }, [vehicle, openDialog]);

  const updateEvents = async () => {
    if (!vehicle || !vehicle.id) return;

    const maintenanceData = await fetchMaintenances(1, 100, vehicle.id);
    if (!maintenanceData || !maintenanceData.data) {
      console.warn('No maintenance data available');
      return;
    }

    const updatedEvents = maintenanceData.data.map((maintenance: any) => {
      const startTime = moment(maintenance.startTime).toDate();
      const endTime = maintenance.endTime
        ? moment(maintenance.endTime).toDate()
        : moment(maintenance.repairEta).toDate();

      return {
        start: startTime,
        end: endTime,
        title: `Maintenance: ${maintenance.serviceTypeName}`,
        type: 'maintenance',
        icon: <ConstructionIcon />,
        detailNote: `Maintenance: ${maintenance.serviceTypeName}`,
        id: maintenance.id,
      };
    });

    const assignments = await fetchVehicleAssignments(vehicle.id);
    if (!assignments || !Array.isArray(assignments)) {
      console.warn('No assignment data available');
      return;
    }

    const assignmentEvents = assignments.map((assignment: any) => {
      const startDate = moment(assignment.startDate).toDate();
      const endDate = moment(assignment.endDate).toDate();
      const driverName = `${assignment.driver?.user?.firstName || ''} ${
        assignment.driver?.user?.lastName || ''
      }`.trim();

      return {
        start: startDate,
        end: endDate,
        title: `Assignment: ${driverName}`,
        type: 'assignment',
        icon: (
          <img
            src={assignment.driver?.user?.picture || '/placeholder.svg'}
            alt={driverName}
            style={{ width: 24, height: 24, borderRadius: '50%' }}
          />
        ),
        detailNote: `Vehicle assigned to driver ${driverName}`,
        id: assignment.id,
        driverName,
      };
    });

    setEvents((prevEvents) => [
      ...prevEvents.filter(
        (event) => event.type !== 'maintenance' && event.type !== 'assignment'
      ),
      ...updatedEvents,
      ...assignmentEvents,
    ]);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    if (isVehicleAssignmentFeatureAvailable || isMaintenanceFeatureAvailable) {
      setSlotInfo({ start, end });
      setNewEvent({ start, end, title: '', type: 'assignment' });
      setEventType(null);
      setOpenDialog(true);
    }
  };

  const handleEventTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEventType(event.target.value as 'assignment' | 'maintenance');
  };

  const handleCreateEvent = async () => {
    if (!newEvent.start || !newEvent.end || !driverId || !vehicle.id) {
      toast.error('Required data is missing');
      return;
    }

    try {
      const data = {
        driverId,
        vehicleId: vehicle.id,
        startDate: newEvent.start.toISOString(),
        endDate: newEvent.end.toISOString(),
      };

      const response = await createDriverVehicleAssignment(data);
      toast.success(`Assigned Driver ${driverId} to Vehicle ${vehicle.id}`);

      setOpenDialog(false);
      setAddEventDialogOpen(false);
      setNewEvent({});
      updateEvents();
    } catch (error) {
      toast.error(`Error creating assignment`);
      console.error('Error creating assignment:', error);
    }
  };

  const eventPropGetter = (event: EventType) => {
    const style: React.CSSProperties = {
      padding: '10px',
      backgroundColor: event.type === 'maintenance' ? 'red' : '#3174ad',
      color: 'white',
      borderRadius: '5px',
      minHeight: '40px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };
    return { style };
  };

  const eventContent = ({ event }: { event: EventType }) => {
    return (
      <Tooltip title={event.title} arrow>
        <div
          style={{ display: 'flex', alignItems: 'center', padding: '0 5px' }}
        >
          <span>{event.title}</span>
        </div>
      </Tooltip>
    );
  };

  const handleDriverRowClick = (driverId: number) => {
    setDriverId(driverId);
  };

  const handleCancelClick = async () => {
    if (
      selectedEvent &&
      selectedEvent.type === 'assignment' &&
      typeof selectedEvent.id === 'number'
    ) {
      const confirmed = window.confirm(
        'Are you sure you want to cancel this assignment?'
      );
      if (confirmed) {
        try {
          await deleteDriverAssignment(selectedEvent.id);
          toast.success('Assignment cancelled successfully');
          setEventDialogOpen(false);
          updateEvents();
        } catch (error) {
          toast.error('Failed to cancel assignment');
          console.error('Error cancelling assignment:', error);
        }
      }
    }
  };

  const handleEventClick = (event: EventType) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const closeEventDialog = () => {
    setSelectedEvent(null);
    setEventDialogOpen(false);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePrevDay = () => {
    setCurrentDate((prevDate) => moment(prevDate).subtract(1, 'day').toDate());
  };

  const handleNextDay = () => {
    setCurrentDate((prevDate) => moment(prevDate).add(1, 'day').toDate());
  };

  const handleAddEvent = (hour: number) => {
    const selectedDateTime = moment(currentDate)
      .hour(hour)
      .minute(0)
      .second(0)
      .toDate();
    setSelectedTime(selectedDateTime);
    setAddEventDialogOpen(true);
  };

  const getFilteredEvents = () => {
    const filterType =
      tabValue === 1 ? 'assignment' : tabValue === 2 ? 'maintenance' : null;

    return events.filter((event) => {
      const eventDate = moment(event.start).format('YYYY-MM-DD');
      const currentDateStr = moment(currentDate).format('YYYY-MM-DD');

      if (eventDate !== currentDateStr) return false;
      if (filterType && event.type !== filterType) return false;

      return true;
    });
  };

  const renderMobileSchedule = () => {
    const filteredEvents = getFilteredEvents();
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const formattedDate = moment(currentDate).format('MM/DD/YYYY');

    return (
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Filter tabs */}
        <Paper sx={{ mb: 1, borderRadius: '20px' }} elevation={0}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                minHeight: '40px',
                borderRadius: '20px',
              },
              '& .Mui-selected': {
                backgroundColor: '#fff',
                color: '#000',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              },
              bgcolor: '#f0f0f0',
              borderRadius: '20px',
              p: 0.5,
            }}
            TabIndicatorProps={{ style: { display: 'none' } }}
          >
            <Tab label="All" />
            <Tab label="Assignment" />
            <Tab label="Maintenance" />
          </Tabs>
        </Paper>

        {/* Date selector */}
        <Paper
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.5,
            mb: 2,
            borderRadius: '20px',
            bgcolor: '#f0f0f0',
          }}
          elevation={0}
        >
          <IconButton size="small" onClick={handlePrevDay}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarTodayIcon sx={{ mr: 1, fontSize: 18 }} />
            <Typography variant="body1">{formattedDate}</Typography>
          </Box>

          <IconButton size="small" onClick={handleNextDay}>
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Paper>

        {/* Timeline */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {hours.map((hour) => {
            const hourEvents = filteredEvents.filter((event) => {
              const eventHour = new Date(event.start).getHours();
              return eventHour === hour;
            });

            const formattedHour = `${hour.toString().padStart(2, '0')}:00`;
            const isOccupied = hourEvents.length > 0;

            return (
              <Box key={hour} sx={{ display: 'flex', mb: 2 }}>
                {/* Time indicator */}
                <Box
                  sx={{
                    width: '40px',
                    textAlign: 'right',
                    pr: 1,
                    color: '#666',
                  }}
                >
                  <Typography variant="caption">{formattedHour}</Typography>
                </Box>

                {/* Event or empty slot */}
                {isOccupied ? (
                  hourEvents.map((event, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        ml: 1,
                        position: 'relative',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleEventClick(event)}
                    >
                      {/* Colored indicator */}
                      <Box
                        sx={{
                          width: '4px',
                          backgroundColor:
                            event.type === 'maintenance'
                              ? '#f59e0b'
                              : '#3b82f6',
                          borderRadius: '2px',
                        }}
                      />

                      {/* Event content */}
                      <Box
                        sx={{
                          flex: 1,
                          ml: 1,
                          p: 1.5,
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <Typography variant="body1" fontWeight="500">
                          {event.type === 'assignment'
                            ? event.driverName
                            : 'Maintenance'}
                        </Typography>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mt: 0.5,
                          }}
                        >
                          <AccessTimeIcon
                            sx={{
                              fontSize: 14,
                              mr: 0.5,
                              color: 'text.secondary',
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {moment(event.start).format('ddd, DD MMM')} ·{' '}
                            {moment(event.start).format('hh:mm')} -{' '}
                            {moment(event.end).format('hh:mm A')}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box
                    sx={{
                      flex: 1,
                      ml: 1,
                      p: 2,
                      backgroundColor: '#f5f5f5',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleAddEvent(hour)}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Waiting for New Schedule
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Floating action button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            bgcolor: '#1E293B',
            '&:hover': {
              bgcolor: '#0f172a',
            },
          }}
          onClick={() => {
            setSelectedTime(new Date());
            setAddEventDialogOpen(true);
          }}
        >
          <AddIcon />
        </Fab>
      </Box>
    );
  };

  return (
    <Box sx={{ height: '80vh', width: '100%', padding: isMobile ? 1 : 2 }}>
      {isMobile ? (
        renderMobileSchedule()
      ) : (
        <Calendar
          localizer={localizer}
          defaultDate={new Date()}
          defaultView="week"
          events={events}
          length={7}
          selectable
          style={{ height: '100%', width: '100%' }}
          eventPropGetter={eventPropGetter}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleEventClick}
          components={{
            event: eventContent,
          }}
        />
      )}

      {/* Dialog for Selecting Event Type */}
      <Dialog
        open={openDialog || addEventDialogOpen}
        onClose={() => {
          setOpenDialog(false);
          setAddEventDialogOpen(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Select Event Type</DialogTitle>
        <DialogContent>
          <RadioGroup value={eventType} onChange={handleEventTypeChange}>
            {isVehicleAssignmentFeatureAvailable && (
              <FormControlLabel
                value="assignment"
                control={<Radio />}
                label="Vehicle Assignment"
              />
            )}
            {isMaintenanceFeatureAvailable && (
              <FormControlLabel
                value="maintenance"
                control={<Radio />}
                label="Maintenance"
              />
            )}
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              setAddEventDialogOpen(false);
            }}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (eventType) {
                if (selectedTime) {
                  // For mobile view with selectedTime
                  const endTime = new moment(selectedTime)
                    .add(1, 'hour')
                    .toDate();
                  setNewEvent({
                    type: eventType,
                    start: selectedTime,
                    end: endTime,
                  });
                } else {
                  // For desktop view with slotInfo
                  setNewEvent((prev) => ({
                    ...prev,
                    type: eventType,
                  }));
                }
                setOpenDialog(false);
                setAddEventDialogOpen(false);
              }
            }}
            color="primary"
          >
            Next
          </Button>
        </DialogActions>
      </Dialog>

      {/* Open MaintenanceModal or Assignment Modal based on eventType */}
      {eventType === 'maintenance' && (
        <MaintenanceModal
          open={
            (openDialog || addEventDialogOpen) && eventType === 'maintenance'
          }
          onClose={() => {
            setEventType(null);
            setOpenDialog(false);
            setAddEventDialogOpen(false);
          }}
          mode="Create"
          vehicle={vehicle}
          start_time={newEvent.start ? newEvent.start.toISOString() : ''}
          end_time={newEvent.end ? newEvent.end.toISOString() : ''}
        />
      )}

      {eventType === 'assignment' && (
        <Dialog
          open={
            (openDialog || addEventDialogOpen) && eventType === 'assignment'
          }
          onClose={() => {
            setOpenDialog(false);
            setAddEventDialogOpen(false);
          }}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Add Assignment</DialogTitle>
          <DialogContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label="Driver ID"
              fullWidth
              type="number"
              value={driverId}
              onChange={(e) => setDriverId(Number(e.target.value))}
              margin="normal"
            />
            <DriverTable onDriverSelect={handleDriverRowClick} />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Start Date and Time"
                value={newEvent.start || selectedTime || new Date()}
                onChange={(date) => {
                  if (date) {
                    setNewEvent((prev) => ({
                      ...prev,
                      start: date,
                    }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                    helperText="Displayed in local time, stored in ISO format"
                  />
                )}
              />
              <DateTimePicker
                label="End Date and Time"
                value={
                  newEvent.end ||
                  (selectedTime
                    ? moment(selectedTime).add(1, 'hour').toDate()
                    : new Date())
                }
                onChange={(date) => {
                  if (date) {
                    setNewEvent((prev) => ({
                      ...prev,
                      end: date,
                    }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                    helperText="Displayed in local time, stored in ISO format"
                  />
                )}
              />
            </LocalizationProvider>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => {
                setOpenDialog(false);
                setAddEventDialogOpen(false);
              }}
              color="secondary"
            >
              Cancel
            </Button>
            <Button onClick={handleCreateEvent} color="primary">
              Add Assignment
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Event Details Dialog */}
      <Dialog
        open={eventDialogOpen}
        onClose={closeEventDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          {selectedEvent ? (
            <div>
              <p>
                <strong>Title:</strong> {selectedEvent.title}
              </p>
              <p>
                <strong>Type:</strong> {selectedEvent.type}
              </p>
              <p>
                <strong>Start:</strong>{' '}
                {new Date(selectedEvent.start).toLocaleString()}
              </p>
              <p>
                <strong>End:</strong>{' '}
                {new Date(selectedEvent.end).toLocaleString()}
              </p>
              {selectedEvent.type === 'assignment' &&
                selectedEvent.detailNote && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    {selectedEvent.detailNote}
                  </div>
                )}
            </div>
          ) : (
            <p>No event selected</p>
          )}
        </DialogContent>
        <DialogActions>
          {selectedEvent?.type === 'assignment' && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancelClick}
              sx={{ mr: 1 }}
            >
              Cancel Assignment
            </Button>
          )}
          <Button variant="outlined" onClick={closeEventDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchedulesModal;
