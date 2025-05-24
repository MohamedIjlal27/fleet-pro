import { useEffect, useState } from 'react';
import {
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Input,
  Typography,
  Divider,
  Link,
  Avatar,
} from '@mui/material';
import {
  fetchLeads,
  createLead,
  updateLead,
  deleteLead,
  sendText,
  fetchUsers,
} from '../apis/apis';
import { toast } from 'react-toastify';
import { systemPlan, systemModule } from '@/utils/constants';
import { checkRoleExists, checkPermissionExists } from '@/lib/roleUtils';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from '@/modules/core/pages/Error404Page';
import LockedFeature from '@/modules/core/components/LockedFeature';
import {
  UserPlus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  MessageSquare,
  Upload,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const LeadsPage: React.FC = () => {
  if (!checkModuleExists(systemModule.Leads)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Leads" />
    ) : (
      <Error404Page />
    );
  }
  const permissionLeadsAssign = checkPermissionExists(
    'LeadAndCustomerManagement_Leads_Assign'
  );

  const [data, setData] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [importMode, setImportMode] = useState(false);
  const [currentLead, setCurrentLead] = useState({
    id: 0,
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    assigneeId: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const defaultPagin = {
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
  };
  const [pagination, setPagination] = useState(defaultPagin);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState('createdAt');
  const [filter, setFilter] = useState<string>('');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');

  // Fetch leads data from the API
  useEffect(() => {
    loadLeads();
    loadUsers();
  }, []);

  useEffect(() => {
    loadLeads();
  }, [pagination.currentPage, sortBy, sortOrder]);

  const loadUsers = async () => {
    const usersData = await fetchUsers();
    setUsers(usersData);
  };

  const loadLeads = async () => {
    const response = await fetchLeads(
      pagination.currentPage,
      pagination.perPage,
      sortBy || 'createdAt',
      sortOrder || 'asc',
      filter || ''
    );
    if (response?.data) {
      setData(response.data);
      setPagination((prev) => ({
        ...prev,
        currentPage: response.meta.currentPage,
        lastPage: response.meta.lastPage,
        total: response.meta.total,
      }));
    }
  };

  const handleRequestSort = (property: string) => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  const handleOpenNew = () => {
    setEditMode(false);
    setImportMode(false);
    setCurrentLead({
      id: 0,
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      assigneeId: '',
    });
    setOpen(true);
  };

  const handleOpenEdit = (lead: any) => {
    setEditMode(true);
    setImportMode(false);
    setCurrentLead({
      id: lead.id,
      firstName: lead.firstName,
      lastName: lead.lastName,
      phone: lead.phone,
      email: lead.email,
      assigneeId: lead.assigneeId,
    });
    setOpen(true);
  };

  const handleOpenImport = () => {
    setImportMode(true);
    setEditMode(false);
    setCurrentLead({
      id: 0,
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      assigneeId: '',
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (importMode) {
      // Handle import file upload
      alert('Import functionality goes here');
    } else if (editMode) {
      // Update existing lead via API
      try {
        const updatedLead = await updateLead(currentLead.id, {
          email: currentLead.email,
          firstName: currentLead.firstName,
          lastName: currentLead.lastName,
          phone: currentLead.phone,
          assigneeId: Number(currentLead.assigneeId),
        });
        loadLeads();
        toast.success('Lead updated successfully.');
      } catch (error) {
        console.error('Error updating lead:', error);
      }
    } else {
      // Create new lead via API
      try {
        const createdLead = await createLead({
          email: currentLead.email,
          firstName: currentLead.firstName,
          lastName: currentLead.lastName,
          phone: currentLead.phone,
          assigneeId: Number(currentLead.assigneeId),
        });
        loadLeads();
        toast.success('Lead created successfully.');
      } catch (error) {
        console.error('Error creating lead:', error);
      }
    }

    handleClose();
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this lead?'
    );

    if (isConfirmed) {
      try {
        await deleteLead(id); // Call the delete API function
        setData((prevData) => prevData.filter((item) => item.id !== id));
        toast.success('Lead deleted successfully.');
      } catch (error: any) {
        console.log('Error deleting lead: ' + error.message);
      }
    }
  };

  const handleSendText = async (id: number) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to text this lead?'
    );

    if (isConfirmed) {
      setLoading(true);
      try {
        await sendText(id);
        toast.success('Text sent successfully.');
      } catch (error: any) {
        console.log('Error sending text: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle search change for filters
  const handleFilterChange = () => {
    setPagination(defaultPagin);
    loadLeads();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    if (file.type !== 'text/csv') {
      toast.error('Only CSV files are allowed.');
      return;
    }

    setFileName(file.name); // Save file name for reference
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      parseCSV(content);
    };

    reader.readAsText(file);
  };

  const parseCSV = (content: string) => {
    try {
      const rows = content
        .split('\n')
        .map((row) => row.trim())
        .filter((row) => row);

      if (rows.length === 0) {
        toast.error('CSV is empty.');
        return;
      }

      // Assuming first row contains headers
      const headers = rows[0].split(',').map((header) => header.trim());
      const data = rows.slice(1).map((row) => {
        const values = row.split(',').map((value) => value.trim());
        return headers.reduce((acc, header, index) => {
          acc[header] = values[index] || null;
          return acc;
        }, {} as Record<string, any>);
      });

      setCsvData(data);
      toast.success('CSV parsed successfully.');
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast.error('Failed to parse the CSV. Please check its format.');
    }
  };

  const handleSubmit = async () => {
    if (!csvData.length) {
      toast.error('No data to submit. Please upload a valid CSV file.');
      return;
    }

    try {
      for (const lead of csvData) {
        try {
          const createdLead = await createLead({
            email: lead['Email'],
            firstName: lead['First Name'],
            lastName: lead['Last Name'],
            phone: lead['Phone'],
          });

          toast.success(
            `Lead for ${lead['First Name']} ${lead['Last Name']} created successfully.`
          );
        } catch (error: any) {
          toast.error(
            `Failed to create lead for ${lead['First Name']} ${lead['Last Name']}: ${error.message}`
          );
        }
      }

      setCsvData([]);
      setFileName('');
      loadLeads(); // Refresh the lead list after all submissions
      handleClose();
    } catch (error: any) {
      console.error('Error processing CSV data:', error.message);
      toast.error('Failed to process CSV data. Please try again.');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Lead Management
            </h1>
            <div className="flex space-x-2">
              <button
                className="bg-gray-200 text-[#0A1224] px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-indigo-600"
                onClick={handleOpenImport}
              >
                <Upload size={20} />
                <span>Import</span>
              </button>
              <button
                className="bg-[#0A1224] text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-gray-800"
                onClick={handleOpenNew}
              >
                <UserPlus size={20} />
                <span>Create</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="First Name, Last Name, Phone or Email"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onBlur={handleFilterChange}
            />
          </div>
        </div>

        {/* Leads Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400/50">
              <Table className="border-b-2">
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs cursor-pointer"
                      onClick={() => handleRequestSort('id')}
                    >
                      <div className="flex items-center">
                        <span>ID</span>
                        {sortBy === 'id' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs cursor-pointer"
                      onClick={() => handleRequestSort('createdAt')}
                    >
                      <div className="flex items-center">
                        <span>Created At</span>
                        {sortBy === 'createdAt' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs cursor-pointer"
                      onClick={() => handleRequestSort('firstName')}
                    >
                      <div className="flex items-center">
                        <span>First Name</span>
                        {sortBy === 'firstName' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs cursor-pointer"
                      onClick={() => handleRequestSort('lastName')}
                    >
                      <div className="flex items-center">
                        <span>Last Name</span>
                        {sortBy === 'lastName' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs cursor-pointer"
                      onClick={() => handleRequestSort('phone')}
                    >
                      <div className="flex items-center">
                        <span>Phone</span>
                        {sortBy === 'phone' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs cursor-pointer"
                      onClick={() => handleRequestSort('email')}
                    >
                      <div className="flex items-center">
                        <span>Email</span>
                        {sortBy === 'email' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    {permissionLeadsAssign && (
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs"
                      >
                        Assignee
                      </TableCell>
                    )}
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100">
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-5 py-4 text-gray-800 text-theme-sm">
                        {item.id}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-theme-sm">
                        {new Date(item.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-theme-sm">
                        {item.firstName}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-theme-sm">
                        {item.lastName}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-theme-sm">
                        {item.phone}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-theme-sm">
                        {item.email}
                      </TableCell>
                      {permissionLeadsAssign && (
                        <TableCell className="px-5 py-4 text-gray-800 text-theme-sm">
                          {item.assignee?.firstName} {item.assignee?.lastName}
                        </TableCell>
                      )}
                      <TableCell className="px-5 py-4 text-gray-800 text-theme-sm">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                            <MoreVertical className="h-4 w-4 text-gray-600" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleSendText(item.id)}
                            >
                              <MessageSquare className="h-4 w-4 text-green-500" />
                              <span className="text-green-500">Send Text</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleOpenEdit(item)}
                            >
                              <Edit className="h-4 w-4 text-blue-500" />
                              <span className="text-blue-500">Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center space-x-2 text-red-600 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                              <span className="text-red-500">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-center p-4">
              <Pagination
                totalPages={pagination.lastPage}
                currentPage={pagination.currentPage}
                onPageChange={(page) =>
                  setPagination((prev) => ({ ...prev, currentPage: page }))
                }
              />
            </div>
          </div>
        </div>

        {/* Dialog for Create/Edit/Import Lead */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {importMode
              ? 'Import Leads'
              : editMode
              ? 'Edit Lead'
              : 'Create New Lead'}
          </DialogTitle>
          <DialogContent>
            {importMode ? (
              <div className="mt-4 space-y-4">
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  * Indicates a required field
                </Typography>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  * Select your CSV file
                </Typography>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    inputProps={{ accept: '.csv' }}
                    className="mb-4"
                  />

                  {fileName && (
                    <Typography variant="subtitle1" color="textSecondary">
                      Selected File: {fileName}
                    </Typography>
                  )}
                </div>

                <div className="mt-4">
                  <Typography variant="subtitle1" className="font-medium">
                    Directions
                  </Typography>
                  <ul className="list-disc pl-5 mt-2 text-gray-600">
                    <li>Ensure that your CSV file is no larger than 5MB.</li>
                    <li>Make sure the first row contains column headers.</li>
                  </ul>
                </div>

                <Divider className="my-4" />

                <div>
                  <Typography variant="subtitle1" className="font-medium">
                    CSV Example
                  </Typography>
                  <Link
                    target="_blank"
                    href="/download/csv/tpl-import-leads.csv"
                    className="text-blue-600 hover:underline"
                  >
                    tpl-import-leads.csv
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <TextField
                  autoFocus
                  margin="dense"
                  label="First Name"
                  name="firstName"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={currentLead.firstName}
                  onChange={(e) =>
                    setCurrentLead({
                      ...currentLead,
                      firstName: e.target.value,
                    })
                  }
                  required
                  className="mb-4"
                />
                <TextField
                  margin="dense"
                  label="Last Name"
                  name="lastName"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={currentLead.lastName}
                  onChange={(e) =>
                    setCurrentLead({ ...currentLead, lastName: e.target.value })
                  }
                  required
                  className="mb-4"
                />
                <TextField
                  margin="dense"
                  label="Phone"
                  name="phone"
                  type="tel"
                  fullWidth
                  variant="outlined"
                  value={currentLead.phone}
                  onChange={(e) =>
                    setCurrentLead({ ...currentLead, phone: e.target.value })
                  }
                  required
                  className="mb-4"
                />
                <TextField
                  margin="dense"
                  label="Email"
                  name="email"
                  type="email"
                  fullWidth
                  variant="outlined"
                  value={currentLead.email}
                  onChange={(e) =>
                    setCurrentLead({ ...currentLead, email: e.target.value })
                  }
                  required
                  className="mb-4"
                />
                {permissionLeadsAssign && (
                  <TextField
                    select
                    margin="dense"
                    label="Assignee"
                    name="assigneeId"
                    fullWidth
                    variant="outlined"
                    value={currentLead.assigneeId || ''}
                    onChange={(e) =>
                      setCurrentLead({
                        ...currentLead,
                        assigneeId: e.target.value,
                      })
                    }
                    InputLabelProps={{ shrink: true }}
                    required
                    className="mb-4"
                  >
                    <MenuItem value="" disabled>
                      Please select ...
                    </MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </div>
            )}
          </DialogContent>
          <DialogActions className="p-4">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Close
            </button>
            {importMode ? (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
            )}
          </DialogActions>
        </Dialog>
      </main>
    </div>
  );
};

export default LeadsPage;
