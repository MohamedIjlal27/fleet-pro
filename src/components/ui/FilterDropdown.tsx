import React, { useState } from 'react';
import {
    Box,
    Button,
    Popover,
    ToggleButtonGroup,
    ToggleButton,
    List,
    ListItem,
    ListItemText,
    styled
} from '@mui/material';

// Styled components for pixel-perfect UI
const FilterToggleButton = styled(ToggleButton)(({ theme }) => ({
    backgroundColor: '#F8FAFC',
    color: '#64748B',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '8px 12px',
    fontSize: '14px',
    textTransform: 'none',
    fontWeight: 500,
    flex: 1,
    '&.Mui-selected': {
        backgroundColor: '#EFF6FF',
        color: '#3B82F6',
        borderColor: '#E2E8F0',
    },
    '&:hover': {
        backgroundColor: '#F1F5F9',
    }
}));

const FilterToggleGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    gap: '8px',
    '& .MuiToggleButtonGroup-grouped': {
        margin: 0,
        border: '1px solid #E2E8F0',
        '&:not(:first-of-type)': {
            borderRadius: '16px',
            borderLeft: '1px solid #E2E8F0',
        },
        '&:first-of-type': {
            borderRadius: '16px',
        },
    }
}));

const FilterListItem = styled(ListItem)(({ theme }) => ({
    padding: '12px 16px',
    '&.Mui-selected': {
        backgroundColor: '#EFF6FF',
    },
    '&:hover': {
        backgroundColor: '#F1F5F9',
    }
}));

const ApplyFilterButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#3B82F6',
    color: 'white',
    borderRadius: '8px',
    padding: '12px',
    textTransform: 'none',
    fontWeight: 500,
    '&:hover': {
        backgroundColor: '#2563EB',
    }
}));

const FilterPopover = styled(Popover)(({ theme }) => ({
    '& .MuiPopover-paper': {
        borderRadius: '16px',
        boxShadow: '0px 4px 25px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        width: '320px'
    }
}));

export type FilterType = 'both' | 'vehicles' | 'assets';
export type FilterItem = {
    id: string;
    name: string;
    type: FilterType | 'all';
};

const defaultFilterItems: FilterItem[] = [
    // Powered Vehicles
    // { id: 'baggage-tractor-1', name: 'Baggage Tractors', type: 'vehicles' },
    // { id: 'belt-loader-1', name: 'Belt Loaders', type: 'vehicles' },
    // { id: 'powerstow-1', name: 'Powerstows', type: 'vehicles' },
    // { id: 'electric-tractor-1', name: 'Electric Tractors', type: 'vehicles' },
    // { id: 'pushback-q400-1', name: 'Pushback Tractors (Q400)', type: 'vehicles' },
    // { id: 'pushback-conv-1', name: 'Pushback Tractors (Conventional)', type: 'vehicles' },
    // { id: 'pushback-towbarless-1', name: 'Pushback Tractors (Towbarless)', type: 'vehicles' },
    // { id: 'portable-air-1', name: 'Portable Air Units', type: 'vehicles' },
    // { id: 'gpu-400hz-1', name: 'Ground Power Units (400Hz AC)', type: 'vehicles' },
    // { id: 'gpu-dual-1', name: 'Ground Power Units (Dual AC-DC)', type: 'vehicles' },
    // { id: 'gpu-28v-1', name: 'Ground Power Units (28V DC)', type: 'vehicles' },
    // { id: 'container-loader-1', name: 'Container Loaders', type: 'vehicles' },
    // { id: 'lavatory-truck-1', name: 'Lavatory Trucks', type: 'vehicles' },
    // { id: 'water-truck-1', name: 'Water Trucks', type: 'vehicles' },
    // { id: 'airstart-single-1', name: 'Airstart Units (Single/Dual)', type: 'vehicles' },
    // { id: 'airstart-triple-1', name: 'Airstart Units (Triple Hose)', type: 'vehicles' },
    // { id: 'pickup-tow-1', name: 'Pickup/Tow Support Vehicles', type: 'vehicles' },
    // { id: 'lavatory-cart-tractor-1', name: 'Lavatory Cart Tractors', type: 'vehicles' },

    // Non-Powered Assets
    // { id: 'towbar-b787-1', name: 'B787 Towbar', type: 'assets' },
    // { id: 'towbar-a220-1', name: 'A220 Towbar', type: 'assets' },
    // { id: 'towbar-b767-1', name: 'B767/A333 Towbar', type: 'assets' },
    // { id: 'towbar-a320-1', name: 'A319/320/321 Towbar', type: 'assets' },
    // { id: 'towbar-b737max-1', name: 'B737 Max Towbar', type: 'assets' },
    // { id: 'towbar-crj705-1', name: 'CRJ-705 Towbar', type: 'assets' },
    // { id: 'towbar-embraer-1', name: 'Embraer Towbar', type: 'assets' },
    // { id: 'towbar-b777-1', name: 'B777 Towbar', type: 'assets' },
    // { id: 'towbar-q400-1', name: 'Q400 Towbar', type: 'assets' },
    // { id: 'lavatory-cart-1', name: 'Lavatory Carts', type: 'assets' },
    // { id: 'wheelchair-lift-1', name: 'Wheelchair Lifts/Ramps', type: 'assets' },
    // { id: 'passenger-stairs-1', name: 'Passenger Stairs', type: 'assets' }
];

interface FilterDropdownProps {
    onFilterChange: (selectedType: FilterType, selectedItems: string[]) => void;
    items?: FilterItem[];
    defaultType?: FilterType;
    defaultSelected?: string[];
    simpleMode?: boolean; // Only show type selector without items list
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
    onFilterChange,
    items = defaultFilterItems,
    defaultType = 'both',
    defaultSelected = [],
    simpleMode = false,
}) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [selectedType, setSelectedType] = useState<FilterType>(defaultType);
    const [selectedItems, setSelectedItems] = useState<string[]>(defaultSelected);
    const [tempSelectedItems, setTempSelectedItems] = useState<string[]>(defaultSelected);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setTempSelectedItems([...selectedItems]);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleTypeChange = (
        event: React.MouseEvent<HTMLElement>,
        newType: FilterType | null,
    ) => {
        if (newType !== null) {
            setSelectedType(newType);
        }
    };

    const handleItemToggle = (itemId: string) => {
        setTempSelectedItems(prev => {
            const isSelected = prev.includes(itemId);
            if (isSelected) {
                return prev.filter(id => id !== itemId);
            } else {
                return [...prev, itemId];
            }
        });
    };

    const handleApplyFilter = () => {
        setSelectedItems(tempSelectedItems);
        onFilterChange(selectedType, tempSelectedItems);
        handleClose();
    };

    const open = Boolean(anchorEl);
    const id = open ? 'filter-popover' : undefined;

    // Filter items based on selected type
    const filteredItems = simpleMode ? [] : items.filter(item =>
        item.type === 'all' || item.type === selectedType || selectedType === 'both'
    );

    // Determine display value to show on button
    const displayValue = simpleMode
        ? selectedType.charAt(0).toUpperCase() + selectedType.slice(1) // Capitalize the type
        : (selectedItems.length
            ? selectedItems.length === 1
                ? items.find(item => item.id === selectedItems[0])?.name
                : `${selectedItems.length} items selected`
            : 'All');

    return (
        <>
            <Button
                aria-describedby={id}
                variant="outlined"
                onClick={handleClick}
                sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    backgroundColor: '#F1F3F5',
                    color: '#374151',
                    border: 'none',
                    padding: '8px 16px',
                    '&:hover': {
                        backgroundColor: '#E5E7EB',
                        border: 'none',
                    }
                }}
            >
                {displayValue}
            </Button>

            <FilterPopover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Box sx={{ p: 2, bgcolor: '#F8FAFC' }}>
                    <FilterToggleGroup
                        value={selectedType}
                        exclusive
                        onChange={handleTypeChange}
                        aria-label="filter type"
                        fullWidth
                    >
                        <FilterToggleButton value="both">All</FilterToggleButton>
                        <FilterToggleButton value="vehicles">Vehicle</FilterToggleButton>
                        <FilterToggleButton value="assets">Asset</FilterToggleButton>
                    </FilterToggleGroup>
                </Box>

                {!simpleMode && selectedType !== 'both' && (
                    <List component="div" sx={{ pt: 0, pb: 0, maxHeight: '300px', overflow: 'auto' }}>
                        {filteredItems.map((item) => (
                            <FilterListItem
                                key={item.id}
                                sx={{
                                    cursor: 'pointer',
                                    backgroundColor: tempSelectedItems.includes(item.id) ? '#EFF6FF' : 'transparent'
                                }}
                                onClick={() => handleItemToggle(item.id)}
                            >
                                <ListItemText primary={item.name} />
                            </FilterListItem>
                        ))}
                    </List>
                )}

                <Box sx={{ p: 2 }}>
                    <ApplyFilterButton
                        fullWidth
                        onClick={simpleMode ? () => {
                            onFilterChange(selectedType, []);
                            handleClose();
                        } : handleApplyFilter}
                    >
                        Apply Filter
                    </ApplyFilterButton>
                </Box>
            </FilterPopover>
        </>
    );
};

export default FilterDropdown;
