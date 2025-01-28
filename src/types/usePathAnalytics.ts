import { useState, useEffect } from 'react';
import { Video } from './feed.types';
import { LearningPath, LearningPathProgress } from './learning-path.types';

interface PathAnalytics {
  completionRate: number
  timeSpentToday: number
  streakDays: number
  topicsProgress: Map<string, number>
  estimatedTimeLeft: number
  nextMilestone: {
    type: string
    value: number
    progress: number
  }
}

interface VideoWithAnalytics extends Video {
  lastWatched?: string;
  timeSpent?: number;
  completed?: boolean;
  topics?: string[];
}

interface LearningPathWithProgress extends LearningPath {
  progress?: LearningPathProgress;
  videos: VideoWithAnalytics[];
}

export function usePathAnalytics(path: LearningPathWithProgress): PathAnalytics {
  const [analytics, setAnalytics] = useState<PathAnalytics>({
    completionRate: 0,
    timeSpentToday: 0,
    streakDays: 0,
    topicsProgress: new Map<string, number>(),
    estimatedTimeLeft: 0,
    nextMilestone: {
      type: 'completion',
      value: 25,
      progress: 0
    }
  });

  useEffect(() => {
    const calculateAnalytics = () => {
      if (!path.progress) {
        return;
      }

      // Calculate completion rate
      const completionRate = (path.progress.completed / Math.max(path.progress.totalVideos, 1)) * 100;

      // Calculate time spent today
      const today = new Date().toDateString();
      const timeSpentToday = path.videos.reduce((total, video) => {
        if (!video.lastWatched) return total;
        const lastWatched = new Date(video.lastWatched).toDateString();
        return lastWatched === today ? total + (video.timeSpent || 0) : total;
      }, 0);

      // Calculate streak days
      const streakDays = calculateStreakDays(path);

      // Calculate topics progress
      const topicsProgress = calculateTopicsProgress(path);

      // Calculate estimated time left
      const timeSpentPerVideo = path.progress.timeSpent 
        ? path.progress.timeSpent / Math.max(path.progress.completed, 1)
        : 0;
      const remainingVideos = path.progress.totalVideos - path.progress.completed;
      const estimatedTimeLeft = timeSpentPerVideo * remainingVideos;

      // Determine next milestone
      const nextMilestone = getNextMilestone(path);

      setAnalytics({
        completionRate,
        timeSpentToday,
        streakDays,
        topicsProgress,
        estimatedTimeLeft,
        nextMilestone
      });
    };

    calculateAnalytics();
  }, [path]);

  return analytics;
}

function calculateStreakDays(path: LearningPathWithProgress): number {
  const dates = path.videos
    .filter(v => v.lastWatched)
    .map(v => new Date(v.lastWatched!).toDateString())
    .sort()
    .reverse();

  let streak = 0;
  let currentDate = new Date();

  for (const date of new Set(dates)) {
    const watchDate = new Date(date);
    const diffDays = Math.floor((currentDate.getTime() - watchDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
      currentDate = watchDate;
    } else {
      break;
    }
  }

  return streak;
}

function calculateTopicsProgress(path: LearningPathWithProgress): Map<string, number> {
  const topicsProgress = new Map<string, number>();
  
  path.topics.forEach(topic => {
    const topicVideos = path.videos.filter(v => v.topics?.includes(topic)) || [];
    const completedVideos = topicVideos.filter(v => v.completed).length;
    const progress = topicVideos.length > 0 
      ? (completedVideos / topicVideos.length) * 100 
      : 0;
    topicsProgress.set(topic, progress);
  });

  return topicsProgress;
}

function getNextMilestone(path: LearningPathWithProgress) {
  if (!path.progress) {
    return {
      type: 'completion',
      value: 25,
      progress: 0
    };
  }

  const completion = (path.progress.completed / Math.max(path.progress.totalVideos, 1)) * 100;
  const milestones = [25, 50, 75, 100];
  
  const nextMilestone = milestones.find(m => m > completion) || 100;
  
  return {
    type: 'completion',
    value: nextMilestone,
    progress: completion
  };
}
