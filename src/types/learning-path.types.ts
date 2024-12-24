import { Video } from "./feed.types"

export interface LearningPathProgress {
  pathId: string
  completed: number
  totalVideos: number
  lastWatched: string
  startedAt: string
  timeSpent?: number
  completedTopics?: string[]
}

export interface VideoLearningMetadata {
  pathId: string
  order: number
  topics: string[]
  requiredWatchMinutes: number
}

export interface LearningPath {
  id: string
  name: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  color: string
  topics: string[]
  estimatedHours: number
  videos: Video[]
  category?: 'ai' | 'machine-learning' | 'deep-learning' | 'computer-vision' | 'nlp' | 'other'
  prerequisites?: string[]
  createdAt?: string
  updatedAt?: string
  completionCriteria?: {
    minVideosWatched: number
    minTimeSpent: number
    requiredTopics: string[]
  }
  progress?: LearningPathProgress
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
}

