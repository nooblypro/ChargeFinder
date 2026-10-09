import React from 'react';
import { 
  HelpCircle, 
  MapPin, 
  Zap, 
  ChevronRight,
  ShieldAlert,
  Plug,
  CreditCard
} from 'lucide-react';
import type { HubFixture, SignalWeightConfig, HardwareDiagnosticItem } from '../types/charging';
import { evaluateHubScore } from '../utils/scoring';

interface HubCardProps {
  fixture: HubFixture;
  weights: SignalWeightConfig;
  onInspectEvidence: (fixture: HubFixture) => void;
  isSelected: boolean;
}

import { getVerdict, type VerdictType } from '../utils/verdict';

export const HubCard: React.FC<HubCardProps> = ({
  fixture,
  weights,
  onInspectEvidence,
  isSelected,
}) => {
  const isUnassessed = fixture.assessmentStatus === 'unassessed' || !fixture.signals;

  const scoreResult = fixture.signals ? evaluateHubScore(fixture.signals, weights) : null;
  const csdsRaw = scoreResult?.csdsRaw ?? 0;
  const ecsScore = scoreResult?.ecsScore ?? 0;
  const isSuppressed = scoreResult?.isSuppressed ?? true;
  const breakdown = scoreResult?.breakdown ?? [];

  const { verdict, badgeStyle, icon, subtitle } = isUnassessed
    ? {
        verdict: 'NOT YET ASSESSED' as VerdictType,
        badgeStyle: 'bg-zinc-800/80 text-zinc-300 border-zinc-700',
        icon: <HelpCircle className="w-5 h-5 text-zinc-400" />,
        subtitle: 'Directory entry only. Run friction assessment to calculate live reliability.',
      }
    : getVerdict(csdsRaw, isSuppressed);

  const hardwareSignal = breakdown.find((s) => s.type === 'hardware');
  const diagnostics: HardwareDiagnosticItem[] = hardwareSignal?.diagnostics || [
    { type: 'physical', status: isUnassessed ? 'unavailable' : 'ok', label: 'Connector & Cable' },
    { type: 'software', status: isUnassessed ? 'unavailable' : 'ok', label: 'App & Payment' },
    { type: 'session', status: isUnassessed ? 'unavailable' : 'ok', label: 'Charge Speed & Stability' },
  ];

  const diagIcons = {
    physical: <Plug className="w-3 h-3" />,
    software: <CreditCard className="w-3 h-3" />,
    session: <Zap className="w-3 h-3" />,
  };

  return (
    <div
      className={`bg-[#0c101c] border rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 ${
        isSelected ? 'border-cyan-500 ring-1 ring-cyan-500/40 shadow-2xl' : 'border-slate-800/80 hover:border-slate-700'
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{fixture.location}</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">{fixture.name}</h3>
          </div>

          <span className="px-2.5 py-1 rounded-md bg-slate-950 text-slate-400 font-mono text-xs border border-slate-800">
            Km {fixture.distanceKm}
          </span>
        </div>

        {/* Specs Pill Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mb-5 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{fixture.operator}</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px] bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {fixture.fastChargers}
          </div>
        </div>

        {/* Primary Verdict Section */}
        <div className="mb-5 bg-slate-950/80 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Stop Recommendation
            </span>
            {fixture.freshness && (
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                {fixture.freshness}
              </span>
            )}
          </div>

          {/* Large Mapped Verdict */}
          <div className="flex items-center gap-3 mt-1 mb-2">
            <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-sm font-extrabold tracking-wider ${badgeStyle}`}>
              {icon}
              <span>{verdict}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            {subtitle}
          </p>

          {/* Secondary Metric Row */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            {isUnassessed ? (
              <span className="text-slate-400 flex items-center gap-1 font-sans text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                Friction score pending signal assessment
              </span>
            ) : isSuppressed ? (
              <span className="text-zinc-400 flex items-center gap-1 font-sans text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
                Score hidden due to missing signal data
              </span>
            ) : (
              <>
                <span>Stop Quality: <strong className="text-white">{csdsRaw.toFixed(1)}%</strong></span>
                <span>Data Confidence: <strong className="text-slate-300">{ecsScore.toFixed(1)}%</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Granular Hardware Diagnostics Bar */}
        <div className="mb-5 bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Hardware Diagnostics</span>
            <span className="text-[9px] font-mono text-slate-500">Vector Breakdown</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            {diagnostics.map((diag) => {
              let statusBg = "bg-emerald-950/40 text-emerald-300 border-emerald-900/50";
              if (diag.status === 'warning') statusBg = "bg-amber-950/40 text-amber-300 border-amber-900/50";
              if (diag.status === 'error') statusBg = "bg-rose-950/40 text-rose-300 border-rose-900/50";
              if (diag.status === 'unavailable' || isUnassessed) statusBg = "bg-slate-900/40 text-slate-500 border-slate-800";

              return (
                <div
                  key={diag.type}
                  className={`p-1.5 rounded-md border flex flex-col items-center text-center gap-1 ${statusBg}`}
                  title={`${diag.label}: ${diag.status.toUpperCase()}`}
                >
                  {diagIcons[diag.type]}
                  <span className="text-[10px] font-medium capitalize truncate w-full">{diag.type}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Directory Info / Observed Signals Checklist */}
        <div className="space-y-2 mb-6">
          {isUnassessed ? (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Directory Record Details
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Data Source:</span>
                  <span className="font-mono text-slate-200">{fixture.directoryInfo?.source || 'OpenStreetMap'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Directory Sync:</span>
                  <span className="font-mono text-slate-300">{fixture.directoryInfo?.updatedAgo || '4 hours ago'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Connectors & Access:</span>
                  <span className="font-mono text-slate-300">{fixture.directoryInfo?.access || '24/7 Plaza Entry'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Observed Signals Checklist
              </div>
              
              <ul className="space-y-2 text-xs text-slate-300">
                {breakdown.map((signal) => {
                  let dotColor = "bg-emerald-400";
                  let textStyle = "text-slate-300";

                  if (!signal.available) {
                    dotColor = "bg-slate-600";
                    textStyle = "text-slate-500 line-through";
                  } else if (signal.r_value !== null && signal.r_value > 0.5) {
                    dotColor = "bg-rose-400";
                    textStyle = "text-rose-300 font-medium";
                  } else if (signal.r_value !== null && signal.r_value > 0.2) {
                    dotColor = "bg-amber-400";
                    textStyle = "text-amber-200";
                  }

                  return (
                    <li key={signal.type} className="flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
                      <div className="flex justify-between w-full">
                        <span className={`font-medium ${textStyle}`}>{signal.label}:</span>
                        <span className="text-slate-400 text-right truncate max-w-[170px] pl-2">{signal.text}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Dominant Primary CTA */}
      <button
        onClick={() => onInspectEvidence(fixture)}
        className={`w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition border cursor-pointer shadow-sm ${
          isUnassessed
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-cyan-400/30'
            : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
        }`}
      >
        <span>{isUnassessed ? 'Assess Stop Friction' : 'Why this stop?'}</span>
        <ChevronRight className="w-4 h-4 text-slate-300" />
      </button>
    </div>
  );
};
