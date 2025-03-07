
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-gradient">SolStudy</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-white ${
                isActive("/") ? "text-white" : "text-white/70"
              }`}
            >
              Home
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className={`text-sm font-medium transition-colors hover:text-white flex items-center ${
                isActive("/dashboard") || isActive("/lesson") || isActive("/quiz") ? "text-white" : "text-white/70"
              }`}>
                Learning <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/95 border border-white/10 text-white">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer hover:bg-white/10">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/lesson/1" className="cursor-pointer hover:bg-white/10">Lessons</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/quiz/1/1" className="cursor-pointer hover:bg-white/10">Quizzes</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger className={`text-sm font-medium transition-colors hover:text-white flex items-center ${
                isActive("/admin") ? "text-white" : "text-white/70"
              }`}>
                Admin <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/95 border border-white/10 text-white">
                <DropdownMenuItem asChild>
                  <Link to="/admin" className="cursor-pointer hover:bg-white/10">Admin Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/lessons" className="cursor-pointer hover:bg-white/10">Lesson Management</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/quizzes" className="cursor-pointer hover:bg-white/10">Quiz Management</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/users" className="cursor-pointer hover:bg-white/10">User Management</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors hover:text-white ${
                isActive("/about") ? "text-white" : "text-white/70"
              }`}
            >
              About
            </Link>
          </nav>

          {/* Login/Register Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="text-white bg-transparent border-white/20 hover:bg-white/10"
              asChild
            >
              <Link to="/auth">Login / Register</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/")
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <div className="px-3 py-2 rounded-md text-base font-medium text-white">
              Learning
            </div>
            <Link
              to="/dashboard"
              className={`block px-6 py-2 rounded-md text-base font-medium ${
                isActive("/dashboard")
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/lesson/1"
              className={`block px-6 py-2 rounded-md text-base font-medium ${
                location.pathname.includes("/lesson")
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Lessons
            </Link>
            <Link
              to="/quiz/1/1"
              className={`block px-6 py-2 rounded-md text-base font-medium ${
                location.pathname.includes("/quiz")
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Quizzes
            </Link>
            <div className="px-3 py-2 rounded-md text-base font-medium text-white">
              Admin
            </div>
            <Link
              to="/admin"
              className={`block px-6 py-2 rounded-md text-base font-medium ${
                isActive("/admin")
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin Dashboard
            </Link>
            <Link
              to="/admin/lessons"
              className={`block px-6 py-2 rounded-md text-base font-medium ${
                isActive("/admin/lessons")
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Lesson Management
            </Link>
            <Link
              to="/admin/quizzes"
              className={`block px-6 py-2 rounded-md text-base font-medium ${
                isActive("/admin/quizzes")
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Quiz Management
            </Link>
            <Link
              to="/admin/users"
              className={`block px-6 py-2 rounded-md text-base font-medium ${
                isActive("/admin/users")
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              User Management
            </Link>
            <Link
              to="/about"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/about")
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/auth"
              className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-[#9945FF]/30 to-[#14F195]/30 hover:from-[#9945FF]/40 hover:to-[#14F195]/40"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login / Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
