// Advanced Analytics Service for drill-down capabilities and detailed insights

export interface UserBehaviorData {
  userId: string
  userName: string
  sessionDuration: number
  pageViews: number
  actionsPerformed: string[]
  lastActivity: Date
  deviceType: 'desktop' | 'mobile' | 'tablet'
  location: string
  source: 'direct' | 'social' | 'search' | 'referral'
}

export interface CohortData {
  period: string
  totalUsers: number
  retainedUsers: Record<string, number> // week 1, week 2, etc.
  retentionRate: Record<string, number>
}

export interface ConversionFunnelData {
  step: string
  users: number
  conversionRate: number
  dropoffRate: number
}

export interface RevenueData {
  period: string
  revenue: number
  transactions: number
  averageOrderValue: number
  topProducts: { name: string; revenue: number; quantity: number }[]
}

export interface GeographicData {
  country: string
  region: string
  users: number
  revenue: number
  averageSessionDuration: number
}

export interface TrendData {
  date: string
  value: number
  change: number
  previousValue: number
}

export interface AdvancedMetrics {
  // User Engagement
  dailyActiveUsers: TrendData[]
  weeklyActiveUsers: TrendData[]
  monthlyActiveUsers: TrendData[]
  averageSessionDuration: TrendData[]
  bounceRate: TrendData[]
  pagesPerSession: TrendData[]

  // Conversion & Revenue
  conversionRate: TrendData[]
  revenue: TrendData[]
  customerLifetimeValue: TrendData[]
  customerAcquisitionCost: TrendData[]

  // Content Performance
  topPages: { page: string; views: number; avgTime: number; bounceRate: number }[]
  topSearchTerms: { term: string; count: number; conversionRate: number }[]

  // Technical Metrics
  pageLoadTime: TrendData[]
  errorRate: TrendData[]
  uptime: TrendData[]
}

class AdvancedAnalyticsService {
  private mockData: AdvancedMetrics
  private listeners: Set<(data: AdvancedMetrics) => void> = new Set()
  private updateInterval: NodeJS.Timeout | null = null

  constructor() {
    this.mockData = this.generateMockData()
    this.startRealTimeUpdates()
  }

  private generateMockData(): AdvancedMetrics {
    const dates = this.generateDateRange(30) // Last 30 days

    return {
      dailyActiveUsers: dates.map(date => ({
        date,
        value: Math.floor(Math.random() * 200) + 800,
        change: (Math.random() - 0.5) * 20,
        previousValue: Math.floor(Math.random() * 200) + 780
      })),

      weeklyActiveUsers: this.generateWeeklyData().map(date => ({
        date,
        value: Math.floor(Math.random() * 1000) + 4000,
        change: (Math.random() - 0.5) * 15,
        previousValue: Math.floor(Math.random() * 1000) + 3900
      })),

      monthlyActiveUsers: this.generateMonthlyData().map(date => ({
        date,
        value: Math.floor(Math.random() * 5000) + 15000,
        change: (Math.random() - 0.5) * 10,
        previousValue: Math.floor(Math.random() * 5000) + 14800
      })),

      averageSessionDuration: dates.map(date => ({
        date,
        value: Math.random() * 300 + 120, // 2-7 minutes
        change: (Math.random() - 0.5) * 30,
        previousValue: Math.random() * 300 + 115
      })),

      bounceRate: dates.map(date => ({
        date,
        value: Math.random() * 40 + 30, // 30-70%
        change: (Math.random() - 0.5) * 10,
        previousValue: Math.random() * 40 + 32
      })),

      pagesPerSession: dates.map(date => ({
        date,
        value: Math.random() * 5 + 2, // 2-7 pages
        change: (Math.random() - 0.5) * 1,
        previousValue: Math.random() * 5 + 1.9
      })),

      conversionRate: dates.map(date => ({
        date,
        value: Math.random() * 10 + 2, // 2-12%
        change: (Math.random() - 0.5) * 2,
        previousValue: Math.random() * 10 + 1.8
      })),

      revenue: dates.map(date => ({
        date,
        value: Math.random() * 50000 + 20000,
        change: (Math.random() - 0.5) * 10000,
        previousValue: Math.random() * 50000 + 18000
      })),

      customerLifetimeValue: dates.map(date => ({
        date,
        value: Math.random() * 500 + 200,
        change: (Math.random() - 0.5) * 50,
        previousValue: Math.random() * 500 + 195
      })),

      customerAcquisitionCost: dates.map(date => ({
        date,
        value: Math.random() * 100 + 30,
        change: (Math.random() - 0.5) * 15,
        previousValue: Math.random() * 100 + 32
      })),

      topPages: [
        { page: '/dashboard', views: 15420, avgTime: 185, bounceRate: 23.5 },
        { page: '/users', views: 12850, avgTime: 245, bounceRate: 31.2 },
        { page: '/analytics', views: 9640, avgTime: 320, bounceRate: 18.7 },
        { page: '/settings', views: 7230, avgTime: 156, bounceRate: 42.1 },
        { page: '/reports', views: 5940, avgTime: 280, bounceRate: 25.8 }
      ],

      topSearchTerms: [
        { term: 'user management', count: 2340, conversionRate: 15.6 },
        { term: 'analytics dashboard', count: 1890, conversionRate: 22.4 },
        { term: 'system settings', count: 1560, conversionRate: 8.9 },
        { term: 'data export', count: 1240, conversionRate: 31.2 },
        { term: 'user permissions', count: 980, conversionRate: 19.5 }
      ],

      pageLoadTime: dates.map(date => ({
        date,
        value: Math.random() * 2 + 0.5, // 0.5-2.5 seconds
        change: (Math.random() - 0.5) * 0.5,
        previousValue: Math.random() * 2 + 0.6
      })),

      errorRate: dates.map(date => ({
        date,
        value: Math.random() * 2 + 0.1, // 0.1-2.1%
        change: (Math.random() - 0.5) * 0.5,
        previousValue: Math.random() * 2 + 0.15
      })),

      uptime: dates.map(date => ({
        date,
        value: Math.random() * 1 + 99, // 99-100%
        change: (Math.random() - 0.5) * 0.1,
        previousValue: Math.random() * 1 + 98.9
      }))
    }
  }

  private generateDateRange(days: number): string[] {
    const dates = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  private generateWeeklyData(): string[] {
    const weeks = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - (i * 7))
      weeks.push(`Week of ${date.toISOString().split('T')[0]}`)
    }
    return weeks
  }

  private generateMonthlyData(): string[] {
    const months = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      months.push(date.toISOString().slice(0, 7)) // YYYY-MM format
    }
    return months
  }

  private startRealTimeUpdates() {
    this.updateInterval = setInterval(() => {
      // Simulate real-time data updates
      this.updateMetrics()
      this.notifyListeners()
    }, 30000) // Update every 30 seconds
  }

  private updateMetrics() {
    // Update latest data points with small random changes
    const metrics = ['dailyActiveUsers', 'averageSessionDuration', 'bounceRate', 'conversionRate'] as const

    metrics.forEach(metric => {
      const data = this.mockData[metric] as TrendData[]
      if (data.length > 0) {
        const latest = data[data.length - 1]
        const change = (Math.random() - 0.5) * (latest.value * 0.05) // ±5% change
        latest.value = Math.max(0, latest.value + change)
        latest.change = change
      }
    })
  }

  // User Behavior Analysis
  getUserBehaviorData(dateRange: { start: Date; end: Date }): UserBehaviorData[] {
    return Array.from({ length: 50 }, (_, i) => ({
      userId: `user-${i + 1}`,
      userName: `User ${i + 1}`,
      sessionDuration: Math.random() * 3600 + 300, // 5 minutes to 1 hour
      pageViews: Math.floor(Math.random() * 20) + 1,
      actionsPerformed: this.generateRandomActions(),
      lastActivity: new Date(Date.now() - Math.random() * 86400000), // Last 24 hours
      deviceType: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)] as any,
      location: ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa'][Math.floor(Math.random() * 5)],
      source: ['direct', 'social', 'search', 'referral'][Math.floor(Math.random() * 4)] as any
    }))
  }

  private generateRandomActions(): string[] {
    const allActions = [
      'Page View', 'Click Button', 'Form Submit', 'Download File',
      'Search', 'Filter Data', 'Export Data', 'Create Item',
      'Edit Item', 'Delete Item', 'Share Content', 'Print Page'
    ]
    const count = Math.floor(Math.random() * 8) + 1
    return allActions.sort(() => 0.5 - Math.random()).slice(0, count)
  }

  // Cohort Analysis
  getCohortAnalysis(): CohortData[] {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const period = date.toISOString().slice(0, 7)

      const totalUsers = Math.floor(Math.random() * 1000) + 500

      return {
        period,
        totalUsers,
        retainedUsers: {
          'week1': Math.floor(totalUsers * (0.7 + Math.random() * 0.2)),
          'week2': Math.floor(totalUsers * (0.5 + Math.random() * 0.2)),
          'week4': Math.floor(totalUsers * (0.3 + Math.random() * 0.2)),
          'week8': Math.floor(totalUsers * (0.2 + Math.random() * 0.15)),
          'week12': Math.floor(totalUsers * (0.15 + Math.random() * 0.1))
        },
        retentionRate: {
          'week1': 70 + Math.random() * 20,
          'week2': 50 + Math.random() * 20,
          'week4': 30 + Math.random() * 20,
          'week8': 20 + Math.random() * 15,
          'week12': 15 + Math.random() * 10
        }
      }
    })
  }

  // Conversion Funnel
  getConversionFunnel(): ConversionFunnelData[] {
    const steps = [
      'Landing Page Visit',
      'Sign Up Start',
      'Account Created',
      'Email Verified',
      'First Action',
      'Active User'
    ]

    let users = 10000
    return steps.map((step, index) => {
      const dropoff = 0.1 + Math.random() * 0.3 // 10-40% dropoff per step
      if (index > 0) {
        users = Math.floor(users * (1 - dropoff))
      }

      return {
        step,
        users,
        conversionRate: index === 0 ? 100 : (users / 10000) * 100,
        dropoffRate: index === 0 ? 0 : dropoff * 100
      }
    })
  }

  // Geographic Analysis
  getGeographicData(): GeographicData[] {
    const regions = [
      { country: 'Greece', region: 'Attica', baseUsers: 4500 },
      { country: 'Greece', region: 'Central Macedonia', baseUsers: 2800 },
      { country: 'Greece', region: 'Crete', baseUsers: 1200 },
      { country: 'Greece', region: 'Western Greece', baseUsers: 900 },
      { country: 'Cyprus', region: 'Nicosia', baseUsers: 650 },
      { country: 'Cyprus', region: 'Limassol', baseUsers: 450 },
      { country: 'Other', region: 'International', baseUsers: 800 }
    ]

    return regions.map(region => ({
      ...region,
      users: region.baseUsers + Math.floor(Math.random() * 200),
      revenue: (region.baseUsers + Math.random() * 200) * (50 + Math.random() * 100),
      averageSessionDuration: 120 + Math.random() * 300
    }))
  }

  // Revenue Analysis
  getRevenueAnalysis(period: 'daily' | 'weekly' | 'monthly'): RevenueData[] {
    const periods = period === 'daily' ? 30 : period === 'weekly' ? 12 : 12

    return Array.from({ length: periods }, (_, i) => {
      const date = new Date()
      if (period === 'daily') {
        date.setDate(date.getDate() - i)
      } else if (period === 'weekly') {
        date.setDate(date.getDate() - (i * 7))
      } else {
        date.setMonth(date.getMonth() - i)
      }

      const revenue = Math.random() * 50000 + 20000
      const transactions = Math.floor(Math.random() * 500) + 100

      return {
        period: date.toISOString().split('T')[0],
        revenue,
        transactions,
        averageOrderValue: revenue / transactions,
        topProducts: this.generateTopProducts()
      }
    })
  }

  private generateTopProducts() {
    const products = [
      'Premium Subscription', 'Pro License', 'Enterprise Package',
      'API Access', 'Custom Integration', 'Priority Support'
    ]

    return products.slice(0, 3).map(name => ({
      name,
      revenue: Math.random() * 10000 + 2000,
      quantity: Math.floor(Math.random() * 100) + 10
    }))
  }

  // Drill-down capabilities
  drillDown(metric: string, filters: Record<string, any>): any {
    // Simulate drill-down data based on metric and filters
    switch (metric) {
      case 'user_engagement':
        return this.getUserEngagementDrillDown(filters)
      case 'conversion_funnel':
        return this.getConversionDrillDown(filters)
      case 'revenue':
        return this.getRevenueDrillDown(filters)
      default:
        return null
    }
  }

  private getUserEngagementDrillDown(filters: any) {
    return {
      segments: [
        { name: 'New Users', value: 1240, change: 15.3 },
        { name: 'Returning Users', value: 3860, change: 8.7 },
        { name: 'Power Users', value: 890, change: 22.1 }
      ],
      breakdown: this.getUserBehaviorData(filters.dateRange || { start: new Date(), end: new Date() })
    }
  }

  private getConversionDrillDown(filters: any) {
    return {
      bySource: [
        { source: 'Organic Search', rate: 12.4, volume: 2340 },
        { source: 'Direct', rate: 18.7, volume: 1890 },
        { source: 'Social Media', rate: 8.9, volume: 1560 },
        { source: 'Referral', rate: 15.2, volume: 980 }
      ],
      byDevice: [
        { device: 'Desktop', rate: 16.2, volume: 4200 },
        { device: 'Mobile', rate: 11.8, volume: 2100 },
        { device: 'Tablet', rate: 13.5, volume: 470 }
      ]
    }
  }

  private getRevenueDrillDown(filters: any) {
    return {
      byProduct: this.generateTopProducts(),
      byRegion: this.getGeographicData(),
      byCustomerSegment: [
        { segment: 'Enterprise', revenue: 45000, customers: 23 },
        { segment: 'SMB', revenue: 28000, customers: 156 },
        { segment: 'Individual', revenue: 12000, customers: 890 }
      ]
    }
  }

  // Event system
  onUpdate(listener: (data: AdvancedMetrics) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.mockData)
      } catch (error) {
        console.error('Error in analytics listener:', error)
      }
    })
  }

  getMetrics(): AdvancedMetrics {
    return { ...this.mockData }
  }

  dispose() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    this.listeners.clear()
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService()
