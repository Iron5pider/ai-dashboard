"use client"

import React, { useEffect } from 'react';
import { VideoCard } from '@/components/feed/VideoCard/VideoCard';
import { VideoCardSkeleton } from '@/components/feed/VideoCard/VideoCardSkeleton';
import { Video } from '../../types/feed.types';
import { useInView } from 'react-intersection-observer';
import { UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface FeedGridProps {
  queryResult: UseInfiniteQueryResult<InfiniteData<{
    videos: Video[];
    nextPageToken: string;
    totalResults: number;
  }>, Error>;
  onVideoSelect: (video: Video) => void;
}

export const FeedGrid: React.FC<FeedGridProps> = ({ queryResult, onVideoSelect }) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = queryResult;
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (error) {
    console.error('Feed error:', error);
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        Error loading videos. Please try again later.
        <pre className="text-xs mt-2">{error.message}</pre>
      </div>
    );
  }

  const videos = data?.pages.flatMap(page => page.videos) ?? [];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          Array(8).fill(null).map((_, i) => (
            <VideoCardSkeleton key={`skeleton-${i}`} />
          ))
        ) : (
          videos.map((video, index) => (
            <VideoCard
              key={`${video.id}-${index}`}
              video={video}
              onSelect={() => onVideoSelect(video)}
              onSave={(id) => console.log('Save video', id)}
              onShare={(id) => console.log('Share video', id)}
            />
          ))
        )}
      </div>
      
      {(hasNextPage || isFetchingNextPage) && (
        <div ref={ref} className="flex justify-center p-4">
          <VideoCardSkeleton />
        </div>
      )}
    </div>
  );
};

