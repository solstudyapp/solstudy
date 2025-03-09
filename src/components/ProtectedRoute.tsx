import { ReactNode, useEffect } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"

type ProtectedRouteProps = {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // If still loading, you could show a loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14F195]"></div>
      </div>
    )
  }

  // If not authenticated, redirect to login page
  if (!user) {
    // Save the location they were trying to go to
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  // If authenticated, render the protected content
  return <>{children}</>
}

export default ProtectedRoute
