import React from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, Share2 } from 'lucide-react';

interface VideoCardActionsProps {
  videoId: string;
  onSave: (id: string) => void;
  onShare: (id: string) => void;
}

export const VideoCardActions: React.FC<VideoCardActionsProps> = ({ videoId, onSave, onShare }) => {
  return (
    <div className="flex justify-between w-full">
      <Button variant="outline" size="sm" onClick={() => onSave(videoId)}>
        <Bookmark className="mr-2 h-4 w-4" />
        Save
      </Button>
      <Button variant="outline" size="sm" onClick={() => onShare(videoId)}>
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>
    </div>
  );
};

