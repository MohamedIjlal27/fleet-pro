import React, { useState, useEffect } from "react";
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
  Grid,
  Avatar,
  Tooltip,
  IconButton,
  Box,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { MaintenanceModal } from "../../MaintenanceRecord/components/Modals/MaintenanceModal";
import {
  fetchAiMaintenanceFilters,
  fetchAiMaintenances,
  aiRecommendationAction,
} from "../apis/apis";
import { toast } from "react-toastify";
import car_model from "/src/assets/car_models/car_model_1_big.png";
import { IAiMaintenance } from "../interfaces/interfaces";
import { systemPlan, systemModule } from "@/utils/constants";
import { checkModuleExists, checkPlanExists } from "@/lib/moduleUtils";
import Error404Page from "@/modules/core/pages/Error404Page";
import LockedFeature from "@/modules/core/components/LockedFeature";
import { Pagination } from "@/components/ui/pagination";

export const AiMaintenancePage: React.FC = ({}) => {
  if (!checkModuleExists(systemModule.MaintenanceAIRecommendations)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="AI Recommendation" />
    ) : (
      <Error404Page />
    );
  }

  const [loading, setLoading] = useState(false);
  // Dummy data for filters
  const [filters, setFilters] = useState({
    aiMaintenanceType: [] as string[],
    aiServiceType: [] as string[],
    aiSeverityLevel: [] as string[],
    serviceType: [] as string[],
  });

  const [filterOptions, setFilterOptions] = useState({
    aiMaintenanceType: {} as Record<string, string>,
    aiServiceType: {} as Record<string, string>,
    aiSeverityLevel: {} as Record<string, string>,
    serviceType: {} as Record<string, string>,
  });

  const [selectedAIMaintenance, setselectedAIMaintenance] =
    useState<IAiMaintenance | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const defaultPagin = {
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  };
  const [pagination, setPagination] = useState(defaultPagin);

  const [aiMaintenances, setAiMaintenances] = useState<IAiMaintenance[]>([]);

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadAiMaintenances();
  }, [pagination.currentPage]);

  useEffect(() => {
    if (
      filters.aiMaintenanceType.length === 0 &&
      filters.aiServiceType.length === 0 &&
      filters.aiSeverityLevel.length === 0
    ) {
      return; // Prevent reFreshTable when filters are empty
    }
    reFreshTable();
  }, [filters]);

  const reFreshTable = () => {
    setPagination((prev) => {
      if (prev.currentPage === defaultPagin.currentPage) {
        // If already on the first page, directly load bills
        loadAiMaintenances();
        return prev;
      }
      // Otherwise, reset pagination to the first page
      return defaultPagin;
    });
  };
  const loadFilters = async () => {
    try {
      const response = await fetchAiMaintenanceFilters();
      console.log("fetchAiMaintenanceFilters response = ", response);
      //update updatedResponse label
      const updatedResponse = {
        ...response,
        aiSeverityLevel: {
          low: `Low (< 50)`,
          medium: "Medium (50-80)",
          high: "High (> 80)",
        },
      };
      setFilterOptions(updatedResponse);
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  };

  const loadAiMaintenances = async () => {
    if (loading) return; // Prevent multiple calls
    setLoading(true); // Prevent duplicate clicks
    try {
      const response = await fetchAiMaintenances(
        pagination.currentPage,
        pagination.perPage,
        filters.aiSeverityLevel.join(","),
        filters.aiServiceType.join(","),
        filters.aiMaintenanceType.join(",")
      );
      console.log("loadAiMaintenances filters = ", filters);
      console.log("loadAiMaintenances res = ", response);
      if (response.data) {
        setAiMaintenances(response.data);
        setPagination((prev) => ({
          ...prev,
          currentPage: response.pagination.current_page,
          lastPage: Math.ceil(
            response.pagination.total_items / response.pagination.items_per_page
          ),
          total: response.pagination.total_pages,
        }));
      } else {
        toast.error("Failed to load AiMaintenances");
      }
    } catch (error) {
      console.error("Error loading AiMaintenances:", error);
      toast.error("An error occurred while fetching data.");
    } finally {
      setLoading(false); // Re-enable interaction after fetch
    }
  };

  const handleAccept = (aiMaintenance: IAiMaintenance) => {
    setselectedAIMaintenance(aiMaintenance);
    setModalOpen(true);
    console.log("Accept Recommendation", aiMaintenance);
  };

  const handleDecline = (aiMaintenance: IAiMaintenance) => {
    // call api pass decline this id
    const isConfirmed = window.confirm(
      "Are you sure you want to Declined this Recommendation?"
    );

    if (isConfirmed) {
      aiRecommendationAction(false, aiMaintenance);
      console.log("Declined Recommendation", aiMaintenance);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handlePaginationChange = (page: number) => {
    if (loading) return;
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleFilterChange = (
    filterType:
      | "aiSeverityLevel"
      | "aiServiceType"
      | "serviceType"
      | "aiMaintenanceType",
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
        title="Maintenance - AI Recommendation | Synops AI"
        description="This is Maintenance - AI Recommendation page for Synops AI"
      />
    <div className="flex flex-col md:flex-row lg:flex-row gap-4 p-4 min-h-screen">
      {/* Filters Sidebar - Responsive at different breakpoints */}
      <div className="w-full md:w-1/3 lg:w-1/5 mb-4 md:mb-0">
        <div className="bg-white rounded-xl shadow-md p-4 h-full border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <Typography
              variant="h6"
              fontWeight="bold"
              className="lg:text-base xl:text-lg"
            >
              Filter
            </Typography>
            <Button
              variant="text"
              onClick={() => {
                setFilters({
                  aiSeverityLevel: [],
                  aiServiceType: [],
                  serviceType: [],
                  aiMaintenanceType: [],
                });
                reFreshTable();
              }}
              sx={{
                textTransform: "none",
                fontSize: "10px",
                color: "#2158DB",
              }}
            >
              Clear all
            </Button>
          </div>

          {/* Recommendation Severity Filters */}
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 mb-4">
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color="#333"
              className="font-semibold text-sm lg:text-xs xl:text-sm mb-2"
            >
              Recommendation Severity
            </Typography>
            <div className="flex flex-wrap gap-2 xl:flex-col xl:gap-0">
              {Object.entries(filterOptions.aiSeverityLevel).map(
                ([key, label]) => (
                  <div
                    key={key}
                    className="min-w-[120px] md:min-w-[100px] lg:min-w-[95px] xl:min-w-full"
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={filters.aiSeverityLevel.includes(key)}
                          onChange={() =>
                            handleFilterChange("aiSeverityLevel", key)
                          }
                        />
                      }
                      label={
                        <span className="lg:text-xs xl:text-sm">{label}</span>
                      }
                      sx={{ marginBottom: "4px" }}
                    />
                  </div>
                )
              )}
            </div>
          </div>

          {/* Service Type Filters */}
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 mb-4">
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color="#333"
              className="font-semibold text-sm lg:text-xs xl:text-sm mb-2"
            >
              Service Type
            </Typography>
            <div className="flex flex-wrap gap-2 xl:flex-col xl:gap-0">
              {Object.entries(filterOptions.aiServiceType).map(
                ([key, label]) => (
                  <div
                    key={key}
                    className="min-w-[120px] md:min-w-[100px] lg:min-w-[95px] xl:min-w-full"
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={filters.aiServiceType.includes(key)}
                          onChange={() =>
                            handleFilterChange("aiServiceType", key)
                          }
                        />
                      }
                      label={
                        <span className="lg:text-xs xl:text-sm">{label}</span>
                      }
                      sx={{ marginBottom: "4px" }}
                    />
                  </div>
                )
              )}
            </div>
          </div>

          {/* AI Maintenance Type Filters */}
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color="#333"
              className="font-semibold text-sm lg:text-xs xl:text-sm mb-2"
            >
              AI Maintenance Type
            </Typography>
            <div className="flex flex-wrap gap-2 xl:flex-col xl:gap-0">
              {Object.entries(filterOptions.aiMaintenanceType).map(
                ([key, label]) => (
                  <div
                    key={key}
                    className="min-w-[120px] md:min-w-[100px] lg:min-w-[95px] xl:min-w-full"
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={filters.aiMaintenanceType.includes(key)}
                          onChange={() =>
                            handleFilterChange("aiMaintenanceType", key)
                          }
                        />
                      }
                      label={
                        <span className="lg:text-xs xl:text-sm">{label}</span>
                      }
                      sx={{ marginBottom: "4px" }}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Table Section */}
      <div className="md:w-2/3 lg:w-4/5 flex-1">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Table */}
          <div className="overflow-x-auto scrollbar-thin">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {[
                    { label: "Vehicle Detail", desc: null },
                    { label: "AI Maintenance Type", desc: null },
                    { label: "Service", desc: null },
                    { label: "Recommended Service Date", desc: null },
                    { label: "Estimated Cost", desc: null },
                    {
                      label: "Estimated Downtime",
                      desc: "Estimated downtime duration.",
                    },
                    {
                      label: "Component Health Score",
                      desc: "Health score of the vehicle or device.",
                    },
                    {
                      label: "Component Severity",
                      desc: "Severity of the maintenance recommendation.",
                    },
                    { label: "Action", desc: null },
                  ].map(({ label, desc }) => (
                    <th
                      key={label}
                      className={`px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200 bg-gray-100 ${
                        label === "Action" ? "sticky right-0 z-10 bg-white border-l border-gray-200 border-r" : ""
                      }`}
                    >
                      <div className="flex items-center">
                        <span>{label}</span>
                        {desc && (
                          <Tooltip title={desc} placement="top">
                            <IconButton size="small" sx={{ marginLeft: 0.5 }}>
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {aiMaintenances.length > 0 ? (
                  aiMaintenances.map((aiMaintenance) => (
                    <tr
                      key={aiMaintenance.recommendation_id}
                      className="hover:bg-gray-50 group"
                    >
                      {/* Vehicle Detail */}
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <Avatar
                              src={
                                aiMaintenance.vehicle.coverImage || car_model
                              }
                              className="h-10 w-10 rounded-full"
                            />
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900">
                              {aiMaintenance.vehicle.make}{" "}
                              {aiMaintenance.vehicle.model}{" "}
                              {aiMaintenance.vehicle.year}
                            </div>
                            <div className="text-sm text-gray-500">
                              {aiMaintenance.vehicle.color}
                            </div>
                            <div className="text-sm text-gray-500">
                              {aiMaintenance.vehicle.plateNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* AI Maintenance Type */}
                      <td className="px-2 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm ${
                            aiMaintenance.maintenance_type === "predictive"
                              ? "text-blue-600"
                              : "text-gray-900"
                          }`}
                        >
                          {aiMaintenance.maintenance_type}
                        </span>
                      </td>

                      {/* Service */}
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                        {aiMaintenance.service_type}
                      </td>

                      {/* Recommended Service Date */}
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                        {aiMaintenance.maintenance_type === "preventive" &&
                        aiMaintenance.preventive_maintenance_date
                          ? aiMaintenance.preventive_maintenance_date
                          : aiMaintenance.maintenance_type === "predictive" &&
                            aiMaintenance.predictive_downtime_date
                          ? aiMaintenance.predictive_downtime_date
                          : "N/A"}
                      </td>

                      {/* Estimated Cost */}
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${aiMaintenance.estimated_cost}
                      </td>

                      {/* Estimated Downtime */}
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                        {aiMaintenance.expected_downtime}
                      </td>

                      {/* Vehicle Health Score */}
                      <td className="px-2 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm ${
                            aiMaintenance.health_score > 80
                              ? "text-green-600"
                              : aiMaintenance.health_score > 50
                              ? "text-orange-500"
                              : "text-red-600"
                          }`}
                        >
                          {aiMaintenance.health_score}
                        </span>
                      </td>

                      {/* Recommendation Severity */}
                      <td className="px-2 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm ${
                            aiMaintenance.severity_score < 50
                              ? "text-green-600"
                              : aiMaintenance.severity_score < 80
                              ? "text-orange-500"
                              : "text-red-600"
                          }`}
                        >
                          {aiMaintenance.severity_score}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-2 py-4 whitespace-nowrap text-sm font-medium sticky right-0 z-10 bg-white border-l border-gray-200 border-r group-hover:bg-gray-50">
                        <div className="flex flex-col sm:flex-row gap-1">
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            onClick={() => handleAccept(aiMaintenance)}
                            className="min-w-[70px] hover:bg-green-50"
                            sx={{
                              '&:hover': {
                                backgroundColor: '#4caf50', // Green hover
                                color: '#fff',
                              },
                            }}
                            title="Accept this maintenance recommendation"
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => handleDecline(aiMaintenance)}
                            className="min-w-[70px] hover:bg-red-50"
                            sx={{
                              '&:hover': {
                                backgroundColor: '#f44336', // Red hover
                                color: '#fff',
                              },
                            }}
                            title="Decline this recommendation"
                          >
                            Decline
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      {loading
                        ? "Loading recommendations..."
                        : "No maintenance recommendations found."}
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

      {/* Modal */}
      <MaintenanceModal
        open={isModalOpen}
        onClose={handleModalClose}
        mode="AiCreate"
        vehicle={selectedAIMaintenance?.vehicle}
        aiMaintenance={selectedAIMaintenance}
      />
    </div>
    </>
  );
};
