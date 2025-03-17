import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { signIn, signUp, signOut } from "@/services/auth"
import { toast } from "@/hooks/use-toast"

type AuthContextType = {
  user: User | null
  loading: boolean
  emailForConfirmation: string | null
  setEmailForConfirmation: (email: string | null) => void
  handleSignIn: (email: string, password: string) => Promise<boolean>
  handleSignUp: (
    email: string,
    password: string,
    referrerInfo?: { id: string; code: string } | null
  ) => Promise<boolean>
  handleSignOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailForConfirmation, setEmailForConfirmation] = useState<
    string | null
  >(null)

  useEffect(() => {
    // Check for active session on mount
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user || null)
      setLoading(false)
    }

    checkSession()

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleSignIn = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    setLoading(true)
    const response = await signIn(email, password)
    setLoading(false)

    if (!response.success) {
      toast({
        title: "Sign in failed",
        description:
          response.error?.message || "An error occurred during sign in",
        variant: "destructive",
      })
      return false
    }

    toast({
      title: "Welcome back",
      description: "You have successfully signed in",
    })

    return true
  }

  const handleSignUp = async (
    email: string,
    password: string,
    referrerInfo?: { id: string; code: string } | null
  ): Promise<boolean> => {
    setLoading(true)
    const response = await signUp(email, password, referrerInfo)
    setLoading(false)

    if (!response.success) {
      toast({
        title: "Sign up failed",
        description:
          response.error?.message || "An error occurred during sign up",
        variant: "destructive",
      })
      return false
    }

    // Store the email for the confirmation page
    setEmailForConfirmation(email)

    return true
  }

  const handleSignOut = async () => {
    setLoading(true)
    const response = await signOut()
    setLoading(false)

    if (!response.success) {
      toast({
        title: "Sign out failed",
        description:
          response.error?.message || "An error occurred during sign out",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Signed out",
      description: "You have been successfully signed out",
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        emailForConfirmation,
        setEmailForConfirmation,
        handleSignIn,
        handleSignUp,
        handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
