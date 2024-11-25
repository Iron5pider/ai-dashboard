const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

// Add rate limiting
let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 100; // ms between requests

async function rateLimitedFetch(url: string) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => 
      setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
    );
  }
  
  lastRequestTime = Date.now();
  const response = await fetch(url);
  
  if (response.status === 403 || response.status === 429) {
    console.warn('YouTube API quota exceeded, falling back to mock data');
    throw new Error('API quota exceeded');
  }
  
  return response;
}

export interface YouTubeSearchParams {
  q: string;
  maxResults?: number;
  pageToken?: string;
  type?: string;
  videoDuration?: string;
}

export async function searchVideos({
  q = '',
  maxResults = 20,
  pageToken = '',
  type = 'video',
  videoDuration,
}: YouTubeSearchParams) {
  if (!API_KEY) {
    console.warn('YouTube API key is missing, using mock data');
    return getMockVideos(q, maxResults);
  }

  try {
    const searchParams = new URLSearchParams({
      part: 'snippet',
      maxResults: maxResults.toString(),
      q,
      type,
      key: API_KEY,
      ...(pageToken && { pageToken }),
      ...(videoDuration && { videoDuration })
    });

    const response = await rateLimitedFetch(`${YOUTUBE_API_URL}/search?${searchParams}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch videos');
    }

    // Get video statistics with rate limiting
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    const statsParams = new URLSearchParams({
      part: 'statistics,contentDetails',
      id: videoIds,
      key: API_KEY
    });

    const statsResponse = await rateLimitedFetch(`${YOUTUBE_API_URL}/videos?${statsParams}`);
    const statsData = await statsResponse.json();

    if (!statsResponse.ok) {
      throw new Error(statsData.error?.message || 'Failed to fetch video stats');
    }

    const videos = data.items.map((item: any) => {
      const stats = statsData.items.find((stat: any) => stat.id === item.id.videoId);
      const duration = stats?.contentDetails?.duration || 'PT0M0S';
      
      const durationMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      const hours = parseInt(durationMatch?.[1] || '0');
      const minutes = parseInt(durationMatch?.[2] || '0');
      const seconds = parseInt(durationMatch?.[3] || '0');
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;

      return {
        id: item.id.videoId,
        title: item.snippet.title,
        channel: {
          name: item.snippet.channelTitle,
          icon: `https://i.ytimg.com/vi/${item.id.videoId}/default.jpg`,
        },
        thumbnail: item.snippet.thumbnails.high.url,
        publishedAt: item.snippet.publishedAt,
        viewCount: parseInt(stats?.statistics?.viewCount || '0'),
        duration: {
          length: totalSeconds,
        },
        description: item.snippet.description,
      };
    });

    return {
      videos,
      nextPageToken: data.nextPageToken,
      totalResults: data.pageInfo.totalResults,
    };
  } catch (error) {
    console.warn('Falling back to mock data:', error);
    return getMockVideos(q, maxResults);
  }
}

// Mock data function for development/fallback
function getMockVideos(q: string, maxResults: number) {
  const mockVideos = Array(maxResults).fill(null).map((_, index) => ({
    id: `video-${index}-${Date.now()}`,
    title: `AI Tutorial ${index + 1}: ${q}`,
    channel: {
      name: 'AI Learning Channel',
      icon: 'https://placehold.co/100x100',
    },
    thumbnail: 'https://placehold.co/1280x720',
    publishedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    viewCount: Math.floor(Math.random() * 1000000),
    duration: {
      length: Math.floor(Math.random() * 3600),
    },
    description: `Learn about ${q} in this comprehensive tutorial.`,
  }));

  return {
    videos: mockVideos,
    nextPageToken: Date.now().toString(),
    totalResults: 100,
  };
}

export async function getVideoCategories() {
  const params = new URLSearchParams({
    part: 'snippet',
    regionCode: 'US', // You might want to make this dynamic
    key: API_KEY!
  });

  const response = await fetch(`${YOUTUBE_API_URL}/videoCategories?${params}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch categories');
  }

  return data.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title
  }));
} 