"use client"

import { useState, useCallback, useEffect } from 'react';
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
    category: 'ai',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completionCriteria: {
      minVideosWatched: 5,
      minTimeSpent: 3600,
      requiredTopics: ['python', 'machine learning']
    }
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
    category: 'machine-learning',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completionCriteria: {
      minVideosWatched: 10,
      minTimeSpent: 7200,
      requiredTopics: ['tensorflow', 'pytorch']
    }
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
    category: 'deep-learning',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completionCriteria: {
      minVideosWatched: 15,
      minTimeSpent: 10800,
      requiredTopics: ['transformers', 'reinforcement learning']
    }
  },
];

export const useLearningPaths = () => {
  const [paths, setPaths] = useState<LearningPath[]>(() => {
    // Default to LEARNING_PATHS during server-side rendering
    if (typeof window === 'undefined') {
      return LEARNING_PATHS;
    }

    try {
      const savedPaths = localStorage.getItem('learningPaths');
      if (savedPaths) {
        const parsed = JSON.parse(savedPaths);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : LEARNING_PATHS;
      }
      // Initialize with default paths if nothing in localStorage
      localStorage.setItem('learningPaths', JSON.stringify(LEARNING_PATHS));
      return LEARNING_PATHS;
    } catch (error) {
      console.error('Error loading learning paths:', error);
      return LEARNING_PATHS;
    }
  });

  const [progress, setProgress] = useState<Record<string, LearningPathProgress>>(() => {
    // Return empty object during server-side rendering
    if (typeof window === 'undefined') {
      return {};
    }

    try {
      const saved = localStorage.getItem('learningPathProgress');
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed === 'object' ? parsed : {};
      }
      return {};
    } catch (error) {
      console.error('Error loading learning progress:', error);
      return {};
    }
  });

  // Sync paths to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      if (paths.length > 0) {
        localStorage.setItem('learningPaths', JSON.stringify(paths));
      }
    } catch (error) {
      console.error('Error saving learning paths:', error);
    }
  }, [paths]);

  // Sync progress to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('learningPathProgress', JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving learning progress:', error);
    }
  }, [progress]);

  const analyzeVideoContent = useCallback((video: Video): VideoLearningMetadata | null => {
    const title = video.title.toLowerCase();
    const description = video.description.toLowerCase();
    
    // Extract topics from video content
    const detectedTopics = new Set<string>();
    
    // Check for topics in all paths
    paths.forEach(path => {
      path.topics.forEach(topic => {
        if (title.includes(topic.toLowerCase()) || description.includes(topic.toLowerCase())) {
          detectedTopics.add(topic);
        }
      });
    });

    if (detectedTopics.size === 0) return null;

    // Determine difficulty level
    const isAdvanced = title.includes('advanced') || 
                      description.includes('advanced') ||
                      title.includes('expert') || 
                      description.includes('expert');
                      
    const isIntermediate = title.includes('intermediate') || 
                          description.includes('intermediate') ||
                          title.includes('project') || 
                          description.includes('implementation');

    const isBeginner = title.includes('beginner') || 
                      description.includes('beginner') ||
                      title.includes('basics') || 
                      description.includes('introduction');

    // Find the most suitable path based on topics and difficulty
    const matchingPaths = paths.filter(path => {
      const hasCommonTopics = path.topics.some(topic => detectedTopics.has(topic));
      const matchesDifficulty = 
        (isAdvanced && path.level === 'advanced') ||
        (isIntermediate && path.level === 'intermediate') ||
        (isBeginner && path.level === 'beginner');
      
      return hasCommonTopics && matchesDifficulty;
    });

    if (matchingPaths.length === 0) {
      // If no exact match, find paths with matching topics
      const pathsWithTopics = paths.filter(path => 
        path.topics.some(topic => detectedTopics.has(topic))
      );

      if (pathsWithTopics.length === 0) {
        // Default to AI Basics if no matching path found
        return {
          pathId: 'ai-basics',
          order: 0,
          topics: Array.from(detectedTopics),
          requiredWatchMinutes: Math.ceil(video.duration.length / 60),
        };
      }

      // Choose the path with the most topic matches
      const bestPath = pathsWithTopics.reduce((best, current) => {
        const bestMatches = best.topics.filter(topic => detectedTopics.has(topic)).length;
        const currentMatches = current.topics.filter(topic => detectedTopics.has(topic)).length;
        return currentMatches > bestMatches ? current : best;
      });

      return {
        pathId: bestPath.id,
        order: 0,
        topics: Array.from(detectedTopics),
        requiredWatchMinutes: Math.ceil(video.duration.length / 60),
      };
    }

    // Choose the path with the most topic matches
    const bestPath = matchingPaths.reduce((best, current) => {
      const bestMatches = best.topics.filter(topic => detectedTopics.has(topic)).length;
      const currentMatches = current.topics.filter(topic => detectedTopics.has(topic)).length;
      return currentMatches > bestMatches ? current : best;
    });

    return {
      pathId: bestPath.id,
      order: 0,
      topics: Array.from(detectedTopics),
      requiredWatchMinutes: Math.ceil(video.duration.length / 60),
    };
  }, [paths]);

  const updateProgress = useCallback((video: Video, watchTimeMinutes?: number) => {
    const metadata = analyzeVideoContent(video);
    if (!metadata) return;

    setProgress(prev => {
      const pathProgress = prev[metadata.pathId] || {
        pathId: metadata.pathId,
        completed: 0,
        totalVideos: 0,
        lastWatched: new Date().toISOString(),
        startedAt: new Date().toISOString(),
        timeSpent: 0,
        completedTopics: []
      };

      // Update completed topics
      const newCompletedTopics = new Set(pathProgress.completedTopics || []);
      metadata.topics.forEach(topic => newCompletedTopics.add(topic));

      const newProgress = {
        ...prev,
        [metadata.pathId]: {
          ...pathProgress,
          completed: pathProgress.completed + 1,
          totalVideos: Math.max(pathProgress.totalVideos, pathProgress.completed + 1),
          lastWatched: new Date().toISOString(),
          timeSpent: (pathProgress.timeSpent || 0) + (watchTimeMinutes || metadata.requiredWatchMinutes) * 60,
          completedTopics: Array.from(newCompletedTopics)
        },
      };

      // Update the video in the path
      setPaths(prevPaths => {
        const updated = prevPaths.map(path => {
          if (path.id === metadata.pathId) {
            const updatedVideos = path.videos.map(v => 
              v.id === video.id 
                ? { 
                    ...v, 
                    completed: true,
                    lastWatched: new Date().toISOString(),
                    timeSpent: (watchTimeMinutes || metadata.requiredWatchMinutes) * 60,
                    progress: 100
                  }
                : v
            );

            return {
              ...path,
              videos: updatedVideos,
              updatedAt: new Date().toISOString()
            };
          }
          return path;
        });

        localStorage.setItem('learningPaths', JSON.stringify(updated));
        return updated;
      });

      localStorage.setItem('learningPathProgress', JSON.stringify(newProgress));
      return newProgress;
    });
  }, [analyzeVideoContent, setPaths]);

  const getPathForVideo = useCallback((video: Video) => {
    const metadata = analyzeVideoContent(video);
    if (!metadata) return null;

    const path = paths.find(p => p.id === metadata.pathId);
    const pathProgress = progress[metadata.pathId];

    return {
      ...path,
      progress: pathProgress,
      metadata,
    };
  }, [analyzeVideoContent, paths, progress]);

  const createLearningPath = useCallback(async ({ 
    sourceVideo, 
    level, 
    topics,
    category = 'other'
  }: {
    sourceVideo: Video;
    level: 'beginner' | 'intermediate' | 'advanced';
    topics: string[];
    category?: LearningPath['category'];
  }): Promise<LearningPath> => {
    try {
      const pathId = `path-${Date.now()}`;
      const newPath: LearningPath = {
        id: pathId,
        name: `${level.charAt(0).toUpperCase() + level.slice(1)} Learning Path`,
        description: `A curated path for ${level} learners`,
        level,
        color: level === 'beginner' ? 'bg-green-500' : level === 'intermediate' ? 'bg-blue-500' : 'bg-purple-500',
        topics,
        estimatedHours: Math.ceil(sourceVideo.duration.length / 3600),
        videos: [sourceVideo],
        category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completionCriteria: {
          minVideosWatched: level === 'beginner' ? 5 : level === 'intermediate' ? 10 : 15,
          minTimeSpent: level === 'beginner' ? 3600 : level === 'intermediate' ? 7200 : 10800,
          requiredTopics: topics.slice(0, 2) // First two topics are required
        }
      };

      setPaths(prevPaths => [...prevPaths, newPath]);

      const newProgress: LearningPathProgress = {
        pathId,
        completed: 0,
        totalVideos: 1,
        lastWatched: new Date().toISOString(),
        startedAt: new Date().toISOString(),
        timeSpent: 0,
        completedTopics: []
      };

      setProgress(prev => ({ ...prev, [pathId]: newProgress }));

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
  }, []);

  const getActivePaths = useCallback(() => {
    // Return all paths with their progress information
    return paths.map(path => ({
      ...path,
      progress: progress[path.id] || {
        pathId: path.id,
        completed: 0,
        totalVideos: path.videos.length,
        lastWatched: new Date().toISOString(),
        startedAt: new Date().toISOString(),
        timeSpent: 0,
        completedTopics: []
      }
    }));
  }, [paths, progress]);

  const getPathById = useCallback((id: string) => {
    const path = paths.find(p => p.id === id);
    if (!path) return null;
    
    return {
      ...path,
      progress: progress[id],
    };
  }, [paths, progress]);

  const isPathCompleted = useCallback((pathId: string): boolean => {
    const path = paths.find(p => p.id === pathId);
    const pathProgress = progress[pathId];

    if (!path || !pathProgress || !path.completionCriteria) {
      return false;
    }

    const { minVideosWatched, minTimeSpent, requiredTopics } = path.completionCriteria;
    const { completed, timeSpent = 0, completedTopics = [] } = pathProgress;

    // Check if minimum videos have been watched
    if (completed < minVideosWatched) {
      return false;
    }

    // Check if minimum time has been spent
    if (timeSpent < minTimeSpent) {
      return false;
    }

    // Check if all required topics are completed
    const hasAllRequiredTopics = requiredTopics.every(topic => 
      completedTopics.includes(topic)
    );

    return hasAllRequiredTopics;
  }, [paths, progress]);

  const getRecommendedPaths = useCallback(() => {
    const activePaths = getActivePaths();
    const completedPaths = activePaths
      .filter((path): path is NonNullable<ReturnType<typeof getActivePaths>[number]> => path !== null)
      .filter(path => isPathCompleted(path.id));
    const completedPathIds = new Set(completedPaths.map(path => path.id));
    
    // Find paths that the user can start based on prerequisites
    const availablePaths = paths.filter(path => {
      // If the path is already completed, don't recommend it
      if (completedPathIds.has(path.id)) {
        return false;
      }

      // If the path has no prerequisites, it's available
      if (!path.prerequisites || path.prerequisites.length === 0) {
        return true;
      }

      // Check if all prerequisites are completed
      return path.prerequisites.every(prereqId => completedPathIds.has(prereqId));
    });

    // Sort paths by relevance
    return availablePaths.map(path => {
      const relevanceScore = calculatePathRelevance(path, completedPaths);
      return { ...path, relevanceScore };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [paths, getActivePaths, isPathCompleted]);

  const calculatePathRelevance = (path: LearningPath, completedPaths: LearningPath[]) => {
    let score = 0;

    // Base score based on path level
    switch (path.level) {
      case 'beginner':
        score += completedPaths.length === 0 ? 3 : 1;
        break;
      case 'intermediate':
        score += completedPaths.some(p => p.level === 'beginner') ? 2 : 1;
        break;
      case 'advanced':
        score += completedPaths.some(p => p.level === 'intermediate') ? 2 : 0;
        break;
    }

    // Bonus points for topic continuity
    const userTopics = new Set(completedPaths.flatMap(p => p.topics));
    const commonTopics = path.topics.filter(topic => userTopics.has(topic)).length;
    score += commonTopics * 0.5;

    // Bonus points for natural progression
    if (path.prerequisites) {
      const completedPrereqs = path.prerequisites.filter(prereqId => 
        completedPaths.some(p => p.id === prereqId)
      ).length;
      score += completedPrereqs;
    }

    return score;
  };

  return {
    paths,
    setPaths,
    progress,
    createLearningPath,
    getActivePaths,
    getPathById,
    updateProgress,
    getPathForVideo,
    isPathCompleted,
    getRecommendedPaths,
  };
}; 