import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, ShieldAlert, CheckCircle2, Gauge } from 'lucide-react';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaModal: React.FC<FormulaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative w-full max-w-3xl glass-panel rounded-2xl bg-slate-950 border border-blue-900/40 p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-blue-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-cyan-400 border border-blue-500/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Fullness &amp; Availability Engine</h3>
                <p className="text-xs text-slate-400">ChargeFinder India • Occupancy Probability &amp; Confidence Model</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-300">
            
            {/* Fullness Probability Equation */}
            <div className="p-5 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-base">
                <Gauge className="w-5 h-5 text-cyan-400" />
                <span>1. Fullness Probability Percentage (P(Full))</span>
              </div>
              
              <p className="text-slate-400">
                Predicts the probability that all charging stalls are currently occupied or facing an active queue, calculated across available multi-source signals (i in available dimensions):
              </p>

              <div className="p-4 rounded-lg bg-slate-950 border border-blue-900/40 text-center font-mono text-cyan-400 text-base font-bold">
                P(Full) = 100 × [ ∑<sub>available</sub> (wᵢ × rᵢ) / ∑<sub>available</sub> wᵢ ]
              </div>

              <div className="text-xs space-y-1 text-slate-400">
                <div>• <strong className="text-slate-200">wᵢ</strong>: Signal weight assigned to data dimension <code className="text-cyan-300">i</code>.</div>
                <div>• <strong className="text-slate-200">rᵢ</strong>: Normalized congestion risk score [0..1] (0 = empty stalls, 1 = heavy queue / stalls occupied).</div>
                <div>• <strong className="text-slate-200">Availability Rate</strong>: Availability = 100% - P(Full).</div>
              </div>
            </div>

            {/* Confidence Score Equation */}
            <div className="p-5 rounded-xl bg-slate-900/90 border border-blue-500/30 space-y-3">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                <span>2. Evidence Confidence Percentage (Confidence Score)</span>
              </div>
              
              <p className="text-slate-400">
                Quantifies the completeness, freshness, and sensor coverage of live data signals. Signals marked unavailable default to <code className="text-blue-300">cᵢ = 0.0</code>:
              </p>

              <div className="p-4 rounded-lg bg-slate-950 border border-blue-900/40 text-center font-mono text-blue-400 text-base font-bold">
                Confidence = 100 × ∑ (wᵢ × cᵢ)
              </div>

              <div className="text-xs space-y-1 text-slate-400">
                <div>• <strong className="text-slate-200">cᵢ</strong>: Sensor / review freshness &amp; confidence metric [0..1].</div>
                <div>• Total weights sum to <span className="text-cyan-400 font-mono">1.00 (100%)</span>.</div>
              </div>
            </div>

            {/* Suppression Threshold */}
            <div className="p-5 rounded-xl bg-slate-900/90 border border-indigo-500/40 space-y-3">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-base">
                <ShieldAlert className="w-5 h-5 text-indigo-400" />
                <span>3. Low Confidence Guardrail</span>
              </div>

              <div className="p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 font-mono text-indigo-200 text-xs sm:text-sm">
                If Confidence &lt; 50.0% ➔ Display Status = "Verify on Operator App"
              </div>

              <p className="text-slate-400">
                When key sensor data is absent (e.g. newly commissioned chargers with zero recent check-ins), numeric predictions can mislead drivers. ChargeFinder flags these stations as "Verify First" to prevent unexpected delays.
              </p>
            </div>

            {/* Signal Weights Table */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-900/40">
              <h4 className="font-bold text-white mb-2">Signal Weights Breakdown</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs text-slate-300">
                  <thead className="text-slate-500 border-b border-blue-900/40 text-[11px] uppercase">
                    <tr>
                      <th className="py-2">Signal Domain</th>
                      <th className="py-2">Weight (wᵢ)</th>
                      <th className="py-2">Predictive Factor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-900/30">
                    <tr>
                      <td className="py-2 text-blue-400 font-sans font-medium">Venue &amp; Mall Occupancy</td>
                      <td className="py-2">0.35 (35%)</td>
                      <td className="py-2 text-slate-400 font-sans">Retail foot-traffic, parking garage saturation</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-cyan-400 font-sans font-medium">Charger Hardware Telemetry</td>
                      <td className="py-2">0.35 (35%)</td>
                      <td className="py-2 text-slate-400 font-sans">Active connector sessions, power output, fault codes</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-sky-400 font-sans font-medium">Recent Review &amp; Queue Sentiment</td>
                      <td className="py-2">0.15 (15%)</td>
                      <td className="py-2 text-slate-400 font-sans">NLP analysis of recent driver queue reports</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-indigo-400 font-sans font-medium">Regional EV Traffic Velocity</td>
                      <td className="py-2">0.15 (15%)</td>
                      <td className="py-2 text-slate-400 font-sans">Corridor travel pace and peak hour density</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
