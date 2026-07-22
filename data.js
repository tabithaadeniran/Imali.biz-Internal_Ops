// ─── Imali.biz Internal Website — Shared Data ────────────────────────────────

const DEV_COST_PER_SQM = 500000;  // RWF per sqm of GFA
const MIN_INVESTOR_STAKE = 75000; // RWF minimum fractional investment

// ─── Land Parcels ─────────────────────────────────────────────────────────────
// Sourced from data/pipeline.js — loaded before this script on every page.
const parcels = (typeof PIPELINE_PARCELS !== 'undefined') ? PIPELINE_PARCELS : [];

// ─── Computed fields (mutates parcels in place) ────────────────────────────────
parcels.forEach(p => {
  p.units_planned     = Math.floor(p.size_sqm / 100);
  p.gfa_sqm           = p.units_planned * 100;
  p.dev_cost_rwf      = p.gfa_sqm * DEV_COST_PER_SQM;
  p.price_per_sqm     = p.size_sqm       > 0 ? Math.round(p.land_price_rwf / p.size_sqm)       : 0;
  p.dev_cost_per_unit = p.units_planned  > 0 ? Math.round(p.dev_cost_rwf   / p.units_planned)  : 0;
  p.leverage_ratio    = p.land_price_rwf > 0 ? parseFloat((p.dev_cost_rwf  / p.land_price_rwf).toFixed(2)) : 0;
  const rKeys = Object.keys(p.readiness);
  p.avg_readiness = Math.round(rKeys.reduce((s, k) => s + p.readiness[k], 0) / rKeys.length);
});

// ─── Utilities ────────────────────────────────────────────────────────────────
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key];
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

function fmtRWF(n) {
  if (n >= 1e9) return 'RWF ' + (n / 1e9).toFixed(2) + 'bn';
  if (n >= 1e6) return 'RWF ' + (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return 'RWF ' + Math.round(n / 1e3).toLocaleString() + 'K';
  return 'RWF ' + n.toLocaleString();
}

// 1 USD = 1,300 RWF — update this constant to keep exchange rate current
const USD_RATE = 1300;

function fmtUSD(n) {
  const usd = n / USD_RATE;
  if (usd >= 1e9) return '$' + (usd / 1e9).toFixed(2) + 'B';
  if (usd >= 1e6) return '$' + (usd / 1e6).toFixed(1) + 'M';
  if (usd >= 1e3) return '$' + Math.round(usd / 1e3).toLocaleString() + 'K';
  return '$' + Math.round(usd).toLocaleString();
}

// Returns HTML: bold USD primary, muted RWF secondary
function fmtPrice(n) {
  if (!n) return '—';
  return fmtUSD(n) + ' <span class="rwf-sub">' + fmtRWF(n) + '</span>';
}

function fmtNum(n) {
  return Math.round(n).toLocaleString();
}

function statusLabel(s) {
  return { listed: 'Listed', under_review: 'Under Review', pending: 'Pending' }[s] || s;
}

// ─── Aggregated summary ────────────────────────────────────────────────────────
function getSummary() {
  const totalSizeSqm   = parcels.reduce((s, p) => s + p.size_sqm, 0);
  const totalLandValue = parcels.reduce((s, p) => s + p.land_price_rwf, 0);
  const totalDevCost   = parcels.reduce((s, p) => s + p.dev_cost_rwf, 0);
  const totalUnits     = parcels.reduce((s, p) => s + p.units_planned, 0);
  const totalGFA       = parcels.reduce((s, p) => s + p.gfa_sqm, 0);
  const investorsNeeded = Math.ceil(totalDevCost / MIN_INVESTOR_STAKE);

  return {
    totalParcels: parcels.length,
    totalSizeSqm,
    totalLandValue,
    totalDevCost,
    totalUnits,
    totalGFA,
    investorsNeeded,
    portfolioValue: totalLandValue + totalDevCost,
    byDistrict: groupBy(parcels, 'district'),
    byType:     groupBy(parcels, 'type'),
    byStatus:   groupBy(parcels, 'status')
  };
}

// ─── Materials catalog ─────────────────────────────────────────────────────────
function getMaterials(gfa, units) {
  const ironSheets = Math.ceil((gfa * 1.2) / 2.88);

  const catalog = [
    // ── Structure ──────────────────────────────────────────────────────────────
    { id: 'cement',      name: 'Cement (50kg bags)',                        category: 'Structure', unit: 'bags',    qty: Math.ceil(gfa * 0.4),          unit_price: 10000   },
    { id: 'sand',        name: 'Sand',                                      category: 'Structure', unit: 'm³',      qty: Math.ceil(gfa * 0.5),          unit_price: 25000   },
    { id: 'gravel',      name: 'Gravel / Aggregate',                        category: 'Structure', unit: 'm³',      qty: Math.ceil(gfa * 0.4),          unit_price: 30000   },
    { id: 'stone',       name: 'Stone (Rubble / Quarried)',                 category: 'Structure', unit: 'm³',      qty: Math.ceil(gfa * 0.15),         unit_price: 18000   },
    { id: 'steel',       name: 'Steel Rods / Rebar',                       category: 'Structure', unit: 'tonnes',  qty: Math.ceil(gfa * 0.012),        unit_price: 1200000 },
    { id: 'binding',     name: 'Binding Wire',                              category: 'Structure', unit: 'kg',      qty: Math.ceil(gfa * 3),            unit_price: 2800    },
    { id: 'blocks',      name: 'Concrete / Masonry Blocks',                 category: 'Structure', unit: 'blocks',  qty: Math.ceil(gfa * 9),            unit_price: 400     },
    { id: 'cseb',        name: 'CSEB (Compressed Stabilized Earth Blocks)', category: 'Structure', unit: 'blocks',  qty: Math.ceil(gfa * 4),            unit_price: 280     },
    { id: 'timber_str',  name: 'Timber / Engineered Wood (Structural)',     category: 'Structure', unit: 'm³',      qty: Math.ceil(gfa * 0.02),         unit_price: 420000  },

    // ── Roofing ────────────────────────────────────────────────────────────────
    { id: 'iron',        name: 'Box-Profile Roofing Sheets',                category: 'Roofing',   unit: 'sheets',  qty: ironSheets,                    unit_price: 8000    },
    { id: 'ridge',       name: 'Ridge Caps',                                category: 'Roofing',   unit: 'pcs',     qty: Math.ceil(ironSheets / 8),     unit_price: 3000    },
    { id: 'nails',       name: 'Roofing Nails',                             category: 'Roofing',   unit: 'kg',      qty: Math.ceil(ironSheets * 0.25),  unit_price: 2500    },
    { id: 'purlins',     name: 'Purlins (3m × 75×50mm)',                    category: 'Roofing',   unit: 'lengths', qty: Math.ceil(ironSheets * 3),     unit_price: 5000    },
    { id: 'timber_roof', name: 'Timber / Carpentry (Roof Framing)',         category: 'Roofing',   unit: 'm³',      qty: Math.ceil(gfa * 0.015),        unit_price: 350000  },
    { id: 'gutters',     name: 'Gutters & Downpipes',                       category: 'Roofing',   unit: 'metres',  qty: Math.ceil(gfa * 0.025),        unit_price: 3800    },

    // ── Finishes ───────────────────────────────────────────────────────────────
    { id: 'plaster',     name: 'Cement Plaster / Internal Rendering',       category: 'Finishes',  unit: 'm²',      qty: Math.ceil(gfa * 2.8),          unit_price: 2800    },
    { id: 'lime',        name: 'Lime Plaster (Exterior Facades)',            category: 'Finishes',  unit: 'm²',      qty: Math.ceil(gfa * 0.6),          unit_price: 3200    },
    { id: 'floor_tile',  name: 'Floor Tiles (600×600mm)',                   category: 'Finishes',  unit: 'm²',      qty: Math.ceil(gfa * 1.05),         unit_price: 15000   },
    { id: 'wall_tile',   name: 'Wall Tiles (Wet Areas)',                    category: 'Finishes',  unit: 'm²',      qty: Math.ceil(units * 18),         unit_price: 18000   },
    { id: 'paint',       name: 'Paint & Coatings (Interior + Exterior)',    category: 'Finishes',  unit: 'litres',  qty: Math.ceil(gfa * 0.7),          unit_price: 4500    },
    { id: 'waterproof',  name: 'Waterproof Membranes',                      category: 'Finishes',  unit: 'm²',      qty: Math.ceil(gfa * 0.18),         unit_price: 9500    },
    { id: 'ceiling',     name: 'Gypsum Ceiling Boards (1.2×2.4m)',          category: 'Finishes',  unit: 'sheets',  qty: Math.ceil(gfa / 2.88),         unit_price: 8000    },
    { id: 'glass',       name: 'Glass Panes (Sliding Doors / Balconies)',   category: 'Finishes',  unit: 'panes',   qty: Math.ceil(units * 2),          unit_price: 55000   },

    // ── Openings ───────────────────────────────────────────────────────────────
    { id: 'main_door',   name: 'Main / Entrance Doors',                     category: 'Openings',  unit: 'units',   qty: units,                         unit_price: 120000  },
    { id: 'int_door',    name: 'Interior Doors (Bedrooms + Bathroom)',      category: 'Openings',  unit: 'units',   qty: units * 3,                     unit_price: 80000   },
    { id: 'windows',     name: 'Windows (Standard)',                        category: 'Openings',  unit: 'units',   qty: units * 4,                     unit_price: 95000   },
    { id: 'hinges',      name: 'Hinges & Door Hardware',                    category: 'Openings',  unit: 'sets',    qty: units * 4,                     unit_price: 4500    },
    { id: 'locks',       name: 'Locks & Handles',                           category: 'Openings',  unit: 'sets',    qty: units * 4,                     unit_price: 18000   },

    // ── MEP (Mechanical, Electrical & Plumbing) ────────────────────────────────
    { id: 'elec_cable',  name: 'Electrical Cables (2.5mm²)',                category: 'MEP',       unit: 'metres',  qty: Math.ceil(gfa * 15),           unit_price: 1200    },
    { id: 'switchgear',  name: 'Switchgear (Meters, Breakers, Isolators)',  category: 'MEP',       unit: 'sets',    qty: units,                         unit_price: 52000   },
    { id: 'panels',      name: 'Distribution Panels',                       category: 'MEP',       unit: 'panels',  qty: units,                         unit_price: 85000   },
    { id: 'sockets',     name: 'Socket Outlets',                            category: 'MEP',       unit: 'pcs',     qty: units * 8,                     unit_price: 8000    },
    { id: 'lights',      name: 'Light Fittings',                            category: 'MEP',       unit: 'pcs',     qty: units * 10,                    unit_price: 12000   },
    { id: 'pvc',         name: 'PVC Pipes (Plumbing)',                      category: 'MEP',       unit: 'metres',  qty: Math.ceil(gfa * 2),            unit_price: 3500    },
    { id: 'plumb_fit',   name: 'Plumbing Fittings (Valves, Elbows, Tees)', category: 'MEP',       unit: 'pcs',     qty: units * 30,                    unit_price: 3200    },
    { id: 'tanks',       name: 'Water Tanks (2,000L)',                      category: 'MEP',       unit: 'tanks',   qty: Math.ceil(units / 8),          unit_price: 350000  },
    { id: 'toilets',     name: 'Toilets (WC)',                              category: 'MEP',       unit: 'units',   qty: Math.ceil(units * 1.5),        unit_price: 75000   },
    { id: 'bath_sink',   name: 'Bathroom Sinks',                            category: 'MEP',       unit: 'units',   qty: Math.ceil(units * 1.5),        unit_price: 55000   },
    { id: 'kit_sink',    name: 'Kitchen Sinks',                             category: 'MEP',       unit: 'units',   qty: units,                         unit_price: 65000   },
    { id: 'showers',     name: 'Shower Units',                              category: 'MEP',       unit: 'units',   qty: Math.ceil(units * 1.5),        unit_price: 90000   },
    { id: 'sanitary',    name: 'Sanitary Fittings & Accessories',           category: 'MEP',       unit: 'sets',    qty: units,                         unit_price: 35000   },
  ];

  catalog.forEach(m => { m.total_cost = m.qty * m.unit_price; });
  return catalog;
}
