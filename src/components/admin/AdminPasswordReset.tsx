
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { resetSpecificUserPassword } from '@/services/adminService';
import { Loader2 } from 'lucide-react';

export function AdminPasswordReset() {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const success = await resetSpecificUserPassword();
      if (success) {
        setCompleted(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-border p-4 rounded-md bg-card">
      <h3 className="font-semibold mb-2">One-time Password Reset</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Reset password for user: j.zingre@gmail.com
      </p>
      
      {!completed ? (
        <Button 
          onClick={handleResetPassword} 
          disabled={loading}
          variant="secondary"
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </Button>
      ) : (
        <div className="bg-green-500/10 text-green-500 p-3 rounded-md text-sm">
          Password has been reset successfully to the temporary password.
        </div>
      )}
      
      {completed && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
          <p className="text-sm font-medium">Next steps:</p>
          <p className="text-xs text-muted-foreground mt-1">
            Please communicate the temporary password to the user securely.
            They should change it immediately after logging in.
          </p>
        </div>
      )}
    </div>
  );
}
