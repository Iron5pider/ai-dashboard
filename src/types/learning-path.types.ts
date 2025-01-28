import { Video } from "./feed.types"

export interface LearningPathProgress {
  pathId: string
  completed: number
  totalVideos: number
  lastWatched: string
  startedAt: string
  timeSpent: number
  completedTopics: string[]
}

export interface VideoLearningMetadata {
  pathId: string
  order: number
  topics: string[]
  requiredWatchMinutes: number
}

export type PathCategory = 'ai' | 'machine-learning' | 'deep-learning' | 'computer-vision' | 'nlp' | 'other';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface CompletionCriteria {
  minVideosWatched: number
  minTimeSpent: number
  requiredTopics: string[]
}

export interface LearningPath {
  id: string
  name: string
  description: string
  level: DifficultyLevel
  color: string
  topics: string[]
  estimatedHours: number
  videos: Video[]
  category: PathCategory
  prerequisites?: string[]
  createdAt: string
  updatedAt: string
  completionCriteria: CompletionCriteria
  progress?: LearningPathProgress
  relevanceScore?: number
}

export interface PathProgress {
  completed: number
  totalVideos: number
  lastWatched: string
  timeSpent: number
}

export interface VideoProgress {
  videoId: string
  pathId: string
  progress: number
  completed: boolean
  lastWatched: string
  timeSpent: number
  topics: string[]
}

export interface PathRecommendation extends LearningPath {
  relevanceScore: number
  matchingTopics: string[]
  prerequisitesCompleted: boolean
  nextSteps?: {
    type: 'complete_prerequisites' | 'start_path' | 'continue_path'
    message: string
  }
}

