import React, { useEffect, useState } from 'react';
import { Box, Typography, Divider, Button } from '@mui/material';
import PlansList from '../components/PlansList';
import AddPlan from '../components/AddPlan';
import { fetchPlans } from '../apis/apis'; // Import the API function
import { systemPlan, systemModule } from '@/utils/constants';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from '@/modules/core/pages/Error404Page';
import LockedFeature from '@/modules/core/components/LockedFeature';
import { Plus } from 'lucide-react';

export const PlansPage: React.FC = () => {
  if (!checkModuleExists(systemModule.OperationsPlans)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Plans" />
    ) : (
      <Error404Page />
    );
  }

  const [plans, setPlans] = useState<any[]>([]); // State to store plans data
  const [loading, setLoading] = useState<boolean>(true); // State to handle loading
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadPlans = async () => {
    try {
      setLoading(true); // Start loading
      const data = await fetchPlans(); // Fetch plans from the API
      setPlans(data || []); // Set plans if data is available
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Box sx={{ padding: '20px' }}>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Subscription Plans
          </h1>
          <button
            className="bg-[#0A1224] text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-[#0A1224]/80 transition duration-200"
            onClick={handleOpenModal}
          >
            <Plus size={20} />
            <span>New</span>
          </button>
        </div>
      </div>
      <Divider sx={{ marginBottom: '20px' }} />
      <PlansList loadPlans={loadPlans} plans={plans} loading={loading} />

      <AddPlan
        loadPlans={loadPlans}
        open={isModalOpen}
        handleClose={handleCloseModal}
      />
    </Box>
  );
};
