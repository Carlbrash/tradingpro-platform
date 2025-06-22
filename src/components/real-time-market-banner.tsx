"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { useLiveMarketData } from "@/hooks/use-live-market-data"
import type { LiveMarketData } from "@/lib/live-market-api"

// Use the LiveMarketData interface directly
type MarketItem = LiveMarketData

// Mini sparkline chart component
const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  try {
    if (!data || data.length === 0) return null

    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 40
      const y = 15 - ((value - min) / range) * 10
      return `${x},${y}`
    }).join(' ')

    return (
      <svg width="40" height="15" className="inline-block ml-2">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1"
          className="opacity-80"
        />
      </svg>
    )
  } catch (error) {
    console.warn('Error rendering sparkline:', error)
    return (
      <div className="inline-block ml-2 w-10 h-4 bg-slate-700 rounded opacity-50"></div>
    )
  }
}

export function RealTimeMarketBanner() {
  const [stylesInjected, setStylesInjected] = useState(false)

  // Use the custom hook for market data
  const {
    data: marketData,
    isLoading,
    hasError,
    apiStatus,
    lastUpdated,
    retryCount,
    refresh,
    liveDataCount,
    mockDataCount,
    isStale
  } = useLiveMarketData({
    updateInterval: 120000, // 2 minutes
    autoStart: true
  })

  // Inject marquee CSS styles safely
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    try {
      // Check if styles are already injected
      if (document.getElementById('market-banner-styles')) {
        setStylesInjected(true)
        return
      }

      const style = document.createElement('style')
      style.id = 'market-banner-styles'
      style.textContent = `
        @keyframes market-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .market-banner-scroll {
          animation: market-marquee 45s linear infinite;
          will-change: transform;
        }

        .market-banner-scroll:hover {
          animation-play-state: paused;
        }

        .market-banner-loading {
          animation: market-marquee 45s linear infinite;
          opacity: 0.7;
        }
      `

      document.head.appendChild(style)
      setStylesInjected(true)
      console.log('Market banner styles injected successfully')
    } catch (error) {
      console.warn('Failed to inject market banner styles:', error)
      setStylesInjected(false)
    }

    // Cleanup function
    return () => {
      try {
        const existingStyle = document.getElementById('market-banner-styles')
        if (existingStyle && existingStyle.parentNode) {
          existingStyle.parentNode.removeChild(existingStyle)
        }
      } catch (error) {
        console.warn('Error removing market banner styles:', error)
      }
    }
  }, [])

  // Get status icon based on API health and loading state
  const getStatusIcon = () => {
    if (isLoading) {
      return <RefreshCw className="h-3 w-3 animate-spin text-blue-400" />
    }

    switch (apiStatus) {
      case 'healthy':
        return <Wifi className="h-3 w-3 text-green-400" />
      case 'degraded':
        return <Wifi className="h-3 w-3 text-yellow-400" />
      case 'down':
        return <WifiOff className="h-3 w-3 text-red-400" />
      default:
        return <Wifi className="h-3 w-3 text-gray-400" />
    }
  }

  // Error fallback
  if (hasError && marketData.length === 0) {
    return (
      <div className="bg-slate-900 border-b border-slate-700 py-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-slate-400 text-sm flex items-center space-x-2">
              <WifiOff className="h-4 w-4 text-red-400" />
              <span>Market data temporarily unavailable</span>
              {retryCount > 0 && (
                <span className="text-xs text-slate-500">({retryCount} retries)</span>
              )}
            </div>
            <div className="flex space-x-4">
              {['BTC', 'ETH', 'SOL', 'TRX'].map((symbol) => (
                <div key={symbol} className="text-slate-400 text-sm">
                  {symbol}: ---
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 border border-slate-600 rounded hover:border-slate-500 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Retry'}
          </button>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading && marketData.length === 0) {
    return (
      <div className="bg-slate-900 border-b border-slate-700 py-4 overflow-hidden relative">
        <div className="flex items-center justify-center space-x-4 py-8">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-400" />
          <span className="text-slate-400 text-sm">Loading live market data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 border-b border-slate-700 py-4 overflow-hidden relative">
      <div
        className={`flex whitespace-nowrap ${
          stylesInjected
            ? (isLoading ? 'market-banner-loading' : 'market-banner-scroll')
            : ''
        }`}
        style={{
          width: 'max-content',
          // Fallback animation if CSS injection fails
          ...(!stylesInjected && {
            animation: 'marquee 45s linear infinite'
          })
        }}
      >
        {/* Duplicate items for seamless loop */}
        {[...marketData, ...marketData].map((item, index) => (
          <div key={`${item.symbol}-${index}`} className="flex-shrink-0 min-w-[200px] mx-8">
            <div className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wide flex items-center space-x-1">
              <span>{item.symbol}</span>
              {item.source === 'coingecko' && (
                <div className="h-1.5 w-1.5 bg-green-400 rounded-full" title="Live data from CoinGecko"></div>
              )}
              {item.source === 'mock' && (
                <div className="h-1.5 w-1.5 bg-yellow-400 rounded-full" title="Simulated data"></div>
              )}
            </div>
            <div className="text-white text-xl font-bold mb-1">
              {item.symbol === 'EURUSD' ?
                item.price.toFixed(5) :
                (item.symbol === 'TRX' || item.symbol === 'ADA' || item.symbol === 'MATIC' || item.symbol === 'DOGE') ?
                item.price.toFixed(4) :
                item.price.toLocaleString(undefined, {
                  minimumFractionDigits: item.price < 1 ? 4 : 2,
                  maximumFractionDigits: item.price < 1 ? 4 : 2
                })
              }
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${
                item.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {item.changePercent24h >= 0 ? '+' : ''}{item.changePercent24h.toFixed(2)}%
              </span>
              <Sparkline
                data={item.sparklineData}
                color={item.changePercent24h >= 0 ? '#4ade80' : '#f87171'}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Status and last updated info */}
      <div className="absolute top-2 right-4 text-xs text-slate-500 z-10 flex items-center space-x-2">
        {getStatusIcon()}
        <span>
          {isLoading ? 'Updating...' :
           apiStatus === 'healthy' ? 'Live' :
           apiStatus === 'degraded' ? 'Limited' : 'Offline'
          }
        </span>
        {lastUpdated && !isLoading && (
          <>
            <span>•</span>
            <span>{lastUpdated.toLocaleTimeString()}</span>
            {isStale && <span className="text-red-400 ml-1">⚠</span>}
          </>
        )}
      </div>

      {/* Data source indicator */}
      <div className="absolute bottom-2 right-4 text-xs text-slate-600 z-10">
        <div className="flex items-center space-x-2">
          {liveDataCount > 0 && (
            <div className="flex items-center space-x-1" title={`${liveDataCount} live data sources`}>
              <div className="h-1.5 w-1.5 bg-green-400 rounded-full"></div>
              <span>{liveDataCount}</span>
            </div>
          )}
          {mockDataCount > 0 && (
            <div className="flex items-center space-x-1" title={`${mockDataCount} mock data sources`}>
              <div className="h-1.5 w-1.5 bg-yellow-400 rounded-full"></div>
              <span>{mockDataCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Fallback CSS animation if injection fails */}
      {!stylesInjected && (
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `
        }} />
      )}
    </div>
  )
}
