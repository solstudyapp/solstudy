import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useEffect } from "react"

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    )
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 border border-white/10">
          <Search className="h-10 w-10 text-white/70" />
        </div>

        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">
          Page Not Found
        </h2>

        <p className="text-white/70 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="space-y-4">
          <Button
            asChild
            className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
          >
            <Link to="/">Return to Home</Link>
          </Button>

          <div className="pt-2">
            <Link
              to="/dashboard"
              className="text-[#14F195] hover:underline text-sm"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
