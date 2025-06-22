"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { webRTCService, type AdminUser, type CallInfo, type ChatMessage, type WebRTCEvent } from '@/lib/webrtc'
import { toast } from 'sonner'

// Hook for managing WebRTC service
export function useWebRTC() {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      webRTCService.initialize('current-admin')
      setIsInitialized(true)
    }

    return () => {
      if (isInitialized) {
        webRTCService.dispose()
      }
    }
  }, [isInitialized])

  return {
    isInitialized
  }
}

// Hook for online admin presence
export function useOnlineAdmins() {
  const [onlineAdmins, setOnlineAdmins] = useState<AdminUser[]>([])

  useEffect(() => {
    const updateAdmins = () => {
      setOnlineAdmins(webRTCService.getOnlineAdmins())
    }

    // Initial load
    updateAdmins()

    // Listen for status changes
    const unsubscribe = webRTCService.onEvent((event) => {
      if (event.type === 'peer-online' || event.type === 'peer-offline') {
        updateAdmins()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const callAdmin = useCallback(async (adminId: string, type: 'video' | 'audio' | 'screen') => {
    try {
      const callId = await webRTCService.initializeCall(adminId, type)
      toast.success(`Initiating ${type} call...`)
      return callId
    } catch (error) {
      toast.error(`Failed to start ${type} call`)
      throw error
    }
  }, [])

  const setAvailability = useCallback((available: boolean) => {
    webRTCService.setAvailability(available)
    toast.info(available ? 'You are now available' : 'You are now unavailable')
  }, [])

  return {
    onlineAdmins,
    callAdmin,
    setAvailability
  }
}

// Hook for managing active calls
export function useActiveCalls() {
  const [activeCalls, setActiveCalls] = useState<CallInfo[]>([])
  const [incomingCall, setIncomingCall] = useState<CallInfo | null>(null)

  useEffect(() => {
    const updateCalls = () => {
      setActiveCalls(webRTCService.getActiveCalls())
    }

    const unsubscribe = webRTCService.onEvent((event) => {
      switch (event.type) {
        case 'incoming-call':
          if (event.data.status === 'incoming') {
            setIncomingCall(event.data)
            toast.info(`Incoming call from ${event.data.peerName}`)
          }
          updateCalls()
          break
        case 'call-accepted':
          setIncomingCall(null)
          toast.success(`Call with ${event.data.peerName} connected`)
          updateCalls()
          break
        case 'call-rejected':
          setIncomingCall(null)
          toast.error(`Call with ${event.data.peerName} was rejected`)
          updateCalls()
          break
        case 'call-ended':
          setIncomingCall(null)
          const duration = event.data.duration ? Math.round(event.data.duration / 1000) : 0
          toast.info(`Call ended (${duration}s)`)
          updateCalls()
          break
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const endCall = useCallback((callId: string) => {
    webRTCService.endCall(callId)
  }, [])

  const acceptCall = useCallback((callId: string) => {
    // In a real implementation, this would accept the call
    toast.success('Call accepted')
    setIncomingCall(null)
  }, [])

  const rejectCall = useCallback((callId: string) => {
    webRTCService.endCall(callId)
    setIncomingCall(null)
  }, [])

  return {
    activeCalls,
    incomingCall,
    endCall,
    acceptCall,
    rejectCall
  }
}

// Hook for video call interface
export function useVideoCall(callId: string | null) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!callId) return

    const unsubscribe = webRTCService.onEvent((event) => {
      if (event.type === 'stream-ready' && event.data.callId === callId) {
        if (event.data.type === 'remote') {
          setRemoteStream(event.data.stream)
        }
      } else if (event.type === 'screen-share-started' && event.data.callId === callId) {
        setIsScreenSharing(true)
      } else if (event.type === 'screen-share-ended' && event.data.callId === callId) {
        setIsScreenSharing(false)
      }
    })

    // Get local stream
    const stream = webRTCService.getLocalStream()
    if (stream) {
      setLocalStream(stream)
    }

    return () => {
      unsubscribe()
    }
  }, [callId])

  // Auto-assign streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted
      })
      setIsMuted(!isMuted)
    }
  }, [localStream, isMuted])

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled
      })
      setIsVideoEnabled(!isVideoEnabled)
    }
  }, [localStream, isVideoEnabled])

  const startScreenShare = useCallback(async () => {
    if (!callId) return
    try {
      await webRTCService.startScreenShare(callId)
      toast.success('Screen sharing started')
    } catch (error) {
      toast.error('Failed to start screen sharing')
    }
  }, [callId])

  const stopScreenShare = useCallback(() => {
    if (!callId) return
    webRTCService.stopScreenShare(callId)
    toast.info('Screen sharing stopped')
  }, [callId])

  return {
    localVideoRef,
    remoteVideoRef,
    localStream,
    remoteStream,
    isScreenSharing,
    isMuted,
    isVideoEnabled,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare
  }
}

// Hook for call chat
export function useCallChat(callId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    if (!callId) {
      setMessages([])
      return
    }

    // Load existing messages
    setMessages(webRTCService.getChatHistory(callId))

    // Listen for new messages
    const unsubscribe = webRTCService.onEvent((event) => {
      if (event.type === 'chat-message') {
        setMessages(prev => [...prev, event.data])
      }
    })

    return () => {
      unsubscribe()
    }
  }, [callId])

  const sendMessage = useCallback(() => {
    if (!callId || !newMessage.trim()) return

    webRTCService.sendChatMessage(callId, newMessage.trim())
    setNewMessage('')
  }, [callId, newMessage])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  return {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    handleKeyPress
  }
}

// Hook for WebRTC events and notifications
export function useWebRTCEvents() {
  const [events, setEvents] = useState<WebRTCEvent[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const unsubscribe = webRTCService.onEvent((event) => {
      setEvents(prev => [event, ...prev.slice(0, 49)]) // Keep last 50 events

      // Show appropriate notifications
      switch (event.type) {
        case 'peer-online':
          toast.success(`${event.data.name} is now available`)
          break
        case 'peer-offline':
          toast.info(`${event.data.name} is now unavailable`)
          break
        case 'incoming-call':
          if (event.data.status === 'incoming') {
            setUnreadCount(prev => prev + 1)
          }
          break
        case 'call-accepted':
          toast.success('Call connected')
          break
        case 'call-rejected':
          toast.error('Call was rejected')
          break
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const clearEvents = useCallback(() => {
    setEvents([])
    setUnreadCount(0)
  }, [])

  const markAsRead = useCallback(() => {
    setUnreadCount(0)
  }, [])

  return {
    events,
    unreadCount,
    clearEvents,
    markAsRead
  }
}
