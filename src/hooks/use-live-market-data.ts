"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { liveMarketAPI, type LiveMarketData } from "@/lib/live-market-api"

interface UseMarketDataOptions {
  updateInterval?: number // in milliseconds
  symbols?: string[]
  autoStart?: boolean
}

interface MarketDataState {
  data: LiveMarketData[]
  isLoading: boolean
  hasError: boolean
  apiStatus: 'healthy' | 'degraded' | 'down'
  lastUpdated: Date | null
  retryCount: number
}

export function useLiveMarketData(options: UseMarketDataOptions = {}) {
  const {
    updateInterval = 120000, // 2 minutes default
    symbols = [],
    autoStart = true
  } = options

  const [state, setState] = useState<MarketDataState>({
    data: [],
    isLoading: false,
    hasError: false,
    apiStatus: 'healthy',
    lastUpdated: null,
    retryCount: 0
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isRefreshingRef = useRef(false)

  // Fetch market data function
  const fetchData = useCallback(async (isRetry = false) => {
    if (isRefreshingRef.current && !isRetry) return

    try {
      isRefreshingRef.current = true

      setState(prev => ({
        ...prev,
        isLoading: !isRetry || prev.data.length === 0,
        hasError: false
      }))

      console.log('🔄 Fetching live market data...')

      // Check API health
      const healthCheck = await liveMarketAPI.checkAPIHealth()
      console.log(`📡 API Status: ${healthCheck.status} (${healthCheck.latency}ms)`)

      setState(prev => ({ ...prev, apiStatus: healthCheck.status }))

      if (healthCheck.status === 'down' && !isRetry) {
        throw new Error('API is currently down')
      }

      // Fetch market data
      let data: LiveMarketData[]

      if (symbols.length > 0) {
        // Fetch specific symbols
        data = await liveMarketAPI.getLiveCryptoData(symbols)
      } else {
        // Fetch all data
        data = await liveMarketAPI.getAllMarketData()
      }

      if (data && data.length > 0) {
        // Sort traditional assets first, then crypto
        const sortedData = [
          ...data.filter(item => ['DJ30', 'EURUSD', 'OIL', 'GOLD'].includes(item.symbol)),
          ...data.filter(item => !['DJ30', 'EURUSD', 'OIL', 'GOLD'].includes(item.symbol))
        ]

        setState(prev => ({
          ...prev,
          data: sortedData,
          lastUpdated: new Date(),
          retryCount: 0,
          isLoading: false,
          hasError: false
        }))

        console.log(`✅ Successfully loaded ${data.length} market items`)

        // Log sources breakdown
        const sources = data.reduce((acc, item) => {
          acc[item.source] = (acc[item.source] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        console.log('📊 Data sources:', sources)

      } else {
        throw new Error('No market data received')
      }
    } catch (error) {
      console.error('❌ Error fetching market data:', error)

      setState(prev => ({
        ...prev,
        hasError: true,
        retryCount: prev.retryCount + 1,
        isLoading: false
      }))

      // Auto-retry logic for first failure
      if (!isRetry && state.data.length === 0) {
        console.log('🔄 Auto-retrying with fallback data...')
        setTimeout(() => fetchData(true), 2000)
      }
    } finally {
      isRefreshingRef.current = false
    }
  }, [symbols, state.data.length])

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData(false)
  }, [fetchData])

  // Start/stop periodic updates
  const startUpdates = useCallback(() => {
    if (intervalRef.current) return

    console.log(`⏰ Starting periodic updates every ${updateInterval / 1000}s`)

    intervalRef.current = setInterval(() => {
      fetchData(false)
    }, updateInterval)
  }, [updateInterval, fetchData])

  const stopUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      console.log('⏹️ Stopped periodic updates')
    }
  }, [])

  // Clear cache
  const clearCache = useCallback(() => {
    liveMarketAPI.clearCache()
    console.log('🗑️ Cleared API cache')
  }, [])

  // Get cache stats
  const getCacheStats = useCallback(() => {
    return liveMarketAPI.getCacheStats()
  }, [])

  // Auto-start effect
  useEffect(() => {
    if (autoStart) {
      fetchData(false)
      startUpdates()
    }

    return () => {
      stopUpdates()
    }
  }, [autoStart, fetchData, startUpdates, stopUpdates])

  // Visibility change handler to pause/resume updates
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📱 Page hidden, pausing updates')
        stopUpdates()
      } else {
        console.log('📱 Page visible, resuming updates')
        startUpdates()
        // Refresh data when page becomes visible
        if (state.lastUpdated) {
          const timeSinceUpdate = Date.now() - state.lastUpdated.getTime()
          if (timeSinceUpdate > updateInterval / 2) {
            refresh()
          }
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [stopUpdates, startUpdates, refresh, state.lastUpdated, updateInterval])

  return {
    // State
    data: state.data,
    isLoading: state.isLoading,
    hasError: state.hasError,
    apiStatus: state.apiStatus,
    lastUpdated: state.lastUpdated,
    retryCount: state.retryCount,

    // Actions
    refresh,
    startUpdates,
    stopUpdates,
    clearCache,
    getCacheStats,

    // Computed values
    isStale: state.lastUpdated ? (Date.now() - state.lastUpdated.getTime()) > updateInterval * 2 : false,
    liveDataCount: state.data.filter(item => item.source === 'coingecko').length,
    mockDataCount: state.data.filter(item => item.source === 'mock').length,
  }
}
