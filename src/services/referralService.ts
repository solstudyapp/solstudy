import { supabase } from '@/integrations/supabase/client';

export interface Referral {
  id: string;
  referrer_id: string;
  referee_id?: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'expired';
  points_earned: number;
  created_at: string;
  completed_at?: string;
  expires_at: string;
}

export type ReferralResponse = {
  success: boolean;
  error?: {
    message: string;
  };
  data?: any;
};

/**
 * Create a new referral code for a user or return the existing one
 */
export async function createReferralCode(userId: string): Promise<ReferralResponse> {
  try {
    // First check if the user already has a referral code
    const { data: existingCodes, error: checkError } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('referrer_id', userId)
      .eq('is_active', true)
      .limit(1);
    
    if (checkError) {
      return {
        success: false,
        error: {
          message: checkError.message,
        },
      };
    }
    
    // If user already has an active referral code, return it
    if (existingCodes && existingCodes.length > 0) {
      return {
        success: true,
        data: existingCodes[0],
      };
    }
    
    // Generate a unique referral code using the database function
    const { data: codeData, error: codeError } = await supabase.rpc('generate_unique_referral_code');
    
    if (codeError) {
      return {
        success: false,
        error: {
          message: codeError.message,
        },
      };
    }
    
    const code = codeData;
    
    // Insert the referral code into the database
    const { data, error } = await supabase
      .from('referral_codes')
      .insert({
        referrer_id: userId,
        code,
      })
      .select()
      .single();
    
    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
        },
      };
    }
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      },
    };
  }
}

/**
 * Get all referral codes for a user
 */
export async function getUserReferralCodes(userId: string): Promise<ReferralResponse> {
  try {
    const { data, error } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('referrer_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
        },
      };
    }
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      },
    };
  }
}

/**
 * Get a referral code by its code
 */
export async function getReferralCodeByCode(code: string): Promise<ReferralResponse> {
  try {
    const { data, error } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    
    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
        },
      };
    }
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      },
    };
  }
}

/**
 * Complete a referral when a user signs up with a referral code
 */
export async function completeReferral(referralCodeId: string, refereeId: string, pointsEarned: number = 100): Promise<ReferralResponse> {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referral_code_id: referralCodeId,
        referee_id: refereeId,
        points_earned: pointsEarned,
      })
      .select()
      .single();
    
    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
        },
      };
    }
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      },
    };
  }
}

export const referralService = {
  // Get referral stats for the current user
  async getReferralStats(): Promise<{
    total_referrals: number;
    completed_referrals: number;
    pending_referrals: number;
    total_points_earned: number;
  } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: stats, error } = await supabase
        .from('referrals')
        .select('status, points_earned')
        .eq('referrer_id', user.id);

      if (error) throw error;

      return {
        total_referrals: stats.length,
        completed_referrals: stats.filter(r => r.status === 'completed').length,
        pending_referrals: stats.filter(r => r.status === 'pending').length,
        total_points_earned: stats.reduce((sum, r) => sum + r.points_earned, 0),
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return null;
    }
  },

  // Get all referrals for the current user
  async getReferrals(): Promise<Referral[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: referrals, error } = await supabase
        .from('referrals')
        .select(`*,
          referral_code:referral_codes (
            code
          ),
          referee:user_profiles (
            id,
            full_name,
            email,
            user_id
          )`)
        .eq('referee.user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      return referrals || [];
    } catch (error) {
      console.error('Error getting referrals:', error);
      return [];
    }
  },
};
