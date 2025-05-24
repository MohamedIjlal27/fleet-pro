// it is in the Maintenance Page but not a separate component
// import React , { useEffect, useState }  from "react";
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     Typography,
//     Grid2 as Grid,
//     Avatar,
//     Box,
//     Pagination,
// } from "@mui/material";
// import {  } from "../interfaces/interfaces";
// import { fetchMaintenances } from '../apis/apis';

// interface MaintenanceTableProps {
//     onRowClick: (makeModel: string) => void;
// }

// interface Maintenance {
//     id: number;
//     carId: number;
//     userId: number;
//     plateNumber:string;
//     startTime: string;
//     statusName: string;
//     serviceTypeName: string;
//     work_shop: string;
//     coverImage: string;
//     make: string;
//     model: string;
//     year: number;
//     color: string;
// }

// const MaintenanceTable: React.FC<MaintenanceTableProps> = ({  onRowClick }) => {

//     const defaultPagin =
//     {
//         currentPage: 1,
//         lastPage: 1,
//         total: 0,
//         perPage: 10,
//     };
//     const [pagination, setPagination] = useState(defaultPagin);
//     const [loading, setLoading] = useState<boolean>(true);
//     const [maintenances, setMaintenances] = useState<Maintenance[]>([]);



//     useEffect(() => {
//         loadMaintenances();
//     }, [pagination.currentPage]);

//     const reFreshTable = () => {
//         setPagination(defaultPagin);
//         loadMaintenances();
//       };

//     // Fetch bills from the API
//     const loadMaintenances = async () => {
//         try {
//             setLoading(true);
//             const response = await fetchMaintenances(pagination.currentPage,
//                 pagination.perPage,);
    
//             if (!response) {
//                 console.error("Invalid API response",response);
//                 return;
//             }
//             console.log("fetchMaintenances res =",response);
//             const data = response.data;

//             // Transform the response to match the Maintenance interface
//             const transformedData: Maintenance[] = data.map((item: any) => ({
//                 id: item.id,
//                 carId: item.carId,
//                 userId: item.userId,
//                 plateNumber: item.vehicle.plateNumber,
//                 startTime: extractDatePart(item.startTime),
//                 statusName: item.statusName,
//                 serviceTypeName: item.serviceTypeName,
//                 work_shop: item.work_shop,
//                 coverImage: item.vehicle.coverImage,
//                 make: item.vehicle.make,
//                 model: item.vehicle.model,
//                 year: item.vehicle.year,
//                 color: item.vehicle.color,
//             }));
//             console.log("transformedData =",transformedData);
//             setPagination((prev) => ({
//                 ...prev,
//                 currentPage: response.meta.currentPage,
//                 lastPage: response.meta.lastPage,
//                 total: response.meta.total,
//               }));
//             setMaintenances(transformedData);
//         } catch (error) {
//             console.error("Error fetching vehicles:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const extractDatePart = (isoDate: string): string => {
//         const date = new Date(isoDate);
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
//         const day = String(date.getDate()).padStart(2, "0");
//         return `${year}-${month}-${day}`;
//     };
    
//     const handlePaginationChange = (event: React.ChangeEvent<unknown>, page: number) => {
//         setPagination((prev) => ({ ...prev, currentPage: page }));
//       };


//     return (
//         <Box>
//             <TableContainer>
//                 <Table>
//                     <TableHead>
//                         <TableRow>
//                             {[
//                                 "Make/Model",
//                                 "Plate Number",
//                                 "Start Date",
//                                 "Service",
//                                 "Status",
//                                 "Body Shop Location",
//                             ].map((heading) => (
//                                 <TableCell key={heading}>
//                                     <Typography variant="subtitle2" fontWeight="bold">
//                                         {heading}
//                                     </Typography>
//                                 </TableCell>
//                             ))}
//                         </TableRow>
//                     </TableHead>
//                     <TableBody>
//                         {maintenances.map((maintenance) => (
//                             <TableRow
//                                 key={maintenance.id}
//                                 onClick={() => onRowClick(maintenance.carId)}
//                                 sx={{ cursor: "pointer" }}
//                             >
//                                 <TableCell>
//                                     <Grid container spacing={2}>
//                                         <Grid size={4}>
//                                             <Avatar src={maintenance.coverImage } sx={{ width: 48, height: 48 }} />
//                                         </Grid>
//                                         <Grid size={8}>
//                                             <Typography variant="body1">
//                                                 {maintenance.make} {maintenance.model}
//                                             </Typography>
//                                             <Typography variant="body2" color="#0a122499">
//                                                 {maintenance.year} | {maintenance.color}
//                                             </Typography>
//                                         </Grid>
//                                     </Grid>
//                                 </TableCell>
//                                 <TableCell>{maintenance.plateNumber}</TableCell>
//                                 <TableCell>
//                                     <Typography variant="body2" noWrap>{maintenance.startTime}</Typography>
//                                 </TableCell>
//                                 <TableCell>{maintenance.serviceTypeName}</TableCell>
//                                 <TableCell>{maintenance.statusName}</TableCell>
//                                 <TableCell>{maintenance.work_shop}</TableCell>
//                             </TableRow>
//                         ))}
//                     </TableBody>
//                 </Table>
//             </TableContainer>
//             {/* Pagination */}
//             <Box display="flex" justifyContent="center" marginTop="16px">
//           <Pagination
//             count={pagination.lastPage}
//             page={pagination.currentPage}
//             onChange={handlePaginationChange}
//             variant="outlined"
//             shape="rounded"
//           />
//         </Box>
//         </Box>

//     );
// };

// export default MaintenanceTable;
