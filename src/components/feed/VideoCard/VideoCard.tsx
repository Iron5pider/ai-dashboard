import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video } from '@/types/feed.types';
import { Badge } from "@/components/ui/badge";
import { Share2, Bookmark, Play, Plus } from 'lucide-react';
import Image from 'next/image';
import { useLearningPaths } from '@/hooks/useLearningPaths';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/hooks/use-toast';

interface VideoCardProps {
  video: Video;
  onSelect: () => void;
  onSave: (id: string) => void;
  onShare: (id: string) => void;
}

export function VideoCard({ video, onSelect, onSave, onShare }: VideoCardProps) {
  const { paths, setPaths } = useLearningPaths();

  const handleAddToPath = (pathId: string) => {
    try {
      // Check if video already exists in path before state update
      const existingPath = paths.find(p => p.id === pathId);
      if (existingPath && existingPath.videos.some(v => v.id === video.id)) {
        toast({
          title: "Already Added",
          description: "This video is already in the learning path",
        });
        return;
      }

      // Create updated paths array
      const updatedPaths = paths.map(p => {
        if (p.id === pathId) {
          const videoWithAnalytics = {
            ...video,
            completed: false,
            lastWatched: undefined,
            timeSpent: 0,
            progress: 0
          };
          
          return {
            ...p,
            videos: [...p.videos, videoWithAnalytics],
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });

      // Update state
      setPaths(updatedPaths);

      // Show success toast
      toast({
        title: "Video Added",
        description: "Video has been added to the learning path",
      });
      
    } catch (error) {
      console.error('Error adding video to path:', error);
      toast({
        title: "Error",
        description: "Failed to add video to learning path",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video cursor-pointer group" onClick={onSelect}>
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-12 h-12 text-white" />
        </div>
        <Badge 
          variant="secondary" 
          className="absolute bottom-2 right-2 bg-black/80 text-white"
        >
          {formatDuration(video.duration.length)}
        </Badge>
      </div>

      <CardHeader className="space-y-2 p-4">
        <CardTitle className="text-base font-medium line-clamp-2">
          {video.title}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{video.channel.name}</span>
          <span>•</span>
          <span>{formatViews(video.viewCount)}</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onShare(video.id);
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onSave(video.id);
            }}
          >
            <Bookmark className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {paths.map(path => (
                <DropdownMenuItem 
                  key={path.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToPath(path.id);
                  }}
                >
                  Add to {path.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}


