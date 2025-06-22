// Mock WebSocket service for real-time updates
export type WebSocketMessage = {
  type: 'user_update' | 'user_activity' | 'analytics_update' | 'notification' | 'user_status'
  data: any
  timestamp: number
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export class MockWebSocketService {
  private listeners: Set<(message: WebSocketMessage) => void> = new Set()
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set()
  private status: ConnectionStatus = 'disconnected'
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: NodeJS.Timeout | null = null
  private updateInterval: NodeJS.Timeout | null = null

  connect() {
    this.setStatus('connecting')

    // Simulate connection delay
    setTimeout(() => {
      this.setStatus('connected')
      this.reconnectAttempts = 0
      this.startRealTimeUpdates()
    }, 1000)
  }

  disconnect() {
    this.setStatus('disconnected')
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status
    this.statusListeners.forEach(listener => listener(status))
  }

  getStatus(): ConnectionStatus {
    return this.status
  }

  onMessage(listener: (message: WebSocketMessage) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  onStatusChange(listener: (status: ConnectionStatus) => void) {
    this.statusListeners.add(listener)
    return () => this.statusListeners.delete(listener)
  }

  private sendMessage(message: WebSocketMessage) {
    if (this.status === 'connected') {
      this.listeners.forEach(listener => listener(message))
    }
  }

  private startRealTimeUpdates() {
    // Send periodic updates every 15-30 seconds (reduced frequency for production)
    this.updateInterval = setInterval(() => {
      this.generateRandomUpdate()
    }, Math.random() * 15000 + 15000)

    // Send initial burst of activity
    setTimeout(() => this.simulateUserActivity(), 2000)
    setTimeout(() => this.simulateAnalyticsUpdate(), 4000)
    setTimeout(() => this.simulateNotification(), 6000)
  }

  private generateRandomUpdate() {
    const updateTypes = ['user_activity', 'analytics_update', 'user_status', 'notification']
    const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)]

    switch (randomType) {
      case 'user_activity':
        this.simulateUserActivity()
        break
      case 'analytics_update':
        this.simulateAnalyticsUpdate()
        break
      case 'user_status':
        this.simulateUserStatusChange()
        break
      case 'notification':
        this.simulateNotification()
        break
    }
  }

  private simulateUserActivity() {
    const activities = [
      { type: 'login', user: 'Γιάννης Παπαδόπουλος', userId: '1' },
      { type: 'logout', user: 'Μαρία Κωνσταντίνου', userId: '2' },
      { type: 'profile_update', user: 'Νίκος Αντωνίου', userId: '3' },
      { type: 'registration', user: 'Νέος Χρήστης', userId: Math.random().toString() }
    ]

    const activity = activities[Math.floor(Math.random() * activities.length)]

    this.sendMessage({
      type: 'user_activity',
      data: {
        ...activity,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    })
  }

  private simulateAnalyticsUpdate() {
    const updates = [
      {
        metric: 'activeUsers',
        value: Math.floor(Math.random() * 50) + 1000,
        change: (Math.random() - 0.5) * 10
      },
      {
        metric: 'totalUsers',
        value: Math.floor(Math.random() * 100) + 1200,
        change: Math.random() * 5
      },
      {
        metric: 'newRegistrations',
        value: Math.floor(Math.random() * 20) + 80,
        change: (Math.random() - 0.5) * 15
      }
    ]

    const update = updates[Math.floor(Math.random() * updates.length)]

    this.sendMessage({
      type: 'analytics_update',
      data: update,
      timestamp: Date.now()
    })
  }

  private simulateUserStatusChange() {
    const userIds = ['1', '2', '3', '4', '5']
    const statuses = ['active', 'inactive', 'pending'] as const

    const userId = userIds[Math.floor(Math.random() * userIds.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    this.sendMessage({
      type: 'user_status',
      data: {
        userId,
        status,
        updatedBy: 'system'
      },
      timestamp: Date.now()
    })
  }

  private simulateNotification() {
    const notifications = [
      {
        type: 'info',
        title: 'System Update',
        message: 'Το σύστημα ενημερώθηκε επιτυχώς',
        severity: 'info'
      },
      {
        type: 'warning',
        title: 'High CPU Usage',
        message: 'Το CPU usage είναι υψηλό (85%)',
        severity: 'warning'
      },
      {
        type: 'success',
        title: 'Backup Complete',
        message: 'Το backup ολοκληρώθηκε επιτυχώς',
        severity: 'success'
      },
      {
        type: 'error',
        title: 'Failed Login Attempt',
        message: 'Ανιχνεύθηκε ύποπτη δραστηριότητα',
        severity: 'error'
      }
    ]

    const notification = notifications[Math.floor(Math.random() * notifications.length)]

    this.sendMessage({
      type: 'notification',
      data: notification,
      timestamp: Date.now()
    })
  }

  // Simulate connection issues and reconnection
  simulateConnectionIssue() {
    this.setStatus('error')
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }

    this.attemptReconnect()
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setStatus('error')
      return
    }

    this.reconnectAttempts++
    this.setStatus('connecting')

    this.reconnectTimeout = setTimeout(() => {
      // 70% chance of successful reconnection
      if (Math.random() > 0.3) {
        this.setStatus('connected')
        this.reconnectAttempts = 0
        this.startRealTimeUpdates()
      } else {
        this.attemptReconnect()
      }
    }, Math.pow(2, this.reconnectAttempts) * 1000) // Exponential backoff
  }

  // Manually send user update
  sendUserUpdate(user: any) {
    this.sendMessage({
      type: 'user_update',
      data: user,
      timestamp: Date.now()
    })
  }
}

// Singleton instance
export const webSocketService = new MockWebSocketService()
