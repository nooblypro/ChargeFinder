import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShieldAlert, 
  Building2, 
  Wrench, 
  TrendingUp, 
  Radio, 
  Plug,
  CreditCard,
  Zap,
  Sparkles,
  RefreshCw,
  Calculator,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { HubFixture, SignalWeightConfig, SignalType } from '../types/charging';
import { evaluateHubScore } from '../utils/scoring';
import { ProgressiveStepper } from './ProgressiveStepper';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  fixture: HubFixture | null;
  weights: SignalWeightConfig;
  onTriggerAssessment?: (hubId: string) => void;
  currentSteppingIndex?: number;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  fixture,
  weights,
  onTriggerAssessment,
  currentSteppingIndex = 0,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'signals' | 'math' | 'raw'>('signals');

  if (!fixture) return null;

  const isUnassessed = fixture.assessmentStatus === 'unassessed' || !fixture.signals;
  const isAssessing = fixture.assessmentStatus === 'assessing';

  const scoreResult = fixture.signals ? evaluateHubScore(fixture.signals, weights) : null;
  const csdsRaw = scoreResult?.csdsRaw ?? 0;
  const ecsScore = scoreResult?.ecsScore ?? 0;
  const isSuppressed = scoreResult?.isSuppressed ?? true;
  const breakdown = scoreResult?.breakdown ?? [];

  const fullnessPercent = Math.max(5, Math.min(95, Math.round(100 - csdsRaw)));

  let recommendationLabel = 'Verify First';
  let recommendationColor = 'text-amber-400 bg-amber-950/40 border-amber-800/40';

  if (!isSuppressed) {
    if (fullnessPercent < 40) {
      recommendationLabel = 'Available';
      recommendationColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
    } else if (fullnessPercent < 70) {
      recommendationLabel = 'Moderate';
      recommendationColor = 'text-amber-400 bg-amber-950/40 border-amber-800/40';
    } else {
      recommendationLabel = 'Likely Full';
      recommendationColor = 'text-rose-400 bg-rose-950/40 border-rose-800/40';
    }
  }

  const signalIcons: Record<SignalType, React.ReactNode> = {
    venue: <Building2 className="w-4 h-4 text-blue-400" />,
    hardware: <Wrench className="w-4 h-4 text-cyan-400" />,
    regional: <TrendingUp className="w-4 h-4 text-sky-400" />,
    corridor: <Radio className="w-4 h-4 text-indigo-400" />,
  };

  const diagIcons = {
    physical: <Plug className="w-4 h-4" />,
    software: <CreditCard className="w-4 h-4" />,
    session: <Zap className="w-4 h-4" />,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-full max-w-xl bg-[#090d16] border-l border-slate-800 shadow-2xl h-full flex flex-col z-10 overflow-y-auto"
          >
            {/* Minimal Header */}
            <div className="sticky top-0 z-20 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 p-3.5 sm:p-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-bold text-white tracking-tight truncate">
                  {fixture.name}
                </h2>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-400 mt-0.5 font-sans">
                  <span className="font-semibold text-cyan-400 truncate">{fixture.operator}</span>
                  {fixture.location && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[160px] sm:max-w-[240px]">{fixture.location}</span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer border border-slate-800 flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Main Content Body */}
            <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 flex-1">

              {/* Assessment Card View */}
              {isAssessing ? (
                <ProgressiveStepper currentStepIndex={currentSteppingIndex} isReassessing={!!fixture.signals} />
              ) : isUnassessed ? (
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Unassessed Directory Entry
                    </span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-xs border border-slate-700">
                      Pending Assessment
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Real-time friction intelligence (venue pressure, hardware reliability, regional search trends, and corridor alerts) has not yet been evaluated for this station.
                  </p>

                  <button
                    onClick={() => onTriggerAssessment && onTriggerAssessment(fixture.id)}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Assess Friction Intelligence Now</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Minimalist Score Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-4">
                    
                    {/* Header Status & Re-assess */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${recommendationColor}`}>
                          {recommendationLabel}
                        </span>
                        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                          {fullnessPercent >= 70 ? 'Queue Expected' : fullnessPercent >= 40 ? 'Moderate Stalls' : 'Bays Available'}
                        </span>
                      </div>

                      <button
                        onClick={() => onTriggerAssessment && onTriggerAssessment(fixture.id)}
                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Re-assess</span>
                      </button>
                    </div>

                    {/* 2 Core Direct Metrics */}
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      
                      {/* Metric 1: Fullness % */}
                      <div>
                        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                          Fullness Risk
                        </div>
                        <div className={`text-3xl sm:text-4xl font-black font-mono mt-1 ${
                          fullnessPercent >= 70 ? 'text-rose-400' : fullnessPercent >= 40 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {isSuppressed ? 'Pending' : `${fullnessPercent}%`}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                          Chance that charging bays are currently occupied.
                        </p>
                      </div>

                      {/* Metric 2: Confidence % */}
                      <div>
                        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                          Confidence
                        </div>
                        <div className="text-3xl sm:text-4xl font-black font-mono mt-1 text-cyan-300">
                          {ecsScore.toFixed(0)}%
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                          Confidence in this prediction based on real reviews &amp; data.
                        </p>
                      </div>

                    </div>

                    {/* Minimal Freshness Footer */}
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                      <span>Last Updated:</span>
                      <span className="text-slate-200 font-semibold truncate max-w-[220px] sm:max-w-none">
                        {fixture.freshness || 'Live Sync'}
                      </span>
                    </div>

                    {isSuppressed && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-start gap-2.5 text-xs text-amber-200">
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <p>
                          Score is hidden because data coverage ({ecsScore.toFixed(0)}%) is below the required 55% threshold. Verify station manually.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Clean Essential Signal Insights */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Friction Evidence Summary
                    </h3>

                    {breakdown.map((item) => (
                      <div
                        key={item.type}
                        className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3"
                      >
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 shrink-0 mt-0.5">
                          {signalIcons[item.type]}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="text-xs font-bold text-white tracking-tight">{item.label}</h4>
                            {item.available ? (
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                                Verified Active
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                Unavailable
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {item.text}
                          </p>

                          {/* Hardware diagnostics breakdown if present */}
                          {item.type === 'hardware' && item.diagnostics && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.diagnostics.map((diag) => (
                                <span
                                  key={diag.type}
                                  className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 border ${
                                    diag.status === 'ok'
                                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                                      : diag.status === 'warning'
                                      ? 'bg-amber-950/60 text-amber-300 border-amber-800/50'
                                      : 'bg-rose-950/60 text-rose-300 border-rose-800/50'
                                  }`}
                                >
                                  {diagIcons[diag.type]}
                                  <span className="capitalize">{diag.type}: {diag.status}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Collapsible Developer Math Audit Section */}
                  <div className="pt-2">
                    <button
                      onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Technical Math & Audit Logs</span>
                      </div>
                      {showTechnicalDetails ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    <AnimatePresence>
                      {showTechnicalDetails && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 pt-4 overflow-hidden"
                        >
                          {/* Inner Technical Tabs */}
                          <div className="flex border-b border-slate-800">
                            <button
                              onClick={() => setActiveTab('signals')}
                              className={`py-2 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
                                activeTab === 'signals' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400'
                              }`}
                            >
                              Raw Signal Values
                            </button>
                            <button
                              onClick={() => setActiveTab('math')}
                              className={`py-2 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
                                activeTab === 'math' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400'
                              }`}
                            >
                              Substituted Formulas
                            </button>
                            <button
                              onClick={() => setActiveTab('raw')}
                              className={`py-2 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
                                activeTab === 'raw' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400'
                              }`}
                            >
                              Raw JSON
                            </button>
                          </div>

                          {activeTab === 'signals' && (
                            <div className="space-y-2 text-xs font-mono">
                              {breakdown.map((item) => (
                                <div key={item.type} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                                  <div className="flex justify-between font-bold text-white">
                                    <span>{item.label}</span>
                                    <span className="text-cyan-400">Weight: {(item.weight * 100).toFixed(0)}%</span>
                                  </div>
                                  <div className="flex justify-between text-slate-400 text-[11px]">
                                    <span>Risk (r): {item.r_value !== null ? item.r_value.toFixed(2) : 'N/A'}</span>
                                    <span>Confidence (c): {item.c_value.toFixed(2)}</span>
                                    <span>Term: {item.effectiveFrictionTerm !== null ? item.effectiveFrictionTerm.toFixed(3) : 'Excluded'}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {activeTab === 'math' && (
                            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 space-y-2">
                              <div>CSDS Formula: 100 × [ ∑(wᵢ × (1 - rᵢ)) / ∑ wᵢ ]</div>
                              <div>Raw CSDS Result: {csdsRaw.toFixed(1)}%</div>
                              <div>ECS Formula: 100 × ∑(wᵢ × cᵢ)</div>
                              <div>Final ECS Result: {ecsScore.toFixed(1)}%</div>
                              <div>Suppression: {isSuppressed ? 'Triggered (<55%)' : 'Passed (≥55%)'}</div>
                            </div>
                          )}

                          {activeTab === 'raw' && (
                            <pre className="p-3 rounded-lg bg-slate-950 text-cyan-300 font-mono text-[11px] border border-slate-800 overflow-x-auto max-h-60">
                              {JSON.stringify(fixture, null, 2)}
                            </pre>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
