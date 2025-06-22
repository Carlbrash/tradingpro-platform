"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Shield,
  TrendingUp,
  Users,
  Crown,
  ArrowUp,
  ArrowDown,
  UserCheck,
  UserX,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  LogOut
} from "lucide-react"
import { authService, type User } from "@/lib/auth"
import { useAuth } from "@/lib/auth"

export function SuperAdminPanel() {
  const { user } = useAuth()
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadUsers = () => {
    const users = authService.getAllUsers()
    setAllUsers(users)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handlePromoteToAdmin = async (userId: string, userName: string) => {
    setLoading(true)
    const result = authService.promoteToAdmin(userId)

    if (result.success) {
      setMessage({ type: 'success', text: result.message })
      loadUsers() // Refresh the list
    } else {
      setMessage({ type: 'error', text: result.message })
    }

    setLoading(false)
    setTimeout(() => setMessage(null), 5000)
  }

  const handleDemoteFromAdmin = async (userId: string, userName: string) => {
    setLoading(true)
    const result = authService.demoteFromAdmin(userId)

    if (result.success) {
      setMessage({ type: 'success', text: result.message })
      loadUsers() // Refresh the list
    } else {
      setMessage({ type: 'error', text: result.message })
    }

    setLoading(false)
    setTimeout(() => setMessage(null), 5000)
  }

  if (!authService.isSuperAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Card className="bg-red-900/30 border-red-700">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-300 mb-2">Access Denied</h2>
            <p className="text-red-400">Only Super Administrator can access this panel</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const regularUsers = allUsers.filter(u => u.role === 'user' && u.id !== 'superadmin-1' && u.id !== 'jdgod-superadmin')
  const admins = allUsers.filter(u => u.role === 'admin' && u.id !== 'superadmin-1' && u.id !== 'jdgod-superadmin')
  const superAdmins = allUsers.filter(u => u.id === 'superadmin-1' || u.id === 'jdgod-superadmin')

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center relative">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Crown className="h-8 w-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Super Administrator Panel</h1>
            <Crown className="h-8 w-8 text-yellow-400" />
          </div>
          <p className="text-slate-400">User Management & Role Assignment Control</p>

          {/* Navigation Buttons */}
          <div className="absolute top-0 right-0 flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Force clear everything and logout
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('auth_session')
                  localStorage.clear()
                }
                window.location.reload()
              }}
              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-900/30 border-green-700 text-green-300'
              : 'bg-red-900/30 border-red-700 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{allUsers.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Administrators</CardTitle>
              <Shield className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{admins.length + superAdmins.length}</div>
              <p className="text-xs text-slate-400">Including Super Admins</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Regular Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{regularUsers.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Actions</CardTitle>
              <RefreshCw className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <Button
                size="sm"
                variant="outline"
                onClick={loadUsers}
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                Refresh
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Super Admins Info */}
        {superAdmins.length > 0 && (
          <Card className="bg-gradient-to-r from-yellow-900/30 to-red-900/30 border-yellow-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                <span>Super Administrators ({superAdmins.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {superAdmins.map((superAdmin) => (
                  <div key={superAdmin.id} className="flex items-center space-x-4 p-3 bg-yellow-900/20 rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-yellow-600 text-white">
                        {superAdmin.name.includes('JDGod') ? 'JD' : 'SA'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-white">{superAdmin.name}</div>
                      <div className="text-sm text-yellow-400">{superAdmin.email}</div>
                      <Badge className="mt-1 bg-yellow-600 text-white">SUPER ADMIN</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Regular Admins */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Shield className="h-5 w-5 text-orange-400" />
              <span>Administrators ({admins.length})</span>
            </CardTitle>
            <CardDescription className="text-slate-400">
              Users with admin privileges
            </CardDescription>
          </CardHeader>
          <CardContent>
            {admins.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No administrators yet</p>
            ) : (
              <div className="space-y-4">
                {admins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={admin.avatar} alt={admin.name} />
                        <AvatarFallback className="bg-orange-600 text-white">
                          {admin.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-white">{admin.name}</div>
                        <div className="text-sm text-slate-400">{admin.email}</div>
                        <Badge className="mt-1 bg-orange-600 text-white">ADMIN</Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoteFromAdmin(admin.id, admin.name)}
                      disabled={loading}
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    >
                      <ArrowDown className="mr-2 h-4 w-4" />
                      Demote to User
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Regular Users */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <span>Regular Users ({regularUsers.length})</span>
            </CardTitle>
            <CardDescription className="text-slate-400">
              Users with trading access only
            </CardDescription>
          </CardHeader>
          <CardContent>
            {regularUsers.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No regular users yet</p>
            ) : (
              <div className="space-y-4">
                {regularUsers.map((userData) => (
                  <div key={userData.id} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userData.avatar} alt={userData.name} />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-white">{userData.name}</div>
                        <div className="text-sm text-slate-400">{userData.email}</div>
                        <Badge className="mt-1 bg-blue-600 text-white">USER</Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePromoteToAdmin(userData.id, userData.name)}
                      disabled={loading}
                      className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                    >
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Promote to Admin
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
