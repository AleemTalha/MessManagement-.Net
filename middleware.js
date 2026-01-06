import { NextResponse } from 'next/server'

export function middleware(request) {
  const token = request.cookies.get('accessToken')?.value
  const sessionCookie = request.cookies.get('.AspNetCore.Session')?.value
  
  const { pathname } = request.nextUrl

  // Helper function to decode JWT
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
    } catch (error) {
      console.error('Error decoding JWT:', error)
      return null
    }
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/about', '/contact', '/privacy-policy', '/admin/login']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!token && !sessionCookie) {
    // Not authenticated, redirect to login
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Decode token to get user role
  let userRole = null
  if (token) {
    const decoded = decodeJWT(token)
    if (decoded) {
      userRole = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    }
  }

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    if (!userRole || userRole.toLowerCase() !== 'admin') {
      // Not an admin, redirect to user dashboard or login
      return NextResponse.redirect(new URL('/user/dashboard', request.url))
    }
  }

  // User routes protection
  if (pathname.startsWith('/user')) {
    if (!userRole) {
      // No role found, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    // Allow access for both admin and user roles to user routes
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
