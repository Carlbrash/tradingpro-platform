"use client"

import { useState, useEffect, memo } from "react"
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

const LiveFootballScoresComponent = () => {
  // Much more matches for longer scrolling experience
  const [matches] = useState<FootballMatch[]>([
    // Premier League
    {
      id: '1',
      homeTeam: 'Manchester City',
      awayTeam: 'Arsenal',
      homeScore: 2,
      awayScore: 1,
      status: 'LIVE',
      minute: "78'",
      league: 'Premier League',
      homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
    },
    {
      id: '2',
      homeTeam: 'Liverpool',
      awayTeam: 'Chelsea',
      homeScore: 0,
      awayScore: 1,
      status: 'LIVE',
      minute: "34'",
      league: 'Premier League',
      homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
    },
    {
      id: '3',
      homeTeam: 'Manchester United',
      awayTeam: 'Tottenham',
      homeScore: 2,
      awayScore: 2,
      status: 'LIVE',
      minute: "67'",
      league: 'Premier League',
      homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
    },
    {
      id: '4',
      homeTeam: 'Newcastle',
      awayTeam: 'West Ham',
      homeScore: 1,
      awayScore: 0,
      status: 'LIVE',
      minute: "52'",
      league: 'Premier League',
      homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
    },
    {
      id: '5',
      homeTeam: 'Brighton',
      awayTeam: 'Everton',
      homeScore: 3,
      awayScore: 1,
      status: 'FT',
      minute: "FT",
      league: 'Premier League',
      homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
    },
    {
      id: '6',
      homeTeam: 'Aston Villa',
      awayTeam: 'Crystal Palace',
      homeScore: 1,
      awayScore: 1,
      status: 'LIVE',
      minute: "41'",
      league: 'Premier League',
      homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
    },
    // La Liga
    {
      id: '7',
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
      id: '8',
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
      id: '9',
      homeTeam: 'Sevilla',
      awayTeam: 'Villarreal',
      homeScore: 0,
      awayScore: 0,
      status: 'LIVE',
      minute: "23'",
      league: 'La Liga',
      homeFlag: '🇪🇸',
      awayFlag: '🇪🇸'
    },
    {
      id: '10',
      homeTeam: 'Real Betis',
      awayTeam: 'Athletic Bilbao',
      homeScore: 2,
      awayScore: 0,
      status: 'LIVE',
      minute: "88'",
      league: 'La Liga',
      homeFlag: '🇪🇸',
      awayFlag: '🇪🇸'
    },
    {
      id: '11',
      homeTeam: 'Real Sociedad',
      awayTeam: 'Getafe',
      homeScore: 1,
      awayScore: 2,
      status: 'LIVE',
      minute: "76'",
      league: 'La Liga',
      homeFlag: '🇪🇸',
      awayFlag: '🇪🇸'
    },
    // Serie A
    {
      id: '12',
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
      id: '13',
      homeTeam: 'AC Milan',
      awayTeam: 'Roma',
      homeScore: 1,
      awayScore: 1,
      status: 'LIVE',
      minute: "58'",
      league: 'Serie A',
      homeFlag: '🇮🇹',
      awayFlag: '🇮🇹'
    },
    {
      id: '14',
      homeTeam: 'Napoli',
      awayTeam: 'Lazio',
      homeScore: 3,
      awayScore: 1,
      status: 'LIVE',
      minute: "81'",
      league: 'Serie A',
      homeFlag: '🇮🇹',
      awayFlag: '🇮🇹'
    },
    {
      id: '15',
      homeTeam: 'Atalanta',
      awayTeam: 'Fiorentina',
      homeScore: 0,
      awayScore: 2,
      status: 'LIVE',
      minute: "63'",
      league: 'Serie A',
      homeFlag: '🇮🇹',
      awayFlag: '🇮🇹'
    },
    {
      id: '16',
      homeTeam: 'Bologna',
      awayTeam: 'Torino',
      homeScore: 1,
      awayScore: 0,
      status: 'LIVE',
      minute: "29'",
      league: 'Serie A',
      homeFlag: '🇮🇹',
      awayFlag: '🇮🇹'
    },
    // Bundesliga
    {
      id: '17',
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
      id: '18',
      homeTeam: 'RB Leipzig',
      awayTeam: 'Bayer Leverkusen',
      homeScore: 1,
      awayScore: 2,
      status: 'LIVE',
      minute: "72'",
      league: 'Bundesliga',
      homeFlag: '🇩🇪',
      awayFlag: '🇩🇪'
    },
    {
      id: '19',
      homeTeam: 'Eintracht Frankfurt',
      awayTeam: 'Wolfsburg',
      homeScore: 2,
      awayScore: 1,
      status: 'LIVE',
      minute: "55'",
      league: 'Bundesliga',
      homeFlag: '🇩🇪',
      awayFlag: '🇩🇪'
    },
    {
      id: '20',
      homeTeam: 'Borussia M.gladbach',
      awayTeam: 'Union Berlin',
      homeScore: 0,
      awayScore: 1,
      status: 'LIVE',
      minute: "37'",
      league: 'Bundesliga',
      homeFlag: '🇩🇪',
      awayFlag: '🇩🇪'
    },
    // Ligue 1
    {
      id: '21',
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
      id: '22',
      homeTeam: 'Lyon',
      awayTeam: 'Monaco',
      homeScore: 0,
      awayScore: 1,
      status: 'LIVE',
      minute: "45'",
      league: 'Ligue 1',
      homeFlag: '🇫🇷',
      awayFlag: '🇫🇷'
    },
    {
      id: '23',
      homeTeam: 'Nice',
      awayTeam: 'Lille',
      homeScore: 1,
      awayScore: 0,
      status: 'LIVE',
      minute: "61'",
      league: 'Ligue 1',
      homeFlag: '🇫🇷',
      awayFlag: '🇫🇷'
    },
    {
      id: '24',
      homeTeam: 'Rennes',
      awayTeam: 'Nantes',
      homeScore: 3,
      awayScore: 2,
      status: 'FT',
      minute: "FT",
      league: 'Ligue 1',
      homeFlag: '🇫🇷',
      awayFlag: '🇫🇷'
    },
    // Champions League
    {
      id: '25',
      homeTeam: 'Man City',
      awayTeam: 'PSG',
      homeScore: 1,
      awayScore: 0,
      status: 'LIVE',
      minute: "56'",
      league: 'UCL',
      homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      awayFlag: '🇫🇷'
    },
    {
      id: '26',
      homeTeam: 'Real Madrid',
      awayTeam: 'Bayern',
      homeScore: 2,
      awayScore: 1,
      status: 'LIVE',
      minute: "83'",
      league: 'UCL',
      homeFlag: '🇪🇸',
      awayFlag: '🇩🇪'
    },
    {
      id: '27',
      homeTeam: 'Arsenal',
      awayTeam: 'Barcelona',
      homeScore: 0,
      awayScore: 1,
      status: 'LIVE',
      minute: "42'",
      league: 'UCL',
      homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      awayFlag: '🇪🇸'
    },
    {
      id: '28',
      homeTeam: 'Liverpool',
      awayTeam: 'Inter Milan',
      homeScore: 3,
      awayScore: 1,
      status: 'LIVE',
      minute: "87'",
      league: 'UCL',
      homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      awayFlag: '🇮🇹'
    },
    // Greek Super League
    {
      id: '29',
      homeTeam: 'Olympiacos',
      awayTeam: 'Panathinaikos',
      homeScore: 1,
      awayScore: 1,
      status: 'LIVE',
      minute: "62'",
      league: 'Super League',
      homeFlag: '🇬🇷',
      awayFlag: '🇬🇷'
    },
    {
      id: '30',
      homeTeam: 'AEK Athens',
      awayTeam: 'PAOK',
      homeScore: 0,
      awayScore: 2,
      status: 'LIVE',
      minute: "74'",
      league: 'Super League',
      homeFlag: '🇬🇷',
      awayFlag: '🇬🇷'
    },
    {
      id: '31',
      homeTeam: 'Aris',
      awayTeam: 'Atromitos',
      homeScore: 2,
      awayScore: 0,
      status: 'LIVE',
      minute: "38'",
      league: 'Super League',
      homeFlag: '🇬🇷',
      awayFlag: '🇬🇷'
    },
    {
      id: '32',
      homeTeam: 'Volos',
      awayTeam: 'OFI Crete',
      homeScore: 1,
      awayScore: 3,
      status: 'FT',
      minute: "FT",
      league: 'Super League',
      homeFlag: '🇬🇷',
      awayFlag: '🇬🇷'
    },
    // More International Matches
    {
      id: '33',
      homeTeam: 'Ajax',
      awayTeam: 'PSV',
      homeScore: 1,
      awayScore: 1,
      status: 'LIVE',
      minute: "69'",
      league: 'Eredivisie',
      homeFlag: '🇳🇱',
      awayFlag: '🇳🇱'
    },
    {
      id: '34',
      homeTeam: 'Benfica',
      awayTeam: 'Porto',
      homeScore: 2,
      awayScore: 0,
      status: 'LIVE',
      minute: "51'",
      league: 'Primeira Liga',
      homeFlag: '🇵🇹',
      awayFlag: '🇵🇹'
    },
    {
      id: '35',
      homeTeam: 'Celtic',
      awayTeam: 'Rangers',
      homeScore: 0,
      awayScore: 0,
      status: 'LIVE',
      minute: "18'",
      league: 'Scottish Prem',
      homeFlag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      awayFlag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿'
    },
    {
      id: '36',
      homeTeam: 'Galatasaray',
      awayTeam: 'Fenerbahce',
      homeScore: 1,
      awayScore: 2,
      status: 'LIVE',
      minute: "79'",
      league: 'Süper Lig',
      homeFlag: '🇹🇷',
      awayFlag: '🇹🇷'
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
          <div className="text-xs text-slate-400">Real-time updates • {matches.filter(m => m.status === 'LIVE').length} live matches</div>
        </div>

        {/* Much Slower Scrolling Container - Almost 10x slower! */}
        <div className="relative overflow-hidden h-16">
          <div
            className="flex items-center gap-6 whitespace-nowrap h-full"
            style={{
              animation: 'scrollRightSlow 600s linear infinite', // Much slower: 600s instead of 200s
              width: 'max-content'
            }}
          >
            {/* More matches for longer continuous scroll */}
            {[...matches, ...matches].map((match, index) => (
              <div
                key={`${match.id}-${index}`}
                className="flex items-center gap-3 bg-slate-700/50 rounded-lg px-4 py-2 min-w-fit hover:bg-slate-600/50 transition-colors"
              >
                {/* League Badge with Color Coding */}
                <div className={`text-xs font-medium min-w-fit px-2 py-1 rounded ${
                  match.league === 'Premier League' ? 'bg-purple-600/30 text-purple-300' :
                  match.league === 'La Liga' ? 'bg-orange-600/30 text-orange-300' :
                  match.league === 'Serie A' ? 'bg-blue-600/30 text-blue-300' :
                  match.league === 'Bundesliga' ? 'bg-red-600/30 text-red-300' :
                  match.league === 'Ligue 1' ? 'bg-cyan-600/30 text-cyan-300' :
                  match.league === 'UCL' ? 'bg-yellow-600/30 text-yellow-300' :
                  match.league === 'Super League' ? 'bg-green-600/30 text-green-300' :
                  match.league === 'Eredivisie' ? 'bg-orange-500/30 text-orange-200' :
                  match.league === 'Primeira Liga' ? 'bg-emerald-600/30 text-emerald-300' :
                  match.league === 'Scottish Prem' ? 'bg-indigo-600/30 text-indigo-300' :
                  'bg-pink-600/30 text-pink-300'
                }`}>
                  {match.league}
                </div>

                {/* Match Info */}
                <div className="flex items-center gap-2 min-w-fit">
                  <div className="flex items-center gap-1">
                    <span className="text-xs">{match.homeFlag}</span>
                    <span className="text-white text-sm font-medium truncate max-w-24">
                      {match.homeTeam.split(' ').slice(-1)[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-sm font-bold">
                    <span className="text-white">{match.homeScore}</span>
                    <span className="text-slate-400">-</span>
                    <span className="text-white">{match.awayScore}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-white text-sm font-medium truncate max-w-24">
                      {match.awayTeam.split(' ').slice(-1)[0]}
                    </span>
                    <span className="text-xs">{match.awayFlag}</span>
                  </div>
                </div>

                {/* Status with Enhanced Visual Indicators */}
                <div className="flex items-center gap-1 min-w-fit">
                  {match.status === 'LIVE' && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-red-400 font-bold">LIVE</span>
                    </div>
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

      {/* Much Slower CSS Animation */}
      <style jsx global>{`
        @keyframes scrollRightSlow {
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

// Memoize component to prevent unnecessary re-renders
export const LiveFootballScores = memo(LiveFootballScoresComponent)
