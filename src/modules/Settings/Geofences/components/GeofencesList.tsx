import { useEffect, useState } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';

type CircleGeometry = {
  center: { lat: number; lon: number };
  radius: number;
  type: 'circle';
};

type PolygonGeometry = {
  path: { lat: number; lon: number }[];
  type: 'polygon';
};

type Geofence = {
  id: string;
  name: string;
  geoFenceIdid?: string;
  geometry: CircleGeometry | PolygonGeometry;
};

const GeofenceList = ({
  geofences,
  currentGeofence,
  setCurrentGeofence,
  openInfo,
}: {
  geofences: any;
  currentGeofence: string;
  setCurrentGeofence: (geofenceId: string) => void;
  openInfo: (open: boolean, geofence?: any) => void;
}) => {
  const [activeTab, setActiveTab] = useState('Active');
  const [geofenceList, setGeofenceList] = useState<any>(null);
  const [openedGeofenceId, setOpenedGeofenceId] = useState<string | null>(null);

  useEffect(() => {
    if (geofences && geofences.geofences) {
      const filteredData =
        activeTab === 'All'
          ? geofences.geofences
          : geofences.geofences.filter(
              (geofence: any) => geofence.isActive === (activeTab === 'Active')
            );

      setGeofenceList(filteredData);
      console.log('filteredData', filteredData);
    } else {
      setGeofenceList([]);
      console.warn('Geofences data is not available or invalid.');
    }
  }, [geofences, activeTab]);

  useEffect(() => {
    openInfoPopup();
  }, [openedGeofenceId]);

  useEffect(() => {
    if (openedGeofenceId) {
      openInfoPopup();
    }
  }, [geofences]);

  const openInfoPopup = () => {
    if (openedGeofenceId) {
      const selectedGeofence = geofences.geofences.find(
        (geofence: Geofence) => geofence.id === openedGeofenceId
      );
      openInfo(true, selectedGeofence);
    } else {
      openInfo(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col py-4">
      <div className="flex grow-0 bg-gray-100 rounded-lg p-1 mb-4">
        {['All', 'Active', 'Inactive'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-center rounded-lg transition-all ${
              activeTab === tab
                ? 'bg-white shadow font-semibold text-black'
                : 'text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4 flex-grow overflow-y-auto pb-4">
        {geofenceList &&
          geofenceList?.map((geofence: any) => (
            <div
              key={geofence.id}
              className={`${
                currentGeofence === geofence.id
                  ? 'border-2 border-[#0A1224]'
                  : 'border'
              } bg-white p-4 rounded-lg shadow-md cursor-pointer`}
              onClick={() => {
                setOpenedGeofenceId(null);
                setCurrentGeofence(geofence.id);
              }}
            >
              <div className="flex justify-between gap-2 items-center">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium flex items-center text-black text-base">
                    <span className="p-1 bg-[#8AB4F9] rounded-full mr-2">
                      <MapPin
                        className="text-[#8AB4F9]"
                        size={20}
                        fill="#ffffff"
                      />
                    </span>
                    {geofence.name}
                  </h3>
                  <span
                    className="text-sm px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: geofence.isActive
                        ? '#E4F6F4'
                        : '#FDECEC',
                      color: geofence.isActive ? '#50AC99' : '#D9534F',
                    }}
                  >
                    {geofence.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div
                  className="p-2 bg-white rounded-md shadow-md cursor-pointer hover:bg-gray-100 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenedGeofenceId(geofence.id);
                  }}
                >
                  <ArrowRight className="text-gray-400" size={20} />
                </div>
              </div>
              <div className="mt-2 text-gray-600 space-y-2">
                <div className="flex flex-wrap">
                  <p className="flex flex-1/2 items-center gap-2">
                    <span className="font-medium text-gray-400">Type:</span>{' '}
                    <span className="font-medium capitalize">
                      {geofence.type}
                    </span>
                  </p>
                  <p className="flex flex-1/2 items-center gap-2">
                    <span className="font-medium text-gray-400">Vehicles:</span>{' '}
                    <span className="font-medium">
                      {geofence.geoFenceVehicleCount}
                    </span>
                  </p>
                </div>
                {/* <div className="flex flex-wrap">
                <p className="flex flex-1/2 items-center gap-2">
                  <span className="font-medium text-gray-400">Area:</span>{' '}
                  <span className="font-medium">N/A</span>
                </p>
                <p className="flex flex-1/2 items-center gap-2">
                  <span className="font-medium text-gray-400">Alerts:</span>
                  <span
                    className={`ml-1 font-medium ${
                      0 > 0
                        ? 'text-red-500 bg-red-100 rounded-full px-2.5 py-1 text-sm'
                        : 'text-gray-500'
                    }`}
                  >
                    N/A
                  </span>
                </p>
              </div> */}
              </div>
              <hr className="my-2 opacity-50" />
              <p className="text-xs text-gray-400 mt-2">
                Last updated:{' '}
                {new Date(geofence.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default GeofenceList;
