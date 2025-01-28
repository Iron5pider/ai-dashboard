"use client"

import { useInfiniteQuery } from '@tanstack/react-query';
import { FeedFilters, FeedResponse } from '../types/feed.types';
import { searchVideos } from '../services/youtube.service';

export const useYoutubeData = (filters: FeedFilters) => {
  return useInfiniteQuery<FeedResponse>({
    queryKey: ['youtubeVideos', filters.search, filters.duration, filters.level, filters.category, filters.sortBy],
    initialPageParam: '',
    queryFn: async ({ pageParam }) => {
      // Construct search query based on filters
      const searchQuery = [
        filters.search,
        filters.level !== 'all' ? filters.level : '',
        filters.category,
        'tutorial',
      ].filter(Boolean).join(' ');

      const response = await searchVideos({
        q: searchQuery,
        maxResults: 20,
        pageToken: pageParam as string,
        type: 'video',
        videoDuration: filters.duration === 'all' ? undefined : filters.duration,
        order: filters.sortBy,
      });

      return {
        videos: response.videos,
        nextPageToken: response.nextPageToken,
        totalResults: response.totalResults,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken || undefined,
  });
};

