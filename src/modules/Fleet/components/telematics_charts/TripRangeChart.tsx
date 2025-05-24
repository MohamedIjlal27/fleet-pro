import React from 'react';

const TripRange: React.FC<{ range: number }> = ({ range }) => {
  return (
    <div className="flex flex-col items-center mt-8">
      <p className="text-lg text-slate-800">{range} km</p>
      <p className="text-xs font-bold mt-5">Daily Trip Range</p>
    </div>
  );
};

export default TripRange;
