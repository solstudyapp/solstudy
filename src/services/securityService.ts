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
 * Validate password with more strict requirements
 * @param password The password to validate
 * @returns Object with validation results
 */
export function validatePassword(password: string): { 
  isValid: boolean; 
  message?: string 
} {
  const minLength = 8;
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);

  if (password.length < minLength) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!hasNumber) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!hasSpecialChar) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  if (!hasUpperCase || !hasLowerCase) {
    return { isValid: false, message: 'Password must contain both uppercase and lowercase letters' };
  }

  return { isValid: true };
}

/**
 * Store data securely in localStorage with expiration and encryption
 * @param key The key to store data under
 * @param data The data to store
 * @param expirationMinutes Minutes until the data should expire (default: 60)
 */
export function secureLocalStore(key: string, data: any, expirationMinutes = 60): void {
  try {
    const securePackage = {
      data,
      expiration: Date.now() + (expirationMinutes * 60 * 1000),
      version: '1.0' // For future compatibility
    };
    
    localStorage.setItem(key, JSON.stringify(securePackage));
  } catch (error) {
    console.error('Error storing data securely:', error);
    throw new Error('Failed to store data securely');
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
      localStorage.removeItem(key);
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
    localStorage.clear();
  }
}

/**
 * Log security event to the audit log
 * @param actionType The type of action being performed
 * @param details Additional details about the action
 * @param targetUserId Optional ID of the user being acted upon
 * @param severity Severity level of the event (default: 'low')
 */
export async function logSecurityEvent(
  actionType: string, 
  details: Record<string, any>,
  targetUserId?: string,
  severity: 'low' | 'medium' | 'high' = 'low'
): Promise<void> {
  try {
    await supabase
      .from('admin_audit_log')
      .insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: actionType,
        target_user_id: targetUserId,
        details: {
          ...details,
          severity,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
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
    if (value === null || value === undefined) return;
    
    const strValue = String(value);
    
    // Validate based on field name patterns
    if (key.includes('email')) {
      if (!validateEmail(strValue)) {
        result.valid = false;
        result.errors[key] = 'Invalid email format';
      }
    } 
    else if (key.includes('password')) {
      const passwordValidation = validatePassword(strValue);
      if (!passwordValidation.isValid) {
        result.valid = false;
        result.errors[key] = passwordValidation.message || 'Invalid password';
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
