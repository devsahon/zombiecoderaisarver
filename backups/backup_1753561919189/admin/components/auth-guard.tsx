"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, LogIn, AlertTriangle, Home } from "lucide-react"
import Link from "next/link"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      setIsAuthenticated(true)
      setLoading(false)
      return
    }

    const adminLoggedIn = localStorage.getItem('adminLoggedIn')
    const adminUser = localStorage.getItem('adminUser')
    
    if (adminLoggedIn === 'true' && adminUser) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn')
    localStorage.removeItem('adminUser')
    setIsAuthenticated(false)
    router.push('/admin/login')
  }

  // Skip auth guard for login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="bg-red-100 text-red-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You need to be logged in to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-600">
              <p>Please log in with your admin credentials to continue.</p>
            </div>
            <div className="flex gap-2">
              <Button asChild className="flex-1 h-12">
                <Link href="/admin/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-12">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
            </div>
            <div className="text-center pt-4">
              <div className="text-xs text-gray-500">
                <p>Demo Credentials:</p>
                <p><strong>Username:</strong> admin | <strong>Password:</strong> admin123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Admin Header with Logout */}
      <div className="absolute top-4 right-4 z-50">
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">
            Welcome, <span className="font-medium text-blue-600">{localStorage.getItem('adminUser')}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="h-8">
            Logout
          </Button>
        </div>
      </div>
      
      {children}
    </div>
  )
} 