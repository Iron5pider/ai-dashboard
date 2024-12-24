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
import { MoreVertical, Edit2, Trash2, Plus, CheckCircle, XCircle, Clock, Trophy, Flame, BookOpen, ArrowUpRight, Filter } from 'lucide-react'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

export default function LearningPathPage() {
  const { getActivePaths, updateProgress, paths, setPaths } = useLearningPaths()
  const [selectedVideo, setSelectedVideo] = React.useState<Video | null>(null)
  const [activeTab, setActiveTab] = React.useState("videos")
  const [editingPath, setEditingPath] = React.useState<LearningPath | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [sortBy, setSortBy] = React.useState<'date' | 'progress' | 'difficulty'>('date')
  const [filterCategory, setFilterCategory] = React.useState<string>('all')
  
  // Memoize activePaths to prevent unnecessary recalculations
  const activePaths = React.useMemo(() => getActivePaths() as (LearningPath & {
    progress: { completed: number; totalVideos: number };
    videos: Video[];
  })[], [getActivePaths]);

  // Sort and filter paths
  const sortedAndFilteredPaths = React.useMemo(() => {
    let filtered = filterCategory === 'all' 
      ? activePaths 
      : activePaths.filter(p => p.category === filterCategory)

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return (b.progress.completed / b.progress.totalVideos) - 
                 (a.progress.completed / a.progress.totalVideos)
        case 'difficulty':
          return getDifficultyScore(b.level) - getDifficultyScore(a.level)
        default:
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
      }
    })
  }, [activePaths, sortBy, filterCategory])

  // Memoize handlers to prevent unnecessary recreations
  const handleVideoSelect = React.useCallback(async (video: Video, pathId: string) => {
    setSelectedVideo(video)
    setActiveTab("mindmap")
    
    try {
      await updateProgress(video, 0)
      toast({
        title: "Progress Updated",
        description: "Your progress has been saved",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      })
    }
  }, [updateProgress])

  const handleRemoveVideo = React.useCallback(async (pathId: string, videoId: string) => {
    const previousPaths = [...paths]
    
    try {
      setPaths(paths.map(path => {
        if (path.id === pathId) {
          return {
            ...path,
            videos: path.videos?.filter(v => v.id !== videoId) || [],
            updatedAt: new Date().toISOString(),
          }
        }
        return path
      }))
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      localStorage.setItem('learningPaths', JSON.stringify(paths))
      
      toast({
        title: "Video Removed",
        description: "Video has been removed from the learning path",
      })
    } catch (error) {
      setPaths(previousPaths)
      toast({
        title: "Error",
        description: "Failed to remove video",
        variant: "destructive",
      })
    }
  }, [paths, setPaths])

  // CRUD Operations with optimistic updates
  const handleDeletePath = async (pathId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this learning path?")
    if (!confirmed) return

    const previousPaths = [...paths]
    
    try {
      setPaths(paths.filter(p => p.id !== pathId))
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      localStorage.setItem('learningPaths', JSON.stringify(
        paths.filter(p => p.id !== pathId)
      ))
      
      toast({
        title: "Path Deleted",
        description: "Learning path has been removed",
      })
    } catch (error) {
      setPaths(previousPaths)
      toast({
        title: "Error",
        description: "Failed to delete learning path",
        variant: "destructive",
      })
    }
  }

  const handleEditPath = (path: LearningPath) => {
    setEditingPath(path)
    setIsDialogOpen(true)
  }

  const handleUpdatePath = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingPath) return

    const formData = new FormData(e.currentTarget)
    const updatedPath = {
      ...editingPath,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as LearningPath['category'],
      level: formData.get('difficulty') as LearningPath['level'],
      updatedAt: new Date().toISOString(),
    }

    const previousPaths = [...paths]
    
    try {
      setPaths(paths.map(p => p.id === editingPath.id ? updatedPath : p))
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      localStorage.setItem('learningPaths', JSON.stringify(
        paths.map(p => p.id === editingPath.id ? updatedPath : p)
      ))
      
      setIsDialogOpen(false)
      setEditingPath(null)
      
      toast({
        title: "Path Updated",
        description: "Learning path has been updated successfully",
      })
    } catch (error) {
      setPaths(previousPaths)
      toast({
        title: "Error",
        description: "Failed to update learning path",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight"
        >
          Learning Paths
        </motion.h2>
        
        <div className="flex items-center gap-4">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="ai">Artificial Intelligence</SelectItem>
              <SelectItem value="machine-learning">Machine Learning</SelectItem>
              <SelectItem value="deep-learning">Deep Learning</SelectItem>
              <SelectItem value="computer-vision">Computer Vision</SelectItem>
              <SelectItem value="nlp">Natural Language Processing</SelectItem>
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

      <AnimatePresence mode="popLayout">
        {sortedAndFilteredPaths.map((path, index) => {
          const analytics = usePathAnalytics(path)
          
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
                        <DropdownMenuItem onClick={() => handleEditPath(path)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Path
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeletePath(path.id)}
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
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
                                  onSelect={() => handleVideoSelect(video, path.id)}
                                  onSave={(id) => console.log('Save video:', id)}
                                  onShare={(id) => console.log('Share video:', id)}
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleRemoveVideo(path.id, video.id)}
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
                          onVideoSelect={setSelectedVideo}
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
          )
        })}
      </AnimatePresence>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Learning Path</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdatePath} className="space-y-4">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={editingPath?.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai">AI</SelectItem>
                    <SelectItem value="machine-learning">Machine Learning</SelectItem>
                    <SelectItem value="deep-learning">Deep Learning</SelectItem>
                    <SelectItem value="computer-vision">Computer Vision</SelectItem>
                    <SelectItem value="nlp">NLP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select name="difficulty" defaultValue={editingPath?.level}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function getDifficultyScore(difficulty: string): number {
  const scores = {
    beginner: 1,
    intermediate: 2,
    advanced: 3
  }
  return scores[difficulty as keyof typeof scores] || 0
}

function getDifficultyVariant(difficulty: string): "default" | "outline" | "secondary" {
  switch (difficulty) {
    case 'beginner':
      return 'outline'
    case 'intermediate':
      return 'secondary'
    case 'advanced':
      return 'default'
    default:
      return 'default'
  }
}

