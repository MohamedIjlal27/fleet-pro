import React, { useState, useEffect } from "react";
import {
  Checkbox,
  FormControlLabel,
  Grid,
  Avatar,
  Chip,
  InputBase,
  Typography,
  Button,
} from "@mui/material";
import { fetchTasks, fetchTaskFilters } from "../apis/apis";
import car_model from "/src/assets/car_models/car_model_1_big.png";
import { IRequest } from "../interfaces/interfaces";
import { systemPlan, systemModule } from "@/utils/constants";
import { checkModuleExists, checkPlanExists } from "@/lib/moduleUtils";
import Error404Page from "@/modules/core/pages/Error404Page";
import LockedFeature from "@/modules/core/components/LockedFeature";
import RequestDetailDialog from "../components/RequestDeatailDialog";
import { Pagination } from "@/components/ui/pagination";
import { Search } from "lucide-react";

interface RequestsPagePros {
  isEdit?: boolean;
  customerId?: number;
  onRefresh?: (fn: () => void) => void; // Callback to pass refresh function
}

export const RequestsPage: React.FC<RequestsPagePros> = ({
  isEdit = true,
  customerId = null,
  onRefresh,
}) => {
  if (!checkModuleExists(systemModule.Requests)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Requests" />
    ) : (
      <Error404Page />
    );
  }

  const defualtFilter = {
    type: [] as string[],
    status: [] as string[],
    initiatorType: [] as string[],
  };

  // State for filters
  const [filters, setFilters] = useState(defualtFilter);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [filterOptions, setFilterOptions] = useState({
    type: {} as Record<number, string>,
    status: {} as Record<number, string>,
    initiatorType: {} as Record<number, string>,
  });

  // State for pagination
  const defaultPagin = {
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
  };
  const [pagination, setPagination] = useState(defaultPagin);

  // Dummy data for table tasks
  const [tasks, setTasks] = useState<IRequest[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"Create" | "Edit">("Create");
  const [selectedRequest, setSelectedRequest] = useState<IRequest | null>(null);

  useEffect(() => {
    loadData();
    loadFilters();
    setSelectedRequest(null);
  }, []);

  useEffect(() => {
    loadData();
  }, [pagination.currentPage]);

  useEffect(() => {
    reFreshTable();
  }, [filters]);

  useEffect(() => {
    if (onRefresh) {
      onRefresh(() => reFreshTable());
    }
  }, [onRefresh]);

  // Load data
  const loadData = async () => {
    try {
      const response = await fetchTasks(
        pagination.currentPage,
        pagination.perPage,
        filters.type.join(","),
        filters.status.join(","),
        filters.initiatorType.join(","),
        customerId
      );
      if (response) {
        setTasks(response.data);
        setPagination((prev) => ({
          ...prev,
          currentPage: response.meta.currentPage,
          lastPage: response.meta.lastPage,
          total: response.meta.total,
        }));
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const loadFilters = async () => {
    try {
      const response = await fetchTaskFilters();
      setFilterOptions(response);
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  };

  const reFreshTable = () => {
    setPagination((prev) => {
      if (prev.currentPage === defaultPagin.currentPage) {
        // If already on the first page, directly load bills
        loadData();
        return prev;
      }
      // Otherwise, reset pagination to the first page
      return defaultPagin;
    });
  };

  // Handle filter changes
  const handleFilterChange = (
    filterType: "type" | "status" | "initiatorType",
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

  // Handle pagination change
  const handlePaginationChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleRowClick = (selectedRequest: IRequest) => {
    setModalMode("Edit");
    setSelectedRequest(selectedRequest);
    setModalOpen(true);
  };

  const toggleMobileFilters = () => {
    setShowFiltersMobile(!showFiltersMobile);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filter tasks based on search query
  const filteredTasks = tasks.filter((task) =>
    searchQuery.trim()
      ? task.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.id.toString().includes(searchQuery)
      : true
  );

  return (
    <div className="min-h-screen bg-[#f9f9f9] p-4">
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Requests</h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Filters Sidebar - Responsive with improved width control */}
        {isEdit && (
          <div className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 mb-4 md:mb-0">
            <div className="bg-white rounded-xl shadow-md p-4 h-full border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <Typography variant="h6" fontWeight="bold">
                  Filters
                </Typography>
                <Button
                  variant="text"
                  onClick={() => setFilters(defualtFilter)}
                  sx={{
                    textTransform: "none",
                    fontSize: "10px",
                    color: "#2158DB",
                  }}
                >
                  Clear all
                </Button>
              </div>

              {/* Search box in filter section */}
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <InputBase
                    placeholder="Customer Name or ID"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    sx={{
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      padding: "8px 16px 8px 40px",
                      width: "100%",
                    }}
                  />
                </div>
              </div>

              {/* Filter Type */}
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 mb-3">
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  marginBottom="8px"
                  color="#333"
                  className="font-semibold text-sm mb-2"
                >
                  Type
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filterOptions.type).map(([key, label]) => (
                    <div
                      key={key}
                      className="md:min-w-[100%] lg:min-w-[100%] xl:min-w-[100%]"
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={filters.type.includes(key)}
                            onChange={() => handleFilterChange("type", key)}
                          />
                        }
                        label={<span className="text-sm">{label}</span>}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Filter Status */}
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 mb-3">
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  marginBottom="8px"
                  color="#333"
                  className="font-semibold text-sm mb-2"
                >
                  Status
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filterOptions.status).map(([key, label]) => (
                    <div
                      key={key}
                      className="md:min-w-[100%] lg:min-w-[100%] xl:min-w-[100%]"
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={filters.status.includes(key)}
                            onChange={() => handleFilterChange("status", key)}
                          />
                        }
                        label={<span className="text-sm">{label}</span>}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Filter Initiator Type */}
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  marginBottom="8px"
                  color="#333"
                  className="font-semibold text-sm mb-2"
                >
                  Initiator Type
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filterOptions.initiatorType).map(
                    ([key, label]) => (
                      <div
                        key={key}
                        className="md:min-w-[100%] lg:min-w-[100%] xl:min-w-[100%]"
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="small"
                              checked={filters.initiatorType.includes(key)}
                              onChange={() =>
                                handleFilterChange("initiatorType", key)
                              }
                            />
                          }
                          label={<span className="text-sm">{label}</span>}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Content - Expanded for large screens */}
        <div className="md:w-2/3 lg:w-3/4 xl:w-4/5 2xl:w-5/6 flex-1">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    {[
                      "Request ID",
                      "Date",
                      "Request",
                      "Request By",
                      "Made/Model",
                      "Schedule Date",
                      "Status",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <tr
                        key={task.id}
                        onClick={() => handleRowClick(task)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {task.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(task.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {task.typeName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <span className="text-gray-900">
                              {task.customerName}
                            </span>
                            {task.initiatorTypeName === "Customer" && (
                              <Chip
                                label={task.initiatorTypeName}
                                color="primary"
                                size="small"
                                className="ml-2"
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.vehicle ? (
                            <div className="flex items-center space-x-3">
                              <Avatar
                                src={task.vehicle.coverImage || car_model}
                                sx={{ width: 40, height: 40 }}
                                className="rounded-full"
                              />
                              <div>
                                <p className="text-gray-900 font-medium">
                                  {task.vehicle.make} {task.vehicle.model}{" "}
                                  {task.vehicle.year}
                                </p>
                                <p className="text-gray-500">
                                  {task.vehicle.color}
                                </p>
                                <p className="text-xs">
                                  {task.vehicle.plateNumber}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-red-500">
                              Swapped or Deleted
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(task.scheduleDate).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                              task.statusName === "Completed"
                                ? "bg-green-100 text-green-800"
                                : task.statusName === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : task.statusName === "Canceled"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {task.statusName}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center p-4 border-t">
              <Pagination
                totalPages={pagination.lastPage}
                currentPage={pagination.currentPage}
                onPageChange={handlePaginationChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Request Detail Dialog */}
      <RequestDetailDialog
        isOpen={isModalOpen}
        onClose={handleModalClose}
        task={selectedRequest as any}
        loadData={loadData}
      />
    </div>
  );
};

export default RequestsPage;