import React, { useState, useEffect, ChangeEvent } from "react";
import { Modal, Box } from "@mui/material";
import axiosInstance from "../../../../utils/axiosConfig";
import { toast } from "react-toastify";
import { IUserFormState, IUser } from "../interfaces/interface";
import UserInvitationSetup from "./InviteUserForm";

interface InviteUserModalProps {
  open: boolean;
  handleClose: () => void;
  userId?: number;
  isNewUser?: boolean;
  onSave: (user: IUserFormState) => void;
  mode?: "user" | "driver";
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  userId,
  open,
  handleClose,
  mode = "user",
  isNewUser = true,
  onSave,
}) => {
  const [garageList, setGarageList] = useState<{ id: string; name: string }[]>(
    []
  );
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
        <UserInvitationSetup onClose={handleClose} userId={userId} />
      </Box>
    </Modal>
  );
};

export default InviteUserModal;
