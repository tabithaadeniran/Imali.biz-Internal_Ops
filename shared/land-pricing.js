// ─── Imali.biz Internal — Land & Unit Pricing Dataset ───────────────────────
// This file is the pricing data layer for all internal pages.
//
// DATA SOURCES (three tiers, used in priority order):
//
//   Tier 1 · SCRAPED_LISTINGS    ← Automated scraper pulling from:
//              - imali.biz listing site (our own data, highest confidence)
//              - realigator.com
//              - jumia.rw real estate
//              - rw.propertypro.africa
//            Fields: district, sector, zone, size_sqm, listed_price_rwf,
//                    price_per_sqm, listing_date, source_url, verified
//
//   Tier 2 · FIELD_CAPTURE       ← Data collected by field officers:
//              Rwanda ground-truth pricing surveys
//            Fields: district, sector, zone, size_sqm, price_rwf,
//                    price_per_sqm, capture_date, field_officer,
//                    gps_lat, gps_lng, photo_count, validated
//
//   Tier 3 · STATIC_ESTIMATES    ← Analyst estimates (current fallback).
//              Replace row-by-row as real data comes in.
//            Fields: district, zone_type, land_price_per_sqm_rwf,
//                    unit_sale_price (by bedroom count)
//
// Usage: <script src="shared/land-pricing.js"></script>
//        getLandPrice('Gasabo', 'R3')   → { land_per_sqm, confidence, source }
//        getUnitPrice('Gasabo', 'twoBed') → price in RWF

'use strict';

// ════════════════════════════════════════════════════════════════════════════
// TIER 1 — SCRAPED LISTINGS
// Populate via scraper script. Each record = one scraped listing.
// ════════════════════════════════════════════════════════════════════════════
const SCRAPED_LISTINGS = [
  // { district:'Gasabo', sector:'Kimironko', zone:'R3', size_sqm:600,
  //   listed_price_rwf:42000000, price_per_sqm:70000,
  //   listing_date:'2025-04-01', source_url:'https://...', verified:false }
  // ... populated by scraper
];

// ════════════════════════════════════════════════════════════════════════════
// TIER 2 — FIELD CAPTURE
// Populated by field officers using the capture form (TBD).
// ════════════════════════════════════════════════════════════════════════════
const FIELD_CAPTURE = [
  // { district:'Huye', sector:'Ngoma', zone:'R2', size_sqm:800,
  //   price_rwf:12000000, price_per_sqm:15000,
  //   capture_date:'2025-05-10', field_officer:'AO-03',
  //   gps_lat:-2.60, gps_lng:29.74, photo_count:4, validated:false }
  // ... populated by field team
];

// ════════════════════════════════════════════════════════════════════════════
// TIER 3 — STATIC ANALYST ESTIMATES (current fallback)
// Source: Imali internal research, agent valuations, published surveys.
// Prices in RWF per sqm of LAND.
// Update these regularly as market data comes in.
// ════════════════════════════════════════════════════════════════════════════
const STATIC_ESTIMATES = {
  // ── Kigali City ──────────────────────────────────────────────────────────
  Gasabo: {
    R1: 35_000,  R2: 45_000,  R3: 60_000,  R4: 90_000,
    C1: 55_000,  C2: 80_000,  C3: 130_000,
    MU1: 65_000, MU2: 95_000,
  },
  Kicukiro: {
    R1: 30_000,  R2: 40_000,  R3: 52_000,  R4: 75_000,
    C1: 48_000,  C2: 65_000,  C3: 100_000,
    MU1: 55_000, MU2: 80_000,
  },
  Nyarugenge: {
    R1: 40_000,  R2: 55_000,  R3: 75_000,  R4: 110_000,
    C1: 70_000,  C2: 100_000, C3: 160_000,
    MU1: 80_000, MU2: 120_000,
  },

  // ── Northern Province ────────────────────────────────────────────────────
  Musanze:  { R1: 8_000, R2: 12_000, R3: 18_000, C1: 15_000, C2: 22_000, MU1: 18_000, MU2: 25_000 },
  Gicumbi:  { R1: 5_000, R2: 7_000,  R3: 10_000, C1: 9_000,  C2: 13_000, MU1: 10_000, MU2: 15_000 },
  Rulindo:  { R1: 4_000, R2: 6_000,  R3: 8_000,  C1: 7_000,  C2: 10_000, MU1: 8_000,  MU2: 12_000 },
  Burera:   { R1: 3_500, R2: 5_000,  R3: 7_000,  C1: 6_000,  C2: 9_000,  MU1: 7_000,  MU2: 10_000 },
  Gakenke:  { R1: 3_500, R2: 5_000,  R3: 7_000,  C1: 6_000,  C2: 9_000,  MU1: 7_000,  MU2: 10_000 },

  // ── Southern Province ────────────────────────────────────────────────────
  Huye:     { R1: 7_000, R2: 10_000, R3: 15_000, C1: 12_000, C2: 18_000, MU1: 14_000, MU2: 20_000 },
  Muhanga:  { R1: 6_000, R2: 9_000,  R3: 12_000, C1: 10_000, C2: 15_000, MU1: 12_000, MU2: 17_000 },
  Nyanza:   { R1: 5_000, R2: 7_000,  R3: 10_000, C1: 8_000,  C2: 12_000, MU1: 10_000, MU2: 14_000 },
  Ruhango:  { R1: 4_000, R2: 6_000,  R3: 8_000,  C1: 7_000,  C2: 10_000, MU1: 8_000,  MU2: 11_000 },
  Gisagara: { R1: 3_000, R2: 5_000,  R3: 7_000,  C1: 6_000,  C2: 8_000,  MU1: 6_500,  MU2: 9_000  },
  Nyamagabe:{ R1: 3_000, R2: 4_500,  R3: 6_500,  C1: 5_500,  C2: 8_000,  MU1: 6_000,  MU2: 8_500  },
  Nyaruguru:{ R1: 2_500, R2: 4_000,  R3: 6_000,  C1: 5_000,  C2: 7_500,  MU1: 5_500,  MU2: 8_000  },
  Kamonyi:  { R1: 4_000, R2: 6_000,  R3: 8_500,  C1: 7_500,  C2: 11_000, MU1: 8_500,  MU2: 12_000 },

  // ── Eastern Province ─────────────────────────────────────────────────────
  Rwamagana:{ R1: 9_000, R2: 13_000, R3: 18_000, C1: 15_000, C2: 22_000, MU1: 18_000, MU2: 25_000 },
  Bugesera: { R1: 6_000, R2: 9_000,  R3: 13_000, C1: 11_000, C2: 16_000, MU1: 13_000, MU2: 18_000 },
  Kayonza:  { R1: 4_000, R2: 6_000,  R3: 8_500,  C1: 7_500,  C2: 11_000, MU1: 8_500,  MU2: 12_000 },
  Nyagatare:{ R1: 4_500, R2: 6_500,  R3: 9_000,  C1: 8_000,  C2: 11_500, MU1: 9_000,  MU2: 13_000 },
  Ngoma:    { R1: 3_500, R2: 5_500,  R3: 7_500,  C1: 6_500,  C2: 9_500,  MU1: 7_500,  MU2: 11_000 },
  Gatsibo:  { R1: 3_500, R2: 5_000,  R3: 7_000,  C1: 6_000,  C2: 9_000,  MU1: 7_000,  MU2: 10_000 },
  Kirehe:   { R1: 3_000, R2: 4_500,  R3: 6_500,  C1: 5_500,  C2: 8_000,  MU1: 6_500,  MU2: 9_000  },

  // ── Western Province ─────────────────────────────────────────────────────
  Rubavu:   { R1: 10_000, R2: 15_000, R3: 22_000, C1: 18_000, C2: 28_000, MU1: 22_000, MU2: 32_000 },
  Rusizi:   { R1: 7_000,  R2: 10_000, R3: 14_000, C1: 12_000, C2: 17_000, MU1: 13_000, MU2: 19_000 },
  Karongi:  { R1: 5_000,  R2: 7_500,  R3: 11_000, C1: 9_000,  C2: 13_000, MU1: 11_000, MU2: 15_000 },
  Nyabihu:  { R1: 4_000,  R2: 6_000,  R3: 8_500,  C1: 7_500,  C2: 11_000, MU1: 8_500,  MU2: 12_000 },
  Ngororero:{ R1: 3_500,  R2: 5_500,  R3: 7_500,  C1: 6_500,  C2: 9_500,  MU1: 7_500,  MU2: 10_500 },
  Nyamasheke:{R1: 3_500,  R2: 5_000,  R3: 7_000,  C1: 6_000,  C2: 9_000,  MU1: 7_000,  MU2: 10_000 },
  Rutsiro:  { R1: 3_000,  R2: 4_500,  R3: 6_500,  C1: 5_500,  C2: 8_000,  MU1: 6_500,  MU2: 9_000  },
};

// ── Estimated unit SALE prices (RWF) by district + bedroom count ─────────────
// Based on estate agent surveys and published listings (2024–2025).
// To be refined by Tier 1 scraping and Tier 2 field data.
const UNIT_PRICES = {
  // Kigali premium (Gasabo/Nyarugenge prime areas)
  Gasabo:    { studio: 14_000_000, oneBed: 24_000_000, twoBed: 40_000_000, threeBed: 65_000_000 },
  Kicukiro:  { studio: 12_000_000, oneBed: 20_000_000, twoBed: 34_000_000, threeBed: 55_000_000 },
  Nyarugenge:{ studio: 16_000_000, oneBed: 28_000_000, twoBed: 46_000_000, threeBed: 75_000_000 },
  // Tier-2 cities
  Musanze:   { studio:  6_000_000, oneBed: 10_000_000, twoBed: 16_000_000, threeBed: 26_000_000 },
  Rubavu:    { studio:  7_000_000, oneBed: 12_000_000, twoBed: 19_000_000, threeBed: 30_000_000 },
  Huye:      { studio:  5_500_000, oneBed:  9_000_000, twoBed: 14_500_000, threeBed: 24_000_000 },
  Rwamagana: { studio:  6_000_000, oneBed: 10_500_000, twoBed: 17_000_000, threeBed: 28_000_000 },
  Rusizi:    { studio:  5_500_000, oneBed:  9_000_000, twoBed: 15_000_000, threeBed: 24_000_000 },
  // Other districts (upcountry baseline)
  _default:  { studio:  4_000_000, oneBed:  6_500_000, twoBed: 11_000_000, threeBed: 18_000_000 },
};

// ── Commercial GLA estimated rent/sale ───────────────────────────────────────
const COMMERCIAL_PRICES = {
  Gasabo:    { rentPerSqmPerMonth: 12_000, salePerSqm: 800_000 },
  Nyarugenge:{ rentPerSqmPerMonth: 15_000, salePerSqm: 1_000_000 },
  Kicukiro:  { rentPerSqmPerMonth: 10_000, salePerSqm: 700_000 },
  _default:  { rentPerSqmPerMonth:  5_000, salePerSqm: 300_000 },
};

// ════════════════════════════════════════════════════════════════════════════
// SCRAPED MARKET SUMMARY  (Tier 2.5 — between field capture and static estimates)
//
// Source: imali.biz listing site, scraped 2026-05-19
//         8,615 plot listings, 12,568 total listings
//
// Methodology:
//   1. Filter to "Plot for sale" only (land, not built property)
//   2. Remove statistical outliers (cap at RWF 5 billion to exclude junk entries)
//   3. Take P50 (median) of total asking prices per district
//   4. Divide by assumed typical plot size to get asking price/sqm
//      (where direct size data exists in listing titles, those are used as
//       a separate check and blended in with ~40% weight)
//   5. Apply 0.70 factor = asking → implied transaction price
//      (agents in Rwanda typically ask 20–40% above what the market transacts;
//       30% discount is a conservative middle estimate)
//
// IMPORTANT CAVEATS — read before using:
//   · These are ASKING PRICES set by agents, not verified transactions.
//     Agents often list at aspirational prices; actual deal prices are lower.
//   · NLA transaction data is at the other extreme — it records fiscal
//     valuations used for taxes and is systematically below real market prices
//     by 2–5× in most districts (see nla_gap_factor field).
//   · Real transaction prices likely sit between these two extremes.
//     Use the market_psqm value as a reasonable midpoint estimate.
//   · Sample sizes vary widely — Gasabo/Kicukiro have thousands of listings;
//     other districts have only tens.  Low-count districts are marked accordingly.
//   · Data will be superseded district-by-district as SCRAPED_LISTINGS (Tier 1)
//     and FIELD_CAPTURE (Tier 2) are populated with per-listing data + plot sizes.
//
// Fields:
//   asking_p50_rwf      — median total asking price for plots (RWF), outliers removed
//   asking_psqm         — derived asking price per sqm
//   market_psqm         — implied transaction price (asking × 0.70 discount)
//   assumed_plot_sqm    — typical plot size assumed for per-sqm derivation
//   n_direct_sqm        — listings that had explicit sqm in title (higher confidence)
//   n_plots             — total plot listings used
//   nla_gap_factor      — market_psqm ÷ NLA transaction price (how much NLA understates)
//   confidence          — 'medium' (sufficient data) | 'low' (small sample)
//   scraped_date        — when data was collected
// ════════════════════════════════════════════════════════════════════════════
const SCRAPED_MARKET_DATA = {

  // ── Kigali City ────────────────────────────────────────────────────────────
  // Gasabo: 6,456 plot listings. Direct sqm data from 6 unique Kibagabaga/Gacuriro/Kagugu
  //   listings gives 285K/sqm avg asking. Median-based (100M÷650sqm) gives 154K/sqm.
  //   Blended (40% direct, 60% median-based) → 207K asking → 145K market.
  //   Rounded to 140K to stay conservative given agent price inflation.
  //   NLA says 36K/sqm — a 3.9× understatement of real market.
  Gasabo: {
    asking_p50_rwf: 100_000_000, asking_psqm: 207_000, market_psqm: 140_000,
    assumed_plot_sqm: 650, n_direct_sqm: 6, n_plots: 6456,
    nla_gap_factor: 3.9, confidence: 'medium', scraped_date: '2026-05-19',
    notes: 'Strong sample. Direct measurements from Kibagabaga/Gacuriro/Kagugu (R3/R4 zones) skew asking higher; median covers all Gasabo including peri-urban edges.',
  },

  // Kicukiro: 1,971 plot listings. One direct size measurement (Kabeza 2400sqm/350M = 146K ask).
  //   Median-based (50M÷500sqm) = 100K asking. Given only 1 direct point, lean toward
  //   median (80% weight) → blended 107K asking → 75K market.
  //   NLA says 62K/sqm — only a 1.2× gap (NLA is unusually accurate here, or our
  //   assumed 500sqm is slightly small for typical Kicukiro plots).
  Kicukiro: {
    asking_p50_rwf: 50_000_000, asking_psqm: 107_000, market_psqm: 75_000,
    assumed_plot_sqm: 500, n_direct_sqm: 1, n_plots: 1971,
    nla_gap_factor: 1.2, confidence: 'medium', scraped_date: '2026-05-19',
    notes: 'Strong sample. NLA gap is unusually small — NLA transaction data for Kicukiro may be relatively reliable. Market price likely in 65K–90K/sqm range.',
  },

  // Nyarugenge: only 20 plot listings — treat as directional, not definitive.
  //   Median 70M ÷ 400sqm = 175K asking → 122K market. Rounded to 120K.
  //   This feels credible: Nyarugenge includes Kiyovu and CBD-adjacent plots.
  Nyarugenge: {
    asking_p50_rwf: 70_000_000, asking_psqm: 175_000, market_psqm: 120_000,
    assumed_plot_sqm: 400, n_direct_sqm: 0, n_plots: 20,
    nla_gap_factor: 2.4, confidence: 'low', scraped_date: '2026-05-19',
    notes: 'Small sample (n=20). Use directionally only. Kiyovu/CBD plots included — premium area.',
  },

  // ── Eastern Province ───────────────────────────────────────────────────────
  // Bugesera: 44 plot listings. Tight distribution (P25=10M, P50=16M, P75=16M, P90=25M).
  //   16M ÷ 700sqm = 22,857 asking → 16K market.
  //   NLA says 4K/sqm → 4× gap, which aligns with Bugesera's rapid development speculation.
  Bugesera: {
    asking_p50_rwf: 16_000_000, asking_psqm: 22_857, market_psqm: 16_000,
    assumed_plot_sqm: 700, n_direct_sqm: 0, n_plots: 44,
    nla_gap_factor: 4.0, confidence: 'low', scraped_date: '2026-05-19',
    notes: 'Moderate-small sample. Tight price band around median suggests consistent micro-market. Bugesera growth speculation may inflate asking prices.',
  },

  // Rwamagana: 56 plot listings. Median 9M, but P90=300M (likely large commercial plots).
  //   9M ÷ 700sqm = 12,857 asking → 9K market.
  //   NLA says 4.9K/sqm → 1.8× gap.
  Rwamagana: {
    asking_p50_rwf: 9_000_000, asking_psqm: 12_857, market_psqm: 9_000,
    assumed_plot_sqm: 700, n_direct_sqm: 0, n_plots: 56,
    nla_gap_factor: 1.8, confidence: 'low', scraped_date: '2026-05-19',
    notes: 'Moderate-small sample. P90 outlier (300M) likely large commercial parcel; median is representative of standard residential plots.',
  },
};

// ════════════════════════════════════════════════════════════════════════════
// QUERY HELPERS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get the best available land price per sqm for a district + zone.
 * Returns { pricePerSqm, confidence: 'high'|'medium'|'low', source, count, meta }
 *
 * DATA HIERARCHY:
 *   Tier 1 · SCRAPED_LISTINGS   — per-listing records with zone (populate via scraper)
 *   Tier 2 · FIELD_CAPTURE      — field officer surveys with zone (populate via field team)
 *   Tier 2.5 · SCRAPED_MARKET_DATA — district-level summary from imali.biz scrape (live)
 *   Tier 3 · STATIC_ESTIMATES   — zone-specific analyst estimates (fallback)
 *   Tier 4 · national fallback
 */
function getLandPrice(district, zoneCode) {
  // Tier 1: per-listing scraped records with zone code
  const scraped = SCRAPED_LISTINGS
    .filter(r => r.district === district && r.zone === zoneCode)
    .sort((a, b) => b.listing_date.localeCompare(a.listing_date));
  if (scraped.length >= 3) {
    const median = scraped.map(r => r.price_per_sqm).sort((a,b)=>a-b)[Math.floor(scraped.length/2)];
    return { pricePerSqm: median, confidence: 'high', source: 'scraped', count: scraped.length };
  }

  // Tier 2: validated field capture with zone code
  const field = FIELD_CAPTURE
    .filter(r => r.district === district && r.zone === zoneCode && r.validated);
  if (field.length >= 2) {
    const avg = Math.round(field.reduce((s,r)=>s+r.price_per_sqm,0)/field.length);
    return { pricePerSqm: avg, confidence: 'medium', source: 'field', count: field.length };
  }

  // Tier 2.5: scraped market summary (district-level, no zone breakdown)
  // Note: this is a district AVERAGE — zone multipliers should be applied by the caller.
  // Only used if we have sufficient data (n_plots >= 20 and confidence >= 'low').
  const sm = SCRAPED_MARKET_DATA[district];
  if (sm && sm.n_plots >= 20) {
    return {
      pricePerSqm: sm.market_psqm,
      confidence: sm.confidence,    // 'medium' or 'low'
      source: 'scraped_market',
      count: sm.n_plots,
      meta: sm,                     // full record available to caller
    };
  }

  // Tier 3: static zone-specific estimate
  const distPrices = STATIC_ESTIMATES[district];
  if (distPrices && distPrices[zoneCode]) {
    return { pricePerSqm: distPrices[zoneCode], confidence: 'low', source: 'estimate', count: 0 };
  }

  // Tier 4: national fallback
  return { pricePerSqm: 15_000, confidence: 'low', source: 'fallback', count: 0 };
}

/**
 * Get estimated unit sale price for district + bedroom type.
 * bedType: 'studio' | 'oneBed' | 'twoBed' | 'threeBed'
 */
function getUnitPrice(district, bedType) {
  const prices = UNIT_PRICES[district] || UNIT_PRICES._default;
  return prices[bedType] || prices.oneBed;
}

/**
 * Get estimated commercial price for district.
 */
function getCommercialPrice(district) {
  return COMMERCIAL_PRICES[district] || COMMERCIAL_PRICES._default;
}

if (typeof window !== 'undefined') {
  window.SCRAPED_LISTINGS      = SCRAPED_LISTINGS;
  window.FIELD_CAPTURE         = FIELD_CAPTURE;
  window.SCRAPED_MARKET_DATA   = SCRAPED_MARKET_DATA;
  window.STATIC_ESTIMATES      = STATIC_ESTIMATES;
  window.UNIT_PRICES           = UNIT_PRICES;
  window.COMMERCIAL_PRICES     = COMMERCIAL_PRICES;
  window.getLandPrice          = getLandPrice;
  window.getUnitPrice          = getUnitPrice;
  window.getCommercialPrice    = getCommercialPrice;
}
