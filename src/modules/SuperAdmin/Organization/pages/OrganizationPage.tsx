import { useEffect, useState } from 'react';
import axiosInstance from '../../../../utils/axiosConfig';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { IOrganization  } from '../interfaces/organization.interface';
import  OrganizationModal  from '../components/AddOrganizationModal';
import { toast } from 'react-toastify';
import EditOrganizationModal from '../components/EditOrganizationModal';

export const OrganizationPage = () => {
  const [organizations, setOrganizations] = useState<IOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fecthList = () => {
    axiosInstance.get('/api/organizations')
      .then(response => {
        setOrganizations(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
        toast.error('Error fetching organizations');
      });
  };

  const handleDelete = (id: number) => {
    console.log("handleDelete", id);
    //are you sure?
    if (window.confirm('Are you sure you want to delete this organization?')) {
      axiosInstance.delete(`/api/organizations/${id}`)
        .then(response => {
          console.log(response);
          toast.success('Organization deleted successfully');
          fecthList();
        })  
        .catch(error => {
          console.log("Delete error", error);
          toast.error('Error deleting organization');
        });
    }
  };



  useEffect(() => {
    console.log("OrganizationPage");
    fecthList();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Box display="flex-col" height="100vh" bgcolor="#f4f6f8">
      {/* Left Side (1 Part) */}
      <Box flex={1} p={2} sx={{ backgroundColor: '#e0e0e0' }}>
        <div className="flex justify-center">
            <OrganizationModal fecthList={fecthList} organization={null}/>
        </div>

        <Box mt={4}>
          {/* <TextField
            label="Filter by Make"
            variant="outlined"
            fullWidth
            value={filter}
            onChange={handleFilterChange}
          /> */}
        </Box>
      </Box>

      {/* Right Side (3 Parts) */}
      <Box flex={3} p={2}>
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Province</TableCell>
                <TableCell>Postal Code</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {organizations.map((organization: IOrganization) => (
                <TableRow key={organization.id}>
                  <TableCell>{organization.name}</TableCell>
                  <TableCell>{organization.email}</TableCell>
                  <TableCell>{organization.phoneNumber}</TableCell>
                  <TableCell>{organization.address}</TableCell>
                  <TableCell>{organization.city}</TableCell>
                  <TableCell>{organization.province}</TableCell>
                  <TableCell>{organization.postalCode}</TableCell>
                  <TableCell>{organization.country}</TableCell>
                  <TableCell>
                    <EditOrganizationModal fecthList={fecthList} organization={organization}/>
                    <Button variant="contained" color="error" onClick={() => handleDelete(organization.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {/* <AddOrganizationModal 
      /> */}
    </Box>
  );
};
