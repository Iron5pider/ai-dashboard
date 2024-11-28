"use client"

import { useState, useCallback } from 'react';
import { LearningPath, LearningPathProgress, VideoLearningMetadata } from '../types/learning-path.types';
import { Video } from '../types/feed.types';
import { toast } from './use-toast';

const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'ai-basics',
    name: 'AI Basics',
    description: 'Foundation concepts in artificial intelligence',
    level: 'beginner',
    color: 'bg-green-500',
    topics: ['python', 'machine learning', 'neural networks'],
    estimatedHours: 10,
    videos: [],
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
    videos: [],
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
    videos: [],
  },
];

export const useLearningPaths = () => {
  const [paths, setPaths] = useState<LearningPath[]>(() => {
    if (typeof window !== 'undefined') {
      const savedPaths = localStorage.getItem('learningPaths');
      return savedPaths ? JSON.parse(savedPaths) : LEARNING_PATHS;
    }
    return LEARNING_PATHS;
  });
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

  const createLearningPath = async ({ 
    sourceVideo, 
    level, 
    topics 
  }: {
    sourceVideo: Video;
    level: 'beginner' | 'intermediate' | 'advanced';
    topics: string[];
  }) => {
    try {
      // For beginner level, always try to add to the AI Basics path
      if (level === 'beginner') {
        const aiBasicsPath = paths.find(path => path.id === 'ai-basics');
        if (aiBasicsPath) {
          // Update AI Basics path
          setPaths(prevPaths => {
            const updated = prevPaths.map(path => {
              if (path.id === 'ai-basics') {
                // Avoid duplicate videos
                const existingVideoIds = new Set(path.videos?.map(v => v.id) || []);
                const newVideos = existingVideoIds.has(sourceVideo.id) 
                  ? path.videos 
                  : [...(path.videos || []), sourceVideo];

                // Combine topics without duplicates
                const allTopics = new Set([...path.topics, ...topics]);

                return {
                  ...path,
                  videos: newVideos,
                  topics: Array.from(allTopics),
                  estimatedHours: path.estimatedHours + 1,
                };
              }
              return path;
            });
            localStorage.setItem('learningPaths', JSON.stringify(updated));
            return updated;
          });

          // Update progress for AI Basics path
          setProgress(prev => {
            const pathProgress = prev['ai-basics'] || {
              pathId: 'ai-basics',
              completed: 0,
              totalVideos: 0,
              lastWatched: new Date().toISOString(),
              startedAt: new Date().toISOString(),
            };

            const updated = {
              ...prev,
              'ai-basics': {
                ...pathProgress,
                totalVideos: pathProgress.totalVideos + 1,
                lastWatched: new Date().toISOString(),
              }
            };
            localStorage.setItem('learningPathProgress', JSON.stringify(updated));
            return updated;
          });

          toast({
            title: "Video Added",
            description: "Added to AI Basics learning path",
          });

          return aiBasicsPath;
        }
      }

      // For other levels, check for similar paths
      const existingPath = paths.find(path => {
        const hasCommonTopic = topics.some(topic => path.topics.includes(topic));
        return path.level === level && hasCommonTopic;
      });

      if (existingPath) {
        // Update existing path
        setPaths(prevPaths => {
          const updated = prevPaths.map(path => {
            if (path.id === existingPath.id) {
              // Avoid duplicate videos
              const existingVideoIds = new Set(path.videos?.map(v => v.id) || []);
              const newVideos = existingVideoIds.has(sourceVideo.id) 
                ? path.videos 
                : [...(path.videos || []), sourceVideo];

              // Combine topics without duplicates
              const allTopics = new Set([...path.topics, ...topics]);

              return {
                ...path,
                videos: newVideos,
                topics: Array.from(allTopics),
                estimatedHours: path.estimatedHours + 1,
              };
            }
            return path;
          });
          localStorage.setItem('learningPaths', JSON.stringify(updated));
          return updated;
        });

        // Update progress for existing path
        setProgress(prev => {
          const pathProgress = prev[existingPath.id] || {
            pathId: existingPath.id,
            completed: 0,
            totalVideos: 0,
            lastWatched: new Date().toISOString(),
            startedAt: new Date().toISOString(),
          };

          const updated = {
            ...prev,
            [existingPath.id]: {
              ...pathProgress,
              totalVideos: pathProgress.totalVideos + 1,
              lastWatched: new Date().toISOString(),
            }
          };
          localStorage.setItem('learningPathProgress', JSON.stringify(updated));
          return updated;
        });

        toast({
          title: "Video Added",
          description: `Added to existing path: ${existingPath.name}`,
        });

        return existingPath;
      }

      // Create new path if no matching path exists
      const pathId = `path-${Date.now()}`;
      const newPath: LearningPath = {
        id: pathId,
        name: `${level.charAt(0).toUpperCase() + level.slice(1)} ${topics[0] || 'AI'} Path`,
        description: `Learn ${topics.join(', ')} through curated videos`,
        level,
        color: getColorForLevel(level),
        topics,
        estimatedHours: 1,
        videos: [sourceVideo],
      };

      // Update paths state
      setPaths(prevPaths => {
        const updated = [...prevPaths, newPath];
        localStorage.setItem('learningPaths', JSON.stringify(updated));
        return updated;
      });

      // Create new progress entry
      const newProgress = {
        pathId,
        completed: 0,
        totalVideos: 1,
        lastWatched: new Date().toISOString(),
        startedAt: new Date().toISOString(),
      };

      setProgress(prev => {
        const updated = {
          ...prev,
          [pathId]: newProgress
        };
        localStorage.setItem('learningPathProgress', JSON.stringify(updated));
        return updated;
      });

      toast({
        title: "New Path Created",
        description: `Created new learning path: ${newPath.name}`,
      });

      return newPath;
    } catch (error) {
      console.error('Error creating learning path:', error);
      toast({
        title: "Error",
        description: "Failed to create learning path",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getColorForLevel = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-500';
      case 'intermediate':
        return 'bg-blue-500';
      case 'advanced':
        return 'bg-purple-500';
      default:
        return 'bg-green-500';
    }
  };

  const getActivePaths = useCallback(() => {
    return Object.entries(progress).map(([pathId, pathProgress]) => {
      const path = paths.find(p => p.id === pathId);
      if (!path) return null;
      
      return {
        ...path,
        progress: pathProgress,
        videos: path.videos || [path.sourceVideo].filter(Boolean),
      };
    }).filter(Boolean);
  }, [paths, progress]);

  const getPathById = useCallback((id: string) => {
    const path = paths.find(p => p.id === id);
    if (!path) return null;
    
    return {
      ...path,
      progress: progress[id],
    };
  }, [paths, progress]);

  return {
    paths,
    setPaths,
    progress,
    createLearningPath,
    getActivePaths,
    getPathById,
    updateProgress,
    getPathForVideo,
  };
}; 