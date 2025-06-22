"use client"

import { useState, useEffect, useCallback } from 'react'
import {
  advancedAnalyticsService,
  type AdvancedMetrics,
  type UserBehaviorData,
  type CohortData,
  type ConversionFunnelData,
  type RevenueData,
  type GeographicData
} from '@/lib/advanced-analytics'

// Hook for advanced analytics metrics
export function useAdvancedAnalytics() {
  const [metrics, setMetrics] = useState<AdvancedMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial load
    const initialMetrics = advancedAnalyticsService.getMetrics()
    setMetrics(initialMetrics)
    setIsLoading(false)

    // Subscribe to updates
    const unsubscribe = advancedAnalyticsService.onUpdate((newMetrics) => {
      setMetrics(newMetrics)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return {
    metrics,
    isLoading
  }
}

// Hook for user behavior analysis
export function useUserBehaviorAnalysis() {
  const [behaviorData, setBehaviorData] = useState<UserBehaviorData[]>([])
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  })
  const [filters, setFilters] = useState({
    deviceType: 'all',
    source: 'all',
    location: 'all'
  })

  const fetchBehaviorData = useCallback(() => {
    const data = advancedAnalyticsService.getUserBehaviorData(dateRange)

    // Apply filters
    const filteredData = data.filter(user => {
      if (filters.deviceType !== 'all' && user.deviceType !== filters.deviceType) return false
      if (filters.source !== 'all' && user.source !== filters.source) return false
      if (filters.location !== 'all' && user.location !== filters.location) return false
      return true
    })

    setBehaviorData(filteredData)
  }, [dateRange, filters])

  useEffect(() => {
    fetchBehaviorData()
  }, [fetchBehaviorData])

  const updateDateRange = useCallback((start: Date, end: Date) => {
    setDateRange({ start, end })
  }, [])

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Analytics insights
  const insights = {
    averageSessionDuration: behaviorData.reduce((sum, user) => sum + user.sessionDuration, 0) / behaviorData.length || 0,
    averagePageViews: behaviorData.reduce((sum, user) => sum + user.pageViews, 0) / behaviorData.length || 0,
    deviceBreakdown: {
      desktop: behaviorData.filter(u => u.deviceType === 'desktop').length,
      mobile: behaviorData.filter(u => u.deviceType === 'mobile').length,
      tablet: behaviorData.filter(u => u.deviceType === 'tablet').length
    },
    sourceBreakdown: {
      direct: behaviorData.filter(u => u.source === 'direct').length,
      search: behaviorData.filter(u => u.source === 'search').length,
      social: behaviorData.filter(u => u.source === 'social').length,
      referral: behaviorData.filter(u => u.source === 'referral').length
    },
    topLocations: Object.entries(
      behaviorData.reduce((acc, user) => {
        acc[user.location] = (acc[user.location] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    ).sort(([,a], [,b]) => b - a).slice(0, 5)
  }

  return {
    behaviorData,
    dateRange,
    filters,
    insights,
    updateDateRange,
    updateFilters,
    refreshData: fetchBehaviorData
  }
}

// Hook for cohort analysis
export function useCohortAnalysis() {
  const [cohortData, setCohortData] = useState<CohortData[]>([])
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'rate'>('rate')

  useEffect(() => {
    const data = advancedAnalyticsService.getCohortAnalysis()
    setCohortData(data)
  }, [])

  const chartData = cohortData.map(cohort => {
    const base = selectedMetric === 'users' ? cohort.retainedUsers : cohort.retentionRate
    return {
      period: cohort.period,
      week1: base.week1,
      week2: base.week2,
      week4: base.week4,
      week8: base.week8,
      week12: base.week12,
      totalUsers: cohort.totalUsers
    }
  })

  return {
    cohortData,
    chartData,
    selectedMetric,
    setSelectedMetric
  }
}

// Hook for conversion funnel analysis
export function useConversionFunnel() {
  const [funnelData, setFunnelData] = useState<ConversionFunnelData[]>([])
  const [selectedView, setSelectedView] = useState<'absolute' | 'percentage'>('absolute')

  useEffect(() => {
    const data = advancedAnalyticsService.getConversionFunnel()
    setFunnelData(data)
  }, [])

  const chartData = funnelData.map((step, index) => ({
    ...step,
    fill: `hsl(${200 + index * 30}, 70%, 50%)`,
    previousStepUsers: index > 0 ? funnelData[index - 1].users : step.users
  }))

  const insights = {
    totalConversionRate: funnelData.length > 0 ?
      (funnelData[funnelData.length - 1].users / funnelData[0].users) * 100 : 0,
    biggestDropoff: funnelData.reduce((max, step) =>
      step.dropoffRate > max.dropoffRate ? step : max,
      { dropoffRate: 0, step: '' }
    ),
    improvementOpportunities: funnelData
      .filter(step => step.dropoffRate > 25)
      .sort((a, b) => b.dropoffRate - a.dropoffRate)
  }

  const drillDown = useCallback((stepIndex: number) => {
    return advancedAnalyticsService.drillDown('conversion_funnel', {
      step: funnelData[stepIndex]?.step
    })
  }, [funnelData])

  return {
    funnelData,
    chartData,
    selectedView,
    setSelectedView,
    insights,
    drillDown
  }
}

// Hook for revenue analysis
export function useRevenueAnalysis() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'transactions' | 'aov'>('revenue')

  useEffect(() => {
    const data = advancedAnalyticsService.getRevenueAnalysis(period)
    setRevenueData(data)
  }, [period])

  const chartData = revenueData.map(item => ({
    period: item.period,
    revenue: item.revenue,
    transactions: item.transactions,
    aov: item.averageOrderValue
  }))

  const insights = {
    totalRevenue: revenueData.reduce((sum, item) => sum + item.revenue, 0),
    totalTransactions: revenueData.reduce((sum, item) => sum + item.transactions, 0),
    averageOrderValue: revenueData.reduce((sum, item) => sum + item.averageOrderValue, 0) / revenueData.length || 0,
    growth: revenueData.length >= 2 ?
      ((revenueData[0].revenue - revenueData[1].revenue) / revenueData[1].revenue) * 100 : 0,
    topProducts: revenueData.length > 0 ? revenueData[0].topProducts : []
  }

  const drillDown = useCallback((filters: any) => {
    return advancedAnalyticsService.drillDown('revenue', filters)
  }, [])

  return {
    revenueData,
    chartData,
    period,
    setPeriod,
    selectedMetric,
    setSelectedMetric,
    insights,
    drillDown
  }
}

// Hook for geographic analysis
export function useGeographicAnalysis() {
  const [geoData, setGeoData] = useState<GeographicData[]>([])
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'revenue' | 'sessionDuration'>('users')

  useEffect(() => {
    const data = advancedAnalyticsService.getGeographicData()
    setGeoData(data)
  }, [])

  const chartData = geoData.map(region => ({
    ...region,
    value: region[selectedMetric === 'sessionDuration' ? 'averageSessionDuration' : selectedMetric]
  }))

  const insights = {
    totalUsers: geoData.reduce((sum, region) => sum + region.users, 0),
    totalRevenue: geoData.reduce((sum, region) => sum + region.revenue, 0),
    topRegions: geoData
      .sort((a, b) => b[selectedMetric === 'sessionDuration' ? 'averageSessionDuration' : selectedMetric] -
                     a[selectedMetric === 'sessionDuration' ? 'averageSessionDuration' : selectedMetric])
      .slice(0, 5),
    distribution: {
      greece: geoData.filter(r => r.country === 'Greece').reduce((sum, r) => sum + r.users, 0),
      cyprus: geoData.filter(r => r.country === 'Cyprus').reduce((sum, r) => sum + r.users, 0),
      international: geoData.filter(r => r.country === 'Other').reduce((sum, r) => sum + r.users, 0)
    }
  }

  return {
    geoData,
    chartData,
    selectedMetric,
    setSelectedMetric,
    insights
  }
}

// Hook for drill-down analytics
export function useDrillDownAnalytics() {
  const [drillDownData, setDrillDownData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentDrillDown, setCurrentDrillDown] = useState<{
    metric: string
    filters: any
  } | null>(null)

  const performDrillDown = useCallback(async (metric: string, filters: any) => {
    setIsLoading(true)
    setCurrentDrillDown({ metric, filters })

    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500))
      const data = advancedAnalyticsService.drillDown(metric, filters)
      setDrillDownData(data)
    } catch (error) {
      console.error('Drill-down failed:', error)
      setDrillDownData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearDrillDown = useCallback(() => {
    setDrillDownData(null)
    setCurrentDrillDown(null)
  }, [])

  return {
    drillDownData,
    isLoading,
    currentDrillDown,
    performDrillDown,
    clearDrillDown
  }
}

// Hook for custom analytics dashboard
export function useCustomDashboard() {
  const [widgets, setWidgets] = useState([
    { id: 'users', type: 'metric', title: 'Daily Active Users', position: { x: 0, y: 0 } },
    { id: 'revenue', type: 'chart', title: 'Revenue Trend', position: { x: 1, y: 0 } },
    { id: 'funnel', type: 'funnel', title: 'Conversion Funnel', position: { x: 0, y: 1 } },
    { id: 'geo', type: 'map', title: 'Geographic Distribution', position: { x: 1, y: 1 } }
  ])

  const addWidget = useCallback((widget: any) => {
    setWidgets(prev => [...prev, { ...widget, id: `widget-${Date.now()}` }])
  }, [])

  const removeWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId))
  }, [])

  const updateWidget = useCallback((widgetId: string, updates: any) => {
    setWidgets(prev => prev.map(w =>
      w.id === widgetId ? { ...w, ...updates } : w
    ))
  }, [])

  const reorderWidgets = useCallback((newOrder: any[]) => {
    setWidgets(newOrder)
  }, [])

  return {
    widgets,
    addWidget,
    removeWidget,
    updateWidget,
    reorderWidgets
  }
}
