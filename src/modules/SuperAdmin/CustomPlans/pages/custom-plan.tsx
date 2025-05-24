import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchCustomPlans } from '../apis/apis';
import AddCustomPlanModal from '../components/AddCustomPlanModal';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import { systemPlan, systemModule } from '@/utils/constants';
import Error404Page from '@/modules/core/pages/Error404Page';
import LockedFeature from '@/modules/core/components/LockedFeature';

// Main App Component
const FleetManagementApp = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);

  const openAddModal = () => {
    setCurrentPlan(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (plan) => {
    setCurrentPlan(plan); // Set the plan to be edited
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setCurrentPlan(null);
  };

  const handleSavePlan = () => {
    // Refresh plan list
    if (customPlansList && customPlansList.current) {
      customPlansList.current.fetchPlans();
    }
  };

  const customPlansList = React.useRef(null);

  return (
    <div className="bg-gray-50 min-h-screen">
      <CustomPlansList
        ref={customPlansList}
        onCreateNewPlan={openAddModal}
        onEditPlan={openEditModal}
      />
      <AddCustomPlanModal
        open={isAddModalOpen}
        handleClose={closeAddModal}
        onSave={handleSavePlan}
        existingPlan={currentPlan}
      />
    </div>
  );
};

interface CustomPlan {
  id: number;
  name: string;
  description: string;
  amount: number;
  chargeDuration?: string;
  basicPlan: {
    id: string;
    name: string;
  };
  addons: Array<{
    id: number;
    name: string;
  }>;
  setupFee: number;
  slug: string;
}

interface MetaData {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
}

// Custom Plans List Component
const CustomPlansList = React.forwardRef(
  ({ onCreateNewPlan, onEditPlan }, ref) => {
    const [plans, setPlans] = useState<CustomPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [meta, setMeta] = useState<MetaData>({
      total: 0,
      lastPage: 1,
      currentPage: 1,
      perPage: 10,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    const fetchPlans = async () => {
      setLoading(true);
      try {
        const response = await fetchCustomPlans(
          currentPage,
          10,
          sortBy,
          sortOrder,
          searchTerm
        );

        if (Array.isArray(response)) {
          setPlans(response);
          // Always provide sensible meta values
          setMeta({
            total: response.length,
            lastPage: Math.max(1, Math.ceil(response.length / 10)),
            currentPage: currentPage,
            perPage: 10,
          });
        } else if (response && Array.isArray(response.data)) {
          setPlans(response.data);
          // If response has meta data
          if (response.meta) {
            setMeta({
              ...response.meta,
              lastPage: Math.max(1, response.meta.lastPage || 1),
            });
          } else {
            // Create meta with sensible defaults if missing
            setMeta({
              total: response.data.length,
              lastPage: Math.max(1, Math.ceil(response.data.length / 10)),
              currentPage: currentPage,
              perPage: 10,
            });
          }
        } else {
          throw new Error('Unexpected response format');
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching custom plans:', err);
        setError('Failed to load plans. Please try again later.');
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    // Expose fetchPlans method to parent component
    React.useImperativeHandle(ref, () => ({
      fetchPlans,
    }));

    useEffect(() => {
      fetchPlans();
    }, [currentPage, sortBy, sortOrder]);

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      setCurrentPage(1); // Reset to first page on new search
      fetchPlans();
    };

    const totalItems = meta.total;
    const totalPages = meta.lastPage;

    const handlePrevious = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };

    const handleNext = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    };

    if (loading && plans.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="spinner"></div>
            <p className="mt-2 text-gray-600">Loading plans...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchPlans}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="overflow-hidden p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6">Custom Plans</h1>
        <div className="mb-6 flex justify-between items-center">
          {/* Search bar on the left */}
          <form onSubmit={handleSearch} className="flex space-x-2">
            <input
              type="text"
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Search
            </button>
          </form>

          {/* Create new plan button on the right */}
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={onCreateNewPlan}
          >
            Create new plan
          </button>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th
                  onClick={() => setSortBy('name')}
                  className="px-6 py-3 text-left text-sm font-medium text-gray-700 tracking-wider cursor-pointer"
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 tracking-wider">
                  Module
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 tracking-wider">
                  Add-ons
                </th>
                <th
                  onClick={() => setSortBy('amount')}
                  className="px-6 py-3 text-right text-sm font-medium text-gray-700 tracking-wider cursor-pointer"
                >
                  Price{' '}
                  {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 tracking-wider">
                  Setup Fee
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plans.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No plans found. Create your first plan to get started.
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {plan.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {plan.description ? (
                        <span>
                          {plan.description.substring(0, 50)}
                          {plan.description.length > 50 ? '...' : ''}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">
                          No description
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {plan.basicPlan?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {plan.addons && plan.addons.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {plan.addons.map((addon) => (
                            <span
                              key={addon.id}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200"
                            >
                              {addon.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-right">
                      ${plan.amount || 0}{' '}
                      {plan.chargeDuration === 'month'
                        ? 'Monthly'
                        : plan.chargeDuration === 'year'
                        ? 'Yearly'
                        : ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-right">
                      ${plan.setupFee || 0}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right">
                      <button
                        onClick={() => onEditPlan(plan)} // Changed this line to pass the plan to edit
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Always show pagination controls, even with just one page */}
        <div className="flex justify-between items-center mt-4 p-4 border-t">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`flex items-center px-3 py-1 rounded-md ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`flex items-center px-3 py-1 rounded-md ${
              currentPage === totalPages || totalPages === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    );
  }
);

export default FleetManagementApp;
