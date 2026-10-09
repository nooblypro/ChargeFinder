import React from 'react';
import { CheckCircle2, Loader2, Circle, Sparkles, Building2, Wrench, TrendingUp, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export interface StepItem {
  id: number;
  label: string;
  subtext: string;
  icon: React.ReactNode;
}

const ENRICHMENT_STEPS: StepItem[] = [
  {
    id: 0,
    label: 'Venue Pressure',
    subtext: 'Scanning Google Maps plaza occupancy & foot traffic...',
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    id: 1,
    label: 'Hardware Diagnostics',
    subtext: 'Analyzing review sentiment & connector vector health...',
    icon: <Wrench className="w-4 h-4" />,
  },
  {
    id: 2,
    label: 'Regional Baseline',
    subtext: 'Evaluating Google Trends search volume & interest...',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: 3,
    label: 'Corridor Alerts',
    subtext: 'Cross-referencing real-time traffic & disruption reports...',
    icon: <Radio className="w-4 h-4" />,
  },
];

interface ProgressiveStepperProps {
  currentStepIndex: number;
  isReassessing?: boolean;
}

export const ProgressiveStepper: React.FC<ProgressiveStepperProps> = ({
  currentStepIndex,
  isReassessing = false,
}) => {
  const progressPercent = Math.min(100, Math.round(((currentStepIndex + 1) / 4) * 100));

  return (
    <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              {isReassessing ? 'Re-assessing Friction Signals' : 'Asynchronous Signal Enrichment'}
            </h4>
            <p className="text-xs text-slate-400">
              Querying proxy engines across 4 multi-vector signal streams
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-500/30">
          {progressPercent}%
        </span>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Stepper Steps List */}
      <div className="space-y-3 pt-1">
        {ENRICHMENT_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex || currentStepIndex >= 4;
          const isActive = idx === currentStepIndex && currentStepIndex < 4;
          const isPending = idx > currentStepIndex;

          let stepBg = 'bg-slate-900/40 border-slate-800/80 text-slate-400';
          if (isDone) stepBg = 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300';
          if (isActive) stepBg = 'bg-cyan-950/40 border-cyan-500/50 text-white ring-1 ring-cyan-500/30';

          return (
            <div
              key={step.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all duration-200 ${stepBg}`}
            >
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isActive && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
                  {isPending && <Circle className="w-4 h-4 text-slate-600" />}
                </div>

                <div>
                  <div className="text-xs font-semibold flex items-center gap-1.5">
                    <span className="text-slate-400">{step.icon}</span>
                    <span>{step.label}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {step.subtext}
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono shrink-0 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                Step {idx + 1}/4
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
