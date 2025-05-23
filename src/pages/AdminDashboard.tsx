import { useState } from "react"
import { Route, Routes, Link, useLocation, Navigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BookOpen,
  HelpCircle,
  Search,
  Gift,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  Trash,
  Pencil,
  Save,
  X,
  LayoutDashboard,
} from "lucide-react"
import UserManagement from "@/components/admin/UserManagement"
import LessonManagement from "@/components/admin/LessonManagement"
import QuizManagement from "@/components/admin/QuizManagement"
import AdminOverview from "@/components/admin/AdminOverview"
import { cn } from "@/lib/utils"

// Admin Sidebar Component
const AdminSidebar = () => {
  const location = useLocation()
  const currentPath = location.pathname.split("/").pop() || "dashboard"

  const navItems = [
    {
      path: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { path: "users", label: "Users", icon: <Users size={20} /> },
    { path: "lessons", label: "Lessons", icon: <BookOpen size={20} /> },
    { path: "quizzes", label: "Quizzes", icon: <HelpCircle size={20} /> },
  ]

  return (
    <div className="w-full lg:w-64 bg-card rounded-lg p-4 sticky top-6 border border-border">
      <div className="p-2 mb-6">
        <h2 className="text-xl font-bold text-foreground">Admin Dashboard</h2>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={`/admin/${item.path}`}
            className={cn(
              "flex items-center px-3 py-2 rounded-md transition-colors",
              currentPath === item.path
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-border mt-8">
        <Link
          to="/"
          className="flex items-center px-3 py-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={20} className="mr-2" /> Back to Site
        </Link>
      </div>
    </div>
  )
}

// Admin Dashboard Main Component
const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-64 lg:shrink-0">
            <AdminSidebar />
          </div>

          <div className="flex-1">
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route path="/dashboard" element={<AdminOverview />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/lessons" element={<LessonManagement />} />
              <Route path="/quizzes" element={<QuizManagement />} />
              {/* Redirect any unknown routes to dashboard */}
              <Route
                path="*"
                element={<Navigate to="/admin/dashboard" replace />}
              />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
