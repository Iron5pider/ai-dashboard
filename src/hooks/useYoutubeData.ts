"use client"

import { useInfiniteQuery } from '@tanstack/react-query';
import { Video, FeedFilters } from '../types/feed.types';
import { searchVideos } from '../services/youtube.service';

export const useYoutubeData = (filters: FeedFilters) => {
  return useInfiniteQuery({
    queryKey: ['youtubeVideos', filters.search, filters.duration, filters.level],
    initialPageParam: '',
    queryFn: async ({ pageParam }) => {
      // Construct search query based on filters
      const searchQuery = [
        filters.search,
        filters.level !== 'all' ? filters.level : '',
        'tutorial',
      ].filter(Boolean).join(' ');

      const response = await searchVideos({
        q: searchQuery,
        maxResults: 20,
        pageToken: pageParam as string,
        type: 'video',
        videoDuration: filters.duration === 'all' ? undefined : filters.duration,
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

