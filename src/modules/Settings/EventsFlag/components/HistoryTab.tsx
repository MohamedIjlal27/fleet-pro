import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Bell, Calendar, Truck, User, AlertCircle, Mail, MessageSquare } from 'lucide-react';
import { fetchAlerts, fetchAlertFilterOptions } from '@/modules/core/apis/apis';
import { INotification } from '@/modules/core/interfaces/interfaces';
import { Pagination } from '@/components/ui/pagination';

interface FilterOptions {
  vehicles: { id: number; name: string }[];
  drivers: { id: number; name: string }[];
  alertTypes: string[];
}

const HistoryTab: React.FC = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedQuery, setDebouncedQuery] = useState('');
	const [selectedVehicle, setSelectedVehicle] = useState<string>('');
	const [selectedAlertType, setSelectedAlertType] = useState<string>('');
	const [selectedDriver, setSelectedDriver] = useState<string>('');
	const [totalPages, setTotalPages] = useState<number>(1);
	const [currentPage, setCurrentPage] = useState(1);
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [notifications, setNotifications] = useState<INotification[]>([]);
	const [filterOptions, setFilterOptions] = useState<FilterOptions>({
		vehicles: [],
		drivers: [],
		alertTypes: []
	});

	useEffect(() => {
		loadAlertFilterOptions();
		loadAlerts(currentPage);
	}, []);

	useEffect(() => {
		loadAlerts(currentPage, debouncedQuery);
	}, [currentPage, debouncedQuery]);

	useEffect(() => {
		loadAlerts(currentPage, debouncedQuery, selectedVehicle, selectedAlertType, selectedDriver);
	}, [selectedVehicle, selectedAlertType, selectedDriver]);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedQuery(searchQuery);
		}, 500);
	
		return () => {
			clearTimeout(handler);
		};
	}, [searchQuery]);

	const loadAlerts = async (
		page: number = 1,
		search: string = '',
		vehicleId: string = '',
		alertType: string = '',
		driverId: string = ''
	) => {
		try {
			const response = await fetchAlerts(page, search, vehicleId, alertType, driverId);
			//console.log('Alerts response:', response);

			setNotifications(response.data);
			setTotalPages(response.meta?.lastPage);
		} catch (error) {
			console.error('Error loading alerts:', error);
		}
	};

	const loadAlertFilterOptions = async () => {
		try {
			const response = await fetchAlertFilterOptions();
			//console.log('Alert filter response:', response);

			setFilterOptions(response);
		} catch (error) {
			console.error('Error loading alert filter option:', error);
		}
	};

    // Sample data for demonstration
    // const notifications = [
    //     {
    //         id: 'n1',
    //         alertType: 'Speed Control Alert',
    //         icon: 'speed',
    //         timestamp: '2025-04-13 09:32:45',
    //         vehicleId: 'VH-4872',
    //         driverName: 'Michael Chen',
    //         vehicleType: 'Delivery Van',
    //         status: 'Pending',
    //         channels: ['portal', 'sms', 'email']
    //     },
    //     {
    //         id: 'n2',
    //         alertType: 'Harsh Driving',
    //         icon: 'driving',
    //         timestamp: '2025-04-13 08:17:22',
    //         vehicleId: 'VH-3061',
    //         driverName: 'Sarah Johnson',
    //         vehicleType: 'Heavy Truck',
    //         status: 'Resolved',
    //         channels: ['portal', 'email']
    //     },
    //     {
    //         id: 'n3',
    //         alertType: 'Driver Fatigue',
    //         icon: 'fatigue',
    //         timestamp: '2025-04-12 23:45:10',
    //         vehicleId: 'VH-1259',
    //         driverName: 'James Wilson',
    //         vehicleType: 'Sedan',
    //         status: 'Pending',
    //         channels: ['portal', 'sms']
    //     }
    // ];

    // Get icon component based on alert type
    const getAlertIcon = (iconType: string) => {
        switch (iconType) {
            case 'speed':
                return <AlertCircle className="text-red-500" />;
            case 'driving':
                return <AlertCircle className="text-orange-500" />;
            case 'fatigue':
                return <AlertCircle className="text-purple-500" />;
            default:
                return <Bell />;
        }
    };

    // Get channel icon component
    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case 'portal':
                return <Bell size={16} className="text-blue-600" />;
            case 'sms':
                return <MessageSquare size={16} className="text-green-600" />;
            case 'email':
                return <Mail size={16} className="text-purple-600" />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                    <Bell className="text-blue-600" size={24} />
                    <h2 className="text-xl font-semibold text-gray-800">Alerts History</h2>
                </div>
                <div className="flex space-x-2">
                    <button
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        onClick={() => setFiltersOpen(!filtersOpen)}
                    >
                        <Filter size={16} className="mr-2" />
                        <span>Filters</span>
                    </button>
                    {/* <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        Export Report
                    </button> */}
                </div>
            </div>

            {/* Search and Filter */}
            <div className="mb-6">
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search alerts..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>

                {filtersOpen && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                            <div className="flex items-center border border-gray-300 rounded-md bg-white">
                                <div className="p-2 border-r border-gray-300">
                                    <Calendar size={16} className="text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Select dates"
                                    className="p-2 w-full focus:outline-none"
                                />
                            </div>
                        </div> */}

												<div>
														<label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
														<select
															className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none"
															value={selectedVehicle}
															onChange={(e) => setSelectedVehicle(e.target.value)}
														>
																<option value="">All Vehicles</option>
																{filterOptions?.vehicles?.map(vehicle => (
																	<option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>
																))}
														</select>
												</div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alert Type</label>
                            <select
															className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none"
															value={selectedAlertType}
															onChange={(e) => setSelectedAlertType(e.target.value)}
														>
                                <option value="">All Alert Types</option>
                                {filterOptions?.alertTypes?.map((alertType, index) => (
																	<option key={index} value={alertType}>{alertType}</option>
																))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                            <select
															className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none"
															value={selectedDriver}
  														onChange={(e) => setSelectedDriver(e.target.value)}
														>
                                <option value="">All Drivers</option>
                                {filterOptions?.drivers?.map(driver => (
																	<option key={driver.id} value={driver.id}>{driver.name}</option>
																))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Events Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alert Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channels</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {notifications.map((notification) => (
                            <tr key={notification.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="mr-2">
                                            {getAlertIcon(notification.sensitivity)}
                                        </div>
                                        <span className="block">
																					<span className="mb-1.5 block  text-theme-sm text-gray-500 dark:text-gray-400 space-x-1">
																						<span> {notification.title}</span>
																						<span className="block font-medium text-gray-800 dark:text-white/90">
                                              {notification.description.split('\n').map((line, index) => (
                                                <React.Fragment key={index}>
                                                  {line}
                                                  <br />
                                                </React.Fragment>
                                              ))}
																						</span>
																					</span>

																					{/* {notification.note && (
																						<span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
																							<span>{notification.note}</span>
																						</span>
																					)} */}
																				</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Truck size={16} className="mr-2 text-gray-400" />
																				<a
																					href={`/vehicle/${notification.vehicleId}`}
																					className="font-medium text-blue-600 underline"
																				>
                                        	{notification.vehicleId}
																				</a>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <User size={16} className="mr-2 text-gray-400" />
                                        {notification.assignedDriver?.firstName} {notification.assignedDriver?.lastName}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {notification.vehicle?.category}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${notification.read === true
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {notification.read ? 'Read' : 'New'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex space-x-2">
																			<div className="tooltip" title="portal">
																					{getChannelIcon("portal")}
																			</div>
																			{notification.sendSms && (
																					<div className="tooltip" title="sms">
																							{getChannelIcon("sms")}
																					</div>
																			)}
																			{notification.sendEmail && (
																					<div className="tooltip" title="email">
																							{getChannelIcon("email")}
																					</div>
																			)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Previous
                    </button>
                    <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
									<Pagination
										totalPages={totalPages}
										currentPage={currentPage}
										onPageChange={setCurrentPage}
									/>
                    {/* <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of{" "}
                            <span className="font-medium">12</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>
                            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600 hover:bg-blue-100">
                                1
                            </button>
                            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                2
                            </button>
                            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                3
                            </button>
                            <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default HistoryTab;
