import { clearSessionId } from './authHelper';

export const handleLogout = async (isAdmin = false) => {
  try {
    // Clear localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("sessionId");
    
    // Clear session-related cookies
    clearSessionId();
    
    // Clear accessToken cookie
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Clear all other cookies if needed
    document.cookie.split(";").forEach((cookie) => {
      const cookieName = cookie.split("=")[0].trim();
      if (cookieName && !['sessionId', 'accessToken', 'token'].includes(cookieName)) {
        // Only clear auth-related cookies
        if (cookieName.includes('auth') || cookieName.includes('session') || cookieName.includes('token')) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      }
    });
    
    // Redirect to login page
    window.location.href = isAdmin ? "/admin/login" : "/login";
  } catch (error) {
    console.error("Logout error:", error);
    // Still redirect even if there's an error
    window.location.href = isAdmin ? "/admin/login" : "/login";
  }
};
