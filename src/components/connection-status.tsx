"use client"

import { Wifi, WifiOff, RotateCw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ConnectionStatus as ConnectionStatusType } from "@/lib/websocket"

interface ConnectionStatusProps {
  status: ConnectionStatusType
  onReconnect?: () => void
  onSimulateIssue?: () => void
}

export function ConnectionStatus({ status, onReconnect, onSimulateIssue }: ConnectionStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />
      case 'connecting':
        return <RotateCw className="h-4 w-4 text-yellow-500 animate-spin" />
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-gray-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected'
      case 'connecting':
        return 'Connecting...'
      case 'disconnected':
        return 'Disconnected'
      case 'error':
        return 'Connection Error'
      default:
        return 'Unknown'
    }
  }

  const getStatusVariant = () => {
    switch (status) {
      case 'connected':
        return 'default' as const
      case 'connecting':
        return 'secondary' as const
      case 'disconnected':
        return 'secondary' as const
      case 'error':
        return 'destructive' as const
      default:
        return 'secondary' as const
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={getStatusVariant()} className="flex items-center space-x-1">
              {getStatusIcon()}
              <span className="text-xs">{getStatusText()}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-2">
              <p>Real-time connection status</p>
              {(status === 'disconnected' || status === 'error') && onReconnect && (
                <Button size="sm" variant="outline" onClick={onReconnect}>
                  Reconnect
                </Button>
              )}
              {status === 'connected' && onSimulateIssue && (
                <Button size="sm" variant="outline" onClick={onSimulateIssue}>
                  Simulate Issue
                </Button>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

// Compact version for header
export function ConnectionStatusCompact({ status, onReconnect, onSimulateIssue }: ConnectionStatusProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={status === 'connected' ? onSimulateIssue : onReconnect}
          >
            {status === 'connected' && <Wifi className="h-4 w-4 text-green-500" />}
            {status === 'connecting' && <RotateCw className="h-4 w-4 text-yellow-500 animate-spin" />}
            {status === 'disconnected' && <WifiOff className="h-4 w-4 text-gray-500" />}
            {status === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Real-time: {status}</p>
          {(status === 'disconnected' || status === 'error') && <p>Click to reconnect</p>}
          {status === 'connected' && <p>Click to simulate issue</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
