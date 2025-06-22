"use client"

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  realMarketAPIService,
  type RealStockData,
  type RealCryptoData,
  APIResponse
} from '@/lib/real-market-api'
import {
  tradingSystemService,
  type TradingOrder,
  type Trade,
  type TradingAccount,
  type TradingPosition,
  type TradingStats,
  type OrderType,
  type OrderSide,
  type TradingEvent
} from '@/lib/trading-system'

// Hook for real market data integration
export function useRealMarketData() {
  const [stockData, setStockData] = useState<RealStockData[]>([])
  const [cryptoData, setCryptoData] = useState<RealCryptoData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchMarketData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch both stocks and crypto data
      const [stockResponse, cryptoResponse] = await Promise.all([
        realMarketAPIService.getStockData(),
        realMarketAPIService.getCryptoData()
      ])

      if (stockResponse.success) {
        setStockData(stockResponse.data)
      } else {
        console.error('Stock data fetch failed:', stockResponse.error)
      }

      if (cryptoResponse.success) {
        setCryptoData(cryptoResponse.data)
      } else {
        console.error('Crypto data fetch failed:', cryptoResponse.error)
      }

      setLastUpdated(new Date())

      // Update trading system with new prices
      const priceMap: Record<string, number> = {}
      stockResponse.data.forEach(stock => {
        priceMap[stock.symbol] = stock.price
      })
      cryptoResponse.data.forEach(crypto => {
        priceMap[crypto.symbol] = crypto.price
      })

      tradingSystemService.updatePositionPrices(priceMap)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market data'
      setError(errorMessage)
      toast.error(`Market data error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-refresh data every 2 minutes
  useEffect(() => {
    fetchMarketData()

    const interval = setInterval(fetchMarketData, 120000) // 2 minutes
    return () => clearInterval(interval)
  }, [fetchMarketData])

  const refreshData = useCallback(() => {
    fetchMarketData()
    toast.success('Market data refreshed')
  }, [fetchMarketData])

  const clearCache = useCallback(() => {
    realMarketAPIService.clearCache()
    fetchMarketData()
    toast.info('Cache cleared, fetching fresh data')
  }, [fetchMarketData])

  return {
    stockData,
    cryptoData,
    isLoading,
    lastUpdated,
    error,
    refreshData,
    clearCache
  }
}

// Hook for asset search
export function useAssetSearch() {
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string; type: 'stock' | 'crypto' }>>([])
  const [isSearching, setIsSearching] = useState(false)

  const searchAssets = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await realMarketAPIService.searchAssets(query)
      if (response.success) {
        setSearchResults(response.data)
      } else {
        toast.error('Search failed')
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search error occurred')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setSearchResults([])
  }, [])

  return {
    searchResults,
    isSearching,
    searchAssets,
    clearResults
  }
}

// Hook for trading orders
export function useTradingOrders() {
  const [orders, setOrders] = useState<TradingOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshOrders = useCallback(() => {
    const allOrders = tradingSystemService.getOrders()
    setOrders(allOrders)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refreshOrders()

    // Listen for trading events
    const unsubscribe = tradingSystemService.onEvent((event: TradingEvent) => {
      if (event.type === 'order-placed' || event.type === 'order-filled' || event.type === 'order-cancelled') {
        refreshOrders()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [refreshOrders])

  const placeOrder = useCallback(async (orderData: {
    symbol: string
    name: string
    type: OrderType
    side: OrderSide
    quantity: number
    price?: number
    stopPrice?: number
    limitPrice?: number
  }) => {
    try {
      const result = await tradingSystemService.placeOrder(orderData)

      if (result.success) {
        toast.success(`${orderData.side.toUpperCase()} order placed for ${orderData.symbol}`)
        return { success: true, orderId: result.orderId }
      } else {
        toast.error(`Order failed: ${result.error}`)
        return { success: false, error: result.error }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order'
      toast.error(`Order error: ${errorMessage}`)
      return { success: false, error: errorMessage }
    }
  }, [])

  const cancelOrder = useCallback(async (orderId: string) => {
    try {
      const result = await tradingSystemService.cancelOrder(orderId)

      if (result.success) {
        toast.success('Order cancelled successfully')
        return { success: true }
      } else {
        toast.error(`Cancel failed: ${result.error}`)
        return { success: false, error: result.error }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order'
      toast.error(`Cancel error: ${errorMessage}`)
      return { success: false, error: errorMessage }
    }
  }, [])

  const getPendingOrders = useCallback(() => {
    return orders.filter(order => order.status === 'pending')
  }, [orders])

  const getFilledOrders = useCallback(() => {
    return orders.filter(order => order.status === 'filled')
  }, [orders])

  return {
    orders,
    isLoading,
    placeOrder,
    cancelOrder,
    getPendingOrders,
    getFilledOrders,
    refreshOrders
  }
}

// Hook for trade history
export function useTradeHistory() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshTrades = useCallback(() => {
    const allTrades = tradingSystemService.getTrades()
    setTrades(allTrades)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refreshTrades()

    // Listen for new trades
    const unsubscribe = tradingSystemService.onEvent((event: TradingEvent) => {
      if (event.type === 'order-filled') {
        refreshTrades()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [refreshTrades])

  const getTradesBySymbol = useCallback((symbol: string) => {
    return tradingSystemService.getTradesBySymbol(symbol)
  }, [])

  const getTradesInDateRange = useCallback((startDate: Date, endDate: Date) => {
    return trades.filter(trade =>
      trade.executedAt >= startDate && trade.executedAt <= endDate
    )
  }, [trades])

  const getTradingVolume = useCallback((days = 30) => {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const recentTrades = trades.filter(trade => trade.executedAt >= cutoffDate)
    return recentTrades.reduce((sum, trade) => sum + trade.value, 0)
  }, [trades])

  return {
    trades,
    isLoading,
    getTradesBySymbol,
    getTradesInDateRange,
    getTradingVolume,
    refreshTrades
  }
}

// Hook for trading account
export function useTradingAccount() {
  const [account, setAccount] = useState<TradingAccount | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshAccount = useCallback(() => {
    const accountData = tradingSystemService.getAccount()
    setAccount(accountData)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refreshAccount()

    // Listen for balance updates
    const unsubscribe = tradingSystemService.onEvent((event: TradingEvent) => {
      if (event.type === 'balance-updated') {
        refreshAccount()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [refreshAccount])

  const getAccountSummary = useCallback(() => {
    if (!account) return null

    return {
      totalValue: account.totalEquity,
      availableCash: account.availableBalance,
      buyingPower: account.buyingPower,
      dayPL: account.unrealizedPL,
      totalPL: account.realizedPL + account.unrealizedPL,
      totalFees: account.totalFees
    }
  }, [account])

  return {
    account,
    isLoading,
    getAccountSummary,
    refreshAccount
  }
}

// Hook for trading positions
export function useTradingPositions() {
  const [positions, setPositions] = useState<TradingPosition[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshPositions = useCallback(() => {
    const allPositions = tradingSystemService.getPositions()
    setPositions(allPositions)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refreshPositions()

    // Listen for position changes
    const unsubscribe = tradingSystemService.onEvent((event: TradingEvent) => {
      if (event.type === 'position-opened' || event.type === 'position-closed' || event.type === 'balance-updated') {
        refreshPositions()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [refreshPositions])

  const getPositionBySymbol = useCallback((symbol: string) => {
    return positions.find(pos => pos.symbol === symbol)
  }, [positions])

  const getTotalPositionValue = useCallback(() => {
    return positions.reduce((sum, pos) => sum + pos.marketValue, 0)
  }, [positions])

  const getTotalUnrealizedPL = useCallback(() => {
    return positions.reduce((sum, pos) => sum + pos.unrealizedPL, 0)
  }, [positions])

  return {
    positions,
    isLoading,
    getPositionBySymbol,
    getTotalPositionValue,
    getTotalUnrealizedPL,
    refreshPositions
  }
}

// Hook for trading statistics
export function useTradingStats() {
  const [stats, setStats] = useState<TradingStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshStats = useCallback(() => {
    const tradingStats = tradingSystemService.getTradingStats()
    setStats(tradingStats)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refreshStats()

    // Listen for trades that affect stats
    const unsubscribe = tradingSystemService.onEvent((event: TradingEvent) => {
      if (event.type === 'order-filled' || event.type === 'position-closed') {
        refreshStats()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [refreshStats])

  return {
    stats,
    isLoading,
    refreshStats
  }
}

// Hook for trading events and notifications
export function useTradingEvents() {
  const [events, setEvents] = useState<TradingEvent[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const unsubscribe = tradingSystemService.onEvent((event: TradingEvent) => {
      setEvents(prev => [event, ...prev.slice(0, 49)]) // Keep last 50 events
      setUnreadCount(prev => prev + 1)

      // Show appropriate notifications
      switch (event.type) {
        case 'order-placed':
          toast.info(`Order placed: ${event.data.side.toUpperCase()} ${event.data.quantity} ${event.data.symbol}`)
          break
        case 'order-filled':
          toast.success(`Order filled: ${event.data.trade.side.toUpperCase()} ${event.data.trade.quantity} ${event.data.trade.symbol} @ $${event.data.trade.price}`)
          break
        case 'order-cancelled':
          toast.warning(`Order cancelled: ${event.data.symbol}`)
          break
        case 'position-opened':
          toast.success(`Position opened: ${event.data.symbol}`)
          break
        case 'position-closed':
          const pl = event.data.finalPL >= 0 ? '+' : ''
          toast.success(`Position closed: ${event.data.symbol} (${pl}$${event.data.finalPL.toFixed(2)})`)
          break
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0)
  }, [])

  const clearEvents = useCallback(() => {
    setEvents([])
    setUnreadCount(0)
  }, [])

  return {
    events,
    unreadCount,
    markAllAsRead,
    clearEvents
  }
}

// Hook for quick trade functionality
export function useQuickTrade() {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const quickBuy = useCallback(async (symbol: string, name: string, quantity: number, price?: number) => {
    setIsPlacingOrder(true)
    try {
      const result = await tradingSystemService.placeOrder({
        symbol,
        name,
        type: price ? 'limit' : 'market',
        side: 'buy',
        quantity,
        price
      })

      if (result.success) {
        toast.success(`Buy order placed for ${quantity} ${symbol}`)
        return { success: true }
      } else {
        toast.error(`Buy order failed: ${result.error}`)
        return { success: false, error: result.error }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Trade failed'
      toast.error(`Buy error: ${errorMessage}`)
      return { success: false, error: errorMessage }
    } finally {
      setIsPlacingOrder(false)
    }
  }, [])

  const quickSell = useCallback(async (symbol: string, name: string, quantity: number, price?: number) => {
    setIsPlacingOrder(true)
    try {
      const result = await tradingSystemService.placeOrder({
        symbol,
        name,
        type: price ? 'limit' : 'market',
        side: 'sell',
        quantity,
        price
      })

      if (result.success) {
        toast.success(`Sell order placed for ${quantity} ${symbol}`)
        return { success: true }
      } else {
        toast.error(`Sell order failed: ${result.error}`)
        return { success: false, error: result.error }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Trade failed'
      toast.error(`Sell error: ${errorMessage}`)
      return { success: false, error: errorMessage }
    } finally {
      setIsPlacingOrder(false)
    }
  }, [])

  return {
    quickBuy,
    quickSell,
    isPlacingOrder
  }
}

// Hook for market summary
export function useMarketSummary() {
  const [summary, setSummary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSummary = useCallback(async () => {
    try {
      const response = await realMarketAPIService.getMarketSummary()
      if (response.success) {
        setSummary(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch market summary:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()
    const interval = setInterval(fetchSummary, 300000) // 5 minutes
    return () => clearInterval(interval)
  }, [fetchSummary])

  return {
    summary,
    isLoading,
    refreshSummary: fetchSummary
  }
}
