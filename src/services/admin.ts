import { supabase } from '@/lib/supabase';

/**
 * Check if the current user is an admin
 * @returns Promise<boolean> - True if the user is an admin, false otherwise
 */
export async function isUserAdmin(): Promise<boolean> {
  try {
    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      return false;
    }

    // Check if the user is in the admins table
    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
} 