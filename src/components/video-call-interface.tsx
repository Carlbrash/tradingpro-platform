"use client"

import { useState, useEffect } from "react"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  Monitor,
  MonitorOff,
  MessageCircle,
  Settings,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useVideoCall, useCallChat, useActiveCalls } from "@/hooks/use-webrtc"
import { type CallInfo, ChatMessage } from "@/lib/webrtc"

interface VideoCallInterfaceProps {
  callId: string | null
  onEndCall: () => void
}

export function VideoCallInterface({ callId, onEndCall }: VideoCallInterfaceProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)

  const {
    localVideoRef,
    remoteVideoRef,
    isScreenSharing,
    isMuted,
    isVideoEnabled,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare
  } = useVideoCall(callId)

  const {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    handleKeyPress
  } = useCallChat(callId)

  const { activeCalls } = useActiveCalls()
  const currentCall = activeCalls.find(call => call.id === callId)

  // Update call duration
  useEffect(() => {
    if (!currentCall || currentCall.status !== 'connected') return

    const interval = setInterval(() => {
      if (currentCall.startTime) {
        const duration = Math.floor((Date.now() - currentCall.startTime.getTime()) / 1000)
        setCallDuration(duration)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [currentCall])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare()
    } else {
      startScreenShare()
    }
  }

  if (!callId || !currentCall) {
    return null
  }

  return (
    <Dialog open={true} onOpenChange={onEndCall}>
      <DialogContent
        className={`${
          isFullscreen
            ? 'max-w-full max-h-full w-screen h-screen'
            : 'sm:max-w-[900px] sm:max-h-[700px]'
        } p-0 overflow-hidden`}
      >
        <div className="flex flex-col h-full bg-black text-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gray-900/80 backdrop-blur">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {currentCall.peerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-sm font-medium">{currentCall.peerName}</h3>
                <div className="flex items-center space-x-2 text-xs text-gray-300">
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    {currentCall.status === 'connected' ? 'Connected' : 'Connecting...'}
                  </Badge>
                  {currentCall.status === 'connected' && (
                    <span>{formatDuration(callDuration)}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Video Area */}
          <div className="flex-1 relative">
            <div className={`grid h-full ${showChat ? 'grid-cols-[1fr_300px]' : 'grid-cols-1'}`}>
              {/* Main Video */}
              <div className="relative bg-gray-900">
                {/* Remote Video */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  muted={false}
                />

                {/* Local Video (Picture in Picture) */}
                <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!isVideoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                      <VideoOff className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Screen Share Indicator */}
                {isScreenSharing && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="default" className="bg-blue-600">
                      <Monitor className="h-3 w-3 mr-1" />
                      Screen Sharing
                    </Badge>
                  </div>
                )}

                {/* Connection Status */}
                {currentCall.status !== 'connected' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm text-gray-300">
                        {currentCall.status === 'outgoing' ? 'Calling...' : 'Connecting...'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Panel */}
              {showChat && (
                <div className="bg-gray-800 border-l border-gray-700 flex flex-col">
                  <div className="p-3 border-b border-gray-700">
                    <h4 className="text-sm font-medium">Chat</h4>
                  </div>

                  <ScrollArea className="flex-1 p-3">
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div key={message.id} className="text-sm">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-xs text-gray-300">
                              {message.senderName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-gray-100">{message.message}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="p-3 border-t border-gray-700">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <Button size="sm" onClick={sendMessage}>
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 bg-gray-900/80 backdrop-blur">
            <div className="flex items-center justify-center space-x-3">
              {/* Mute */}
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>

              {/* Video */}
              <Button
                variant={!isVideoEnabled ? "destructive" : "secondary"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={toggleVideo}
              >
                {isVideoEnabled ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <VideoOff className="h-5 w-5" />
                )}
              </Button>

              {/* Screen Share */}
              <Button
                variant={isScreenSharing ? "default" : "secondary"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={handleScreenShare}
              >
                {isScreenSharing ? (
                  <MonitorOff className="h-5 w-5" />
                ) : (
                  <Monitor className="h-5 w-5" />
                )}
              </Button>

              {/* Speaker */}
              <Button
                variant={!isSpeakerOn ? "destructive" : "secondary"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              >
                {isSpeakerOn ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
              </Button>

              {/* End Call */}
              <Button
                variant="destructive"
                size="icon"
                className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700"
                onClick={onEndCall}
              >
                <Phone className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Incoming call notification
interface IncomingCallProps {
  call: CallInfo
  onAccept: () => void
  onReject: () => void
}

export function IncomingCallNotification({ call, onAccept, onReject }: IncomingCallProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-80 bg-background border shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {call.peerName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-medium">{call.peerName}</h4>
              <p className="text-sm text-muted-foreground">
                Incoming {call.type} call
              </p>
            </div>
            <Badge variant="outline" className="animate-pulse">
              <Video className="h-3 w-3 mr-1" />
              {call.type}
            </Badge>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onReject}
            >
              Decline
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={onAccept}
            >
              Accept
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
