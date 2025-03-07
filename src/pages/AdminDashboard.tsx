
import { useState } from "react";
import { Route, Routes, Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  HelpCircle,
  Settings, 
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
  X
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { lessonData } from "@/data/lessons";
import { quizzesData } from "@/data/quizzes";
import { QuizEditor } from "@/components/admin/QuizEditor";
import { LessonEditor } from "@/components/admin/LessonEditor";
import UserManagement from "@/components/admin/UserManagement";
import LessonManagement from "@/components/admin/LessonManagement";
import QuizManagement from "@/components/admin/QuizManagement";
import SettingsPanel from "@/components/admin/SettingsPanel";

// Admin Sidebar Component
const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname.split("/").pop() || "users";
  
  const navItems = [
    { path: "users", label: "Users", icon: <Users size={20} /> },
    { path: "lessons", label: "Lessons", icon: <BookOpen size={20} /> },
    { path: "quizzes", label: "Quizzes", icon: <HelpCircle size={20} /> },
    { path: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];
  
  return (
    <div className="w-full lg:w-64 bg-sidebar dark-glass rounded-lg p-4 sticky top-6">
      <div className="p-2 mb-6">
        <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
      </div>
      
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={`/admin/${item.path}`}
            className={`flex items-center px-3 py-2 rounded-md transition-colors ${
              currentPath === item.path
                ? "bg-sidebar-accent text-white"
                : "text-white/70 hover:text-white hover:bg-sidebar-accent/50"
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-white/10 mt-8">
        <Link to="/" className="flex items-center px-3 py-2 text-white/70 hover:text-white">
          <ChevronLeft size={20} className="mr-2" /> Back to Site
        </Link>
      </div>
    </div>
  );
};

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
              <Route path="/" element={<UserManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/lessons" element={<LessonManagement />} />
              <Route path="/quizzes" element={<QuizManagement />} />
              <Route path="/settings" element={<SettingsPanel />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
