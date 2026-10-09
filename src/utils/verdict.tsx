import type React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

export type VerdictType = 'RECOMMENDED' | 'CAUTION' | 'AVOID' | 'VERIFY FIRST' | 'NOT YET ASSESSED';

export interface VerdictInfo {
  verdict: VerdictType;
  badgeStyle: string;
  icon: React.ReactNode;
  subtitle: string;
}

export function getVerdict(csdsRaw: number, isSuppressed: boolean): VerdictInfo {
  if (isSuppressed) {
    return {
      verdict: 'VERIFY FIRST',
      badgeStyle: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      icon: <HelpCircle className="w-5 h-5 text-zinc-400" />,
      subtitle: 'Data confidence low. Check operator app before stopping.',
    };
  }
  if (csdsRaw >= 70) {
    return {
      verdict: 'RECOMMENDED',
      badgeStyle: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      subtitle: 'High reliability. Low expected waiting friction.',
    };
  }
  if (csdsRaw >= 40) {
    return {
      verdict: 'CAUTION',
      badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      subtitle: 'Moderate congestion or partial availability predicted.',
    };
  }
  return {
    verdict: 'AVOID',
    badgeStyle: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
    icon: <XCircle className="w-5 h-5 text-rose-400" />,
    subtitle: 'High friction risk. Outages or long queues detected.',
  };
}
