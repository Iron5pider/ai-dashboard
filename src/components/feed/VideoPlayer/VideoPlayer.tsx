"use client"

import React, { useEffect, useState } from 'react';
import { X, BookOpen, Clock, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Video } from '../../../types/feed.types';
import { useLearningPaths } from '@/hooks/useLearningPaths';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onClose }) => {
  const { getPathForVideo, updateProgress } = useLearningPaths();
  const [watchTime, setWatchTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const pathInfo = getPathForVideo(video);

  // Track watch time
  useEffect(() => {
    const interval = setInterval(() => {
      setWatchTime(prev => prev + 1);
    }, 60000); // Every minute

    return () => {
      clearInterval(interval);
      if (watchTime > 0) {
        updateProgress(video, watchTime);
      }
    };
  }, [video, updateProgress, watchTime]);

  // Simulate loading sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-300">
      <Card className={cn(
        "relative w-full max-w-4xl transform transition-all duration-500",
        isLoading ? "scale-95 opacity-0" : "scale-100 opacity-100"
      )}>
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="relative w-20 h-20">
              <Brain className="w-20 h-20 text-primary animate-pulse" />
              <div className="absolute inset-0 w-20 h-20 border-t-2 border-primary rounded-full animate-spin" />
            </div>
            <p className="text-lg font-medium text-muted-foreground">
              Preparing your learning experience...
            </p>
          </div>
        ) : (
          <>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="line-clamp-1">{video.title}</CardTitle>
                {pathInfo && (
                  <div className="flex items-center gap-4">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "flex items-center gap-1 animate-in slide-in-from-left-5",
                        pathInfo.color
                      )}
                    >
                      <BookOpen className="h-3 w-3" />
                      {pathInfo.name}
                    </Badge>
                    {pathInfo.progress && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in slide-in-from-left-10">
                        <Progress 
                          value={(pathInfo.progress.completed / pathInfo.progress.totalVideos) * 100} 
                          className="w-24" 
                        />
                        <span>{Math.round((pathInfo.progress.completed / pathInfo.progress.totalVideos) * 100)}% Complete</span>
                      </div>
                    )}
                    <Badge 
                      variant="outline" 
                      className="flex items-center gap-1 animate-in slide-in-from-left-20"
                    >
                      <Clock className="h-3 w-3" />
                      {watchTime} mins watched
                    </Badge>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video animate-in fade-in-50">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full rounded-md"
                />
              </div>
              <div className="mt-4 space-y-2 animate-in slide-in-from-bottom-5">
                <h3 className="font-semibold">{video.channel.name}</h3>
                <p className="text-sm text-muted-foreground">{video.description}</p>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}; 