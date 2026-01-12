/**
 * Get authentication headers from localStorage
 * Includes: Authorization (Bearer token) and X-Session-Id header
 */
export const getAuthHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    const sessionId = localStorage.getItem('sessionId');

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
  }

  return headers;
};

/**
 * Get fetch options with proper headers and credentials
 * Automatically includes Bearer token and X-Session-Id from localStorage
 */
export const getFetchOptions = (options = {}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return {
    credentials: 'include',
    mode: isDevelopment ? 'cors' : 'cors',
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  };
};

/**
 * Set sessionId in localStorage and as a cookie
 * Called after successful login
 */
export const setSessionId = (sessionId) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sessionId', sessionId);
    // Also set as cookie for middleware validation
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + 60 * 60 * 1000); // 1 hour
    document.cookie = `sessionId=${sessionId}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  }
};

/**
 * Clear sessionId from both localStorage and cookies
 */
export const clearSessionId = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sessionId');
    // Clear cookie
    document.cookie = 'sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
};
