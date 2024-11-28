"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useLearningPaths } from "@/hooks/useLearningPaths"
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  PlaySquare,
  Bookmark,
  Settings,
  Trophy,
  Users,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const { paths, progress } = useLearningPaths()

  // Calculate active paths
  const activePaths = Object.entries(progress).filter(
    ([_, pathProgress]) => pathProgress.completed > 0
  )

  return (
    <aside 
      className={cn(
        "fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <nav className="space-y-2 p-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-4 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        <div className="space-y-1">
          <NavItem
            href="/"
            icon={LayoutDashboard}
            label="Overview"
            isActive={pathname === "/"}
            isCollapsed={isCollapsed}
          />
          <NavItem
            href="/feed"
            icon={PlaySquare}
            label="Video Feed"
            isActive={pathname === "/feed"}
            isCollapsed={isCollapsed}
          />
          <NavItem
            href="/learning-path"
            icon={BookOpen}
            label="Learning Path"
            isActive={pathname === "/learning-path"}
            isCollapsed={isCollapsed}
          />
        </div>

        <div className="relative py-4">
          <div className="absolute inset-y-0 left-2 w-[1px] bg-border" />
          {!isCollapsed && (
            <h4 className="mb-2 px-2 text-sm font-semibold tracking-tight">
              Learning Paths
            </h4>
          )}
          <div className="space-y-1">
            {activePaths.map(([pathId, pathProgress]) => {
              const pathInfo = paths.find(p => p.id === pathId)!
              const progress = Math.round(
                (pathProgress.completed / pathProgress.totalVideos) * 100
              )
              
              return (
                <NavItem
                  key={pathId}  
                  href={`/learning-paths/${pathId}`}
                  icon={GraduationCap}
                  label={pathInfo.name}
                  isActive={pathname === `/learning-paths/${pathId}`}
                  isCollapsed={isCollapsed}
                >
                  <div className="ml-auto flex items-center gap-2">
                    <Progress value={progress} className="h-1 w-12" />
                    <span className="text-xs text-muted-foreground">
                      {progress}%
                    </span>
                    {progress >= 80 && (
                      <Sparkles className="h-3 w-3 text-yellow-500" />
                    )}
                  </div>
                </NavItem>
              )
            })}
            <NavItem
              href="/learning-paths"
              icon={BookOpen}
              label="Browse All Paths"
              isActive={pathname === "/learning-paths"}
              isCollapsed={isCollapsed}
            />
          </div>
        </div>

        <div className="space-y-1">
          <NavItem
            href="/saved"
            icon={Bookmark}
            label="Saved Videos"
            isActive={pathname === "/saved"}
            isCollapsed={isCollapsed}
          >
            {progress && (
              <Badge variant="secondary" className="ml-auto">
                {Object.values(progress).reduce(
                  (sum, p) => sum + p.completed,
                  0
                )}
              </Badge>
            )}
          </NavItem>
          <NavItem
            href="/achievements"
            icon={Trophy}
            label="Achievements"
            isActive={pathname === "/achievements"}
            isCollapsed={isCollapsed}
          >
            {progress && Object.values(progress).some(p => p.completed >= 5) && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </NavItem>
          <NavItem
            href="/community"
            icon={Users}
            label="Community"
            isActive={pathname === "/community"}
            isCollapsed={isCollapsed}
          />
        </div>

        <div className="space-y-1">
          <NavItem
            href="/settings"
            icon={Settings}
            label="Settings"
            isActive={pathname === "/settings"}
            isCollapsed={isCollapsed}
          />
        </div>
      </nav>
    </aside>
  )
}

interface NavItemProps {
  href?: string
  icon?: React.ElementType
  label: string
  isActive?: boolean
  isCollapsed: boolean
  children?: React.ReactNode
  className?: string
}

function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
  isCollapsed,
  children,
  className,
}: NavItemProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  const content = (
    <div
      className={cn(
        "group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
        isActive ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground",
        isCollapsed ? "justify-center" : "",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon className={cn(
            "h-4 w-4 transition-transform",
            isHovered && "scale-110"
          )} />
        )}
        {!isCollapsed && <span>{label}</span>}
      </div>
      {!isCollapsed && children}
    </div>
  )

  if (href) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href}>{content}</Link>
        </TooltipTrigger>
        {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    )
  }

  return content
}
