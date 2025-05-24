import React, { useEffect, useState } from 'react';
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import ChangePasswordCard from "../components/UserProfile/ChangePasswordCard";
import PageMeta from "../components/common/PageMeta";
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/app/store';
import axiosInstance from '@/utils/axiosConfig';

interface IRole {
  id: number;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  isCustom: boolean;
  rolePermissions: [],
}

interface IOrganization {
  id: number;
  name: string;
}

interface IDriverDetails {
  id: number;
  phoneNumber: string;
  status: string;
  driverLicenseNumber: string;
  licenseExpirationDate: string;
  licenseType: string;
  homeAddress: string;
  emergencyNumber: string;
  emergencyName: string;
  bloodGroup: string;
  insuranceNumber: string;
  driverDigitalNumber: string;
  garageId: number;
}

interface IUserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone?: string;
  company?: string;
  type?: string;
  profile_photo_url?: string;
  createdAt: string;
  updatedAt: string;
  organization: IOrganization;
  roles: IRole[];
  driver?: IDriverDetails;
}

export default function UserProfiles() {
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<IUserProfile | null>(null);

  const userId = useSelector((state: RootState) => state.user.id);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get(`/api/user/${userId}`);
        setUserDetails(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId]);

  return (
    <>
      <PageMeta
        title="Profile | Synops AI"
        description="This is Profile page for Synops AI"
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard userDetails={userDetails} />
          <UserInfoCard userDetails={userDetails} />
          <UserAddressCard userDetails={userDetails} />
          <ChangePasswordCard />
        </div>
      </div>
    </>
  );
}
