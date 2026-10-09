import type React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import type { HubFixture, SignalWeightConfig } from '../types/charging';
import { evaluateHubScore } from '../utils/scoring';
import { getVerdict } from '../utils/verdict';

interface ExpresswayMapProps {
  fixtures: HubFixture[];
  selectedHubId: string | null;
  onSelectHub: (id: string) => void;
  weights: SignalWeightConfig;
}

export const ExpresswayMap: React.FC<ExpresswayMapProps> = ({
  fixtures,
  selectedHubId,
  onSelectHub,
  weights,
}) => {
  return (
    <div className="bg-slate-900 rounded-2xl p-5 mb-8 border border-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <div>
          <h2 className="text-base font-semibold text-white">Bengaluru–Mysuru Expressway Corridor (NH-275)</h2>
          <p className="text-xs text-slate-400">118 km Expressway • 3 Main Monitored Charging Hubs</p>
        </div>
        
        <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
          <span>Bengaluru (Km 0)</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span>Mysuru (Km 118)</span>
        </div>
      </div>

      {/* Visual Route Timeline */}
      <div className="relative pt-4 pb-2 px-4 sm:px-12">
        {/* Background Expressway Line */}
        <div className="absolute top-1/2 left-6 right-6 h-1.5 bg-slate-800 rounded-full -translate-y-1/2 overflow-hidden">
          <div className="h-full bg-slate-700"></div>
        </div>

        {/* Corridor Hub Markers */}
        <div className="relative z-10 flex justify-between items-center">
          {/* Start Point */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-slate-500"></div>
            <span className="text-[11px] font-medium text-slate-400 mt-2">Bengaluru</span>
            <span className="text-[10px] font-mono text-slate-500">Km 0</span>
          </div>

          {/* Clean Hub Waypoints */}
          {[...fixtures]
            .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
            .map((fixture) => {
              const isUnassessed = fixture.assessmentStatus === 'unassessed' || !fixture.signals;
              const score = fixture.signals ? evaluateHubScore(fixture.signals, weights) : null;
              const { verdict } = isUnassessed
                ? { verdict: 'NOT YET ASSESSED' }
                : getVerdict(score?.csdsRaw ?? 0, score?.isSuppressed ?? true);
              const isSelected = selectedHubId === fixture.id;

              let dotColor = "bg-emerald-400 ring-emerald-500/30";
              if (isUnassessed || verdict === 'NOT YET ASSESSED') {
                dotColor = "bg-zinc-600 ring-zinc-700/40";
              } else if (verdict === 'VERIFY FIRST') {
                dotColor = "bg-zinc-400 ring-zinc-500/30";
              } else if (verdict === 'CAUTION') {
                dotColor = "bg-amber-400 ring-amber-500/30";
              } else if (verdict === 'AVOID') {
                dotColor = "bg-rose-400 ring-rose-500/30";
              }

              return (
                <div
                  key={fixture.id}
                  onClick={() => onSelectHub(fixture.id)}
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200 transform ${
                    isSelected ? 'scale-110 z-20' : 'hover:scale-105'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border border-slate-900 shadow-md ring-4 ${dotColor} ${
                      isSelected ? 'ring-emerald-400 ring-offset-2 ring-offset-slate-950' : ''
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-950" />
                  </div>
                  
                  <span className="text-xs font-semibold text-slate-200 mt-2 text-center max-w-[90px] sm:max-w-[120px] truncate">
                    {fixture.name.replace(" Hub", "")}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Km {fixture.distanceKm}</span>
                </div>
              );
            })}

          {/* End Point */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-slate-500"></div>
            <span className="text-[11px] font-medium text-slate-400 mt-2">Mysuru</span>
            <span className="text-[10px] font-mono text-slate-500">Km 118</span>
          </div>
        </div>
      </div>
    </div>
  );
};
