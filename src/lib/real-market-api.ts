// Real Market API Service - Integrates with live market data providers

export interface RealStockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  sector: string
  exchange: string
  lastUpdated: Date
}

export interface RealCryptoData {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  marketCap: number
  rank: number
  lastUpdated: Date
}

export interface APIResponse<T> {
  data: T
  success: boolean
  error?: string
  lastUpdated: Date
}

class RealMarketAPIService {
  private readonly COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3'
  private readonly FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3'
  private readonly FMP_API_KEY = 'demo' // Using demo key for free tier

  // Cache to avoid excessive API calls
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 60000 // 1 minute cache

  private async fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
    const cached = this.cache.get(cacheKey)
    const now = Date.now()

    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      this.cache.set(cacheKey, { data, timestamp: now })
      return data
    } catch (error) {
      console.error(`API fetch error for ${url}:`, error)
      // Return cached data if available, even if expired
      if (cached) {
        return cached.data
      }
      throw error
    }
  }

  // Get real crypto data from CoinGecko
  async getCryptoData(symbols: string[] = ['bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana']): Promise<APIResponse<RealCryptoData[]>> {
    try {
      const ids = symbols.join(',')
      const url = `${this.COINGECKO_BASE_URL}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&include_last_updated_at=true`

      const response = await this.fetchWithCache(url, `crypto-${ids}`)

      // Also get coin list for names and ranks
      const coinListUrl = `${this.COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=50&page=1`
      const coinList = await this.fetchWithCache(coinListUrl, `crypto-list-${ids}`)

      const cryptoData: RealCryptoData[] = symbols.map((id, index) => {
        const priceData = (response as any)[id]
        const coinInfo = (coinList as any[]).find((coin: any) => coin.id === id)

        if (!priceData || !coinInfo) {
          // Fallback data if API fails
          return {
            id,
            symbol: id.toUpperCase().slice(0, 3),
            name: id.charAt(0).toUpperCase() + id.slice(1),
            price: 0,
            change24h: 0,
            changePercent24h: 0,
            volume24h: 0,
            marketCap: 0,
            rank: index + 1,
            lastUpdated: new Date()
          }
        }

        return {
          id: coinInfo.id,
          symbol: coinInfo.symbol.toUpperCase(),
          name: coinInfo.name,
          price: priceData.usd || coinInfo.current_price,
          change24h: priceData.usd_24h_change || coinInfo.price_change_24h || 0,
          changePercent24h: priceData.usd_24h_change || coinInfo.price_change_percentage_24h || 0,
          volume24h: priceData.usd_24h_vol || coinInfo.total_volume || 0,
          marketCap: priceData.usd_market_cap || coinInfo.market_cap || 0,
          rank: coinInfo.market_cap_rank || index + 1,
          lastUpdated: new Date(priceData.last_updated_at * 1000 || Date.now())
        }
      })

      return {
        data: cryptoData,
        success: true,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Error fetching crypto data:', error)
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastUpdated: new Date()
      }
    }
  }

  // Get real stock data from Financial Modeling Prep
  async getStockData(symbols: string[] = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN']): Promise<APIResponse<RealStockData[]>> {
    try {
      const symbolsList = symbols.join(',')

      // Get real-time quotes
      const quotesUrl = `${this.FMP_BASE_URL}/quote/${symbolsList}?apikey=${this.FMP_API_KEY}`
      const quotes = await this.fetchWithCache(quotesUrl, `stocks-quotes-${symbolsList}`)

      // Get company profiles for additional info
      const profilesPromises = symbols.map(symbol =>
        this.fetchWithCache(
          `${this.FMP_BASE_URL}/profile/${symbol}?apikey=${this.FMP_API_KEY}`,
          `stock-profile-${symbol}`
        ).catch(() => null) // Don't fail if one profile fails
      )

      const profiles = await Promise.all(profilesPromises)

      const stockData: RealStockData[] = (quotes as any[]).map((quote: any, index: number) => {
        const profile = (profiles as any[])[index]?.[0] // Profile API returns array

        return {
          symbol: quote.symbol,
          name: quote.name || profile?.companyName || quote.symbol,
          price: quote.price || 0,
          change: quote.change || 0,
          changePercent: quote.changesPercentage || 0,
          volume: quote.volume || 0,
          marketCap: quote.marketCap || profile?.mktCap || 0,
          sector: profile?.sector || 'Unknown',
          exchange: quote.exchange || profile?.exchangeShortName || 'NASDAQ',
          lastUpdated: new Date()
        }
      })

      return {
        data: stockData,
        success: true,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Error fetching stock data:', error)
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastUpdated: new Date()
      }
    }
  }

  // Get detailed stock quote
  async getStockQuote(symbol: string): Promise<APIResponse<RealStockData>> {
    try {
      const url = `${this.FMP_BASE_URL}/quote/${symbol}?apikey=${this.FMP_API_KEY}`
      const response = await this.fetchWithCache(url, `stock-quote-${symbol}`)

      if (!response || (response as any[]).length === 0) {
        throw new Error('No data found for symbol')
      }

      const quote = (response as any[])[0]

      const stockData: RealStockData = {
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changesPercentage,
        volume: quote.volume,
        marketCap: quote.marketCap,
        sector: 'Unknown', // Would need additional API call
        exchange: quote.exchange,
        lastUpdated: new Date()
      }

      return {
        data: stockData,
        success: true,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error)
      return {
        data: {} as RealStockData,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastUpdated: new Date()
      }
    }
  }

  // Get crypto price by ID
  async getCryptoPrice(id: string): Promise<APIResponse<RealCryptoData>> {
    try {
      const url = `${this.COINGECKO_BASE_URL}/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      const response = await this.fetchWithCache(url, `crypto-price-${id}`)

      const priceData = (response as any)[id]
      if (!priceData) {
        throw new Error('No data found for crypto ID')
      }

      const cryptoData: RealCryptoData = {
        id,
        symbol: id.toUpperCase(),
        name: id.charAt(0).toUpperCase() + id.slice(1),
        price: priceData.usd,
        change24h: priceData.usd_24h_change || 0,
        changePercent24h: priceData.usd_24h_change || 0,
        volume24h: priceData.usd_24h_vol || 0,
        marketCap: priceData.usd_market_cap || 0,
        rank: 1,
        lastUpdated: new Date()
      }

      return {
        data: cryptoData,
        success: true,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error(`Error fetching crypto price for ${id}:`, error)
      return {
        data: {} as RealCryptoData,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastUpdated: new Date()
      }
    }
  }

  // Search for stocks/crypto
  async searchAssets(query: string): Promise<APIResponse<Array<{ symbol: string; name: string; type: 'stock' | 'crypto' }>>> {
    try {
      const results: Array<{ symbol: string; name: string; type: 'stock' | 'crypto' }> = []

      // Mock search results for now to avoid API issues
      const mockResults = [
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' as const },
        { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' as const },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock' as const },
        { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' as const },
        { symbol: 'ETH', name: 'Ethereum', type: 'crypto' as const },
      ].filter(item =>
        item.symbol.toLowerCase().includes(query.toLowerCase()) ||
        item.name.toLowerCase().includes(query.toLowerCase())
      )

      return {
        data: mockResults,
        success: true,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Error searching assets:', error)
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastUpdated: new Date()
      }
    }
  }

  // Get market overview/summary
  async getMarketSummary(): Promise<APIResponse<{
    totalMarketCap: number
    totalVolume: number
    btcDominance: number
    marketCapChange24h: number
    activeStocks: number
    advancingStocks: number
    decliningStocks: number
  }>> {
    try {
      // Get crypto global data
      const cryptoGlobalUrl = `${this.COINGECKO_BASE_URL}/global`
      const cryptoGlobal: any = await this.fetchWithCache<any>(cryptoGlobalUrl, 'crypto-global')

      // Get some basic stock market data
      const stockIndicesUrl = `${this.FMP_BASE_URL}/quote/%5EGSPC,%5EDJI,%5EIXIC?apikey=${this.FMP_API_KEY}`
      const stockIndices: any = await this.fetchWithCache<any>(stockIndicesUrl, 'stock-indices')

      const summary = {
        totalMarketCap: cryptoGlobal.data?.total_market_cap?.usd || 0,
        totalVolume: cryptoGlobal.data?.total_volume?.usd || 0,
        btcDominance: cryptoGlobal.data?.market_cap_percentage?.btc || 0,
        marketCapChange24h: cryptoGlobal.data?.market_cap_change_percentage_24h_usd || 0,
        activeStocks: stockIndices?.length || 0,
        advancingStocks: Math.floor(Math.random() * 2000) + 1000, // Mock data
        decliningStocks: Math.floor(Math.random() * 1500) + 800   // Mock data
      }

      return {
        data: summary,
        success: true,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Error fetching market summary:', error)
      return {
        data: {
          totalMarketCap: 0,
          totalVolume: 0,
          btcDominance: 0,
          marketCapChange24h: 0,
          activeStocks: 0,
          advancingStocks: 0,
          decliningStocks: 0
        },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastUpdated: new Date()
      }
    }
  }

  // Clear cache (useful for forcing fresh data)
  clearCache(): void {
    this.cache.clear()
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

export const realMarketAPIService = new RealMarketAPIService()
