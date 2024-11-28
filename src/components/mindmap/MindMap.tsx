// src/components/MindMap/MindMap.tsx

"use client"

import React, { useEffect, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  Node,
  Edge,
  ReactFlowInstance,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { LearningPath } from '@/types/learning-path.types';
import { Video } from '@/types/feed.types';
import { toast } from '@/hooks/use-toast';
import { CustomNode } from './CustomNode';

interface MindMapProps {
  learningPath: LearningPath & {
    progress: { completed: number; totalVideos: number };
    videos: Video[];
  };
  selectedVideo: Video | null;
  onVideoSelect: (video: Video | null) => void;
}

type CustomNode = Node<{ 
  label: string; 
  description?: string;
  completed?: boolean;
  progress?: number;
  onComplete?: () => void;
  onPlay?: () => void;
  isGoalNode?: boolean;
  video?: Video;
  videoPreview?: {
    thumbnailUrl: string;
    title: string;
    duration: string;
  };
}>;
type CustomEdge = Edge<any>;

export const MindMap: React.FC<MindMapProps> = ({ 
  learningPath, 
  selectedVideo,
  onVideoSelect 
}) => {
  const [nodes, setNodes] = useState<CustomNode[]>([]);
  const [edges, setEdges] = useState<CustomEdge[]>([]);
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set());
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number, y: number }>>({});

  useEffect(() => {
    // Create nodes for each video with progress
    const videoNodes: CustomNode[] = learningPath.videos.map((video, index) => ({
      id: video.id,
      data: { 
        label: video.title,
        completed: completedVideos.has(video.id),
        description: video.description || 'No description available',
        progress: completedVideos.has(video.id) ? 100 : 0,
        onComplete: () => handleNodeComplete(video.id),
        onPlay: () => onVideoSelect(video),
        isGoalNode: false,
        video: video,
        videoPreview: {
          thumbnailUrl: video.thumbnail,
          title: video.title,
          duration: video.duration?.text || '0:00',
        },
      },
      position: nodePositions[video.id] || { x: index * 200, y: index * 100 },
      type: 'custom',
    }));

    // Create edges between videos
    const videoEdges: CustomEdge[] = learningPath.videos.slice(1).map((video, index) => ({
      id: `e${learningPath.videos[index].id}-${video.id}`,
      source: learningPath.videos[index].id,
      target: video.id,
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      type: 'smoothstep',
    }));

    // Add Goal Node with overall progress
    const goalNode: CustomNode = {
      id: 'goal',
      data: { 
        label: `Goal: Master ${learningPath.name}`,
        completed: false,
        description: 'Your ultimate goal in this learning path.',
        progress: learningPath.progress 
          ? (learningPath.progress.completed / learningPath.progress.totalVideos) * 100
          : (completedVideos.size / learningPath.videos.length) * 100,
        isGoalNode: true,
      },
      position: { 
        x: learningPath.videos.length * 200 + 100, 
        y: learningPath.videos.length * 100 
      },
      type: 'custom',
      style: {
        background: '#ffeeba',
        border: '2px solid #ffc107',
      },
    };

    // Add edge from last video to goal
    const goalEdge: CustomEdge = {
      id: `e${learningPath.videos[learningPath.videos.length - 1]?.id}-goal`,
      source: learningPath.videos[learningPath.videos.length - 1]?.id,
      target: 'goal',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      type: 'smoothstep',
    };

    setNodes([...videoNodes, goalNode]);
    setEdges([...videoEdges, goalEdge]);
  }, [learningPath, completedVideos, selectedVideo, nodePositions]);

  const onInit = (reactFlowInstance: ReactFlowInstance) => {
    reactFlowInstance.fitView();
  };

  const handleNodeClick = async (event: React.MouseEvent, node: Node) => {
    if (node.id === 'goal') return;

    const video = learningPath.videos.find(v => v.id === node.id);
    if (video) {
      onVideoSelect(video);
    }

    const isCompleted = completedVideos.has(node.id);
    try {
      setCompletedVideos(prev => {
        const newSet = new Set(prev);
        if (isCompleted) {
          newSet.delete(node.id);
        } else {
          newSet.add(node.id);
        }
        return newSet;
      });

      toast({
        title: isCompleted ? "Video unmarked" : "Video completed",
        description: `Progress updated for ${node.data.label}`,
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  const onNodeDragStop = (_: React.MouseEvent, node: Node) => {
    setNodePositions(prev => ({
      ...prev,
      [node.id]: node.position
    }));
  };

  const handleNodeComplete = (nodeId: string) => {
    const isCompleted = completedVideos.has(nodeId);
    setCompletedVideos(prev => {
      const newSet = new Set(prev);
      if (isCompleted) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });

    toast({
      title: isCompleted ? "Video unmarked" : "Video completed",
      description: `Progress updated for ${nodes.find(n => n.id === nodeId)?.data.label}`,
    });
  };

  // Add nodeTypes configuration
  const nodeTypes = {
    custom: CustomNode,
  };

  return (
    <div className="w-full h-full rounded-md border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onInit={onInit}
        onNodeClick={handleNodeClick}
        onNodeDragStop={onNodeDragStop}
        nodesConnectable={false}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};