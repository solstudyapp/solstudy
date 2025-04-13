
import { useState, useEffect } from "react"
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Apple, Facebook, Github, Mail, Loader2, UserPlus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons"
import { FEATURES } from "@/config/features"
import { getReferralCodeByCode } from "@/services/referralService"
import { toast } from "@/hooks/use-toast"
import { isUserAdmin } from "@/services/admin"

type LocationState = {
  from?: {
    pathname: string
  }
}

interface AuthPageProps {
  defaultTab?: "signin" | "signup"
}

const AuthPage = ({ defaultTab = "signin" }: AuthPageProps) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referrerInfo, setReferrerInfo] = useState<{
    id: string
    code: string
  } | null>(null)
  const { handleSignIn, handleSignUp, loading, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const state = location.state as LocationState

  useEffect(() => {
    const ref = searchParams.get("ref")
    if (ref) {
      setReferralCode(ref)
      checkReferralCode(ref)
    }
  }, [searchParams])

  const checkReferralCode = async (code: string) => {
    const response = await getReferralCodeByCode(code)
    if (response.success && response.data) {
      setReferrerInfo({
        id: response.data.referrer_id,
        code: response.data.id,
      })
    } else {
      toast({
        title: "Invalid referral code",
        description: "The referral code is invalid or has expired.",
        variant: "destructive",
      })
      setReferralCode(null)
    }
  }

  useEffect(() => {
    if (user) {
      navigate(state?.from?.pathname || "/")
    }
  }, [user, navigate, state])

  const handleEmailAuth = async (isSignUp: boolean) => {
    setError(null)

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    if (isSignUp) {
      const success = await handleSignUp(email, password, referrerInfo)
      if (success) {
        navigate("/email-confirmation")
      }
    } else {
      const success = await handleSignIn(email, password)
      if (success) {
        navigate(state?.from?.pathname || "/")
      } else {
        setError("Invalid login credentials")
      }
    }
  }

  const handleSocialAuth = (provider: string) => {
    // Social auth will be implemented later
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-gradient">SolStudy</h1>
          </Link>
          <p className="text-muted-foreground mt-2">
            Learn, earn, and grow with crypto
          </p>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-muted/10 backdrop-blur-md text-foreground border border-border">
            <TabsTrigger
              value="signin"
              className="data-[state=active]:bg-muted/20 data-[state=active]:text-foreground text-muted-foreground"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="data-[state=active]:bg-muted/20 data-[state=active]:text-foreground text-muted-foreground"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Sign in to your SolStudy account to continue learning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="text-sm font-medium text-destructive">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-muted/5 border-border text-foreground placeholder:text-muted-foreground"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-muted/5 border-border text-foreground placeholder:text-muted-foreground"
                    disabled={loading}
                  />
                </div>
                <Button
                  className="w-full bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
                  onClick={() => handleEmailAuth(false)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Sign In with Email
                    </>
                  )}
                </Button>
                {FEATURES.SOCIAL_AUTH && (
                  <SocialAuthButtons
                    onSocialAuth={handleSocialAuth}
                    loading={loading}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Create a SolStudy account to start learning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="text-sm font-medium text-destructive">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-muted/5 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-muted/5 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                {referralCode && (
                  <div className="bg-[#14F195]/10 border border-[#14F195]/30 rounded-md p-3 text-sm">
                    <p className="text-foreground flex items-center">
                      <UserPlus className="h-4 w-4 mr-2 text-[#14F195]" />
                      <span>
                        <strong>Referral bonus:</strong> You've been referred!
                        Both you and your friend will earn points.
                      </span>
                    </p>
                  </div>
                )}
                <div className="bg-[#14F195]/10 border border-[#14F195]/30 rounded-md p-3 text-sm">
                  <p className="text-foreground">
                    <strong>Bonus:</strong> Get 100 points just for signing up!
                  </p>
                </div>
                <Button
                  className="w-full bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
                  onClick={() => handleEmailAuth(true)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing Up...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Sign Up with Email
                    </>
                  )}
                </Button>
                {FEATURES.SOCIAL_AUTH && (
                  <SocialAuthButtons
                    onSocialAuth={handleSocialAuth}
                    loading={loading}
                  />
                )}
              </CardContent>
              <CardFooter className="text-muted-foreground text-sm text-center">
                By signing up, you agree to our Terms of Service and Privacy
                Policy
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AuthPage
