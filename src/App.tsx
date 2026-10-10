import { useState } from 'react';
import { DEFAULT_WEIGHTS } from './data/fixtures';
import type { HubFixture, SignalWeightConfig } from './types/charging';
import { Header } from './components/Header';
import { FormulaModal } from './components/FormulaModal';
import { StationFinderMap } from './components/StationFinderMap';
import { EvidenceDrawer } from './components/EvidenceDrawer';
import type { EVStation } from './data/evStations';

export function App() {
  const [weights] = useState<SignalWeightConfig>(DEFAULT_WEIGHTS);
  const [selectedFixture, setSelectedFixture] = useState<HubFixture | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isFormulaOpen, setIsFormulaOpen] = useState<boolean>(false);
  const [currentSteppingIndex, setCurrentSteppingIndex] = useState<number>(0);
  const [stationCount, setStationCount] = useState<number>(0);

  const handleSelectStation = (st: EVStation | HubFixture | any) => {
    // Standardize into HubFixture schema for Evidence Drawer
    const fullness = typeof st.fullnessPercentage === 'number' ? st.fullnessPercentage : 45;
    const confidence = typeof st.confidencePercentage === 'number' ? st.confidencePercentage : 85;

    // Convert raw fullness into friction term (r_value = fullness / 100)
    const rawR = fullness / 100;
    const rawC = confidence / 100;

    let signals = st.signals;
    if (!signals || !signals.venue) {
      signals = {
        venue: {
          available: true,
          r_value: rawR,
          c_value: rawC,
          text: st.signals?.venueOccupancy?.text || `${fullness}% calculated plaza & stall occupancy rate`,
        },
        hardware: {
          available: true,
          r_value: 0.08,
          c_value: 0.92,
          text: `Hardware active • ${st.fastChargers || 'Fast DC Stalls'} online`,
          diagnostics: [
            { type: 'physical', status: 'ok', label: 'Connector & Cable' },
            { type: 'software', status: 'ok', label: 'RFID & App Auth' },
            { type: 'session', status: 'ok', label: 'Charging Speed Stability' },
          ],
        },
        regional: {
          available: true,
          r_value: 0.25,
          c_value: 0.8,
          text: `Regional EV arrival velocity for ${st.city || 'metro hub'}`,
        },
        corridor: {
          available: true,
          r_value: 0.15,
          c_value: 0.75,
          text: `Recent check-in data: ${st.estimatedWaitMinutes ? `~${st.estimatedWaitMinutes}m wait` : 'No queue reported'}`,
        },
      };
    }

    const hubFixture: HubFixture = {
      id: st.id,
      name: st.name,
      location: st.address || `${st.city || 'City'}, India`,
      operator: st.operator,
      fastChargers: st.fastChargers || 'Fast DC Stalls',
      assessmentStatus: 'assessed',
      freshness: st.lastUpdated || 'Live updated',
      signals,
    };

    setSelectedFixture(hubFixture);
    setIsDrawerOpen(true);
  };

  const handleTriggerAssessment = (_hubId?: string) => {
    if (!selectedFixture) return;

    setSelectedFixture((prev) => prev ? { ...prev, assessmentStatus: 'assessing' } : null);
    setCurrentSteppingIndex(0);
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step <= 3) {
        setCurrentSteppingIndex(step);
      } else {
        clearInterval(interval);
        setSelectedFixture((prev) => 
          prev 
            ? { 
                ...prev, 
                assessmentStatus: 'assessed', 
                freshness: 'Just now (Live re-assessment)' 
              } 
            : null
        );
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Brand Header */}
      <Header 
        onOpenFormula={() => setIsFormulaOpen(true)} 
        stationCount={stationCount}
      />

      {/* Main Full-Width Map Experience */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pb-12">
        <StationFinderMap
          weights={weights}
          onSelectStation={handleSelectStation}
          onStationCountChange={setStationCount}
        />
      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-slate-900 bg-[#040711] py-6 px-4 text-center text-xs text-slate-500">
        <p>ChargeFinder India • Live EV Station Finder &amp; Fullness Confidence Engine</p>
      </footer>

      {/* Evidence & Telemetry Drawer */}
      <EvidenceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        fixture={selectedFixture}
        weights={weights}
        onTriggerAssessment={handleTriggerAssessment}
        currentSteppingIndex={currentSteppingIndex}
      />

      {/* Fullness & Confidence Formula Modal */}
      <FormulaModal
        isOpen={isFormulaOpen}
        onClose={() => setIsFormulaOpen(false)}
      />

    </div>
  );
}

export default App;
