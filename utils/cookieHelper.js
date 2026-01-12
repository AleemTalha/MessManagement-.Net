/**
 * Cookie Management Utility
 * Handles setting, getting, and removing cookies with proper configuration
 */

/**
 * Set a cookie with proper options
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Days until expiration (default: 7)
 * @param {Object} options - Additional cookie options
 */
export function setCookie(name, value, days = 7, options = {}) {
  try {
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

    // Set secure flag (HTTPS only) - default to true in production
    const isProduction = process.env.NODE_ENV === 'production';
    if (options.secure !== false && isProduction) {
      cookie += 'Secure;';
    }

    // Set SameSite attribute for CSRF protection
    cookie += `SameSite=${options.sameSite || 'Strict'};`;

    document.cookie = cookie;
    return true;
  } catch (error) {
    console.error(`Error setting cookie '${name}':`, error);
    return false;
  }
}

/**
 * Get a cookie by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
export function getCookie(name) {
  try {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return null;
  } catch (error) {
    console.error(`Error getting cookie '${name}':`, error);
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
    setCookie(name, '', -1, options);
    return true;
  } catch (error) {
    console.error(`Error removing cookie '${name}':`, error);
    return false;
  }
}

/**
 * Set authentication cookies after successful login
 * @param {string} token - JWT access token
 * @param {string} sessionId - Session ID from backend
 * @param {Object} user - User object
 */
export function setAuthCookies(token, sessionId, user = null) {
  const cookieOptions = {
    path: '/',
    sameSite: 'Strict', // CSRF protection
  };

  // In production, set Secure flag for HTTPS only
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  // Set access token cookie (7 days)
  setCookie('accessToken', token, 7, cookieOptions);

  // Set session ID cookie (7 days)
  if (sessionId) {
    setCookie('sessionId', sessionId, 7, cookieOptions);
  }

  // Store user info in localStorage (not sensitive)
  if (user) {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user in localStorage:', error);
    }
  }

  return true;
}

/**
 * Clear all authentication cookies
 */
export function clearAuthCookies() {
  const cookieOptions = {
    path: '/',
    sameSite: 'Strict',
  };

  removeCookie('accessToken', cookieOptions);
  removeCookie('sessionId', cookieOptions);

  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }

  return true;
}

/**
 * Get all authentication data
 * @returns {Object} - Object containing token, sessionId, and user data
 */
export function getAuthData() {
  return {
    token: getCookie('accessToken'),
    sessionId: getCookie('sessionId'),
    user: (() => {
      try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    })(),
  };
}
