import React, { useEffect, useState } from 'react';

interface RouteHistoryProps {
  onDateChange: (date: string) => void;
  date: string;
  onSubmit: () => void;
}

const todayStr = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
const RouteHistoryDatePicker = ({
  onDateChange,
  onSubmit,
  date,
}: RouteHistoryProps) => {
  const [selectedDate, setSelectedDate] = useState<string>(date);

  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
    onDateChange(event.target.value);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <label className="mr-2 text-gray-700">Vehicle Local Date:</label>
        <input
          type="date"
          value={selectedDate || ''}
          onChange={handleDateChange}
          max={todayStr}
          className="text-black bg-white p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={onSubmit}
        className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
      >
        Route History
      </button>
    </div>
  );
};

export default RouteHistoryDatePicker;
