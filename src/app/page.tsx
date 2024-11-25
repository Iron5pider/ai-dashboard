"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Brain, Users, BookOpen, TrendingUp, Award, ArrowRight, Sparkles, Clock } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useLearningPaths } from "@/hooks/useLearningPaths"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts'
import { useRouter } from 'next/navigation'

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, description, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

interface LearningPathCardProps {
  title: string;
  progress: number;
  totalVideos: number;
  completedVideos: number;
  color: string;
  lastActivity?: string;
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({
  title,
  progress,
  totalVideos,
  completedVideos,
  color,
  lastActivity
}) => (
  <Card className="relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 ${color} opacity-10 rounded-full`} />
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <span>{title}</span>
        {progress >= 80 && <Sparkles className="h-4 w-4 text-yellow-500" />}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          {completedVideos} of {totalVideos} videos completed
        </span>
        <span className="font-medium">{progress}%</span>
      </div>
      {lastActivity && (
        <p className="text-xs text-muted-foreground">
          Last activity: {lastActivity}
        </p>
      )}
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { paths, progress } = useLearningPaths();
  const router = useRouter();

  // Calculate total stats
  const totalVideosWatched = Object.values(progress).reduce(
    (sum, p) => sum + p.completed, 
    0
  );
  
  const totalMinutesWatched = Object.values(progress).reduce(
    (sum, p) => sum + (p.completed * 10), // Assuming average video length
    0
  );

  const activePaths = Object.keys(progress).length;

  // Get recommended paths
  const getRecommendedPaths = () => {
    const currentLevels = new Set(
      Object.keys(progress).map(pathId => 
        paths.find(p => p.id === pathId)?.level
      )
    );

    return paths.filter(path => 
      !progress[path.id] && // Not started
      (!path.prerequisites?.some(preq => !progress[preq])) && // Prerequisites met
      (
        (currentLevels.has('beginner') && path.level === 'intermediate') ||
        (currentLevels.has('intermediate') && path.level === 'advanced') ||
        (!currentLevels.size && path.level === 'beginner')
      )
    );
  };

  const recommendedPaths = getRecommendedPaths();

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Videos Watched"
          value={totalVideosWatched}
          description="Across all learning paths"
          icon={Activity}
        />
        <MetricCard
          title="Watch Time"
          value={`${Math.round(totalMinutesWatched / 60)}h ${totalMinutesWatched % 60}m`}
          description="Total learning time"
          icon={Clock}
        />
        <MetricCard
          title="Active Paths"
          value={activePaths}
          description="Learning paths in progress"
          icon={Brain}
        />
        <MetricCard
          title="Topics Covered"
          value={Object.values(progress).reduce(
            (sum, p) => sum + new Set(paths.find(path => path.id === p.pathId)?.topics || []).size,
            0
          )}
          description="Unique topics learned"
          icon={BookOpen}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(progress).map(([pathId, pathProgress]) => {
          const pathInfo = paths.find(p => p.id === pathId)!;
          return (
            <LearningPathCard
              key={pathId}
              title={pathInfo.name}
              progress={Math.round((pathProgress.completed / pathProgress.totalVideos) * 100)}
              totalVideos={pathProgress.totalVideos}
              completedVideos={pathProgress.completed}
              color={pathInfo.color}
              lastActivity={new Date(pathProgress.lastWatched).toLocaleDateString()}
            />
          );
        })}
      </div>

      {recommendedPaths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Learning Paths</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendedPaths.map(path => (
              <div 
                key={path.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="space-y-1">
                  <h4 className="font-medium">{path.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {path.description}
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/feed')}
                >
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Learning Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.values(progress).map(p => ({
                path: paths.find(path => path.id === p.pathId)?.name,
                videos: p.completed
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="path" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="videos" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

