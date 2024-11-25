"use client"

import { useState, useCallback } from 'react';
import { LearningPath, LearningPathProgress, VideoLearningMetadata } from '../types/learning-path.types';
import { Video } from '../types/feed.types';

const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'ai-basics',
    name: 'AI Basics',
    description: 'Foundation concepts in artificial intelligence',
    level: 'beginner',
    color: 'bg-green-500',
    topics: ['python', 'machine learning', 'neural networks'],
    estimatedHours: 10,
  },
  {
    id: 'ml-projects',
    name: 'ML Projects',
    description: 'Hands-on machine learning projects',
    level: 'intermediate',
    color: 'bg-blue-500',
    prerequisites: ['ai-basics'],
    topics: ['tensorflow', 'pytorch', 'computer vision'],
    estimatedHours: 20,
  },
  {
    id: 'advanced-ai',
    name: 'Advanced AI',
    description: 'Advanced AI concepts and implementations',
    level: 'advanced',
    color: 'bg-purple-500',
    prerequisites: ['ml-projects'],
    topics: ['transformers', 'reinforcement learning', 'GANs'],
    estimatedHours: 30,
  },
];

export const useLearningPaths = () => {
  const [progress, setProgress] = useState<Record<string, LearningPathProgress>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('learningPathProgress');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const analyzeVideoContent = (video: Video): VideoLearningMetadata | null => {
    const title = video.title.toLowerCase();
    const description = video.description.toLowerCase();
    
    // Sophisticated content analysis
    const topics = LEARNING_PATHS.flatMap(path => 
      path.topics.filter(topic => 
        title.includes(topic) || description.includes(topic)
      )
    );

    if (topics.length === 0) return null;

    // Determine the most appropriate path based on topics and difficulty signals
    const isAdvanced = title.includes('advanced') || description.includes('advanced');
    const isIntermediate = title.includes('project') || description.includes('implementation');
    
    let pathId = 'ai-basics';
    if (isAdvanced) pathId = 'advanced-ai';
    else if (isIntermediate) pathId = 'ml-projects';

    return {
      pathId,
      order: 0, // Could be determined by more sophisticated sequencing
      topics,
      requiredWatchMinutes: Math.ceil(video.duration.length / 60),
    };
  };

  const updateProgress = useCallback((video: Video, watchedMinutes: number) => {
    const metadata = analyzeVideoContent(video);
    if (!metadata) return;

    setProgress(prev => {
      const pathProgress = prev[metadata.pathId] || {
        pathId: metadata.pathId,
        completed: 0,
        totalVideos: 0,
        lastWatched: new Date().toISOString(),
        startedAt: new Date().toISOString(),
      };

      const newProgress = {
        ...prev,
        [metadata.pathId]: {
          ...pathProgress,
          completed: pathProgress.completed + 1,
          totalVideos: pathProgress.totalVideos + 1,
          lastWatched: new Date().toISOString(),
        },
      };

      // Persist progress
      localStorage.setItem('learningPathProgress', JSON.stringify(newProgress));
      return newProgress;
    });
  }, []);

  const getPathForVideo = useCallback((video: Video) => {
    const metadata = analyzeVideoContent(video);
    if (!metadata) return null;

    const path = LEARNING_PATHS.find(p => p.id === metadata.pathId);
    const pathProgress = progress[metadata.pathId];

    return {
      ...path,
      progress: pathProgress,
      metadata,
    };
  }, [progress]);

  return {
    paths: LEARNING_PATHS,
    progress,
    updateProgress,
    getPathForVideo,
  };
}; 