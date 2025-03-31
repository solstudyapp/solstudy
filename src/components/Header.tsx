import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, LogOut, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { isUserAdmin } from "@/services/admin"
import { ThemeToggle } from "./theme-toggle"

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, handleSignOut } = useAuth()

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await isUserAdmin()
        setIsAdmin(adminStatus)
      } else {
        setIsAdmin(false)
      }
    }

    checkAdminStatus()
  }, [user])

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const onLogout = async () => {
    await handleSignOut()
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
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
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                isActive("/") ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                isActive("/about") ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              About
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-foreground ${
                    isActive("/dashboard")
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Dashboard
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors hover:text-foreground flex items-center ${
                  location.pathname.startsWith("/admin")
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <Shield className="mr-1 h-3 w-3" />
                Admin
              </Link>
            )}
          </nav>

          {/* Login/Register or Logout Button */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <Button
                variant="outline"
                className="text-foreground bg-transparent border-border hover:bg-muted"
                onClick={onLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button
                variant="outline"
                className="text-foreground bg-transparent border-border hover:bg-muted"
                asChild
              >
                <Link to="/auth">Login / Register</Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-foreground"
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
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-border">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/")
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/about")
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/dashboard")
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname.startsWith("/admin")
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Link>
            )}
            <div className="px-3 py-2">
              <ThemeToggle />
            </div>
            {user ? (
              <button
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-foreground bg-gradient-to-r from-[#9945FF]/30 to-[#14F195]/30 hover:from-[#9945FF]/40 hover:to-[#14F195]/40"
                onClick={() => {
                  setMobileMenuOpen(false)
                  onLogout()
                }}
              >
                <div className="flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </div>
              </button>
            ) : (
              <Link
                to="/auth"
                className="block px-3 py-2 rounded-md text-base font-medium text-foreground bg-gradient-to-r from-[#9945FF]/30 to-[#14F195]/30 hover:from-[#9945FF]/40 hover:to-[#14F195]/40"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
