
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Gift, MoreVertical, Trash, Settings, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showAirdropDialog, setShowAirdropDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUserSettingsDialog, setShowUserSettingsDialog] = useState(false);
  const [airdropAmount, setAirdropAmount] = useState("50");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState<(typeof users)[0] | null>(null);
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
  
  const handleSingleAirdrop = (user: (typeof users)[0]) => {
    setCurrentUser(user);
    setShowAirdropDialog(true);
  };
  
  const handleSingleUserSettings = (user: (typeof users)[0]) => {
    setCurrentUser(user);
    setShowUserSettingsDialog(true);
  };
  
  const handleDeleteUser = (user: (typeof users)[0]) => {
    setCurrentUser(user);
    setShowDeleteDialog(true);
  };
  
  const confirmDeleteUser = () => {
    if (!currentUser) return;
    
    toast({
      title: "User Deleted",
      description: `${currentUser.name} has been deleted.`,
    });
    
    setShowDeleteDialog(false);
    setCurrentUser(null);
  };
  
  const confirmSingleAirdrop = () => {
    if (!currentUser) return;
    
    toast({
      title: "Airdrop Sent",
      description: `${airdropAmount} points sent to ${currentUser.name}.`,
    });
    
    setShowAirdropDialog(false);
    setCurrentUser(null);
  };
  
  const handleBulkAirdrop = () => {
    if (selectedUsers.length === 0) return;
    
    toast({
      title: "Bulk Airdrop Sent",
      description: `${airdropAmount} points sent to ${selectedUsers.length} users.`,
    });
    
    setShowAirdropDialog(false);
    setSelectedUsers([]);
  };
  
  const saveUserSettings = () => {
    if (!currentUser) return;
    
    toast({
      title: "Settings Saved",
      description: `Settings for ${currentUser.name} have been updated.`,
    });
    
    setShowUserSettingsDialog(false);
    setCurrentUser(null);
  };
  
  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-md bg-white/10 border-white/10 text-white">
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
              className="border-white/20 text-white hover:bg-white/10"
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
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="rounded-md border border-white/20 overflow-hidden">
            <Table>
              <TableHeader className="bg-white/10">
                <TableRow className="hover:bg-white/5 border-white/10">
                  <TableHead className="w-12">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                        onChange={selectAll}
                        className="rounded border-white/20 bg-white/10 text-[#9945FF] focus:ring-0 focus:ring-offset-0"
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
                  <TableRow key={user.id} className="hover:bg-white/5 border-white/10">
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-white/20 bg-white/10 text-[#9945FF] focus:ring-0 focus:ring-offset-0"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.points}</TableCell>
                    <TableCell>{user.lessonsCompleted}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white/70 hover:text-white hover:bg-white/10"
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-black/70 backdrop-blur-md border-white/10 text-white">
                          <DropdownMenuItem onClick={() => handleSingleAirdrop(user)}
                            className="hover:bg-white/10 cursor-pointer">
                            <Gift size={16} className="mr-2" />
                            Send Points
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSingleUserSettings(user)}
                            className="hover:bg-white/10 cursor-pointer">
                            <Settings size={16} className="mr-2" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteUser(user)}
                            className="hover:bg-white/10 cursor-pointer text-red-400">
                            <Trash size={16} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                className="border-white/20 text-white hover:bg-white/10"
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
                className="border-white/20 text-white hover:bg-white/10"
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
        <DialogContent className="bg-[#1A1F2C] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>
              {selectedUsers.length > 0 
                ? `Bulk Airdrop Points to ${selectedUsers.length} Users` 
                : `Send Points to ${currentUser?.name}`}
            </DialogTitle>
            <DialogDescription className="text-white/70">
              {selectedUsers.length > 0 
                ? `Send points to ${selectedUsers.length} selected users`
                : "Send reward points to this user"}
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
              className="bg-white/10 border-white/20 text-white"
              min="1"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAirdropDialog(false)} className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button 
              onClick={selectedUsers.length > 0 ? handleBulkAirdrop : confirmSingleAirdrop} 
              className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
            >
              <Gift size={16} className="mr-2" />
              Send Points
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1A1F2C] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to delete {currentUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button onClick={confirmDeleteUser} variant="destructive">
              <Trash size={16} className="mr-2" />
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* User Settings Dialog */}
      <Dialog open={showUserSettingsDialog} onOpenChange={setShowUserSettingsDialog}>
        <DialogContent className="bg-[#1A1F2C] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>User Settings: {currentUser?.name}</DialogTitle>
            <DialogDescription className="text-white/70">
              Manage user account settings and permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                value={currentUser?.name}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                value={currentUser?.email}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Total Points</label>
              <Input
                value={currentUser?.points.toString()}
                className="bg-white/10 border-white/20 text-white"
                type="number"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserSettingsDialog(false)} className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button onClick={saveUserSettings} className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90">
              <CheckCircle size={16} className="mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
