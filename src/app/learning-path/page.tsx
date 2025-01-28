"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { VideoCard } from "@/components/feed/VideoCard/VideoCard"
import { useLearningPaths } from "@/hooks/useLearningPaths"
import { usePathAnalytics } from "@/types/usePathAnalytics"
import { Progress } from "@/components/ui/progress"
import { Video } from "@/types/feed.types"
import { LearningPath } from "@/types/learning-path.types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { MoreVertical, Edit2, Trash2, CheckCircle, XCircle, Clock, Trophy, Flame, BookOpen, ArrowUpRight, Filter } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import dynamic from 'next/dynamic'

// Dynamic import with no SSR
const MindMap = dynamic(
  () => import('@/components/mindmap/MindMap').then(mod => mod.MindMap),
  { ssr: false }
)

interface PathCardProps {
  path: LearningPath & {
    progress: { completed: number; totalVideos: number };
    videos: Video[];
  };
  index: number;
  onEditPath: (path: LearningPath) => void;
  onDeletePath: (pathId: string) => void;
  onRemoveVideo: (pathId: string, videoId: string) => void;
  selectedVideo: Video | null;
  onVideoSelect: (video: Video | null) => void;
  activeTab: string;
}

function PathCard({
  path,
  index,
  onEditPath,
  onDeletePath,
  onRemoveVideo,
  selectedVideo,
  onVideoSelect,
  activeTab
}: PathCardProps) {
  const analytics = usePathAnalytics(path);

  return (
    <motion.div
      key={path.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-4">
                <span>{path.name}</span>
                <Badge variant={getDifficultyVariant(path.level)}>
                  {path.level}
                </Badge>
              </CardTitle>
              <CardDescription>{path.description}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditPath(path)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Path
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDeletePath(path.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Path
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Completion</p>
                    <p className="text-2xl font-bold">
                      {Math.round(analytics.completionRate)}%
                    </p>
                  </div>
                  <Progress value={analytics.completionRate} className="w-[60px]" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Time Today</p>
                    <p className="text-2xl font-bold">
                      {Math.round(analytics.timeSpentToday / 60)}m
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Streak</p>
                    <p className="text-2xl font-bold">
                      {analytics.streakDays} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Next Milestone</p>
                    <p className="text-2xl font-bold">
                      {analytics.nextMilestone.value}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="mindmap">Mind Map</TabsTrigger>
              <TabsTrigger value="topics">Topics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="videos" className="space-y-4">
              <ScrollArea className="h-[600px] pr-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {path.videos.map((video) => (
                      <motion.div
                        key={video.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative group"
                      >
                        <VideoCard
                          video={video}
                          onSelect={() => onVideoSelect(video)}
                          onSave={(id) => console.log('Save video:', id)}
                          onShare={(id) => console.log('Share video:', id)}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => onRemoveVideo(path.id, video.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        {video.completed && (
                          <div className="absolute top-2 left-2">
                            <Badge variant="outline" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Completed
                            </Badge>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="mindmap">
              <div className="h-[600px] w-full">
                <MindMap 
                  learningPath={path} 
                  selectedVideo={selectedVideo}
                  onVideoSelect={onVideoSelect}
                />
              </div>
            </TabsContent>

            <TabsContent value="topics">
              <div className="space-y-6">
                {Array.from(analytics.topicsProgress).map(([topic, progress]) => (
                  <div key={topic} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{topic}</p>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress value={progress} />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function LearningPathPage() {
  const { paths, setPaths, getActivePaths, updateProgress } = useLearningPaths();
  const [selectedVideo, setSelectedVideo] = React.useState<Video | null>(null);
  const [activeTab, setActiveTab] = React.useState("videos");
  const [editingPath, setEditingPath] = React.useState<LearningPath | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<'date' | 'progress' | 'difficulty'>('date');
  const [filterCategory, setFilterCategory] = React.useState<string>('all');

  const activePaths = React.useMemo(() => getActivePaths(), [getActivePaths]);

  const sortedAndFilteredPaths = React.useMemo(() => {
    const filtered = filterCategory === 'all' 
      ? activePaths 
      : activePaths.filter(p => p.category === filterCategory);

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return ((b.progress?.completed || 0) / Math.max(b.progress?.totalVideos || 1, 1)) - 
                 ((a.progress?.completed || 0) / Math.max(a.progress?.totalVideos || 1, 1));
        case 'difficulty':
          return getDifficultyScore(b.level) - getDifficultyScore(a.level);
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  }, [activePaths, sortBy, filterCategory]);

  const handleVideoSelect = React.useCallback((video: Video | null) => {
    setSelectedVideo(video);
    setActiveTab("mindmap");
    
    if (video) {
      try {
        updateProgress(video);
        toast({
          title: "Progress Updated",
          description: "Your progress has been saved",
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to update progress",
          variant: "destructive",
        });
      }
    }
  }, [updateProgress]);

  const handleEditPath = React.useCallback((path: LearningPath) => {
    setEditingPath(path);
    setIsDialogOpen(true);
  }, []);

  const handleDeletePath = React.useCallback((pathId: string) => {
    try {
      const updatedPaths = paths.filter(p => p.id !== pathId);
      localStorage.setItem('learningPaths', JSON.stringify(updatedPaths));
      toast({
        title: "Path Deleted",
        description: "The learning path has been deleted",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete learning path",
        variant: "destructive",
      });
    }
  }, [paths]);

  const handleRemoveVideo = React.useCallback((pathId: string, videoId: string) => {
    try {
      const updatedPaths = paths.map(path => {
        if (path.id === pathId) {
          return {
            ...path,
            videos: path.videos.filter(v => v.id !== videoId),
          };
        }
        return path;
      });
      localStorage.setItem('learningPaths', JSON.stringify(updatedPaths));
      toast({
        title: "Video Removed",
        description: "The video has been removed from the path",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to remove video",
        variant: "destructive",
      });
    }
  }, [paths]);

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Learning Paths</h1>
        <div className="flex items-center gap-4">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="ai">AI</SelectItem>
              <SelectItem value="machine-learning">Machine Learning</SelectItem>
              <SelectItem value="deep-learning">Deep Learning</SelectItem>
              <SelectItem value="computer-vision">Computer Vision</SelectItem>
              <SelectItem value="nlp">NLP</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Sort by
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setSortBy('date')}>
                  <Clock className="mr-2 h-4 w-4" />
                  Last Updated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('progress')}>
                  <Trophy className="mr-2 h-4 w-4" />
                  Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('difficulty')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Difficulty
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {sortedAndFilteredPaths.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <h2 className="text-xl font-semibold">No Learning Paths</h2>
              <p className="text-muted-foreground">
                Add videos to create your first learning path or change your filter settings.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          {sortedAndFilteredPaths.map((path, index) => (
            <PathCard
              key={path.id}
              path={path}
              index={index}
              onEditPath={handleEditPath}
              onDeletePath={handleDeletePath}
              onRemoveVideo={handleRemoveVideo}
              selectedVideo={selectedVideo}
              onVideoSelect={handleVideoSelect}
              activeTab={activeTab}
            />
          ))}
        </AnimatePresence>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Learning Path</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={editingPath?.name} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                name="description" 
                defaultValue={editingPath?.description} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select defaultValue={editingPath?.level}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getDifficultyVariant(level: string) {
  switch (level) {
    case 'beginner':
      return 'default';
    case 'intermediate':
      return 'secondary';
    case 'advanced':
      return 'destructive';
    default:
      return 'default';
  }
}

function getDifficultyScore(level: string) {
  switch (level) {
    case 'beginner':
      return 1;
    case 'intermediate':
      return 2;
    case 'advanced':
      return 3;
    default:
      return 0;
  }
}

