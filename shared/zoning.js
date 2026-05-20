// ─── Imali.biz Internal — Rwanda Zoning & Regulatory Framework ──────────────
// Zone rules drawn from:
//   · Rwanda Urban Planning & Building Code (RNRA)
//   · Kigali City Master Plan 2020 (KCC)
//   · National Land Use & Development Master Plan 2050 (MINIRENA)
// Usage: <script src="shared/zoning.js"></script>  → window.ZONING

'use strict';

// ── Zone definitions ──────────────────────────────────────────────────────────
// maxFAR       — Floor Area Ratio cap (GFA ÷ plot area)
// maxCoverage  — Maximum plot coverage as decimal (footprint ÷ plot area)
// maxFloors    — Maximum number of above-ground storeys
// maxHeightM   — Maximum building height in metres (3m/floor + parapet)
// setbackFront — Minimum setback from front boundary (m)
// setbackSide  — Minimum setback from each side boundary (m)
// setbackRear  — Minimum setback from rear boundary (m)
// color        — Display colour (matches zoningColor() in map.html)

const ZONE_RULES = {
  R1: {
    code: 'R1', name: 'Low-Density Residential',
    desc: 'Detached houses, villas, small estates. Maximum 2 storeys.',
    maxFAR: 0.50, maxCoverage: 0.40, maxFloors: 2,  maxHeightM: 8,
    setbackFront: 5, setbackSide: 3, setbackRear: 3,
    color: '#fff9c4', typologies: ['townhouses'],
  },
  R2: {
    code: 'R2', name: 'Medium-Density Residential',
    desc: 'Row houses, walk-up apartments. Up to 4 storeys.',
    maxFAR: 1.20, maxCoverage: 0.50, maxFloors: 4,  maxHeightM: 14,
    setbackFront: 4, setbackSide: 2, setbackRear: 2,
    color: '#fff176', typologies: ['apartments', 'townhouses'],
  },
  R3: {
    code: 'R3', name: 'High-Density Residential',
    desc: 'Mid-rise apartment blocks. Up to 8 storeys.',
    maxFAR: 2.00, maxCoverage: 0.60, maxFloors: 8,  maxHeightM: 26,
    setbackFront: 3, setbackSide: 2, setbackRear: 2,
    color: '#ffee58', typologies: ['apartments'],
  },
  R4: {
    code: 'R4', name: 'Very High-Density Residential',
    desc: 'High-rise residential towers. 8–15 storeys.',
    maxFAR: 3.00, maxCoverage: 0.70, maxFloors: 15, maxHeightM: 48,
    setbackFront: 3, setbackSide: 2, setbackRear: 2,
    color: '#fdd835', typologies: ['apartments'],
  },
  C1: {
    code: 'C1', name: 'Neighbourhood Commercial',
    desc: 'Local shops, offices, clinics. Up to 4 storeys.',
    maxFAR: 1.50, maxCoverage: 0.60, maxFloors: 4,  maxHeightM: 14,
    setbackFront: 3, setbackSide: 2, setbackRear: 2,
    color: '#ffe0b2', typologies: ['commercial', 'mixed'],
  },
  C2: {
    code: 'C2', name: 'District Commercial Centre',
    desc: 'Retail, office towers. Up to 8 storeys.',
    maxFAR: 2.50, maxCoverage: 0.70, maxFloors: 8,  maxHeightM: 26,
    setbackFront: 3, setbackSide: 2, setbackRear: 2,
    color: '#ffcc80', typologies: ['commercial', 'mixed'],
  },
  C3: {
    code: 'C3', name: 'City Centre / CBD',
    desc: 'High-rise commercial core. 10–20 storeys.',
    maxFAR: 4.00, maxCoverage: 0.80, maxFloors: 20, maxHeightM: 65,
    setbackFront: 2, setbackSide: 1, setbackRear: 1,
    color: '#ffa726', typologies: ['commercial', 'mixed'],
  },
  MU1: {
    code: 'MU1', name: 'Mixed-Use (Low)',
    desc: 'Ground-floor retail, residential above. Up to 6 storeys.',
    maxFAR: 2.00, maxCoverage: 0.65, maxFloors: 6,  maxHeightM: 20,
    setbackFront: 3, setbackSide: 2, setbackRear: 2,
    color: '#ce93d8', typologies: ['mixed'],
  },
  MU2: {
    code: 'MU2', name: 'Mixed-Use (High)',
    desc: 'High-density mixed development. Up to 12 storeys.',
    maxFAR: 3.00, maxCoverage: 0.70, maxFloors: 12, maxHeightM: 39,
    setbackFront: 3, setbackSide: 2, setbackRear: 2,
    color: '#ba68c8', typologies: ['mixed', 'commercial'],
  },
  OS: {
    code: 'OS', name: 'Open Space / Green',
    desc: 'Parks, recreation, buffer zones. No construction.',
    maxFAR: 0.05, maxCoverage: 0.05, maxFloors: 1,  maxHeightM: 4,
    setbackFront: 0, setbackSide: 0, setbackRear: 0,
    color: '#dcedc8', typologies: [],
  },
};

// ── Map parcel "type" field → default zone code ──────────────────────────────
const TYPE_TO_ZONE = {
  residential: 'R3',
  'mixed-use':  'MU1',
  commercial:   'C2',
};

// ── Ordered zone list for UI dropdowns ───────────────────────────────────────
const ZONE_ORDER = ['R1','R2','R3','R4','C1','C2','C3','MU1','MU2'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getZone(code) {
  return ZONE_RULES[code] || ZONE_RULES.R3;
}

function defaultZoneFor(parcelType) {
  return TYPE_TO_ZONE[parcelType] || 'R3';
}

// Validate a proposed design against zone rules.
// Returns { coverage, far, height } — each boolean (true = compliant).
function checkCompliance(footprint, gfa, floors, plotArea) {
  const floorH = (typeof IMALI !== 'undefined') ? IMALI.dev.floorHeight : 3.0;
  return function(zoneCode) {
    const z = getZone(zoneCode);
    return {
      coverage: (footprint / plotArea) <= (z.maxCoverage + 0.001),
      far:      (gfa      / plotArea) <= (z.maxFAR      + 0.001),
      height:   (floors * floorH)     <= (z.maxHeightM  + 0.1),
    };
  };
}

if (typeof window !== 'undefined') {
  window.ZONE_RULES  = ZONE_RULES;
  window.ZONE_ORDER  = ZONE_ORDER;
  window.getZone     = getZone;
  window.defaultZoneFor = defaultZoneFor;
  window.checkCompliance = checkCompliance;
}
