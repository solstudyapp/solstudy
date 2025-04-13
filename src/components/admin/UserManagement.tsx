import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Gift,
  MoreVertical,
  Trash,
  Settings,
  CheckCircle,
  Eye,
  Edit,
  RefreshCw,
  Loader2,
  KeyRound,
  EyeOff,
  MoreHorizontal,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { resetUserPassword } from "@/services/adminService"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface User {
  id: string
  name: string
  email: string | null
  points: number
  lessonsCompleted: number
  lastActivity: string
  isActive: boolean
  avatar: string
  status: string
  progress: number
}

const currentDate = new Date()
const thirtyDaysAgo = new Date(currentDate)
thirtyDaysAgo.setDate(currentDate.getDate() - 30)

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const isUserActive = (lastActivity: string): boolean => {
  const date = new Date(lastActivity)
  return date >= thirtyDaysAgo
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showAirdropDialog, setShowAirdropDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUserSettingsDialog, setShowUserSettingsDialog] = useState(false)
  const [airdropAmount, setAirdropAmount] = useState("50")
  const [currentPage, setCurrentPage] = useState(1)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)
  const pageSize = 5

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("*")
      if (profilesError) throw profilesError

      const transformedUsers = (profiles || []).map((profile) => ({
        id: profile.user_id,
        name: profile.full_name || "Unknown",
        email: profile.email || "",
        points: profile.points || 0,
        lessonsCompleted: profile.lessons_completed || 0,
        lastActivity: profile.last_activity || profile.created_at,
        isActive: profile.is_active,
        avatar: profile.avatar || "",
        status: profile.is_active ? "active" : "inactive",
        progress: Math.round(
          (profile.lessons_completed / profile.lessons_total) * 100
        ),
      }))

      setUsers(transformedUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  )

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const totalPages = Math.ceil(filteredUsers.length / pageSize)

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const selectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(paginatedUsers.map((user) => user.id))
    }
  }

  const handleSingleAirdrop = (user: User) => {
    setCurrentUser(user)
    setShowAirdropDialog(true)
  }

  const handleSingleUserSettings = (user: User) => {
    setCurrentUser(user)
    setShowUserSettingsDialog(true)
  }

  const handleDeleteUser = (user: User) => {
    setCurrentUser(user)
    setShowDeleteDialog(true)
  }

  const confirmDeleteUser = async () => {
    if (!currentUser) return

    try {
      const { error } = await supabase.auth.admin.deleteUser(currentUser.id)
      if (error) throw error

      toast({
        title: "User Deleted",
        description: `${currentUser.name} has been deleted.`,
      })

      fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }

    setShowDeleteDialog(false)
    setCurrentUser(null)
  }

  const handlePasswordReset = (user: User) => {
    setCurrentUser(user)
    setNewPassword("")
    setShowPassword(false)
    setShowPasswordResetDialog(true)
    setResettingPassword(false)
  }

  const confirmPasswordReset = async () => {
    if (!currentUser || !newPassword) return;
    
    setResettingPassword(true);
    try {
      const result = await resetUserPassword(currentUser.id, newPassword);
      
      if (result.success) {
        toast({
          title: "Password Reset",
          description: `Password for ${currentUser.email} has been reset successfully.`,
        });
        setShowPasswordResetDialog(false);
        setCurrentUser(null);
        setNewPassword("");
      } else {
        console.error("Password reset error:", result.error);
        toast({
          title: "Password Reset Failed",
          description: result.error || "Failed to reset password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setResettingPassword(false);
    }
  }

  const generateRandomPassword = () => {
    const length = 12
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      password += charset[randomIndex]
    }
    setNewPassword(password)
  }

  const confirmSingleAirdrop = async () => {
    if (!currentUser) return

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          points: (currentUser.points || 0) + parseInt(airdropAmount),
        })
        .eq("user_id", currentUser.id)

      if (error) throw error

      toast({
        title: "Airdrop Sent",
        description: `${airdropAmount} points sent to ${currentUser.name}.`,
      })

      fetchUsers()
    } catch (error) {
      console.error("Error sending points:", error)
      toast({
        title: "Error",
        description: "Failed to send points",
        variant: "destructive",
      })
    }

    setShowAirdropDialog(false)
    setCurrentUser(null)
  }

  const handleBulkAirdrop = async () => {
    if (selectedUsers.length === 0) return

    try {
      const updates = selectedUsers.map((userId) => {
        const user = users.find((u) => u.id === userId)
        return supabase
          .from("user_profiles")
          .update({
            points: (user?.points || 0) + parseInt(airdropAmount),
          })
          .eq("user_id", userId)
      })

      await Promise.all(updates)

      toast({
        title: "Bulk Airdrop Sent",
        description: `${airdropAmount} points sent to ${selectedUsers.length} users.`,
      })

      fetchUsers()
    } catch (error) {
      console.error("Error sending bulk points:", error)
      toast({
        title: "Error",
        description: "Failed to send points to some users",
        variant: "destructive",
      })
    }

    setShowAirdropDialog(false)
    setSelectedUsers([])
  }

  const saveUserSettings = async () => {
    if (!currentUser) return

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          full_name: currentUser.name,
          points: currentUser.points,
          last_activity: currentUser.lastActivity,
          is_active: currentUser.isActive,
        })
        .eq("user_id", currentUser.id)

      if (error) throw error

      toast({
        title: "Settings Saved",
        description: `Settings for ${currentUser.name} have been updated.`,
      })

      fetchUsers()
    } catch (error) {
      console.error("Error updating user settings:", error)
      toast({
        title: "Error",
        description: "Failed to update user settings",
        variant: "destructive",
      })
    }

    setShowUserSettingsDialog(false)
    setCurrentUser(null)
  }

  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    items.push(
      <PaginationItem key="page-1">
        <PaginationLink 
          onClick={() => setCurrentPage(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
    
    if (endPage < startPage) endPage = startPage;
    
    if (startPage > 2) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink 
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink 
            onClick={() => setCurrentPage(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  }

  if (loading) {
    return (
      <div className="min-h-[300px] bg-black/30 p-4 flex items-center justify-center">
        <div className="flex flex-col items-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <div>Loading users...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => fetchUsers()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "active" ? "default" : "secondary"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden mr-2">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${user.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {user.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(user.lastActivity), {
                          addSuffix: true,
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleSingleAirdrop(user)}
                          >
                            <Gift className="mr-2 h-4 w-4" />
                            Send Points
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleSingleUserSettings(user)}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePasswordReset(user)}
                          >
                            <KeyRound className="mr-2 h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="py-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {generatePaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

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
              onChange={(e) => setAirdropAmount(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
              min="1"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAirdropDialog(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={
                selectedUsers.length > 0
                  ? handleBulkAirdrop
                  : confirmSingleAirdrop
              }
              className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
            >
              <Gift size={16} className="mr-2" />
              Send Points
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1A1F2C] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to delete {currentUser?.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button onClick={confirmDeleteUser} variant="destructive">
              <Trash size={16} className="mr-2" />
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showUserSettingsDialog}
        onOpenChange={setShowUserSettingsDialog}
      >
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
                onChange={(e) =>
                  setCurrentUser((curr) =>
                    curr ? { ...curr, name: e.target.value } : null
                  )
                }
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                value={currentUser?.email || ""}
                disabled
                className="bg-white/10 border-white/20 text-white opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Total Points
              </label>
              <Input
                value={currentUser?.points.toString()}
                onChange={(e) =>
                  setCurrentUser((curr) =>
                    curr
                      ? { ...curr, points: parseInt(e.target.value) || 0 }
                      : null
                  )
                }
                className="bg-white/10 border-white/20 text-white"
                type="number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Last Activity
              </label>
              <Input
                value={currentUser?.lastActivity.split("T")[0]}
                onChange={(e) =>
                  setCurrentUser((curr) =>
                    curr ? { ...curr, lastActivity: e.target.value } : null
                  )
                }
                className="bg-white/10 border-white/20 text-white"
                type="date"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUserSettingsDialog(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={saveUserSettings}
              className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
            >
              <CheckCircle size={16} className="mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={showPasswordResetDialog} 
        onOpenChange={(open) => {
          if (!open) {
            setShowPasswordResetDialog(false);
            setNewPassword("");
            setResettingPassword(false);
          }
        }}
      >
        <DialogContent className="bg-[#1A1F2C] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription className="text-white/70">
              Reset password for {currentUser?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <Input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white pr-10"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  disabled={resettingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white"
                  disabled={resettingPassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={generateRandomPassword}
              className="w-full border-white/20 text-white hover:bg-white/10"
              disabled={resettingPassword}
            >
              Generate Random Password
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordResetDialog(false);
                setNewPassword("");
                setResettingPassword(false);
              }}
              className="border-white/20 text-white hover:bg-white/10"
              disabled={resettingPassword}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmPasswordReset}
              className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
              disabled={resettingPassword || !newPassword}
            >
              {resettingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <KeyRound size={16} className="mr-2" />
                  Reset Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserManagement
