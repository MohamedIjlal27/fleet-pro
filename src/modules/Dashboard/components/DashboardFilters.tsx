import React, { useState, useEffect } from 'react';
import { MenuItem, SelectChangeEvent, Select, Button } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axiosInstance from '../../../utils/axiosConfig';
import { DashboardFilterParams } from '../apis/apis';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

interface Garage {
    id: number;
    name: string;
    garageGroup?: string;
}

const frequencies = ['weekly', 'monthly', 'yearly'];

interface DashboardFiltersProps {
    onFilterChange?: (filters: DashboardFilterParams) => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({ onFilterChange }) => {
    const [garageGroups, setGarageGroups] = useState<string[]>([]);
    const [garages, setGarages] = useState<Garage[]>([]);
    const [filteredGarages, setFilteredGarages] = useState<Garage[]>([]);

    const [selectedGarageGroup, setSelectedGarageGroup] = useState<string>('');
    const [selectedGarageId, setSelectedGarageId] = useState<number | ''>('');
    const [selectedFrequency, setSelectedFrequency] = useState<string>(frequencies[0]);

    useEffect(() => {
        const fetchGarages = async () => {
            try {
                const response = await axiosInstance.get('/api/garages');
                const allGarages = response.data || [];
                setGarages(allGarages);
                setFilteredGarages(allGarages);

                const uniqueGarageGroups = Array.from(
                    new Set(allGarages.map((g: any) => g.garageGroup).filter(Boolean))
                ) as string[];

                setGarageGroups(uniqueGarageGroups);
            } catch (error) {
                console.error('Error fetching garage data:', error);
                setGarages([]);
                setFilteredGarages([]);
                setGarageGroups([]);
            }
        };

        fetchGarages();
    }, []);

    useEffect(() => {
        if (selectedGarageGroup) {
            const filtered = garages.filter(
                (garage) => garage.garageGroup === selectedGarageGroup
            );
            setFilteredGarages(filtered);

            if (selectedGarageId !== '' && !filtered.some((g) => g.id === selectedGarageId)) {
                setSelectedGarageId('');
            }
        } else {
            setFilteredGarages(garages);
        }
    }, [selectedGarageGroup, garages, selectedGarageId]);

    const updateFilters = (overrides: Partial<DashboardFilterParams> = {}) => {
			if (onFilterChange) {
				const filters: DashboardFilterParams = {
					garageGroup: selectedGarageGroup,
					garageId: selectedGarageId !== '' ? selectedGarageId : undefined,
					frequency: selectedFrequency,
					...overrides,
				};
				onFilterChange(filters);
			}
    };

    const handleGarageGroupChange = (event: SelectChangeEvent<string>) => {
			const group = event.target.value;
			setSelectedGarageGroup(group);
			updateFilters({ garageGroup: group });
    };

    const handleGarageChange = (event: SelectChangeEvent<string>) => {
			const id = event.target.value === '' ? '' : Number(event.target.value);
			setSelectedGarageId(id);
			updateFilters({ garageId: id === '' ? undefined : id });
    };

    const handleFrequencyChange = (event: SelectChangeEvent<string>) => {
			const freq = event.target.value;
			setSelectedFrequency(freq);
			updateFilters({ frequency: freq });
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="flex flex-wrap items-center gap-3 px-4">
                {/* Garage Group Filter */}
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 hover:bg-gray-200">
                    <BusinessIcon fontSize="small" className="mr-2" />
                    <select
                        value={selectedGarageGroup}
                        onChange={(e) =>
                            handleGarageGroupChange({ target: { value: e.target.value } } as any)
                        }
                        className="bg-transparent outline-none text-sm"
                    >
                        <option value="">All Garage Groups</option>
                        {garageGroups.map((group) => (
                            <option key={group} value={group}>
                                {group}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Garage Filter */}
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 hover:bg-gray-200">
                    <StoreIcon fontSize="small" className="mr-2" />
                    <select
                        value={selectedGarageId.toString()}
                        onChange={(e) =>
                            handleGarageChange({ target: { value: e.target.value } } as any)
                        }
                        className="bg-transparent outline-none text-sm"
                    >
                        <option value="">All Garages</option>
                        {filteredGarages.map((garage) => (
                            <option key={garage.id} value={garage.id.toString()}>
                                {garage.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Frequency Filter */}
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 hover:bg-gray-200">
                    <span className="text-sm mr-2">Frequency:</span>
                    <select
                        value={selectedFrequency}
                        onChange={(e) =>
                            handleFrequencyChange({ target: { value: e.target.value } } as any)
                        }
                        className="bg-transparent outline-none text-sm"
                    >
                        {frequencies.map((freq) => (
                            <option key={freq} value={freq}>
                                {freq.charAt(0).toUpperCase() + freq.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </LocalizationProvider>
    );
};

export default DashboardFilters;