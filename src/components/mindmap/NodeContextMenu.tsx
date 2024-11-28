"use client"

import { Play } from "lucide-react";
import * as Popover from '@radix-ui/react-popover';

interface NodeContextMenuProps {
  children: React.ReactNode;
  onComplete: () => void;
  onPlay?: () => void;
  isCompleted: boolean;
  isGoalNode?: boolean;
  videoPreview?: {
    thumbnailUrl: string;
    title: string;
    duration: string;
  };
}

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  children,
  onComplete,
  onPlay,
  videoPreview,
  isCompleted,
  isGoalNode
}) => {
  return (
    <div className="group relative">
      {children}
      {videoPreview && (
        <Popover.Root>
          <Popover.Trigger asChild>
            <button 
              onClick={(e) => e.stopPropagation()}
              className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 
                       hover:bg-gray-100 transition-all duration-200"
            >
              <Play className="w-4 h-4 text-gray-500" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content 
              className="z-50 w-72 p-2 rounded-lg shadow-lg bg-white border border-gray-200"
              sideOffset={5}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video mb-2">
                <img 
                  src={videoPreview.thumbnailUrl} 
                  alt={videoPreview.title}
                  className="rounded object-cover w-full h-full"
                />
                <span className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 rounded">
                  {videoPreview.duration}
                </span>
              </div>
              <p className="text-sm font-medium">{videoPreview.title}</p>
              <Popover.Arrow className="fill-white" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}
    </div>
  );
}; 