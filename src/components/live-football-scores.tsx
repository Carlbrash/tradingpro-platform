"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

interface FootballMatch {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: string
  minute?: string
  league: string
  homeFlag: string
  awayFlag: string
}

export function LiveFootballScores() {
  const [matches] = useState<FootballMatch[]>([
    {
      id: '1',
      homeTeam: 'Manchester City',
      awayTeam: 'Arsenal',
      homeScore: 2,
      awayScore: 1,
      status: 'LIVE',
      minute: "78'",
      league: 'Premier League',
      homeFlag: '🇬🇧',
      awayFlag: '🇬🇧'
    },
    {
      id: '2',
      homeTeam: 'Real Madrid',
      awayTeam: 'Barcelona',
      homeScore: 1,
      awayScore: 1,
      status: 'LIVE',
      minute: "65'",
      league: 'La Liga',
      homeFlag: '🇪🇸',
      awayFlag: '🇪🇸'
    },
    {
      id: '3',
      homeTeam: 'Bayern Munich',
      awayTeam: 'Borussia Dortmund',
      homeScore: 3,
      awayScore: 0,
      status: 'LIVE',
      minute: "89'",
      league: 'Bundesliga',
      homeFlag: '🇩🇪',
      awayFlag: '🇩🇪'
    },
    {
      id: '4',
      homeTeam: 'PSG',
      awayTeam: 'Marseille',
      homeScore: 2,
      awayScore: 2,
      status: 'LIVE',
      minute: "71'",
      league: 'Ligue 1',
      homeFlag: '🇫🇷',
      awayFlag: '🇫🇷'
    },
    {
      id: '5',
      homeTeam: 'Juventus',
      awayTeam: 'Inter Milan',
      homeScore: 1,
      awayScore: 0,
      status: 'HT',
      minute: "HT",
      league: 'Serie A',
      homeFlag: '🇮🇹',
      awayFlag: '🇮🇹'
    },
    {
      id: '6',
      homeTeam: 'Liverpool',
      awayTeam: 'Chelsea',
      homeScore: 0,
      awayScore: 1,
      status: 'LIVE',
      minute: "34'",
      league: 'Premier League',
      homeFlag: '🇬🇧',
      awayFlag: '🇬🇧'
    },
    {
      id: '7',
      homeTeam: 'Atletico Madrid',
      awayTeam: 'Valencia',
      homeScore: 2,
      awayScore: 1,
      status: 'FT',
      minute: "FT",
      league: 'La Liga',
      homeFlag: '🇪🇸',
      awayFlag: '🇪🇸'
    },
    {
      id: '8',
      homeTeam: 'AC Milan',
      awayTeam: 'Roma',
      homeScore: 1,
      awayScore: 1,
      status: 'LIVE',
      minute: "58'",
      league: 'Serie A',
      homeFlag: '🇮🇹',
      awayFlag: '🇮🇹'
    }
  ])

  return (
    <Card className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-slate-600 overflow-hidden">
      <div className="p-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-white font-semibold text-sm">⚽ Live Football Scores</span>
          </div>
          <div className="text-xs text-slate-400">Updated every 30 seconds</div>
        </div>

        {/* Scrolling Container */}
        <div className="relative overflow-hidden h-16">
          <div
            className="flex items-center gap-6 whitespace-nowrap h-full"
            style={{
              animation: 'scrollRight 80s linear infinite',
              width: 'max-content'
            }}
          >
            {/* Duplicate matches for continuous scroll */}
            {[...matches, ...matches, ...matches].map((match, index) => (
              <div
                key={`${match.id}-${index}`}
                className="flex items-center gap-3 bg-slate-700/50 rounded-lg px-4 py-2 min-w-fit hover:bg-slate-600/50 transition-colors"
              >
                {/* League Badge */}
                <div className="text-xs text-slate-400 font-medium min-w-fit">
                  {match.league}
                </div>

                {/* Match Info */}
                <div className="flex items-center gap-2 min-w-fit">
                  <div className="flex items-center gap-1">
                    <span className="text-xs">{match.homeFlag}</span>
                    <span className="text-white text-sm font-medium truncate max-w-20">
                      {match.homeTeam.split(' ').slice(-1)[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-sm font-bold">
                    <span className="text-white">{match.homeScore}</span>
                    <span className="text-slate-400">-</span>
                    <span className="text-white">{match.awayScore}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-white text-sm font-medium truncate max-w-20">
                      {match.awayTeam.split(' ').slice(-1)[0]}
                    </span>
                    <span className="text-xs">{match.awayFlag}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-1 min-w-fit">
                  {match.status === 'LIVE' && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                  <span
                    className={`text-xs font-medium ${
                      match.status === 'LIVE' ? 'text-red-400' :
                      match.status === 'HT' ? 'text-yellow-400' :
                      'text-slate-400'
                    }`}
                  >
                    {match.minute}
                  </span>
                </div>

                {/* Separator */}
                <div className="w-px h-8 bg-slate-600"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx global>{`
        @keyframes scrollRight {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </Card>
  )
}
