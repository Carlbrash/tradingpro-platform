// Live Market Data API Service - Real-time integration with CoinGecko and other providers

export interface LiveMarketData {
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  marketCap: number
  sparklineData: number[]
  lastUpdated: Date
  source: 'coingecko' | 'binance' | 'mock'
}

export interface APIConfig {
  baseURL: string
  rateLimitMs: number
  maxRetries: number
  timeout: number
}

class LiveMarketAPIService {
  private readonly COINGECKO_CONFIG: APIConfig = {
    baseURL: 'https://api.coingecko.com/api/v3',
    rateLimitMs: 6000, // 10 calls per minute (free tier)
    maxRetries: 3,
    timeout: 10000
  }

  // Cache to prevent excessive API calls
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private lastApiCall = 0
  private rateLimitQueue: Array<() => void> = []
  private isProcessingQueue = false

  // Asset mapping for different sources
  private readonly ASSET_MAPPING = {
    'BTC': { coingecko: 'bitcoin', symbol: 'BTC', type: 'crypto' },
    'ETH': { coingecko: 'ethereum', symbol: 'ETH', type: 'crypto' },
    'SOL': { coingecko: 'solana', symbol: 'SOL', type: 'crypto' },
    'TRX': { coingecko: 'tron', symbol: 'TRX', type: 'crypto' },
    'ADA': { coingecko: 'cardano', symbol: 'ADA', type: 'crypto' },
    'DOT': { coingecko: 'polkadot', symbol: 'DOT', type: 'crypto' },
    'MATIC': { coingecko: 'matic-network', symbol: 'MATIC', type: 'crypto' },
    'DOGE': { coingecko: 'dogecoin', symbol: 'DOGE', type: 'crypto' },
    'LTC': { coingecko: 'litecoin', symbol: 'LTC', type: 'crypto' },
    'LINK': { coingecko: 'chainlink', symbol: 'LINK', type: 'crypto' }
  } as const

  // Rate limiting helper
  private async rateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastCall = now - this.lastApiCall

    if (timeSinceLastCall < this.COINGECKO_CONFIG.rateLimitMs) {
      const waitTime = this.COINGECKO_CONFIG.rateLimitMs - timeSinceLastCall
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    this.lastApiCall = Date.now()
  }

  // Enhanced fetch with timeout and retry logic
  private async fetchWithRetry(url: string, options: RequestInit = {}): Promise<any> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.COINGECKO_CONFIG.timeout)

    for (let attempt = 1; attempt <= this.COINGECKO_CONFIG.maxRetries; attempt++) {
      try {
        await this.rateLimit()

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'AdminDashboard/1.0',
            ...options.headers
          }
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          // Handle rate limiting
          if (response.status === 429) {
            const retryAfter = Number.parseInt(response.headers.get('Retry-After') || '60')
            console.warn(`Rate limited, waiting ${retryAfter}s before retry`)
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
            continue
          }

          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        return data
      } catch (error) {
        console.warn(`API call attempt ${attempt}/${this.COINGECKO_CONFIG.maxRetries} failed:`, error)

        if (attempt === this.COINGECKO_CONFIG.maxRetries) {
          throw error
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  // Get live crypto data from CoinGecko
  async getLiveCryptoData(symbols: string[] = ['BTC', 'ETH', 'SOL', 'TRX', 'ADA']): Promise<LiveMarketData[]> {
    try {
      // Map symbols to CoinGecko IDs
      const coinIds = symbols
        .map(symbol => this.ASSET_MAPPING[symbol as keyof typeof this.ASSET_MAPPING]?.coingecko)
        .filter(Boolean)

      if (coinIds.length === 0) {
        throw new Error('No valid symbols provided')
      }

      // Check cache first
      const cacheKey = `crypto-${coinIds.join(',')}`
      const cached = this.cache.get(cacheKey)
      const now = Date.now()

      if (cached && (now - cached.timestamp) < 30000) { // 30 second cache
        return this.formatCryptoData(cached.data, symbols)
      }

      // Fetch current prices and market data
      const pricesUrl = `${this.COINGECKO_CONFIG.baseURL}/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&include_last_updated_at=true`

      const pricesData = await this.fetchWithRetry(pricesUrl)

      // Fetch detailed coin data for sparklines and additional info
      const coinsUrl = `${this.COINGECKO_CONFIG.baseURL}/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h`

      const coinsData = await this.fetchWithRetry(coinsUrl)

      // Combine data
      const combinedData = { prices: pricesData, coins: coinsData }

      // Cache the result
      this.cache.set(cacheKey, { data: combinedData, timestamp: now })

      return this.formatCryptoData(combinedData, symbols)
    } catch (error) {
      console.error('Error fetching live crypto data:', error)

      // Return cached data if available, even if expired
      const cacheKey = `crypto-${symbols.join(',')}`
      const cached = this.cache.get(cacheKey)
      if (cached) {
        console.warn('Using expired cache due to API error')
        return this.formatCryptoData(cached.data, symbols)
      }

      // Fallback to mock data
      return this.getMockCryptoData(symbols)
    }
  }

  // Format and normalize crypto data
  private formatCryptoData(data: any, requestedSymbols: string[]): LiveMarketData[] {
    const { prices, coins } = data

    return requestedSymbols.map(symbol => {
      const mapping = this.ASSET_MAPPING[symbol as keyof typeof this.ASSET_MAPPING]
      if (!mapping) {
        return this.getMockDataForSymbol(symbol)
      }

      const priceData = prices?.[mapping.coingecko]
      const coinData = coins?.find((coin: any) => coin.id === mapping.coingecko)

      if (!priceData || !coinData) {
        return this.getMockDataForSymbol(symbol)
      }

      // Process sparkline data (last 7 days)
      const sparklineData = coinData.sparkline_in_7d?.price || []
      const processedSparkline = this.processSparklineData(sparklineData)

      return {
        symbol: symbol,
        name: coinData.name || mapping.symbol,
        price: priceData.usd || coinData.current_price || 0,
        change24h: priceData.usd_24h_change || coinData.price_change_24h || 0,
        changePercent24h: priceData.usd_24h_change || coinData.price_change_percentage_24h || 0,
        volume24h: priceData.usd_24h_vol || coinData.total_volume || 0,
        marketCap: priceData.usd_market_cap || coinData.market_cap || 0,
        sparklineData: processedSparkline,
        lastUpdated: new Date(priceData.last_updated_at ? priceData.last_updated_at * 1000 : Date.now()),
        source: 'coingecko'
      }
    })
  }

  // Process sparkline data to appropriate length and format
  private processSparklineData(rawSparkline: number[]): number[] {
    if (!rawSparkline || rawSparkline.length === 0) {
      // Generate default flat line
      return Array(20).fill(100)
    }

    // Take last 20 points or interpolate if needed
    let processedData: number[]

    if (rawSparkline.length >= 20) {
      // Take every nth point to get exactly 20 points
      const step = Math.floor(rawSparkline.length / 20)
      processedData = []
      for (let i = 0; i < 20; i++) {
        const index = Math.min(i * step, rawSparkline.length - 1)
        processedData.push(rawSparkline[index])
      }
    } else {
      // Interpolate to get 20 points
      processedData = this.interpolateArray(rawSparkline, 20)
    }

    // Normalize to percentage change from first value
    const firstValue = processedData[0]
    if (firstValue > 0) {
      processedData = processedData.map(value => ((value / firstValue) - 1) * 100 + 100)
    }

    return processedData
  }

  // Simple linear interpolation
  private interpolateArray(arr: number[], targetLength: number): number[] {
    if (arr.length === 0) return Array(targetLength).fill(100)
    if (arr.length === 1) return Array(targetLength).fill(arr[0])

    const result: number[] = []
    const step = (arr.length - 1) / (targetLength - 1)

    for (let i = 0; i < targetLength; i++) {
      const index = i * step
      const lowerIndex = Math.floor(index)
      const upperIndex = Math.ceil(index)
      const weight = index - lowerIndex

      if (lowerIndex === upperIndex) {
        result.push(arr[lowerIndex])
      } else {
        const interpolated = arr[lowerIndex] * (1 - weight) + arr[upperIndex] * weight
        result.push(interpolated)
      }
    }

    return result
  }

  // Get traditional assets (forex, commodities, indices) with mock data
  async getTraditionalAssetsData(): Promise<LiveMarketData[]> {
    // For now, return mock data for traditional assets
    // In a production app, you'd integrate with financial data providers like Alpha Vantage, Yahoo Finance, etc.
    return [
      {
        symbol: 'DJ30',
        name: 'Dow Jones 30',
        price: 42229.55 + (Math.random() - 0.5) * 100,
        change24h: 245.67 + (Math.random() - 0.5) * 50,
        changePercent24h: 1.11 + (Math.random() - 0.5) * 0.5,
        volume24h: 0,
        marketCap: 0,
        sparklineData: this.generateTrendSparkline(1.11),
        lastUpdated: new Date(),
        source: 'mock'
      },
      {
        symbol: 'EURUSD',
        name: 'EUR/USD',
        price: 1.15172 + (Math.random() - 0.5) * 0.01,
        change24h: 0.002 + (Math.random() - 0.5) * 0.001,
        changePercent24h: 0.17 + (Math.random() - 0.5) * 0.1,
        volume24h: 0,
        marketCap: 0,
        sparklineData: this.generateTrendSparkline(0.17),
        lastUpdated: new Date(),
        source: 'mock'
      },
      {
        symbol: 'OIL',
        name: 'Crude Oil',
        price: 73.99 + (Math.random() - 0.5) * 2,
        change24h: 0.52 + (Math.random() - 0.5) * 1,
        changePercent24h: 0.07 + (Math.random() - 0.5) * 0.5,
        volume24h: 0,
        marketCap: 0,
        sparklineData: this.generateTrendSparkline(0.07),
        lastUpdated: new Date(),
        source: 'mock'
      },
      {
        symbol: 'GOLD',
        name: 'Gold',
        price: 3367.97 + (Math.random() - 0.5) * 20,
        change24h: -2.7 + (Math.random() - 0.5) * 5,
        changePercent24h: -0.08 + (Math.random() - 0.5) * 0.2,
        volume24h: 0,
        marketCap: 0,
        sparklineData: this.generateTrendSparkline(-0.08),
        lastUpdated: new Date(),
        source: 'mock'
      }
    ]
  }

  // Generate trending sparkline data
  private generateTrendSparkline(changePercent: number): number[] {
    const data: number[] = []
    const trend = changePercent > 0 ? 1 : -1
    let value = 100

    for (let i = 0; i < 20; i++) {
      const randomVariation = (Math.random() - 0.5) * 1
      const trendInfluence = (i / 20) * trend * Math.abs(changePercent * 0.3)
      value += randomVariation + trendInfluence
      data.push(Math.max(0, value))
    }

    return data
  }

  // Mock data fallback
  private getMockCryptoData(symbols: string[]): LiveMarketData[] {
    return symbols.map(symbol => this.getMockDataForSymbol(symbol))
  }

  private getMockDataForSymbol(symbol: string): LiveMarketData {
    const mockPrices: Record<string, any> = {
      'BTC': { price: 43250, change: 2.1, name: 'Bitcoin' },
      'ETH': { price: 2239, change: -1.23, name: 'Ethereum' },
      'SOL': { price: 98.45, change: 3.7, name: 'Solana' },
      'TRX': { price: 0.1234, change: -1.2, name: 'Tron' },
      'ADA': { price: 0.45, change: 1.8, name: 'Cardano' },
      'DOT': { price: 7.23, change: -2.1, name: 'Polkadot' },
      'MATIC': { price: 0.92, change: 4.2, name: 'Polygon' },
      'DOGE': { price: 0.08, change: 5.3, name: 'Dogecoin' },
      'LTC': { price: 72.34, change: -0.8, name: 'Litecoin' },
      'LINK': { price: 14.56, change: 2.9, name: 'Chainlink' }
    }

    const mock = mockPrices[symbol] || { price: 1, change: 0, name: symbol }
    const variation = (Math.random() - 0.5) * 0.1
    const price = mock.price * (1 + variation / 100)
    const changePercent = mock.change + (Math.random() - 0.5) * 0.5

    return {
      symbol,
      name: mock.name,
      price,
      change24h: price * (changePercent / 100),
      changePercent24h: changePercent,
      volume24h: Math.random() * 1000000000,
      marketCap: price * Math.random() * 1000000000,
      sparklineData: this.generateTrendSparkline(changePercent),
      lastUpdated: new Date(),
      source: 'mock'
    }
  }

  // Get all market data (crypto + traditional assets)
  async getAllMarketData(): Promise<LiveMarketData[]> {
    try {
      const [cryptoData, traditionalData] = await Promise.all([
        this.getLiveCryptoData(['BTC', 'ETH', 'SOL', 'TRX', 'ADA', 'DOT', 'MATIC']),
        this.getTraditionalAssetsData()
      ])

      return [...traditionalData, ...cryptoData]
    } catch (error) {
      console.error('Error fetching all market data:', error)
      // Return mock data as fallback
      return this.getMockAllData()
    }
  }

  private getMockAllData(): LiveMarketData[] {
    const allSymbols = ['DJ30', 'EURUSD', 'OIL', 'GOLD', 'BTC', 'ETH', 'SOL', 'TRX', 'ADA', 'DOT', 'MATIC']
    return allSymbols.map(symbol => this.getMockDataForSymbol(symbol))
  }

  // Check API health
  async checkAPIHealth(): Promise<{ status: 'healthy' | 'degraded' | 'down', latency: number }> {
    const startTime = Date.now()

    try {
      const response = await this.fetchWithRetry(`${this.COINGECKO_CONFIG.baseURL}/ping`)
      const latency = Date.now() - startTime

      if (response && typeof response === 'object') {
        return { status: 'healthy', latency }
      } else {
        return { status: 'degraded', latency }
      }
    } catch (error) {
      return { status: 'down', latency: Date.now() - startTime }
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[]; oldestEntry: number } {
    let oldestTimestamp = Date.now()

    for (const [, value] of this.cache) {
      if (value.timestamp < oldestTimestamp) {
        oldestTimestamp = value.timestamp
      }
    }

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      oldestEntry: oldestTimestamp
    }
  }
}

export const liveMarketAPI = new LiveMarketAPIService()
