import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  InputBase,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router";
import { fetchOrders, fetchOrdersFilters } from "../apis/apis";
import { IOrder } from "../interfaces/interfaces";
import { systemPlan, systemModule } from "@/utils/constants";
import { checkModuleExists, checkPlanExists } from "@/lib/moduleUtils";
import Error404Page from "@/modules/core/pages/Error404Page";
import LockedFeature from "@/modules/core/components/LockedFeature";
import { Pagination } from "@/components/ui/pagination";

interface OrdersPagePros {
  isEdit?: boolean;
  customerId?: number;
  onRefresh?: (fn: () => void) => void; // Callback to pass refresh function
}

export const OrdersPage: React.FC<OrdersPagePros> = ({
  isEdit = true,
  customerId = null,
  onRefresh,
}) => {
  if (!checkModuleExists(systemModule.Orders)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Orders" />
    ) : (
      <Error404Page />
    );
  }

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<IOrder[]>([]); // Orders from API
  const [filters, setFilters] = useState({
    status: [] as string[], // Keys of statuses selected
  });
  const [statusFilterOptions, setStatusFilterOptions] = useState<
    { key: string; label: string }[]
  >([]); // Status filter options from API
  const defaultPagin = {
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  };
  const [pagination, setPagination] = useState(defaultPagin);
  const [loading, setLoading] = useState(false);

  // Load  filters
  useEffect(() => {
    loadFilters();
  }, []);

  // Load orders
  useEffect(() => {
    loadOrders();
  }, [pagination.currentPage]); // Reload when pagination or filters change

  useEffect(() => {
    reFreshTable();
  }, [filters]);

  useEffect(() => {
    if (onRefresh) {
      onRefresh(() => reFreshTable());
    }
  }, [onRefresh]);

  const reFreshTable = () => {
    setPagination((prev) => {
      if (prev.currentPage === defaultPagin.currentPage) {
        // If already on the first page, directly load bills
        loadFilters();
        return prev;
      }
      // Otherwise, reset pagination to the first page
      return defaultPagin;
    });
  };

  const loadFilters = async () => {
    try {
      const response = await fetchOrdersFilters();
      if (response && response.status) {
        const statusOptions = Object.entries(response.status).map(
          ([key, label]) => ({
            key,
            label: String(label), // Ensure label is treated as a string
          })
        );
        setStatusFilterOptions(statusOptions);
      }
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const statusKeys = filters.status.join(","); // Convert selected statuses to comma-separated string
      const response = await fetchOrders(
        pagination.currentPage,
        pagination.perPage,
        statusKeys,
        customerId
      );
      if (response) {
        setOrders(response.data);
        setPagination((prev) => ({
          ...prev,
          currentPage: response.meta.currentPage,
          lastPage: response.meta.lastPage,
          total: response.meta.total,
        }));
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType: "status", value: string) => {
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

  const handlePaginationChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleDetailsClick = (orderId: number) => {
    navigate(`/orderDetails/${orderId}`);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredOrders = orders.filter((order) =>
    searchQuery.trim()
      ? order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toString().includes(searchQuery)
      : true
  );

  return (
    <div className="flex flex-col md:flex-row lg:flex-row gap-4 p-4 bg-[#f9f9f9] min-h-screen">
      {/* Filters Sidebar - Responsive at different breakpoints */}
      {isEdit && (
        <div className="w-full md:w-1/3 lg:w-1/4 mb-4 md:mb-0">
          <div className="bg-white rounded-xl shadow-md p-4 h-full border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6" fontWeight="bold">
                Filter
              </Typography>
              <Button
                variant="text"
                onClick={() => {
                  setFilters({ status: [] }); // Reset filters
                  setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset pagination to the first page
                  loadOrders(); // Reload orders without filters
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

            {/* Search box in filter section */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <InputBase
                  placeholder="Customer Name or Order ID"
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

            {/* Status Filters */}
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
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
                {statusFilterOptions.map(({ key, label }) => (
                  <div
                    key={key}
                    className="min-w-[120px] md:min-w-[100px] lg:min-w-[120px]"
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={filters.status.includes(key)}
                          onChange={() => handleFilterChange("status", key)}
                        />
                      }
                      label={<Typography variant="body2">{label}</Typography>}
                      sx={{ marginBottom: "4px" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="md:w-2/3 lg:w-3/4 flex-1">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Table */}
          <div className="overflow-x-auto scrollbar-thin">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {[
                    "Order ID",
                    "Date",
                    "Time",
                    "Customer",
                    "Make/Model",
                    "Location",
                    "Plan",
                    "Status",
                    "",
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
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.vehicle.make} {order.vehicle.model}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.plan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleDetailsClick(order.id)}
                          sx={{
                            textTransform: "none",
                            fontSize: "12px",
                            padding: "4px 8px",
                            backgroundColor: "#000",
                            "&:hover": { backgroundColor: "#1E50C0" },
                          }}
                        >
                          Details &gt;
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {loading ? "Loading orders..." : "No orders found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Box display="flex" justifyContent="center" padding={2}>
            <Pagination
              totalPages={pagination.lastPage}
              currentPage={pagination.currentPage}
              onPageChange={handlePaginationChange}
            />
          </Box>
        </div>
      </div>
    </div>
  );
};