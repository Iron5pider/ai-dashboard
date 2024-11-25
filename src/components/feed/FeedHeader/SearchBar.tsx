"use client"

import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  search: string;
  updateSearch: (search: string) => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ search, updateSearch, className }) => {
  const [localSearch, setLocalSearch] = useState(search);

  const debouncedUpdateSearch = useDebouncedCallback(
    (value: string) => updateSearch(value),
    300
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalSearch(newValue);
    debouncedUpdateSearch(newValue);
  }, [debouncedUpdateSearch]);

  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search videos..."
        value={localSearch}
        onChange={handleSearchChange}
        className="h-9 w-full pl-8 bg-muted"
      />
    </div>
  );
};

