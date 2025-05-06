
import { supabase } from "@/lib/supabase";
import { ReferralHistoryData } from "@/types/progress";

/**
 * Service for managing user referrals
 */
export const referralsService = {
  /**
   * Get referral history for the current user
   */
  getReferralHistory: async (): Promise<ReferralHistoryData[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error("No authenticated user found");
        return [];
      }

      // First get the user's referral codes
      const { data: referralCodes, error: codesError } = await supabase
        .from("referral_codes")
        .select("id")
        .eq("referrer_id", user.id);
      
      if (codesError) {
        console.error("Error fetching referral codes:", codesError);
        return [];
      }
      
      if (!referralCodes || referralCodes.length === 0) {
        return [];
      }
      
      // Get all referrals that use any of these codes
      const referralCodeIds = referralCodes.map(code => code.id);
      
      const { data, error } = await supabase
        .from("referrals")
        .select(`
          *,
          referee:user_profiles!referee_id(
            id,
            full_name,
            email,
            user_id
          ),
          referral_code:referral_codes!referral_code_id(
            code,
            referrer_id
          )
        `)
        .in("referral_code_id", referralCodeIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching referral history:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getReferralHistory:", error);
      return [];
    }
  }
};
