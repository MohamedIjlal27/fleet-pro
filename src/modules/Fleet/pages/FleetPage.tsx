import type React from 'react';
import { useState, useEffect } from 'react';
import ComponentCard from "@/components/common/ComponentCard";
import PageMeta from '@/components/common/PageMeta';
import ConstructionIcon from '@mui/icons-material/Construction';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { Checkbox } from '@mui/material';
import { useNavigate } from 'react-router';
import { fetchVehiclesWithPaging, fetchVehicleFilters } from '../apis/apis';
// import axiosInstance from '../../../utils/axiosConfig'; // Commented out for demo mode
import Button from '../../core/components/ThemeButton';
import UploadVehicleModal from '../components/Modals/UploadVehicleModal';
import UploadAssetModal from '../components/Modals/UploadAssetModal';
import car_model from '/src/assets/car_models/car_model_1_big.png';
import { toast } from 'react-toastify';
import { systemPlan, systemModule } from '@/utils/constants';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from '@/modules/core/pages/Error404Page';
import LockedFeature from '@/modules/core/components/LockedFeature';
import { Search, ChevronDown, X, Plus } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { Box } from '@mui/material';
import FleetListMobile from '../components/FleetListMobile';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";

interface FilterOptions {
  makes: string[];
  models: string[];
  trims: string[];
  statuses: { id: string; name: string }[];
  entityTypes: { id: string; name: string }[];
  garages: { id: string; name: string }[];
}

const FleetPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<any[]>([]); // Using any[] for demo mode to avoid type conflicts
  const [tempFilter, setTempFilter] = useState('');
  const [filter, setFilter] = useState('');
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openUploadAssetModal, setOpenUploadAssetModal] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<any>({
    model: [],
    make: [],
    trim: [],
    status: [],
    entityType: [],
    garage: [],
  });

  const [tempYearMin, setTempYearMin] = useState<string>('');
  const [tempYearMax, setTempYearMax] = useState<string>('');
  const [yearMin, setYearMin] = useState<number | null>(null);
  const [yearMax, setYearMax] = useState<number | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'year' | 'status' | 'entityType' | 'garage' | null>(null);

  const defaultPagin = {
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
  };
  const [pagination, setPagination] = useState(defaultPagin);

  const navigate = useNavigate();

  const [showPage, setShowPage] = useState(checkModuleExists(systemModule.Fleet));

  useEffect(() => {
    loadVehicles();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [pagination.currentPage]);

  useEffect(() => {
    reFreshTable();
  }, [selectedFilters, filter, yearMin, yearMax]);

  const reFreshTable = () => {
    setPagination((prev: any) => {
      if (prev.currentPage === defaultPagin.currentPage) {
        loadVehicles();
        return prev;
      }
      return defaultPagin;
    });
  };

  const loadVehicles = async () => {
    const getFiltersAsQueryParams = (
      filters: Record<string, string[]>,
    ): Record<string, string | undefined> => {
      return Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [
          key,
          value.length > 0 ? value.join(',') : undefined,
        ]),
      );
    };

    const filtersAsQueryParams = getFiltersAsQueryParams(selectedFilters);

    try {
      const response = await fetchVehiclesWithPaging({
        page: pagination.currentPage,
        size: pagination.perPage,
        search: filter,
        yearMin: yearMin || undefined,
        yearMax: yearMax || undefined,
        ...filtersAsQueryParams,
      });

      if (response) {
        setVehicles(response.data);
        setPagination((prev: any) => ({
          ...prev,
          currentPage: response.meta.currentPage,
          lastPage: response.meta.lastPage,
          total: response.meta.total,
        }));
      } else {
        toast.error('fetchVehicles error');
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const handlePaginationChange = (page: number) => {
    setPagination((prev: any) => ({ ...prev, currentPage: page }));
  };

  const fetchFilterOptions = async () => {
    try {
      console.log("[DEMO MODE] FleetPage fetchFilterOptions - using demo data");
      
      // Use demo data directly instead of API calls
      const filter = await fetchVehicleFilters();
      
      // Demo garages data
      const demoGarages = [
        { id: 1, name: 'Main Depot' },
        { id: 2, name: 'North Branch' }
      ];
      
      // Demo filter response data
      const demoFilterData = {
        makes: ['Ford', 'Mercedes', 'Iveco'],
        models: ['Transit', 'Sprinter', 'Daily'],
        trims: ['Base', 'Premium', 'Deluxe']
      };

      const updatedFilterOptions: FilterOptions = {
        ...demoFilterData,
        statuses: Object.entries(filter?.status || {}).map(([key, value]) => ({
          id: key,
          name: value,
        })),
        entityTypes: Object.entries(filter?.entityType || {}).map(([key, value]) => ({
          id: key,
          name: value,
        })),
        garages: demoGarages.map((garage: any) => ({
          id: garage.id,
          name: garage.name,
        })),
      };

      setFilterOptions(updatedFilterOptions);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleFilterSelection = (category: string, value: string) => {
    setSelectedFilters((prevFilters: any) => {
      const updatedCategory = prevFilters[category].includes(value)
        ? prevFilters[category].filter((item: string) => item !== value)
        : [...prevFilters[category], value];
      return { ...prevFilters, [category]: updatedCategory };
    });
  };

  const handleOpenUploadModal = () => {
    setOpenUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setOpenUploadModal(false);
  };

  const handleOpenUploadAssetModal = () => {
    setOpenUploadAssetModal(true);
  };

  const handleCloseUploadAssetModal = () => {
    setOpenUploadAssetModal(false);
  };

  // Navigate to the VehicleDetailsPage
  const handleRowClick = (id: number) => {
    navigate(`/vehicle/${id}`);
  };

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  if (!showPage) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Fleet" />
    ) : (
      <Error404Page />
    );
  }

  return (
    <>
      <PageMeta
        title="Fleet | Synops AI"
        description="This is Fleet page for Synops AI"
      />
      {/* <PageBreadcrumb pageTitle="Fleet Management" /> */}
      <div className="hidden md:block space-y-6">
        <ComponentCard
          title="Fleet Management"
          headerRight={
            <>
              <Button
                onClick={handleOpenUploadModal}
                name="Add Vehicle"
                icon={<DirectionsCarIcon />}
                style="!rounded-full"
              />
              <Button
                onClick={handleOpenUploadAssetModal}
                name="Add Asset"
                icon={<ConstructionIcon />}
                style="!rounded-full"
              />
            </>
          }
        >
          {/* Filter Bar Layout */}
          <div className="w-full px-4 md:px-0">
            {/* Search Box */}
            <div className="mb-4">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Filter by VIN or License Plate"
                  value={tempFilter}
                  onChange={(e) => setTempFilter(e.target.value)}
                  onBlur={() => setFilter(tempFilter)}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Pills Group */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Year Filter */}
                <div className="relative">
                  {(yearMin || yearMax) ? (
                    <div className="border border-gray-300 rounded-full px-3 py-1 text-sm flex items-center gap-2 cursor-pointer bg-transparent" onClick={() => setActiveFilter(activeFilter === 'year' ? null : 'year')}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setYearMin(null);
                          setYearMax(null);
                          setTempYearMin('');
                          setTempYearMax('');
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-red-100"
                      >
                        <X size={16} className="text-gray-500 hover:text-red-500" />
                      </button>
                      <span>
                        Year | <span className="text-blue-600">{yearMin ?? 'Any'}</span> - <span className="text-blue-600">{yearMax ?? 'Any'}</span>
                      </span>
                      <ChevronDown size={16} className="text-gray-500" />
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveFilter(activeFilter === 'year' ? null : 'year')}
                      className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-1 text-sm hover:border-gray-500 bg-transparent"
                    >
                      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200">
                        <Plus size={12} className="text-gray-500" />
                      </div>
                      Year
                    </button>
                  )}

                  {/* Dropdown */}
                  {activeFilter === 'year' && (
                    <div className="absolute z-10 mt-2 bg-white border rounded-md shadow-lg p-3 w-64">
                      <div className="text-gray-700 font-semibold mb-2">Filter By Year</div>
                      <div className="mb-2">
                        <input
                          type="number"
                          placeholder="Min Year"
                          value={tempYearMin}
                          onChange={(e) => setTempYearMin(e.target.value)}
                          onBlur={() => setYearMin(tempYearMin ? parseInt(tempYearMin) : null)}
                          className="w-full mb-2 px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div className="mb-2">
                        <input
                          type="number"
                          placeholder="Max Year"
                          value={tempYearMax}
                          onChange={(e) => setTempYearMax(e.target.value)}
                          onBlur={() => setYearMax(tempYearMax ? parseInt(tempYearMax) : null)}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Filter */}
                <div className="relative">
                  {selectedFilters.status.length > 0 ? (
                    <div className="border border-gray-300 rounded-full px-3 py-1 text-sm flex items-center gap-2 cursor-pointer bg-transparent" onClick={() => setActiveFilter(activeFilter === 'status' ? null : 'status')}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFilters((prev: any) => ({ ...prev, status: [] }));
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-red-100"
                      >
                        <X size={14} className="text-gray-600 hover:text-red-500" />
                      </button>
                      <span>
                        Status | <span className="text-blue-600">
                          {filterOptions?.statuses
                            .filter((status) => selectedFilters.status.includes(status.id))
                            .map((status) => status.name)
                            .join(', ') || 'None'}
                        </span>
                      </span>
                      <ChevronDown size={16} className="text-gray-500" />
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveFilter(activeFilter === 'status' ? null : 'status')}
                      className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-1 text-sm hover:border-gray-500 bg-transparent"
                    >
                      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200">
                        <Plus size={12} className="text-gray-500" />
                      </div>
                      Status
                    </button>
                  )}

                  {activeFilter === 'status' && (
                    <div className="absolute z-10 mt-2 bg-white border rounded-md shadow-lg p-3 w-64 max-h-60 overflow-y-auto">
                      <div className="text-gray-700 font-semibold mb-2">Filter By Status</div>
                      {filterOptions?.statuses.map((status) => (
                        <label key={status.id} className="flex items-center gap-2 mb-2 cursor-pointer text-sm">
                          <Checkbox
                            checked={selectedFilters.status.includes(status.id)}
                            onChange={() => handleFilterSelection('status', status.id)}
                            className="cursor-pointer"
                          />
                          {status.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Type Filter */}
                <div className="relative">
                  {selectedFilters.entityType.length > 0 ? (
                    <div className="border border-gray-300 rounded-full px-3 py-1 text-sm flex items-center gap-2 cursor-pointer bg-transparent" onClick={() => setActiveFilter(activeFilter === 'entityType' ? null : 'entityType')}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFilters((prev: any) => ({ ...prev, entityType: [] }));
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-red-100"
                      >
                        <X size={16} className="text-gray-500 hover:text-red-500" />
                      </button>
                      <span>
                        Type | <span className="text-blue-600">
                          {filterOptions?.entityTypes
                            .filter((type) => selectedFilters.entityType.includes(type.id))
                            .map((type) => type.name)
                            .join(', ') || 'None'}
                        </span>
                      </span>
                      <ChevronDown size={16} className="text-gray-500" />
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveFilter(activeFilter === 'entityType' ? null : 'entityType')}
                      className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-1 text-sm hover:border-gray-500 bg-transparent"
                    >
                      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200">
                        <Plus size={12} className="text-gray-500" />
                      </div>
                      Type
                    </button>
                  )}

                  {activeFilter === 'entityType' && (
                    <div className="absolute z-10 mt-2 bg-white border rounded-md shadow-lg p-3 w-64 max-h-60 overflow-y-auto">
                      <div className="text-gray-700 font-semibold mb-2">Filter By Type</div>
                      {filterOptions?.entityTypes.map((entityType) => (
                        <label key={entityType.id} className="flex items-center gap-2 mb-2 cursor-pointer text-sm">
                          <Checkbox
                            checked={selectedFilters.entityType.includes(entityType.id)}
                            onChange={() => handleFilterSelection('entityType', entityType.id)}
                            className="cursor-pointer"
                          />
                          {entityType.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Garage Filter */}
                <div className="relative">
                  {selectedFilters.garage.length > 0 ? (
                    <div className="border border-gray-300 rounded-full px-3 py-1 text-sm flex items-center gap-2 cursor-pointer bg-transparent" onClick={() => setActiveFilter(activeFilter === 'garage' ? null : 'garage')}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFilters((prev: any) => ({ ...prev, garage: [] }));
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-red-100"
                      >
                        <X size={16} className="text-gray-500 hover:text-red-500" />
                      </button>
                      <span>
                        Garage | <span className="text-blue-600">
                          {filterOptions?.garages
                            .filter((garage) => selectedFilters.garage.includes(garage.id))
                            .map((garage) => garage.name)
                            .join(', ') || 'None'}
                        </span>
                      </span>
                      <ChevronDown size={16} className="text-gray-500" />
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveFilter(activeFilter === 'garage' ? null : 'garage')}
                      className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-1 text-sm hover:border-gray-500 bg-transparent"
                    >
                      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200">
                        <Plus size={12} className="text-gray-500" />
                      </div>
                      Garage
                    </button>
                  )}

                  {activeFilter === 'garage' && (
                    <div className="absolute z-10 mt-2 bg-white border rounded-md shadow-lg p-3 w-64 max-h-60 overflow-y-auto">
                      <div className="text-gray-700 font-semibold mb-2">Filter By Garage</div>
                      {filterOptions?.garages.map((garage) => (
                        <label key={garage.id} className="flex items-center gap-2 mb-2 cursor-pointer text-sm">
                          <Checkbox
                            checked={selectedFilters.garage.includes(garage.id)}
                            onChange={() => handleFilterSelection('garage', garage.id)}
                            className="cursor-pointer"
                          />
                          {garage.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Clear Filters */}
              {(yearMin || yearMax || selectedFilters.garage.length || selectedFilters.status.length || selectedFilters.entityType.length) > 0 && (
                <button
                  onClick={() => {
                    setYearMin(null);
                    setYearMax(null);
                    setTempYearMin('');
                    setTempYearMax('');
                    setSelectedFilters({
                      model: [],
                      make: [],
                      trim: [],
                      status: [],
                      entityType: [],
                      garage: [],
                    });
                  }}
                  className="flex items-center gap-1 text-sm text-black hover:underline"
                >
                  <X size={16} className="text-black" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[1102px]">
                <Table>
                  {/* Table Header */}
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Vehicle Detail
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Asset Type
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Year
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        VIN/ID
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Garage
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Assign
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  {/* Table Body */}
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {vehicles.map((vehicle) => (
                      <TableRow
                        key={vehicle.id}
                        onClick={() => handleRowClick(vehicle.id)}
                      >
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 overflow-hidden rounded-full">
                              <img
                                width={40}
                                height={40}
                                src={vehicle?.coverImage || car_model}
                                alt={vehicle?.make}
                              />
                            </div>
                            <div>
                              <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {vehicle?.make} {vehicle.model}
                              </span>
                              {/* <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                {vehicle.plateNumber}
                              </span> */}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {vehicle?.entityType?.charAt(0).toUpperCase()}{vehicle?.entityType?.slice(1)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {vehicle.year}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {vehicle?.vin}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {vehicle?.garage?.name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {vehicle?.currentAssignedDriver && typeof vehicle?.currentAssignedDriver === 'object' &&
                          Object.keys(vehicle.currentAssignedDriver).length > 0
                            ? `${vehicle.currentAssignedDriver?.user?.firstName ?? ''} ${vehicle.currentAssignedDriver?.user?.lastName ?? ''}`
                            : 'No driver assigned'}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <Badge
                            size="sm"
                            color={
                              vehicle.status === "Available"
                                ? "success"
                                : vehicle.status === 'In Use' || vehicle.status === 'InUse'
                                ? "info"
                                : "warning"
                            }
                          >
                            {vehicle.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Box display="flex" justifyContent="center" padding={2}>
                <Pagination
                  totalPages={pagination.lastPage}
                  currentPage={pagination.currentPage}
                  onPageChange={handlePaginationChange}
                />
              </Box>
            </div>
          </div>
        </ComponentCard>
      </div>
      <div
        className="fixed bottom-0 z-10 bg-gradient-to-t from-white to-transparent w-full md:hidden"
        style={{
          background: 'linear-gradient(to top, white 80%, transparent)',
        }}
      >
        <div className="flex flex-row justify-center my-4 gap-4">
          <Button
            onClick={handleOpenUploadModal}
            name="Add Vehicle"
            icon={<DirectionsCarIcon />}
            style="!rounded-full"
          />
          <Button
            onClick={handleOpenUploadAssetModal}
            name="Add Asset"
            icon={<ConstructionIcon />}
            style="!rounded-full"
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row mb-14 md:mb-0 p-4 min-h-[calc(100vh-100px)] md:min-h-0">
        {/* Mobile View - Cards */}
        <FleetListMobile
          vehicles={vehicles}
          pagination={pagination}
          tempFilter={tempFilter}
          setTempFilter={setTempFilter}
          setFilter={setFilter}
          handleRowClick={handleRowClick}
          handlePaginationChange={handlePaginationChange}
          toggleFilterVisibility={toggleFilterVisibility}
          isFilterVisible={isFilterVisible}
          selectedFilters={selectedFilters}
          setYearMin={setYearMin}
          setYearMax={setYearMax}
          setTempYearMin={setTempYearMin}
          setTempYearMax={setTempYearMax}
          handleFilterSelection={handleFilterSelection}
          filterOptions={filterOptions}
          tempYearMin={tempYearMin}
          tempYearMax={tempYearMax}
          setSelectedFilters={setSelectedFilters}
        />

        <UploadVehicleModal open={openUploadModal} onClose={handleCloseUploadModal} />

        <UploadAssetModal open={openUploadAssetModal} onClose={handleCloseUploadAssetModal} />
      </div>
    </>
  );
};

export default FleetPage;
