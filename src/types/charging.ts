export type SignalType = 'venue' | 'hardware' | 'regional' | 'corridor';

export type DiagnosticType = 'physical' | 'software' | 'session';
export type DiagnosticStatus = 'ok' | 'warning' | 'error' | 'unavailable';

export interface HardwareDiagnosticItem {
  type: DiagnosticType;
  status: DiagnosticStatus;
  label: string;
}

export interface SignalData {
  available: boolean;
  r_value: number | null; // Friction risk score [0..1], lower is better friction-wise
  c_value: number;        // Confidence score [0..1]
  text: string;           // Human-readable signal explanation
  source?: string;        // Audit source
  retrieved_at?: string;  // Audit ISO timestamp
  diagnostics?: HardwareDiagnosticItem[];
}

export interface HubSignals {
  venue: SignalData;
  hardware: SignalData;
  regional: SignalData;
  corridor: SignalData;
  [key: string]: SignalData;
}

export type AssessmentStatus = 'unassessed' | 'assessing' | 'assessed';

export interface DirectoryInfo {
  source: string;
  updatedAgo: string;
  connectors: string;
  access: string;
}

export interface HubFixture {
  id: string;
  name: string;
  lat?: number;
  lon?: number;
  location?: string;
  distanceKm?: number;
  operator?: string;
  fastChargers?: string;
  directoryInfo?: DirectoryInfo;
  assessmentStatus?: AssessmentStatus;
  freshness?: string;
  signals: HubSignals | null;
}

export interface SignalWeightConfig {
  venue: number;
  hardware: number;
  regional: number;
  corridor: number;
  [key: string]: number;
}

export interface SignalCalculationBreakdown {
  type: SignalType;
  label: string;
  weight: number;
  available: boolean;
  r_value: number | null;
  c_value: number;
  effectiveFrictionTerm: number | null; // w_i * (1 - r_i)
  effectiveConfidenceTerm: number;      // w_i * c_i
  text: string;
  source?: string;
  retrieved_at?: string;
  diagnostics?: HardwareDiagnosticItem[];
}

export interface HubScoreResult {
  csdsRaw: number;                // Raw CSDS calculation before suppression [0..100]
  ecsScore: number;               // Confidence score [0..100]
  isSuppressed: boolean;          // True if ECS < suppressionThreshold (55)
  displayCSDS: string;            // Formatted score e.g. "87.4" or "Suppressed"
  availableWeightSum: number;     // Sum of weights of available signals
  totalWeightSum: number;         // Total weight sum (1.0)
  breakdown: SignalCalculationBreakdown[];
  frictionLevel: 'LOW_FRICTION' | 'MODERATE_FRICTION' | 'HIGH_FRICTION' | 'SUPPRESSED';
}
