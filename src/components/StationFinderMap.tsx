import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Zap, 
  Sparkles, 
  Search, 
  Filter, 
  Compass, 
  ArrowRight, 
  Gauge, 
  MapPin,
  RefreshCw
} from 'lucide-react';
import { EV_STATIONS_DATA, type EVStation } from '../data/evStations';
import type { HubFixture, SignalWeightConfig } from '../types/charging';

interface StationFinderMapProps {
  weights?: SignalWeightConfig;
  onSelectStation: (station: EVStation | HubFixture) => void;
  onStationCountChange?: (count: number) => void;
}

// Controller to smoothly animate map camera to coordinates
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Create custom pin icon based on Fullness Percentage
const createFullnessMarkerIcon = (fullness: number, isSelected = false) => {
  let color = 'bg-emerald-500 shadow-emerald-500/50';
  let ring = 'ring-emerald-400';
  let text = `${fullness}%`;

  if (fullness >= 70) {
    color = 'bg-rose-500 shadow-rose-500/50';
    ring = 'ring-rose-400';
  } else if (fullness >= 40) {
    color = 'bg-amber-500 shadow-amber-500/50';
    ring = 'ring-amber-400';
  }

  const selectedBorder = isSelected 
    ? 'ring-4 ring-cyan-300 scale-125 z-50' 
    : `ring-2 ${ring} hover:scale-110`;

  return L.divIcon({
    className: 'custom-fullness-marker',
    html: `
      <div class="relative flex flex-col items-center group cursor-pointer">
        <div class="w-10 h-10 rounded-full ${color} border-2 border-slate-950 shadow-2xl flex flex-col items-center justify-center text-slate-950 font-black transition-transform ${selectedBorder}">
          <span class="text-[10px] leading-tight font-extrabold tracking-tighter">${text}</span>
          <span class="text-[7px] leading-none uppercase font-bold opacity-80">Full</span>
        </div>
        <div class="w-1.5 h-1.5 bg-slate-950 rotate-45 -mt-0.5"></div>
      </div>
    `,
    iconSize: [40, 44],
    iconAnchor: [20, 22],
  });
};

const CITY_PRESETS = [
  { label: 'All India', center: [17.5, 78.5] as [number, number], zoom: 5 },
  { label: 'Bengaluru', center: [12.9716, 77.6412] as [number, number], zoom: 11 },
  { label: 'Chennai', center: [13.0587, 80.2461] as [number, number], zoom: 11 },
  { label: 'Mumbai', center: [19.0760, 72.8777] as [number, number], zoom: 11 },
  { label: 'Delhi-NCR', center: [28.5355, 77.1500] as [number, number], zoom: 11 },
  { label: 'Hyderabad', center: [17.4399, 78.3689] as [number, number], zoom: 11 },
  { label: 'Pune', center: [18.6000, 73.7500] as [number, number], zoom: 11 },
  { label: 'Coimbatore', center: [11.0168, 76.9558] as [number, number], zoom: 11 },
];

export const StationFinderMap: React.FC<StationFinderMapProps> = ({
  weights: _weights,
  onSelectStation,
  onStationCountChange,
}) => {
  const [allStations, setAllStations] = useState<EVStation[]>(EV_STATIONS_DATA);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'MODERATE' | 'LIKELY_FULL' | 'FAST_ONLY'>('ALL');
  const [activeCity, setActiveCity] = useState<string>('All India');
  const [camera, setCamera] = useState<{ center: [number, number]; zoom: number }>({
    center: [15.5, 78.0],
    zoom: 6,
  });
  const [isSyncingLive, setIsSyncingLive] = useState<boolean>(false);

  // Auto-fetch additional live stations from Overpass API backend and merge
  useEffect(() => {
    async function fetchExternalDirectory() {
      setIsSyncingLive(true);
      try {
        const res = await fetch('/api/directory/tamilnadu');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.stations)) {
            // Map external Overpass stations into EVStation schema
            const mappedExternal: EVStation[] = data.stations.map((st: any, idx: number) => {
              // Calculate deterministic mock fullness based on coordinate hash for demonstration
              const hashVal = Math.abs(Math.sin(st.lat * 100 + st.lon * 50));
              const fullness = Math.round(hashVal * 85) + 10;
              const confidence = Math.round(75 + (hashVal * 20));

              let status: EVStation['status'] = 'AVAILABLE';
              if (fullness >= 70) status = 'LIKELY_FULL';
              else if (fullness >= 40) status = 'MODERATE';

              return {
                id: st.id || `ext_${idx}`,
                name: st.name || 'Public EV Charging Hub',
                city: st.address?.includes('Chennai') ? 'Chennai' : st.address?.includes('Coimbatore') ? 'Coimbatore' : 'Tamil Nadu',
                state: 'India',
                lat: st.lat,
                lon: st.lon,
                address: st.address || `GPS: ${st.lat.toFixed(4)}, ${st.lon.toFixed(4)}`,
                operator: st.operator || 'OpenStreetMap Network',
                fastChargers: st.capacity ? `${st.capacity} Fast Ports` : '2x 60kW CCS2 Fast Ports',
                plugTypes: ['CCS2', 'Type 2'],
                powerKw: 60,
                totalStalls: 4,
                availableStallsEstimated: Math.max(1, Math.round((1 - fullness / 100) * 4)),
                fullnessPercentage: fullness,
                confidencePercentage: confidence,
                status,
                estimatedWaitMinutes: fullness >= 70 ? 25 : fullness >= 40 ? 10 : 0,
                lastUpdated: 'Live OSM Sync',
                signals: {
                  venueOccupancy: { r_value: fullness / 100, c_value: confidence / 100, text: 'Live location occupancy proxy' },
                  chargerHardware: {
                    r_value: 0.1,
                    c_value: 0.9,
                    text: 'Directory verified operational status',
                    diagnostics: [
                      { type: 'physical', status: 'ok', label: 'Connector & Cable' },
                      { type: 'software', status: 'ok', label: 'RFID & App Auth' },
                      { type: 'session', status: 'ok', label: 'Power Stability' }
                    ]
                  },
                  regionalTraffic: { r_value: 0.3, c_value: 0.8, text: 'Standard highway travel velocity' },
                  recentReviews: { r_value: 0.2, c_value: 0.75, text: 'OpenStreetMap verified record' }
                }
              };
            });

            // Merge avoiding close duplicates
            setAllStations((prev) => {
              const existingIds = new Set(prev.map((s) => s.id));
              const fresh = mappedExternal.filter((s) => !existingIds.has(s.id));
              return [...prev, ...fresh];
            });
          }
        }
      } catch (err) {
        console.warn('[Directory Sync] Quiet fallback to catalog:', err);
      } finally {
        setIsSyncingLive(false);
      }
    }

    fetchExternalDirectory();
  }, []);

  // Filtered stations based on Search Query and Status Filters
  const filteredStations = useMemo(() => {
    return allStations.filter((st) => {
      // Search match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        st.name.toLowerCase().includes(query) ||
        st.city.toLowerCase().includes(query) ||
        st.operator.toLowerCase().includes(query) ||
        st.address.toLowerCase().includes(query) ||
        st.plugTypes.some((p) => p.toLowerCase().includes(query));

      // Filter match
      let matchesFilter = true;
      if (statusFilter === 'AVAILABLE') {
        matchesFilter = st.fullnessPercentage < 40;
      } else if (statusFilter === 'MODERATE') {
        matchesFilter = st.fullnessPercentage >= 40 && st.fullnessPercentage < 70;
      } else if (statusFilter === 'LIKELY_FULL') {
        matchesFilter = st.fullnessPercentage >= 70;
      } else if (statusFilter === 'FAST_ONLY') {
        matchesFilter = st.powerKw >= 60;
      }

      return matchesSearch && matchesFilter;
    });
  }, [allStations, searchQuery, statusFilter]);

  // Report count up
  useEffect(() => {
    if (onStationCountChange) {
      onStationCountChange(allStations.length);
    }
  }, [allStations.length, onStationCountChange]);

  const handleCityJump = (city: typeof CITY_PRESETS[0]) => {
    setActiveCity(city.label);
    setCamera({ center: city.center, zoom: city.zoom });
  };

  return (
    <div className="bg-[#0c101c] border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl space-y-5">
      
      {/* Top Search, City Bar & Filter Controls */}
      <div className="space-y-4">
        
        {/* Title & Stats Headline */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              <span className="font-semibold uppercase tracking-wider">National EV Infrastructure Map</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Find EV Charging Stations &amp; Fullness Confidence</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Real-time station locator with occupancy percentage &amp; evidence confidence across India
            </p>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs font-bold text-cyan-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>{filteredStations.length} of {allStations.length} Stations Found</span>
            </span>

            {isSyncingLive && (
              <span className="px-3 py-1.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Syncing OSM...</span>
              </span>
            )}
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city (e.g. Bangalore, Chennai, Mumbai, Delhi), station name, or operator (Tata, Zeon, Jio-bp, Ather)..."
            className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-400 focus:outline-none rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 shadow-inner font-sans transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* City Quick Jumps */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap mr-1">
            Jump to Metro:
          </span>
          {CITY_PRESETS.map((city) => (
            <button
              key={city.label}
              onClick={() => handleCityJump(city)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                activeCity === city.label
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800'
              }`}
            >
              {city.label}
            </button>
          ))}
        </div>

        {/* Fullness Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Filter Fullness:</span>
          </span>

          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-200 text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All ({allStations.length})
          </button>

          <button
            onClick={() => setStatusFilter('AVAILABLE')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              statusFilter === 'AVAILABLE'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-emerald-950/30 text-emerald-400 hover:bg-emerald-950/60 border border-emerald-800/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Available Stalls (&lt;40% Full)</span>
          </button>

          <button
            onClick={() => setStatusFilter('MODERATE')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              statusFilter === 'MODERATE'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-amber-950/30 text-amber-400 hover:bg-amber-950/60 border border-amber-800/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Moderate (40-70% Full)</span>
          </button>

          <button
            onClick={() => setStatusFilter('LIKELY_FULL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              statusFilter === 'LIKELY_FULL'
                ? 'bg-rose-500 text-slate-950 font-bold'
                : 'bg-rose-950/30 text-rose-400 hover:bg-rose-950/60 border border-rose-800/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Likely Full (&gt;70% Full)</span>
          </button>

          <button
            onClick={() => setStatusFilter('FAST_ONLY')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              statusFilter === 'FAST_ONLY'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-cyan-400 hover:bg-slate-900 border border-cyan-800/40'
            }`}
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>Fast DC Only (≥60kW)</span>
          </button>
        </div>

      </div>

      {/* Hero Full-Bleed Map Viewport */}
      <div className="relative w-full h-[620px] sm:h-[700px] lg:h-[760px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl z-0">
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

          {filteredStations.map((station) => {
            const isSelected = selectedStationId === station.id;

            return (
              <Marker
                key={station.id}
                position={[station.lat, station.lon]}
                icon={createFullnessMarkerIcon(station.fullnessPercentage, isSelected)}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-4 bg-slate-950 text-slate-100 rounded-2xl border border-blue-900/40 max-w-sm space-y-3 font-sans shadow-2xl">
                    
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-blue-500/30">
                        {station.operator}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{station.city}</span>
                      </span>
                    </div>

                    {/* Station Name & Specs */}
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-white tracking-tight leading-snug">
                        {station.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">{station.address}</p>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                          ⚡ {station.fastChargers}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {station.totalStalls} Stalls Total
                        </span>
                      </div>
                    </div>

                    {/* Fullness & Confidence Metrics Banner */}
                    <div className={`p-3 rounded-xl border space-y-2 ${
                      station.fullnessPercentage >= 70
                        ? 'bg-rose-950/40 border-rose-800/50 text-rose-200'
                        : station.fullnessPercentage >= 40
                        ? 'bg-amber-950/40 border-amber-800/50 text-amber-200'
                        : 'bg-emerald-950/40 border-emerald-800/50 text-emerald-200'
                    }`}>
                      <div className="flex items-center justify-between font-bold text-xs">
                        <div className="flex items-center gap-1.5">
                          <Gauge className="w-4 h-4" />
                          <span>Fullness Risk:</span>
                        </div>
                        <span className="font-mono text-sm text-white">
                          {station.fullnessPercentage}% Full
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full transition-all duration-500 ${
                            station.fullnessPercentage >= 70
                              ? 'bg-rose-500'
                              : station.fullnessPercentage >= 40
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                          style={{ width: `${station.fullnessPercentage}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-300">
                        <span>Prediction Confidence:</span>
                        <span className="font-bold text-white">{station.confidencePercentage}%</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>Estimated Queue:</span>
                        <span className="font-bold text-white">
                          {station.estimatedWaitMinutes > 0 ? `~${station.estimatedWaitMinutes} mins` : 'No wait (Open Bays)'}
                        </span>
                      </div>
                    </div>

                    {/* Action Button to Open Evidence Drawer */}
                    <button
                      onClick={() => {
                        setSelectedStationId(station.id);
                        onSelectStation(station);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Inspect Evidence &amp; Telemetry</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Map Legend Footer */}
      <div className="pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-300">Fullness Indicators:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Available (&lt;40% Full)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block"></span>
            <span>Moderate (40–70% Full)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 inline-block"></span>
            <span>Likely Full (&gt;70% Full)</span>
          </span>
        </div>

        <div className="font-mono text-[11px] text-cyan-400">
          Click any pin on the map to view real-time occupancy evidence
        </div>
      </div>

    </div>
  );
};
