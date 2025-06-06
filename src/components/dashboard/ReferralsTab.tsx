
import { useState, useEffect } from "react";
import { 
  Users, 
  Share2, 
  Copy, 
  TrendingUp, 
  Calendar,
  Facebook,
  Twitter,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatsCard } from "./StatsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./Table";
import { userProgressService, ReferralHistoryData } from "@/services/userProgressService";
import { shareOnFacebook, shareOnTwitter } from "@/utils/social";
import { useToast } from "@/hooks/use-toast";
import { 
  referralService, 
  getUserReferralCodes, 
  createReferralCode
} from "@/services/referralService";
import { useAuth } from "@/hooks/use-auth";

export function ReferralsTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<ReferralHistoryData[]>([]);
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralLink, setReferralLink] = useState("");
  const [isCreatingCode, setIsCreatingCode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [referralStats, setReferralStats] = useState({
    total: 0,
    points: 0,
    growth: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch referral data
        const referralHistory = await userProgressService.getReferralHistory();
        if (referralHistory && referralHistory.length > 0) {
          setReferrals(referralHistory);
          
          // Calculate stats
          const completed = referralHistory.filter(r => r.status === "completed");
          const totalPoints = completed.reduce((sum, r) => sum + r.points_earned, 0);
          
          setReferralStats({
            total: completed.length,
            points: totalPoints,
            growth: calculateGrowth(referralHistory)
          });
        }

        // Get the user's referral code
        const referralCodesResponse = await getUserReferralCodes(user.id);
        if (referralCodesResponse.success && referralCodesResponse.data && referralCodesResponse.data.length > 0) {
          const code = referralCodesResponse.data[0].code;
          setReferralCode(code);
          setReferralLink(`${window.location.origin}/signup?ref=${code}`);
        }
      } catch (error) {
        console.error("Error fetching referral data:", error);
        toast({
          title: "Error loading referrals",
          description: "Could not load your referral data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const calculateGrowth = (data: ReferralHistoryData[]) => {
    // This is a simplified growth calculation, could be made more sophisticated
    if (data.length <= 1) return 0;
    
    // Count referrals in last 30 days vs previous 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    const sixtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    
    const lastThirty = data.filter(r => new Date(r.created_at) >= thirtyDaysAgo).length;
    const prevThirty = data.filter(r => 
      new Date(r.created_at) >= sixtyDaysAgo && 
      new Date(r.created_at) < thirtyDaysAgo
    ).length;
    
    if (prevThirty === 0) return lastThirty > 0 ? 100 : 0;
    return Math.round(((lastThirty - prevThirty) / prevThirty) * 100);
  };

  const handleCopyReferralCode = () => {
    if (!referralCode) {
      toast({
        title: "No referral code",
        description: "You need to create a referral code first."
      });
      return;
    }
    
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Referral code copied!",
      description: "Your referral code has been copied to clipboard."
    });
  };

  const handleCopyReferralLink = () => {
    if (!referralLink) {
      toast({
        title: "No referral link",
        description: "You need to create a referral code first."
      });
      return;
    }
    
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Referral link copied!",
      description: "Your referral link has been copied to clipboard."
    });
  };

  const handleCreateReferralCode = async () => {
    if (!user) return;
    
    setIsCreatingCode(true);
    try {
      const response = await createReferralCode(user.id);
      if (response.success && response.data) {
        const code = response.data.code;
        setReferralCode(code);
        setReferralLink(`${window.location.origin}/signup?ref=${code}`);
        toast({
          title: "Success!",
          description: "Your referral code was created successfully."
        });
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Could not create referral code.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error creating referral code:", error);
      toast({
        title: "Error",
        description: "Could not create referral code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingCode(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Referrals"
          value={referralStats.total}
          icon={Users}
          gradientClass="from-[#F97316] to-[#FBBF24]"
        />
        <StatsCard
          title="Points Earned"
          value={referralStats.points}
          description="From referrals"
          icon={Share2}
          gradientClass="from-[#14F195] to-[#9945FF]"
        />
        <StatsCard
          title="Growth Rate"
          value={`${referralStats.growth > 0 ? '+' : ''}${referralStats.growth}%`}
          description="Past 30 days"
          icon={TrendingUp}
          trend={{ value: referralStats.growth, label: "vs previous period", positive: referralStats.growth > 0 }}
          gradientClass="from-[#0EA5E9] to-[#6366F1]"
        />
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share2 className="mr-2 h-5 w-5 text-[#14F195]" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share this code with friends to earn 100 points for each sign up
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-8 w-8 border-4 border-[#14F195] border-t-transparent rounded-full"></div>
            </div>
          ) : referralCode ? (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-4">
                <div className="p-4 bg-muted/10 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Your referral code</div>
                  <div className="flex items-center">
                    <div className="text-xl font-mono font-bold mr-2">{referralCode}</div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleCopyReferralCode}
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy referral code</span>
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-muted/10 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Your referral link</div>
                  <div className="flex items-center">
                    <div className="text-sm font-mono truncate mr-2 flex-1">{referralLink}</div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={handleCopyReferralLink}
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy referral link</span>
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col justify-center gap-2">
                <Button 
                  variant="outline" 
                  className="w-full md:min-w-[180px]"
                  onClick={() => shareOnFacebook({ url: referralLink })}
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  Share on Facebook
                </Button>
                <Button 
                  variant="outline"
                  className="w-full md:min-w-[180px]"
                  onClick={() => shareOnTwitter({ url: referralLink })}
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Share on Twitter
                </Button>
                <Button 
                  variant="gradient" 
                  className="w-full md:min-w-[180px]"
                  onClick={handleCopyReferralLink}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Share2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">
                No referral code yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create a referral code to start earning points!
              </p>
              <Button 
                variant="gradient" 
                onClick={handleCreateReferralCode}
                disabled={isCreatingCode}
              >
                {isCreatingCode ? "Creating..." : "Create Referral Code"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-[#14F195]" />
            Referral History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-8 w-8 border-4 border-[#14F195] border-t-transparent rounded-full"></div>
            </div>
          ) : referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-foreground">User</TableHead>
                    <TableHead className="text-foreground">Date</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((referral) => (
                    <TableRow key={referral.id} className="border-border">
                      <TableCell className="text-foreground">
                        {referral.referee?.email || "Unknown User"}
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {new Date(referral.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          referral.status === "completed" 
                            ? "bg-green-500/20 text-green-500" 
                            : "bg-yellow-500/20 text-yellow-500"
                        }`}>
                          {referral.status === "completed" ? "Completed" : "Pending"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {referral.status === "completed" ? (
                          <span className="text-[#14F195]">
                            +{referral.points_earned}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            --
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">
                No referrals yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Share your referral link with friends to start earning points!
              </p>
              {referralCode ? (
                <Button variant="gradient" onClick={handleCopyReferralLink}>
                  Copy Referral Link
                </Button>
              ) : (
                <Button variant="gradient" onClick={handleCreateReferralCode} disabled={isCreatingCode}>
                  {isCreatingCode ? "Creating..." : "Create Referral Code"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
