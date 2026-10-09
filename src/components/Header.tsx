import type React from 'react';
import { Zap, BookOpen } from 'lucide-react';

interface HeaderProps {
  onOpenFormula?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFormula }) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Route Context */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              ChargeSync <span className="text-emerald-400">India</span>
            </h1>
            <p className="text-xs text-slate-400">
              Bengaluru–Mysuru Expressway (NH-275) Friction Advisor
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {onOpenFormula && (
            <button
              onClick={onOpenFormula}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/40 text-xs font-medium text-slate-200 hover:text-cyan-300 transition cursor-pointer"
              title="View mathematical scoring specification and suppression logic"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Scoring Methodology</span>
              <span className="sm:hidden">Math</span>
            </button>
          )}

          {/* Minimal Live Status Dot */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-300">Live Monitoring</span>
          </div>
        </div>

      </div>
    </header>
  );
};
