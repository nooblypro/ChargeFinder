import { useState, useEffect } from 'react';
import { HUB_FIXTURES, DEFAULT_WEIGHTS } from './data/fixtures';
import type { HubFixture, SignalWeightConfig } from './types/charging';
import { Header } from './components/Header';
import { FormulaModal } from './components/FormulaModal';
import { ExpresswayMap } from './components/ExpresswayMap';
import { StatewideMap } from './components/StatewideMap';
import { EvidenceDrawer } from './components/EvidenceDrawer';

export function App() {
  const [fixtures, setFixtures] = useState<HubFixture[]>(HUB_FIXTURES);
  const [weights] = useState<SignalWeightConfig>(DEFAULT_WEIGHTS);
  const [selectedFixture, setSelectedFixture] = useState<HubFixture | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isFormulaOpen, setIsFormulaOpen] = useState<boolean>(false);
  const [currentSteppingIndex, setCurrentSteppingIndex] = useState<number>(0);

  // Auto-fetch backend api on boot for pre-assessed hubs
  useEffect(() => {
    async function loadBackendStops() {
      try {
        const res = await fetch('/api/stops');
        if (res.ok) {
          const data = await res.json();
          setFixtures((prev) =>
            prev.map((fixture) => {
              // Keep stop_d unassessed until user triggers assessment
              if (fixture.assessmentStatus === 'unassessed') {
                return fixture;
              }
              const backendHub = data.find((d: any) => d.id === fixture.id);
              if (backendHub && backendHub.signals) {
                return {
                  ...fixture,
                  signals: backendHub.signals,
                };
              }
              return fixture;
            })
          );
        }
      } catch {
        // Quiet fallback to local benchmark fixtures
      }
    }
    loadBackendStops();
  }, []);

  const handleTriggerAssessment = (hubId: string) => {
    const targetHub = fixtures.find((f) => f.id === hubId);
    if (!targetHub) return;

    // Update status to 'assessing'
    const assessingHub: HubFixture = { ...targetHub, assessmentStatus: 'assessing' };
    setFixtures((prev) =>
      prev.map((f) => (f.id === hubId ? assessingHub : f))
    );
    setSelectedFixture(assessingHub);
    setIsDrawerOpen(true);
    setCurrentSteppingIndex(0);

    // Step 0 -> Step 1 -> Step 2 -> Step 3 over 2.4s (600ms each)
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step <= 3) {
        setCurrentSteppingIndex(step);
      } else {
        clearInterval(interval);

        // Fetch backend signals or use enriched default signals
        fetch(`/api/stops/${hubId}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            const enrichedSignals = data?.signals || {
              venue: { available: true, r_value: 0.25, c_value: 0.85, text: "Moderate plaza capacity" },
              hardware: {
                available: true,
                r_value: 0.1,
                c_value: 0.88,
                text: "All chargers operational with low error rate",
                diagnostics: [
                  { type: "physical", status: "ok", label: "Connector & Cable" },
                  { type: "software", status: "ok", label: "App & Payment" },
                  { type: "session", status: "ok", label: "Charge Speed & Stability" }
                ]
              },
              regional: { available: true, r_value: 0.15, c_value: 0.8, text: "Normal regional activity" },
              corridor: { available: true, r_value: 0.1, c_value: 0.7, text: "Clear corridor traffic flow" }
            };

            const updatedHub: HubFixture = {
              ...targetHub,
              assessmentStatus: 'assessed',
              freshness: 'Just now',
              signals: enrichedSignals,
            };

            setFixtures((prev) =>
              prev.map((f) => (f.id === hubId ? updatedHub : f))
            );
            setSelectedFixture(updatedHub);
          })
          .catch(() => {
            const fallbackHub: HubFixture = {
              ...targetHub,
              assessmentStatus: 'assessed',
              freshness: 'Just now',
              signals: {
                venue: { available: true, r_value: 0.25, c_value: 0.85, text: "Moderate plaza capacity" },
                hardware: {
                  available: true,
                  r_value: 0.1,
                  c_value: 0.88,
                  text: "All chargers operational with low error rate",
                  diagnostics: [
                    { type: "physical", status: "ok", label: "Connector & Cable" },
                    { type: "software", status: "ok", label: "App & Payment" },
                    { type: "session", status: "ok", label: "Charge Speed & Stability" }
                  ]
                },
                regional: { available: true, r_value: 0.15, c_value: 0.8, text: "Normal regional activity" },
                corridor: { available: true, r_value: 0.1, c_value: 0.7, text: "Clear corridor traffic flow" }
              }
            };
            setFixtures((prev) =>
              prev.map((f) => (f.id === hubId ? fallbackHub : f))
            );
            setSelectedFixture(fallbackHub);
          });
      }
    }, 600);
  };

  const handleInspectEvidence = (fixture: HubFixture) => {
    setSelectedFixture(fixture);
    setIsDrawerOpen(true);
    if (fixture.assessmentStatus === 'unassessed') {
      handleTriggerAssessment(fixture.id);
    }
  };

  const handleSelectMapHub = (hubId: string) => {
    const hub = fixtures.find((f) => f.id === hubId);
    if (hub) {
      handleInspectEvidence(hub);
    }
  };

  const handleInspectStatewideStation = (st: any) => {
    const rawSignals = st.frictionData?.signals;
    let mappedSignals: any = null;

    if (rawSignals) {
      mappedSignals = {
        venue: rawSignals.venue || rawSignals.venue_pressure || { available: false, r_value: null, c_value: 0.0, text: 'No venue pressure data' },
        hardware: rawSignals.hardware || rawSignals.hardware_warnings || { available: false, r_value: null, c_value: 0.0, text: 'No hardware warnings data' },
        regional: rawSignals.regional || rawSignals.regional_signal || { available: true, r_value: 0.1, c_value: 0.7, text: 'Regional signal' },
        corridor: rawSignals.corridor || rawSignals.corridor_alerts || { available: true, r_value: 0.1, c_value: 0.6, text: 'Corridor alerts' },
      };
    }

    const hubFixture: HubFixture = {
      id: st.id,
      name: st.name,
      location: st.address || `GPS: ${st.lat.toFixed(4)}, ${st.lon.toFixed(4)}`,
      operator: st.operator,
      assessmentStatus: st.assessmentStatus === 'assessed' || st.assessmentStatus === 'resolved' ? 'assessed' : 'unassessed',
      freshness: 'Just now',
      signals: mappedSignals,
    };
    setSelectedFixture(hubFixture);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Minimal Consumer-Grade Header */}
      <Header onOpenFormula={() => setIsFormulaOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 pb-16">
        
        {/* Simplified Expressway Corridor Map */}
        <ExpresswayMap
          fixtures={fixtures}
          selectedHubId={selectedFixture?.id || null}
          onSelectHub={handleSelectMapHub}
          weights={weights}
        />

        {/* Expanded Primary Hero Map with Corridor Focus & Statewide Directory */}
        <StatewideMap
          weights={weights}
          corridorFixtures={fixtures}
          selectedHubId={selectedFixture?.id || null}
          onInspectStation={handleInspectStatewideStation}
          onInspectCorridorHub={handleInspectEvidence}
        />

      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-slate-900 bg-[#040711] py-6 px-4 text-center text-xs text-slate-500">
        <p>ChargeSync India • Bengaluru–Mysuru Expressway Corridor (NH-275)</p>
      </footer>

      {/* Evidence Drawer */}
      <EvidenceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        fixture={selectedFixture}
        weights={weights}
        onTriggerAssessment={handleTriggerAssessment}
        currentSteppingIndex={currentSteppingIndex}
      />

      {/* Formula Specification Modal */}
      <FormulaModal
        isOpen={isFormulaOpen}
        onClose={() => setIsFormulaOpen(false)}
      />

    </div>
  );
}

export default App;
