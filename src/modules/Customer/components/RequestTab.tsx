import React from "react";
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { RequestsPage } from "@/modules/Requests/pages/RequestsPage";

interface RequestTabPros {
  customerId?: number;
}

export const RequestTab: React.FC<RequestTabPros> = ({ customerId }) => {
  return <RequestsPage
    isEdit={false}
    customerId={customerId}
  />
  
  // return (
  //   <Box sx={{ padding: "20px", backgroundColor: "#f4f6f8", height: "100%" }}>
      

  //     <TableContainer sx={{ backgroundColor: "white", borderRadius: "8px", overflow: "hidden" }}>
  //       <Table>
  //         <TableHead>
  //           <TableRow>
  //             <TableCell >Request ID</TableCell>
  //             <TableCell >Date</TableCell>
  //             <TableCell >Request</TableCell>
  //             <TableCell >Request By</TableCell>
  //             <TableCell >Made/Model</TableCell>
  //             <TableCell >Schedule Date</TableCell>
  //             <TableCell >Status</TableCell>
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
  //   </Box>
  // );
};
