import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Zap, Sparkles, RefreshCw, Layers, Compass, ArrowRight } from 'lucide-react';
import type { HubFixture, SignalWeightConfig } from '../types/charging';
import { evaluateHubScore } from '../utils/scoring';
import { getVerdict } from '../utils/verdict';

export interface StatewideStation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  operator: string;
  source: 'openstreetmap_overpass' | 'offline_fallback';
  directory_record_verified: boolean;
  operational_status: 'unknown' | 'operational' | 'outage';
  address?: string;
  assessmentStatus?: 'unassessed' | 'assessing' | 'assessed' | 'resolved' | 'identity_ambiguous' | 'unverified_location' | 'no_confident_match' | 'serpapi_error';
  frictionData?: any;
}

interface StatewideMapProps {
  weights?: SignalWeightConfig;
  corridorFixtures?: HubFixture[];
  selectedHubId?: string | null;
  onInspectStation?: (station: StatewideStation) => void;
  onInspectCorridorHub?: (hub: HubFixture) => void;
}

// Controller to smoothly animate map camera between preset corridor & statewide views
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Custom icon for NH-275 corridor stops
const createCorridorMarkerIcon = (fixture: HubFixture, weights?: SignalWeightConfig, isSelected?: boolean) => {
  const isUnassessed = fixture.assessmentStatus === 'unassessed' || !fixture.signals;
  const score = fixture.signals && weights ? evaluateHubScore(fixture.signals, weights) : null;
  const { verdict } = isUnassessed
    ? { verdict: 'NOT YET ASSESSED' }
    : getVerdict(score?.csdsRaw ?? 0, score?.isSuppressed ?? true);

  let bgClass = 'bg-emerald-500 shadow-emerald-500/50';
  let pulseRing = 'ring-emerald-400';
  if (isUnassessed || verdict === 'NOT YET ASSESSED') {
    bgClass = 'bg-amber-500 shadow-amber-500/50';
    pulseRing = 'ring-amber-400';
  } else if (verdict === 'VERIFY FIRST') {
    bgClass = 'bg-zinc-400 shadow-zinc-400/50';
    pulseRing = 'ring-zinc-400';
  } else if (verdict === 'CAUTION') {
    bgClass = 'bg-amber-400 shadow-amber-400/50';
    pulseRing = 'ring-amber-400';
  } else if (verdict === 'AVOID') {
    bgClass = 'bg-rose-500 shadow-rose-500/50';
    pulseRing = 'ring-rose-400';
  }

  const selectedRing = isSelected ? 'ring-4 ring-cyan-300 scale-125 z-50' : 'ring-2 ring-slate-950';

  return L.divIcon({
    className: 'custom-corridor-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full ${bgClass} ring-2 ${pulseRing} animate-ping opacity-75"></span>
        <div class="w-9 h-9 rounded-full ${bgClass} border-2 border-slate-950 shadow-2xl flex items-center justify-center text-slate-950 font-black transition-transform ${selectedRing}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Custom icon for general OpenStreetMap directory stations
const createStationMarkerIcon = (status?: string, source?: string) => {
  let colorClass = 'bg-slate-500 ring-slate-600';
  if (status === 'assessed' || status === 'resolved') colorClass = 'bg-cyan-400 ring-cyan-500';
  else if (status === 'identity_ambiguous') colorClass = 'bg-rose-500 ring-rose-600';
  else if (status === 'unverified_location') colorClass = 'bg-zinc-600 ring-zinc-700';
  else if (source === 'openstreetmap_overpass') colorClass = 'bg-emerald-500 ring-emerald-600';

  return L.divIcon({
    className: 'custom-station-marker',
    html: `
      <div class="w-6 h-6 rounded-full ${colorClass} border-2 border-slate-950 shadow-md ring-2 ring-opacity-40 flex items-center justify-center text-slate-950 font-bold opacity-80 hover:opacity-100 transition-opacity">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export const StatewideMap: React.FC<StatewideMapProps> = ({
  weights,
  corridorFixtures = [],
  selectedHubId,
  onInspectStation,
  onInspectCorridorHub,
}) => {
  const [stations, setStations] = useState<StatewideStation[]>([]);
  const [directoryMeta, setDirectoryMeta] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [assessingId, setAssessingId] = useState<string | null>(null);

  // Map view controls: Default camera focused on NH-275 Expressway corridor
  const [viewPreset, setViewPreset] = useState<'corridor' | 'statewide'>('corridor');
  const [camera, setCamera] = useState<{ center: [number, number]; zoom: number }>({
    center: [12.58, 77.05],
    zoom: 10,
  });

  const handleSetPreset = (preset: 'corridor' | 'statewide') => {
    setViewPreset(preset);
    if (preset === 'corridor') {
      setCamera({ center: [12.58, 77.05], zoom: 10 });
    } else {
      setCamera({ center: [11.50, 77.80], zoom: 7 });
    }
  };

  useEffect(() => {
    async function loadDirectory() {
      setLoading(true);
      try {
        const res = await fetch('/api/directory/tamilnadu');
        if (res.ok) {
          const data = await res.json();
          setDirectoryMeta(data);
          setStations(
            (data.stations || []).map((s: any) => ({
              ...s,
              assessmentStatus: s.directory_record_verified ? 'unassessed' : 'unverified_location',
            }))
          );
        }
      } catch (err) {
        console.warn('[StatewideMap] Directory fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDirectory();
  }, []);

  const handleAssessStation = async (stationId: string, forceFresh = false) => {
    setAssessingId(stationId);
    try {
      const url = forceFresh ? `/api/friction/${stationId}?refresh=true` : `/api/friction/${stationId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStations((prev) =>
          prev.map((s) => {
            if (s.id === stationId) {
              const updated = {
                ...s,
                assessmentStatus: data.status,
                frictionData: data,
              };
              if (onInspectStation && (data.status === 'assessed' || data.status === 'resolved')) {
                onInspectStation(updated);
              }
              return updated;
            }
            return s;
          })
        );
      }
    } catch (err) {
      console.warn('[Assess Station Error]:', err);
    } finally {
      setAssessingId(null);
    }
  };

  return (
    <div className="bg-[#0c101c] border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl">
      
      {/* Dynamic Header & Layer Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span className="font-semibold uppercase tracking-wider">Interactive Geographic Friction Map</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Bengaluru–Mysuru &amp; Regional EV Network</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            High-resolution spatial view with NH-275 corridor friction intelligence &amp; 200+ OpenStreetMap verified stations.
          </p>
        </div>

        {/* View Preset Toggles */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => handleSetPreset('corridor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewPreset === 'corridor'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>NH-275 Expressway (Focus)</span>
            </button>

            <button
              onClick={() => handleSetPreset('statewide')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewPreset === 'statewide'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Statewide Directory ({stations.length > 0 ? stations.length : '200+'} Nodes)</span>
            </button>
          </div>

          {directoryMeta && (
            <span className="hidden sm:inline-flex px-3 py-2 rounded-xl bg-slate-950 text-slate-400 border border-slate-800 text-xs font-mono">
              Live Overpass Sync
            </span>
          )}
        </div>
      </div>

      {/* Expanded Hero Map Container */}
      <div className="relative w-full h-[620px] sm:h-[700px] lg:h-[760px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl z-0">
        {loading ? (
          <div className="w-full h-full bg-[#070b14] flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="relative">
              <Zap className="w-10 h-10 text-cyan-400 animate-bounce" />
              <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-40 animate-pulse"></div>
            </div>
            <span className="text-sm font-mono text-cyan-300">Synchronizing Spatial EV Infrastructure...</span>
            <span className="text-xs text-slate-500">Querying OpenStreetMap Overpass &amp; NH-275 corridor waypoints</span>
          </div>
        ) : (
          <MapContainer
            center={camera.center}
            zoom={camera.zoom}
            scrollWheelZoom={true}
            className="w-full h-full z-0"
            style={{ background: '#070b14' }}
          >
            <MapViewController center={camera.center} zoom={camera.zoom} />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* NH-275 High-Priority Corridor Markers */}
            {corridorFixtures.map((fixture) => {
              if (typeof fixture.lat !== 'number' || typeof fixture.lon !== 'number') return null;

              const isUnassessed = fixture.assessmentStatus === 'unassessed' || !fixture.signals;
              const score = fixture.signals && weights ? evaluateHubScore(fixture.signals, weights) : null;
              const verdictInfo = isUnassessed
                ? {
                    verdict: 'NOT YET ASSESSED' as const,
                    badgeStyle: 'bg-zinc-800 text-zinc-300 border-zinc-700',
                    subtitle: 'Directory entry only. Click to assess live friction.',
                  }
                : getVerdict(score?.csdsRaw ?? 0, score?.isSuppressed ?? true);

              const isSelected = selectedHubId === fixture.id;

              return (
                <Marker
                  key={`corridor_${fixture.id}`}
                  position={[fixture.lat, fixture.lon]}
                  icon={createCorridorMarkerIcon(fixture, weights, isSelected)}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="p-4 bg-slate-950 text-slate-100 rounded-2xl border border-blue-900/40 max-w-sm space-y-3 font-sans shadow-2xl">
                      
                      {/* Corridor Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-blue-500/30">
                          NH-275 Expressway Hub
                        </span>
                        {fixture.distanceKm && (
                          <span className="text-[10px] font-mono text-slate-400">
                            Km {fixture.distanceKm}
                          </span>
                        )}
                      </div>

                      {/* Name & Operator */}
                      <div>
                        <h4 className="font-bold text-base text-white tracking-tight">{fixture.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{fixture.location}</p>
                        <p className="text-xs text-cyan-300 font-semibold mt-1 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{fixture.operator}</span>
                        </p>
                      </div>

                      {/* Verdict Banner */}
                      <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${verdictInfo.badgeStyle}`}>
                        <div className="text-xs font-bold uppercase tracking-wider">{verdictInfo.verdict}</div>
                        {score && !score.isSuppressed && (
                          <div className="text-xs font-mono font-bold">
                            CSDS: <span className="text-white">{score.csdsRaw}%</span>
                          </div>
                        )}
                      </div>

                      {/* Interactive Inspect Button */}
                      <button
                        onClick={() => {
                          if (onInspectCorridorHub) onInspectCorridorHub(fixture);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Inspect Evidence Drawer &amp; Math</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Statewide Directory Stations */}
            {stations.map((st) => (
              <Marker
                key={st.id}
                position={[st.lat, st.lon]}
                icon={createStationMarkerIcon(st.assessmentStatus, st.source)}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-3 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 max-w-xs space-y-3 font-sans">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-800 pb-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          st.source === 'openstreetmap_overpass'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                            : 'bg-amber-950 text-amber-300 border-amber-700'
                        }`}
                      >
                        Source: {st.source === 'openstreetmap_overpass' ? 'OSM Live' : 'Offline Fallback'}
                      </span>

                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          st.assessmentStatus === 'assessed' || st.assessmentStatus === 'resolved'
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                            : st.assessmentStatus === 'identity_ambiguous' || st.assessmentStatus === 'serpapi_error'
                            ? 'bg-rose-950 text-rose-300 border-rose-700'
                            : st.assessmentStatus === 'no_confident_match'
                            ? 'bg-amber-950 text-amber-300 border-amber-700'
                            : st.assessmentStatus === 'unverified_location'
                            ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}
                      >
                        {st.assessmentStatus?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>

                    {/* Station Info */}
                    <div>
                      <h4 className="font-bold text-sm text-white">{st.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Operator: <strong className="text-slate-200">{st.operator}</strong></p>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                        Coords: {st.lat.toFixed(4)}, {st.lon.toFixed(4)}
                      </p>
                    </div>

                    {/* Assessment Result Details */}
                    {st.frictionData && (
                      <div className="pt-2 border-t border-slate-800 text-xs space-y-1.5">
                        {st.frictionData.status === 'identity_ambiguous' && (
                          <div className="p-2 rounded bg-rose-950/60 border border-rose-800/60 text-rose-200 text-[11px]">
                            <strong className="block font-bold">Ambiguity Guard Triggered:</strong>
                            {st.frictionData.message || 'Top candidates have near-identical match scores (|S1 - S2| < 0.05). Live query halted.'}
                          </div>
                        )}

                        {st.frictionData.status === 'no_confident_match' && (
                          <div className="p-2 rounded bg-amber-950/60 border border-amber-800/60 text-amber-200 text-[11px]">
                            <strong className="block font-bold">No Confident Match Guard:</strong>
                            {st.frictionData.message || 'No matching place candidate was found on Google Maps within threshold.'}
                          </div>
                        )}

                        {st.frictionData.status === 'unverified_location' && (
                          <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px]">
                            <strong className="block font-bold">Unverified Location Guard:</strong>
                            {st.frictionData.message || 'Offline fallback coordinates unverified; live search suppressed.'}
                          </div>
                        )}

                        {st.frictionData.status === 'serpapi_error' && (
                          <div className="p-2 rounded bg-rose-950/60 border border-rose-800/60 text-rose-200 text-[11px]">
                            <strong className="block font-bold">API Search Error:</strong>
                            {st.frictionData.error || 'Failed to query live Google Maps API.'}
                          </div>
                        )}

                        {(st.frictionData.status === 'assessed' || st.frictionData.status === 'resolved') && (
                          <div className="p-2.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-200 text-[11px] space-y-1.5">
                            <div className="flex justify-between font-bold">
                              <span className="text-slate-400 font-sans">Match Candidate:</span>
                              <span className="truncate max-w-[130px] text-white">{st.frictionData.candidate?.title}</span>
                            </div>
                            <div className="flex justify-between font-mono">
                              <span className="text-slate-400 font-sans">CSDS Score:</span>
                              <span className="text-cyan-300 font-bold">{st.frictionData.csds !== null ? `${st.frictionData.csds}%` : 'Suppressed'}</span>
                            </div>
                            <div className="flex justify-between font-mono">
                              <span className="text-slate-400 font-sans">Confidence (ECS):</span>
                              <span className="text-blue-300 font-bold">{st.frictionData.ecs ?? 0}%</span>
                            </div>
                            <div className="flex justify-between font-mono">
                              <span className="text-slate-400 font-sans">Recommendation:</span>
                              <span className="text-emerald-300 font-bold">{st.frictionData.recommendation || 'Verify First'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => {
                        if (st.assessmentStatus === 'assessed' || st.assessmentStatus === 'resolved') {
                          if (onInspectStation) onInspectStation(st);
                        } else {
                          const forceFresh = Boolean(st.frictionData);
                          handleAssessStation(st.id, forceFresh);
                        }
                      }}
                      disabled={assessingId === st.id}
                      className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
                    >
                      {assessingId === st.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                          <span>Resolving Entity...</span>
                        </>
                      ) : st.assessmentStatus === 'assessed' || st.assessmentStatus === 'resolved' ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Inspect Evidence Drawer</span>
                        </>
                      ) : st.frictionData ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                          <span>Re-assess Station (Bypass Cache)</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Assess Friction Intelligence</span>
                        </>
                      )}
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Corridor Legend & Quick Navigation Footer */}
      <div className="mt-5 pt-4 border-t border-slate-900 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-300">Map Legend:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Recommended Stop
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Caution / Unassessed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span> High Friction / Ambiguous
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-zinc-400 inline-block"></span> Low Confidence Suppressed
          </span>
        </div>

        <div className="font-mono text-[11px] text-cyan-400">
          Click any waypoint on the map or corridor bar to inspect full diagnostics
        </div>
      </div>

    </div>
  );
};
