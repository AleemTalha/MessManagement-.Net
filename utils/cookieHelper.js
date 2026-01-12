/**
 * Cookie Management Utility with Fallback and Validation
 * Handles setting, getting, and removing cookies with proper configuration
 * Falls back to localStorage if cookies are not available
 */

/**
 * Validate if cookies are enabled in the browser
 * @returns {boolean} - True if cookies are enabled
 */
export function areCookiesEnabled() {
  try {
    if (typeof document === 'undefined') return false;
    
    const testCookie = '__cookie_test__';
    document.cookie = `${testCookie}=1;path=/`;
    const enabled = document.cookie.includes(testCookie);
    
    if (enabled) {
      document.cookie = `${testCookie}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    }
    
    return enabled;
  } catch (error) {
    console.warn('Cookie test failed:', error);
    return false;
  }
}

/**
 * Set a cookie with proper options and validation
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Days until expiration (default: 7)
 * @param {Object} options - Additional cookie options
 * @returns {Object} - Result object with success status and message
 */
export function setCookie(name, value, days = 7, options = {}) {
  try {
    if (!name || !value) {
      throw new Error('Cookie name and value are required');
    }

    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};`;

    // Set expiration
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    cookie += `expires=${date.toUTCString()};`;

    // Set path (default: root)
    cookie += `path=${options.path || '/'};`;

    // Set domain if specified
    if (options.domain) {
      cookie += `domain=${options.domain};`;
    }

    // Set secure flag - for localhost (dev) use false, for production use true
    const isLocalhost = typeof window !== 'undefined' && 
                       (window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1');
    const isProduction = process.env.NODE_ENV === 'production' && !isLocalhost;
    
    if (isProduction) {
      cookie += 'Secure;';
    }

    // Set SameSite attribute for CSRF protection
    cookie += `SameSite=${options.sameSite || 'Lax'};`;

    document.cookie = cookie;

    // Verify cookie was set
    const verifyName = encodeURIComponent(name);
    const cookieSet = document.cookie.includes(verifyName);

    if (!cookieSet) {
      throw new Error(`Failed to verify cookie '${name}' was set`);
    }

    console.log(`✓ Cookie '${name}' set successfully`);
    return {
      success: true,
      message: `Cookie '${name}' set successfully`,
      cookieValue: value
    };
  } catch (error) {
    console.error(`✗ Error setting cookie '${name}':`, error.message);
    // Fallback to localStorage
    try {
      localStorage.setItem(`cookie_${name}`, JSON.stringify({
        value: value,
        expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
      }));
      console.warn(`⚠ Cookie fallback: Stored '${name}' in localStorage instead`);
      return {
        success: true,
        message: `Cookie '${name}' stored in localStorage (fallback)`,
        fallback: true,
        cookieValue: value
      };
    } catch (storageError) {
      console.error(`✗ Failed to store '${name}' in localStorage:`, storageError.message);
      return {
        success: false,
        message: `Failed to set cookie and localStorage fallback: ${error.message}`,
        error: error.message,
        cookieValue: null
      };
    }
  }
}

/**
 * Get a cookie by name (checks both cookies and localStorage)
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
export function getCookie(name) {
  try {
    // First try to get from cookies
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        const value = decodeURIComponent(cookie.substring(nameEQ.length));
        console.log(`✓ Retrieved '${name}' from cookies`);
        return value;
      }
    }

    // Fallback: try localStorage
    const storedData = localStorage.getItem(`cookie_${name}`);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.expires && new Date(parsed.expires) > new Date()) {
          console.log(`⚠ Retrieved '${name}' from localStorage (expired cookies)`);
          return parsed.value;
        } else {
          localStorage.removeItem(`cookie_${name}`);
        }
      } catch (parseError) {
        console.warn(`Error parsing stored cookie '${name}':`, parseError);
      }
    }

    console.warn(`⚠ Cookie '${name}' not found in cookies or localStorage`);
    return null;
  } catch (error) {
    console.error(`✗ Error getting cookie '${name}':`, error.message);
    return null;
  }
}

/**
 * Remove a cookie
 * @param {string} name - Cookie name
 * @param {Object} options - Cookie options (must match original settings)
 */
export function removeCookie(name, options = {}) {
  try {
    const cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${options.path || '/'};`;
    document.cookie = cookie;
    
    // Also remove from localStorage fallback
    localStorage.removeItem(`cookie_${name}`);
    
    console.log(`✓ Cookie '${name}' removed successfully`);
    return true;
  } catch (error) {
    console.error(`✗ Error removing cookie '${name}':`, error.message);
    return false;
  }
}

/**
 * Set authentication cookies after successful login
 * @param {string} token - JWT access token
 * @param {string} sessionId - Session ID from backend
 * @param {Object} user - User object
 * @returns {Object} - Result object with success status and details
 */
export function setAuthCookies(token, sessionId, user = null) {
  const results = {
    accessToken: null,
    sessionId: null,
    user: null,
    allSuccessful: false,
    errors: []
  };

  try {
    if (!token) {
      throw new Error('Access token is required for authentication');
    }

    const cookieOptions = {
      path: '/',
      sameSite: 'Lax', // Changed to Lax for better compatibility
    };

    // Check if we're on localhost (development)
    const isLocalhost = typeof window !== 'undefined' && 
                       (window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1');
    const isProduction = process.env.NODE_ENV === 'production' && !isLocalhost;
    
    if (isProduction) {
      cookieOptions.secure = true;
    }

    console.log('🔐 Setting authentication cookies...');
    console.log('Environment:', { 
      isLocalhost, 
      isProduction, 
      nodeEnv: process.env.NODE_ENV 
    });

    // Set access token cookie (7 days)
    const tokenResult = setCookie('accessToken', token, 7, cookieOptions);
    results.accessToken = tokenResult;
    if (!tokenResult.success) {
      results.errors.push(`Failed to set accessToken: ${tokenResult.message}`);
    }

    // Also store in localStorage as backup
    try {
      localStorage.setItem('accessToken', token);
      console.log('✓ accessToken also stored in localStorage');
    } catch (error) {
      console.warn('⚠ Failed to store accessToken in localStorage:', error.message);
    }

    // Set session ID cookie (7 days) if provided
    if (sessionId) {
      const sessionResult = setCookie('sessionId', sessionId, 7, cookieOptions);
      results.sessionId = sessionResult;
      if (!sessionResult.success) {
        results.errors.push(`Failed to set sessionId: ${sessionResult.message}`);
      }
    } else {
      console.warn('⚠ No sessionId provided');
    }

    // Store user info in localStorage
    if (user) {
      try {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userId', user.id || user.userId || '');
        results.user = { success: true, message: 'User data stored in localStorage' };
        console.log('✓ User data stored in localStorage');
      } catch (error) {
        console.error('✗ Error storing user in localStorage:', error.message);
        results.errors.push(`Failed to store user data: ${error.message}`);
      }
    }

    // Verify cookies were set
    const verifyToken = getCookie('accessToken');
    if (!verifyToken) {
      results.errors.push('⚠ WARNING: accessToken cookie verification failed!');
      console.warn('⚠ accessToken was not properly set as a cookie');
    } else {
      console.log('✓ accessToken cookie verified');
    }

    results.allSuccessful = results.errors.length === 0;

    if (results.allSuccessful) {
      console.log('✓ All authentication data set successfully');
    } else {
      console.error('✗ Some authentication data failed to set:', results.errors);
    }

    return results;
  } catch (error) {
    console.error('✗ Critical error setting authentication cookies:', error.message);
    results.errors.push(`Critical error: ${error.message}`);
    results.allSuccessful = false;
    return results;
  }
}

/**
 * Clear all authentication cookies
 */
export function clearAuthCookies() {
  const cookieOptions = {
    path: '/',
    sameSite: 'Lax',
  };

  console.log('🔐 Clearing authentication cookies and storage...');

  removeCookie('accessToken', cookieOptions);
  removeCookie('sessionId', cookieOptions);

  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('cookie_accessToken');
    localStorage.removeItem('cookie_sessionId');
    console.log('✓ All authentication data cleared successfully');
  } catch (error) {
    console.error('✗ Error clearing localStorage:', error.message);
  }

  return true;
}

/**
 * Get all authentication data from cookies and localStorage
 * @returns {Object} - Object containing token, sessionId, and user data with debugging info
 */
export function getAuthData() {
  try {
    const token = getCookie('accessToken');
    const sessionId = getCookie('sessionId');
    
    let user = null;
    try {
      const userData = localStorage.getItem('user');
      user = userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('✗ Error parsing user data:', error.message);
    }

    const authData = {
      token: token,
      sessionId: sessionId,
      user: user,
      hasToken: !!token,
      hasSession: !!sessionId,
      hasUser: !!user,
      timestamp: new Date().toISOString()
    };

    // Debug logging
    if (token) {
      console.log('✓ Authentication data retrieved:', {
        hasToken: true,
        hasSession: !!sessionId,
        hasUser: !!user,
        tokenLength: token.length
      });
    } else {
      console.warn('⚠ No authentication token found');
    }

    return authData;
  } catch (error) {
    console.error('✗ Error getting authentication data:', error.message);
    return {
      token: null,
      sessionId: null,
      user: null,
      hasToken: false,
      hasSession: false,
      hasUser: false,
      error: error.message
    };
  }
}

/**
 * Debug function to check all stored authentication data
 * @returns {Object} - Detailed debug information
 */
export function debugAuthData() {
  const debugInfo = {
    cookies: {},
    localStorage: {},
    status: {},
    timestamp: new Date().toISOString()
  };

  try {
    // Check cookies
    debugInfo.cookies.accessToken = getCookie('accessToken') ? '✓ Present' : '✗ Missing';
    debugInfo.cookies.sessionId = getCookie('sessionId') ? '✓ Present' : '✗ Missing';
    debugInfo.cookies.raw = document.cookie;
  } catch (error) {
    debugInfo.cookies.error = error.message;
  }

  try {
    // Check localStorage
    debugInfo.localStorage.accessToken = localStorage.getItem('accessToken') ? '✓ Present' : '✗ Missing';
    debugInfo.localStorage.user = localStorage.getItem('user') ? '✓ Present' : '✗ Missing';
    debugInfo.localStorage.userId = localStorage.getItem('userId') ? '✓ Present' : '✗ Missing';
    debugInfo.localStorage.sessionId = localStorage.getItem('sessionId') ? '✓ Present' : '✗ Missing';
    debugInfo.localStorage.cookie_accessToken = localStorage.getItem('cookie_accessToken') ? '✓ Present (fallback)' : '✗ Missing';
  } catch (error) {
    debugInfo.localStorage.error = error.message;
  }

  try {
    // Get auth data
    const authData = getAuthData();
    debugInfo.status.authenticated = !!authData.token;
    debugInfo.status.hasUser = !!authData.user;
    debugInfo.status.hasSession = !!authData.sessionId;
  } catch (error) {
    debugInfo.status.error = error.message;
  }

  return debugInfo;
}
