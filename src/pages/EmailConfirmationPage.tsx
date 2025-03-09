import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Mail } from "lucide-react"

type EmailConfirmationPageProps = {
  email: string
}

const EmailConfirmationPage = ({ email }: EmailConfirmationPageProps) => {
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

        <Card className="dark-glass border-white/10 text-white">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#14F195]/10">
              <Mail className="h-8 w-8 text-[#14F195]" />
            </div>
            <CardTitle className="text-center">Check your email</CardTitle>
            <CardDescription className="text-center text-white/70">
              We've sent a confirmation link to:
            </CardDescription>
            <p className="text-center font-medium text-white mt-1">{email}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-md p-4 text-sm">
              <p className="text-white/80">
                Please check your email and click on the confirmation link to
                activate your account. If you don't see the email, check your
                spam folder.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button variant="link" className="text-[#14F195]" asChild>
              <Link to="/auth">Return to sign in</Link>
            </Button>
            <p className="text-white/50 text-xs text-center">
              Didn't receive an email? Check your spam folder or contact
              support.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default EmailConfirmationPage
