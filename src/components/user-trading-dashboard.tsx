"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  Star,
  Search,
  Menu,
  LogOut,
  User,
  Settings,
  Bell,
  Briefcase,
  Activity,
  BarChart3,
  PlusCircle,
  MinusCircle,
  Wallet,
  Clock,
  AlertCircle,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Filter,
  Grid3X3,
  List,
  Zap,
  Target,
  Shield,
  ChevronDown,
  Info
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { useAuth, authService } from "@/lib/auth"
import { useLiveMarketData } from "@/hooks/use-live-market-data"
import { RealTimeMarketBanner } from "./real-time-market-banner"
import { ErrorBoundary } from "./error-boundary"

interface UserPosition {
  id: string
  symbol: string
  name: string
  quantity: number
  buyPrice: number
  currentPrice: number
  value: number
  pnl: number
  pnlPercent: number
  type: 'buy' | 'sell'
  logo?: string
  industry?: string
}

interface AssetCard {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  logo?: string
  sentiment?: number // 0-100
  socialVolume?: number
  industry?: string
  description?: string
}

interface SocialPost {
  id: string
  user: string
  avatar: string
  action: string
  asset: string
  amount: number
  timestamp: Date
  likes: number
  comments: number
}

export function UserTradingDashboard() {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState<'portfolio' | 'discover' | 'social' | 'watchlist'>('portfolio')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [tradeAmount, setTradeAmount] = useState([1000])
  const [portfolioValue] = useState(25000)

  // Enhanced mock positions with eToro-style data
  const [positions] = useState<UserPosition[]>([
    {
      id: '1',
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 0.5,
      buyPrice: 42000,
      currentPrice: 43250,
      value: 21625,
      pnl: 625,
      pnlPercent: 2.98,
      type: 'buy',
      logo: '₿',
      industry: 'Cryptocurrency'
    },
    {
      id: '2',
      symbol: 'ETH',
      name: 'Ethereum',
      quantity: 8,
      buyPrice: 2300,
      currentPrice: 2239,
      value: 17912,
      pnl: -488,
      pnlPercent: -2.65,
      type: 'buy',
      logo: 'Ξ',
      industry: 'Cryptocurrency'
    },
    {
      id: '3',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 25,
      buyPrice: 180,
      currentPrice: 185,
      value: 4625,
      pnl: 125,
      pnlPercent: 2.78,
      type: 'buy',
      logo: '🍎',
      industry: 'Technology'
    }
  ])

  // Enhanced social feed data
  const [socialFeed] = useState<SocialPost[]>([
    {
      id: '1',
      user: 'CryptoKing',
      avatar: 'CK',
      action: 'bought',
      asset: 'BTC',
      amount: 5000,
      timestamp: new Date(Date.now() - 300000),
      likes: 24,
      comments: 8
    },
    {
      id: '2',
      user: 'TechTrader',
      avatar: 'TT',
      action: 'sold',
      asset: 'TSLA',
      amount: 2500,
      timestamp: new Date(Date.now() - 600000),
      likes: 15,
      comments: 3
    },
    {
      id: '3',
      user: 'GoldBull',
      avatar: 'GB',
      action: 'bought',
      asset: 'GOLD',
      amount: 10000,
      timestamp: new Date(Date.now() - 900000),
      likes: 42,
      comments: 12
    }
  ])

  const { data: marketData } = useLiveMarketData({
    updateInterval: 120000,
    autoStart: true
  })

  // Portfolio pie chart data
  const portfolioChartData = [
    { name: 'Bitcoin', value: 21625, color: '#F7931A' },
    { name: 'Ethereum', value: 17912, color: '#627EEA' },
    { name: 'Apple', value: 4625, color: '#007AFF' },
    { name: 'Cash', value: 5000, color: '#00D4AA' }
  ]

  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0)
  const totalPnLPercent = ((totalPnL / portfolioValue) * 100)

  const handleLogout = async () => {
    await authService.logout()
  }

  const openTradeDialog = (asset: any) => {
    setSelectedAsset(asset)
    setIsTradeDialogOpen(true)
  }

  // Enhanced asset cards with eToro-style data
  const enhancedMarketData = marketData.map(asset => ({
    ...asset,
    sentiment: Math.floor(Math.random() * 40) + 60, // 60-100 sentiment
    socialVolume: Math.floor(Math.random() * 1000) + 100,
    industry: asset.symbol === 'BTC' ? 'Cryptocurrency' : asset.symbol === 'ETH' ? 'Cryptocurrency' : 'Technology',
    description: `${asset.name} is trending with high social sentiment`,
    logo: asset.symbol === 'BTC' ? '₿' : asset.symbol === 'ETH' ? 'Ξ' : '📈'
  }))

  const Sidebar = () => (
    <div className="flex h-full max-h-screen flex-col gap-2 bg-slate-900 border-r border-slate-800">
      <div className="flex h-14 items-center border-b border-slate-700 px-4 lg:h-[60px] lg:px-6">
        <div className="flex items-center gap-2 font-semibold text-white">
          <div className="h-8 w-8 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">TradingPro</span>
        </div>
      </div>
      <div className="flex-1 px-3">
        <nav className="grid items-start gap-1 text-sm font-medium">
          <Button
            variant={currentPage === 'portfolio' ? 'secondary' : 'ghost'}
            className="justify-start text-white hover:text-white hover:bg-slate-800 h-11"
            onClick={() => setCurrentPage('portfolio')}
          >
            <Briefcase className="mr-3 h-5 w-5" />
            Portfolio
            <div className="ml-auto text-xs text-slate-400">$25K</div>
          </Button>
          <Button
            variant={currentPage === 'discover' ? 'secondary' : 'ghost'}
            className="justify-start text-white hover:text-white hover:bg-slate-800 h-11"
            onClick={() => setCurrentPage('discover')}
          >
            <Search className="mr-3 h-5 w-5" />
            Discover
            <Badge className="ml-auto bg-cyan-500 text-white text-xs">New</Badge>
          </Button>
          <Button
            variant={currentPage === 'social' ? 'secondary' : 'ghost'}
            className="justify-start text-white hover:text-white hover:bg-slate-800 h-11"
            onClick={() => setCurrentPage('social')}
          >
            <Users className="mr-3 h-5 w-5" />
            Social Feed
            <div className="ml-auto w-2 h-2 bg-cyan-500 rounded-full"></div>
          </Button>
          <Button
            variant={currentPage === 'watchlist' ? 'secondary' : 'ghost'}
            className="justify-start text-white hover:text-white hover:bg-slate-800 h-11"
            onClick={() => setCurrentPage('watchlist')}
          >
            <Star className="mr-3 h-5 w-5" />
            Watchlist
            <div className="ml-auto text-xs text-slate-400">8</div>
          </Button>

          {/* User Profile Section */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg mb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user?.name}</div>
                <div className="text-xs text-slate-400">Trader</div>
              </div>
            </div>
          </div>

          {/* BIG LOGOUT BUTTON */}
          <div className="mt-4">
            <Button
              variant="destructive"
              className="w-full justify-start text-white bg-red-600 hover:bg-red-700 h-11"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('auth_session')
                  localStorage.removeItem('user_preferences')
                  localStorage.clear()
                }
                window.location.reload()
              }}
            >
              <LogOut className="mr-3 h-5 w-5" />
              LOGOUT
            </Button>
          </div>
        </nav>
      </div>

      {/* Portfolio Summary in Sidebar */}
      <div className="p-4">
        <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-sm text-slate-300 mb-1">Total Portfolio</div>
              <div className="text-2xl font-bold text-white mb-1">
                ${portfolioValue.toLocaleString()}
              </div>
              <div className={`text-sm font-medium ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)} ({totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const Header = () => (
    <header className="flex h-16 items-center gap-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm px-4 lg:px-6 sticky top-0 z-40">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden border-slate-600 text-white hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col bg-slate-900 border-slate-700">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search assets, people, or markets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border-slate-600 text-white placeholder-slate-400 pl-10 pr-4 h-10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* View Mode Toggle */}
        <div className="hidden sm:flex bg-slate-800 p-1 rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="outline" size="icon" className="border-slate-600 text-white hover:bg-slate-800 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-cyan-500 rounded-full"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full border-2 border-slate-600 hover:border-cyan-500">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 w-56">
            <DropdownMenuLabel className="text-white">
              {user?.name}
              <div className="text-xs text-slate-400 font-normal">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-600" />
            <DropdownMenuItem className="text-white hover:bg-slate-700">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-slate-700">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-slate-700">
              <Shield className="mr-2 h-4 w-4" />
              Security
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

  const PortfolioPage = () => (
    <div className="space-y-6">
      {/* Portfolio Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300 mb-1">Portfolio Value</p>
                <p className="text-2xl font-bold text-white">${portfolioValue.toLocaleString()}</p>
                <p className="text-xs text-slate-400">Available: $5,000</p>
              </div>
              <div className="h-12 w-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Wallet className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300 mb-1">Day P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                </p>
                <p className="text-xs text-slate-400">{totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%</p>
              </div>
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${totalPnL >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {totalPnL >= 0 ?
                  <TrendingUp className="h-6 w-6 text-green-400" /> :
                  <TrendingDown className="h-6 w-6 text-red-400" />
                }
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300 mb-1">Positions</p>
                <p className="text-2xl font-bold text-white">{positions.length}</p>
                <p className="text-xs text-slate-400">3 profitable</p>
              </div>
              <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300 mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-white">74%</p>
                <p className="text-xs text-slate-400">Last 30 trades</p>
              </div>
              <div className="h-12 w-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Chart and Allocation */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Portfolio Performance</CardTitle>
                <CardDescription className="text-slate-400">Today's performance overview</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">+2.1%</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={[
                { time: '09:00', value: 24800, volume: 120 },
                { time: '10:00', value: 25100, volume: 180 },
                { time: '11:00', value: 24950, volume: 150 },
                { time: '12:00', value: 25200, volume: 200 },
                { time: '13:00', value: 25000, volume: 170 },
                { time: '14:00', value: 25150, volume: 190 },
                { time: '15:00', value: 25000, volume: 160 }
              ]}>
                <defs>
                  <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#06B6D4"
                  fill="url(#valueGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Asset Allocation</CardTitle>
            <CardDescription className="text-slate-400">Portfolio distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={portfolioChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {portfolioChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {portfolioChartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{((item.value / portfolioValue) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Positions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Active Positions</CardTitle>
              <CardDescription className="text-slate-400">Your current trading positions</CardDescription>
            </div>
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positions.map((position) => (
              <div key={position.id} className="group p-4 border border-slate-700 rounded-xl hover:border-slate-600 hover:bg-slate-700/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center text-xl">
                      {position.logo}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-lg">{position.name}</div>
                      <div className="text-sm text-slate-400">
                        {position.quantity} units • ${position.buyPrice.toLocaleString()} avg
                      </div>
                      <Badge variant="secondary" className="mt-1 text-xs bg-slate-700 text-slate-300">
                        {position.industry}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white text-lg">${position.value.toLocaleString()}</div>
                    <div className={`text-sm font-medium ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)} ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%)
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Current: ${position.currentPrice.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="border-slate-600 text-white hover:bg-slate-700">
                      Manage
                    </Button>
                    <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700">
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const DiscoverPage = () => (
    <div className="space-y-6">
      {/* Trending Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Trending Assets</h2>
          <p className="text-slate-400">Most popular trades today</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600 text-white">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Asset Grid */}
      <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {enhancedMarketData.slice(0, 9).map((asset) => (
          <Card key={asset.symbol} className="bg-slate-800 border-slate-700 hover:border-slate-600 hover:shadow-lg transition-all group cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center text-xl">
                    {asset.logo}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-lg">{asset.symbol}</div>
                    <div className="text-sm text-slate-400">{asset.name}</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Star className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">${asset.price.toLocaleString()}</span>
                  <div className={`flex items-center gap-1 text-sm font-medium ${asset.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {asset.changePercent24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
                  </div>
                </div>

                {/* Social Metrics */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">{asset.socialVolume} traders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-cyan-500 h-2 rounded-full"
                        style={{ width: `${asset.sentiment}%` }}
                      ></div>
                    </div>
                    <span className="text-slate-300">{asset.sentiment}%</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => openTradeDialog(asset)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Buy
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    onClick={() => openTradeDialog(asset)}
                  >
                    <MinusCircle className="mr-2 h-4 w-4" />
                    Sell
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const SocialPage = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Social Feed</h2>
        <p className="text-slate-400">See what other traders are doing</p>
      </div>

      <div className="space-y-4">
        {socialFeed.map((post) => (
          <Card key={post.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
                    {post.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-white">{post.user}</span>
                    <span className="text-slate-400">{post.action}</span>
                    <Badge className="bg-cyan-500 text-white">{post.asset}</Badge>
                    <span className="text-slate-400">•</span>
                    <span className="text-sm text-slate-400">
                      {Math.floor((Date.now() - post.timestamp.getTime()) / 60000)}m ago
                    </span>
                  </div>
                  <p className="text-slate-300 mb-3">
                    Invested ${post.amount.toLocaleString()} in {post.asset}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      <Heart className="mr-1 h-4 w-4" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      <MessageCircle className="mr-1 h-4 w-4" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      <Share2 className="mr-1 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderPageContent = () => {
    switch (currentPage) {
      case 'portfolio':
        return <PortfolioPage />
      case 'discover':
        return <DiscoverPage />
      case 'social':
        return <SocialPage />
      case 'watchlist':
        return <div className="text-white">Watchlist coming soon...</div>
      default:
        return <PortfolioPage />
    }
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr] bg-slate-950">
      <div className="hidden border-r border-slate-800 md:block">
        <Sidebar />
      </div>
      <div className="flex flex-col">
        <Header />
        <ErrorBoundary>
          <RealTimeMarketBanner />
        </ErrorBoundary>
        <main className="flex flex-1 flex-col gap-6 p-6 bg-slate-950 overflow-auto">
          <ErrorBoundary>
            {renderPageContent()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Enhanced Trade Dialog */}
      <Dialog open={isTradeDialogOpen} onOpenChange={setIsTradeDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              Trade {selectedAsset?.symbol}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedAsset?.name} - ${selectedAsset?.price?.toLocaleString()}
              <Badge className="ml-2 bg-cyan-500 text-white">Live Price</Badge>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-white font-medium">Investment Amount</Label>
              <input
                type="range"
                value={tradeAmount[0]}
                onChange={(e) => setTradeAmount([Number.parseInt(e.target.value)])}
                max={5000}
                min={100}
                step={100}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">$100</span>
                <span className="text-white font-bold">${tradeAmount[0].toLocaleString()}</span>
                <span className="text-slate-400">$5,000</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-white font-medium">Leverage</Label>
              <Select defaultValue="1">
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="1">1x (No Leverage)</SelectItem>
                  <SelectItem value="2">2x Leverage</SelectItem>
                  <SelectItem value="5">5x Leverage</SelectItem>
                  <SelectItem value="10">10x Leverage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Trade Summary */}
            <div className="bg-slate-700/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Investment</span>
                <span className="text-white">${tradeAmount[0].toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Fee</span>
                <span className="text-white">$1.00</span>
              </div>
              <div className="border-t border-slate-600 pt-2 flex justify-between font-medium">
                <span className="text-white">Total</span>
                <span className="text-white">${(tradeAmount[0] + 1).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsTradeDialogOpen(false)}
              className="flex-1 border-slate-600 text-white hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                setIsTradeDialogOpen(false)
                // Handle sell trade
              }}
            >
              <MinusCircle className="mr-2 h-4 w-4" />
              Sell
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                setIsTradeDialogOpen(false)
                // Handle buy trade
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Buy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
