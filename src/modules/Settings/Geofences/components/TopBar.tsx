import { useState, useEffect, useRef } from 'react';
import { Search, Plus, ChevronDown, Waypoints, Download } from 'lucide-react';

interface TopBarProps {
  addNewGeofence?: (isFile: boolean) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  addNewGeofence = (isFile: boolean) => {},
}) => {
  const [shapeOpen, setShapeOpen] = useState(false);
  const [geofenceDropdownOpen, setGeofenceDropdownOpen] = useState(false);

  const shapeRef = useRef<HTMLDivElement>(null);
  const geofenceDropdownRef = useRef<HTMLDivElement>(null);

  const shapes = ['All Shape', 'Circle', 'Polygon'];
  const geofenceOptions = [
    {
      label: 'Shape',
      action: () => {
        addNewGeofence(false);
        setGeofenceDropdownOpen(false);
      },
      icon: <Waypoints size={18} />,
    },
    {
      label: 'Import data',
      action: () => {
        addNewGeofence(true);
        setGeofenceDropdownOpen(false);
      },
      icon: <Download size={18} />,
    },
  ];

  // Handle clicks outside the dropdown to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shapeRef.current &&
        !shapeRef.current.contains(event.target as Node)
      ) {
        setShapeOpen(false);
      }
      if (
        geofenceDropdownRef.current &&
        !geofenceDropdownRef.current.contains(event.target as Node)
      ) {
        setGeofenceDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleShapeSelect = (shape: string) => {
    // Here you can add logic to handle the selected shape
    setShapeOpen(false);
  };

  return (
    <div className="w-full flex items-center p-4 bg-white rounded-lg shadow">
      {/* Search input */}
      <div className="relative mr-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search"
          className="pl-10 pr-4 py-2 w-64 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filter dropdowns */}
      <div className="flex space-x-2">
        {/* Shape dropdown */}
        <div className="relative" ref={shapeRef}>
          <button
            onClick={() => {
              setShapeOpen(!shapeOpen);
              setGeofenceDropdownOpen(false);
            }}
            className="flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          >
            <span>{shapes[0]}</span>
            <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
          </button>

          {shapeOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
              {shapes.map((shape, index) => (
                <div
                  key={index}
                  className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleShapeSelect(shape)}
                >
                  {shape}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add New Geofence button */}
      <div className="ml-auto relative" ref={geofenceDropdownRef}>
        <button
          onClick={() => {
            setGeofenceDropdownOpen(!geofenceDropdownOpen);
            setShapeOpen(false);
          }}
          className="flex items-center px-4 py-2 bg-[#0A1224] text-white rounded-lg text-sm font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>Add New Geofence</span>
          <span className="ml-2 opacity-80">|</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </button>

        {geofenceDropdownOpen && (
          <div className="absolute right-0 z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
            {geofenceOptions.map((option, index) => (
              <div
                key={index}
                className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                onClick={option.action}
                role="button"
              >
                <div className="flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
