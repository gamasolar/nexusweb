import { Button } from "@/components/ui/button";
import { Database, TrendingUp, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <main className="text-center space-y-12 p-8 max-w-4xl">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-white tracking-tight">
            NEXUS Intelligence System
          </h1>
          <p className="text-2xl text-slate-400">
            The World's Most Advanced Trading Intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-3">
            <Database className="h-12 w-12 text-blue-400 mx-auto" />
            <h3 className="text-xl font-semibold text-white">13.8M+ Candles</h3>
            <p className="text-slate-400 text-sm">
              Historical data from 2022 with real-time updates
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-3">
            <TrendingUp className="h-12 w-12 text-green-400 mx-auto" />
            <h3 className="text-xl font-semibold text-white">Advanced Indicators</h3>
            <p className="text-slate-400 text-sm">
              13+ technical indicators with multi-timeframe analysis
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-3">
            <Zap className="h-12 w-12 text-yellow-400 mx-auto" />
            <h3 className="text-xl font-semibold text-white">Signal Fusion</h3>
            <p className="text-slate-400 text-sm">
              AI-powered signal fusion with confidence scoring
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-12">
          <Link href="/test">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
              <Database className="mr-2 h-5 w-5" />
              Test PostgreSQL Connection
            </Button>
          </Link>

          <div className="text-sm text-slate-500">
            Verify connection with NEXUS database (13.8M candles)
          </div>
        </div>
      </main>
    </div>
  );
}
