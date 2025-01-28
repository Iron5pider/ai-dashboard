"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Brain, BookOpen, ArrowRight, Sparkles, Clock } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useLearningPaths } from "@/hooks/useLearningPaths"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts'
import { useRouter } from 'next/navigation'
import { motion } from "framer-motion"

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  delay: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, description, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <Card className="overflow-hidden relative bg-gradient-to-br from-background to-background/50 border-2">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/0" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-full">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

interface LearningPathCardProps {
  title: string;
  progress: number;
  totalVideos: number;
  completedVideos: number;
  color: string;
  lastActivity?: string;
  delay: number;
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({
  title,
  progress,
  totalVideos,
  completedVideos,
  color,
  lastActivity,
  delay
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
  >
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 ${color} opacity-10 rounded-full blur-2xl`} />
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          <span>{title}</span>
          {progress >= 80 && (
            <div className="p-1 bg-yellow-500/10 rounded-full">
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {completedVideos} of {totalVideos} videos completed
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
        </div>
        {lastActivity && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last activity: {lastActivity}
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
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
    (sum, p) => sum + (p.completed * 10),
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
      !progress[path.id] && 
      (!path.prerequisites?.some(preq => !progress[preq])) && 
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between space-y-2"
      >
        <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
          Dashboard
        </h2>
      </motion.div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Videos Watched"
          value={totalVideosWatched}
          description="Across all learning paths"
          icon={Activity}
          delay={0.1}
        />
        <MetricCard
          title="Watch Time"
          value={`${Math.round(totalMinutesWatched / 60)}h ${totalMinutesWatched % 60}m`}
          description="Total learning time"
          icon={Clock}
          delay={0.2}
        />
        <MetricCard
          title="Active Paths"
          value={activePaths}
          description="Learning paths in progress"
          icon={Brain}
          delay={0.3}
        />
        <MetricCard
          title="Topics Covered"
          value={Object.values(progress).reduce(
            (sum, p) => sum + new Set(paths.find(path => path.id === p.pathId)?.topics || []).size,
            0
          )}
          description="Unique topics learned"
          icon={BookOpen}
          delay={0.4}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(progress).map(([pathId, pathProgress], index) => {
          const pathInfo = paths.find(p => p.id === pathId);
          if (!pathInfo) return null;
          
          return (
            <LearningPathCard
              key={pathId}
              title={pathInfo.name}
              progress={Math.round((pathProgress.completed / pathProgress.totalVideos) * 100)}
              totalVideos={pathProgress.totalVideos}
              completedVideos={pathProgress.completed}
              color={pathInfo.color}
              lastActivity={new Date(pathProgress.lastWatched).toLocaleDateString()}
              delay={0.2 + (index * 0.1)}
            />
          );
        })}
      </div>

      {recommendedPaths.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl">Recommended Learning Paths</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendedPaths.map(path => (
                <div 
                  key={path.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-background to-background/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium text-lg">{path.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {path.description}
                    </p>
                  </div>
                  <Button 
                    variant="default"
                    onClick={() => router.push('/feed')}
                    className="gap-2"
                  >
                    Start Learning
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Learning Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={Object.values(progress).map(p => ({
                    path: paths.find(path => path.id === p.pathId)?.name,
                    videos: p.completed
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="path" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))'
                    }}
                  />
                  <Bar 
                    dataKey="videos" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

