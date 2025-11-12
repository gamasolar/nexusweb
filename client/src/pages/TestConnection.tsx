import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database, CheckCircle, XCircle } from "lucide-react";

export default function TestConnection() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = trpc.nexus.getStats.useQuery();
  const { data: candles, isLoading: candlesLoading, error: candlesError, refetch: refetchCandles } = trpc.nexus.getLatestCandles.useQuery({
    symbol: "BTCUSDT",
    timeframe: "1m",
    limit: 10,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">NEXUS Intelligence System</h1>
          <p className="text-slate-400">PostgreSQL Connection Test</p>
        </div>

        {/* Database Stats Card */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Database className="h-5 w-5" />
              Database Statistics
            </CardTitle>
            <CardDescription className="text-slate-400">
              Connection status and data overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsLoading && (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading stats...
              </div>
            )}

            {statsError && (
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="h-5 w-5" />
                Error: {statsError.message}
              </div>
            )}

            {stats && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  Connected to PostgreSQL
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="text-sm text-slate-400">Total Candles</div>
                    <div className="text-2xl font-bold text-white">
                      {stats.totalCandles.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="text-sm text-slate-400">Symbols</div>
                    <div className="text-2xl font-bold text-white">
                      {stats.symbols?.length || 0}
                    </div>
                  </div>
                </div>

                {stats.symbols && stats.symbols.length > 0 && (
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="text-sm text-slate-400 mb-2">Available Symbols</div>
                    <div className="flex flex-wrap gap-2">
                      {stats.symbols.map((symbol: string) => (
                        <span
                          key={symbol}
                          className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                        >
                          {symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={() => refetchStats()} variant="outline" className="w-full">
                  Refresh Stats
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Candles Card */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Latest BTCUSDT Candles</CardTitle>
            <CardDescription className="text-slate-400">
              Last 10 candles from historical data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {candlesLoading && (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading candles...
              </div>
            )}

            {candlesError && (
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="h-5 w-5" />
                Error: {candlesError.message}
              </div>
            )}

            {candles && candles.length > 0 && (
              <div className="space-y-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-slate-400">Timestamp</th>
                        <th className="text-right p-2 text-slate-400">Open</th>
                        <th className="text-right p-2 text-slate-400">High</th>
                        <th className="text-right p-2 text-slate-400">Low</th>
                        <th className="text-right p-2 text-slate-400">Close</th>
                        <th className="text-right p-2 text-slate-400">Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candles.map((candle: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-800">
                          <td className="p-2 text-slate-300">
                            {new Date(candle.timestamp).toLocaleString()}
                          </td>
                          <td className="text-right p-2 text-slate-300">
                            ${parseFloat(candle.open).toFixed(2)}
                          </td>
                          <td className="text-right p-2 text-green-400">
                            ${parseFloat(candle.high).toFixed(2)}
                          </td>
                          <td className="text-right p-2 text-red-400">
                            ${parseFloat(candle.low).toFixed(2)}
                          </td>
                          <td className="text-right p-2 text-slate-300">
                            ${parseFloat(candle.close).toFixed(2)}
                          </td>
                          <td className="text-right p-2 text-slate-400">
                            {parseFloat(candle.volume).toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button onClick={() => refetchCandles()} variant="outline" className="w-full">
                  Refresh Candles
                </Button>
              </div>
            )}

            {candles && candles.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                No candles found for BTCUSDT
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
