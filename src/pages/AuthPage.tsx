import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
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
import { Apple, Facebook, Github, Mail, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

type LocationState = {
  from?: {
    pathname: string
  }
}

const AuthPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { handleSignIn, handleSignUp, loading, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate(state?.from?.pathname || "/")
    }
  }, [user, navigate, state])

  const handleEmailAuth = async (isSignUp: boolean) => {
    if (!email || !password) {
      return
    }

    if (isSignUp) {
      const success = await handleSignUp(email, password)
      if (success) {
        navigate("/email-confirmation")
      }
    } else {
      const success = await handleSignIn(email, password)
      if (success) {
        // Redirect to the page they were trying to access or home
        navigate(state?.from?.pathname || "/")
      }
    }
  }

  const handleSocialAuth = (provider: string) => {
    // Social auth will be implemented later
    console.log(`${provider} authentication not implemented yet`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-gradient">SolStudy</h1>
          </Link>
          <p className="text-white/70 mt-2">
            Learn, earn, and grow with crypto
          </p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-white/5 backdrop-blur-md text-white border border-white/10">
            <TabsTrigger
              value="signin"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card className="dark-glass border-white/10 text-white">
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription className="text-white/70">
                  Sign in to your SolStudy account to continue learning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                    disabled={loading}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
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

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-black/60 px-2 text-white/50 backdrop-blur-md">
                      or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5 bg-white/5"
                    onClick={() => handleSocialAuth("Google")}
                    disabled={loading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5 bg-white/5"
                    onClick={() => handleSocialAuth("Apple")}
                    disabled={loading}
                  >
                    <Apple className="mr-2 h-4 w-4" />
                    Apple
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5 bg-white/5"
                    onClick={() => handleSocialAuth("Facebook")}
                    disabled={loading}
                  >
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5 bg-white/5"
                    onClick={() => handleSocialAuth("GitHub")}
                    disabled={loading}
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="dark-glass border-white/10 text-white">
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription className="text-white/70">
                  Create a SolStudy account to start learning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                    disabled={loading}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                    disabled={loading}
                  />
                </div>
                <div className="bg-[#14F195]/10 border border-[#14F195]/30 rounded-md p-3 text-sm">
                  <p className="text-white">
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

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-black/60 px-2 text-white/50 backdrop-blur-md">
                      or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5 bg-white/5"
                    onClick={() => handleSocialAuth("Google")}
                    disabled={loading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5 bg-white/5"
                    onClick={() => handleSocialAuth("Apple")}
                    disabled={loading}
                  >
                    <Apple className="mr-2 h-4 w-4" />
                    Apple
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5 bg-white/5"
                    onClick={() => handleSocialAuth("Facebook")}
                    disabled={loading}
                  >
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5 bg-white/5"
                    onClick={() => handleSocialAuth("GitHub")}
                    disabled={loading}
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="text-white/70 text-sm text-center">
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
