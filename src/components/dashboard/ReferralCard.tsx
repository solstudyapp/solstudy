import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Share2, UserPlus, Loader2, Facebook } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import {
  createReferralCode,
  getUserReferralCodes,
} from "@/services/referralService"
import { shareOnFacebook, shareOnTwitter } from "@/utils/social"

export function ReferralCard() {
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referralLink, setReferralLink] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadReferralCode()
    }
  }, [user])

  const loadReferralCode = async () => {
    if (!user) return

    setLoading(true)
    const response = await getUserReferralCodes(user.id)
    setLoading(false)

    if (response.success && response.data && response.data.length > 0) {
      // Use the first referral code
      const code = response.data[0].code
      setReferralCode(code)
      setReferralLink(`${window.location.origin}/signup?ref=${code}`)
    }
  }

  const handleCreateReferralCode = async () => {
    if (!user) return

    setCreating(true)
    const response = await createReferralCode(user.id)
    setCreating(false)

    if (response.success && response.data) {
      const code = response.data.code
      setReferralCode(code)
      setReferralLink(`${window.location.origin}/signup?ref=${code}`)
      toast({
        title: "Referral code created",
        description: "Your referral code is ready to share!",
      })
    } else {
      toast({
        title: "Error creating referral code",
        description: response.error?.message || "An unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    toast({
      title: "Link copied",
      description: "Referral link copied to clipboard",
    })
  }

  const handleShareOnFacebook = () => {
    shareOnFacebook({
      url: referralLink,
      title: "Join me on SolStudy!",
      description:
        "Learn about blockchain and crypto while earning rewards. Use my referral link to get started and we'll both earn points!",
    })
  }

  const handleShareOnTwitter = () => {
    shareOnTwitter({
      url: referralLink,
      title: "Join me on SolStudy! 🚀",
      description:
        "Learn about blockchain and crypto while earning rewards. Use my referral link to get started!",
      hashtags: ["blockchain", "crypto", "education", "solana"],
    })
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserPlus className="h-5 w-5 mr-2 text-[#14F195]" />
          Refer Friends
        </CardTitle>
        <CardDescription>
          Invite friends to join SolStudy and earn points
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-[#14F195]/10 border border-[#14F195]/30 rounded-md p-3 text-sm">
          <p className="text-foreground">
            <strong>Earn 100 points</strong> for each friend who signs up using
            your referral link!
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : referralCode ? (
          <div className="space-y-4">
            <div className="bg-muted/5 border border-border rounded-lg p-4 flex justify-between items-center">
              <div className="font-mono text-lg truncate mr-2 text-foreground">
                {referralLink}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-muted/10 flex-shrink-0"
                onClick={copyReferralLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex justify-center gap-4 mt-4">
              <Button
                variant="gradient"
                onClick={handleShareOnFacebook}
                className="flex items-center gap-2"
              >
                <Facebook size={16} />
                Share on Facebook
              </Button>
              <Button
                variant="gradient"
                onClick={handleShareOnTwitter}
                className="flex items-center gap-2"
              >
                <img
                  src="https://about.x.com/content/dam/about-twitter/x/brand-toolkit/logo-black.png.twimg.1920.png"
                  alt="X logo"
                  className="w-4 h-4 invert"
                />
                Share on X
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Create a referral code to start inviting friends!
            </p>
            <Button
              onClick={handleCreateReferralCode}
              className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
              disabled={creating}
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Referral Code
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
