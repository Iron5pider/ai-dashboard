import { Video } from "./feed.types";

export interface LearningPathProgress {
  pathId: string;
  completed: number;
  totalVideos: number;
  lastWatched: string;
  startedAt: string;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  color: string;
  topics: string[];
  estimatedHours: number;
  prerequisites?: string[];
  sourceVideo?: Video | null;
  videos?: Video[];
}

export interface VideoLearningMetadata {
  pathId: string;
  order: number;
  topics: string[];
  requiredWatchMinutes: number;
} 