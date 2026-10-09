import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Zap, Sparkles, RefreshCw } from 'lucide-react';
import type { SignalWeightConfig } from '../types/charging';

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
  onInspectStation?: (station: StatewideStation) => void;
}

const createStationMarkerIcon = (status?: string, source?: string) => {
  let colorClass = 'bg-slate-500 ring-slate-600';
  if (status === 'assessed' || status === 'resolved') colorClass = 'bg-cyan-400 ring-cyan-500';
  else if (status === 'identity_ambiguous') colorClass = 'bg-rose-500 ring-rose-600';
  else if (status === 'unverified_location') colorClass = 'bg-zinc-600 ring-zinc-700';
  else if (source === 'openstreetmap_overpass') colorClass = 'bg-emerald-500 ring-emerald-600';

  return L.divIcon({
    className: 'custom-station-marker',
    html: `
      <div class="w-7 h-7 rounded-full ${colorClass} border-2 border-slate-950 shadow-xl ring-4 ring-opacity-40 flex items-center justify-center text-slate-950 font-bold">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

export const StatewideMap: React.FC<StatewideMapProps> = ({ onInspectStation }) => {
  const [stations, setStations] = useState<StatewideStation[]>([]);
  const [directoryMeta, setDirectoryMeta] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [assessingId, setAssessingId] = useState<string | null>(null);

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
    <div className="bg-[#0c101c] border border-slate-800 rounded-2xl p-6 mb-10 shadow-2xl">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>Statewide Directory & Entity Resolution Pipeline</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Tamil Nadu Charging Station Network
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Overpass-backed OpenStreetMap (OSM) directory with ambiguity-guarded SerpApi friction intelligence
          </p>
        </div>

        {/* Directory Meta Badges */}
        {directoryMeta && (
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span
              className={`px-3 py-1.5 rounded-lg border font-semibold ${
                directoryMeta.source === 'openstreetmap_overpass' || directoryMeta.source === 'osm_live'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              }`}
            >
              Source: {directoryMeta.source === 'openstreetmap_overpass' || directoryMeta.source === 'osm_live' ? 'OSM Live' : 'Offline Fallback'}
            </span>

            <span className="px-3 py-1.5 rounded-lg bg-slate-950 text-slate-300 border border-slate-800">
              {stations.length} Directory Stations
            </span>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-slate-800 shadow-inner z-0">
        {loading ? (
          <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono">Querying Overpass OpenStreetMap Directory...</span>
          </div>
        ) : (
          <MapContainer
            center={[11.1271, 78.6569]}
            zoom={7}
            scrollWheelZoom={false}
            className="w-full h-full z-0"
            style={{ background: '#090d16' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

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
                        Mode: {st.assessmentStatus?.replace(/_/g, ' ').toUpperCase()}
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
    </div>
  );
};
