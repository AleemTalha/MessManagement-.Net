import { NextResponse } from 'next/server'

export function middleware(request) {
  const token = request.cookies.get('accessToken')?.value
  const sessionCookie = request.cookies.get('sessionId')?.value
  const sessionAspNetCore = request.cookies.get('.AspNetCore.Session')?.value
  const { pathname } = request.nextUrl

  function decodeJWT(token) {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        Buffer.from(base64, 'base64')
          .toString()
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch {
      return null
    }
  }

  /**
   * Extract role from decoded JWT token
   * Supports multiple role claim formats
   */
  function getRoleFromToken(decoded) {
    if (!decoded) return null
    // Support both 'role' and full claim format
    return decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
  }

  /**
   * Log unauthorized access attempts for debugging
   */
  function logUnauthorized(path, type, info = {}) {
    console.log(`[AUTH] ${type} - Path: ${path}`, info)
  }

  /**
   * Check if token is expired
   */
  function isTokenExpired(decoded) {
    if (!decoded || !decoded.exp) return false
    return decoded.exp * 1000 < Date.now()
  }

  // Routes that don't require authentication
  const publicRoutes = ['/', '/admin/login', '/login', '/api']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))
  if (isPublicRoute && !pathname.startsWith('/admin/') && !pathname.startsWith('/user/')) {
    return NextResponse.next()
  }

  // ====== ADMIN LOGIN PAGE ======
  if (pathname === '/admin/login') {
    if (token) {
      const decoded = decodeJWT(token)
      if (isTokenExpired(decoded)) {
        logUnauthorized(pathname, 'Expired admin token')
        return NextResponse.next()
      }
      
      const role = getRoleFromToken(decoded)
      if (role === 'Admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      } else {
        logUnauthorized(pathname, 'Non-admin tried admin login', { role })
      }
    }
    return NextResponse.next()
  }

  // ====== USER LOGIN PAGE ======
  if (pathname === '/login') {
    if (token) {
      const decoded = decodeJWT(token)
      if (isTokenExpired(decoded)) {
        logUnauthorized(pathname, 'Expired user token')
        return NextResponse.next()
      }
      
      const role = getRoleFromToken(decoded)
      if (role && role !== 'Admin') {
        return NextResponse.redirect(new URL('/user/dashboard', request.url))
      } else if (role === 'Admin') {
        logUnauthorized(pathname, 'Admin tried user login', { role })
      }
    }
    return NextResponse.next()
  }

  // ====== ADMIN ROUTES ======
  if (pathname.startsWith('/admin/')) {
    // Check token in cookies or headers
    if (!token) {
      logUnauthorized(pathname, 'Admin route: Missing token')
      return NextResponse.rewrite(new URL('/not-found', request.url))
    }

    const decoded = decodeJWT(token)
    if (!decoded) {
      logUnauthorized(pathname, 'Admin route: Invalid token format')
      return NextResponse.rewrite(new URL('/not-found', request.url))
    }

    if (isTokenExpired(decoded)) {
      logUnauthorized(pathname, 'Admin route: Token expired')
      return NextResponse.rewrite(new URL('/not-found', request.url))
    }

    const role = getRoleFromToken(decoded)
    if (role !== 'Admin') {
      logUnauthorized(pathname, 'Non-admin accessed admin route', { role })
      return NextResponse.rewrite(new URL('/not-found', request.url))
    }

    // Verify session is present
    if (!sessionAspNetCore && !sessionCookie) {
      logUnauthorized(pathname, 'Admin route: Missing session')
      return NextResponse.rewrite(new URL('/not-found', request.url))
    }

    return NextResponse.next()
  }

  // ====== USER ROUTES ======
  if (pathname.startsWith('/user/')) {
    // Check for valid authentication (token or session)
    if (!token && !sessionCookie && !sessionAspNetCore) {
      logUnauthorized(pathname, 'User route: No auth present')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // If token is present, validate it
    if (token) {
      const decoded = decodeJWT(token)
      if (!decoded) {
        logUnauthorized(pathname, 'User route: Invalid token format')
        return NextResponse.redirect(new URL('/login', request.url))
      }

      if (isTokenExpired(decoded)) {
        logUnauthorized(pathname, 'User route: Token expired')
        return NextResponse.redirect(new URL('/login', request.url))
      }

      const role = getRoleFromToken(decoded)
      if (!role || role === 'Admin') {
        logUnauthorized(pathname, 'Invalid role for user route', { role })
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
