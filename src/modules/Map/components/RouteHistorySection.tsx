import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import LocationAddress from '../../../utils/addressForLatLong';
import {
  IVehicle,
  IRouteHistoryData,
  ITrip,
} from '../../core/interfaces/interfaces';
import moment from 'moment';
import { CalenderIcon, EyeCloseIcon, EyeIcon, TimeIcon } from "../../../icons";
import Flatpickr from "react-flatpickr";

interface RouteHistoryProps {
  onDateChange: (date: string) => void;
  routeHistory: IRouteHistoryData | null;
  selectedVehicle: IVehicle | null;
  onTripSelectionChange: (selectedTrips: ITrip[]) => void;
  alertDate?: string;
}

const RouteHistorySection: React.FC<RouteHistoryProps> = ({
  onDateChange,
  routeHistory,
  selectedVehicle,
  onTripSelectionChange,
  alertDate,
}) => {
  const [selectedTrips, setSelectedTrips] = useState<ITrip[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    setSelectedDate('');
  }, [selectedVehicle]);

  useEffect(() => {
    setRoute();
  }, [routeHistory]);

  const setRoute = () => {
    if (routeHistory && routeHistory.trips && routeHistory.trips.length > 0) {
      //const mostRecentTrip = routeHistory.trips[0];
      //setSelectedTrips([mostRecentTrip]);
      //onTripSelectionChange([mostRecentTrip]);
      setSelectedTrips(routeHistory.trips);
      onTripSelectionChange(routeHistory.trips);
    } else {
      console.warn('No trips available in routeHistory:', routeHistory);
      setSelectedTrips([]);
      onTripSelectionChange([]);
    }
  }

  useEffect(()=> {
    console.log('alert alertDate=',alertDate)
    if(alertDate){
      setSelectedDate(alertDate);
      onDateChange(alertDate);
      setRoute();
    }
  },[alertDate])

  const handleTripToggle = (trip: ITrip) => {
    if (routeHistory) {
      console.log("fullTrips", routeHistory);
      const isSelected = selectedTrips.includes(trip);

      const updatedSelectedTrips = isSelected
        ? selectedTrips.filter((t) => t !== trip)
        : [...selectedTrips, trip];
      //console.log("updatedSelectedTrips", updatedSelectedTrips);

      //The ordering of updatedSelectedTrips is incorrect. Need to reordering with routeHistory.
      const reorderedUpdatedSelectedTrips = routeHistory.trips?.filter(function(trip1) {
        return updatedSelectedTrips.some(function(trip2) { return trip1 === trip2; });
      });
      //console.log("reorderedUpdatedSelectedTrips", reorderedUpdatedSelectedTrips);

      setSelectedTrips(reorderedUpdatedSelectedTrips);
      onTripSelectionChange(reorderedUpdatedSelectedTrips);
    }
  };

  // const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const newDate = event.target.value;
  //   setSelectedDate(newDate);
  //   onDateChange(newDate);
  // };
  const handleDateChange = (date: Date[]) => {
    console.log("date",date);
    console.log("date[0]",date[0]);
    const newDate = moment(date[0]).format('YYYY-MM-DD');
    console.log("newDate",newDate);
    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  return (
    <Paper
      elevation={1}
      sx={{ padding: 2, margin: 'auto', maxHeight: '100%', overflowY: 'auto' }}
    >
      <div className="flex items-center justify-between">
        <Typography variant="h6" gutterBottom>
          Route History
        </Typography>
        {/* <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          max={todayStr}
          className="border border-gray-300 rounded-md p-1"
        /> */}
        <div className="relative w-full flatpickr-wrapper">
          <Flatpickr
            value={selectedDate} // Set the value to the state
            onChange={handleDateChange} // Handle the date change
            options={{
              dateFormat: "Y-m-d", // Set the date format
            }}
            placeholder="Select an option"
            className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
          />
          <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
            <CalenderIcon className="size-6" />
          </span>
        </div>
      </div>
      <Divider sx={{ margin: '10px 0' }} />
      {!routeHistory ||
      !routeHistory.trips ||
      routeHistory.trips.length === 0 ? (
        <Typography>
          No route history available for the selected date.
        </Typography>
      ) : (
        <>
          <Typography>
            Total Driving Duration:{' '}
            {routeHistory.trips
              .reduce((acc, trip) => acc + parseDuration(trip.tripTime), 0)
              .toFixed(2)}{' '}
            hours
          </Typography>
          <Typography>
            Total Distance:{' '}
            {routeHistory.trips
              .reduce((acc, trip) => acc + trip.distance, 0)
              .toFixed(2)}{' '}
            km
          </Typography>
          <Divider sx={{ margin: '10px 0' }} />

          {/* List of trips */}
          {routeHistory &&
            routeHistory.trips.map((trip, index) => (
              <Box key={index} sx={{ marginBottom: 2 }}>
                <input
                  type="checkbox"
                  checked={selectedTrips.includes(trip)}
                  onChange={() => handleTripToggle(trip)}
                />
                <Typography variant="body1" fontWeight="bold">
                  Start Time:{' '}
                  {new Date(trip.startDataTime).toLocaleTimeString()}
                </Typography>
                <Typography>
                  Status: {trip.status}
                </Typography>
                <Typography color="text.secondary">
                  Trip Duration: {trip.tripTime}
                </Typography>
                <Typography fontWeight="bold">
                  End Time: {new Date(trip.endDataTime).toLocaleTimeString()}
                </Typography>
                {trip.position.length > 0 && (
                  <>
                    <Typography>
                      Start Location:{' '}
                      <LocationAddress
                        latitude={trip.position[0].latitude}
                        longitude={trip.position[0].longitude}
                      />
                    </Typography>
                    <Typography>
                      End Location:{' '}
                      <LocationAddress
                        latitude={
                          trip.position[trip.position.length - 1].latitude
                        }
                        longitude={
                          trip.position[trip.position.length - 1].longitude
                        }
                      />
                    </Typography>
                  </>
                )}
                <Typography color="primary">
                  Distance: {trip.distance?.toFixed(2) || 0} km
                </Typography>
                <Divider sx={{ margin: '10px 0' }} />
              </Box>
            ))}
        </>
      )}
    </Paper>
  );
};

const parseDuration = (durationStr: string): number => {
  const regex = /(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/;
  const match = regex.exec(durationStr);
  if (match) {
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
    return hours + minutes / 60 + seconds / 3600;
  }
  return 0;
};

export default RouteHistorySection;
