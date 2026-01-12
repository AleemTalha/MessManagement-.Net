/**
 * Logout Handler Utility
 * Properly clears all authentication data
 */

import { clearAuthCookies } from './cookieHelper';

/**
 * Handle user logout
 * Clears all authentication cookies and redirects to login page
 * @param {Function} router - Next.js router instance
 * @param {string} redirectTo - URL to redirect after logout (default: '/login')
 */
export async function handleLogout(router, redirectTo = '/login') {
  try {
    // Clear all authentication cookies and localStorage
    clearAuthCookies();

    // Optional: Notify backend about logout
    try {
      const backendUri = process.env.NEXT_PUBLIC_BACKEND_URI || 'http://localhost:5205';
      await fetch(`${backendUri}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (backendError) {
      console.warn('Backend logout notification failed:', backendError);
      // Continue logout even if backend call fails
    }

    // Redirect to login page
    if (router) {
      router.push(redirectTo);
    }

    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if authentication cookies exist
 */
export function isAuthenticated() {
  if (typeof document === 'undefined') return false;

  try {
    const cookies = document.cookie.split(';');
    return cookies.some(cookie => 
      cookie.trim().startsWith('accessToken=')
    );
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}
