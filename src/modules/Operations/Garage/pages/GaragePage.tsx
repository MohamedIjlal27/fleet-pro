import ThemeButton from '../../../core/components/ThemeButton';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import axiosInstance from '../../../../utils/axiosConfig';
import { IGarage } from '../interfaces/garage.interface';
import { customCoordinate } from '../../../../utils/constants';
// Comment out Mapbox imports for demo mode
// import mapboxgl from 'mapbox-gl';
// import { createMarkerElement } from '../../../../utils/map/pulsating_dot';
import { systemPlan, systemModule } from '@/utils/constants';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from '@/modules/core/pages/Error404Page';
import LockedFeature from '@/modules/core/components/LockedFeature';
import { Pagination } from '@/components/ui/pagination';
import { PlusCircle } from 'lucide-react';

export const GaragePage: React.FC = () => {
  if (!checkModuleExists(systemModule.OperationsGarages)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Garages" />
    ) : (
      <Error404Page />
    );
  }

  // Comment out Mapbox-related refs for demo mode
  // const mapContainerRef = useRef<HTMLDivElement | null>(null);
  // const mapRef = useRef<mapboxgl.Map | null>(null);
  // const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const navigate = useNavigate();
  const [garages, setGarages] = useState<IGarage[]>([]);
  const [cityFilters, setCityFilters] = useState<string[]>([]);
  const [garageGroups, setGarageGroups] = useState<string[]>([]);
  const [displayedGarages, setDisplayedGarages] = useState<IGarage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<{ type: 'city' | 'group' | 'all', value: string }>({
    type: 'all',
    value: 'All'
  });
  const itemsPerPage = 10;

  const fetchList = async () => {
    try {
      // Comment out API call for demo mode
      // const response = await axiosInstance.get("/api/garages");
      // setGarages(response.data);
      // setDisplayedGarages(response.data);
      
      console.log('fetchList (demo mode)');
      
      // Demo garage data that matches IGarage interface
      const demoGarages: IGarage[] = [
        {
          id: 1,
          name: "Downtown Garage",
          address: "123 Main St, Downtown",
          city: "New York",
          province: "NY",
          postalCode: "10001",
          country: "United States",
          latitude: 40.7128,
          longitude: -74.0060,
          garageGroup: "Group A",
          operationStarts: "06:00",
          operationEnds: "22:00",
          parkingLimit: 50,
          taxRate: 8.5,
          phoneNumber: "+1-555-0101",
          googlePlaceId: "demo-place-id-1",
          organizationId: 1,
          operationDays: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: false
          }
        },
        {
          id: 2,
          name: "Airport Garage",
          address: "456 Airport Blvd",
          city: "New York",
          province: "NY",
          postalCode: "11430",
          country: "United States",
          latitude: 40.6413,
          longitude: -73.7781,
          garageGroup: "Group B",
          operationStarts: "05:00",
          operationEnds: "23:00",
          parkingLimit: 100,
          taxRate: 8.5,
          phoneNumber: "+1-555-0102",
          googlePlaceId: "demo-place-id-2",
          organizationId: 1,
          operationDays: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true
          }
        },
        {
          id: 3,
          name: "Mall Garage",
          address: "789 Shopping Center Dr",
          city: "Brooklyn",
          province: "NY",
          postalCode: "11201",
          country: "United States",
          latitude: 40.6892,
          longitude: -73.9442,
          garageGroup: "Group A",
          operationStarts: "07:00",
          operationEnds: "21:00",
          parkingLimit: 75,
          taxRate: 8.5,
          phoneNumber: "+1-555-0103",
          googlePlaceId: "demo-place-id-3",
          organizationId: 1,
          operationDays: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false
          }
        }
      ];
      
      setGarages(demoGarages);
      setDisplayedGarages(demoGarages);
    } catch (error) {
      console.error("Error fetching garages:", error);
    }
  };

  const fetchGarageGroups = async () => {
    try {
      // Comment out API call for demo mode
      // const response = await axiosInstance.get("/api/garages/groups/all");
      // setGarageGroups(response.data || []);
      
      console.log('fetchGarageGroups (demo mode)');
      
      // Demo garage groups data
      const demoGarageGroups = ["Group A", "Group B", "Group C"];
      setGarageGroups(demoGarageGroups);
    } catch (error) {
      console.error("Error fetching garage groups:", error);
      setGarageGroups([]);
    }
  };

  useEffect(() => {
    fetchList();
    fetchGarageGroups();

    // Comment out Mapbox map initialization for demo mode
    // if (!mapContainerRef.current) return;
    // const map = new mapboxgl.Map({
    //   container: mapContainerRef.current,
    //   style: 'mapbox://styles/mapbox/streets-v11',
    //   center: [customCoordinate.longitude, customCoordinate.latitude],
    //   zoom: 9,
    // });
    // map.addControl(new mapboxgl.NavigationControl());
    // map.addControl(new mapboxgl.FullscreenControl());
    // mapRef.current = map;
    // return () => map.remove();
  }, []);

  useEffect(() => {
    // Comment out map marker functionality for demo mode
    // markGarageOnMap(mapRef);

    if (cityFilters.length === 0) {
      const uniqueCities = new Set(
        garages
          .map((garage: IGarage) => garage.city)
          .filter(city => city) // Filter out undefined/null cities
      );
      setCityFilters(Array.from(uniqueCities));
    }
  }, [garages]);

  // Comment out Mapbox map marker function for demo mode
  // const markGarageOnMap = (mapRef: React.RefObject<mapboxgl.Map>) => {
  //   markersRef.current.forEach((marker) => marker.remove());
  //   markersRef.current = [];
  //   if (garages.length > 0) {
  //     const firstGarage = garages[0] as IGarage;
  //     mapRef.current!.setCenter([firstGarage.longitude, firstGarage.latitude]);
  //   }
  //   garages.forEach((garage: IGarage) => {
  //     const actualMarker = new mapboxgl.Marker(createMarkerElement())
  //       .setLngLat([garage.longitude, garage.latitude])
  //       .addTo(mapRef.current!);
  //     markersRef.current.push(actualMarker);
  //   });
  // };

  const getGarageTimeSlot = (garage: IGarage) => {
    let timeSlot = 'N/A';
    if (garage.operationStarts && garage.operationEnds)
      timeSlot = `${garage.operationStarts} - ${garage.operationEnds}`;
    return timeSlot;
  };

  const handleCityChange = (city: string) => {
    // Filter garages based on the selected city
    const filteredGarages = garages.filter(
      (garage: IGarage) => garage.city === city
    );
    // Update the displayed garages with the filtered garages
    setDisplayedGarages(filteredGarages);
    setCurrentPage(1);
    setActiveFilter({ type: 'city', value: city });
  };

  const handleGroupChange = (group: string) => {
    // Filter garages based on the selected group
    const filteredGarages = garages.filter(
      (garage: IGarage) => garage.garageGroup === group
    );
    // Update the displayed garages with the filtered garages
    setDisplayedGarages(filteredGarages);
    setCurrentPage(1);
    setActiveFilter({ type: 'group', value: group });
  };

  const handleAllGarages = () => {
    setDisplayedGarages(garages);
    setCurrentPage(1);
    setActiveFilter({ type: 'all', value: 'All' });
  };

  const handleEditGarage = (garage: IGarage) => {
    navigate(`/operations/garages/edit/${garage.id}`);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayedGarages.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(displayedGarages.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen">
      <main className="mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Garage Management
            </h1>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4 xl:w-1/5">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
              <button
                className="bg-[#0A1224] text-white w-full px-4 py-2 rounded-md flex items-center justify-center space-x-2 hover:bg-[#0A1224]/80 mb-4"
                onClick={() => navigate('/operations/garages/add')}
              >
                <PlusCircle size={20} />
                <span>Add Garage</span>
              </button>

              {/* Garage Filters */}
              <Typography
                variant="h6"
                className="font-medium text-gray-800 mb-3"
              >
                Garage Filter
              </Typography>

              <div className="flex flex-col gap-2 mt-2 mb-6">
                <Button
                  variant={activeFilter.type === 'all' ? "contained" : "outlined"}
                  color="inherit"
                  onClick={handleAllGarages}
                  className="w-full justify-start text-left normal-case px-3 py-2"
                >
                  All
                </Button>

                {cityFilters.map((city, index) => (
                  <Button
                    key={`city-${index}`}
                    variant={activeFilter.type === 'city' && activeFilter.value === city ? "contained" : "outlined"}
                    color="inherit"
                    onClick={() => handleCityChange(city)}
                    className="w-full justify-start text-left normal-case px-3 py-2"
                  >
                    {city}
                  </Button>
                ))}
              </div>

              {/* Garage Group Filters */}
              {garageGroups.length > 0 && (
                <>
                  <Typography
                    variant="h6"
                    className="font-medium text-gray-800 mb-3"
                  >
                    Garage Group Filter
                  </Typography>

                  <div className="flex flex-col gap-2 mt-2">
                    {garageGroups.map((group, index) => (
                      <Button
                        key={`group-${index}`}
                        variant={activeFilter.type === 'group' && activeFilter.value === group ? "contained" : "outlined"}
                        color="inherit"
                        onClick={() => handleGroupChange(group)}
                        className="w-full justify-start text-left normal-case px-3 py-2"
                      >
                        {group}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="w-full lg:w-3/4 xl:w-4/5">
            {/* Map container */}
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm mb-6">
              <div className="h-[300px] md:h-[350px] lg:h-[400px] w-full">
                {/* Map placeholder for demo mode */}
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-500 text-lg mb-2">🗺️</div>
                    <p className="text-gray-600">Map View</p>
                    <p className="text-sm text-gray-500">Demo Mode - {garages.length} garages loaded</p>
                  </div>
                </div>
                {/* Comment out Mapbox container for demo mode */}
                {/* <div ref={mapContainerRef} className="w-full h-full" /> */}
              </div>
            </div>

            {/* Table container */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400/50 dark:scrollbar-thumb-gray-700/50">
                <TableContainer
                  component={Paper}
                  className="min-w-full shadow-none"
                >
                  <Table>
                    <TableHead>
                      <TableRow className="bg-gray-50">
                        <TableCell className="whitespace-nowrap font-medium text-gray-500 text-sm">
                          ID
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-medium text-gray-500 text-sm">
                          Garage Name
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-medium text-gray-500 text-sm">
                          Address
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-medium text-gray-500 text-sm">
                          Contact Number
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-medium text-gray-500 text-sm">
                          Parking Limit
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-medium text-gray-500 text-sm">
                          Time Slot
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-medium text-gray-500 text-sm">
                          Group
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-medium text-gray-500 text-sm">
                          Operations
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {currentItems.map((garage: IGarage, index) => (
                        <TableRow
                          key={garage.id}
                          // Comment out map center functionality for demo mode
                          // onClick={() => {
                          //   mapRef.current!.setCenter([
                          //     garage.longitude,
                          //     garage.latitude,
                          //   ]);
                          // }}
                          onClick={() => {
                            console.log('Garage selected (demo mode):', garage.name);
                          }}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <TableCell>{indexOfFirstItem + index + 1}</TableCell>
                          <TableCell className="font-medium text-gray-800">
                            {garage.name}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {garage.address}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {garage.phoneNumber}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {garage.parkingLimit}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {getGarageTimeSlot(garage)}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {garage.garageGroup || "-"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditGarage(garage);
                              }}
                              className="text-xs py-1 px-3"
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box
                  display="flex"
                  justifyContent="center"
                  padding={2}
                  className="border-t border-gray-100 dark:border-white/[0.05]"
                >
                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </Box>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

