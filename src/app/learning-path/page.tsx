"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoCard } from "@/components/feed/VideoCard/VideoCard"
import { useLearningPaths } from "@/hooks/useLearningPaths"
import { Progress } from "@/components/ui/progress"
import { Video } from "@/types/feed.types"
import { LearningPath } from "@/types/learning-path.types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Plus,
  CheckCircle,
  XCircle 
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import dynamic from 'next/dynamic'

// Dynamic import with no SSR
const MindMap = dynamic(
  () => import('@/components/mindmap/MindMap').then(mod => mod.MindMap),
  { ssr: false }
)

export default function LearningPathPage() {
  const { getActivePaths, updateProgress, paths, setPaths } = useLearningPaths();
  const [selectedVideo, setSelectedVideo] = React.useState<Video | null>(null);
  const [activeTab, setActiveTab] = React.useState("videos");
  const [editingPath, setEditingPath] = React.useState<LearningPath | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  const activePaths = getActivePaths() as (LearningPath & {
    progress: { completed: number; totalVideos: number };
    videos: Video[];
  })[];

  // CRUD Operations
  const handleDeletePath = (pathId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this learning path?");
    if (confirmed) {
      setPaths(prevPaths => {
        const updated = prevPaths.filter(p => p.id !== pathId);
        localStorage.setItem('learningPaths', JSON.stringify(updated));
        return updated;
      });
      toast({
        title: "Path Deleted",
        description: "Learning path has been removed",
      });
    }
  };

  const handleEditPath = (path: LearningPath) => {
    setEditingPath(path);
    setIsDialogOpen(true);
  };

  const handleUpdatePath = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPath) return;

    const formData = new FormData(e.currentTarget);
    const updatedPath = {
      ...editingPath,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    };

    setPaths(prevPaths => {
      const updated = prevPaths.map(p => 
        p.id === editingPath.id ? updatedPath : p
      );
      localStorage.setItem('learningPaths', JSON.stringify(updated));
      return updated;
    });

    setIsDialogOpen(false);
    setEditingPath(null);
    toast({
      title: "Path Updated",
      description: "Learning path has been updated successfully",
    });
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    setActiveTab("mindmap");
    updateProgress(video, 0);
  };

  const handleRemoveVideo = (pathId: string, videoId: string) => {
    setPaths(prevPaths => {
      const updated = prevPaths.map(path => {
        if (path.id === pathId) {
          return {
            ...path,
            videos: path.videos?.filter(v => v.id !== videoId) || [],
          };
        }
        return path;
      });
      localStorage.setItem('learningPaths', JSON.stringify(updated));
      return updated;
    });
    toast({
      title: "Video Removed",
      description: "Video has been removed from the learning path",
    });
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Learning Paths</h2>
      </div>

      {activePaths.map((path) => (
        <Card key={path.id} className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-4">
                <span>{path.name}</span>
                <Progress 
                  value={(path.progress.completed / path.progress.totalVideos) * 100} 
                  className="w-[100px]" 
                />
              </CardTitle>
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
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="videos">Videos</TabsTrigger>
                <TabsTrigger value="mindmap">Mind Map</TabsTrigger>
              </TabsList>
              
              <TabsContent value="videos" className="space-y-4">
                <p className="text-sm text-muted-foreground">{path.description}</p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {path.videos.map((video) => (
                    <div key={video.id} className="relative group">
                      <VideoCard
                        video={video}
                        onSelect={() => handleVideoSelect(video)}
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
                    </div>
                  ))}
                </div>
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
            </Tabs>
          </CardContent>
        </Card>
      ))}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
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
  );
} 