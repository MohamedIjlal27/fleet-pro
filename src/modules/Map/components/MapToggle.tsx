import React from 'react';
import { MapPin, Globe } from 'lucide-react';

interface MapToggleProps {
  isGoogleMaps: boolean;
  onToggle: (useGoogleMaps: boolean) => void;
  className?: string;
}

export const MapToggle: React.FC<MapToggleProps> = ({
  isGoogleMaps,
  onToggle,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm border ${className}`}>
      <button
        onClick={() => onToggle(false)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          !isGoogleMaps
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <MapPin size={16} />
        <span>Mapbox</span>
      </button>
      
      <button
        onClick={() => onToggle(true)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isGoogleMaps
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Globe size={16} />
        <span>Google Maps</span>
      </button>
    </div>
  );
};

export default MapToggle; 