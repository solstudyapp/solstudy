import { supabase } from '@/lib/supabase';

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

export const referralService = {
  // Generate a new referral code for the current user
  async generateReferralCode(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Generate a unique referral code
      const { data: referralCode, error: codeError } = await supabase
        .rpc('generate_unique_referral_code');

      if (codeError) throw codeError;

      // Create the referral record
      const { data: referral, error: insertError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: user.id,
          referral_code: referralCode,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return referral.referral_code;
    } catch (error) {
      console.error('Error generating referral code:', error);
      return null;
    }
  },

  // Get referral code for the current user
  async getReferralCode(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: referral, error } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_id', user.id)
        .eq('status', 'pending')
        .single();

      if (error) throw error;

      return referral?.referral_code || null;
    } catch (error) {
      console.error('Error getting referral code:', error);
      return null;
    }
  },

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

  // Process a referral when a new user signs up
  async processReferral(refereeId: string, referralCode: string): Promise<boolean> {
    try {
      // Find the referral record
      const { data: referral, error: findError } = await supabase
        .from('referrals')
        .select()
        .eq('referral_code', referralCode)
        .eq('status', 'pending')
        .single();

      if (findError) throw findError;

      // Update the referral record
      const { error: updateError } = await supabase
        .from('referrals')
        .update({
          referee_id: refereeId,
          status: 'completed',
          points_earned: 100, // You can adjust this value or make it configurable
        })
        .eq('id', referral.id);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error('Error processing referral:', error);
      return false;
    }
  },

  // Get all referrals for the current user
  async getReferrals(): Promise<Referral[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: referrals, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return referrals || [];
    } catch (error) {
      console.error('Error getting referrals:', error);
      return [];
    }
  },
}; 