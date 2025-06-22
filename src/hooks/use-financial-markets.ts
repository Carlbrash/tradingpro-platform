"use client"

import { useState, useEffect, useCallback } from 'react'
import {
  financialMarketsService,
  type Stock,
  type CryptoAsset,
  type PortfolioPosition,
  type PortfolioSummary,
  type WatchlistItem,
  type PriceHistory,
  type MarketEvent
} from '@/lib/financial-markets'
import { toast } from 'sonner'

// Hook for financial markets service initialization
export function useFinancialMarkets() {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      financialMarketsService.initialize()
      setIsInitialized(true)
    }

    return () => {
      if (isInitialized) {
        financialMarketsService.dispose()
      }
    }
  }, [isInitialized])

  return {
    isInitialized
  }
}

// Hook for stocks data
export function useStocks() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial load
    setStocks(financialMarketsService.getStocks())
    setIsLoading(false)

    // Listen for price updates
    const unsubscribe = financialMarketsService.onEvent((event) => {
      if (event.type === 'price-update') {
        setStocks(event.data.stocks)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const getTopGainers = useCallback(() => {
    return financialMarketsService.getTopGainers().filter(item => 'sector' in item) as Stock[]
  }, [])

  const getTopLosers = useCallback(() => {
    return financialMarketsService.getTopLosers().filter(item => 'sector' in item) as Stock[]
  }, [])

  return {
    stocks,
    isLoading,
    getTopGainers,
    getTopLosers
  }
}

// Hook for crypto data
export function useCrypto() {
  const [crypto, setCrypto] = useState<CryptoAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial load
    setCrypto(financialMarketsService.getCrypto())
    setIsLoading(false)

    // Listen for price updates
    const unsubscribe = financialMarketsService.onEvent((event) => {
      if (event.type === 'price-update') {
        setCrypto(event.data.crypto)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const getTopCryptoGainers = useCallback(() => {
    return financialMarketsService.getTopGainers().filter(item => 'rank' in item) as CryptoAsset[]
  }, [])

  const getTopCryptoLosers = useCallback(() => {
    return financialMarketsService.getTopLosers().filter(item => 'rank' in item) as CryptoAsset[]
  }, [])

  return {
    crypto,
    isLoading,
    getTopCryptoGainers,
    getTopCryptoLosers
  }
}

// Hook for portfolio management
export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>([])
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial load
    setPortfolio(financialMarketsService.getPortfolio())
    setPortfolioSummary(financialMarketsService.getPortfolioSummary())
    setIsLoading(false)

    // Listen for portfolio updates
    const unsubscribe = financialMarketsService.onEvent((event) => {
      if (event.type === 'portfolio-update') {
        setPortfolio(event.data.positions)
        setPortfolioSummary(event.data.summary)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const getAssetAllocation = useCallback(() => {
    if (!portfolioSummary) return []

    const stockValue = portfolio
      .filter(pos => pos.type === 'stock')
      .reduce((sum, pos) => sum + pos.value, 0)

    const cryptoValue = portfolio
      .filter(pos => pos.type === 'crypto')
      .reduce((sum, pos) => sum + pos.value, 0)

    const totalInvested = stockValue + cryptoValue
    const cashValue = portfolioSummary.cash

    const total = totalInvested + cashValue

    return [
      {
        name: 'Stocks',
        value: stockValue,
        percentage: total > 0 ? (stockValue / total) * 100 : 0,
        color: '#4F46E5'
      },
      {
        name: 'Crypto',
        value: cryptoValue,
        percentage: total > 0 ? (cryptoValue / total) * 100 : 0,
        color: '#F59E0B'
      },
      {
        name: 'Cash',
        value: cashValue,
        percentage: total > 0 ? (cashValue / total) * 100 : 0,
        color: '#10B981'
      }
    ]
  }, [portfolio, portfolioSummary])

  const getPortfolioPerformance = useCallback(() => {
    // Generate mock historical portfolio performance data
    const days = 30
    const data = []
    let baseValue = portfolioSummary?.totalValue || 45000

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      // Simulate some volatility in portfolio value
      const change = (Math.random() - 0.5) * 1000
      baseValue = Math.max(10000, baseValue + change)

      data.push({
        date: date.toISOString().split('T')[0],
        value: baseValue,
        change: change
      })
    }

    return data
  }, [portfolioSummary])

  return {
    portfolio,
    portfolioSummary,
    isLoading,
    getAssetAllocation,
    getPortfolioPerformance
  }
}

// Hook for watchlist management
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial load
    setWatchlist(financialMarketsService.getWatchlist())
    setIsLoading(false)

    // Listen for watchlist updates
    const unsubscribe = financialMarketsService.onEvent((event) => {
      if (event.type === 'watchlist-update') {
        setWatchlist(event.data)
      } else if (event.type === 'price-update') {
        // Update watchlist with new prices
        setWatchlist(financialMarketsService.getWatchlist())
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const addToWatchlist = useCallback((symbol: string, name: string, type: 'stock' | 'crypto') => {
    const success = financialMarketsService.addToWatchlist(symbol, name, type)
    if (success) {
      toast.success(`${symbol} added to watchlist`)
    } else {
      toast.error(`Failed to add ${symbol} to watchlist`)
    }
    return success
  }, [])

  const removeFromWatchlist = useCallback((symbol: string) => {
    const success = financialMarketsService.removeFromWatchlist(symbol)
    if (success) {
      toast.success(`${symbol} removed from watchlist`)
    } else {
      toast.error(`Failed to remove ${symbol} from watchlist`)
    }
    return success
  }, [])

  const getWatchlistByType = useCallback((type: 'stock' | 'crypto') => {
    return watchlist.filter(item => item.type === type)
  }, [watchlist])

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    getWatchlistByType
  }
}

// Hook for price history and charts
export function usePriceHistory() {
  const getPriceHistory = useCallback((symbol: string, days = 30) => {
    return financialMarketsService.getPriceHistory(symbol, days)
  }, [])

  const formatChartData = useCallback((history: PriceHistory[]) => {
    return history.map(point => ({
      timestamp: point.timestamp.toISOString().split('T')[0],
      price: point.price,
      volume: point.volume
    }))
  }, [])

  const getStockTrendData = useCallback(() => {
    // Generate mock intraday data for stocks chart
    const data = []
    let price = 260
    const now = new Date()

    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now)
      timestamp.setHours(i, 30, 0, 0)

      // Simulate some price movement
      const change = (Math.random() - 0.5) * 10
      price = Math.max(200, price + change)

      data.push({
        time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: price
      })
    }

    return data
  }, [])

  return {
    getPriceHistory,
    formatChartData,
    getStockTrendData
  }
}

// Hook for market events and notifications
export function useMarketEvents() {
  const [events, setEvents] = useState<MarketEvent[]>([])
  const [alerts, setAlerts] = useState<string[]>([])

  useEffect(() => {
    const unsubscribe = financialMarketsService.onEvent((event) => {
      setEvents(prev => [event, ...prev.slice(0, 49)]) // Keep last 50 events

      // Show notifications for significant price changes
      if (event.type === 'price-update') {
        const { stocks, crypto } = event.data

        // Check for significant price movements (>5%)
        const significantChanges = [...stocks, ...crypto].filter(
          item => Math.abs(item.changePercent) > 5
        )

        significantChanges.forEach(item => {
          const direction = item.changePercent > 0 ? 'up' : 'down'
          const message = `${item.symbol} is ${direction} ${Math.abs(item.changePercent).toFixed(2)}%`

          if (item.changePercent > 5) {
            toast.success(`📈 ${message}`)
          } else if (item.changePercent < -5) {
            toast.error(`📉 ${message}`)
          }
        })
      }

      // Portfolio alerts
      if (event.type === 'portfolio-update') {
        const { summary } = event.data
        if (summary.dayChangePercent > 10) {
          toast.success(`🎉 Portfolio up ${summary.dayChangePercent.toFixed(2)}% today!`)
        } else if (summary.dayChangePercent < -10) {
          toast.error(`⚠️ Portfolio down ${Math.abs(summary.dayChangePercent).toFixed(2)}% today`)
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const getRecentAlerts = useCallback(() => {
    return events
      .filter(event => event.type === 'market-alert')
      .slice(0, 5)
  }, [events])

  return {
    events,
    alerts,
    getRecentAlerts
  }
}

// Hook for market statistics and analysis
export function useMarketAnalysis() {
  const [marketStats, setMarketStats] = useState({
    totalMarketCap: 0,
    averageChange: 0,
    bullishCount: 0,
    bearishCount: 0,
    volatilityIndex: 0
  })

  useEffect(() => {
    const calculateStats = () => {
      const stocks = financialMarketsService.getStocks()
      const crypto = financialMarketsService.getCrypto()
      const allAssets = [...stocks, ...crypto]

      const totalMarketCap = allAssets.reduce((sum, asset) => sum + asset.marketCap, 0)
      const averageChange = allAssets.reduce((sum, asset) => sum + asset.changePercent, 0) / allAssets.length
      const bullishCount = allAssets.filter(asset => asset.changePercent > 0).length
      const bearishCount = allAssets.filter(asset => asset.changePercent < 0).length

      // Calculate volatility index (average of absolute changes)
      const volatilityIndex = allAssets.reduce((sum, asset) => sum + Math.abs(asset.changePercent), 0) / allAssets.length

      setMarketStats({
        totalMarketCap,
        averageChange,
        bullishCount,
        bearishCount,
        volatilityIndex
      })
    }

    // Initial calculation
    calculateStats()

    // Update on price changes
    const unsubscribe = financialMarketsService.onEvent((event) => {
      if (event.type === 'price-update') {
        calculateStats()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const getMarketSentiment = useCallback(() => {
    const { bullishCount, bearishCount } = marketStats
    const total = bullishCount + bearishCount

    if (total === 0) return 'neutral'

    const bullishPercentage = (bullishCount / total) * 100

    if (bullishPercentage > 60) return 'bullish'
    if (bullishPercentage < 40) return 'bearish'
    return 'neutral'
  }, [marketStats])

  return {
    marketStats,
    getMarketSentiment
  }
}

// Hook for financial data search and filtering
export function useMarketSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'stocks' | 'crypto'>('all')

  const searchResults = useCallback(() => {
    const stocks = financialMarketsService.getStocks()
    const crypto = financialMarketsService.getCrypto()

    let allAssets: (Stock | CryptoAsset)[] = []

    if (filterType === 'all') {
      allAssets = [...stocks, ...crypto]
    } else if (filterType === 'stocks') {
      allAssets = stocks
    } else {
      allAssets = crypto
    }

    if (!searchQuery.trim()) {
      return allAssets
    }

    const query = searchQuery.toLowerCase()
    return allAssets.filter(asset =>
      asset.symbol.toLowerCase().includes(query) ||
      asset.name.toLowerCase().includes(query)
    )
  }, [searchQuery, filterType])

  return {
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    searchResults
  }
}
