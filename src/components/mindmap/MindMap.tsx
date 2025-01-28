// src/components/MindMap/MindMap.tsx

"use client"

import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  Background, 
  Controls,
  NodeTypes,
  EdgeTypes,
  Connection,
  useNodesState,
  useEdgesState,
  Position,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import { LearningPath } from '@/types/learning-path.types';
import { Video } from '@/types/feed.types';
import { VideoNode } from '@/components/mindmap/VideoNode';
import { TopicNode } from '@/components/mindmap/TopicNode';
import { CustomEdge } from '@/components/mindmap/CustomEdge';

interface MindMapProps {
  learningPath: LearningPath;
  selectedVideo: Video | null;
  onVideoSelect: (video: Video | null) => void;
}

const nodeTypes: NodeTypes = {
  video: VideoNode,
  topic: TopicNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 125,
          y: nodeWithPosition.y - 50,
        },
        targetPosition: isHorizontal ? Position.Left : Position.Top,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      };
    }),
    edges,
  };
};

export const MindMap: React.FC<MindMapProps> = ({ 
  learningPath, 
  selectedVideo,
  onVideoSelect,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const initialNodes = useMemo(() => {
    const pathNode: Node = {
      id: learningPath.id,
      type: 'topic',
      data: { 
        label: learningPath.name,
        description: learningPath.description,
        level: learningPath.level,
      },
      position: { x: 0, y: 0 },
    };

    const videoNodes: Node[] = learningPath.videos.map((video) => ({
      id: video.id,
      type: 'video',
      data: { 
        video,
        isSelected: video.id === selectedVideo?.id,
        onSelect: () => onVideoSelect(video),
      },
      position: { x: 0, y: 0 },
    }));

    const topicNodes: Node[] = learningPath.topics.map((topic, index) => ({
      id: `topic-${index}`,
      type: 'topic',
      data: { 
        label: topic,
        description: `Videos related to ${topic}`,
      },
      position: { x: 0, y: 0 },
    }));

    return [pathNode, ...videoNodes, ...topicNodes];
  }, [learningPath, selectedVideo, onVideoSelect]);

  const initialEdges = useMemo(() => {
    const edges: Edge[] = [];

    // Connect path to topics
    learningPath.topics.forEach((_, index) => {
      edges.push({
        id: `path-topic-${index}`,
        source: learningPath.id,
        target: `topic-${index}`,
        type: 'custom',
      });
    });

    // Connect videos to relevant topics
    learningPath.videos.forEach((video) => {
      video.topics?.forEach((topic) => {
        const topicIndex = learningPath.topics.indexOf(topic);
        if (topicIndex !== -1) {
          edges.push({
            id: `video-${video.id}-topic-${topicIndex}`,
            source: `topic-${topicIndex}`,
            target: video.id,
            type: 'custom',
          });
        }
      });
    });

    return edges;
  }, [learningPath]);

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        const newEdge: Edge = {
          id: `${params.source}-${params.target}`,
          source: params.source,
          target: params.target,
          type: 'custom',
          sourceHandle: params.sourceHandle || undefined,
          targetHandle: params.targetHandle || undefined,
        };
        setEdges((eds) => [...eds, newEdge]);
      }
    },
    [setEdges]
  );

  return (
    <div className="w-full h-full rounded-md border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-muted/50"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};