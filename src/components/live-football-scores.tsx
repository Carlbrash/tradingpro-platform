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
  // Much more matches for longer scrolling experience with NEW LEAGUES!
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
    // La Liga
    {
      id: '4',
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
    // Serie A
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
    // Bundesliga
    {
      id: '6',
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
    // Ligue 1
    {
      id: '7',
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
    // Champions League
    {
      id: '8',
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
    // Greek Super League
    {
      id: '9',
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
    // Eredivisie
    {
      id: '10',
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
    // Primeira Liga
    {
      id: '11',
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
    // Scottish Premiership
    {
      id: '12',
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
    // Turkish Süper Lig
    {
      id: '13',
      homeTeam: 'Galatasaray',
      awayTeam: 'Fenerbahce',
      homeScore: 1,
      awayScore: 2,
      status: 'LIVE',
      minute: "79'",
      league: 'Süper Lig',
      homeFlag: '🇹🇷',
      awayFlag: '🇹🇷'
    },
    // 🆕 FIFA Club World Cup
    {
      id: '14',
      homeTeam: 'Real Madrid',
      awayTeam: 'Manchester City',
      homeScore: 2,
      awayScore: 1,
      status: 'LIVE',
      minute: "67'",
      league: 'FIFA Club WC',
      homeFlag: '🇪🇸',
      awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
    },
    {
      id: '15',
      homeTeam: 'Chelsea',
      awayTeam: 'Al Hilal',
      homeScore: 1,
      awayScore: 0,
      status: 'LIVE',
      minute: "34'",
      league: 'FIFA Club WC',
      homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      awayFlag: '🇸🇦'
    },
    {
      id: '16',
      homeTeam: 'Bayern Munich',
      awayTeam: 'Flamengo',
      homeScore: 2,
      awayScore: 1,
      status: 'FT',
      minute: "FT",
      league: 'FIFA Club WC',
      homeFlag: '🇩🇪',
      awayFlag: '🇧🇷'
    },
    // 🆕 European U21 Championship
    {
      id: '17',
      homeTeam: 'Spain U21',
      awayTeam: 'Germany U21',
      homeScore: 0,
      awayScore: 1,
      status: 'LIVE',
      minute: "52'",
      league: 'U21 Euro',
      homeFlag: '🇪🇸',
      awayFlag: '🇩🇪'
    },
    {
      id: '18',
      homeTeam: 'Italy U21',
      awayTeam: 'France U21',
      homeScore: 2,
      awayScore: 2,
      status: 'LIVE',
      minute: "78'",
      league: 'U21 Euro',
      homeFlag: '🇮🇹',
      awayFlag: '🇫🇷'
    },
    {
      id: '19',
      homeTeam: 'England U21',
      awayTeam: 'Netherlands U21',
      homeScore: 1,
      awayScore: 0,
      status: 'HT',
      minute: "HT",
      league: 'U21 Euro',
      homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      awayFlag: '🇳🇱'
    },
    {
      id: '20',
      homeTeam: 'Portugal U21',
      awayTeam: 'Croatia U21',
      homeScore: 3,
      awayScore: 1,
      status: 'LIVE',
      minute: "84'",
      league: 'U21 Euro',
      homeFlag: '🇵🇹',
      awayFlag: '🇭🇷'
    },
    // 🆕 Serie B (Italy)
    {
      id: '21',
      homeTeam: 'Parma',
      awayTeam: 'Brescia',
      homeScore: 3,
      awayScore: 1,
      status: 'LIVE',
      minute: "81'",
      league: 'Serie B',
      homeFlag: '🇮🇹',
      awayFlag: '🇮🇹'
    },
    {
      id: '22',
      homeTeam: 'Sampdoria',
      awayTeam: 'Venezia',
      homeScore: 0,
      awayScore: 2,
      status: 'LIVE',
      minute: "59'",
      league: 'Serie B',
      homeFlag: '🇮🇹',
      awayFlag: '🇮🇹'
    },
    {
      id: '23',
      homeTeam: 'Bari',
      awayTeam: 'Catanzaro',
      homeScore: 1,
      awayScore: 1,
      status: 'LIVE',
      minute: "73'",
      league: 'Serie B',
      homeFlag: '🇮🇹',
      awayFlag: '🇮🇹'
    },
    {
      id: '24',
      homeTeam: 'Palermo',
      awayTeam: 'Cremonese',
      homeScore: 2,
      awayScore: 0,
      status: 'LIVE',
      minute: "46'",
      league: 'Serie B',
      homeFlag: '🇮🇹',
      awayFlag: '🇮🇹'
    },
    // 🆕 Finland Veikkausliiga
    {
      id: '25',
      homeTeam: 'HJK Helsinki',
      awayTeam: 'FC Lahti',
      homeScore: 2,
      awayScore: 0,
      status: 'LIVE',
      minute: "46'",
      league: 'Veikkausliiga',
      homeFlag: '🇫🇮',
      awayFlag: '🇫🇮'
    },
    {
      id: '26',
      homeTeam: 'KuPS',
      awayTeam: 'FC Inter Turku',
      homeScore: 1,
      awayScore: 2,
      status: 'LIVE',
      minute: "62'",
      league: 'Veikkausliiga',
      homeFlag: '🇫🇮',
      awayFlag: '🇫🇮'
    },
    {
      id: '27',
      homeTeam: 'SJK',
      awayTeam: 'TPS Turku',
      homeScore: 0,
      awayScore: 1,
      status: 'LIVE',
      minute: "37'",
      league: 'Veikkausliiga',
      homeFlag: '🇫🇮',
      awayFlag: '🇫🇮'
    },
    // 🆕 Sweden Allsvenskan
    {
      id: '28',
      homeTeam: 'Malmö FF',
      awayTeam: 'AIK',
      homeScore: 1,
      awayScore: 1,
      status: 'LIVE',
      minute: "85'",
      league: 'Allsvenskan',
      homeFlag: '🇸🇪',
      awayFlag: '🇸🇪'
    },
    {
      id: '29',
      homeTeam: 'IFK Göteborg',
      awayTeam: 'Djurgården',
      homeScore: 0,
      awayScore: 3,
      status: 'FT',
      minute: "FT",
      league: 'Allsvenskan',
      homeFlag: '🇸🇪',
      awayFlag: '🇸🇪'
    },
    {
      id: '30',
      homeTeam: 'Hammarby',
      awayTeam: 'BK Häcken',
      homeScore: 2,
      awayScore: 1,
      status: 'LIVE',
      minute: "71'",
      league: 'Allsvenskan',
      homeFlag: '🇸🇪',
      awayFlag: '🇸🇪'
    },
    {
      id: '31',
      homeTeam: 'Elfsborg',
      awayTeam: 'Kalmar FF',
      homeScore: 1,
      awayScore: 0,
      status: 'LIVE',
      minute: "54'",
      league: 'Allsvenskan',
      homeFlag: '🇸🇪',
      awayFlag: '🇸🇪'
    },
    // 🆕 Sweden Superettan
    {
      id: '32',
      homeTeam: 'GAIS',
      awayTeam: 'Örebro SK',
      homeScore: 1,
      awayScore: 0,
      status: 'LIVE',
      minute: "38'",
      league: 'Superettan',
      homeFlag: '🇸🇪',
      awayFlag: '🇸🇪'
    },
    {
      id: '33',
      homeTeam: 'Helsingborg',
      awayTeam: 'Sandviken',
      homeScore: 2,
      awayScore: 2,
      status: 'LIVE',
      minute: "77'",
      league: 'Superettan',
      homeFlag: '🇸🇪',
      awayFlag: '🇸🇪'
    },
    {
      id: '34',
      homeTeam: 'Trelleborgs',
      awayTeam: 'Västerås SK',
      homeScore: 0,
      awayScore: 1,
      status: 'LIVE',
      minute: "65'",
      league: 'Superettan',
      homeFlag: '🇸🇪',
      awayFlag: '🇸🇪'
    },
    // 🆕 Norway Eliteserien
    {
      id: '35',
      homeTeam: 'Rosenborg',
      awayTeam: 'Molde',
      homeScore: 1,
      awayScore: 2,
      status: 'LIVE',
      minute: "56'",
      league: 'Eliteserien',
      homeFlag: '🇳🇴',
      awayFlag: '🇳🇴'
    },
    {
      id: '36',
      homeTeam: 'Bodø/Glimt',
      awayTeam: 'Viking FK',
      homeScore: 3,
      awayScore: 0,
      status: 'LIVE',
      minute: "88'",
      league: 'Eliteserien',
      homeFlag: '🇳🇴',
      awayFlag: '🇳🇴'
    },
    {
      id: '37',
      homeTeam: 'Brann',
      awayTeam: 'Lillestrøm',
      homeScore: 0,
      awayScore: 1,
      status: 'LIVE',
      minute: "43'",
      league: 'Eliteserien',
      homeFlag: '🇳🇴',
      awayFlag: '🇳🇴'
    },
    {
      id: '38',
      homeTeam: 'Tromsø',
      awayTeam: 'Odd',
      homeScore: 2,
      awayScore: 1,
      status: 'LIVE',
      minute: "72'",
      league: 'Eliteserien',
      homeFlag: '🇳🇴',
      awayFlag: '🇳🇴'
    },
    // 🆕 Norway Division 1
    {
      id: '39',
      homeTeam: 'Raufoss',
      awayTeam: 'Ranheim',
      homeScore: 1,
      awayScore: 1,
      status: 'LIVE',
      minute: "69'",
      league: 'Division 1',
      homeFlag: '🇳🇴',
      awayFlag: '🇳🇴'
    },
    {
      id: '40',
      homeTeam: 'Egersund',
      awayTeam: 'Kongsvinger',
      homeScore: 2,
      awayScore: 0,
      status: 'LIVE',
      minute: "51'",
      league: 'Division 1',
      homeFlag: '🇳🇴',
      awayFlag: '🇳🇴'
    },
    {
      id: '41',
      homeTeam: 'Stabæk',
      awayTeam: 'Sandnes Ulf',
      homeScore: 1,
      awayScore: 2,
      status: 'LIVE',
      minute: "83'",
      league: 'Division 1',
      homeFlag: '🇳🇴',
      awayFlag: '🇳🇴'
    },
    // 🆕 MLB (American Baseball)
    {
      id: '42',
      homeTeam: 'Yankees',
      awayTeam: 'Red Sox',
      homeScore: 7,
      awayScore: 4,
      status: 'LIVE',
      minute: "9th",
      league: 'MLB',
      homeFlag: '🇺🇸',
      awayFlag: '🇺🇸'
    },
    {
      id: '43',
      homeTeam: 'Dodgers',
      awayTeam: 'Giants',
      homeScore: 3,
      awayScore: 8,
      status: 'LIVE',
      minute: "7th",
      league: 'MLB',
      homeFlag: '🇺🇸',
      awayFlag: '🇺🇸'
    },
    {
      id: '44',
      homeTeam: 'Astros',
      awayTeam: 'Rangers',
      homeScore: 5,
      awayScore: 2,
      status: 'LIVE',
      minute: "6th",
      league: 'MLB',
      homeFlag: '🇺🇸',
      awayFlag: '🇺🇸'
    },
    {
      id: '45',
      homeTeam: 'Mets',
      awayTeam: 'Phillies',
      homeScore: 1,
      awayScore: 4,
      status: 'LIVE',
      minute: "8th",
      league: 'MLB',
      homeFlag: '🇺🇸',
      awayFlag: '🇺🇸'
    },
    {
      id: '46',
      homeTeam: 'Braves',
      awayTeam: 'Marlins',
      homeScore: 6,
      awayScore: 3,
      status: 'FT',
      minute: "FT",
      league: 'MLB',
      homeFlag: '🇺🇸',
      awayFlag: '🇺🇸'
    },
    {
      id: '47',
      homeTeam: 'Cubs',
      awayTeam: 'Cardinals',
      homeScore: 2,
      awayScore: 5,
      status: 'LIVE',
      minute: "5th",
      league: 'MLB',
      homeFlag: '🇺🇸',
      awayFlag: '🇺🇸'
    }
  ])

  return (
    <Card className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-slate-600 overflow-hidden">
      <div className="p-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-white font-semibold text-sm">⚽ Live Sports Scores</span>
          </div>
          <div className="text-xs text-slate-400">Real-time updates • {matches.filter(m => m.status === 'LIVE').length} live matches • 🆕 NEW LEAGUES ADDED!</div>
        </div>

        {/* Much Slower Scrolling Container - Perfect Speed! */}
        <div className="relative overflow-hidden h-16">
          <div
            className="flex items-center gap-6 whitespace-nowrap h-full"
            style={{
              animation: 'scrollRightSlow 800s linear infinite', // Even slower: 800s for more content
              width: 'max-content'
            }}
          >
            {/* More matches for longer continuous scroll */}
            {[...matches, ...matches].map((match, index) => (
              <div
                key={`${match.id}-${index}`}
                className="flex items-center gap-3 bg-slate-700/50 rounded-lg px-4 py-2 min-w-fit hover:bg-slate-600/50 transition-colors"
              >
                {/* League Badge with Enhanced Color Coding */}
                <div className={`text-xs font-medium min-w-fit px-2 py-1 rounded ${
                  match.league === 'Premier League' ? 'bg-purple-600/30 text-purple-300' :
                  match.league === 'La Liga' ? 'bg-orange-600/30 text-orange-300' :
                  match.league === 'Serie A' ? 'bg-blue-600/30 text-blue-300' :
                  match.league === 'Serie B' ? 'bg-blue-500/30 text-blue-200' :
                  match.league === 'Bundesliga' ? 'bg-red-600/30 text-red-300' :
                  match.league === 'Ligue 1' ? 'bg-cyan-600/30 text-cyan-300' :
                  match.league === 'UCL' ? 'bg-yellow-600/30 text-yellow-300' :
                  match.league === 'Super League' ? 'bg-green-600/30 text-green-300' :
                  match.league === 'Eredivisie' ? 'bg-orange-500/30 text-orange-200' :
                  match.league === 'Primeira Liga' ? 'bg-emerald-600/30 text-emerald-300' :
                  match.league === 'Scottish Prem' ? 'bg-indigo-600/30 text-indigo-300' :
                  match.league === 'Süper Lig' ? 'bg-pink-600/30 text-pink-300' :
                  match.league === 'FIFA Club WC' ? 'bg-gold-600/30 text-gold-300' :
                  match.league === 'U21 Euro' ? 'bg-violet-600/30 text-violet-300' :
                  match.league === 'Veikkausliiga' ? 'bg-blue-400/30 text-blue-200' :
                  match.league === 'Allsvenskan' ? 'bg-yellow-500/30 text-yellow-200' :
                  match.league === 'Superettan' ? 'bg-yellow-400/30 text-yellow-100' :
                  match.league === 'Eliteserien' ? 'bg-red-500/30 text-red-200' :
                  match.league === 'Division 1' ? 'bg-red-400/30 text-red-100' :
                  match.league === 'MLB' ? 'bg-blue-800/30 text-blue-100' :
                  'bg-gray-600/30 text-gray-300'
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

      {/* Slower CSS Animation for Better Experience */}
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
