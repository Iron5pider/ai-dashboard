export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: {
    length: number;
    text: string;
  };
  channel: {
    id: string;
    name: string;
    icon?: string;
  };
  publishedAt: string;
  viewCount: number;
  completed?: boolean;
  lastWatched?: string;
  timeSpent?: number;
  progress?: number;
  topics?: string[];
}

export interface FeedFilters {
  search: string;
  category: string;
  sortBy: 'relevance' | 'date' | 'viewCount';
  duration: 'all' | 'short' | 'medium' | 'long';
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
}

export interface FeedResponse {
  videos: Video[];
  nextPageToken?: string;
  totalResults: number;
}
