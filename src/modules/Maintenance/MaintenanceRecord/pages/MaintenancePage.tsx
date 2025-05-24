import React, { useEffect, useState } from 'react';
import PageMeta from '@/components/common/PageMeta';
import {
  Typography,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Grid2 as Grid,
  Avatar,
} from '@mui/material';
import { MaintenanceModal } from '../components/Modals/MaintenanceModal';
import { fetchMaintenanceOptions, fetchMaintenances } from '../apis/apis';
import { IMaintenanceDetail } from '../interfaces/interfaces';
import { systemPlan, systemModule } from '@/utils/constants';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from '@/modules/core/pages/Error404Page';
import LockedFeature from '@/modules/core/components/LockedFeature';
import { Pagination } from '@/components/ui/pagination';

interface MaintenancePagePros {
  isEdit?: boolean;
  vehicleId?: number;
  status?: string[];
  onRefresh?: (fn: () => void) => void; // Callback to pass refresh function
}

export const MaintenancePage: React.FC<MaintenancePagePros> = ({
  isEdit = true,
  vehicleId = null,
  status = [],
  onRefresh,
}) => {
  if (!checkModuleExists(systemModule.MaintenanceWorkOrder)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Work Order" />
    ) : (
      <Error404Page />
    );
  }

  const [filters, setFilters] = useState({
    status: status as string[],
    serviceType: [] as string[],
  });
  const [filterOptions, setFilterOptions] = useState({
    status: {} as Record<string, string>, // Key-value pairs from the API
    serviceType: {} as Record<string, string>,
  });
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<IMaintenanceDetail | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const defaultPagin = {
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  };
  const [pagination, setPagination] = useState(defaultPagin);
  const [loading, setLoading] = useState<boolean>(true);
  const [maintenances, setMaintenances] = useState<IMaintenanceDetail[]>([]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const response = await fetchMaintenanceOptions();
        setFilterOptions(response);
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };
    loadMaintenances();
    loadFilters();
  }, []);

  useEffect(() => {
    loadMaintenances();
  }, [pagination.currentPage]);

  useEffect(() => {
    reFreshTable();
  }, [filters]);

  const reFreshTable = () => {
    setPagination((prev) => {
      if (prev.currentPage === defaultPagin.currentPage) {
        // If already on the first page, directly load bills
        loadMaintenances();
        return prev;
      }
      // Otherwise, reset pagination to the first page
      return defaultPagin;
    });
  };

  useEffect(() => {
    if (onRefresh) {
      onRefresh(() => reFreshTable());
    }
  }, [onRefresh]);

  const loadMaintenances = async () => {
    try {
      setLoading(true);
      const response = await fetchMaintenances(
        pagination.currentPage,
        pagination.perPage,
        vehicleId,
        filters.status.join(','),
        filters.serviceType.join(',')
      );

      if (!response) {
        console.error('Invalid API response', response);
        return;
      }
      const data = response.data;

      // Transform the response to match the Maintenance interface
      const transformedData: IMaintenanceDetail[] = data.map((item: any) => ({
        id: item.id,
        carId: item.carId,
        userId: item.userId,
        plateNumber: item.vehicle.plateNumber,
        startTime: item.startTime,
        statusName: item.statusName,
        serviceTypeName: item.serviceTypeName,
        work_shop: item.work_shop,
        coverImage: item.vehicle.coverImage,
        make: item.vehicle.make,
        model: item.vehicle.model,
        year: item.vehicle.year,
        color: item.vehicle.color,
        status: item.status,
        serviceType: item.serviceType,
        amount: item.amount,
        notes: item.notes,
        service_detail: item.service_detail,
        estimated_cost: item.estimated_cost,
        practical_cost: item.practical_cost,
        paid_date: item.paid_date,
        paid_resource: item.paid_resource,
        maintenanceRecordFiles: item.maintenanceRecordFiles,
        repairEta: item.repairEta,
        endTime: item.endTime,
      }));

      setPagination((prev) => ({
        ...prev,
        currentPage: response.meta.currentPage,
        lastPage: response.meta.lastPage,
        total: response.meta.total,
      }));
      setMaintenances(transformedData);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleRowClick = (maintenance: IMaintenanceDetail) => {
    if (!isEdit) {
      return;
    }
    setSelectedMaintenance(maintenance);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    loadMaintenances();
    setModalOpen(false);
  };

  const handleFilterChange = (
    filterType: 'status' | 'serviceType',
    value: string
  ) => {
    setFilters((prevFilters) => {
      const filterValues = prevFilters[filterType];
      const isSelected = filterValues.includes(value);

      return {
        ...prevFilters,
        [filterType]: isSelected
          ? filterValues.filter((item) => item !== value)
          : [...filterValues, value],
      };
    });
  };

  return (
    <>
      <PageMeta
        title="Maintenance - Work Order | Synops AI"
        description="This is Maintenance - Work Order page for Synops AI"
      />
      <div className="flex flex-col md:flex-row lg:flex-row gap-4 p-4 bg-[#f9f9f9]">
        {/* Filters Sidebar - Responsive at different breakpoints */}
        {isEdit && (
          <div className="w-full md:w-1/3 lg:w-1/5 mb-4 md:mb-0">
            <div className="bg-white rounded-xl shadow-md p-4 h-full border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <Typography variant="h6" fontWeight="bold">
                  Filter
                </Typography>
                <Button
                  variant="text"
                  onClick={() => setFilters({ status: [], serviceType: [] })}
                  sx={{
                    textTransform: 'none',
                    fontSize: '10px',
                    color: '#2158DB',
                  }}
                >
                  Clear all
                </Button>
              </div>

              {/* Status Filters */}
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 mb-4">
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="#333"
                  className="font-semibold text-sm mb-2"
                >
                  Status
                </Typography>
                <div className="flex flex-col gap-2">
                  {Object.entries(filterOptions.status).map(([key, label]) => (
                    <FormControlLabel
                      key={key}
                      control={
                        <Checkbox
                          size="small"
                          checked={filters.status.includes(key)}
                          onChange={() => handleFilterChange('status', key)}
                        />
                      }
                      label={<Typography variant="body2">{label}</Typography>}
                    />
                  ))}
                </div>
              </div>

              {/* Service Type Filters */}
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="#333"
                  className="font-semibold text-sm mb-2"
                >
                  Service Type
                </Typography>
                <div className="flex flex-col gap-2">
                  {Object.entries(filterOptions.serviceType).map(
                    ([key, label]) => (
                      <FormControlLabel
                        key={key}
                        control={
                          <Checkbox
                            size="small"
                            checked={filters.serviceType.includes(key)}
                            onChange={() =>
                              handleFilterChange('serviceType', key)
                            }
                          />
                        }
                        label={<Typography variant="body2">{label}</Typography>}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Records Table */}
        <div className="md:w-2/3 lg:w-4/5 flex-1">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Table */}
            <div className="overflow-x-auto scrollbar-thin">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    {[
                      'Make/Model',
                      'Plate Number',
                      'Start Date',
                      'Service',
                      'Status',
                      'Body Shop Location',
                    ].map((heading) => (
                      <th
                        key={heading}
                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          heading === 'Make/Model' ? 'min-w-[200px]' : ''
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {maintenances.length > 0 ? (
                    maintenances.map((maintenance) => (
                      <tr
                        key={maintenance.id}
                        onClick={() => handleRowClick(maintenance)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <Avatar
                                src={maintenance.coverImage}
                                sx={{ width: 48, height: 48 }}
                                className="rounded-full"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {maintenance.make} {maintenance.model}
                              </div>
                              <div className="text-sm text-gray-500">
                                {maintenance.year} | {maintenance.color}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {maintenance.plateNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {maintenance.startTime.split('T')[0]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {maintenance.serviceTypeName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700">
                            {maintenance.statusName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {maintenance.work_shop}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        {loading
                          ? 'Loading maintenance records...'
                          : 'No maintenance records found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center p-4">
              <Pagination
                totalPages={pagination.lastPage}
                currentPage={pagination.currentPage}
                onPageChange={handlePaginationChange}
              />
            </div>
          </div>
        </div>

        {/* Modal - Keep as is since it's a component */}
        <MaintenanceModal
          open={isModalOpen}
          onClose={handleModalClose}
          mode="Edit"
          maintenanceData={selectedMaintenance}
        />
      </div>
    </>
  );
};
