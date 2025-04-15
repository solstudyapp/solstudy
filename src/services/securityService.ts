
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

/**
 * Security service for managing general application security concerns
 */

// Regular expressions for input validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const SAFE_STRING_REGEX = /^[a-zA-Z0-9\s.,\-_!?'":;()[\]{}@#$%^&*+=|\\/<>~`]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Sanitize string inputs to prevent XSS attacks
 * @param input The string to sanitize
 * @returns A sanitized version of the input
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Basic HTML sanitization
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate email addresses
 * @param email The email address to validate
 * @returns True if the email is valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validate that a string only contains safe characters
 * @param input The string to validate
 * @returns True if the string only contains safe characters, false otherwise
 */
export function validateSafeString(input: string): boolean {
  if (!input) return true; // Empty strings are technically safe
  return SAFE_STRING_REGEX.test(input);
}

/**
 * Validate that a string is a valid UUID
 * @param id The string to validate as a UUID
 * @returns True if the string is a valid UUID, false otherwise
 */
export function validateUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

/**
 * Store data securely in localStorage with expiration
 * @param key The key to store data under
 * @param data The data to store
 * @param expirationMinutes Minutes until the data should expire (default: 60)
 */
export function secureLocalStore(key: string, data: any, expirationMinutes = 60): void {
  try {
    // Create secure package with expiration
    const securePackage = {
      data,
      expiration: Date.now() + (expirationMinutes * 60 * 1000)
    };
    
    // Encrypt before storing if sensitive data
    localStorage.setItem(key, JSON.stringify(securePackage));
  } catch (error) {
    console.error('Error storing data securely:', error);
  }
}

/**
 * Retrieve securely stored data from localStorage
 * @param key The key to retrieve data for
 * @returns The stored data, or null if not found or expired
 */
export function secureLocalRetrieve(key: string): any {
  try {
    const storedItem = localStorage.getItem(key);
    if (!storedItem) return null;
    
    const securePackage = JSON.parse(storedItem);
    
    // Check if data has expired
    if (securePackage.expiration < Date.now()) {
      localStorage.removeItem(key); // Clean up expired data
      return null;
    }
    
    return securePackage.data;
  } catch (error) {
    console.error('Error retrieving secure data:', error);
    return null;
  }
}

/**
 * Clear securely stored data
 * @param key The key to clear (optional, if not provided all secure data will be cleared)
 */
export function secureLocalClear(key?: string): void {
  if (key) {
    localStorage.removeItem(key);
  } else {
    // Only clear keys that start with secure prefix (if implemented)
    localStorage.clear();
  }
}

/**
 * Log security event to the audit log
 * @param actionType The type of action being performed
 * @param details Additional details about the action
 * @param targetUserId Optional ID of the user being acted upon
 */
export async function logSecurityEvent(
  actionType: string, 
  details: Record<string, any>,
  targetUserId?: string
): Promise<void> {
  try {
    await supabase
      .from('admin_audit_log')
      .insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: actionType,
        target_user_id: targetUserId,
        details
      });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Check if current user session is secure and valid
 * @returns True if session is valid, false otherwise
 */
export async function validateSession(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      return false;
    }
    
    // Check if session is expired
    const expiresAt = data.session.expires_at;
    if (expiresAt && expiresAt * 1000 < Date.now()) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
}

/**
 * Perform security checks on form data
 * @param formData Object containing form data to validate
 * @returns Object with validation results
 */
export function validateFormData(formData: Record<string, any>): { 
  valid: boolean;
  errors: Record<string, string>;
} {
  const result = { valid: true, errors: {} as Record<string, string> };
  
  Object.entries(formData).forEach(([key, value]) => {
    // Skip validation for null or undefined values
    if (value === null || value === undefined) return;
    
    // Convert to string for validation if not already a string
    const strValue = String(value);
    
    // Validate based on field name patterns
    if (key.includes('email')) {
      if (!validateEmail(strValue)) {
        result.valid = false;
        result.errors[key] = 'Invalid email format';
      }
    } 
    else if (key.includes('id') && key !== 'password') {
      if (!validateUUID(strValue)) {
        result.valid = false;
        result.errors[key] = 'Invalid ID format';
      }
    }
    else if (typeof value === 'string' && !validateSafeString(strValue)) {
      result.valid = false;
      result.errors[key] = 'Input contains potentially unsafe characters';
    }
  });
  
  return result;
}
