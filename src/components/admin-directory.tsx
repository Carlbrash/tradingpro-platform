"use client"

import { useState } from "react"
import {
  Users,
  Video,
  Phone,
  Monitor,
  MessageCircle,
  Circle,
  Crown,
  Shield,
  User as UserIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useOnlineAdmins, useWebRTC } from "@/hooks/use-webrtc"
import type { AdminUser } from "@/lib/webrtc"

interface AdminDirectoryProps {
  onCall?: (adminId: string, type: 'video' | 'audio' | 'screen') => void
  children?: React.ReactNode
}

export function AdminDirectory({ onCall, children }: AdminDirectoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [availability, setLocalAvailability] = useState(true)
  const { onlineAdmins, callAdmin, setAvailability } = useOnlineAdmins()
  const { isInitialized } = useWebRTC()

  const handleCall = async (adminId: string, type: 'video' | 'audio' | 'screen') => {
    try {
      const callId = await callAdmin(adminId, type)
      onCall?.(adminId, type)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to initiate call:', error)
    }
  }

  const handleAvailabilityChange = (available: boolean) => {
    setLocalAvailability(available)
    setAvailability(available)
  }

  const getRoleIcon = (role: string) => {
    if (role.toLowerCase().includes('senior') || role.toLowerCase().includes('lead')) {
      return <Crown className="h-3 w-3" />
    }
    if (role.toLowerCase().includes('system')) {
      return <Shield className="h-3 w-3" />
    }
    return <UserIcon className="h-3 w-3" />
  }

  const getStatusColor = (admin: AdminUser) => {
    if (!admin.isOnline) return 'text-gray-400'
    return admin.isAvailable ? 'text-green-500' : 'text-yellow-500'
  }

  const getStatusText = (admin: AdminUser) => {
    if (!admin.isOnline) return 'Offline'
    return admin.isAvailable ? 'Available' : 'Busy'
  }

  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return 'Never'

    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (!isInitialized) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="icon" className="h-8 w-8 relative">
            <Users className="h-4 w-4" />
            {onlineAdmins.filter(admin => admin.isOnline && admin.isAvailable).length > 0 && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border border-background" />
            )}
            <span className="sr-only">Admin Directory</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Admin Directory</span>
          </DialogTitle>
          <DialogDescription>
            Connect with other administrators via video, audio, or screen sharing
          </DialogDescription>
        </DialogHeader>

        {/* Availability Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="availability" className="text-sm font-medium">
              Your Availability
            </Label>
            <p className="text-xs text-muted-foreground">
              {availability ? 'Other admins can call you' : 'You appear as busy to others'}
            </p>
          </div>
          <Switch
            id="availability"
            checked={availability}
            onCheckedChange={handleAvailabilityChange}
          />
        </div>

        {/* Admin List */}
        <div className="flex-1 overflow-y-auto">
          {onlineAdmins.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-center">
              <div className="space-y-2">
                <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  No other administrators online
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {onlineAdmins.map((admin) => (
                <Card key={admin.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={admin.avatar} alt={admin.name} />
                            <AvatarFallback>
                              {admin.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <Circle
                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 ${getStatusColor(admin)} fill-current`}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium">{admin.name}</h4>
                            <Badge variant="outline" className="flex items-center space-x-1">
                              {getRoleIcon(admin.role)}
                              <span className="text-xs">{admin.role}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                            <span className={getStatusColor(admin)}>
                              {getStatusText(admin)}
                            </span>
                            <span>•</span>
                            <span>Last seen {formatLastSeen(admin.lastSeen)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{admin.email}</p>
                        </div>
                      </div>

                      {/* Call Actions */}
                      <div className="flex items-center space-x-1">
                        {admin.isOnline ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleCall(admin.id, 'video')}
                              disabled={!admin.isAvailable}
                              title="Video call"
                            >
                              <Video className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleCall(admin.id, 'audio')}
                              disabled={!admin.isAvailable}
                              title="Audio call"
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleCall(admin.id, 'screen')}
                              disabled={!admin.isAvailable}
                              title="Screen share"
                            >
                              <Monitor className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>Offline</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {onlineAdmins.filter(admin => admin.isOnline && admin.isAvailable).length}
              </div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600">
                {onlineAdmins.filter(admin => admin.isOnline && !admin.isAvailable).length}
              </div>
              <div className="text-xs text-muted-foreground">Busy</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-600">
                {onlineAdmins.filter(admin => !admin.isOnline).length}
              </div>
              <div className="text-xs text-muted-foreground">Offline</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Compact version for header
export function AdminDirectoryCompact({ onCall }: AdminDirectoryProps) {
  const { onlineAdmins } = useOnlineAdmins()
  const availableCount = onlineAdmins.filter(admin => admin.isOnline && admin.isAvailable).length

  return (
    <AdminDirectory onCall={onCall}>
      <Button variant="ghost" size="icon" className="h-8 w-8 relative">
        <Users className="h-4 w-4" />
        {availableCount > 0 && (
          <Badge
            variant="default"
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {availableCount}
          </Badge>
        )}
        <span className="sr-only">Admin Directory ({availableCount} available)</span>
      </Button>
    </AdminDirectory>
  )
}
