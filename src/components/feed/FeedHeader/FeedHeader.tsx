"use client"

import React from 'react';
import { SearchBar } from './SearchBar';
import { FilterControls } from './FilterControls';
import { FeedFilters } from '../../../types/feed.types';

interface FeedHeaderProps {
  filters: FeedFilters;
  updateFilters: (newFilters: Partial<FeedFilters>) => void;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  filters,
  updateFilters,
}) => {
  return (
    <div className="sticky top-14 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <div className="flex-1 max-w-2xl">
          <SearchBar 
            search={filters.search} 
            updateSearch={(search) => updateFilters({ search })} 
          />
        </div>
        <FilterControls
          filters={filters}
          updateFilters={updateFilters}
        />
      </div>
    </div>
  );
};

