"use client"

import { useState } from "react"
import {
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Activity,
  Target,
  RefreshCw,
  Plus,
  Minus,
  X,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { OrderType, OrderSide, TradingOrder, Trade, TradingPosition } from "@/lib/trading-system"

interface TradingInterfaceProps {
  onPlaceOrder: (orderData: {
    symbol: string
    name: string
    type: OrderType
    side: OrderSide
    quantity: number
    price?: number
  }) => Promise<{ success: boolean; error?: string }>
  onCancelOrder: (orderId: string) => Promise<{ success: boolean }>
  orders: TradingOrder[]
  trades: Trade[]
  positions: TradingPosition[]
  account: any
  isPlacingOrder: boolean
}

export function TradingInterface({
  onPlaceOrder,
  onCancelOrder,
  orders,
  trades,
  positions,
  account,
  isPlacingOrder
}: TradingInterfaceProps) {
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<{ symbol: string; name: string; price: number } | null>(null)
  const [orderForm, setOrderForm] = useState({
    type: 'market' as OrderType,
    side: 'buy' as OrderSide,
    quantity: 1,
    price: 0
  })

  const handleOrderSubmit = async () => {
    if (!selectedAsset) return

    const result = await onPlaceOrder({
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      type: orderForm.type,
      side: orderForm.side,
      quantity: orderForm.quantity,
      price: orderForm.type === 'limit' ? orderForm.price : undefined
    })

    if (result.success) {
      setIsOrderDialogOpen(false)
      setOrderForm({ type: 'market', side: 'buy', quantity: 1, price: 0 })
      setSelectedAsset(null)
    }
  }

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'filled':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'cancelled':
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="space-y-6">
      {/* Account Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Trading Account</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Equity</p>
              <p className="text-lg font-semibold">{formatCurrency(account?.totalEquity || 0)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Available Cash</p>
              <p className="text-lg font-semibold">{formatCurrency(account?.availableBalance || 0)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Buying Power</p>
              <p className="text-lg font-semibold">{formatCurrency(account?.buyingPower || 0)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Day P&L</p>
              <p className={`text-lg font-semibold ${(account?.unrealizedPL || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {account?.unrealizedPL >= 0 ? '+' : ''}{formatCurrency(account?.unrealizedPL || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Trade Button */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="w-full">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Place New Order
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Place Order</DialogTitle>
            <DialogDescription>
              Enter order details below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Asset Selection */}
            <div className="space-y-2">
              <Label>Asset</Label>
              <Input
                placeholder="Enter symbol (e.g., AAPL, BTC)"
                onBlur={(e) => {
                  const symbol = e.target.value.toUpperCase()
                  if (symbol) {
                    setSelectedAsset({
                      symbol,
                      name: symbol,
                      price: 100 // Would get from real API
                    })
                  }
                }}
              />
              {selectedAsset && (
                <div className="text-sm text-muted-foreground">
                  Selected: {selectedAsset.symbol} - ${selectedAsset.price}
                </div>
              )}
            </div>

            {/* Order Type */}
            <div className="space-y-2">
              <Label>Order Type</Label>
              <Select value={orderForm.type} onValueChange={(value: OrderType) => setOrderForm(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
                  <SelectItem value="stop">Stop</SelectItem>
                  <SelectItem value="stop-limit">Stop Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Buy/Sell */}
            <div className="space-y-2">
              <Label>Side</Label>
              <div className="flex space-x-2">
                <Button
                  variant={orderForm.side === 'buy' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setOrderForm(prev => ({ ...prev, side: 'buy' }))}
                >
                  Buy
                </Button>
                <Button
                  variant={orderForm.side === 'sell' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setOrderForm(prev => ({ ...prev, side: 'sell' }))}
                >
                  Sell
                </Button>
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label>Quantity</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setOrderForm(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, quantity: Math.max(1, Number.parseInt(e.target.value) || 1) }))}
                  className="text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setOrderForm(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Price (for limit orders) */}
            {(orderForm.type === 'limit' || orderForm.type === 'stop-limit') && (
              <div className="space-y-2">
                <Label>Limit Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={orderForm.price}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))}
                  placeholder="Enter limit price"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleOrderSubmit} disabled={!selectedAsset || isPlacingOrder}>
              {isPlacingOrder ? 'Placing...' : `Place ${orderForm.side.toUpperCase()} Order`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Orders and Trades Tabs */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="trades">Trade History</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Orders</CardTitle>
              <CardDescription>
                Your current and recent orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No orders yet. Place your first order above.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Side</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 10).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getOrderStatusIcon(order.status)}
                            <Badge variant={order.status === 'filled' ? 'default' : order.status === 'pending' ? 'secondary' : 'destructive'}>
                              {order.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{order.symbol}</TableCell>
                        <TableCell>{order.type}</TableCell>
                        <TableCell>
                          <Badge variant={order.side === 'buy' ? 'default' : 'secondary'}>
                            {order.side.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>
                          {order.type === 'market' ? 'Market' : formatCurrency(order.price || 0)}
                        </TableCell>
                        <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                        <TableCell>
                          {order.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onCancelOrder(order.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trade History</CardTitle>
              <CardDescription>
                Your executed trades
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No trades yet. Your executed orders will appear here.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Side</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Fees</TableHead>
                      <TableHead>Executed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trades.slice(0, 10).map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell className="font-medium">{trade.symbol}</TableCell>
                        <TableCell>
                          <Badge variant={trade.side === 'buy' ? 'default' : 'secondary'}>
                            {trade.side.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{trade.quantity}</TableCell>
                        <TableCell>{formatCurrency(trade.price)}</TableCell>
                        <TableCell>{formatCurrency(trade.value)}</TableCell>
                        <TableCell>{formatCurrency(trade.fees)}</TableCell>
                        <TableCell>{formatDateTime(trade.executedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Positions</CardTitle>
              <CardDescription>
                Your open positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {positions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No positions. Buy some assets to start trading.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Avg Price</TableHead>
                      <TableHead>Current Price</TableHead>
                      <TableHead>Market Value</TableHead>
                      <TableHead>P&L</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.map((position) => (
                      <TableRow key={position.symbol}>
                        <TableCell className="font-medium">{position.symbol}</TableCell>
                        <TableCell>{position.quantity}</TableCell>
                        <TableCell>{formatCurrency(position.averagePrice)}</TableCell>
                        <TableCell>{formatCurrency(position.currentPrice)}</TableCell>
                        <TableCell>{formatCurrency(position.marketValue)}</TableCell>
                        <TableCell>
                          <div className={position.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {position.unrealizedPL >= 0 ? '+' : ''}{formatCurrency(position.unrealizedPL)}
                            <div className="text-xs">
                              ({position.unrealizedPLPercent >= 0 ? '+' : ''}{position.unrealizedPLPercent.toFixed(2)}%)
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => {
                                setSelectedAsset({ symbol: position.symbol, name: position.name, price: position.currentPrice })
                                setOrderForm(prev => ({ ...prev, side: 'sell', quantity: position.quantity }))
                                setIsOrderDialogOpen(true)
                              }}>
                                Sell Position
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedAsset({ symbol: position.symbol, name: position.name, price: position.currentPrice })
                                setOrderForm(prev => ({ ...prev, side: 'buy', quantity: 1 }))
                                setIsOrderDialogOpen(true)
                              }}>
                                Add to Position
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
