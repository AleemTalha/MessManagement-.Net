# Cookie Implementation - Testing & Debugging Guide

## What's New

### 1. **Enhanced Cookie Helper** (`cookieHelper.js`)
- ✅ Validates if cookies are actually being set
- ✅ Falls back to localStorage if cookies fail
- ✅ Comprehensive error logging with symbols (✓, ✗, ⚠)
- ✅ Changed `SameSite` from `Strict` to `Lax` for better compatibility
- ✅ Proper handling of localhost vs production environments
- ✅ Returns detailed result objects with success/failure information

### 2. **Auth Debugger Component** (NEW)
- 🔍 Visual debugging tool that appears in development mode only
- Shows real-time status of:
  - Authentication cookies (`accessToken`, `sessionId`)
  - localStorage data (`user`, `userId`, `accessToken`)
  - Token validation status
  - User data preview

### 3. **Enhanced Login Files**
- Better error handling with cookie validation
- Shows warnings if fallback to localStorage is used
- Logs detailed information for debugging

## How to Test

### Step 1: Open Developer Tools
1. Login to admin or user account
2. Press `F12` to open Developer Tools
3. Go to **Application** tab

### Step 2: Check Authentication Debugger
- Look for blue **"Auth Debug"** button in bottom-right corner (development only)
- Click to expand and see real-time auth status
- All green (✓) = Everything working perfectly
- Red (✗) = Critical issue
- Orange (⚠) = Non-critical issue (might still work with fallback)

### Step 3: Verify Cookies
In DevTools > Application > Cookies > localhost:3000:
- ✓ `accessToken` should be present
- ✓ `sessionId` should be present (if backend provides it)

### Step 4: Verify localStorage
In DevTools > Application > Local Storage > http://localhost:3000:
- ✓ `accessToken` - Your JWT token (backup copy)
- ✓ `user` - Your user data as JSON
- ✓ `userId` - Your user ID (for quick lookup)
- ⚠ `cookie_accessToken` - Present ONLY if cookies failed (fallback storage)

### Step 5: Check Console
Open DevTools > Console and look for messages:

**Good Signs:**
```
✓ Cookie 'accessToken' set successfully
✓ accessToken cookie verified
✓ All authentication data set successfully
```

**Warning Signs:**
```
⚠ Cookie fallback: Stored 'accessToken' in localStorage instead
⚠ Retrieved 'accessToken' from localStorage (expired cookies)
```

**Error Signs:**
```
✗ Failed to verify cookie 'accessToken' was set
✗ Some authentication data failed to set
```

## Token Verification

### In Console (F12 > Console):

```javascript
// Check if token is set
import { getAuthData, debugAuthData } from '@/utils/cookieHelper';

// Get auth data
const auth = getAuthData();
console.log('Token present:', !!auth.token);
console.log('Token value:', auth.token);

// Get debug info
const debug = debugAuthData();
console.log(debug);
```

Or use the browser console directly:

```javascript
// Check localStorage
console.log('accessToken:', localStorage.getItem('accessToken'));
console.log('user:', localStorage.getItem('user'));

// Check cookies
console.log('All cookies:', document.cookie);
```

## Common Issues & Solutions

### Issue 1: Token in localStorage but not in cookies
**Status:** ⚠ Non-critical (will still work with fallback)
**Cause:** Browser cookie restrictions or SameSite policy
**Solution:** 
- Check if running on `localhost` (should work)
- For production, ensure backend sends `credentials: 'include'`
- Check CORS settings on backend

### Issue 2: Token not appearing anywhere
**Status:** ✗ Critical
**Cause:** Login failed or token not received from backend
**Solution:**
- Check Network tab > Login request > Response
- Verify backend is returning `token` in response
- Check if API endpoint is correct

### Issue 3: Cookies show "⚠ Missing" in debugger
**Status:** ⚠ Partially working
**Cause:** Cookies disabled or not being set properly
**Solution:**
- Verify localStorage backup is working
- Token should still be in localStorage
- Middleware might have issues - check console logs

### Issue 4: "Using localStorage backup for authentication" warning
**Status:** ✓ Working (with fallback)
**Cause:** Normal - indicates fallback mechanism activated
**Solution:** None needed - system working as designed

## Browser Console Commands

Quick test commands to run in browser console:

```javascript
// Test 1: Check if token exists
!!localStorage.getItem('accessToken') ? 'Token found' : 'Token missing'

// Test 2: Check token value
localStorage.getItem('accessToken')?.substring(0, 50) + '...'

// Test 3: Check user data
JSON.parse(localStorage.getItem('user') || '{}')

// Test 4: Verify JWT decode
const token = localStorage.getItem('accessToken');
const payload = token.split('.')[1];
const decoded = JSON.parse(atob(payload));
console.log('User role:', decoded.role);

// Test 5: Check all cookies
document.cookie.split(';').map(c => c.trim())
```

## Expected Behavior

### Successful Login Flow:
1. ✓ Login button shows "Logging in..."
2. ✓ Toast shows "Login successful! Redirecting..."
3. ✓ Console shows "✓ All authentication data set successfully"
4. ✓ Redirects to dashboard after 1 second
5. ✓ Dashboard loads and shows user info

### Failed Login Flow:
1. ✓ Error toast shows specific error message
2. ✓ Console shows error logs
3. ✗ Does NOT redirect

## Middleware Compatibility

The middleware checks for:
- **Admin routes** (`/admin/*`): Requires valid `accessToken` cookie + `role='Admin'`
- **User routes** (`/user/*`): Requires `accessToken` OR `sessionId` with valid role

### If authentication fails in middleware:
- Check Auth Debugger for token status
- Verify token hasn't expired (7-day expiration)
- Verify role in token matches route requirement

## Production Deployment

### Changes for Production:

1. **HTTPS**: Cookies will have `Secure` flag automatically
2. **SameSite**: Set to `Lax` for cross-domain requests
3. **Debugger**: Only appears in development mode

### Production Checklist:
- [ ] Backend returns `token` in login response
- [ ] Backend returns `sessionId` in login response (optional but recommended)
- [ ] CORS is properly configured
- [ ] Cookies are sent with `credentials: 'include'`
- [ ] HTTPS is enabled
- [ ] Test login flow end-to-end

## Log Messages Explained

| Symbol | Meaning | Action |
|--------|---------|--------|
| ✓ | Success - working properly | None needed |
| ✗ | Error - something failed critically | Check browser console, verify backend |
| ⚠ | Warning - non-critical issue | Fallback mechanism active, system still works |

## Still Having Issues?

1. **Clear everything and try again:**
   ```javascript
   // In browser console:
   document.cookie.split(";").forEach(function(c) { 
     document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
   });
   localStorage.clear();
   // Then refresh and login again
   ```

2. **Check Network requests:**
   - DevTools > Network tab
   - Look for login request
   - Check Response body for `token` field

3. **Enable detailed logging:**
   - Open Auth Debugger
   - Check each section
   - Screenshot and compare with expected status

4. **Check middleware logs:**
   - Open backend console
   - Look for authentication errors
   - Verify token validation

## Files Modified

1. **[cookieHelper.js](utils/cookieHelper.js)** - Enhanced with validation and fallback
2. **[AuthDebugger.js](components/AuthDebugger.js)** - Visual debugging component
3. **[login/client.js](app/admin/(auth)/login/client.js)** - Admin login with validation
4. **[login/client.js](app/(user)/login/client.js)** - User login with validation
5. **[layout.js](app/layout.js)** - Added AuthDebugger component
