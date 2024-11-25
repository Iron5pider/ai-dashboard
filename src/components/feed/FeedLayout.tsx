"use client"

import React, { useState, useEffect, useRef } from 'react';
import { FeedHeader } from './FeedHeader/FeedHeader';
import { FeedGrid } from './FeedGrid';
import { VideoPlayer } from '@/components/feed/VideoPlayer/VideoPlayer';
import { useYoutubeData } from '../../hooks/useYoutubeData';
import { useFeedFilters } from '../../hooks/useFeedFilters';
import { Video } from '../../types/feed.types';

export const FeedLayout: React.FC = () => {
  const { filters, updateFilters } = useFeedFilters();
  const queryResult = useYoutubeData(filters);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const videoPlayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedVideo && 
          videoPlayerRef.current && 
          !videoPlayerRef.current.contains(event.target as Node)) {
        setSelectedVideo(null);
      }
    };

    if (selectedVideo) {
      document.addEventListener('mousedown', handleClickOutside);
      // Add escape key listener
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedVideo(null);
        }
      };
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [selectedVideo]);

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  return (
    <div className="relative min-h-screen">
      <FeedHeader
        filters={filters}
        updateFilters={updateFilters}
      />
      <div className="container mx-auto px-4 py-6">
        <FeedGrid 
          queryResult={queryResult} 
          onVideoSelect={handleVideoSelect}
        />
        {selectedVideo && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            aria-modal="true"
            role="dialog"
          >
            <div 
              ref={videoPlayerRef}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl"
            >
              <VideoPlayer
                video={selectedVideo}
                onClose={() => setSelectedVideo(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

