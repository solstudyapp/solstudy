
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
  Award, 
  Settings, 
  Search, 
  Gift, 
  MoreHorizontal,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  Trash
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { lessonData } from "@/data/lessons";

// Mock user data
const users = [
  { id: "user1", name: "Alex Johnson", email: "alex@example.com", points: 750, lessonsCompleted: 5 },
  { id: "user2", name: "Sara Williams", email: "sara@example.com", points: 1250, lessonsCompleted: 8 },
  { id: "user3", name: "Michael Brown", email: "michael@example.com", points: 500, lessonsCompleted: 3 },
  { id: "user4", name: "Jessica Lee", email: "jessica@example.com", points: 950, lessonsCompleted: 6 },
  { id: "user5", name: "David Wilson", email: "david@example.com", points: 1100, lessonsCompleted: 7 },
  { id: "user6", name: "Emma Davis", email: "emma@example.com", points: 350, lessonsCompleted: 2 },
  { id: "user7", name: "James Martin", email: "james@example.com", points: 800, lessonsCompleted: 5 },
  { id: "user8", name: "Olivia Taylor", email: "olivia@example.com", points: 1500, lessonsCompleted: 10 },
];

// Admin Sidebar Component
const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname.split("/").pop() || "users";
  
  const navItems = [
    { path: "users", label: "Users", icon: <Users size={20} /> },
    { path: "lessons", label: "Lessons", icon: <BookOpen size={20} /> },
    { path: "quizzes", label: "Quizzes", icon: <HelpCircle size={20} /> },
    { path: "achievements", label: "Achievements", icon: <Award size={20} /> },
    { path: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];
  
  return (
    <div className="w-full lg:w-64 bg-accent1 rounded-lg p-4 sticky top-6">
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
                ? "bg-accent2 text-white"
                : "text-white/70 hover:text-white hover:bg-accent2/50"
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

// Users Tab Content
const UsersTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showAirdropDialog, setShowAirdropDialog] = useState(false);
  const [airdropAmount, setAirdropAmount] = useState("50");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  
  const selectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    }
  };
  
  const handleSingleAirdrop = (userId: string) => {
    // In a real app, you would send a request to your backend
    toast({
      title: "Airdrop Sent",
      description: `${airdropAmount} points sent to user.`,
    });
  };
  
  const handleBulkAirdrop = () => {
    if (selectedUsers.length === 0) return;
    
    // In a real app, you would send a request to your backend
    toast({
      title: "Bulk Airdrop Sent",
      description: `${airdropAmount} points sent to ${selectedUsers.length} users.`,
    });
    
    setShowAirdropDialog(false);
    setSelectedUsers([]);
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-accent1 border-border text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Users Management</CardTitle>
            <CardDescription className="text-white/70">
              Manage users and send reward airdrops
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white/20 text-white hover:bg-accent2/50"
              onClick={() => setShowAirdropDialog(true)}
              disabled={selectedUsers.length === 0}
            >
              <Gift size={16} className="mr-2" />
              Bulk Airdrop
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
              <Input
                placeholder="Search users..."
                className="pl-10 bg-accent2 border-white/20 text-white placeholder:text-white/60"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="rounded-md border border-white/20 overflow-hidden">
            <Table>
              <TableHeader className="bg-accent2">
                <TableRow className="hover:bg-accent2/80 border-white/10">
                  <TableHead className="w-12">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                        onChange={selectAll}
                        className="rounded border-white/20 bg-black/20 text-accent3 focus:ring-0 focus:ring-offset-0"
                      />
                    </div>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map(user => (
                  <TableRow key={user.id} className="hover:bg-accent2/50 border-white/10">
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-white/20 bg-black/20 text-accent3 focus:ring-0 focus:ring-offset-0"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.points}</TableCell>
                    <TableCell>{user.lessonsCompleted}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/70 hover:text-white hover:bg-accent2/80"
                        onClick={() => handleSingleAirdrop(user.id)}
                      >
                        <Gift size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/70 hover:text-white hover:bg-accent2/80"
                      >
                        <MoreVertical size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {paginatedUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-white/50">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-accent2/50"
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </Button>
              <span className="text-sm text-white/70">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-accent2/50"
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Airdrop Dialog */}
      <Dialog open={showAirdropDialog} onOpenChange={setShowAirdropDialog}>
        <DialogContent className="bg-black text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Bulk Airdrop Points</DialogTitle>
            <DialogDescription className="text-white/70">
              Send points to {selectedUsers.length} selected users
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">
              Points Amount
            </label>
            <Input
              type="number"
              value={airdropAmount}
              onChange={e => setAirdropAmount(e.target.value)}
              className="bg-accent2 border-white/20 text-white"
              min="1"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAirdropDialog(false)} className="border-white/20 text-white hover:bg-accent2/50">
              Cancel
            </Button>
            <Button onClick={handleBulkAirdrop} className="bg-accent3 text-white hover:bg-accent3/90">
              <Gift size={16} className="mr-2" />
              Send Airdrop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Lessons Tab Content
const LessonsTab = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-accent1 border-border text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Lessons Management</CardTitle>
            <CardDescription className="text-white/70">
              Create and manage learning modules
            </CardDescription>
          </div>
          <Button className="bg-accent3 text-white hover:bg-accent3/90">
            <Plus size={16} className="mr-2" />
            New Lesson
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/20 overflow-hidden">
            <Table>
              <TableHeader className="bg-accent2">
                <TableRow className="hover:bg-accent2/80 border-white/10">
                  <TableHead>Title</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Sponsored</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessonData.map(lesson => (
                  <TableRow key={lesson.id} className="hover:bg-accent2/50 border-white/10">
                    <TableCell className="font-medium">{lesson.title}</TableCell>
                    <TableCell>
                      <DifficultyBadge difficulty={lesson.difficulty} />
                    </TableCell>
                    <TableCell>{lesson.category}</TableCell>
                    <TableCell className="flex items-center">
                      {lesson.rating}
                      <span className="text-yellow-400 ml-1">★</span>
                      <span className="text-xs text-white/50 ml-1">({lesson.reviewCount})</span>
                    </TableCell>
                    <TableCell>
                      {lesson.sponsored ? (
                        <Badge className="bg-accent3/30 text-accent3">
                          Sponsored
                        </Badge>
                      ) : (
                        <span className="text-white/50">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/70 hover:text-white hover:bg-accent2/80"
                      >
                        <MoreVertical size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Admin Dashboard Main Component
const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-64 lg:shrink-0">
            <AdminSidebar />
          </div>
          
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<UsersTab />} />
              <Route path="/users" element={<UsersTab />} />
              <Route path="/lessons" element={<LessonsTab />} />
              <Route path="/quizzes" element={<div className="text-white p-6 bg-accent1 rounded-lg">Quizzes Management</div>} />
              <Route path="/achievements" element={<div className="text-white p-6 bg-accent1 rounded-lg">Achievements Management</div>} />
              <Route path="/settings" element={<div className="text-white p-6 bg-accent1 rounded-lg">Settings</div>} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
