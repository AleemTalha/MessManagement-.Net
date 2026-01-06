"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, User, LogOut, Utensils } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1]

      if (token) {
        try {
          const base64Url = token.split('.')[1]
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
          const decoded = JSON.parse(jsonPayload)
          setUser({
            name: decoded.name,
            email: decoded.email,
            role: decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
          })
        } catch (error) {
          console.error('Error decoding token:', error)
        }
      }
    }

    checkAuth()

    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when clicking outside or on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleLogout = () => {
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = '.AspNetCore.Session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    setUser(null)
    router.push('/')
  }

  const handleDashboard = () => {
    if (user?.role === 'Admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/user/dashboard')
    }
  }

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled || isOpen ? 'bg-slate-900 shadow-lg' : 'bg-transparent'
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold flex items-center gap-1 sm:gap-2 transition-colors ${
              isScrolled || isOpen ? 'text-amber-500' : 'text-white'
            }`}>
              <Utensils className="w-6 h-6 sm:w-8 sm:h-8 lg:w-13 lg:h-13 text-amber-400" />
              <span className={(isScrolled || isOpen) ? 'text-amber-500' : 'text-white'}>Foodie</span>
            </h1>
          </Link>

          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            <Link href="/" className={`transition-colors font-medium hover:text-amber-400 text-sm xl:text-base ${
              isScrolled || isOpen ? 'text-white' : 'text-white'
            }`}>
              Home
            </Link>
            <Link href="/about" className={`transition-colors font-medium hover:text-amber-400 text-sm xl:text-base ${
              isScrolled || isOpen ? 'text-white' : 'text-white'
            }`}>
              About
            </Link>
            <Link href="/contact" className={`transition-colors font-medium hover:text-amber-400 text-sm xl:text-base ${
              isScrolled || isOpen ? 'text-white' : 'text-white'
            }`}>
              Contact
            </Link>
            <Link href="/privacy-policy" className={`transition-colors font-medium hover:text-amber-400 text-sm xl:text-base whitespace-nowrap ${
              isScrolled || isOpen ? 'text-white' : 'text-white'
            }`}>
              Privacy Policy
            </Link>

            {user ? (
              <div className="flex items-center space-x-2 xl:space-x-3">
                <button
                  onClick={handleDashboard}
                  className="flex items-center space-x-1 xl:space-x-2 px-3 xl:px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors text-sm xl:text-base whitespace-nowrap"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden xl:inline">{user.name}</span>
                  <span className="xl:hidden">{user.name.split(' ')[0]}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-1 xl:space-x-2 px-3 xl:px-4 py-2 border rounded hover:bg-white/10 transition-colors text-sm xl:text-base ${
                    isScrolled || isOpen ? 'border-white text-white' : 'border-white text-white'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="px-4 xl:px-6 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors font-medium text-sm xl:text-base whitespace-nowrap"
              >
                Book A Table
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded transition-colors ${
              isScrolled || isOpen ? 'text-white hover:bg-white/10' : 'text-white hover:bg-white/10'
            }`}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation with smooth transition */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-slate-900 border-t border-slate-800 px-4 py-4 space-y-1">
          <Link 
            href="/" 
            className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/about" 
            className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>
          <Link 
            href="/contact" 
            className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
            onClick={() => setIsOpen(false)}
          >
            Contact
          </Link>
          <Link 
            href="/privacy-policy" 
            className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
            onClick={() => setIsOpen(false)}
          >
            Privacy Policy
          </Link>

          <div className="pt-3 border-t border-slate-700 mt-3 space-y-2">
            {user ? (
              <>
                <button
                  onClick={() => {
                    handleDashboard()
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>{user.name} ({user.role})</span>
                </button>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-4 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-medium flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/admin/login"
                className="block px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-center font-medium"
                onClick={() => setIsOpen(false)}
              >
                Book A Table
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}