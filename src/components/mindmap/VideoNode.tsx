import { Handle, Position } from 'reactflow';
import { Video } from '@/types/feed.types';

interface VideoNodeProps {
  data: {
    video: Video;
    isSelected: boolean;
    onSelect: () => void;
  };
}

export const VideoNode = ({ data }: VideoNodeProps) => {
  const { video, isSelected, onSelect } = data;

  return (
    <div 
      className={`p-4 rounded-lg border ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
      onClick={onSelect}
    >
      <Handle type="target" position={Position.Top} />
      <div className="text-sm font-medium">{video.title}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}; 