import type React from 'react';
import { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import type {
  IRouteHistoryData,
  ITrip,
} from '../../core/interfaces/interfaces';
import { Clock, Car, Timer, MapPin } from 'lucide-react';
import LocationAddress from '../../../utils/addressForLatLong';

interface RouteHistoryProps {
  routeHistory: IRouteHistoryData | null;
  onTripSelectionChange: (selectedTrips: ITrip[]) => void;
}

const RouteHistorySectionMobile: React.FC<RouteHistoryProps> = ({
  routeHistory,
  onTripSelectionChange,
}) => {
  // const [selectedTrips, setSelectedTrips] = useState<ITrip[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

  useEffect(() => {
    console.log('routeHistory', routeHistory);
    setRoute();
  }, [routeHistory]);

  useEffect(() => {
    if (routeHistory && routeHistory.trips && routeHistory.trips.length > 0) {
      const events = generateTimelineEvents(routeHistory.trips);
      setTimelineEvents(events);
    } else {
      setTimelineEvents([]);
    }
  }, [routeHistory]);

  const setRoute = () => {
    if (routeHistory && routeHistory.trips && routeHistory.trips.length > 0) {
      // setSelectedTrips(routeHistory.trips);
      onTripSelectionChange(routeHistory.trips);
    } else {
      console.warn('No trips available in routeHistory:', routeHistory);
      // setSelectedTrips([]);
      onTripSelectionChange([]);
    }
  };

  // Format time from ISO string
  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format detailed time with seconds from ISO string
  const formatDetailedTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Calculate duration between trips for display
  const calculateDuration = (tripTime: string) => {
    // Parse the trip time format (e.g., "1m 59s", "10m 18s")
    const hours = tripTime.includes('h')
      ? Number.parseInt(tripTime.split('h')[0])
      : 0;
    const minutesMatch = tripTime.match(/(\d+)m/);
    const secondsMatch = tripTime.match(/(\d+)s/);

    const minutes = minutesMatch ? Number.parseInt(minutesMatch[1]) : 0;
    const seconds = secondsMatch ? Number.parseInt(secondsMatch[1]) : 0;

    let durationText = '';
    if (hours > 0) durationText += `${hours}h `;
    if (minutes > 0) durationText += `${minutes}m `;
    if (seconds > 0 && hours === 0) durationText += `${seconds}s`;

    return durationText.trim();
  };

  // Generate timeline events from trip data
  const generateTimelineEvents = (trips: ITrip[]) => {
    if (!trips || trips.length === 0) return [];

    const events: any[] = [];
    let totalDistance = 0;

    // Sort trips by start time
    const sortedTrips = [...trips].sort((a, b) => {
      return (
        new Date(a.startDataTime).getTime() -
        new Date(b.startDataTime).getTime()
      );
    });

    // First trip is always a start
    const firstTrip = sortedTrips[0];
    events.push({
      time: formatTime(firstTrip.startDataTime),
      detailedTime: formatDetailedTime(firstTrip.startDataTime),
      type: 'start',
      description: `Start: ${calculateDuration(firstTrip.tripTime)}`,
      trip: firstTrip,
      position: firstTrip.position.length > 0 ? firstTrip.position[0] : null,
      distance: 0,
    });

    // Process all trips
    sortedTrips.forEach((trip) => {
      // Add distance from previous events
      totalDistance += trip.distance || 0;
      console.log('trip111', trip);

      // For driving trips, add a driving event
      if (trip.status === 'Driving' && trip.distance > 80) {
        // Check if there are any high speeds in the positions
        const highSpeedPositions = trip.position.filter(
          (pos) => pos.speed > 90
        );
        console.log('highSpeedPositions', highSpeedPositions);

        if (highSpeedPositions.length > 0) {
          // Add overspeeding events
          highSpeedPositions.forEach((pos) => {
            events.push({
              time: formatDetailedTime(trip.startDataTime), // This is approximate as we don't have exact time for each position
              detailedTime: formatDetailedTime(trip.startDataTime),
              type: 'alert',
              description: `Overspeeding [${pos.speed} Km/h] Detected`,
              severity: pos.speed > 100 ? 'danger' : 'warning',
              trip: trip,
              position: pos,
            });
          });
        }
      }

      // For idling trips, add an idle event
      if (
        trip.status === 'Idling' &&
        trip.tripTime.includes('m') &&
        Number.parseInt(trip.tripTime.split('m')[0]) > 5
      ) {
        events.push({
          time: formatDetailedTime(trip.startDataTime),
          detailedTime: formatDetailedTime(trip.startDataTime),
          type: 'alert',
          description: `Idle Time Exceeded The Limit By ${Number.parseInt(
            trip.tripTime.split('m')[0]
          )} Mins`,
          severity: 'warning',
          trip: trip,
          position: trip.position.length > 0 ? trip.position[0] : null,
        });
      }

      // Add a stop event for each trip
      events.push({
        time: formatTime(trip.endDataTime),
        detailedTime: formatDetailedTime(trip.endDataTime),
        type: trip.status === 'Idling' ? 'stop' : 'driving',
        description: `Duration ${calculateDuration(trip.tripTime)}`,
        trip: trip,
        position:
          trip.position.length > 0
            ? trip.position[trip.position.length - 1]
            : null,
        distance: Math.round(totalDistance),
      });
    });

    // Last trip is always an end
    const lastTrip = sortedTrips[sortedTrips.length - 1];
    events.push({
      time: formatTime(lastTrip.endDataTime),
      detailedTime: formatDetailedTime(lastTrip.endDataTime),
      type: 'end',
      description: 'End',
      trip: lastTrip,
      position:
        lastTrip.position.length > 0
          ? lastTrip.position[lastTrip.position.length - 1]
          : null,
      distance: Math.round(totalDistance),
    });

    // Sort events by time
    events.sort((a, b) => {
      return (
        new Date(a.trip.startDataTime).getTime() -
        new Date(b.trip.startDataTime).getTime()
      );
    });

    return events;
  };

  // Helper function to get icon and color based on event type
  const getEventIconAndColor = (eventType: string, severity?: string) => {
    switch (eventType) {
      case 'start':
        return {
          icon: <Car size={16} />,
          color: '#3366FF',
          bgColor: '#E6EEFF',
        };
      case 'end':
        return {
          icon: <MapPin size={16} />,
          color: '#3366FF',
          bgColor: '#E6EEFF',
        };
      case 'stop':
        return {
          icon: <Timer size={16} />,
          color: '#333333',
          bgColor: '#F0F0F0',
        };
      case 'driving':
        return {
          icon: <Car size={16} />,
          color: '#3366FF',
          bgColor: '#E6EEFF',
        };
      case 'alert':
        return {
          icon: <Clock size={16} />,
          color: severity === 'danger' ? '#FF3333' : '#FF9900',
          bgColor: severity === 'danger' ? '#FFEBEB' : '#FFF6E6',
        };
      default:
        return {
          icon: <Car size={16} />,
          color: '#3366FF',
          bgColor: '#E6EEFF',
        };
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        padding: 2,
        margin: 'auto',
        maxHeight: '100%',
        overflowY: 'auto',
        backgroundColor: '#FAFAFA',
      }}
    >
      {!routeHistory ||
      !routeHistory.trips ||
      routeHistory.trips.length === 0 ? (
        <Typography>
          No route history available for the selected date.
        </Typography>
      ) : (
        <Box sx={{ position: 'relative' }}>
          {/* Timeline line */}
          <Box
            sx={{
              position: 'absolute',
              left: '60px',
              top: '24px',
              bottom: '0',
              width: '1px',
              borderLeft: '2px dotted #CCCCCC',
              zIndex: 1,
            }}
          />

          {/* Timeline events */}
          {timelineEvents.map((event, index) => {
            const { icon, color, bgColor } = getEventIconAndColor(
              event.type,
              event.severity
            );

            return (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  marginBottom: 3,
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                {/* Time */}
                <Box
                  sx={{
                    width: '50px',
                    textAlign: 'right',
                    paddingRight: '10px',
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    color="text.secondary"
                  >
                    {event.time}
                  </Typography>
                </Box>

                {/* Icon */}
                <Box
                  sx={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: color,
                    marginRight: '12px',
                  }}
                >
                  {icon}
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    fontWeight={event.type === 'alert' ? 'bold' : 'medium'}
                    color={
                      event.severity === 'danger'
                        ? '#FF3333'
                        : event.severity === 'warning'
                        ? '#FF9900'
                        : 'text.primary'
                    }
                  >
                    {event.description}
                  </Typography>

                  {event.position && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      <LocationAddress
                        latitude={event.position.latitude}
                        longitude={event.position.longitude}
                      />
                    </Typography>
                  )}

                  {event.distance > 0 &&
                    (event.type === 'stop' || event.type === 'end') && (
                      <Typography
                        variant="body2"
                        color="primary"
                        fontWeight="medium"
                        sx={{ mt: 1, color: '#3366FF' }}
                      >
                        Distance: {event.distance}km
                      </Typography>
                    )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
};

export default RouteHistorySectionMobile;
