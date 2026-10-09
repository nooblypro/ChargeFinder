import type { HubFixture, SignalWeightConfig } from '../types/charging.js';

export const DEFAULT_WEIGHTS: SignalWeightConfig = {
  venue: 0.30,
  hardware: 0.35,
  regional: 0.20,
  corridor: 0.15,
};

export const SUPPRESSION_THRESHOLD_ECS = 55.0;

export const HUB_FIXTURES: HubFixture[] = [
  {
    id: "stop_a",
    name: "Srirangapatna Hub",
    lat: 12.4223,
    lon: 76.6837,
    location: "NH 275, Km 104 • Near Srirangapatna Bypass",
    distanceKm: 104,
    operator: "Zeon & KSEB Network",
    fastChargers: "4x 120kW Dual CCS2",
    assessmentStatus: "assessed",
    freshness: "Live updated",
    signals: {
      venue: { available: true, r_value: 0.42, c_value: 0.8, text: "Moderate venue pressure" },
      hardware: { 
        available: true, 
        r_value: 0.0, 
        c_value: 0.9, 
        text: "No warning pattern found",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "App & Payment" },
          { type: "session", status: "ok", label: "Charge Speed & Stability" }
        ]
      },
      regional: { available: true, r_value: 0.0, c_value: 0.9, text: "Normal baseline" },
      corridor: { available: true, r_value: 0.0, c_value: 0.5, text: "No matching disruption reports" }
    }
  },
  {
    id: "stop_d",
    name: "Maddur Rest Hub",
    lat: 12.5833,
    lon: 77.0500,
    location: "NH 275, Km 78 • Maddur Bypass",
    distanceKm: 78,
    operator: "Statiq / Plaza Partners",
    fastChargers: "2x 60kW CCS2",
    directoryInfo: {
      source: "OpenStreetMap",
      updatedAgo: "4 hours ago",
      connectors: "2x 60kW CCS2",
      access: "24/7 Plaza Entry"
    },
    assessmentStatus: "unassessed",
    freshness: "Directory only",
    signals: null
  },
  {
    id: "stop_b",
    name: "Channapatna Plaza Hub",
    lat: 12.6518,
    lon: 77.2089,
    location: "NH 275, Km 56 • Toy Town Food Plaza",
    distanceKm: 56,
    operator: "Tata Power EZ Charge",
    fastChargers: "2x 60kW CCS2",
    assessmentStatus: "assessed",
    freshness: "Live updated",
    signals: {
      venue: { available: true, r_value: 0.82, c_value: 0.9, text: "High surrounding plaza activity" },
      hardware: { 
        available: true, 
        r_value: 0.80, 
        c_value: 0.8, 
        text: "Two review-derived warning patterns",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "warning", label: "App & Payment" },
          { type: "session", status: "warning", label: "Charge Speed & Stability" }
        ]
      },
      regional: { available: true, r_value: 0.70, c_value: 0.8, text: "Elevated regional search interest" },
      corridor: { available: true, r_value: 0.60, c_value: 0.6, text: "Possible traffic-disruption context" }
    }
  },
  {
    id: "stop_c",
    name: "Ramanagara Fuel-Station Hub",
    lat: 12.7150,
    lon: 77.2810,
    location: "NH 275, Km 42 • Ramanagara Bypass Station",
    distanceKm: 42,
    operator: "Jio-bp pulse",
    fastChargers: "2x 50kW CCS2",
    assessmentStatus: "assessed",
    freshness: "Live updated",
    signals: {
      venue: { available: false, r_value: null, c_value: 0.0, text: "Unavailable" },
      hardware: { 
        available: false, 
        r_value: null, 
        c_value: 0.0, 
        text: "Unavailable",
        diagnostics: [
          { type: "physical", status: "unavailable", label: "Connector & Cable" },
          { type: "software", status: "unavailable", label: "App & Payment" },
          { type: "session", status: "unavailable", label: "Charge Speed & Stability" }
        ]
      },
      regional: { available: true, r_value: 0.0, c_value: 0.9, text: "Normal baseline" },
      corridor: { available: true, r_value: 0.0, c_value: 0.5, text: "No matching disruption reports" }
    }
  }
];
