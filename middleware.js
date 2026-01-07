import { NextResponse } from 'next/server'

export function middleware(request) {
  const token = request.cookies.get('accessToken')?.value
  const sessionCookie = request.cookies.get('.AspNetCore.Session')?.value
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

  if (pathname === '/admin/login') {
    if (token) {
      const decoded = decodeJWT(token)
      const role =
        decoded?.role ||
        decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']

      if (role === 'Admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
    }
    return NextResponse.next()
  }

  if (pathname === '/login') {
    if (token) {
      const decoded = decodeJWT(token)
      const role =
        decoded?.role ||
        decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']

      if (role && role !== 'Admin') {
        return NextResponse.redirect(new URL('/user/dashboard', request.url))
      }
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin/')) {
    if (!token) {
      return NextResponse.rewrite(new URL('/not-found', request.url))
    }

    const decoded = decodeJWT(token)
    if (!decoded) {
      return NextResponse.rewrite(new URL('/not-found', request.url))
    }

    const role =
      decoded.role ||
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']

    if (role !== 'Admin') {
      return NextResponse.rewrite(new URL('/not-found', request.url))
    }

    return NextResponse.next()
  }

  if (pathname.startsWith('/user/')) {
    if (!token && !sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const decoded = token ? decodeJWT(token) : null
    const role =
      decoded?.role ||
      decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']

    if (!role || role === 'Admin') {
      return NextResponse.redirect(new URL('/login', request.url))
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
