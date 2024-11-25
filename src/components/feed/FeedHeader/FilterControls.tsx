import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FeedFilters } from '../../../types/feed.types';

interface FilterControlsProps {
  filters: FeedFilters;
  updateFilters: (newFilters: Partial<FeedFilters>) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  updateFilters,
}) => {
  return (
    <div className="flex space-x-4">
      <Select value={filters.duration} onValueChange={(value: FeedFilters['duration']) => updateFilters({ duration: value })}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Duration" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Durations</SelectItem>
          <SelectItem value="short">Short (&lt;10 mins)</SelectItem>
          <SelectItem value="medium">Medium (10-30 mins)</SelectItem>
          <SelectItem value="long">Long (&gt;30 mins)</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.level} onValueChange={(value: FeedFilters['level']) => updateFilters({ level: value })}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Learning Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="beginner">Beginner</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
          <SelectItem value="advanced">Advanced</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

