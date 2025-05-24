import React, { useEffect, useState } from 'react';
import { Grid, Button, Box, Typography, Avatar } from '@mui/material';
import { IUserCard } from '../interfaces/interface';
import AddUserModal from '../components/AddUserModal';
import axiosInstance from '../../../../utils/axiosConfig';
import { UserCard } from '../components/UserCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Edit,
  MoreVertical,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UpdateUserModal from '../components/UpdateUserModal';
import InviteUserModal from '../components/InviteUserModal';
import { deleteUser, getStatistics } from '@/utils/api';
import { systemPlan, systemModule } from '@/utils/constants';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from '@/modules/core/pages/Error404Page';
import LockedFeature from '@/modules/core/components/LockedFeature';

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import Badge from '@/components/ui/badge/Badge';
import FilterButtons from '@/components/ui/filter-buttons';
import { Pagination } from '@/components/ui/pagination';
import { Permission } from '../../../../types/permission';
import { useTranslation } from 'react-i18next';
import defaultImg from '/src/assets/admin/default-avatar-150x150.jpg';

export const UserPage: React.FC = () => {
  if (!checkModuleExists(systemModule.OperationsUsers)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Users" />
    ) : (
      <Error404Page />
    );
  }
  const { i18n } = useTranslation();
  const [users, setUsers] = useState<IUserCard[]>([]);
  const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUserCard | null>(null);
  const [isInviteModal, setInviteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [statistics, setStatistics] = useState<any>({});
  const [invitedUser, setInvitedUser] = useState<number | null>(null);
  const filterGroups = [
    {
      title: 'Status',
      options: [
        { key: 'inStock', label: 'In Stock' },
        { key: 'onSale', label: 'On Sale' },
        { key: 'featured', label: 'Featured' },
        { key: 'newArrival', label: 'New Arrival' },
      ],
    },
    {
      title: 'Price Range',
      options: [
        { key: 'under25', label: 'Under $25' },
        { key: 'between25And50', label: '$25 - $50' },
        { key: 'between50And100', label: '$50 - $100' },
        { key: 'between100And200', label: '$100 - $200' },
        { key: 'over200', label: 'Over $200' },
      ],
    },
  ];

  const handleFilterChange = (filters) => {
    console.log('Selected filters:', filters);
    // Handle filter changes
  };

  useEffect(() => {
    fetchUsers(searchTerm, currentPage);
  }, [searchTerm, currentPage]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Comment out API call for demo mode
        // getStatistics().then((data) => setStatistics(data));
        
        console.log('fetchStats (demo mode)');
        
        // Generate demo users first to calculate accurate statistics
        const demoUsers = generateDemoUsers();
        
        // Calculate actual statistics from demo data
        const totalUsers = demoUsers.length;
        const activeUsers = demoUsers.filter(user => user.status === 30).length;
        const pendingUsers = demoUsers.filter(user => user.status === 10).length;
        const inactiveUsers = demoUsers.filter(user => user.status === 0).length;
        
        const demoStats = {
          totalUsers: totalUsers,
          percentageIncrease: 12,
          activeRoles: activeUsers, // Changed to show active users count
          totalRolesCustom: 3,
          pendingInvites: pendingUsers
        };
        
        setStatistics(demoStats);
      } catch (error) {
        console.error('Error fetching statistics', error);
      }
    };
    fetchStats();
  }, []);

  // Function to generate demo users with controlled status distribution
  const generateDemoUsers = () => {
    const demoUsers: (IUserCard & {
      roleList: Array<{ id: number; name: string }>;
      permissionList: Array<{ id: number; description: string }>;
    })[] = [
      // 8 Active Users
      {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+1-555-0123",
        username: "johndoe",
        organizationId: 1,
        picture: defaultImg,
        status: 30,
        statusName: "Active",
        lastActiveDate: "2024-01-20T10:30:00Z",
        roleIds: [1, 2],
        roleList: [
          { id: 1, name: "Administrator" },
          { id: 2, name: "Fleet Manager" }
        ],
        permissionList: [
          { id: 1, description: "User Management" },
          { id: 2, description: "Vehicle Access" },
          { id: 3, description: "Reports View" }
        ]
      },
      {
        id: 2,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        phone: "+1-555-0456",
        username: "janesmith",
        organizationId: 1,
        picture: defaultImg,
        status: 30,
        statusName: "Active",
        lastActiveDate: "2024-01-19T15:45:00Z",
        roleIds: [3],
        roleList: [
          { id: 3, name: "Driver" }
        ],
        permissionList: [
          { id: 4, description: "Vehicle Operation" },
          { id: 5, description: "Route Access" }
        ]
      },
      {
        id: 3,
        firstName: "David",
        lastName: "Brown",
        email: "david.brown@example.com",
        phone: "+1-555-0654",
        username: "davidbrown",
        organizationId: 1,
        picture: defaultImg,
        status: 30,
        statusName: "Active",
        lastActiveDate: "2024-01-18T14:20:00Z",
        roleIds: [3],
        roleList: [{ id: 3, name: "Driver" }],
        permissionList: [
          { id: 4, description: "Vehicle Operation" },
          { id: 5, description: "Route Access" }
        ]
      },
      {
        id: 4,
        firstName: "Emily",
        lastName: "Davis",
        email: "emily.davis@example.com",
        phone: "+1-555-0987",
        username: "emilydavis",
        organizationId: 1,
        picture: defaultImg,
        status: 30,
        statusName: "Active",
        lastActiveDate: "2024-01-17T11:15:00Z",
        roleIds: [5],
        roleList: [{ id: 5, name: "Dispatcher" }],
        permissionList: [
          { id: 9, description: "Route Planning" },
          { id: 10, description: "Communication Access" }
        ]
      },
      {
        id: 5,
        firstName: "Robert",
        lastName: "Miller",
        email: "robert.miller@example.com",
        phone: "+1-555-0111",
        username: "robertmiller",
        organizationId: 1,
        picture: defaultImg,
        status: 30,
        statusName: "Active",
        lastActiveDate: "2024-01-16T09:30:00Z",
        roleIds: [3],
        roleList: [{ id: 3, name: "Driver" }],
        permissionList: [
          { id: 4, description: "Vehicle Operation" },
          { id: 5, description: "Route Access" }
        ]
      },
      {
        id: 6,
        firstName: "James",
        lastName: "Garcia",
        email: "james.garcia@example.com",
        phone: "+1-555-0333",
        username: "jamesgarcia",
        organizationId: 1,
        picture: defaultImg,
        status: 30,
        statusName: "Active",
        lastActiveDate: "2024-01-15T16:45:00Z",
        roleIds: [2],
        roleList: [{ id: 2, name: "Fleet Manager" }],
        permissionList: [
          { id: 2, description: "Vehicle Access" },
          { id: 3, description: "Reports View" },
          { id: 8, description: "Driver Management" }
        ]
      },
      {
        id: 7,
        firstName: "Maria",
        lastName: "Rodriguez",
        email: "maria.rodriguez@example.com",
        phone: "+1-555-0444",
        username: "mariarodriguez",
        organizationId: 1,
        picture: defaultImg,
        status: 30,
        statusName: "Active",
        lastActiveDate: "2024-01-14T13:20:00Z",
        roleIds: [3],
        roleList: [{ id: 3, name: "Driver" }],
        permissionList: [
          { id: 4, description: "Vehicle Operation" },
          { id: 5, description: "Route Access" }
        ]
      },
      {
        id: 8,
        firstName: "Jennifer",
        lastName: "Anderson",
        email: "jennifer.anderson@example.com",
        phone: "+1-555-0666",
        username: "jenniferanderson",
        organizationId: 1,
        picture: defaultImg,
        status: 30,
        statusName: "Active",
        lastActiveDate: "2024-01-13T12:10:00Z",
        roleIds: [5],
        roleList: [{ id: 5, name: "Dispatcher" }],
        permissionList: [
          { id: 9, description: "Route Planning" },
          { id: 10, description: "Communication Access" }
        ]
      },
      // 1 Pending User
      {
        id: 9,
        firstName: "Mike",
        lastName: "Johnson",
        email: "mike.johnson@example.com",
        phone: "+1-555-0789",
        username: "mikejohnson",
        organizationId: 1,
        picture: defaultImg,
        status: 10,
        statusName: "Pending",
        lastActiveDate: null,
        roleIds: [4],
        roleList: [
          { id: 4, name: "Mechanic" }
        ],
        permissionList: [
          { id: 6, description: "Maintenance Access" },
          { id: 7, description: "Garage Management" }
        ]
      },
      // 1 Inactive User
      {
        id: 10,
        firstName: "Sarah",
        lastName: "Williams",
        email: "sarah.williams@example.com",
        phone: "+1-555-0321",
        username: "sarahwilliams",
        organizationId: 1,
        picture: defaultImg,
        status: 0,
        statusName: "Inactive",
        lastActiveDate: "2024-01-10T08:20:00Z",
        roleIds: [2],
        roleList: [
          { id: 2, name: "Fleet Manager" }
        ],
        permissionList: [
          { id: 2, description: "Vehicle Access" },
          { id: 3, description: "Reports View" },
          { id: 8, description: "Driver Management" }
        ]
      }
    ];

    return demoUsers;
  };

  const fetchUsers = async (
    searchTerm: string = '',
    currentPage: number = 1
  ) => {
    try {
      // Comment out API call for demo mode
      // const response = await axiosInstance(
      //   `/api/user/all?search=${searchTerm}&page=${currentPage}`
      // );
      // setUsers(response.data.data);
      // setTotalPages(response.data.meta.lastPage);

      console.log('fetchUsers (demo mode)', { searchTerm, currentPage });

      // Get demo users from the generator function
      const demoUsers = generateDemoUsers();

      // Filter users based on search term if provided
      let filteredUsers = demoUsers;
      if (searchTerm.trim()) {
        filteredUsers = demoUsers.filter(user =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Simulate pagination
      const usersPerPage = 10;
      const totalUsers = filteredUsers.length;
      const totalPagesCalc = Math.ceil(totalUsers / usersPerPage);
      const startIndex = (currentPage - 1) * usersPerPage;
      const endIndex = startIndex + usersPerPage;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      setUsers(paginatedUsers);
      setTotalPages(totalPagesCalc);

      console.log('Users fetched successfully (demo mode)', { users: paginatedUsers, totalPages: totalPagesCalc });
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  const handleEditUser = (user: IUserCard) => {
    setSelectedUser(user);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = async () => {
    setIsUpdateModalOpen(false);
    setSelectedUser(null);
    await fetchUsers(searchTerm, currentPage); // Refresh users after update
  };

  const handleCloseInviteModal = async () => {
    setInviteModal(false);
    setInvitedUser(null);
    await fetchUsers(searchTerm, currentPage); // Refresh users after invite
  };

  const handleOpenModal = () => setAddUserModalOpen(true);
  const handleCloseModal = () => {
    setAddUserModalOpen(false);
  };

  const handleSaveUser = async () => {
    handleCloseModal();
    await fetchUsers(searchTerm, currentPage);
  };

  const openInviteModal = (userId: number) => {
    setInvitedUser(userId);
    setTimeout(() => setAddUserModalOpen(false), 100);
    setTimeout(() => setInviteModal(true), 500);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return 'Never';
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      // Comment out API call for demo mode
      // await deleteUser(userId);
      
      console.log('handleDeleteUser (demo mode)', { userId });
      
      // Mock successful deletion
      await fetchUsers(searchTerm, currentPage);
      setIsUpdateModalOpen(false);
      alert(i18n.t('User deleted successfully'));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(i18n.t('Failed to delete user'));
    }
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">
              {i18n.t('User Management')}
            </h1>
            <button
              className="bg-[#0A1224] dark:bg-neutral-100 text-white dark:text-[#0A1224] px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-[#0A1224]/80 transition duration-200"
              onClick={handleOpenModal}
            >
              <UserPlus size={20} />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card className="dark:bg-white/[0.03] dark:border-neutral-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-neutral-100">
                {i18n.t('Total Users')}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground dark:text-neutral-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-neutral-50">
                {statistics.totalUsers}
              </div>
              <p className="text-xs text-muted-foreground dark:text-neutral-400">
                +{statistics.percentageIncrease}% {i18n.t('from last month')}
              </p>
            </CardContent>
          </Card>
          <Card className="dark:bg-white/[0.03] dark:border-neutral-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-neutral-100">
                {i18n.t('Active Roles')}
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground dark:text-neutral-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-neutral-50">
                {statistics.activeRoles}
              </div>
              <p className="text-xs text-muted-foreground dark:text-neutral-400">
                {statistics.totalRolesCustom} {i18n.t('custom roles added')}
              </p>
            </CardContent>
          </Card>
          <Card className="dark:bg-white/[0.03] dark:border-neutral-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-neutral-100">
                {i18n.t('Pending Invites')}
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground dark:text-neutral-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-neutral-50">
                {statistics.pendingInvites}
              </div>
              <p className="text-xs text-muted-foreground dark:text-neutral-400">
                {i18n.t('Expires in 24 hours')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex flex-col">
            <div className="flex flex-row p-6 gap-2">
              {' '}
              <FilterButtons
                filterGroups={filterGroups}
                onFilterChange={handleFilterChange}
              />
              {/* Search and Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-white/[0.03] dark:border-white/[0.05] placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder={i18n.t('Search users...')}
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400/50 dark:scrollbar-thumb-gray-700/50">
              <Table className="border-b-2 dark:border-b-0 dark:border-t-[1px] dark:border-white/[0.05] ">
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      {i18n.t('User')}
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      {i18n.t('Roles')}
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      {i18n.t('Status')}
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      {i18n.t('Permissions')}
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      {i18n.t('Last Active Date')}
                    </TableCell>
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 overflow-hidden rounded-full">
                            <Avatar
                              sx={{ width: 40, height: 40 }}
                              src={user?.picture || defaultImg}
                              alt="user icon"
                            />
                          </div>
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {`${user.firstName} ${user.lastName}`}{' '}
                            </span>
                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {user.roleList.length > 3
                          ? `${user.roleList
                              .slice(0, 2)
                              .map((role) => role.name)
                              .join(', ')}...`
                          : user.roleList
                              .map((role) => role.name)
                              .join(', ')}{' '}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge
                          size="sm"
                          color={
                            user.status === 10
                              ? 'warning'
                              : user.status === 30
                              ? 'success'
                              : 'error'
                          }
                        >
                          {user.statusName}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {user.permissionList.length > 3
                          ? `${user.permissionList
                              .slice(0, 2)
                              .map((p) => p.description)
                              .join(', ')}...`
                          : user.permissionList
                              .map((p) => p.description)
                              .join(', ')}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {user.lastActiveDate
                          ? formatDate(user.lastActiveDate)
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-2 rounded-full bg-gray-200">
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4 text-blue-500" />
                              <span className="text-blue-500">
                                {i18n.t('Edit')}
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center space-x-2 text-red-600 hover:bg-gray-100 cursor-pointer"
                              onClick={async () => {
                                if (
                                  window.confirm(
                                    `${i18n.t(
                                      'Are you sure you want to delete'
                                    )} ${user.firstName} ${user.lastName}?`
                                  )
                                ) {
                                  await handleDeleteUser(user.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                              <span className="text-red-500">
                                {i18n.t('Delete')}
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Box display="flex" justifyContent="center" padding={2}>
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </Box>
          </div>
        </div>

        {/* Pagination */}

        {/* Update User Modal */}
        {selectedUser && (
          <UpdateUserModal
            open={isUpdateModalOpen}
            handleClose={handleCloseUpdateModal}
            userId={selectedUser.id}
            onSave={handleCloseUpdateModal}
          />
        )}
        <AddUserModal
          open={isAddUserModalOpen}
          handleClose={handleCloseModal}
          handleInvite={openInviteModal}
          onSave={handleSaveUser}
        />
        <InviteUserModal
          userId={invitedUser}
          open={isInviteModal}
          handleClose={handleCloseInviteModal}
          onSave={() => {}}
        />
      </main>
    </div>
  );
};
