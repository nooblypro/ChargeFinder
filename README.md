# ChargeSync India ⚡
### Explainable EV Charging-Stop Friction Advisor for the Bengaluru–Mysuru Expressway (NH-275)

> **Empowering EV road-trippers with transparent, multi-dimensional stopping friction predictions backed by mathematical confidence thresholds.**

[![Deployment](https://img.shields.io/badge/Deployed-Vercel-black.svg?logo=vercel)](https://chargefinder-xi.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg)](https://vitejs.dev/)

🔗 **Live Production Demo**: [https://chargefinder-xi.vercel.app](https://chargefinder-xi.vercel.app)

---

## 💡 The Core Problem

Standard EV apps (Google Maps, PlugShare) show static locations and rated power (kW). But on major highway corridors like NH-275, EV road trips fail because drivers cannot anticipate:
1. **Plaza Crowding & Amenities**: Long food plaza queues that turn a 20-minute stop into an hour.
2. **Hidden Hardware Failures**: Broken connectors, failing card readers, or throttled speeds buried inside recent user reviews.
3. **Corridor Traffic Bottlenecks**: Toll gate traffic spikes and expressway disruptions.

**ChargeSync India** evaluates EV charging stops across 4 signal dimensions and produces an explainable, auditable recommendation with strict safety guardrails.

---

## 🧮 Mathematical Scoring Specification

### 1. Charging Stop Desirability Score (CSDS)
Measures friction-free stop quality across all **available** signals ($i \in \text{available}$):

$$\text{CSDS} = 100 \times \left[ \frac{\sum_{i \in \text{available}} w_i (1 - r_i)}{\sum_{i \in \text{available}} w_i} \right]$$

- $w_i$: Signal weight assigned to domain dimension $i$.
- $r_i$: Normalized friction risk score $[0..1]$ ($0 = \text{flawless}$, $1 = \text{severe outage/queue}$).
- $(1 - r_i)$: Desirability term (inverted friction).

### 2. Evidence Confidence Score (ECS)
Quantifies overall data quality and signal availability across all 4 signal dimensions:

$$\text{ECS} = 100 \times \sum_{i=1}^{4} (w_i \cdot c_i)$$

- $c_i$: Signal confidence score $[0..1]$ ($c_i = 0.0$ if signal is missing or unavailable).

### 3. Strict Safety Suppression Rule
$$\text{If } \text{ECS} < 55.0\% \implies \text{Display CSDS} = \mathbf{\text{"Suppressed"}}$$

> **Why this matters for judges:** When critical hardware or venue data is absent (e.g. newly registered roadside chargers), standard algorithms produce misleading 100% scores. ChargeSync India strictly **suppresses** ungrounded numerical scores and flags the stop as **"Verify First"** to protect drivers.

---

## 📊 Signal Domain Weight Matrix

| Signal Domain | Weight ($w_i$) | Data Source | Monitored Dimensions |
| :--- | :---: | :--- | :--- |
| **Venue Pressure** | `0.30` (30%) | Google Maps & Plaza Activity | Waiting lines, dining crowding, seating pressure |
| **Hardware Warnings** | `0.35` (35%) | Google Maps Reviews NLP | Connector faults, app/payment issues, speed throttling |
| **Regional Baseline** | `0.20` (20%) | Google Trends | Regional EV activity and query velocity |
| **Corridor Alerts** | `0.15` (15%) | Google News & Traffic | NH-275 expressway construction, diversions, weather |

---

## 🗺️ Monitored Corridor Hubs (NH-275)

| Stop ID | Hub Name | Distance | Operator | Status / CSDS | Recommendation |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `stop_a` | **Srirangapatna Hub** | Km 104 | Zeon & KSEB | **87.4%** (ECS 81%) | 🟢 **RECOMMENDED** (Optimal stop) |
| `stop_b` | **Channapatna Plaza Hub** | Km 56 | Tata Power EZ Charge | **24.4%** (ECS 80%) | 🔴 **AVOID / HIGH FRICTION** (Hardware faults) |
| `stop_c` | **Ramanagara Fuel Station** | Km 42 | Jio-bp pulse | **Suppressed** (ECS 25.5%) | ⚪ **VERIFY FIRST** (Low data confidence) |
| `stop_d` | **Maddur Food Plaza Hub** | Km 78 | Statiq / Exicom | *On-Demand* | 🟡 **LIVE ASSESSMENT** (Progressive stepper) |

---

## ✨ Key Capabilities & Judge Demo Walkthrough

1. **Expressway Corridor Map**: Interactive NH-275 waypoint diagram with color-coded live friction statuses.
2. **Scoring Methodology Modal**: Click **"Scoring Methodology"** in the header to view transparent formulas, mathematical proofs, and suppression logic.
3. **Comprehensive Evidence Drawer**: Inspect any hub to view:
   - Three-pillar hardware diagnostics (`Connector & Cable`, `App & Payment`, `Charge Speed & Stability`).
   - Technical Math & Audit breakdown showing intermediate $w_i$, $r_i$, and $c_i$ terms.
   - Raw JSON payloads from live sensors and APIs.
4. **On-Demand Live Enrichment Stepper**: Click `Maddur Food Plaza Hub` or click **"Run Live Friction Assessment"** to watch the progressive 4-step pipeline fetch live multi-source signals.
5. **Statewide OpenStreetMap Directory & Ambiguity Guard**:
   - Query live EV charging nodes across Karnataka and Tamil Nadu via the Overpass API.
   - Ambiguity detection: If two candidate stations are located within 2 km with similar confidence scores, the system flags the station as ambiguous to prevent misattribution.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** `v18+` or `v20+`
- **npm** `v9+`

### Installation & Launch

```bash
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
cd server && npm install && cd ..

# 3. Launch both frontend and backend concurrently
npm run dev
```

- **Frontend Dashboard**: [`http://localhost:5173`](http://localhost:5173)
- **Backend API Server**: [`http://localhost:3001`](http://localhost:3001)
  - Health check: [`http://localhost:3001/health`](http://localhost:3001/health)
  - Stop endpoints: [`http://localhost:3001/api/stops`](http://localhost:3001/api/stops)
  - Directory endpoints: [`http://localhost:3001/api/directory/stations`](http://localhost:3001/api/directory/stations)

### Configuration (Optional)
Copy `.env.example` to `.env` in the root or `server/`:
```bash
cp .env.example .env
```
```env
PORT=3001
SERPAPI_API_KEY=YOUR_SERPAPI_KEY_HERE
```

> **🛡️ Fail-Safe Hackathon Mode**: Even without a SerpApi key or with network downtime, the backend seamlessly activates local benchmark fallbacks with HTTP 200 responses. The interface is guaranteed to never break during a live demo.

---

## 🏗️ Architecture

```
ChargeFinder/
├── src/                          # React 19 Frontend
│   ├── components/
│   │   ├── Header.tsx            # Header with Methodology button
│   │   ├── FormulaModal.tsx      # Interactive mathematical specification
│   │   ├── ExpresswayMap.tsx     # Corridor waypoint visualization
│   │   ├── StatewideMap.tsx      # OpenStreetMap + Ambiguity guard
│   │   ├── HubCard.tsx           # Responsive hub recommendation card
│   │   ├── EvidenceDrawer.tsx    # Slide-over evidence inspector & diagnostics
│   │   ├── ProgressiveStepper.tsx# 4-stage live enrichment stepper
│   │   └── SkeletonLoader.tsx    # Shimmer loading skeletons
│   ├── data/fixtures.ts          # Baseline NH-275 benchmarks
│   ├── utils/
│   │   ├── scoring.ts            # CSDS, ECS & suppression calculation engine
│   │   └── verdict.tsx           # Status verdicts & badges
│   └── types/charging.ts         # TypeScript data contracts
│
└── server/                       # Node.js + Express Backend
    └── src/
        ├── index.ts              # Express API server & routes
        ├── routes/               # /api/stops, /api/directory, /api/friction
        ├── services/             # Overpass OSM & SerpApi integrations
        ├── transformers/         # Signal NLP & score normalization
        ├── cache/cache.ts        # node-cache in-memory caching (600s TTL)
        └── data/hubConfigs.ts    # NH-275 corridor configuration
```

---

## 🧪 Verification & Quality Checks

Run the verification suite:

```bash
# Typecheck & build frontend
npm run build

# Typecheck & build backend
npm run build --prefix server

# Linting and fast static analysis
npx oxlint
```

---

## 👥 Authors
Built for the Hackathon with mathematical rigor and production-grade engineering.
