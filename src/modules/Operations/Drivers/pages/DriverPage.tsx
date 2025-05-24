import React, { useEffect, useState } from 'react';
import PageMeta from '@/components/common/PageMeta';
import { Link, useLocation, useNavigate } from 'react-router';
import { IDriver } from '../interfaces/driver.interface';
// Comment out unused import for demo mode
// import axiosInstance from '../../../../utils/axiosConfig';
import AddUserModal from '../../Users/components/AddUserModal';
import { DriverTable } from '../components/DriverTable';
import { Button } from '@mui/material';
import InviteUserModal from '../../Users/components/InviteUserModal';
import { systemPlan, systemModule } from '@/utils/constants';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from '@/modules/core/pages/Error404Page';
import LockedFeature from '@/modules/core/components/LockedFeature';
import { UserPlus } from 'lucide-react';

export const DriverPage: React.FC = () => {
  if (!checkModuleExists(systemModule.OperationsDrivers)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Drivers" />
    ) : (
      <Error404Page />
    );
  }

  const [drivers, setDrivers] = useState<IDriver[]>([]);
  const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
  const [invitedUser, setInvitedUser] = useState<number | null>(null);
  const [isInviteModal, setInviteModal] = useState(false);

  const handleCloseInviteModal = async () => {
    setInviteModal(false);
    setInvitedUser(null);
  };
  const openInviteModal = (userId: number) => {
    setInvitedUser(userId);
    setTimeout(() => setAddUserModalOpen(false), 100);
    setTimeout(() => setInviteModal(true), 500);
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      // Comment out API call for demo mode
      // const res = await axiosInstance.get('/api/drivers');
      // setDrivers(res.data.data);
      
      console.log('fetchDrivers (demo mode) - DriverPage');
      
      // Note: DriverTable component handles its own demo data fetching
      // so we don't need to set drivers state here
    } catch (error) {
      console.log('Error fetching driver details', error);
    }
  };

  const handleOpenModal = () => setAddUserModalOpen(true);
  const handleCloseModal = () => setAddUserModalOpen(false);

  const handleSaveUser = async () => {
    handleCloseModal();
    fetchDrivers();
  };

  const handleRowClick = (driverId: number) => {
    navigate(`/operations/drivers/${driverId}`);
  };

  return (
    <>
      <PageMeta
        title="Driver | Synops AI"
        description="This is Driver page for Synops AI"
      />
      <div>
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Driver Management
            </h1>
            <button
              className="bg-[#0A1224] text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-[#0A1224]/80 transition duration-200"
              onClick={handleOpenModal}
            >
              <UserPlus size={20} />
              <span>Add User</span>
            </button>
          </div>
        </div>
        <DriverTable onDriverSelect={handleRowClick} />
        {/* Add User Modal */}
        <AddUserModal
          open={isAddUserModalOpen}
          handleClose={handleCloseModal}
          onSave={handleSaveUser}
          mode="driver"
          handleInvite={openInviteModal}
        />

        <InviteUserModal
          userId={invitedUser ?? undefined}
          open={isInviteModal}
          handleClose={handleCloseInviteModal}
          onSave={() => {}}
        />
      </div>
    </>
  );
};
