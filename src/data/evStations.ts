export interface EVStation {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  address: string;
  operator: string;
  fastChargers: string;
  plugTypes: string[];
  powerKw: number;
  totalStalls: number;
  availableStallsEstimated: number;
  fullnessPercentage: number;     // 0 - 100% (Probability that station is full / congested)
  confidencePercentage: number;   // 0 - 100% (Confidence in the prediction based on signals)
  status: 'AVAILABLE' | 'MODERATE' | 'LIKELY_FULL' | 'OFFLINE';
  estimatedWaitMinutes: number;
  lastUpdated: string;
  signals: {
    venueOccupancy: { r_value: number; c_value: number; text: string };
    chargerHardware: { r_value: number; c_value: number; text: string; diagnostics: { type: 'physical' | 'software' | 'session'; status: 'ok' | 'warning' | 'error'; label: string }[] };
    regionalTraffic: { r_value: number; c_value: number; text: string };
    recentReviews: { r_value: number; c_value: number; text: string };
  };
}

export const EV_STATIONS_DATA: EVStation[] = [
  // --- BENGALURU METRO & HIGHWAY HUBS ---
  {
    id: "blr_01",
    name: "Tata Power EZ Charge - Indiranagar 100ft Rd",
    city: "Bengaluru",
    state: "Karnataka",
    lat: 12.9716,
    lon: 77.6412,
    address: "100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru",
    operator: "Tata Power EZ Charge",
    fastChargers: "2x 60kW Dual CCS2",
    plugTypes: ["CCS2", "Type 2"],
    powerKw: 60,
    totalStalls: 4,
    availableStallsEstimated: 1,
    fullnessPercentage: 75,
    confidencePercentage: 88,
    status: "LIKELY_FULL",
    estimatedWaitMinutes: 20,
    lastUpdated: "3 mins ago",
    signals: {
      venueOccupancy: { r_value: 0.8, c_value: 0.9, text: "High plaza and retail traffic" },
      chargerHardware: {
        r_value: 0.1,
        c_value: 0.95,
        text: "Both chargers online and functional",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.7, c_value: 0.85, text: "Peak city corridor traffic" },
      recentReviews: { r_value: 0.2, c_value: 0.8, text: "Busy station, active turnover" }
    }
  },
  {
    id: "blr_02",
    name: "Zeon Charging - Nexus Koramangala Mall",
    city: "Bengaluru",
    state: "Karnataka",
    lat: 12.9352,
    lon: 77.6146,
    address: "Hosur Rd, Chikku Lakshmaiah Layout, Koramangala, Bengaluru",
    operator: "Zeon Charging",
    fastChargers: "4x 120kW Dual CCS2",
    plugTypes: ["CCS2", "CHAdeMO"],
    powerKw: 120,
    totalStalls: 6,
    availableStallsEstimated: 4,
    fullnessPercentage: 32,
    confidencePercentage: 92,
    status: "AVAILABLE",
    estimatedWaitMinutes: 0,
    lastUpdated: "Just now",
    signals: {
      venueOccupancy: { r_value: 0.35, c_value: 0.9, text: "Moderate mall parking flow" },
      chargerHardware: {
        r_value: 0.05,
        c_value: 0.95,
        text: "All 4 high-speed guns operating at full 120kW",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.3, c_value: 0.8, text: "Steady vehicle arrival pace" },
      recentReviews: { r_value: 0.1, c_value: 0.88, text: "Reliable fast charging, rarely full" }
    }
  },
  {
    id: "blr_03",
    name: "Jio-bp pulse - Electronic City Phase 1",
    city: "Bengaluru",
    state: "Karnataka",
    lat: 12.8399,
    lon: 77.6770,
    address: "Velankani Tech Park Exit, Electronic City, Bengaluru",
    operator: "Jio-bp pulse",
    fastChargers: "2x 60kW CCS2",
    plugTypes: ["CCS2"],
    powerKw: 60,
    totalStalls: 4,
    availableStallsEstimated: 2,
    fullnessPercentage: 48,
    confidencePercentage: 84,
    status: "MODERATE",
    estimatedWaitMinutes: 5,
    lastUpdated: "8 mins ago",
    signals: {
      venueOccupancy: { r_value: 0.5, c_value: 0.85, text: "Office hour corporate EV traffic" },
      chargerHardware: {
        r_value: 0.1,
        c_value: 0.9,
        text: "Stalls functional, good session stability",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.4, c_value: 0.8, text: "Moderate IT corridor movement" },
      recentReviews: { r_value: 0.2, c_value: 0.75, text: "Clean and accessible" }
    }
  },
  {
    id: "blr_04",
    name: "Ather Grid - Whitefield ITPL Road",
    city: "Bengaluru",
    state: "Karnataka",
    lat: 12.9850,
    lon: 77.7315,
    address: "Near ITPL Main Gate, Whitefield, Bengaluru",
    operator: "Ather Grid",
    fastChargers: "4x 22kW Fast Grid Hub",
    plugTypes: ["Type 2", "Ather Proprietary"],
    powerKw: 22,
    totalStalls: 4,
    availableStallsEstimated: 3,
    fullnessPercentage: 25,
    confidencePercentage: 90,
    status: "AVAILABLE",
    estimatedWaitMinutes: 0,
    lastUpdated: "Just now",
    signals: {
      venueOccupancy: { r_value: 0.25, c_value: 0.9, text: "Normal tech park flow" },
      chargerHardware: {
        r_value: 0.05,
        c_value: 0.95,
        text: "Grid units fully functional",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.2, c_value: 0.8, text: "Light local congestion" },
      recentReviews: { r_value: 0.05, c_value: 0.85, text: "Always available, fast handshake" }
    }
  },
  {
    id: "blr_05",
    name: "Statiq EV Station - Hebbal Flyover Plaza",
    city: "Bengaluru",
    state: "Karnataka",
    lat: 13.0358,
    lon: 77.5970,
    address: "Near Outer Ring Road Junction, Hebbal, Bengaluru",
    operator: "Statiq",
    fastChargers: "3x 60kW Dual CCS2",
    plugTypes: ["CCS2", "GB/T"],
    powerKw: 60,
    totalStalls: 6,
    availableStallsEstimated: 0,
    fullnessPercentage: 92,
    confidencePercentage: 94,
    status: "LIKELY_FULL",
    estimatedWaitMinutes: 30,
    lastUpdated: "2 mins ago",
    signals: {
      venueOccupancy: { r_value: 0.95, c_value: 0.95, text: "Airport-bound queue & heavy congestion" },
      chargerHardware: {
        r_value: 0.3,
        c_value: 0.88,
        text: "1 of 3 units reporting intermittent handshake",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "warning", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.9, c_value: 0.9, text: "Extreme airport corridor traffic" },
      recentReviews: { r_value: 0.8, c_value: 0.85, text: "Lines out to the service road, long wait" }
    }
  },
  {
    id: "blr_06",
    name: "Shell Recharge - Bellary Road Yelahanka",
    city: "Bengaluru",
    state: "Karnataka",
    lat: 13.1007,
    lon: 77.5963,
    address: "Shell Fuel Station, Bellary Rd, Yelahanka, Bengaluru",
    operator: "Shell Recharge",
    fastChargers: "2x 120kW Ultra-Fast CCS2",
    plugTypes: ["CCS2"],
    powerKw: 120,
    totalStalls: 4,
    availableStallsEstimated: 3,
    fullnessPercentage: 20,
    confidencePercentage: 86,
    status: "AVAILABLE",
    estimatedWaitMinutes: 0,
    lastUpdated: "Just now",
    signals: {
      venueOccupancy: { r_value: 0.2, c_value: 0.85, text: "Quick turnaround fuel plaza" },
      chargerHardware: {
        r_value: 0.05,
        c_value: 0.92,
        text: "Ultra-fast dispensers operational",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.2, c_value: 0.8, text: "Free-flowing highway section" },
      recentReviews: { r_value: 0.05, c_value: 0.8, text: "Fastest charging in North Bengaluru" }
    }
  },

  // --- CHENNAI METRO & HIGHWAY HUBS ---
  {
    id: "chn_01",
    name: "Zeon Charging - Express Avenue Mall",
    city: "Chennai",
    state: "Tamil Nadu",
    lat: 13.0587,
    lon: 80.2642,
    address: "Whites Rd, Royapettah, Chennai",
    operator: "Zeon Charging",
    fastChargers: "4x 60kW Dual CCS2",
    plugTypes: ["CCS2", "Type 2"],
    powerKw: 60,
    totalStalls: 6,
    availableStallsEstimated: 1,
    fullnessPercentage: 80,
    confidencePercentage: 89,
    status: "LIKELY_FULL",
    estimatedWaitMinutes: 25,
    lastUpdated: "4 mins ago",
    signals: {
      venueOccupancy: { r_value: 0.85, c_value: 0.9, text: "Mall basement parking near maximum capacity" },
      chargerHardware: {
        r_value: 0.1,
        c_value: 0.9,
        text: "Chargers operational",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.75, c_value: 0.85, text: "High city center weekend volume" },
      recentReviews: { r_value: 0.4, c_value: 0.8, text: "Expect wait on weekends" }
    }
  },
  {
    id: "chn_02",
    name: "Tata Power EZ Charge - OMR IT Corridor Perungudi",
    city: "Chennai",
    state: "Tamil Nadu",
    lat: 12.9654,
    lon: 80.2461,
    address: "Old Mahabalipuram Rd, Industrial Estate, Perungudi, Chennai",
    operator: "Tata Power EZ Charge",
    fastChargers: "3x 60kW CCS2",
    plugTypes: ["CCS2"],
    powerKw: 60,
    totalStalls: 6,
    availableStallsEstimated: 4,
    fullnessPercentage: 35,
    confidencePercentage: 85,
    status: "AVAILABLE",
    estimatedWaitMinutes: 0,
    lastUpdated: "Just now",
    signals: {
      venueOccupancy: { r_value: 0.35, c_value: 0.85, text: "Tech corridor commercial turnover" },
      chargerHardware: {
        r_value: 0.05,
        c_value: 0.9,
        text: "Units online with stable power delivery",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.3, c_value: 0.8, text: "Moderate OMR traffic" },
      recentReviews: { r_value: 0.1, c_value: 0.8, text: "Plenty of stalls available" }
    }
  },
  {
    id: "chn_03",
    name: "ChargeZone - Phoenix Marketcity Velachery",
    city: "Chennai",
    state: "Tamil Nadu",
    lat: 12.9915,
    lon: 80.2173,
    address: "Velachery Rd, Indira Gandhi Nagar, Velachery, Chennai",
    operator: "ChargeZone",
    fastChargers: "4x 120kW Dual CCS2",
    plugTypes: ["CCS2"],
    powerKw: 120,
    totalStalls: 6,
    availableStallsEstimated: 2,
    fullnessPercentage: 62,
    confidencePercentage: 87,
    status: "MODERATE",
    estimatedWaitMinutes: 10,
    lastUpdated: "6 mins ago",
    signals: {
      venueOccupancy: { r_value: 0.7, c_value: 0.9, text: "High mall visitor activity" },
      chargerHardware: {
        r_value: 0.1,
        c_value: 0.92,
        text: "All 4 high-speed guns active",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.6, c_value: 0.8, text: "Velachery junction congestion" },
      recentReviews: { r_value: 0.25, c_value: 0.8, text: "Fast charging, steady queue" }
    }
  },
  {
    id: "chn_04",
    name: "Relux Electric - ECR Beach Road Hub",
    city: "Chennai",
    state: "Tamil Nadu",
    lat: 12.8710,
    lon: 80.2429,
    address: "East Coast Rd, Uthandi, Chennai",
    operator: "Relux Electric",
    fastChargers: "2x 60kW CCS2",
    plugTypes: ["CCS2", "Type 2"],
    powerKw: 60,
    totalStalls: 4,
    availableStallsEstimated: 3,
    fullnessPercentage: 22,
    confidencePercentage: 82,
    status: "AVAILABLE",
    estimatedWaitMinutes: 0,
    lastUpdated: "Just now",
    signals: {
      venueOccupancy: { r_value: 0.2, c_value: 0.8, text: "Scenic route highway cafe stop" },
      chargerHardware: {
        r_value: 0.05,
        c_value: 0.88,
        text: "Operating normally",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.2, c_value: 0.8, text: "Light beach corridor movement" },
      recentReviews: { r_value: 0.05, c_value: 0.75, text: "Great stop with seaside breeze" }
    }
  },

  // --- MUMBAI & PUNE METRO HUBS ---
  {
    id: "mum_01",
    name: "Tata Power EZ Charge - Jio World Drive BKC",
    city: "Mumbai",
    state: "Maharashtra",
    lat: 19.0657,
    lon: 72.8687,
    address: "Bandra Kurla Complex, Bandra East, Mumbai",
    operator: "Tata Power EZ Charge",
    fastChargers: "6x 120kW Ultra-Fast CCS2",
    plugTypes: ["CCS2", "Type 2"],
    powerKw: 120,
    totalStalls: 8,
    availableStallsEstimated: 2,
    fullnessPercentage: 68,
    confidencePercentage: 92,
    status: "MODERATE",
    estimatedWaitMinutes: 10,
    lastUpdated: "2 mins ago",
    signals: {
      venueOccupancy: { r_value: 0.75, c_value: 0.95, text: "High commercial business park influx" },
      chargerHardware: {
        r_value: 0.05,
        c_value: 0.95,
        text: "Premium stall management, 100% hardware health",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.7, c_value: 0.9, text: "BKC connector traffic peak" },
      recentReviews: { r_value: 0.2, c_value: 0.85, text: "Clean and very well maintained" }
    }
  },
  {
    id: "mum_02",
    name: "Jio-bp pulse - Western Express Highway Goregaon",
    city: "Mumbai",
    state: "Maharashtra",
    lat: 19.1663,
    lon: 72.8526,
    address: "Western Express Hwy, Near Hub Mall, Goregaon, Mumbai",
    operator: "Jio-bp pulse",
    fastChargers: "4x 60kW Dual CCS2",
    plugTypes: ["CCS2"],
    powerKw: 60,
    totalStalls: 6,
    availableStallsEstimated: 0,
    fullnessPercentage: 95,
    confidencePercentage: 95,
    status: "LIKELY_FULL",
    estimatedWaitMinutes: 35,
    lastUpdated: "Just now",
    signals: {
      venueOccupancy: { r_value: 0.95, c_value: 0.98, text: "Severe queue spilling into service lane" },
      chargerHardware: {
        r_value: 0.2,
        c_value: 0.9,
        text: "High thermal throttle observed on stall #2",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "warning", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.9, c_value: 0.9, text: "WEH bottle-neck traffic" },
      recentReviews: { r_value: 0.85, c_value: 0.9, text: "Wait times exceeding 40 minutes" }
    }
  },
  {
    id: "pne_01",
    name: "Zeon Charging - Mumbai-Pune Expressway Food Mall Urse",
    city: "Pune",
    state: "Maharashtra",
    lat: 18.7231,
    lon: 73.6521,
    address: "Expressway Rest Area, Urse Toll Plaza, Pune",
    operator: "Zeon Charging",
    fastChargers: "6x 120kW Dual CCS2",
    plugTypes: ["CCS2"],
    powerKw: 120,
    totalStalls: 8,
    availableStallsEstimated: 6,
    fullnessPercentage: 24,
    confidencePercentage: 91,
    status: "AVAILABLE",
    estimatedWaitMinutes: 0,
    lastUpdated: "Just now",
    signals: {
      venueOccupancy: { r_value: 0.3, c_value: 0.9, text: "High-capacity highway food mall" },
      chargerHardware: {
        r_value: 0.05,
        c_value: 0.95,
        text: "High-capacity 120kW chargers all operational",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.2, c_value: 0.85, text: "Smooth expressway transit flow" },
      recentReviews: { r_value: 0.05, c_value: 0.9, text: "Best highway charging hub in Maharashtra" }
    }
  },

  // --- DELHI-NCR METRO HUBS ---
  {
    id: "del_01",
    name: "Statiq - Cyber Hub DLF Phase 2",
    city: "Gurugram",
    state: "Haryana / Delhi NCR",
    lat: 28.4950,
    lon: 77.0895,
    address: "DLF Cyber City, DLF Phase 2, Gurugram, Delhi NCR",
    operator: "Statiq",
    fastChargers: "4x 60kW Dual CCS2",
    plugTypes: ["CCS2", "Type 2"],
    powerKw: 60,
    totalStalls: 6,
    availableStallsEstimated: 1,
    fullnessPercentage: 84,
    confidencePercentage: 90,
    status: "LIKELY_FULL",
    estimatedWaitMinutes: 25,
    lastUpdated: "5 mins ago",
    signals: {
      venueOccupancy: { r_value: 0.9, c_value: 0.9, text: "Cyber Hub evening dining surge" },
      chargerHardware: {
        r_value: 0.1,
        c_value: 0.9,
        text: "Dispensers online",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.8, c_value: 0.85, text: "Heavy NH48 artery traffic" },
      recentReviews: { r_value: 0.7, c_value: 0.85, text: "Always full after 6 PM" }
    }
  },
  {
    id: "del_02",
    name: "Tata Power EZ Charge - Aerocity Worldmark 1",
    city: "New Delhi",
    state: "Delhi",
    lat: 28.5503,
    lon: 77.1212,
    address: "Asset Area 11, Hospitality District, Aerocity, New Delhi",
    operator: "Tata Power EZ Charge",
    fastChargers: "4x 120kW Dual CCS2",
    plugTypes: ["CCS2"],
    powerKw: 120,
    totalStalls: 6,
    availableStallsEstimated: 5,
    fullnessPercentage: 18,
    confidencePercentage: 93,
    status: "AVAILABLE",
    estimatedWaitMinutes: 0,
    lastUpdated: "Just now",
    signals: {
      venueOccupancy: { r_value: 0.2, c_value: 0.92, text: "Ample open bays at Aerocity plaza" },
      chargerHardware: {
        r_value: 0.05,
        c_value: 0.95,
        text: "Flawless hardware health, high amperage delivery",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.15, c_value: 0.85, text: "Controlled airport precinct flow" },
      recentReviews: { r_value: 0.05, c_value: 0.9, text: "Super fast and virtually empty" }
    }
  },

  // --- HYDERABAD METRO HUBS ---
  {
    id: "hyd_01",
    name: "Jio-bp pulse - Gachibowli Financial District",
    city: "Hyderabad",
    state: "Telangana",
    lat: 17.4399,
    lon: 78.3489,
    address: "ISB Road, Nanakramguda, Financial District, Hyderabad",
    operator: "Jio-bp pulse",
    fastChargers: "4x 60kW CCS2",
    plugTypes: ["CCS2"],
    powerKw: 60,
    totalStalls: 6,
    availableStallsEstimated: 2,
    fullnessPercentage: 65,
    confidencePercentage: 86,
    status: "MODERATE",
    estimatedWaitMinutes: 10,
    lastUpdated: "7 mins ago",
    signals: {
      venueOccupancy: { r_value: 0.65, c_value: 0.88, text: "Corporate campus rush hours" },
      chargerHardware: {
        r_value: 0.1,
        c_value: 0.9,
        text: "Units reporting normal charging current",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.6, c_value: 0.8, text: "ORR junction evening traffic" },
      recentReviews: { r_value: 0.3, c_value: 0.8, text: "Quick session turnaround" }
    }
  },
  {
    id: "hyd_02",
    name: "Zeon Charging - Inorbit Mall Hitec City",
    city: "Hyderabad",
    state: "Telangana",
    lat: 17.4344,
    lon: 78.3866,
    address: "Mindspace Madhapur Rd, Hitec City, Hyderabad",
    operator: "Zeon Charging",
    fastChargers: "4x 120kW Dual CCS2",
    plugTypes: ["CCS2", "Type 2"],
    powerKw: 120,
    totalStalls: 6,
    availableStallsEstimated: 4,
    fullnessPercentage: 28,
    confidencePercentage: 91,
    status: "AVAILABLE",
    estimatedWaitMinutes: 0,
    lastUpdated: "Just now",
    signals: {
      venueOccupancy: { r_value: 0.35, c_value: 0.9, text: "Mall dedicated EV parking deck open" },
      chargerHardware: {
        r_value: 0.05,
        c_value: 0.95,
        text: "120kW DC fast charging guns active",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.25, c_value: 0.8, text: "Mindspace internal road clear" },
      recentReviews: { r_value: 0.05, c_value: 0.88, text: "Consistently open and fast" }
    }
  },

  // --- TAMIL NADU REGIONAL HUBS (COIMBATORE, SALEM, MADURAI, TRICHY) ---
  {
    id: "cbe_01",
    name: "Zeon Charging - Avinashi Road Nava India",
    city: "Coimbatore",
    state: "Tamil Nadu",
    lat: 11.0238,
    lon: 76.9934,
    address: "Avinashi Rd, Near Nava India Junction, Coimbatore",
    operator: "Zeon Charging",
    fastChargers: "4x 60kW Dual CCS2",
    plugTypes: ["CCS2"],
    powerKw: 60,
    totalStalls: 4,
    availableStallsEstimated: 3,
    fullnessPercentage: 22,
    confidencePercentage: 88,
    status: "AVAILABLE",
    estimatedWaitMinutes: 0,
    lastUpdated: "Just now",
    signals: {
      venueOccupancy: { r_value: 0.2, c_value: 0.85, text: "Highway arterial rest plaza" },
      chargerHardware: {
        r_value: 0.05,
        c_value: 0.92,
        text: "Operating normally",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.15, c_value: 0.8, text: "Smooth transit speed" },
      recentReviews: { r_value: 0.05, c_value: 0.8, text: "Great charging hub in Coimbatore" }
    }
  },
  {
    id: "slm_01",
    name: "Relux EV Charging - NH-44 Toll Plaza Junction",
    city: "Salem",
    state: "Tamil Nadu",
    lat: 11.6643,
    lon: 78.1460,
    address: "NH 44 Highway Rest Complex, Salem",
    operator: "Relux Electric",
    fastChargers: "3x 60kW CCS2",
    plugTypes: ["CCS2"],
    powerKw: 60,
    totalStalls: 4,
    availableStallsEstimated: 1,
    fullnessPercentage: 72,
    confidencePercentage: 85,
    status: "LIKELY_FULL",
    estimatedWaitMinutes: 15,
    lastUpdated: "10 mins ago",
    signals: {
      venueOccupancy: { r_value: 0.75, c_value: 0.88, text: "High highway stopover traffic" },
      chargerHardware: {
        r_value: 0.1,
        c_value: 0.9,
        text: "Active sessions on 2 bays",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.65, c_value: 0.8, text: "NH-44 long distance transit" },
      recentReviews: { r_value: 0.3, c_value: 0.75, text: "Busy junction" }
    }
  },
  {
    id: "mdu_01",
    name: "ChargeZone EV Hub - Madurai Ring Road",
    city: "Madurai",
    state: "Tamil Nadu",
    lat: 9.9252,
    lon: 78.1198,
    address: "Ring Rd Bypass, Madurai",
    operator: "ChargeZone",
    fastChargers: "2x 60kW CCS2",
    plugTypes: ["CCS2"],
    powerKw: 60,
    totalStalls: 4,
    availableStallsEstimated: 3,
    fullnessPercentage: 25,
    confidencePercentage: 81,
    status: "AVAILABLE",
    estimatedWaitMinutes: 0,
    lastUpdated: "Just now",
    signals: {
      venueOccupancy: { r_value: 0.25, c_value: 0.8, text: "Open bypass parking" },
      chargerHardware: {
        r_value: 0.05,
        c_value: 0.85,
        text: "Units online",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.2, c_value: 0.75, text: "Clear highway bypass" },
      recentReviews: { r_value: 0.05, c_value: 0.7, text: "Convenient southern connector" }
    }
  },
  {
    id: "kch_01",
    name: "Tata Power EZ Charge - LuLu Mall Edappally",
    city: "Kochi",
    state: "Kerala",
    lat: 10.0284,
    lon: 76.3082,
    address: "34/1000, NH 47, Edappally, Kochi",
    operator: "Tata Power EZ Charge",
    fastChargers: "4x 60kW Dual CCS2",
    plugTypes: ["CCS2", "Type 2"],
    powerKw: 60,
    totalStalls: 6,
    availableStallsEstimated: 1,
    fullnessPercentage: 86,
    confidencePercentage: 92,
    status: "LIKELY_FULL",
    estimatedWaitMinutes: 25,
    lastUpdated: "3 mins ago",
    signals: {
      venueOccupancy: { r_value: 0.9, c_value: 0.95, text: "Extremely busy shopping complex" },
      chargerHardware: {
        r_value: 0.1,
        c_value: 0.9,
        text: "All chargers functional",
        diagnostics: [
          { type: "physical", status: "ok", label: "Connector & Cable" },
          { type: "software", status: "ok", label: "RFID & App Auth" },
          { type: "session", status: "ok", label: "Charging Speed Stability" }
        ]
      },
      regionalTraffic: { r_value: 0.85, c_value: 0.9, text: "Edappally junction gridlock" },
      recentReviews: { r_value: 0.75, c_value: 0.85, text: "Almost always occupied on weekends" }
    }
  }
];
