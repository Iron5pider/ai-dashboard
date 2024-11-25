import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VideoCardActions } from './VideoCardActions';
import { Video } from '../../../types/feed.types';
import { UserCircle2, BookOpen, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  video: Video;
  onSelect: () => void;
  onSave: (id: string) => void;
  onShare: (id: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onSelect, onSave, onShare }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const getLearningPath = (video: Video) => {
    const title = video.title.toLowerCase();
    const description = video.description.toLowerCase();
    
    if (title.includes('beginner') || title.includes('introduction') || description.includes('basics')) {
      return { name: 'AI Basics', color: 'bg-green-500' };
    } else if (title.includes('project') || title.includes('implementation')) {
      return { name: 'ML Projects', color: 'bg-blue-500' };
    } else if (title.includes('advanced') || title.includes('expert')) {
      return { name: 'Advanced AI', color: 'bg-purple-500' };
    }
    return null;
  };

  const learningPath = getLearningPath(video);

  return (
    <Card 
      className={cn(
        "group overflow-hidden cursor-pointer transition-transform duration-100",
        isHovered && "scale-[1.01] shadow-md"
      )}
      onClick={onSelect}
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
        {learningPath && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="flex items-center gap-1 bg-background/80 backdrop-blur-sm">
              <BookOpen className="h-3 w-3" />
              {learningPath.name}
            </Badge>
          </div>
        )}
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


