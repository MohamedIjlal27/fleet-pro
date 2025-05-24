import React, { useState, useEffect, ChangeEvent } from "react";
import { Modal, Box, SelectChangeEvent } from "@mui/material";
import axiosInstance from "../../../../utils/axiosConfig";
import { toast } from "react-toastify";
import { IUserFormState } from "../interfaces/interface";
import { IUser } from "../interfaces/interface";
import AddUserForm from "./AddUserForm";

interface AddUserModalProps {
  open: boolean;
  handleClose: () => void;
  handleInvite: (userId: number) => void;
  user?: IUser;
  isNewUser?: boolean;
  onSave: (user: IUserFormState) => void;
  mode?: "user" | "driver";
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  open,
  handleInvite,
  handleClose,
  user = {
    id: 0,
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    organizationId: 0,
    phone: "",
    password: "",
    phoneNumber: "",
    picture: "",
  },
  mode = "user",
  isNewUser = true,
  onSave,
}) => {
  const [garageList, setGarageList] = useState<{ id: string; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<IUserFormState>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    username: user?.username || "",
    password: "",
    confirmPassword: "",
    phoneNumber: user?.phoneNumber || "",
    organizationId: parseInt(import.meta.env.VITE_ORGANIZATION_ID, 10) || 0,
    isDriver: mode === "driver",
    status: "ON",
    roles: mode === "driver" ? [3] : [],
    phone: user?.phone || "",
    driverLicenseNumber: "",
    homeAddress: "",
    emergencyName: "",
    insuranceNumber: "",
    driverDigitalNumber: "",
    picture: user?.picture || "",
    garageId: "",
  });

  useEffect(() => {
    if (open) {
      if (mode === "driver") {
        setFormState((prevState) => ({
          ...prevState,
          isDriver: true,
          roles: [3],
        }));
      } else {
        setFormState((prevState) => ({
          ...prevState,
          isDriver: false,
          roles: [],
        }));
      }
    }
  }, [open, mode]);

  useEffect(() => {
    const fetchGarages = async () => {
      try {
        // Comment out API call for demo mode
        // const response = await axiosInstance.get("/api/garages");
        // setGarageList(response.data);
        
        console.log('fetchGarages (demo mode)');
        
        // Demo garage list data
        const demoGarages = [
          { id: "1", name: "Downtown Garage" },
          { id: "2", name: "Brooklyn Garage" },
          { id: "3", name: "Queens Garage" }
        ];
        
        setGarageList(demoGarages);
      } catch (error) {
        console.error("Error fetching garages:", error);
        toast.error("Failed to load garages");
      }
    };

    fetchGarages();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      isDriver: checked,
      roles: checked && mode === "driver" ? [3] : [],
    }));
  };

  const handleRoleChange = (roleId: number) => {
    setFormState((prevState) => {
      let roles = [...prevState.roles];
      if (prevState.roles.includes(roleId)) {
        roles = prevState.roles.filter((id) => id !== roleId);
      } else {
        roles = [...prevState.roles, roleId];
      }
      return { ...prevState, roles };
    });
  };

  // Check if Super Admin or Fleet Admin is selected
  const isAdminSelected =
    formState.roles.includes(1) || formState.roles.includes(2);

  const handleSubmit = async () => {
    if (formState.password !== formState.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    const userDto = {
      email: formState.email,
      password: formState.password,
      firstName: formState.firstName,
      lastName: formState.lastName,
      phone: formState.phone,
      isDriver: formState.isDriver,
      roleIds: formState.roles,
      username: formState.username,
      organizationId: formState.organizationId,

      // Driver-specific fields only if isDriver is true
      driverData: formState.isDriver
        ? {
            driverLicenseNumber: formState.driverLicenseNumber,
            licenseType: formState.licenseType,
            licenseExpirationDate: formState.licenseExpirationDate
              ? new Date(formState.licenseExpirationDate).toISOString()
              : undefined,
            bloodGroup: formState.bloodGroup,
            emergencyNumber: formState.emergencyNumber,
            emergencyName: formState.emergencyName,
            insuranceNumber: formState.insuranceNumber,
            driverDigitalNumber: formState.driverDigitalNumber,
            homeAddress: formState.homeAddress,
            status: formState.status,
            garageId: formState.garageId,
          }
        : undefined,
    };

    try {
      // Comment out API call for demo mode
      // const response = await axiosInstance.post("/api/user", userDto);
      
      console.log('handleSubmit (demo mode)', userDto);
      
      // Mock successful user creation
      const mockResponse = {
        data: {
          id: Date.now(),
          ...userDto,
          createdAt: new Date().toISOString()
        }
      };
      
      toast.success("User created successfully");
      onSave(mockResponse.data);
      handleClose();
    } catch (error: any) {
      const errorMessage =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message;

      toast.error(`User creation failed: ${errorMessage}`);
      console.error("Error creating user:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal open={open} onClose={handleClose} disableAutoFocus={true}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 1024,
          maxHeight: "90vh",
          bgcolor: "background.paper",
          borderRadius: "8px",
          boxShadow: 24,
          overflowY: "auto",
        }}
      >
        <AddUserForm
          onClose={handleClose}
          onInvite={(userId) => handleInvite(userId)}
          isDriver={mode === "driver"}
          formState={formState}
        />
      </Box>
    </Modal>
  );
};

export default AddUserModal;
