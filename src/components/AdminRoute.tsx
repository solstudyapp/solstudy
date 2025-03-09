import { ReactNode, useEffect, useState } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { isUserAdmin } from "@/services/admin"
import NotFound from "@/pages/NotFound"

type AdminRouteProps = {
  children: ReactNode
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [checkingAdmin, setCheckingAdmin] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false)
        setCheckingAdmin(false)
        return
      }

      try {
        const adminStatus = await isUserAdmin()
        setIsAdmin(adminStatus)
      } catch (error) {
        console.error("Error checking admin status:", error)
        setIsAdmin(false)
      } finally {
        setCheckingAdmin(false)
      }
    }

    if (!loading) {
      checkAdminStatus()
    }
  }, [user, loading])

  // If still loading or checking admin status, show loading spinner
  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14F195]"></div>
      </div>
    )
  }

  // If not authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  // If authenticated but not admin, show NotFound page
  if (!isAdmin) {
    return <NotFound />
  }

  // If authenticated and admin, render the protected content
  return <>{children}</>
}

export default AdminRoute
