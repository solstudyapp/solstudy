
import { supabase } from "@/lib/supabase";
import type { ReferralHistoryData } from "@/types/progress";

/**
 * Service for managing user referrals
 */
export const referralsService = {
  /**
   * Get referral history for the current user
   */
  async getReferralHistory(): Promise<ReferralHistoryData[]> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return [];
      }
      
      // First, get the user's referral codes
      const { data: userCodes, error: codesError } = await supabase
        .from("referral_codes")
        .select("id, code")
        .eq("referrer_id", user.id);
      
      if (codesError) {
        console.error("Error fetching user referral codes:", codesError);
        return [];
      }
      
      if (!userCodes || userCodes.length === 0) {
        return []; // User has no referral codes
      }
      
      // Get all referral IDs
      const codeIds = userCodes.map(code => code.id);
      
      // Query referrals using those code IDs
      const { data: referrals, error: referralsError } = await supabase
        .from("referrals")
        .select(`
          id,
          referral_code_id,
          referred_user_id,
          status,
          points_earned,
          created_at,
          completed_at,
          referred_user:referred_user_id (
            email
          )
        `)
        .in("referral_code_id", codeIds)
        .order("created_at", { ascending: false });
      
      if (referralsError) {
        console.error("Error fetching referrals:", referralsError);
        return [];
      }
      
      // Find the corresponding code for each referral
      return (referrals || []).map(referral => {
        const matchingCode = userCodes.find(c => c.id === referral.referral_code_id);
        
        return {
          id: referral.id,
          code: matchingCode?.code || "Unknown",
          referredEmail: referral.referred_user?.email || "Unknown email",
          status: referral.status,
          pointsEarned: referral.points_earned || 0,
          createdAt: new Date(referral.created_at).toLocaleDateString(),
          completedAt: referral.completed_at 
            ? new Date(referral.completed_at).toLocaleDateString() 
            : undefined
        };
      });
    } catch (error) {
      console.error("Error in getReferralHistory:", error);
      return [];
    }
  },
  
  /**
   * Get user's own referral code(s)
   */
  async getUserReferralCodes(): Promise<string[]> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return [];
      }
      
      // Query the referral_codes table
      const { data, error } = await supabase
        .from("referral_codes")
        .select("code")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching user referral codes:", error);
        return [];
      }
      
      // If user has no codes yet, create one
      if (!data || data.length === 0) {
        const newCode = await this.createReferralCode();
        return newCode ? [newCode] : [];
      }
      
      return data.map(row => row.code);
    } catch (error) {
      console.error("Error in getUserReferralCodes:", error);
      return [];
    }
  },
  
  /**
   * Create a new referral code for the user
   */
  async createReferralCode(): Promise<string | null> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return null;
      }
      
      // Generate a random code
      const code = `SOL${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Store in database
      const { data, error } = await supabase
        .from("referral_codes")
        .insert({
          referrer_id: user.id,
          code,
          is_active: true
        })
        .select();
      
      if (error) {
        console.error("Error creating referral code:", error);
        return null;
      }
      
      return code;
    } catch (error) {
      console.error("Error in createReferralCode:", error);
      return null;
    }
  }
};
