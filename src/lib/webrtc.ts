"use client"

import Peer from 'simple-peer'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  isOnline: boolean
  isAvailable: boolean
  lastSeen?: Date
  avatar?: string
}

export interface CallInfo {
  id: string
  peerId: string
  peerName: string
  type: 'video' | 'audio' | 'screen'
  status: 'incoming' | 'outgoing' | 'connected' | 'ended'
  startTime?: Date
  endTime?: Date
  duration?: number
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  message: string
  timestamp: Date
  type: 'text' | 'system'
}

export type WebRTCEventType =
  | 'peer-online'
  | 'peer-offline'
  | 'incoming-call'
  | 'call-accepted'
  | 'call-rejected'
  | 'call-ended'
  | 'stream-ready'
  | 'chat-message'
  | 'screen-share-started'
  | 'screen-share-ended'

export interface WebRTCEvent {
  type: WebRTCEventType
  data: any
  timestamp: Date
}

class WebRTCService {
  private currentUser: AdminUser | null = null
  private onlineAdmins: Map<string, AdminUser> = new Map()
  private activeCalls: Map<string, CallInfo> = new Map()
  private activeConnections: Map<string, any> = new Map()
  private localStream: MediaStream | null = null
  private screenStream: MediaStream | null = null
  private listeners: Set<(event: WebRTCEvent) => void> = new Set()
  private chatHistory: Map<string, ChatMessage[]> = new Map()

  // Mock admin users for demo
  private mockAdmins: AdminUser[] = [
    {
      id: 'admin-1',
      name: 'Γιάννης Παπαδόπουλος',
      email: 'giannis.admin@company.com',
      role: 'Senior Admin',
      isOnline: true,
      isAvailable: true,
      lastSeen: new Date()
    },
    {
      id: 'admin-2',
      name: 'Μαρία Κωνσταντίνου',
      email: 'maria.admin@company.com',
      role: 'System Admin',
      isOnline: true,
      isAvailable: false,
      lastSeen: new Date()
    },
    {
      id: 'admin-3',
      name: 'Νίκος Αντωνίου',
      email: 'nikos.admin@company.com',
      role: 'Technical Lead',
      isOnline: false,
      isAvailable: false,
      lastSeen: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    }
  ]

  initialize(currentUserId: string) {
    // Set current user (mock)
    this.currentUser = {
      id: currentUserId,
      name: 'Current Admin',
      email: 'current@company.com',
      role: 'Admin',
      isOnline: true,
      isAvailable: true
    }

    // Populate online admins
    this.mockAdmins.forEach(admin => {
      if (admin.id !== currentUserId) {
        this.onlineAdmins.set(admin.id, admin)
      }
    })

    // Simulate periodic status updates
    this.startMockStatusUpdates()
  }

  private startMockStatusUpdates() {
    setInterval(() => {
      // Randomly update admin availability
      this.mockAdmins.forEach(admin => {
        if (Math.random() < 0.1) { // 10% chance to change status
          admin.isAvailable = !admin.isAvailable
          this.onlineAdmins.set(admin.id, { ...admin })

          this.emit({
            type: admin.isAvailable ? 'peer-online' : 'peer-offline',
            data: admin,
            timestamp: new Date()
          })
        }
      })
    }, 10000) // Check every 10 seconds
  }

  async initializeCall(peerId: string, type: 'video' | 'audio' | 'screen'): Promise<string> {
    const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const peer = this.onlineAdmins.get(peerId)

    if (!peer) {
      throw new Error('Peer not found')
    }

    const callInfo: CallInfo = {
      id: callId,
      peerId,
      peerName: peer.name,
      type,
      status: 'outgoing',
      startTime: new Date()
    }

    this.activeCalls.set(callId, callInfo)

    try {
      // Get user media based on call type
      if (type === 'screen') {
        this.screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })
        this.localStream = this.screenStream
      } else {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: type === 'video',
          audio: true
        })
      }

      // Create peer connection
      const peerConnection = new Peer({
        initiator: true,
        trickle: false,
        stream: this.localStream
      })

      this.activeConnections.set(callId, peerConnection)

      // Setup peer events
      this.setupPeerEvents(peerConnection, callId)

      // Simulate outgoing call (in real app, this would send signal to peer)
      setTimeout(() => {
        this.simulateIncomingCallResponse(callId, Math.random() > 0.3) // 70% acceptance rate
      }, 2000 + Math.random() * 3000) // 2-5 seconds delay

      this.emit({
        type: 'incoming-call',
        data: callInfo,
        timestamp: new Date()
      })

      return callId
    } catch (error) {
      console.error('Failed to initialize call:', error)
      throw error
    }
  }

  private simulateIncomingCallResponse(callId: string, accepted: boolean) {
    const callInfo = this.activeCalls.get(callId)
    if (!callInfo) return

    if (accepted) {
      callInfo.status = 'connected'
      this.activeCalls.set(callId, callInfo)

      this.emit({
        type: 'call-accepted',
        data: callInfo,
        timestamp: new Date()
      })

      // Simulate peer stream
      this.simulatePeerStream(callId)
    } else {
      callInfo.status = 'ended'
      callInfo.endTime = new Date()
      this.activeCalls.set(callId, callInfo)

      this.emit({
        type: 'call-rejected',
        data: callInfo,
        timestamp: new Date()
      })
    }
  }

  private async simulatePeerStream(callId: string) {
    // In a real implementation, this would come from the peer
    try {
      const peerStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      setTimeout(() => {
        this.emit({
          type: 'stream-ready',
          data: { callId, stream: peerStream, type: 'remote' },
          timestamp: new Date()
        })
      }, 1000)
    } catch (error) {
      console.error('Failed to simulate peer stream:', error)
    }
  }

  private setupPeerEvents(peer: any, callId: string) {
    peer.on('signal', (data: any) => {
      console.log('Peer signal:', data)
      // In real app, send this signal to the remote peer
    })

    peer.on('connect', () => {
      console.log('Peer connected')
      const callInfo = this.activeCalls.get(callId)
      if (callInfo) {
        callInfo.status = 'connected'
        this.activeCalls.set(callId, callInfo)
      }
    })

    peer.on('stream', (stream: any) => {
      this.emit({
        type: 'stream-ready',
        data: { callId, stream, type: 'remote' },
        timestamp: new Date()
      })
    })

    peer.on('data', (data: any) => {
      try {
        const message = JSON.parse(data.toString())
        this.handleChatMessage(callId, message)
      } catch (error) {
        console.error('Failed to parse peer data:', error)
      }
    })

    peer.on('error', (error: any) => {
      console.error('Peer error:', error)
      this.endCall(callId)
    })

    peer.on('close', () => {
      console.log('Peer connection closed')
      this.endCall(callId)
    })
  }

  async startScreenShare(callId: string): Promise<void> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })

      const peer = this.activeConnections.get(callId)
      if (peer && this.localStream) {
        // Replace video track
        peer.replaceTrack(
          this.localStream.getVideoTracks()[0],
          this.screenStream.getVideoTracks()[0],
          this.localStream
        )
      }

      this.emit({
        type: 'screen-share-started',
        data: { callId, stream: this.screenStream },
        timestamp: new Date()
      })

      // Handle screen share end
      this.screenStream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare(callId)
      }
    } catch (error) {
      console.error('Failed to start screen share:', error)
      throw error
    }
  }

  stopScreenShare(callId: string) {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop())
      this.screenStream = null
    }

    this.emit({
      type: 'screen-share-ended',
      data: { callId },
      timestamp: new Date()
    })
  }

  sendChatMessage(callId: string, message: string) {
    const peer = this.activeConnections.get(callId)
    const callInfo = this.activeCalls.get(callId)

    if (!peer || !callInfo || !this.currentUser) return

    const chatMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      message,
      timestamp: new Date(),
      type: 'text'
    }

    // Send to peer
    try {
      peer.send(JSON.stringify(chatMessage))
    } catch (error) {
      console.error('Failed to send chat message:', error)
    }

    // Add to local chat history
    const messages = this.chatHistory.get(callId) || []
    messages.push(chatMessage)
    this.chatHistory.set(callId, messages)

    this.emit({
      type: 'chat-message',
      data: chatMessage,
      timestamp: new Date()
    })
  }

  private handleChatMessage(callId: string, message: ChatMessage) {
    const messages = this.chatHistory.get(callId) || []
    messages.push(message)
    this.chatHistory.set(callId, messages)

    this.emit({
      type: 'chat-message',
      data: message,
      timestamp: new Date()
    })
  }

  endCall(callId: string) {
    const callInfo = this.activeCalls.get(callId)
    if (callInfo) {
      callInfo.status = 'ended'
      callInfo.endTime = new Date()
      if (callInfo.startTime) {
        callInfo.duration = callInfo.endTime.getTime() - callInfo.startTime.getTime()
      }
      this.activeCalls.set(callId, callInfo)
    }

    // Clean up streams
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop())
      this.screenStream = null
    }

    // Clean up peer connection
    const peer = this.activeConnections.get(callId)
    if (peer) {
      peer.destroy()
      this.activeConnections.delete(callId)
    }

    this.emit({
      type: 'call-ended',
      data: callInfo,
      timestamp: new Date()
    })
  }

  getOnlineAdmins(): AdminUser[] {
    return Array.from(this.onlineAdmins.values())
  }

  getActiveCalls(): CallInfo[] {
    return Array.from(this.activeCalls.values())
  }

  getChatHistory(callId: string): ChatMessage[] {
    return this.chatHistory.get(callId) || []
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  setAvailability(available: boolean) {
    if (this.currentUser) {
      this.currentUser.isAvailable = available
    }
  }

  // Event system
  onEvent(listener: (event: WebRTCEvent) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(event: WebRTCEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in WebRTC event listener:', error)
      }
    })
  }

  dispose() {
    // Clean up all active calls
    this.activeCalls.forEach((_, callId) => {
      this.endCall(callId)
    })

    this.listeners.clear()
    this.onlineAdmins.clear()
    this.activeCalls.clear()
    this.activeConnections.clear()
    this.chatHistory.clear()
  }
}

export const webRTCService = new WebRTCService()
