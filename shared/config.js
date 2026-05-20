// ─── Imali.biz Internal — Shared Configuration ──────────────────────────────
// Single source of truth for all GIS endpoints, map settings, and
// development cost constants. Reference this from any internal page.
// Usage: <script src="shared/config.js"></script>  → window.IMALI

'use strict';

const IMALI = {

  // ── GIS service root URLs ────────────────────────────────────────────────
  gis: {
    // Kigali City Master Plan 2020 (official MapServer)
    kigaliMP:  'https://masterplan.kigalicity.gov.rw/server/rest/services/Masterplan2020/Masterplan2020_24June2024/MapServer',

    // Rwanda NSDI geodata.rw — root for all district DLUPs + NLUDMP2050
    nsdi:      'https://geodata.rw/server/rest/services/masterplan',

    // National Land Use & Development Master Plan 2050
    nludmp:    'https://geodata.rw/server/rest/services/masterplan/NLUDMP2050_FS/MapServer',

    // Topographic admin boundaries (provinces, districts, sectors)
    admBounds: 'https://geodata.rw/server/rest/services/TopographicMap_Administrative_Boundaries_1k/MapServer',

    // Topographic land use (vegetation, cultivation, water)
    landUse:   'https://geodata.rw/server/rest/services/TopographicMap_Land_use_1k/MapServer',

    // Land use / land cover 2017–2022 (village admin overlay)
    lulc:      'https://geodata.rw/server/rest/services/land_use_land_cover_20172022/MapServer',

    // Rwanda country boundary GeoJSON (fallbacks in order)
    borderGeojson: [
      'https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/RWA/ADM0/geoBoundaries-RWA-ADM0.geojson',
      'https://nominatim.openstreetmap.org/search?q=Rwanda&polygon_geojson=1&format=geojson&limit=1',
    ],
  },

  // ── Basemap tile URLs (CARTO) ────────────────────────────────────────────
  tiles: {
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    dark:  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attr:  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },

  // ── Default map view (Rwanda) ────────────────────────────────────────────
  map: {
    centre:    [-1.9403, 29.8739],
    zoom:      8,
    minZoom:   8,
    maxZoom:   20,
    bounds:    [[-2.84, 28.86], [-1.05, 30.90]],
  },

  // ── Development cost constants ───────────────────────────────────────────
  dev: {
    // RWF per sqm of gross floor area (construction cost only, ex. land)
    costPerSqmGFA: 500_000,

    // Minimum tokenised investment unit (RWF)
    minInvestorStake: 75_000,

    // Standard floor-to-floor height (metres)
    floorHeight: 3.0,

    // Net-to-gross efficiency (lettable area / GFA)
    efficiency: 0.82,

    // Typical unit sizes by bedroom count (sqm net)
    unitSizes: {
      studio:  28,
      oneBed:  45,
      twoBed:  65,
      threeBed: 85,
    },

    // Default unit mix for a standard residential development
    defaultMix: { studio: 20, oneBed: 40, twoBed: 30, threeBed: 10 },
  },

  // ── Rwanda admin structure (top level) ──────────────────────────────────
  // Full sector/cell/village hierarchy: ../../Website/valuation data/rwanda_geo.json
  provinces: ['Kigali City', 'Northern Province', 'Southern Province', 'Eastern Province', 'Western Province'],

  districts: {
    'Kigali City':      ['Gasabo', 'Kicukiro', 'Nyarugenge'],
    'Northern Province':['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
    'Southern Province':['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
    'Eastern Province': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
    'Western Province': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'],
  },
};

if (typeof window !== 'undefined') window.IMALI = IMALI;
