"use client"

import { LearningPath } from "@/types/learning-path.types"
import { Video } from "@/types/feed.types"

/**
 * Retrieves the learning path information by its ID.
 * @param pathId - The ID of the learning path.
 * @param learningPaths - An array of all learning paths.
 * @returns The LearningPath object if found, otherwise undefined.
 */
export const getPathInfoById = (
  pathId: string,
  learningPaths: LearningPath[]
): LearningPath | undefined => {
  return learningPaths.find((path) => path.id === pathId);
};

/**
 * Calculates the progress of a learning path.
 * @param learningPath - The LearningPath object.
 * @returns An object containing completed videos count and total videos count.
 */
export const getPathProgress = (learningPath: LearningPath): {
  completed: number;
  totalVideos: number;
} => {
  if (!learningPath.videos) return { completed: 0, totalVideos: 0 };
  
  const totalVideos = learningPath.videos.length;
  const completed = learningPath.videos.filter(video => video.completed).length;
  
  return { completed, totalVideos };
};

/**
 * Updates the completion status of a video within a learning path.
 * @param learningPath - The LearningPath object.
 * @param videoId - The ID of the video to update.
 * @param completed - The new completion status.
 * @returns The updated LearningPath object.
 */
export const updateVideoCompletion = (
  learningPath: LearningPath,
  videoId: string,
  completed: boolean
): LearningPath => {
  if (!learningPath.videos) return learningPath;

  const updatedVideos = learningPath.videos.map(video =>
    video.id === videoId ? { ...video, completed } : video
  );

  return { ...learningPath, videos: updatedVideos };
};

/**
 * Adds a new video to a learning path.
 * @param learningPath - The LearningPath object.
 * @param newVideo - The Video object to add.
 * @returns The updated LearningPath object.
 */
export const addVideoToPath = (
  learningPath: LearningPath,
  newVideo: Video
): LearningPath => {
  return { ...learningPath, videos: [...(learningPath.videos || []), newVideo] };
};

/**
 * Removes a video from a learning path by its ID.
 * @param learningPath - The LearningPath object.
 * @param videoId - The ID of the video to remove.
 * @returns The updated LearningPath object.
 */
export const removeVideoFromPath = (
  learningPath: LearningPath,
  videoId: string
): LearningPath => {
  const updatedVideos = learningPath.videos?.filter((video) => video.id !== videoId) || [];
  return { ...learningPath, videos: updatedVideos };
};