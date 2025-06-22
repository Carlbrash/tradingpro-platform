// Financial Markets Service for portfolio tracking, stocks, and cryptocurrency data

export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  sector: string
  exchange: string
}

export interface CryptoAsset {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  rank: number
}

export interface PortfolioPosition {
  id: string
  symbol: string
  name: string
  type: 'stock' | 'crypto'
  quantity: number
  averagePrice: number
  currentPrice: number
  value: number
  unrealizedPL: number
  unrealizedPLPercent: number
  dayChange: number
  dayChangePercent: number
}

export interface PortfolioSummary {
  totalValue: number
  dayChange: number
  dayChangePercent: number
  totalGainLoss: number
  totalGainLossPercent: number
  cash: number
  invested: number
}

export interface WatchlistItem {
  symbol: string
  name: string
  type: 'stock' | 'crypto'
  price: number
  change: number
  changePercent: number
  addedDate: Date
}

export interface MarketData {
  stocks: Stock[]
  crypto: CryptoAsset[]
  portfolio: PortfolioPosition[]
  watchlist: WatchlistItem[]
  portfolioSummary: PortfolioSummary
}

export interface PriceHistory {
  timestamp: Date
  price: number
  volume: number
}

export type MarketEventType =
  | 'price-update'
  | 'portfolio-update'
  | 'watchlist-update'
  | 'market-alert'
  | 'news-update'

export interface MarketEvent {
  type: MarketEventType
  data: any
  timestamp: Date
}

class FinancialMarketsService {
  private listeners: Set<(event: MarketEvent) => void> = new Set()
  private updateInterval: NodeJS.Timeout | null = null
  private priceHistory: Map<string, PriceHistory[]> = new Map()

  // Mock portfolio positions
  private portfolioPositions: PortfolioPosition[] = [
    {
      id: '1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      type: 'stock',
      quantity: 50,
      averagePrice: 165.50,
      currentPrice: 173.50,
      value: 8675,
      unrealizedPL: 400,
      unrealizedPLPercent: 4.84,
      dayChange: 89.50,
      dayChangePercent: 1.04
    },
    {
      id: '2',
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      type: 'stock',
      quantity: 25,
      averagePrice: 240.00,
      currentPrice: 248.42,
      value: 6210.50,
      unrealizedPL: 210.50,
      unrealizedPLPercent: 3.52,
      dayChange: 94.21,
      dayChangePercent: 3.8
    },
    {
      id: '3',
      symbol: 'BTC',
      name: 'Bitcoin',
      type: 'crypto',
      quantity: 0.5,
      averagePrice: 42000,
      currentPrice: 43250,
      value: 21625,
      unrealizedPL: 625,
      unrealizedPLPercent: 2.98,
      dayChange: 453.50,
      dayChangePercent: 2.1
    },
    {
      id: '4',
      symbol: 'ETH',
      name: 'Ethereum',
      type: 'crypto',
      quantity: 5,
      averagePrice: 2800,
      currentPrice: 2950,
      value: 14750,
      unrealizedPL: 750,
      unrealizedPLPercent: 5.36,
      dayChange: 295,
      dayChangePercent: 2.0
    }
  ]

  // Mock watchlist
  private watchlistItems: WatchlistItem[] = [
    { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', price: 2750.80, change: 15.30, changePercent: 0.56, addedDate: new Date() },
    { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock', price: 338.45, change: -2.15, changePercent: -0.63, addedDate: new Date() },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', price: 3247.15, change: 21.85, changePercent: 0.68, addedDate: new Date() },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'stock', price: 495.22, change: 8.45, changePercent: 1.74, addedDate: new Date() },
    { symbol: 'META', name: 'Meta Platforms', type: 'stock', price: 276.43, change: -3.21, changePercent: -1.15, addedDate: new Date() },
    { symbol: 'ADA', name: 'Cardano', type: 'crypto', price: 0.485, change: 0.012, changePercent: 2.54, addedDate: new Date() },
    { symbol: 'SOL', name: 'Solana', type: 'crypto', price: 98.45, change: 3.21, changePercent: 3.37, addedDate: new Date() },
    { symbol: 'DOT', name: 'Polkadot', type: 'crypto', price: 7.23, change: -0.15, changePercent: -2.03, addedDate: new Date() }
  ]

  // Mock stocks data
  private stocksData: Stock[] = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 173.50,
      change: 1.75,
      changePercent: 1.02,
      volume: 45234567,
      marketCap: 2735000000000,
      sector: 'Technology',
      exchange: 'NASDAQ'
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 248.42,
      change: 9.12,
      changePercent: 3.81,
      volume: 23456789,
      marketCap: 789000000000,
      sector: 'Automotive',
      exchange: 'NASDAQ'
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 2750.80,
      change: 15.30,
      changePercent: 0.56,
      volume: 1234567,
      marketCap: 1800000000000,
      sector: 'Technology',
      exchange: 'NASDAQ'
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      price: 338.45,
      change: -2.15,
      changePercent: -0.63,
      volume: 18765432,
      marketCap: 2520000000000,
      sector: 'Technology',
      exchange: 'NASDAQ'
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      price: 3247.15,
      change: 21.85,
      changePercent: 0.68,
      volume: 2345678,
      marketCap: 1650000000000,
      sector: 'Consumer Discretionary',
      exchange: 'NASDAQ'
    }
  ]

  // Mock crypto data
  private cryptoData: CryptoAsset[] = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 43250,
      change: 912,
      changePercent: 2.15,
      volume: 15234567890,
      marketCap: 847000000000,
      rank: 1
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 2950,
      change: 58,
      changePercent: 2.00,
      volume: 8765432109,
      marketCap: 354000000000,
      rank: 2
    },
    {
      symbol: 'BNB',
      name: 'Binance Coin',
      price: 315.80,
      change: -5.45,
      changePercent: -1.70,
      volume: 987654321,
      marketCap: 48500000000,
      rank: 3
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      price: 0.485,
      change: 0.012,
      changePercent: 2.54,
      volume: 543219876,
      marketCap: 17200000000,
      rank: 8
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      price: 98.45,
      change: 3.21,
      changePercent: 3.37,
      volume: 234567890,
      marketCap: 42300000000,
      rank: 5
    }
  ]

  initialize() {
    this.startRealTimeUpdates()
    this.generateHistoricalData()
  }

  private startRealTimeUpdates() {
    this.updateInterval = setInterval(() => {
      this.updatePrices()
      this.updatePortfolio()
    }, 5000) // Update every 5 seconds
  }

  private updatePrices() {
    // Update stock prices
    this.stocksData.forEach(stock => {
      const volatility = this.getVolatility(stock.symbol)
      const change = (Math.random() - 0.5) * volatility
      stock.price = Math.max(0.01, stock.price + change)
      stock.change += change
      stock.changePercent = (stock.change / (stock.price - stock.change)) * 100

      // Update volume
      stock.volume += Math.floor((Math.random() - 0.5) * 1000000)
    })

    // Update crypto prices
    this.cryptoData.forEach(crypto => {
      const volatility = this.getCryptoVolatility(crypto.symbol)
      const change = (Math.random() - 0.5) * volatility
      crypto.price = Math.max(0.00001, crypto.price + change)
      crypto.change += change
      crypto.changePercent = (crypto.change / (crypto.price - crypto.change)) * 100

      // Update volume
      crypto.volume += Math.floor((Math.random() - 0.5) * 10000000)
    })

    this.emit({
      type: 'price-update',
      data: { stocks: this.stocksData, crypto: this.cryptoData },
      timestamp: new Date()
    })
  }

  private updatePortfolio() {
    let totalValue = 0
    let totalDayChange = 0
    let totalUnrealizedPL = 0

    this.portfolioPositions.forEach(position => {
      // Get current price from market data
      const currentData = position.type === 'stock'
        ? this.stocksData.find(s => s.symbol === position.symbol)
        : this.cryptoData.find(c => c.symbol === position.symbol)

      if (currentData) {
        position.currentPrice = currentData.price
        position.value = position.quantity * currentData.price
        position.unrealizedPL = position.value - (position.quantity * position.averagePrice)
        position.unrealizedPLPercent = (position.unrealizedPL / (position.quantity * position.averagePrice)) * 100
        position.dayChange = position.quantity * currentData.change
        position.dayChangePercent = currentData.changePercent

        totalValue += position.value
        totalDayChange += position.dayChange
        totalUnrealizedPL += position.unrealizedPL
      }
    })

    // Update watchlist
    this.watchlistItems.forEach(item => {
      const currentData = item.type === 'stock'
        ? this.stocksData.find(s => s.symbol === item.symbol)
        : this.cryptoData.find(c => c.symbol === item.symbol)

      if (currentData) {
        item.price = currentData.price
        item.change = currentData.change
        item.changePercent = currentData.changePercent
      }
    })

    this.emit({
      type: 'portfolio-update',
      data: {
        positions: this.portfolioPositions,
        summary: {
          totalValue,
          dayChange: totalDayChange,
          dayChangePercent: totalValue > 0 ? (totalDayChange / (totalValue - totalDayChange)) * 100 : 0,
          totalGainLoss: totalUnrealizedPL,
          totalGainLossPercent: totalValue > 0 ? (totalUnrealizedPL / (totalValue - totalUnrealizedPL)) * 100 : 0,
          cash: 6785.34,
          invested: totalValue
        }
      },
      timestamp: new Date()
    })
  }

  private getVolatility(symbol: string): number {
    const volatilityMap: Record<string, number> = {
      'AAPL': 2.5,
      'TSLA': 8.0,
      'GOOGL': 3.0,
      'MSFT': 2.0,
      'AMZN': 4.0,
      'NVDA': 6.0,
      'META': 5.0
    }
    return volatilityMap[symbol] || 3.0
  }

  private getCryptoVolatility(symbol: string): number {
    const volatilityMap: Record<string, number> = {
      'BTC': 500,
      'ETH': 80,
      'BNB': 15,
      'ADA': 0.02,
      'SOL': 5.0
    }
    return volatilityMap[symbol] || 50
  }

  private generateHistoricalData() {
    const symbols = [...this.stocksData.map(s => s.symbol), ...this.cryptoData.map(c => c.symbol)]

    symbols.forEach(symbol => {
      const history: PriceHistory[] = []
      const data = [...this.stocksData, ...this.cryptoData].find(item => item.symbol === symbol)
      let price = data?.price || 100

      // Generate 30 days of historical data
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)

        const change = (Math.random() - 0.5) * (this.getVolatility(symbol) || 5)
        price = Math.max(0.01, price + change)

        history.push({
          timestamp: date,
          price,
          volume: Math.floor(Math.random() * 10000000) + 1000000
        })
      }

      this.priceHistory.set(symbol, history)
    })
  }

  // Public API methods
  getStocks(): Stock[] {
    return [...this.stocksData]
  }

  getCrypto(): CryptoAsset[] {
    return [...this.cryptoData]
  }

  getPortfolio(): PortfolioPosition[] {
    return [...this.portfolioPositions]
  }

  getWatchlist(): WatchlistItem[] {
    return [...this.watchlistItems]
  }

  getPortfolioSummary(): PortfolioSummary {
    const totalValue = this.portfolioPositions.reduce((sum, pos) => sum + pos.value, 0)
    const totalDayChange = this.portfolioPositions.reduce((sum, pos) => sum + pos.dayChange, 0)
    const totalUnrealizedPL = this.portfolioPositions.reduce((sum, pos) => sum + pos.unrealizedPL, 0)

    return {
      totalValue,
      dayChange: totalDayChange,
      dayChangePercent: totalValue > 0 ? (totalDayChange / (totalValue - totalDayChange)) * 100 : 0,
      totalGainLoss: totalUnrealizedPL,
      totalGainLossPercent: totalValue > 0 ? (totalUnrealizedPL / (totalValue - totalUnrealizedPL)) * 100 : 0,
      cash: 6785.34,
      invested: totalValue
    }
  }

  getPriceHistory(symbol: string, days = 30): PriceHistory[] {
    const history = this.priceHistory.get(symbol) || []
    return history.slice(-days)
  }

  getTopGainers(): (Stock | CryptoAsset)[] {
    return [...this.stocksData, ...this.cryptoData]
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 10)
  }

  getTopLosers(): (Stock | CryptoAsset)[] {
    return [...this.stocksData, ...this.cryptoData]
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 10)
  }

  addToWatchlist(symbol: string, name: string, type: 'stock' | 'crypto') {
    const existing = this.watchlistItems.find(item => item.symbol === symbol)
    if (existing) return false

    const marketData = type === 'stock'
      ? this.stocksData.find(s => s.symbol === symbol)
      : this.cryptoData.find(c => c.symbol === symbol)

    if (marketData) {
      this.watchlistItems.push({
        symbol,
        name,
        type,
        price: marketData.price,
        change: marketData.change,
        changePercent: marketData.changePercent,
        addedDate: new Date()
      })

      this.emit({
        type: 'watchlist-update',
        data: this.watchlistItems,
        timestamp: new Date()
      })

      return true
    }
    return false
  }

  removeFromWatchlist(symbol: string) {
    const index = this.watchlistItems.findIndex(item => item.symbol === symbol)
    if (index !== -1) {
      this.watchlistItems.splice(index, 1)
      this.emit({
        type: 'watchlist-update',
        data: this.watchlistItems,
        timestamp: new Date()
      })
      return true
    }
    return false
  }

  // Event system
  onEvent(listener: (event: MarketEvent) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(event: MarketEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in financial markets event listener:', error)
      }
    })
  }

  dispose() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    this.listeners.clear()
    this.priceHistory.clear()
  }
}

export const financialMarketsService = new FinancialMarketsService()
