# ChargeFinder India ⚡
### Real-Time EV Station Finder & Fullness Confidence Engine

> **Discover EV charging stations across India with real-time occupancy estimation and mathematical confidence percentages.**

[![Deployment](https://img.shields.io/badge/Deployed-Vercel-black.svg?logo=vercel)](https://chargefinder-xi.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg)](https://vitejs.dev/)

🔗 **Live Production Demo**: [https://chargefinder-xi.vercel.app](https://chargefinder-xi.vercel.app)

---

## 💡 What ChargeFinder Does

ChargeFinder helps EV drivers across India solve the single biggest pain point of EV ownership: **arriving at a charger only to find every stall occupied or queueing for hours.**

1. **Nationwide EV Station Discovery**: Real-time interactive map displaying charging hubs across Bengaluru, Chennai, Mumbai, Delhi-NCR, Hyderabad, Pune, Coimbatore, Madurai, Kochi, and highway corridors.
2. **Occupancy & Fullness Percentage ($P(\text{Full})$)**: Transparent 0–100% calculation showing whether a station has empty stalls or is likely full.
3. **Prediction Confidence Score**: Confidence percentage based on live telemetry, sensor freshness, and review frequency.
4. **Instant Filtering**: Search by name, city, operator (Tata Power, Zeon, Jio-bp, Ather, Statiq, ChargeZone, Relux, Shell Recharge), power output (≥60kW DC Fast), or status.

---

## 🧮 Mathematical Scoring Specification

### 1. Fullness Probability Percentage ($P(\text{Full})$)
Predicts the likelihood that all stalls are occupied:

$$P(\text{Full}) = 100 \times \left[ \frac{\sum_{i \in \text{available}} w_i \cdot r_i}{\sum_{i \in \text{available}} w_i} \right]$$

- $w_i$: Signal weight assigned to data dimension $i$.
- $r_i$: Normalized congestion risk score $[0..1]$ ($0 = \text{empty stalls}$, $1 = \text{heavy queue / stalls occupied}$).
- **Availability Rate**: $\text{Availability} = 100\% - P(\text{Full})$.

### 2. Evidence Confidence Percentage
Quantifies data freshness and sensor coverage:

$$\text{Confidence} = 100 \times \sum_{i=1}^{n} (w_i \cdot c_i)$$

- $c_i$: Signal confidence score $[0..1]$ ($c_i = 0.0$ if signal is missing or unavailable).

### 3. Safety Guardrail
$$\text{If } \text{Confidence} < 50.0\% \implies \text{Flagged as "Verify First"}$$

---

## 🗺️ Cities & Networks Covered

- **Metros**: Bengaluru, Chennai, Mumbai, Pune, Delhi-NCR, Hyderabad, Kochi, Coimbatore, Madurai, Salem.
- **Networks**: Tata Power EZ Charge, Zeon Electric, Jio-bp pulse, Ather Grid, Statiq, ChargeZone, Relux Electric, Shell Recharge.
- **Connectors**: CCS2, Type 2 AC, GB/T, CHAdeMO.

---

## ✨ Features

- **Interactive High-Resolution Map**: Leaflet map with custom status markers, visual radar animations, and one-click metro jumping.
- **Search & Multi-Filter Bar**: Real-time filtering by status (`<40% Full`, `40–70% Moderate`, `>70% Likely Full`, `≥60kW DC Fast`), operator, and station name.
- **Telemetry & Evidence Drawer**: Deep-dive inspection showing stall occupancy breakdown, estimated queue time, hardware status, and raw signals.
- **Fullness & Confidence Modal**: Complete mathematical breakdown accessible via the header.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** `v18+` or `v20+`
- **npm** `v9+`

### Installation & Launch

```bash
# 1. Install dependencies
npm install

# 2. Launch development server
npm run dev
```

Visit [`http://localhost:5173`](http://localhost:5173) in your browser.

---

## 🧪 Verification & Build

```bash
# Typecheck & build for production
npm run build
```
