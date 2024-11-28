// src/components/mindmap/CustomNode.tsx
import React from 'react';
import { Handle, Position } from 'reactflow';
import { NodeContextMenu } from './NodeContextMenu';

interface CustomNodeProps {
  data: {
    label: string;
    completed: boolean;
    description: string;
    progress?: number;
    onComplete?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onPlay?: () => void;
    isGoalNode?: boolean;
    videoPreview?: {
      thumbnailUrl: string;
      title: string;
      duration: string;
    };
  };
  selected: boolean;
}

export const CustomNode: React.FC<CustomNodeProps> = ({ data, selected }) => {
  const isComplete = data.progress === 100;

  const nodeContent = (
    <div
      className={`
        px-4 py-2 rounded-lg shadow-sm border-2 transition-all duration-300
        ${selected ? 'shadow-blue-200 border-blue-400' : 'border-gray-200'}
        ${data.completed ? 'bg-green-50 border-green-400' : 'bg-white'}
        ${isComplete ? 'animate-pulse' : ''}
        hover:shadow-md
        min-w-[200px]
      `}
    >
      <Handle type="target" position={Position.Left} />
      
      <div className="flex items-center gap-2">
        {data.completed && (
          <svg
            className="w-4 h-4 text-green-500 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        <div className="font-medium text-sm">
          {data.label}
          {isComplete && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              Complete! 🎉
            </span>
          )}
        </div>
      </div>
      
      {data.description && (
        <div className="mt-1 text-xs text-gray-500 line-clamp-2">
          {data.description}
        </div>
      )}

      {typeof data.progress === 'number' && (
        <div className="mt-2">
          <div className="text-xs text-gray-500 mb-1 flex justify-between items-center">
            <span>Progress</span>
            <span className={`font-medium ${isComplete ? 'text-green-600' : ''}`}>
              {Math.round(data.progress)}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`
                h-full transition-all duration-500 ease-in-out
                ${isComplete ? 'bg-green-500' : 'bg-blue-500'}
              `}
              style={{ 
                width: `${data.progress}%`,
                transform: `translateX(${data.progress === 0 ? '-100%' : '0'})`,
              }}
            />
          </div>
        </div>
      )}
      
      <Handle type="source" position={Position.Right} />
    </div>
  );

  return (
    <NodeContextMenu
      onComplete={data.onComplete || (() => {})}
      onPlay={data.onPlay}
      isCompleted={data.completed}
      isGoalNode={data.isGoalNode}
      videoPreview={data.videoPreview}
    >
      {nodeContent}
    </NodeContextMenu>
  );
};

export default CustomNode;