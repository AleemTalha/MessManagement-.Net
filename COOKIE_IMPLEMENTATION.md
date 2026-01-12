# Authentication Cookie Implementation Guide

## Overview
This document explains the proper authentication cookie implementation for the Mess Management system. Cookies are now properly set after login and are compatible with the frontend middleware.

## Files Modified/Created

### 1. **cookieHelper.js** (NEW)
Location: `/frontend/utils/cookieHelper.js`

**Purpose:** Centralized cookie management utility with proper security configurations.

**Key Functions:**
- `setCookie(name, value, days, options)` - Set a cookie with proper options
- `getCookie(name)` - Retrieve a cookie by name
- `removeCookie(name, options)` - Delete a cookie
- `setAuthCookies(token, sessionId, user)` - Set all auth cookies after login
- `clearAuthCookies()` - Clear all auth data (cookies + localStorage)
- `getAuthData()` - Retrieve all authentication data

**Features:**
- Automatic expiration handling (7 days by default)
- CSRF protection with SameSite=Strict
- Secure flag for production HTTPS connections
- Proper URL encoding/decoding
- Error handling and logging

### 2. **logoutHelper.js** (NEW)
Location: `/frontend/utils/logoutHelper.js`

**Purpose:** Unified logout handling with proper cleanup.

**Key Functions:**
- `handleLogout(router, redirectTo)` - Complete logout process
- `isAuthenticated()` - Check if user is currently authenticated

**Features:**
- Clears all authentication cookies and localStorage
- Optional backend notification
- Automatic redirect to login page
- Error handling for backend failures

### 3. **Admin Login** (UPDATED)
Location: `/frontend/app/admin/(auth)/login/client.js`

**Changes:**
- Replaced `authHelper.setSessionId()` with `cookieHelper.setAuthCookies()`
- Now properly sets both `accessToken` and `sessionId` cookies
- Automatically stores user data in localStorage
- Better error handling with proper cleanup

### 4. **User Login** (UPDATED)
Location: `/frontend/app/(user)/login/client.js`

**Changes:**
- Same improvements as admin login
- Consistent authentication flow across both login pages
- Proper cookie configuration for middleware

## Cookie Configuration

### Cookies Set After Login

| Cookie Name | Purpose | Expiration | Secure |
|------------|---------|-----------|--------|
| `accessToken` | JWT authentication token | 7 days | Yes (production) |
| `sessionId` | Backend session identifier | 7 days | Yes (production) |

### Cookie Security Settings

```javascript
{
  path: '/',                    // Available to entire application
  expires: 7 days,              // Session valid for 7 days
  sameSite: 'Strict',           // CSRF protection
  secure: true                  // HTTPS only in production
}
```

## Middleware Compatibility

The frontend middleware (`/frontend/middleware.js`) checks for these cookies:

1. **`accessToken`** - Required for all protected routes
   - Validates JWT token format and expiration
   - Extracts user role from token claims

2. **`sessionId`** - Supplementary session identifier
   - Required for admin routes
   - Optional for user routes

3. **`.AspNetCore.Session`** - Backend session cookie
   - Set by the backend automatically
   - Optional for user routes

## Usage Examples

### In a Component
```javascript
import { setAuthCookies } from '@/utils/cookieHelper';

// After successful login
const response = await loginAPI(credentials);
if (response.ok) {
  setAuthCookies(response.token, response.sessionId, response.user);
  router.push('/dashboard');
}
```

### Retrieving Auth Data
```javascript
import { getAuthData } from '@/utils/cookieHelper';

const authData = getAuthData();
console.log(authData.token);      // JWT token
console.log(authData.sessionId);  // Session ID
console.log(authData.user);       // User object from localStorage
```

### Logout
```javascript
import { handleLogout } from '@/utils/logoutHelper';

const handleLogoutClick = async () => {
  await handleLogout(router, '/login');
};
```

### Check Authentication
```javascript
import { isAuthenticated } from '@/utils/logoutHelper';

if (isAuthenticated()) {
  // User is logged in
}
```

## Security Considerations

1. **SameSite=Strict** - Prevents CSRF attacks by not sending cookies to cross-site requests
2. **Secure Flag** - In production, cookies are only sent over HTTPS connections
3. **HttpOnly Not Set** - JavaScript can access cookies (required for middleware JWT validation)
4. **Token Storage** - Sensitive token is stored in cookies, user info in localStorage
5. **Expiration** - Tokens automatically expire after 7 days

## Important Notes

⚠️ **Do Not Modify:**
- Cookie names (`accessToken`, `sessionId`)
- `SameSite` setting (`Strict`)
- Default expiration (7 days)

⚠️ **When Making Changes:**
- Always update both admin and user login files simultaneously
- Test with the middleware to ensure routes are accessible
- Verify cookies appear in browser DevTools (Application > Cookies)

## Troubleshooting

### Cookies Not Appearing
1. Check if running on `localhost` (dev) or HTTPS (production)
2. Verify `domain` setting in cookieHelper.js
3. Check browser cookie privacy settings

### Middleware Authentication Failures
1. Verify cookie names match middleware expectations
2. Check token expiration time
3. Ensure JWT payload includes `role` claim
4. Check browser DevTools for cookie presence

### Cross-Domain Issues
If frontend and backend are on different domains:
1. Backend must set `credentials: 'include'` in fetch
2. Ensure CORS is configured properly on backend
3. Consider SameSite=Lax for cross-domain scenarios

## Future Enhancements

- [ ] Implement token refresh mechanism
- [ ] Add cookie encryption for sensitive data
- [ ] Implement session timeout warnings
- [ ] Add remember-me functionality
- [ ] Implement OAuth/SSO integration
