export interface Video {
  id: string;
  title: string;
  channel: {
    name: string;
    icon: string;
  };
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  duration: {
    length: number;
  };
  description: string;
}

export interface FeedFilters {
  search: string;
  category: string;
  sortBy: 'relevance' | 'date' | 'viewCount';
  duration: 'all' | 'short' | 'medium' | 'long';
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
}
