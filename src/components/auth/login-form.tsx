"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, LogIn, UserPlus, TrendingUp, Shield, Info } from "lucide-react"
import { authService } from "@/lib/auth"

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
    // role is always 'user' for new registrations
  })

  // Demo credentials
  const demoCredentials = authService.getDemoCredentials()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await authService.login(loginData.email, loginData.password)

      if (result.success && result.user) {
        setSuccess(`Καλώς ήρθες, ${result.user.name}! Ανακατεύθυνση...`)
        setTimeout(() => {
          onSuccess?.()
        }, 1500)
      } else {
        setError(result.error || 'Σφάλμα σύνδεσης')
      }
    } catch (error) {
      setError('Σφάλμα δικτύου. Παρακαλώ προσπαθήστε ξανά.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError('Οι κωδικοί πρόσβασης δεν ταιριάζουν')
      setIsLoading(false)
      return
    }

    if (registerData.password.length < 6) {
      setError('Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 6 χαρακτήρες')
      setIsLoading(false)
      return
    }

    try {
      const result = await authService.register(
        registerData.email,
        registerData.password,
        registerData.name,
        'user' // All new registrations are users only
      )

      if (result.success && result.user) {
        setSuccess(`Καλώς ήρθες, ${result.user.name}! Ανακατεύθυνση...`)
        setTimeout(() => {
          onSuccess?.()
        }, 1500)
      } else {
        setError(result.error || 'Σφάλμα εγγραφής')
      }
    } catch (error) {
      setError('Σφάλμα δικτύου. Παρακαλώ προσπαθήστε ξανά.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (email: string, password: string) => {
    setLoginData({ email, password })
    setIsLoading(true)
    setError('')

    try {
      const result = await authService.login(email, password)

      if (result.success && result.user) {
        setSuccess(`Demo σύνδεση επιτυχής! Καλώς ήρθες, ${result.user.name}!`)
        setTimeout(() => {
          onSuccess?.()
        }, 1500)
      }
    } catch (error) {
      setError('Σφάλμα demo σύνδεσης')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 text-white">
            <TrendingUp className="h-8 w-8" />
            <h1 className="text-2xl font-bold">TradingPro</h1>
          </div>
          <p className="text-slate-400">
            Η πλατφόρμα trading για επαγγελματίες
          </p>
        </div>

        {/* Auth Forms */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-700">
              <TabsTrigger value="login" className="data-[state=active]:bg-slate-600">
                Σύνδεση
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-slate-600">
                Εγγραφή
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <LogIn className="h-5 w-5" />
                  <span>Σύνδεση</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Συνδεθείτε στον λογαριασμό σας
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={isLoading}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Κωδικός Πρόσβασης</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Εισάγετε τον κωδικό σας"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        disabled={isLoading}
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-900/50 border border-green-700 text-green-300 rounded-lg px-4 py-3 text-sm">
                      {success}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Σύνδεση...' : 'Σύνδεση'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <UserPlus className="h-5 w-5" />
                  <span>Εγγραφή</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Δημιουργήστε νέο λογαριασμό
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name" className="text-white">Όνομα</Label>
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Το όνομά σας"
                      value={registerData.name}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      disabled={isLoading}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-account-type" className="text-white">Τύπος Λογαριασμού</Label>
                    <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-blue-300">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">Νέος Λογαριασμός Trader</span>
                      </div>
                      <p className="text-xs text-blue-200 mt-1">
                        📈 Θα έχεις πρόσβαση σε trading dashboard και portfolio
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        💡 Για admin δικαιώματα, επικοινώνησε με τον Super Administrator
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-white">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="email@example.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={isLoading}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-white">Κωδικός Πρόσβασης</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Τουλάχιστον 6 χαρακτήρες"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={isLoading}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm" className="text-white">Επιβεβαίωση Κωδικού</Label>
                    <Input
                      id="reg-confirm"
                      type="password"
                      placeholder="Επαναλάβετε τον κωδικό"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                      disabled={isLoading}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-900/50 border border-green-700 text-green-300 rounded-lg px-4 py-3 text-sm">
                      {success}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Εγγραφή...' : 'Εγγραφή'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Demo Accounts */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>Demo Λογαριασμοί</span>
            </CardTitle>
            <CardDescription className="text-slate-400">
              Χρησιμοποιήστε αυτούς τους λογαριασμούς για demo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Super Admin Accounts */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="text-red-500">🔥</div>
                <Label className="text-white font-medium">Super Administrators:</Label>
              </div>

              {/* JDGod Super Admin */}
              <div className="bg-gradient-to-r from-yellow-900/30 to-red-900/30 border border-yellow-700 rounded p-2">
                <div className="text-sm">
                  <div className="text-yellow-300 font-medium">👑 JDGod - Master Admin</div>
                  <div className="text-yellow-400 text-xs">JDGod</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs mt-2 border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
                  onClick={() => handleDemoLogin('JDGod', 'Kiki1999@')}
                  disabled={isLoading}
                >
                  JDGod Login
                </Button>
                <p className="text-xs text-yellow-400 mt-1">👑 Master Admin - Πλήρη διαχείριση συστήματος</p>
              </div>

              {/* Original Super Admin */}
              <div className="bg-red-900/30 border border-red-700 rounded p-2">
                <div className="text-sm">
                  <div className="text-red-300 font-medium">🔥 Super Administrator</div>
                  <div className="text-red-400 text-xs">superadmin@tradingpro.com</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs mt-2 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  onClick={() => handleDemoLogin('superadmin@tradingpro.com', 'SuperAdmin2025!')}
                  disabled={isLoading}
                >
                  Demo Super Login
                </Button>
                <p className="text-xs text-red-400 mt-1">⚡ Demo Super Admin</p>
              </div>
            </div>

            <Separator className="bg-slate-600" />

            {/* Admin Demo Accounts */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-orange-400" />
                <Label className="text-white font-medium">Demo Admin Accounts:</Label>
              </div>
              <div className="space-y-2">
                {demoCredentials.admins.filter(admin => admin.email !== 'superadmin@tradingpro.com').map((admin, index) => (
                  <div key={admin.email} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                    <div className="text-sm">
                      <div className="text-white font-medium">{admin.name}</div>
                      <div className="text-slate-400 text-xs">{admin.email}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleDemoLogin(admin.email, admin.password)}
                      disabled={isLoading}
                    >
                      Σύνδεση
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-slate-600" />

            {/* User Demo Accounts */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <Label className="text-white font-medium">User Accounts:</Label>
              </div>
              <div className="space-y-2">
                {demoCredentials.users.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                    <div className="text-sm">
                      <div className="text-white font-medium">{user.name}</div>
                      <div className="text-slate-400 text-xs">{user.email}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleDemoLogin(user.email, user.password)}
                      disabled={isLoading}
                    >
                      Σύνδεση
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm">
          <p>&copy; 2024 TradingPro. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
