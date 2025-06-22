// Trading System - Order placement, trade history, and portfolio management

export type OrderType = 'market' | 'limit' | 'stop' | 'stop-limit'
export type OrderSide = 'buy' | 'sell'
export type OrderStatus = 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'expired'

export interface TradingOrder {
  id: string
  symbol: string
  name: string
  type: OrderType
  side: OrderSide
  quantity: number
  price?: number // For limit orders
  stopPrice?: number // For stop orders
  limitPrice?: number // For stop-limit orders
  status: OrderStatus
  filledQuantity: number
  averageFillPrice: number
  totalValue: number
  fees: number
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

export interface Trade {
  id: string
  orderId: string
  symbol: string
  name: string
  side: OrderSide
  quantity: number
  price: number
  value: number
  fees: number
  executedAt: Date
}

export interface TradingAccount {
  balance: number
  availableBalance: number
  totalEquity: number
  buyingPower: number
  dayTradingBuyingPower: number
  marginUsed: number
  unrealizedPL: number
  realizedPL: number
  totalFees: number
}

export interface TradingPosition {
  symbol: string
  name: string
  quantity: number
  averagePrice: number
  currentPrice: number
  marketValue: number
  unrealizedPL: number
  unrealizedPLPercent: number
  dayChange: number
  dayChangePercent: number
  side: 'long' | 'short'
}

export interface TradingStats {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  averageWin: number
  averageLoss: number
  profitFactor: number
  totalReturn: number
  totalReturnPercent: number
  maxDrawdown: number
  sharpeRatio: number
}

export type TradingEventType =
  | 'order-placed'
  | 'order-filled'
  | 'order-cancelled'
  | 'position-opened'
  | 'position-closed'
  | 'balance-updated'
  | 'margin-call'

export interface TradingEvent {
  type: TradingEventType
  data: any
  timestamp: Date
}

class TradingSystemService {
  private orders: Map<string, TradingOrder> = new Map()
  private trades: Map<string, Trade> = new Map()
  private positions: Map<string, TradingPosition> = new Map()
  private listeners: Set<(event: TradingEvent) => void> = new Set()

  private account: TradingAccount = {
    balance: 50000, // Starting with $50k
    availableBalance: 50000,
    totalEquity: 50000,
    buyingPower: 200000, // 4:1 margin
    dayTradingBuyingPower: 200000,
    marginUsed: 0,
    unrealizedPL: 0,
    realizedPL: 0,
    totalFees: 0
  }

  // Fee structure
  private readonly COMMISSION_RATE = 0.005 // 0.5% per trade
  private readonly MIN_COMMISSION = 1.0 // Minimum $1
  private readonly MAX_COMMISSION = 10.0 // Maximum $10

  // Initialize with some sample data
  constructor() {
    this.initializeSampleData()
  }

  private initializeSampleData() {
    // Add some historical trades
    const sampleTrades: Trade[] = [
      {
        id: 'trade-1',
        orderId: 'order-1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        side: 'buy',
        quantity: 10,
        price: 150.50,
        value: 1505,
        fees: 7.53,
        executedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        id: 'trade-2',
        orderId: 'order-2',
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        side: 'buy',
        quantity: 5,
        price: 240.00,
        value: 1200,
        fees: 6.00,
        executedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        id: 'trade-3',
        orderId: 'order-3',
        symbol: 'BTC',
        name: 'Bitcoin',
        side: 'buy',
        quantity: 0.5,
        price: 42000,
        value: 21000,
        fees: 10.00,
        executedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ]

    sampleTrades.forEach(trade => {
      this.trades.set(trade.id, trade)
    })

    // Update account balance
    const totalSpent = sampleTrades.reduce((sum, trade) => sum + trade.value + trade.fees, 0)
    this.account.balance -= totalSpent
    this.account.availableBalance = this.account.balance
    this.account.totalFees = sampleTrades.reduce((sum, trade) => sum + trade.fees, 0)
  }

  // Place a new order
  async placeOrder(orderData: {
    symbol: string
    name: string
    type: OrderType
    side: OrderSide
    quantity: number
    price?: number
    stopPrice?: number
    limitPrice?: number
    timeInForce?: 'GTC' | 'DAY' | 'IOC' | 'FOK'
  }): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      // Validate order
      const validation = this.validateOrder(orderData)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const order: TradingOrder = {
        id: orderId,
        symbol: orderData.symbol,
        name: orderData.name,
        type: orderData.type,
        side: orderData.side,
        quantity: orderData.quantity,
        price: orderData.price,
        stopPrice: orderData.stopPrice,
        limitPrice: orderData.limitPrice,
        status: 'pending',
        filledQuantity: 0,
        averageFillPrice: 0,
        totalValue: 0,
        fees: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: orderData.timeInForce === 'DAY' ?
          new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined
      }

      this.orders.set(orderId, order)

      // Emit order placed event
      this.emit({
        type: 'order-placed',
        data: order,
        timestamp: new Date()
      })

      // For market orders, execute immediately
      if (orderData.type === 'market') {
        setTimeout(() => this.executeOrder(orderId), 1000) // Simulate 1 second delay
      } else {
        // For limit orders, check if they can be filled immediately
        setTimeout(() => this.checkLimitOrders(), 2000)
      }

      return { success: true, orderId }
    } catch (error) {
      console.error('Error placing order:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private validateOrder(orderData: any): { valid: boolean; error?: string } {
    // Check if we have enough buying power
    const estimatedValue = orderData.quantity * (orderData.price || 100) // Estimate with current price

    if (orderData.side === 'buy') {
      if (estimatedValue > this.account.availableBalance) {
        return { valid: false, error: 'Insufficient buying power' }
      }
    } else {
      // Check if we have the position to sell
      const position = this.positions.get(orderData.symbol)
      if (!position || position.quantity < orderData.quantity) {
        return { valid: false, error: 'Insufficient position to sell' }
      }
    }

    // Validate order parameters
    if (orderData.quantity <= 0) {
      return { valid: false, error: 'Quantity must be positive' }
    }

    if ((orderData.type === 'limit' || orderData.type === 'stop-limit') && !orderData.price) {
      return { valid: false, error: 'Limit price required for limit orders' }
    }

    if ((orderData.type === 'stop' || orderData.type === 'stop-limit') && !orderData.stopPrice) {
      return { valid: false, error: 'Stop price required for stop orders' }
    }

    return { valid: true }
  }

  private async executeOrder(orderId: string) {
    const order = this.orders.get(orderId)
    if (!order || order.status !== 'pending') return

    try {
      // Simulate getting current market price
      const currentPrice = await this.getCurrentPrice(order.symbol)
      const executionPrice = order.type === 'market' ? currentPrice : (order.price || currentPrice)

      // Calculate fees
      const tradeValue = order.quantity * executionPrice
      const fees = Math.max(
        Math.min(tradeValue * this.COMMISSION_RATE, this.MAX_COMMISSION),
        this.MIN_COMMISSION
      )

      // Create trade record
      const tradeId = `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const trade: Trade = {
        id: tradeId,
        orderId: order.id,
        symbol: order.symbol,
        name: order.name,
        side: order.side,
        quantity: order.quantity,
        price: executionPrice,
        value: tradeValue,
        fees,
        executedAt: new Date()
      }

      this.trades.set(tradeId, trade)

      // Update order status
      order.status = 'filled'
      order.filledQuantity = order.quantity
      order.averageFillPrice = executionPrice
      order.totalValue = tradeValue
      order.fees = fees
      order.updatedAt = new Date()

      // Update account and positions
      this.updateAccountAndPositions(trade)

      // Emit events
      this.emit({
        type: 'order-filled',
        data: { order, trade },
        timestamp: new Date()
      })

    } catch (error) {
      console.error('Error executing order:', error)
      order.status = 'cancelled'
      order.updatedAt = new Date()
    }
  }

  private async getCurrentPrice(symbol: string): Promise<number> {
    // In a real system, this would fetch from the market API
    // For now, simulate with random price movements
    const basePrices: Record<string, number> = {
      'AAPL': 173.50,
      'TSLA': 248.42,
      'GOOGL': 2750.80,
      'MSFT': 338.45,
      'AMZN': 3247.15,
      'BTC': 43250,
      'ETH': 2950,
      'BNB': 315.80
    }

    const basePrice = basePrices[symbol] || 100
    const variation = (Math.random() - 0.5) * 0.02 // ±1% variation
    return basePrice * (1 + variation)
  }

  private updateAccountAndPositions(trade: Trade) {
    if (trade.side === 'buy') {
      // Deduct from available balance
      this.account.availableBalance -= (trade.value + trade.fees)
      this.account.totalFees += trade.fees

      // Update or create position
      const existingPosition = this.positions.get(trade.symbol)
      if (existingPosition) {
        const totalCost = (existingPosition.quantity * existingPosition.averagePrice) + trade.value
        const totalQuantity = existingPosition.quantity + trade.quantity

        existingPosition.averagePrice = totalCost / totalQuantity
        existingPosition.quantity = totalQuantity
      } else {
        this.positions.set(trade.symbol, {
          symbol: trade.symbol,
          name: trade.name,
          quantity: trade.quantity,
          averagePrice: trade.price,
          currentPrice: trade.price,
          marketValue: trade.value,
          unrealizedPL: 0,
          unrealizedPLPercent: 0,
          dayChange: 0,
          dayChangePercent: 0,
          side: 'long'
        })
      }

      this.emit({
        type: 'position-opened',
        data: this.positions.get(trade.symbol),
        timestamp: new Date()
      })

    } else {
      // Add to available balance
      this.account.availableBalance += (trade.value - trade.fees)
      this.account.totalFees += trade.fees
      this.account.realizedPL += this.calculateRealizedPL(trade)

      // Update position
      const position = this.positions.get(trade.symbol)
      if (position) {
        position.quantity -= trade.quantity
        if (position.quantity <= 0) {
          this.positions.delete(trade.symbol)
          this.emit({
            type: 'position-closed',
            data: { symbol: trade.symbol, finalPL: this.calculateRealizedPL(trade) },
            timestamp: new Date()
          })
        }
      }
    }

    // Update total equity
    this.updateAccountTotals()

    this.emit({
      type: 'balance-updated',
      data: this.account,
      timestamp: new Date()
    })
  }

  private calculateRealizedPL(trade: Trade): number {
    const position = this.positions.get(trade.symbol)
    if (!position || trade.side === 'buy') return 0

    return (trade.price - position.averagePrice) * trade.quantity
  }

  private updateAccountTotals() {
    const totalPositionValue = Array.from(this.positions.values())
      .reduce((sum, pos) => sum + pos.marketValue, 0)

    this.account.totalEquity = this.account.balance + totalPositionValue
    this.account.unrealizedPL = Array.from(this.positions.values())
      .reduce((sum, pos) => sum + pos.unrealizedPL, 0)
  }

  private checkLimitOrders() {
    // Check if any pending limit orders can be executed
    for (const [orderId, order] of this.orders) {
      if (order.status === 'pending' && order.type === 'limit') {
        // Simulate price checking - in real system would check against market data
        const shouldExecute = Math.random() > 0.7 // 30% chance to execute
        if (shouldExecute) {
          this.executeOrder(orderId)
        }
      }
    }
  }

  // Cancel an order
  async cancelOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    const order = this.orders.get(orderId)
    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    if (order.status !== 'pending') {
      return { success: false, error: 'Order cannot be cancelled' }
    }

    order.status = 'cancelled'
    order.updatedAt = new Date()

    this.emit({
      type: 'order-cancelled',
      data: order,
      timestamp: new Date()
    })

    return { success: true }
  }

  // Get all orders
  getOrders(): TradingOrder[] {
    return Array.from(this.orders.values()).sort((a, b) =>
      b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  // Get orders by status
  getOrdersByStatus(status: OrderStatus): TradingOrder[] {
    return this.getOrders().filter(order => order.status === status)
  }

  // Get all trades
  getTrades(): Trade[] {
    return Array.from(this.trades.values()).sort((a, b) =>
      b.executedAt.getTime() - a.executedAt.getTime()
    )
  }

  // Get trades for a specific symbol
  getTradesBySymbol(symbol: string): Trade[] {
    return this.getTrades().filter(trade => trade.symbol === symbol)
  }

  // Get current positions
  getPositions(): TradingPosition[] {
    return Array.from(this.positions.values())
  }

  // Get account information
  getAccount(): TradingAccount {
    return { ...this.account }
  }

  // Calculate trading statistics
  getTradingStats(): TradingStats {
    const trades = this.getTrades()
    const totalTrades = trades.length

    if (totalTrades === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        averageWin: 0,
        averageLoss: 0,
        profitFactor: 0,
        totalReturn: 0,
        totalReturnPercent: 0,
        maxDrawdown: 0,
        sharpeRatio: 0
      }
    }

    const winningTrades = trades.filter(trade => {
      const position = this.positions.get(trade.symbol)
      if (trade.side === 'sell' && position) {
        return (trade.price - position.averagePrice) > 0
      }
      return false
    }).length

    const losingTrades = totalTrades - winningTrades
    const winRate = (winningTrades / totalTrades) * 100

    const totalValue = trades.reduce((sum, trade) => sum + trade.value, 0)
    const totalFees = trades.reduce((sum, trade) => sum + trade.fees, 0)
    const netReturn = this.account.realizedPL + this.account.unrealizedPL - totalFees

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      averageWin: winningTrades > 0 ? netReturn / winningTrades : 0,
      averageLoss: losingTrades > 0 ? Math.abs(netReturn) / losingTrades : 0,
      profitFactor: losingTrades > 0 ? Math.abs(netReturn / losingTrades) : 0,
      totalReturn: netReturn,
      totalReturnPercent: (netReturn / 50000) * 100, // Based on initial capital
      maxDrawdown: Math.min(0, netReturn), // Simplified calculation
      sharpeRatio: 1.2 // Simplified calculation
    }
  }

  // Event system
  onEvent(listener: (event: TradingEvent) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(event: TradingEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in trading event listener:', error)
      }
    })
  }

  // Update position prices (call this when market prices change)
  updatePositionPrices(prices: Record<string, number>) {
    for (const [symbol, position] of this.positions) {
      const newPrice = prices[symbol]
      if (newPrice) {
        position.currentPrice = newPrice
        position.marketValue = position.quantity * newPrice
        position.unrealizedPL = position.marketValue - (position.quantity * position.averagePrice)
        position.unrealizedPLPercent = (position.unrealizedPL / (position.quantity * position.averagePrice)) * 100

        // Calculate day change (simplified)
        const dayChange = newPrice - position.averagePrice
        position.dayChange = dayChange * position.quantity
        position.dayChangePercent = (dayChange / position.averagePrice) * 100
      }
    }

    this.updateAccountTotals()
  }

  dispose() {
    this.listeners.clear()
    this.orders.clear()
    this.trades.clear()
    this.positions.clear()
  }
}

export const tradingSystemService = new TradingSystemService()
