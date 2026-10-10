import type React from 'react';
import { Zap, BookOpen } from 'lucide-react';

interface HeaderProps {
  onOpenFormula?: () => void;
  stationCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFormula, stationCount = 0 }) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 mb-3 sm:mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand & Context */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0 flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 fill-emerald-400/20" />
          </div>

          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5 truncate">
              ChargeFinder <span className="text-emerald-400">India</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">
              Real-Time EV Station &amp; Fullness Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {stationCount > 0 && (
            <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[10px] sm:text-xs font-mono text-emerald-300">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline">{stationCount} Stations Online</span>
              <span className="sm:hidden">{stationCount} Online</span>
            </div>
          )}

          {onOpenFormula && (
            <button
              onClick={onOpenFormula}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/40 text-[10px] sm:text-xs font-medium text-slate-200 hover:text-cyan-300 transition cursor-pointer"
              title="View how fullness probability and confidence scores are calculated"
            >
              <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Fullness Formula</span>
              <span className="sm:hidden">Formula</span>
            </button>
          )}

          {/* Live Status Dot */}
          <div className="hidden xs:flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] sm:text-xs text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-medium text-slate-300 hidden sm:inline">Live AI Sync</span>
            <span className="font-medium text-slate-300 sm:hidden">AI Sync</span>
          </div>
        </div>

      </div>
    </header>
  );
};
