import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get all users from auth.users table
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) throw authError

    // Get user profiles with additional data
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
    if (profilesError) throw profilesError

    // Combine auth users with their profiles
    const users = authUsers.users.map(user => {
      const profile = profiles.find(p => p.user_id === user.id)
      return {
        id: user.id,
        name: profile?.full_name || user.email?.split('@')[0] || 'Unknown',
        email: user.email,
        points: profile?.points || 0,
        lessonsCompleted: profile?.lessons_completed || 0,
        lastActivity: profile?.last_activity || user.last_sign_in_at || user.created_at,
        isActive: profile?.is_active || false
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
} 