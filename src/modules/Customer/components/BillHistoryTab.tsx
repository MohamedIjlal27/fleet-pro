import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
} from "@mui/material";
import {CreateInvoiceModal} from "../components/CreateInvoiceModal";
import { BillsPage } from "@/modules/Bills/pages/BillsPage";

interface BillHistoryTabPros {
  customerId?: number;
}

export const BillHistoryTab: React.FC<BillHistoryTabPros> = ({customerId}) => {
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return <BillsPage
    isEdit={false}
    customerId={customerId}
  />
  // return (
  //   <Box sx={{ padding: "20px", backgroundColor: "#f4f6f8", height: "100%" }}>
  //         <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
        
  //       <Button
  //         variant="contained"
  //         sx={{
  //           backgroundColor: "black",
  //           color: "white",
  //           textTransform: "none",
  //           padding: "8px 16px",
  //         }}
  //         onClick={handleOpenModal}
  //       >
  //         + Create Invoice
  //       </Button>
  //     </Box>

  //     {/* Table */}
  //     <TableContainer sx={{ backgroundColor: "white", borderRadius: "8px", overflow: "hidden" }}>
  //       <Table>
  //         <TableHead>
  //           <TableRow>
  //             <TableCell >Bill ID</TableCell>
  //             <TableCell >Amount</TableCell>
  //             <TableCell>Status</TableCell>
  //             <TableCell >Refund %</TableCell>
  //             <TableCell >Type</TableCell>
  //             <TableCell >Invoice Number</TableCell>
  //             <TableCell >Customer</TableCell>
  //             <TableCell >Due</TableCell>
  //             <TableCell >Created</TableCell>
  //           </TableRow>
  //         </TableHead>
  //         <TableBody>
  //           <TableRow>
  //             <TableCell colSpan={9} sx={{ textAlign: "center", color: "#9e9e9e", padding: "20px" }}>
  //               No data
  //             </TableCell>
  //           </TableRow>
  //         </TableBody>
  //       </Table>
  //     </TableContainer>

  //     {/* Create Invoice Modal */}
  //     <Modal open={openModal} onClose={handleCloseModal} disableAutoFocus={true}>
  //       <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "white", p: 4, borderRadius: 2, boxShadow: 24, width: "80%" }}>
  //         <CreateInvoiceModal onClose={handleCloseModal} />
  //       </Box>
  //     </Modal>
  //   </Box>
  // );
};
