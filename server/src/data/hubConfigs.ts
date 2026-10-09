export type DiagnosticType = 'physical' | 'software' | 'session';
export type DiagnosticStatus = 'ok' | 'warning' | 'error' | 'unavailable';

export interface HardwareDiagnosticItem {
  type: DiagnosticType;
  status: DiagnosticStatus;
  label: string;
}

export interface SignalDataContract {
  available: boolean;
  r_value: number | null;
  c_value: number;
  text: string;
  diagnostics?: HardwareDiagnosticItem[];
}

export interface StopSignalsContract {
  venue: SignalDataContract;
  hardware: SignalDataContract;
  regional: SignalDataContract;
  corridor: SignalDataContract;
}

export interface StopResponseContract {
  id: string;
  name: string;
  signals: StopSignalsContract;
}

export interface HubConfig {
  id: string;
  name: string;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  serpParams: {
    mapsQuery: string;
    reviewsQuery: string;
    trendsQuery: string;
    newsQuery: string;
    placeId?: string;
  };
  fallbackFixture: StopResponseContract;
}

export const HUB_CONFIGS: Record<string, HubConfig> = {
  stop_a: {
    id: "stop_a",
    name: "Srirangapatna Hub",
    locationName: "Srirangapatna, NH 275",
    coordinates: { lat: 12.4223, lng: 76.6837 },
    serpParams: {
      mapsQuery: "EV Charging Station Srirangapatna Bengaluru Mysuru Expressway",
      reviewsQuery: "Srirangapatna EV Charger reviews complaints outage",
      trendsQuery: "EV Charging Srirangapatna Expressway",
      newsQuery: "NH 275 Expressway traffic Srirangapatna",
      placeId: "ChIJW1Srirangapatna_Demo_Id"
    },
    fallbackFixture: {
      id: "stop_a",
      name: "Srirangapatna Hub",
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
    }
  },
  stop_b: {
    id: "stop_b",
    name: "Channapatna Plaza Hub",
    locationName: "Channapatna, NH 275",
    coordinates: { lat: 12.6518, lng: 77.2089 },
    serpParams: {
      mapsQuery: "Tata Power EV Charging Station Toy Town Channapatna Expressway",
      reviewsQuery: "Channapatna EV charging station broken not working slow",
      trendsQuery: "Channapatna Plaza Expressway traffic EV charging",
      newsQuery: "Channapatna Expressway traffic bottleneck delay",
      placeId: "ChIJChannapatna_Demo_Id"
    },
    fallbackFixture: {
      id: "stop_b",
      name: "Channapatna Plaza Hub",
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
    }
  },
  stop_c: {
    id: "stop_c",
    name: "Ramanagara Fuel-Station Hub",
    locationName: "Ramanagara, NH 275",
    coordinates: { lat: 12.7150, lng: 77.2810 },
    serpParams: {
      mapsQuery: "Jio-bp pulse EV Charger Ramanagara Bypass",
      reviewsQuery: "Ramanagara EV Charging reviews",
      trendsQuery: "Ramanagara Expressway search",
      newsQuery: "Ramanagara Expressway disruption",
      placeId: "ChIJRamanagara_Demo_Id"
    },
    fallbackFixture: {
      id: "stop_c",
      name: "Ramanagara Fuel-Station Hub",
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
  },
  stop_d: {
    id: "stop_d",
    name: "Maddur Rest Hub",
    locationName: "Maddur, NH 275",
    coordinates: { lat: 12.5833, lng: 77.0500 },
    serpParams: {
      mapsQuery: "Statiq EV Charging Station Maddur Rest Plaza NH 275",
      reviewsQuery: "Maddur EV Charging station reviews complaints",
      trendsQuery: "Maddur Plaza Expressway traffic EV charging",
      newsQuery: "Maddur NH 275 Expressway traffic update",
      placeId: "ChIJMaddur_Demo_Id"
    },
    fallbackFixture: {
      id: "stop_d",
      name: "Maddur Rest Hub",
      signals: {
        venue: { available: true, r_value: 0.25, c_value: 0.85, text: "Moderate plaza capacity" },
        hardware: { 
          available: true, 
          r_value: 0.10, 
          c_value: 0.88, 
          text: "All chargers operational with low error rate",
          diagnostics: [
            { type: "physical", status: "ok", label: "Connector & Cable" },
            { type: "software", status: "ok", label: "App & Payment" },
            { type: "session", status: "ok", label: "Charge Speed & Stability" }
          ]
        },
        regional: { available: true, r_value: 0.15, c_value: 0.80, text: "Normal regional activity" },
        corridor: { available: true, r_value: 0.10, c_value: 0.70, text: "Clear corridor traffic flow" }
      }
    }
  }
};
