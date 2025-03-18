import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, LogOut, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { isUserAdmin } from "@/services/admin"

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
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors hover:text-white ${
                isActive("/about") ? "text-white" : "text-white/70"
              }`}
            >
              About
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-white ${
                    isActive("/dashboard") ? "text-white" : "text-white/70"
                  }`}
                >
                  Dashboard
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors hover:text-white flex items-center ${
                  location.pathname.startsWith("/admin")
                    ? "text-white"
                    : "text-white/70"
                }`}
              >
                <Shield className="mr-1 h-3 w-3" />
                Admin
              </Link>
            )}
          </nav>

          {/* Login/Register or Logout Button */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <Button
                variant="outline"
                className="text-white bg-transparent border-white/20 hover:bg-white/10"
                onClick={onLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button
                variant="outline"
                className="text-white bg-transparent border-white/20 hover:bg-white/10"
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
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/dashboard")
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {/* <Link
                  to="/quiz-progress"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/quiz-progress")
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Quiz Progress
                </Link> */}
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname.startsWith("/admin")
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Link>
            )}
            {user ? (
              <button
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-[#9945FF]/30 to-[#14F195]/30 hover:from-[#9945FF]/40 hover:to-[#14F195]/40"
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
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-[#9945FF]/30 to-[#14F195]/30 hover:from-[#9945FF]/40 hover:to-[#14F195]/40"
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
