import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Calculator, ShieldAlert, CheckCircle2 } from 'lucide-react';

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
              <div className="p-2 rounded-xl bg-blue-500/10 text-cyan-400 border border-blue-500/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Mathematical Specification</h3>
                <p className="text-xs text-slate-400">ChargeSync India • Friction Advisor Scoring Engine (CSDS &amp; ECS)</p>
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
            
            {/* CSDS Equation */}
            <div className="p-5 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-base">
                <Calculator className="w-5 h-5 text-cyan-400" />
                <span>1. Charging Stop Desirability Score (CSDS)</span>
              </div>
              
              <p className="text-slate-400">
                Measures the predicted friction-free experience of a charging stop. Only signals with <code className="text-cyan-300">available == true</code> and non-null risk scores are included in the summation.
              </p>

              <div className="p-4 rounded-lg bg-slate-950 border border-blue-900/40 text-center font-mono text-cyan-400 text-base font-bold">
                CSDS = 100 × [ ∑<sub>available</sub> (wᵢ × (1 - rᵢ)) / ∑<sub>available</sub> wᵢ ]
              </div>

              <div className="text-xs space-y-1 text-slate-400">
                <div>• <strong className="text-slate-200">wᵢ</strong>: Signal weight assigned to domain dimension <code className="text-cyan-300">i</code>.</div>
                <div>• <strong className="text-slate-200">rᵢ</strong>: Normalized friction risk score [0..1] (0 = zero friction, 1 = high friction/outage).</div>
                <div>• <strong className="text-slate-200">1 - rᵢ</strong>: Desirability term (inverted friction).</div>
              </div>
            </div>

            {/* ECS Equation */}
            <div className="p-5 rounded-xl bg-slate-900/90 border border-blue-500/30 space-y-3">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                <span>2. Evidence Confidence Score (ECS)</span>
              </div>
              
              <p className="text-slate-400">
                Quantifies overall data quality and confidence across all four signal domains. Signals marked unavailable default to <code className="text-blue-300">cᵢ = 0.0</code>.
              </p>

              <div className="p-4 rounded-lg bg-slate-950 border border-blue-900/40 text-center font-mono text-blue-400 text-base font-bold">
                ECS = 100 × ∑ (wᵢ × cᵢ)
              </div>

              <div className="text-xs space-y-1 text-slate-400">
                <div>• <strong className="text-slate-200">cᵢ</strong>: Signal confidence score [0..1].</div>
                <div>• Total weight sum = 0.30 + 0.35 + 0.20 + 0.15 = <span className="text-cyan-400 font-mono">1.00</span>.</div>
              </div>
            </div>

            {/* Suppression Rule */}
            <div className="p-5 rounded-xl bg-slate-900/90 border border-indigo-500/40 space-y-3">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-base">
                <ShieldAlert className="w-5 h-5 text-indigo-400" />
                <span>3. Strict Suppression Rule</span>
              </div>

              <div className="p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 font-mono text-indigo-200 text-xs sm:text-sm">
                If ECS &lt; 55.0% ➔ Display Score = "Suppressed"
              </div>

              <p className="text-slate-400">
                When key sensor or review data is unavailable (e.g. Stop C where venue and hardware signals are missing), raw mathematical calculations may yield artificially high scores (like 100%). The Suppression Rule hides the numeric score to ensure EV drivers are not misled by ungrounded numbers.
              </p>
            </div>

            {/* Signal Weights Table */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-900/40">
              <h4 className="font-bold text-white mb-2">Default Signal Weights Matrix</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs text-slate-300">
                  <thead className="text-slate-500 border-b border-blue-900/40 text-[11px] uppercase">
                    <tr>
                      <th className="py-2">Signal Domain</th>
                      <th className="py-2">Weight (wᵢ)</th>
                      <th className="py-2">Primary Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-900/30">
                    <tr>
                      <td className="py-2 text-blue-400 font-sans font-medium">Venue Pressure</td>
                      <td className="py-2">0.30 (30%)</td>
                      <td className="py-2 text-slate-400 font-sans">Plaza &amp; amenity occupancy</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-cyan-400 font-sans font-medium">Hardware Warnings</td>
                      <td className="py-2">0.35 (35%)</td>
                      <td className="py-2 text-slate-400 font-sans">Charger reviews &amp; fault logs</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-sky-400 font-sans font-medium">Regional Signal</td>
                      <td className="py-2">0.20 (20%)</td>
                      <td className="py-2 text-slate-400 font-sans">Expressway search volume</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-indigo-400 font-sans font-medium">Corridor Alerts</td>
                      <td className="py-2">0.15 (15%)</td>
                      <td className="py-2 text-slate-400 font-sans">NH 275 traffic disruptions</td>
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
