"use client"

import { useEffect, useState, useCallback } from 'react'
import { webSocketService, type WebSocketMessage, type ConnectionStatus } from '@/lib/websocket'

// Hook for managing WebSocket connection
export function useWebSocket() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const unsubscribeStatus = webSocketService.onStatusChange((newStatus) => {
      setStatus(newStatus)
      setIsConnected(newStatus === 'connected')
    })

    // Auto-connect on mount
    webSocketService.connect()

    return () => {
      unsubscribeStatus()
      webSocketService.disconnect()
    }
  }, [])

  const connect = useCallback(() => {
    webSocketService.connect()
  }, [])

  const disconnect = useCallback(() => {
    webSocketService.disconnect()
  }, [])

  const simulateConnectionIssue = useCallback(() => {
    webSocketService.simulateConnectionIssue()
  }, [])

  return {
    status,
    isConnected,
    connect,
    disconnect,
    simulateConnectionIssue
  }
}

// Hook for listening to real-time messages
export function useWebSocketMessages() {
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const [latestMessage, setLatestMessage] = useState<WebSocketMessage | null>(null)

  useEffect(() => {
    const unsubscribe = webSocketService.onMessage((message) => {
      setLatestMessage(message)
      setMessages(prev => [...prev.slice(-49), message]) // Keep last 50 messages
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setLatestMessage(null)
  }, [])

  return {
    messages,
    latestMessage,
    clearMessages
  }
}

// Hook for real-time analytics data
export function useRealTimeAnalytics() {
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 1247,
    activeUsers: 1047,
    newRegistrations: 89,
    conversionRate: 73.2
  })

  useEffect(() => {
    const unsubscribe = webSocketService.onMessage((message) => {
      if (message.type === 'analytics_update') {
        const { metric, value, change } = message.data

        setAnalyticsData(prev => ({
          ...prev,
          [metric]: value
        }))
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return analyticsData
}

// Hook for real-time user activity
export function useRealTimeUserActivity() {
  const [activities, setActivities] = useState<any[]>([])
  const [latestActivity, setLatestActivity] = useState<any | null>(null)

  useEffect(() => {
    const unsubscribe = webSocketService.onMessage((message) => {
      if (message.type === 'user_activity') {
        const activity = {
          ...message.data,
          id: Math.random().toString(),
          timestamp: new Date(message.timestamp).toISOString()
        }

        setLatestActivity(activity)
        setActivities(prev => [activity, ...prev.slice(0, 9)]) // Keep last 10 activities
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return {
    activities,
    latestActivity
  }
}

// Hook for real-time user status updates
export function useRealTimeUserStatus() {
  const [statusUpdates, setStatusUpdates] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    const unsubscribe = webSocketService.onMessage((message) => {
      if (message.type === 'user_status') {
        const { userId, status } = message.data

        setStatusUpdates(prev => {
          const newMap = new Map(prev)
          newMap.set(userId, status)
          return newMap
        })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return statusUpdates
}

// Hook for real-time notifications
export function useRealTimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const unsubscribe = webSocketService.onMessage((message) => {
      if (message.type === 'notification') {
        const notification = {
          ...message.data,
          id: Math.random().toString(),
          timestamp: new Date(message.timestamp).toISOString(),
          read: false
        }

        setNotifications(prev => [notification, ...prev])
        setUnreadCount(prev => prev + 1)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
    setUnreadCount(0)
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications
  }
}
