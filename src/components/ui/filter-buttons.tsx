import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterOption {
  key: string;
  label: string;
}

interface FilterGroup {
  title: string;
  options: FilterOption[];
}

interface FilterButtonsProps {
  filterGroups: FilterGroup[];
  onFilterChange?: (filters: Record<string, boolean>) => void;
}

export default function FilterButtons({
  filterGroups,
  onFilterChange,
}: Readonly<FilterButtonsProps>) {
  // Initialize filter state dynamically based on props
  const initialFilters = filterGroups.reduce((acc, group) => {
    group.options.forEach((option) => {
      acc[option.key] = false;
    });
    return acc;
  }, {} as Record<string, boolean>);

  const [filters, setFilters] = useState(initialFilters);

  const handleFilterChange = (key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: !prev[key] };
      onFilterChange?.(newFilters);
      return newFilters;
    });
  };

  return (
    <div className="flex flex-wrap place-self-start gap-2 dark:bg-white/[0.03]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 dark:bg-white/[0.03] dark:text-gray-300 dark:focus:bg-white/[0.05] bg-transparent border-transparent dark:border-transparent dark:hover:bg-white/[0.05] dark:hover:text-gray-100"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
            {Object.values(filters).some(Boolean) && (
              <span className="ml-1 rounded-full  w-2 h-2 dark:bg-white/[0.03] " />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-auto bg-white dark:bg-gray-800 dark:border-gray-700 p-5"
        >
          <DropdownMenuLabel className="dark:text-gray-100">
            Filter by
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="dark:bg-gray-700" />
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 p-4">
            {filterGroups.map((group, index) => (
              <div key={group.title} className="col-span-1">
                {index > 0}
                <DropdownMenuLabel className="text-xs text-neutral-500 pt-2 dark:text-neutral-400">
                  {group.title}
                </DropdownMenuLabel>
                {group.options.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.key}
                    checked={filters[option.key]}
                    onCheckedChange={() => handleFilterChange(option.key)}
                    onSelect={(event) => event.preventDefault()}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-100 dark:focus:bg-gray-700"
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
