"use client"

import { useState, useEffect } from "react"
import { ErrorBoundary } from "@/components/error-boundary"
import { AuthProvider, useAuth } from "@/lib/auth"
import { LoginForm } from "@/components/auth/login-form"
import { UserTradingDashboard } from "@/components/user-trading-dashboard"
import { SuperAdminPanel } from "@/components/super-admin-panel"
import { Toaster } from "sonner"
import { RealTimeMarketBanner } from "@/components/real-time-market-banner"
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Settings,
  Home,
  Menu,
  Search,
  Bell,
  LogOut,
  Plus,
  Download,
  UserPlus,
  Filter,
  Edit,
  Trash2,
  MoreHorizontal,
  DollarSign,
  Eye,
  Star,
  ShoppingCart,
  Target,
  RefreshCw,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { authService } from "@/lib/auth"

// Simple Admin Dashboard Component (minimal version)
function SimpleAdminDashboard() {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'users' | 'settings'>('dashboard')

  const handleLogout = async () => {
    await authService.logout()
  }

  const Sidebar = () => (
    <div className="flex h-full max-h-screen flex-col gap-2 bg-slate-900">
      <div className="flex h-14 items-center border-b border-slate-700 px-4 lg:h-[60px] lg:px-6">
        <div className="flex items-center gap-2 font-semibold text-white">
          <BarChart3 className="h-6 w-6" />
          <span>Admin Dashboard</span>
        </div>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          <Button
            variant={currentPage === 'dashboard' ? 'secondary' : 'ghost'}
            className="justify-start text-white hover:text-white hover:bg-slate-700"
            onClick={() => setCurrentPage('dashboard')}
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant={currentPage === 'users' ? 'secondary' : 'ghost'}
            className="justify-start text-white hover:text-white hover:bg-slate-700"
            onClick={() => setCurrentPage('users')}
          >
            <Users className="mr-2 h-4 w-4" />
            Users
          </Button>
          <Button
            variant={currentPage === 'settings' ? 'secondary' : 'ghost'}
            className="justify-start text-white hover:text-white hover:bg-slate-700"
            onClick={() => setCurrentPage('settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>

          {/* SUPER ADMIN PANEL BUTTON (only for Super Admin) */}
          {(user?.id === 'superadmin-1' || user?.id === 'jdgod-superadmin') && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <Button
                variant="outline"
                className="w-full justify-start text-yellow-400 border-yellow-600 hover:bg-yellow-600 hover:text-white"
                onClick={() => window.location.reload()} // Will redirect to Super Admin Panel
              >
                <Zap className="mr-2 h-4 w-4" />
                SUPER ADMIN PANEL
              </Button>
            </div>
          )}

          {/* BIG LOGOUT BUTTON */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <Button
              variant="destructive"
              className="w-full justify-start text-white bg-red-600 hover:bg-red-700"
              onClick={() => {
                // Force clear everything
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('auth_session')
                  localStorage.removeItem('user_preferences')
                  localStorage.clear()
                }
                window.location.reload()
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              LOGOUT / CLEAR SESSION
            </Button>
          </div>
        </nav>
      </div>
    </div>
  )

  const Header = () => (
    <header className="flex h-14 items-center gap-4 border-b border-slate-700 bg-slate-900 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden border-slate-600 text-white"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col bg-slate-900 border-slate-700">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full appearance-none bg-slate-800 border-slate-600 text-white placeholder-slate-400 pl-8 shadow-none md:w-2/3 lg:w-1/3"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Force Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => authService.forceLogout()}
          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
        >
          Clear Session
        </Button>

        <Button variant="outline" size="icon" className="border-slate-600 text-white hover:bg-slate-700">
          <Bell className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
            <DropdownMenuLabel className="text-white">
              {user?.name}
              <div className="text-xs text-slate-400 font-normal">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-600" />
            <DropdownMenuItem className="text-white hover:bg-slate-700">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-600" />
            <DropdownMenuItem
              className="text-white hover:bg-slate-700"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">1,247</div>
                  <p className="text-xs text-slate-400">+20.1% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Active Users</CardTitle>
                  <Activity className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">1,047</div>
                  <p className="text-xs text-slate-400">+15.3% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">New Registrations</CardTitle>
                  <UserPlus className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">357</div>
                  <p className="text-xs text-slate-400">+40.1% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">$12,847</div>
                  <p className="text-xs text-slate-400">+2.4% from last month</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case 'users':
        return (
          <div className="text-white">
            <h2 className="text-xl font-bold mb-4">User Management</h2>
            <p className="text-slate-400">User management features will be implemented here.</p>
          </div>
        )
      case 'settings':
        return (
          <div className="text-white">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <p className="text-slate-400">System settings will be implemented here.</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-slate-950">
      <div className="hidden border-r border-slate-700 md:block">
        <Sidebar />
      </div>
      <div className="flex flex-col">
        <Header />
        <ErrorBoundary>
          <RealTimeMarketBanner />
        </ErrorBoundary>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-slate-950">
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

// Main App Component
function AppContent() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setShowLogin(true)
      } else {
        setShowLogin(false)
      }
    }
  }, [isAuthenticated, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Always show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <LoginForm onSuccess={() => setShowLogin(false)} />
      </ErrorBoundary>
    )
  }

  // Show appropriate dashboard based on user role and permissions

  // Super Admin gets special panel
  if (user?.id === 'superadmin-1' || user?.id === 'jdgod-superadmin') {
    return (
      <ErrorBoundary>
        <SuperAdminPanel />
      </ErrorBoundary>
    )
  }

  // Regular Admin gets admin dashboard
  if (user?.role === 'admin') {
    return (
      <ErrorBoundary>
        <SimpleAdminDashboard />
      </ErrorBoundary>
    )
  }

  // Default to user trading dashboard for regular users
  return (
    <ErrorBoundary>
      <UserTradingDashboard />
    </ErrorBoundary>
  )
}

// Root component with providers
export default function HomePage() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  )
}
