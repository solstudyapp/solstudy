import { Button } from "@/components/ui/button"
import { Apple, Facebook, Github } from "lucide-react"

interface SocialAuthButtonsProps {
  onSocialAuth: (provider: string) => void
  loading?: boolean
}

export function SocialAuthButtons({
  onSocialAuth,
  loading,
}: SocialAuthButtonsProps) {
  return (
    <>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background/60 px-2 text-muted-foreground backdrop-blur-md">
            or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="border-border text-foreground hover:bg-muted/5 bg-muted/5"
          onClick={() => onSocialAuth("Google")}
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
          onClick={() => onSocialAuth("Apple")}
          disabled={loading}
        >
          <Apple className="mr-2 h-4 w-4" />
          Apple
        </Button>
        <Button
          variant="outline"
          className="border-white/10 text-white hover:bg-white/5 bg-white/5"
          onClick={() => onSocialAuth("Facebook")}
          disabled={loading}
        >
          <Facebook className="mr-2 h-4 w-4" />
          Facebook
        </Button>
        <Button
          variant="outline"
          className="border-white/10 text-white hover:bg-white/5 bg-white/5"
          onClick={() => onSocialAuth("GitHub")}
          disabled={loading}
        >
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>
    </>
  )
}
