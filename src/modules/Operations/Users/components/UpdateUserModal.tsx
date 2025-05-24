import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Modal,
  Box,
  Button,
  Grid,
  CircularProgress,
  SelectChangeEvent,
  CardContent,
} from "@mui/material";
import moment from "moment";
import axiosInstance from "../../../../utils/axiosConfig";
import { toast } from "react-toastify";
import { IUserFormState } from "../interfaces/interface";
import { IUserUpdateForm } from "../interfaces/interface";

import { Role } from "@/types/role";
import { ArrowLeft, Edit } from "lucide-react";
import { Permission, Resource } from "@/types/permission";
import {
  getRoles,
  getPermissions,
  updateUser,
  getRoleById,
  createRole,
  updateRole,
  getDriversRoles,
} from "@/utils/api";
import { CardTitle, Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom interface for permission categories used in this component
interface PermissionCategory {
  name: string;
  permissions: Permission[];
}

interface UpdateUserModalProps {
  open: boolean;
  handleClose: () => void;
  userId: number;
  onSave: () => void;
}

const UpdateUserModal: React.FC<UpdateUserModalProps> = ({
  open,
  handleClose,
  userId,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<IUserUpdateForm | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permission, setPermission] = useState<PermissionCategory[]>([]);

  const [currentEditingRole, setCurrentEditingRole] = useState<number | null>(
    null
  );
  const [selectedPermissions, setSelectedPermissions] = useState<{ [key: string]: boolean }>({});
  const [roleType, setRoleType] = useState("predefined");
  const [customRoleName, setCustomRoleName] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  const [isEditingRole, setIsEditingRole] = useState(false);

  useEffect(() => {
    // Comment out API call for demo mode
    // const fetchRoles = async () => {
    //   try {
    //     const rolesData = await getRoles();
    //     setRoles(rolesData);
    //   } catch (error) {
    //     console.error("Error fetching roles:", error);
    //   }
    // };
    // fetchRoles();
    
    // Demo roles data matching Role interface
    const demoRoles: Role[] = [
      {
        id: 1,
        slug: "administrator",
        name: "Administrator",
        description: "Full system access with all permissions",
        isActive: true,
        isCustom: false,
        organization: null
      },
      {
        id: 2,
        slug: "fleet-manager",
        name: "Fleet Manager", 
        description: "Manage fleet operations and drivers",
        isActive: true,
        isCustom: false,
        organization: null
      },
      {
        id: 3,
        slug: "driver",
        name: "Driver",
        description: "Basic driver access with limited permissions",
        isActive: true,
        isCustom: false,
        organization: null
      },
      {
        id: 4,
        slug: "dispatcher",
        name: "Dispatcher",
        description: "Manage routes and vehicle assignments",
        isActive: true,
        isCustom: false,
        organization: null
      }
    ];
    setRoles(demoRoles);
    
    if (open && userId) {
      const fetchUserDetails = async () => {
        try {
          setLoading(true);
          // Comment out API call for demo mode
          // const response = await axiosInstance.get(`/api/user/${userId}`);
          // const userDetails = response.data;
          
          console.log('fetchUserDetails (demo mode)', { userId });
          
          // Demo user details data
          const userDetails = {
            id: userId,
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            username: "johndoe",
            phoneNumber: "+1-555-0123",
            phone: "+1-555-0123",
            organizationId: 1,
            picture: "/src/assets/admin/default-avatar-150x150.jpg",
            isDriver: true,
            status: "Active",
            roles: [
              {
                id: 1,
                name: "Administrator", 
                description: "Full system access",
                rolePermissions: []
              },
              {
                id: 2,
                name: "Fleet Manager",
                description: "Fleet management access", 
                rolePermissions: []
              }
            ],
            driver: {
              driverLicenseNumber: "DL123456789",
              licenseType: "Commercial",
              licenseExpirationDate: "2025-12-31",
              bloodGroup: "O+",
              emergencyNumber: "+1-555-0911",
              emergencyName: "Jane Doe",
              insuranceNumber: "INS123456789",
              driverDigitalNumber: "DDN123456789",
              homeAddress: "123 Main St, New York, NY 10001",
              status: "Active",
              garageId: "1"
            }
          };
          
          if (userDetails) {
            const driverData = userDetails.driver || {};
            setSelectedRole(
              userDetails.roles.map((role: any) => ({
                id: role.id,
                slug: role.name.toLowerCase().replace(/\s+/g, '-'),
                name: role.name,
                description: role.description,
                isActive: true,
                isCustom: false,
                organization: null
              }))
            );

            setFormState({
              id: userDetails.id,
              firstName: userDetails.firstName,
              lastName: userDetails.lastName,
              username: userDetails.username,
              email: userDetails.email,
              phoneNumber: userDetails.phoneNumber,
              phone: userDetails.phone,
              organizationId: userDetails.organizationId,
              picture: userDetails.picture,
              roleIds: userDetails.roles.map((role: any) => role.id),
              isDriver: !!userDetails.isDriver,
              status: userDetails.status,
              driverLicenseNumber: driverData.driverLicenseNumber || "",
              licenseType: driverData.licenseType || "",
              licenseExpirationDate: driverData.licenseExpirationDate
                ? new Date(driverData.licenseExpirationDate)
                    .toISOString()
                    .split("T")[0]
                : "",
              bloodGroup: driverData.bloodGroup || "",
              emergencyNumber: driverData.emergencyNumber || "",
              emergencyName: driverData.emergencyName || "",
              insuranceNumber: driverData.insuranceNumber || "",
              driverDigitalNumber: driverData.driverDigitalNumber || "",
              homeAddress: driverData.homeAddress || "",
              garageId: driverData.garageId || "",
            });
          } else {
            toast.error("User not found");
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
          toast.error("Failed to load user details");
        } finally {
          setLoading(false);
        }
      };
      fetchUserDetails();
    }
  }, [open, userId]);

  useEffect(() => {
    // Comment out API call for demo mode
    // const fetchPermissions = async () => {
    //   try {
    //     const permissionData = await getPermissions();
    //     setPermission(permissionData);
    //   } catch (error) {
    //     console.error("Error fetching permission:", error);
    //   }
    // };
    // fetchPermissions();
    
    // Demo permissions data matching PermissionCategory interface
    const demoPermissions: PermissionCategory[] = [
      {
        name: "User Management",
        permissions: [
          {
            name: "Users",
            resources: [
              { key: "users.view", value: "view", description: "View Users" },
              { key: "users.create", value: "create", description: "Create Users" },
              { key: "users.edit", value: "edit", description: "Edit Users" },
              { key: "users.delete", value: "delete", description: "Delete Users" }
            ]
          },
          {
            name: "Roles",
            resources: [
              { key: "roles.view", value: "view", description: "View Roles" },
              { key: "roles.create", value: "create", description: "Create Roles" },
              { key: "roles.edit", value: "edit", description: "Edit Roles" },
              { key: "roles.delete", value: "delete", description: "Delete Roles" }
            ]
          }
        ]
      },
      {
        name: "Fleet Management",
        permissions: [
          {
            name: "Vehicles",
            resources: [
              { key: "vehicles.view", value: "view", description: "View Vehicles" },
              { key: "vehicles.create", value: "create", description: "Add Vehicles" },
              { key: "vehicles.edit", value: "edit", description: "Edit Vehicles" },
              { key: "vehicles.delete", value: "delete", description: "Delete Vehicles" }
            ]
          },
          {
            name: "Drivers",
            resources: [
              { key: "drivers.view", value: "view", description: "View Drivers" },
              { key: "drivers.create", value: "create", description: "Add Drivers" },
              { key: "drivers.edit", value: "edit", description: "Edit Drivers" },
              { key: "drivers.delete", value: "delete", description: "Delete Drivers" }
            ]
          }
        ]
      }
    ];
    setPermission(demoPermissions);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (formState) {
      setFormState((prevState) => ({
        ...prevState!,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (formState) {
      setFormState((prevState) => ({
        ...prevState!,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (formState) {
      setFormState((prevState) => ({
        ...prevState!,
        [name]: checked,
      }));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file selection
  };

  const handlePermissionToggle = (resourceKey: string) => {
    setSelectedPermissions((prev) => {
      const updatedPermissions = { ...prev };
      updatedPermissions[resourceKey] = !prev[resourceKey];
      return updatedPermissions;
    });
  };

  const handleEditRole = (RoleId: number, isCustom:boolean) => {
    setRoleType("custom");
    // Comment out API calls for demo mode
    console.log('handleEditRole (demo mode)', { RoleId, isCustom });
    
    // Demo role data
    const demoRoleData = {
      id: RoleId,
      name: "Demo Role",
      description: "Demo role description",
      permissions: [
        { name: "users.view", value: "view" },
        { name: "roles.view", value: "view" }
      ]
    };
    
    if (isCustom) {
      setCurrentEditingRole(RoleId);
      setCustomRoleName(demoRoleData.name);
      setCustomDescription(demoRoleData.description);
      setSelectedPermissions(
        demoRoleData.permissions.reduce(
          (acc: { [x: string]: boolean }, permission: { name: string }) => {
            acc[permission.name] = true;
            return acc;
          },
          {}
        )
      );
    } else {
      setCurrentEditingRole(null);
      setCustomRoleName(`${demoRoleData.name}_${moment().format("YYYYMMDD_HHmm")}`);
      setCustomDescription(demoRoleData.description);
      setSelectedPermissions(
        demoRoleData.permissions.reduce(
          (acc: { [x: string]: boolean }, permission: { name: string }) => {
            acc[permission.name] = true;
            return acc;
          },
          {}
        )
      );
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Comment out file upload for demo mode
    console.log('handleFileChange (demo mode)');
  };

  const toBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole([role]);
    setFormState((prevFormData) => ({
      ...prevFormData!,
      roleIds: [role.id],
    }));
  };

  const handleSubmit = async () => {
    if (!formState) return;
    setLoading(true);
    
    if (roleType === "predefined" && selectedRole.length === 0) {
      toast.error("Please select a role.");
      setLoading(false);
      return;
    }
        
    let customRoleId;
    if (roleType === "custom") {
      // Comment out API calls for demo mode
      console.log('handleSubmit - custom role (demo mode)', {
        name: customRoleName,
        description: customDescription,
        permissions: Object.keys(selectedPermissions).filter(
          (key) => selectedPermissions[key]
        ),
      });
      
      if (currentEditingRole) {
        // Mock role update
        customRoleId = currentEditingRole;
        toast.success("Role updated successfully (demo mode)");
      } else {
        // Mock role creation
        customRoleId = Date.now(); // Mock ID
        toast.success("Role created successfully (demo mode)");
        setFormState({ ...formState, roleIds: [customRoleId] });
      }
    }
    
    // Comment out API call for demo mode
    console.log('handleSubmit - updating user (demo mode)', {
      ...formState,
      roleIds:
        roleType === "predefined"
          ? selectedRole.map((role) => role.id)
          : [customRoleId],
    });

    // Mock user update success
    setTimeout(() => {
      toast.success("User updated successfully (demo mode)");
      onSave();
      handleClose();
      setLoading(false);
    }, 1000);
  };

  if (loading || !formState) {
    return (
      <Modal open={open} onClose={handleClose} disableAutoFocus={true}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 700,
            maxHeight: "90vh",
            bgcolor: "background.paper",
            borderRadius: "8px",
            boxShadow: 24,
            p: 4,
            overflowY: "auto",
          }}
        >
          <CircularProgress />
        </Box>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} disableAutoFocus={true}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 1200,
          maxHeight: "90vh",
          bgcolor: "background.paper",
          borderColor: "background.paper",
          borderRadius: "8px",
          p: 4,
          overflowY: "auto",
        }}
      >
        <div className="py-8">
          <div>
            <button
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              onClick={handleClose}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to User Management
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
            <p className="mt-2 text-sm text-gray-600">
              Edit user account and Edit their role and permissions.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      name="firstName"
                      value={formState.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="lastName"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      value={formState.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      value={formState.email}
                      onChange={handleInputChange}
                      required
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="phone"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      value={formState.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="flex flex-row items-center mt-2">
                  <label className="text-sm font-medium text-gray-700">
                    Is Driver?
                  </label>
                  <input
                    type="checkbox"
                    name="isDriver"
                    className="ml-2 w-3 h-3 rounded-md border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    checked={formState.isDriver}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Role & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={roleType}
                onValueChange={setRoleType}
                className="space-y-6"
              >
                <TabsList>
                  <TabsTrigger value="predefined">Select Role</TabsTrigger>
                  <TabsTrigger value="custom">Create Custom Role</TabsTrigger>
                </TabsList>

                <TabsContent value="predefined" className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedRole.some((r) => r.id === role.id)
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-indigo-300"
                        }`}
                        onClick={() => handleRoleSelect(role)}
                      >
                        <h3 className="font-medium text-gray-900">
                          {role.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 text-wrap overflow-hidden text-ellipsis">
                          {role.description}
                        </p>
                        {selectedRole.some((r) => r.id === role.id) &&
                          !isEditingRole && (
                            <button
                              type="button"
                              className="absolute top-2 right-2 text-indigo-600 hover:text-indigo-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditRole(role.id, role.isCustom);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role Name
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      value={customRoleName}
                      onChange={(e) => setCustomRoleName(e.target.value)}
                      placeholder="Enter custom role name"
                      required={roleType === "custom"}
                    />
                    <label className="block text-sm font-medium text-gray-700 mt-4">
                      Role Description
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Enter custom Description"
                      required={roleType === "custom"}
                    />
                    <div className="mt-6 space-y-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        Select Permissions
                      </h3>
                      {permission.map((category) => (
                        <div
                          key={category.name}
                          className="space-y-4 p-4 border rounded-lg"
                        >
                          {/* Category Name */}
                          <h4 className="font-semibold text-lg text-gray-900">
                            {category.name}
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {category.permissions.map((permission) => {
                              return (
                                <div
                                  key={permission.name}
                                  className="space-y-2 p-3 border rounded-md"
                                >
                                  {/* Permission Checkbox */}
                                  <label className="flex items-center space-x-3">
                                    <span className="text-base font-medium text-gray-800">
                                      {permission.name}
                                    </span>
                                  </label>

                                  {/* Resources under this Permission */}
                                  <div className="pl-7 space-y-2 ">
                                    {permission.resources.map(
                                      (resource: Resource) => (
                                        <label
                                          key={resource.key}
                                          className="flex items-center space-x-3"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={
                                              selectedPermissions[resource.key]
                                            }
                                            onChange={() =>
                                              handlePermissionToggle(
                                                resource.key
                                              )
                                            }
                                            className="h-3 w-3 text-indigo-500 focus:ring-indigo-400 border-gray-300 rounded"
                                          />
                                          <span className="text-sm text-gray-700">
                                            {resource.description}
                                          </span>
                                        </label>
                                      )
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </form>

        {/* Save and Cancel Buttons */}
        <Grid
          item
          mt={4}
          xs={12}
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
        </Grid>
      </Box>
    </Modal>
  );
};

export default UpdateUserModal;
