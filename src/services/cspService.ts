/**
 * Content Security Policy (CSP) service
 * 
 * This service helps manage and implement secure CSP headers and policies
 * for the application to prevent XSS and other injection attacks.
 */

const defaultCSPDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"], // Necessary for React
  'style-src': ["'self'", "'unsafe-inline'"], // Necessary for styled components and inline styles
  'img-src': ["'self'", 'data:', 'https://*.supabase.co', 'https://*.supabase.in'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", 'https://*.supabase.co', 'https://*.supabase.in'],
  'frame-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"], // Prevent clickjacking
  'upgrade-insecure-requests': [], // Force HTTPS
};

/**
 * Generates a Content Security Policy string from directives
 * @param directives The CSP directives to use, will be merged with defaults
 * @returns A CSP policy string that can be used in a meta tag
 */
export function generateCSP(customDirectives: Partial<Record<string, string[]>> = {}): string {
  const mergedDirectives = { ...defaultCSPDirectives };
  
  // Merge custom directives with defaults
  Object.entries(customDirectives).forEach(([directive, sources]) => {
    if (mergedDirectives[directive as keyof typeof defaultCSPDirectives]) {
      mergedDirectives[directive as keyof typeof defaultCSPDirectives] = [
        ...mergedDirectives[directive as keyof typeof defaultCSPDirectives],
        ...sources
      ];
    } else {
      (mergedDirectives as Record<string, string[]>)[directive] = sources;
    }
  });
  
  // Build the CSP string
  return Object.entries(mergedDirectives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

/**
 * Applies a CSP meta tag to the document head
 * @param csp The CSP string to apply, or undefined to use defaults
 */
export function applyCSP(csp?: string): void {
  const cspString = csp || generateCSP();
  
  // Remove any existing CSP meta tags
  const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existingCSP) {
    existingCSP.remove();
  }
  
  // Create and apply the new CSP meta tag
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = cspString;
  document.head.appendChild(meta);
}

/**
 * Validates if a URL is allowed by the current CSP
 * @param url The URL to validate
 * @param directive The CSP directive to check against (default: 'connect-src')
 * @returns True if the URL is allowed, false otherwise
 */
export function isURLAllowedByCSP(url: string, directive: string = 'connect-src'): boolean {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // Check if domain is allowed by the specified directive
    const directiveSources = defaultCSPDirectives[directive as keyof typeof defaultCSPDirectives];
    if (!directiveSources) return false;
    
    // Check if domain matches any allowed source
    return directiveSources.some(source => {
      if (source === "'self'") return false; // Special case handled separately
      if (source === '*') return true;
      if (source.startsWith('*.')) {
        const sourceDomain = source.slice(2);
        return domain.endsWith(sourceDomain);
      }
      return domain === source;
    });
  } catch (error) {
    console.error('Error validating URL against CSP:', error);
    return false;
  }
}

/**
 * Initialize CSP for the application with enhanced security
 */
export function initializeCSP(): void {
  // Apply default CSP with additional security headers
  applyCSP();
  
  // Add additional security headers
  const meta = document.createElement('meta');
  meta.httpEquiv = 'X-Content-Type-Options';
  meta.content = 'nosniff';
  document.head.appendChild(meta);
  
  // Log CSP initialization
  console.info('Content Security Policy initialized with enhanced security');
}
