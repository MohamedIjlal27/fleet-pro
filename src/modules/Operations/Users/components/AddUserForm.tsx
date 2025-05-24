import React, { useEffect, useState } from "react";
import { ArrowLeft, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getRoles,
  getPermissions,
  createUser,
  getRoleById,
  createRole,
  updateRole,
  getDriversRoles,
} from "@/utils/api";
import moment from "moment";
import { Role } from "@/types/role";
import { Permission, Resource } from "@/types/permission";
import { toast } from "react-toastify";

interface AddUserFormProps {
  onClose: () => void;
  onInvite: (userId: number) => void;
  isDriver?: boolean;
}

const AddUserForm: React.FC<AddUserFormProps> = ({
  onClose,
  onInvite,
  isDriver = false,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    isDriver: isDriver,
    roleIds: [0],
    username: "",
    picture: "",
  });

  const [roleType, setRoleType] = useState("predefined");
  const [selectedRole, setSelectedRole] = useState<Role[]>([]);
  const [customRoleName, setCustomRoleName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    []
  );
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [currentEditingRole, setCurrentEditingRole] = useState<number | null>(
    null
  );
  const [roles, setRoles] = useState<Role[]>([]);
  const [permission, setPermission] = useState<Permission[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // Comment out API calls for demo mode
        // if (isDriver) {
        //   const rolesData = await getDriversRoles();
        //   setRoles(rolesData);
        //
        //   const driverRole = rolesData.find((role) => role.slug === "driver");
        //   if (driverRole) {
        //     handleRoleSelect(driverRole);
        //   }
        // } else {
        //   const rolesData = await getRoles();
        //   setRoles(rolesData);
        // }
        
        console.log('fetchRoles (demo mode)', { isDriver });
        
        // Demo roles data
        const demoRoles = [
          {
            id: 1,
            name: "Administrator",
            description: "Full system access",
            slug: "admin",
            isActive: true,
            isCustom: false,
            organization: null
          },
          {
            id: 2,
            name: "Fleet Manager",
            description: "Fleet management access",
            slug: "fleet-manager",
            isActive: true,
            isCustom: false,
            organization: null
          },
          {
            id: 3,
            name: "Driver",
            description: "Driver access to vehicles and routes",
            slug: "driver",
            isActive: true,
            isCustom: false,
            organization: null
          },
          {
            id: 4,
            name: "Mechanic",
            description: "Vehicle maintenance access",
            slug: "mechanic",
            isActive: true,
            isCustom: false,
            organization: null
          },
          {
            id: 5,
            name: "Dispatcher",
            description: "Route planning and communication",
            slug: "dispatcher",
            isActive: true,
            isCustom: false,
            organization: null
          }
        ];
        
        if (isDriver) {
          // Filter to driver role for driver mode
          const driverRoles = demoRoles.filter(role => role.slug === "driver");
          setRoles(driverRoles);
          
          const driverRole = driverRoles.find((role) => role.slug === "driver");
          if (driverRole) {
            handleRoleSelect(driverRole);
          }
        } else {
          setRoles(demoRoles);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    const fetchPermissions = async () => {
      try {
        // Comment out API call for demo mode
        // const permissionData = await getPermissions();
        // setPermission(permissionData);
        
        console.log('fetchPermissions (demo mode)');
        
        // Demo permissions data
        const demoPermissions = [
          {
            name: "User Management",
            permissions: [
              {
                name: "User Administration",
                resources: [
                  { key: "user.create", description: "Create users" },
                  { key: "user.read", description: "View users" },
                  { key: "user.update", description: "Update users" },
                  { key: "user.delete", description: "Delete users" }
                ]
              }
            ]
          },
          {
            name: "Vehicle Management",
            permissions: [
              {
                name: "Vehicle Operations",
                resources: [
                  { key: "vehicle.create", description: "Add vehicles" },
                  { key: "vehicle.read", description: "View vehicles" },
                  { key: "vehicle.update", description: "Update vehicles" },
                  { key: "vehicle.delete", description: "Remove vehicles" }
                ]
              }
            ]
          }
        ];
        
        setPermission(demoPermissions);
      } catch (error) {
        console.error("Error fetching permission:", error);
      }
    };
    fetchPermissions();
    fetchRoles();
  }, [isDriver]);

  useEffect(() => {
    // If the role type is changed to predefined, clear the custom role data
    if (roleType === "custom") {
      setSelectedRole([]);
      setSelectedPermissions([]);
    } else {
      // If the role type is changed to predefined, clear the custom role data
      setCustomRoleName("");
      setCustomDescription("");
      setSelectedPermissions([]);
      setCurrentEditingRole(null);
    }
  }, [roleType]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole([role]);
    setFormData((prevFormData) => ({
      ...prevFormData,
      roleIds: [role.id],
    }));
  };

  const handleEditRole = (RoleId: number, isCustom:boolean) => {
    setRoleType("custom");
    if (isCustom) {
      setCurrentEditingRole(RoleId);
      // Comment out API call for demo mode
      // getRoleById(RoleId)
      //   .then((roleData) => {
      //     setCustomRoleName(roleData.name);
      //     setCustomDescription(roleData.description);
      //     setSelectedPermissions(
      //       roleData.permissions.reduce(
      //         (
      //           acc: { [x: string]: boolean },
      //           permission: { name: string | number }
      //         ) => {
      //           acc[permission.name] = true;
      //           return acc;
      //         },
      //         {}
      //       )
      //     );
      //   })
      //   .catch((error) => {
      //     console.error("Error fetching role data:", error);
      //   });
      
      console.log('handleEditRole (demo mode) - edit custom', { RoleId });
      
      // Demo role data for editing
      setCustomRoleName("Custom Role");
      setCustomDescription("Custom role description");
      setSelectedPermissions({
        "user.create": true,
        "user.read": true
      });
    } else {
      setCurrentEditingRole(null);
      // Comment out API call for demo mode
      // getRoleById(RoleId)
      //   .then((roleData) => {
      //     setCustomRoleName(`${roleData.name}_${moment().format("YYYYMMDD_HHmm")}`);
      //     setCustomDescription(roleData.description);
      //     setSelectedPermissions(
      //       roleData.permissions.reduce(
      //         (
      //           acc: { [x: string]: boolean },
      //           permission: { name: string | number }
      //         ) => {
      //           acc[permission.name] = true;
      //           return acc;
      //         },
      //         {}
      //       )
      //     );
      //   })
      //   .catch((error) => {
      //     console.error("Error fetching role data:", error);
      //   });
      
      console.log('handleEditRole (demo mode) - create from existing', { RoleId });
      
      // Demo role data for creating from existing
      setCustomRoleName(`Custom_Role_${moment().format("YYYYMMDD_HHmm")}`);
      setCustomDescription("Role description based on existing");
      setSelectedPermissions({
        "user.read": true,
        "vehicle.read": true
      });
    }
  };

  const handlePermissionToggle = (resourceKey: string) => {
    setSelectedPermissions((prev) => {
      const updatedPermissions = { ...prev };
      updatedPermissions[resourceKey] = !prev[resourceKey];
      return updatedPermissions;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (roleType === "predefined" && selectedRole.length === 0) {
      toast.error("Please select a role.");
      return;
    }
    
    let customRoleId;
    if (roleType === "custom") {
      const roleData = {
        name: customRoleName,
        description: customDescription,
        permissions: Object.keys(selectedPermissions).filter(
          (key) => selectedPermissions[key]
        ),
      };

      if (currentEditingRole) {
        // Comment out API call for demo mode
        // await updateRole(currentEditingRole, roleData)
        //   .then(() => {
        //     customRoleId = currentEditingRole;
        //     toast.success("Role updated successfully.");
        //   })
        //   .catch((error) => {
        //     console.error("Error updating role:", error.message);
        //     toast.error("Failed to update role.", error.message);
        //   });
        
        console.log('updateRole (demo mode)', { roleId: currentEditingRole, roleData });
        customRoleId = currentEditingRole;
        toast.success("Role updated successfully.");
      } else {
        // Comment out API call for demo mode
        // await createRole(roleData)
        //   .then((role) => {
        //     customRoleId = role.id;
        //     role.id && setFormData({ ...formData, roleIds: [role.id] });
        //   })
        //   .catch((error) => {
        //     console.error("Error creating role:", error.message);
        //     toast.error(
        //       <div>
        //         Failed to create role:
        //         <br />
        //         {error.response?.data?.message}
        //       </div>
        //     );
        //   });
        
        console.log('createRole (demo mode)', roleData);
        
        // Mock successful role creation
        const mockRole = {
          id: Date.now(),
          ...roleData
        };
        customRoleId = mockRole.id;
        setFormData({ ...formData, roleIds: [mockRole.id] });
        toast.success("Custom role created successfully.");
      }
    }

    const userData = {
      ...formData,
      roleIds:
        roleType === "predefined"
          ? selectedRole.map((role) => role.id)
          : [customRoleId],
          // : {
          //     name: customRoleName,
          //     permissions: selectedPermissions,
          //   },
      password: Math.random().toString(36).substr(2, 9),
    };

    // Comment out API call for demo mode
    // await createUser(userData)
    //   .then((newUser) => {
    //     //console.log("User created successfully:", newUser);
    //     onInvite(newUser.id);
    //     toast.success("User created successfully.");
    //   })
    //   .catch((error) => {
    //     console.error("Error creating user:", error);
    //     toast.error("Failed to create user.");
    //   });
    
    console.log('createUser (demo mode)', userData);
    
    // Mock successful user creation
    const mockUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    
    onInvite(mockUser.id);
    toast.success("User created successfully.");
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to User Management
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isDriver ? "Add New Driver" : "Add New User"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Create a new {isDriver ? "driver" : "user"} account and assign their
            role and permissions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
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
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-row items-center mt-2">
                  <label className="text-sm font-medium text-gray-700">
                    Is Driver?
                  </label>
                  <input
                    type="checkbox"
                    className="ml-2 w-3 h-3 rounded-md border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    checked={formData.isDriver}
                    onChange={(e) =>
                      setFormData({ ...formData, isDriver: e.target.checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role and Permissions Card */}
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
                    {roles.map((role) => {
                      return (
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
                                onClick={() => handleEditRole(role.id, role.isCustom)}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                        </div>
                      );
                    })}
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;
