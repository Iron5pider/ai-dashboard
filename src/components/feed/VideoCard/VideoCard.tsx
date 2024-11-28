import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VideoCardActions } from './VideoCardActions';
import { Video } from '../../../types/feed.types';
import { UserCircle2, BookOpen, Clock, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useLearningPaths } from '@/hooks/useLearningPaths';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface VideoCardProps {
  video: Video;
  onSelect: () => void;
  onSave: (id: string) => void;
  onShare: (id: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onSelect, onSave, onShare }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const { getPathForVideo, createLearningPath } = useLearningPaths();
  
  const handleClick = async () => {
    const pathInfo = getPathForVideo(video);
    if (!pathInfo) {
      // Generate new learning path if one doesn't exist
      const newPath = await createLearningPath({
        sourceVideo: video,
        level: detectDifficultyLevel(video),
        topics: extractTopics(video)
      });
    }
    onSelect();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card 
          className={cn(
            "group overflow-hidden cursor-pointer transition-transform duration-100",
            isHovered && "scale-[1.01] shadow-md"
          )}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative w-full aspect-video">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-100 group-hover:scale-[1.015]"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/600x400?text=No+Thumbnail';
              }}
            />
            <div className={cn(
              "absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 transition-opacity duration-75 flex items-center justify-center",
              isHovered && "opacity-100"
            )}>
              <GraduationCap className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <div className={cn(
              "absolute bottom-2 right-2 opacity-0 transition-opacity duration-75",
              isHovered && "opacity-100"
            )}>
              <Badge variant="secondary" className="flex items-center gap-1 bg-background/80 backdrop-blur-sm">
                <Clock className="h-3 w-3" />
                {Math.floor(video.duration.length / 60)}:{(video.duration.length % 60).toString().padStart(2, '0')}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold line-clamp-2 mb-2">{video.title}</h3>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                {video.channel.icon ? (
                  <AvatarImage src={video.channel.icon} alt={video.channel.name} />
                ) : (
                  <AvatarFallback delayMs={0}>
                    <UserCircle2 className="h-4 w-4" />
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-sm text-muted-foreground flex-grow truncate">
                {video.channel.name}
              </span>
            </div>
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>{video.viewCount.toLocaleString()} views</span>
              <span>{formatPublishedDate(video.publishedAt)}</span>
            </div>
          </CardContent>
          <CardFooter className={cn(
            "p-4 pt-0 opacity-0 transition-all duration-75",
            isHovered && "opacity-100"
          )}>
            <VideoCardActions videoId={video.id} onSave={onSave} onShare={onShare} />
          </CardFooter>
        </Card>
      </TooltipTrigger>
      <TooltipContent>
        <p>Click to start learning path</p>
      </TooltipContent>
    </Tooltip>
  );
};

function formatPublishedDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays <= 7) {
    return `${diffDays} days ago`;
  } else if (diffDays <= 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

// Helper functions for learning path generation
function detectDifficultyLevel(video: Video): 'beginner' | 'intermediate' | 'advanced' {
  const title = video.title.toLowerCase();
  const description = video.description.toLowerCase();
  
  if (title.includes('advanced') || title.includes('expert')) {
    return 'advanced';
  } else if (title.includes('project') || title.includes('implementation')) {
    return 'intermediate';
  }
  return 'beginner';
}

function extractTopics(video: Video): string[] {
  const keywords = [
    'machine learning', 'deep learning', 'neural networks', 
    'computer vision', 'nlp', 'reinforcement learning',
    'data science', 'artificial intelligence'
  ];
  
  const content = `${video.title} ${video.description}`.toLowerCase();
  return keywords.filter(keyword => content.includes(keyword));
}


