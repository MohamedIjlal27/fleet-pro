'use client';

import type React from 'react';
import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import FleetListItemMobile from './FleetListItemMobile';
import type { IVehicle } from '@/modules/core/interfaces/interfaces';
import { Tune } from '@mui/icons-material';

interface FilterOptions {
  makes: string[];
  models: string[];
  trims: string[];
  statuses: { id: string; name: string }[];
  garages: { id: string; name: string }[];
}

interface FleetListMobileProps {
  vehicles: IVehicle[];
  pagination: {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
  };
  tempFilter: string;
  setTempFilter: (value: string) => void;
  setFilter: (value: string) => void;
  handleRowClick: (id: number) => void;
  handlePaginationChange: (page: number) => void;
  toggleFilterVisibility: () => void;
  handleFilterSelection: (category: string, value: string) => void;
  setYearMin: (value: React.SetStateAction<number | null>) => void;
  setYearMax: (value: React.SetStateAction<number | null>) => void;
  setTempYearMax: (value: React.SetStateAction<string>) => void;
  setTempYearMin: (value: React.SetStateAction<string>) => void;
  isFilterVisible: boolean;
  filterOptions: FilterOptions | null;
  selectedFilters: {
    model: string[];
    make: string[];
    trim: string[];
    status: string[];
    garage: string[];
  };
  tempYearMin: string;
  tempYearMax: string;
  setSelectedFilters: (value: any) => void;
}

const FleetListMobile: React.FC<FleetListMobileProps> = ({
  vehicles,
  pagination,
  tempFilter,
  setTempFilter,
  setFilter,
  handleRowClick,
  handlePaginationChange,
  toggleFilterVisibility,
  handleFilterSelection,
  setYearMin,
  setYearMax,
  setTempYearMax,
  setTempYearMin,
  isFilterVisible,
  filterOptions,
  selectedFilters,
  tempYearMin,
  tempYearMax,
  setSelectedFilters,
}) => {
  const [expandedVehicleId, setExpandedVehicleId] = useState<number | null>(null);

  const [activeFilterTab, setActiveFilterTab] = useState<'status' | 'type' | 'garage' | 'year'>(
    'status',
  );
  const [selectedVehicleType, setSelectedVehicleType] = useState<boolean>(false);
  const [selectedAssetType, setSelectedAssetType] = useState<boolean>(false);

  const toggleExpand = (vehicleId: number) => {
    setExpandedVehicleId(expandedVehicleId === vehicleId ? null : vehicleId);
  };

  const handleAllStatusToggle = () => {
    if (selectedFilters.status.length === 0) {
      // If all are already deselected, select all
      if (filterOptions?.statuses) {
        const allStatusIds = filterOptions.statuses.map((status) => status.id);
        handleMultipleFilterSelection('status', allStatusIds);
      }
    } else {
      // Deselect all
      handleMultipleFilterSelection('status', []);
    }
  };

  const handleAllGaragesToggle = () => {
    if (selectedFilters.garage.length === 0) {
      // If all are already deselected, select all
      if (filterOptions?.garages) {
        const allGarageIds = filterOptions.garages.map((garage) => garage.id);
        handleMultipleFilterSelection('garage', allGarageIds);
      }
    } else {
      // Deselect all
      handleMultipleFilterSelection('garage', []);
    }
  };

  const handleAllTypesToggle = () => {
    setSelectedVehicleType(false);
    setSelectedAssetType(false);
  };

  const handleMultipleFilterSelection = (category: string, values: string[]) => {
    // This is a new function to handle setting multiple filter values at once
    if (category === 'status') {
      setSelectedFilters((prev: typeof selectedFilters) => ({
        ...prev,
        status: values,
      }));
    } else if (category === 'garage') {
      setSelectedFilters((prev: typeof selectedFilters) => ({
        ...prev,
        garage: values,
      }));
    }
  };

  const applyFilters = () => {
    // Currently, on change all filters are applied if we want to apply only on click of the button
    // This function will be called when the "Apply Filter" button is clicked
    console.log('Applying filters:', {
      status: selectedFilters.status,
      garage: selectedFilters.garage,
      vehicleType: selectedVehicleType,
      assetType: selectedAssetType,
      yearMin: tempYearMin ? Number.parseInt(tempYearMin, 10) : null,
      yearMax: tempYearMax ? Number.parseInt(tempYearMax, 10) : null,
    });
  };

  return (
    <div className="md:hidden">
      {/* Start */}

      <div className="flex items-center mb-4 gap-2">
        {/* Search input row */}
        <div className="relative flex-1">
          <div className="flex items-center border border-gray-100 bg-gray-50 rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="text"
              value={tempFilter}
              onChange={(e) => setTempFilter(e.target.value)}
              onBlur={() => setFilter(tempFilter)}
              className="flex-1 outline-none bg-muted text-foreground rounded-lg focus:outline-none"
              placeholder="Search vehicles..."
            />
            {tempFilter && (
              <button onClick={() => setTempFilter('')} className="focus:outline-none ml-1">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Filter button */}
        <div
          onClick={toggleFilterVisibility}
          className="flex items-center p-2 bg-gray-50 border border-gray-100 rounded-lg"
        >
          <Tune className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterVisible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={toggleFilterVisibility}></div>

          {/* Filter Content */}
          <div className="relative bg-white w-full h-fit rounded-t-3xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-medium">Filter</h2>
              <button
                onClick={toggleFilterVisibility}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="w-[30%] border-r">
                <div
                  className={`py-4 px-6 font-medium ${
                    activeFilterTab === 'status' ? 'text-blue-500 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setActiveFilterTab('status')}
                >
                  Status
                </div>
                <div
                  className={`py-4 px-6 font-medium ${
                    activeFilterTab === 'type' ? 'text-blue-500 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setActiveFilterTab('type')}
                >
                  Type
                </div>
                <div
                  className={`py-4 px-6 font-medium ${
                    activeFilterTab === 'garage' ? 'text-blue-500 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setActiveFilterTab('garage')}
                >
                  Garage
                </div>
                <div
                  className={`py-4 px-6 font-medium ${
                    activeFilterTab === 'year' ? 'text-blue-500 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setActiveFilterTab('year')}
                >
                  Year
                </div>
              </div>

              {/* Filter Options */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* Status Options */}
                {activeFilterTab === 'status' && filterOptions && (
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        checked={selectedFilters.status.length === 0}
                        onChange={() => handleAllStatusToggle()}
                      />
                      <span>All Status</span>
                    </label>

                    {filterOptions.statuses.map((status) => (
                      <label key={status.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                          checked={selectedFilters.status.includes(status.id)}
                          onChange={() => handleFilterSelection('status', status.id)}
                        />
                        <span>{status.name}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Type Options */}
                {activeFilterTab === 'type' && (
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        checked={!selectedVehicleType && !selectedAssetType}
                        onChange={() => handleAllTypesToggle()}
                      />
                      <span>All equipments</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        checked={selectedVehicleType}
                        onChange={() => setSelectedVehicleType(!selectedVehicleType)}
                      />
                      <span>Vehicle</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        checked={selectedAssetType}
                        onChange={() => setSelectedAssetType(!selectedAssetType)}
                      />
                      <span>Assets</span>
                    </label>
                  </div>
                )}

                {/* Garage Options */}
                {activeFilterTab === 'garage' && filterOptions && (
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        checked={selectedFilters.garage.length === 0}
                        onChange={() => handleAllGaragesToggle()}
                      />
                      <span>All Garages</span>
                    </label>

                    {filterOptions.garages.map((garage) => (
                      <label key={garage.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                          checked={selectedFilters.garage.includes(garage.id)}
                          onChange={() => handleFilterSelection('garage', garage.id)}
                        />
                        <span>{garage.name}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Year Options */}
                {activeFilterTab === 'year' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min</label>
                      <input
                        type="number"
                        placeholder="Min Year"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        value={tempYearMin}
                        onChange={(e) => setTempYearMin(e.target.value)}
                        onBlur={() =>
                          setYearMin(tempYearMin ? Number.parseInt(tempYearMin, 10) : null)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max</label>
                      <input
                        type="number"
                        placeholder="Max Year"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        value={tempYearMax}
                        onChange={(e) => setTempYearMax(e.target.value)}
                        onBlur={() =>
                          setYearMax(tempYearMax ? Number.parseInt(tempYearMax, 10) : null)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Apply Button */}
            <div className="p-4 border-t">
              <button
                className="w-full py-4 bg-[#0a1e3c] text-white rounded-full font-medium text-lg"
                onClick={() => {
                  applyFilters();
                  toggleFilterVisibility();
                }}
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Equipment ({pagination.total})</h2>
      </div>

      <div className="space-y-3">
        {vehicles.map((vehicle) => (
          <FleetListItemMobile
            key={vehicle.id}
            vehicle={vehicle}
            expanded={expandedVehicleId === vehicle.id}
            onToggle={() => toggleExpand(vehicle.id)}
            onCardClick={() => handleRowClick(vehicle.id)}
          />
        ))}
      </div>

      {/* Pagination for mobile */}
      <div className="mt-4 flex justify-center">
        <Pagination
          totalPages={pagination.lastPage}
          currentPage={pagination.currentPage}
          onPageChange={handlePaginationChange}
        />
      </div>
    </div>
  );
};

export default FleetListMobile;
