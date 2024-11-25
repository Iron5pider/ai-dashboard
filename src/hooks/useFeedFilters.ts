"use client"

import { useState, useCallback } from 'react';
import { FeedFilters } from '../types/feed.types';

export const useFeedFilters = () => {
  const [filters, setFilters] = useState<FeedFilters>({
    search: 'AI coding practices',
    category: 'coding tutorials',
    sortBy: 'relevance',
    duration: 'all',
    level: 'all',
  });

  const updateFilters = useCallback((newFilters: Partial<FeedFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return { filters, updateFilters };
};
