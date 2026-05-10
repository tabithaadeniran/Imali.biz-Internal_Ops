// ─── Imali.biz Internal Website — Shared Data ────────────────────────────────

const DEV_COST_PER_SQM = 500000;  // RWF per sqm of GFA
const MIN_INVESTOR_STAKE = 75000; // RWF minimum fractional investment

// ─── Land Parcels ─────────────────────────────────────────────────────────────
const parcels = [
  {
    id: 'P001',
    name: 'Kimironko Ridge',
    location: 'Gasabo / Kimironko',
    district: 'Gasabo',
    sector: 'Kimironko',
    size_sqm: 1200,
    land_price_rwf: 50000000,
    type: 'residential',
    status: 'listed',
    added_date: '2025-01-15',
    image: 'images/pexels-bala-5120876.jpg',
    readiness: { legal: 90, physical: 75, infrastructure: 80, urban: 85, community: 70, tokenisation: 60 }
  },
  {
    id: 'P002',
    name: 'Nyamirambo Heights',
    location: 'Nyarugenge / Nyamirambo',
    district: 'Nyarugenge',
    sector: 'Nyamirambo',
    size_sqm: 1000,
    land_price_rwf: 30000000,
    type: 'mixed-use',
    status: 'listed',
    added_date: '2025-02-03',
    image: 'images/pexels-marquez-6372033.jpg',
    readiness: { legal: 85, physical: 60, infrastructure: 70, urban: 80, community: 75, tokenisation: 55 }
  },
  {
    id: 'P003',
    name: 'Kicukiro South Plot',
    location: 'Kicukiro / Kagarama',
    district: 'Kicukiro',
    sector: 'Kagarama',
    size_sqm: 1500,
    land_price_rwf: 57000000,
    type: 'residential',
    status: 'listed',
    added_date: '2025-02-18',
    image: 'images/pexels-nguyendesigner-16419876.jpg',
    readiness: { legal: 95, physical: 80, infrastructure: 85, urban: 90, community: 80, tokenisation: 70 }
  },
  {
    id: 'P004',
    name: 'Gisozi Commercial Site',
    location: 'Gasabo / Gisozi',
    district: 'Gasabo',
    sector: 'Gisozi',
    size_sqm: 750,
    land_price_rwf: 37500000,
    type: 'commercial',
    status: 'under_review',
    added_date: '2025-03-07',
    image: 'images/payam-moin-afshari-QRkbb0ZFW9s-unsplash.jpg',
    readiness: { legal: 70, physical: 65, infrastructure: 60, urban: 75, community: 55, tokenisation: 45 }
  },
  {
    id: 'P005',
    name: 'Musanze North Land',
    location: 'Musanze / Muhoza',
    district: 'Musanze',
    sector: 'Muhoza',
    size_sqm: 1400,
    land_price_rwf: 17000000,
    type: 'residential',
    status: 'pending',
    added_date: '2025-03-22',
    image: 'images/pexels-droneafrica-37386894.jpg',
    readiness: { legal: 60, physical: 70, infrastructure: 45, urban: 65, community: 60, tokenisation: 40 }
  },
  {
    id: 'P006',
    name: 'Remera Infill Plot',
    location: 'Gasabo / Remera',
    district: 'Gasabo',
    sector: 'Remera',
    size_sqm: 600,
    land_price_rwf: 27000000,
    type: 'mixed-use',
    status: 'under_review',
    added_date: '2025-04-10',
    image: 'images/pexels-ana-kenk-2159501753-36477481.jpg',
    readiness: { legal: 80, physical: 55, infrastructure: 75, urban: 80, community: 65, tokenisation: 50 }
  },
  {
    id: 'P007',
    name: 'Nyarutarama Premium',
    location: 'Gasabo / Nyarutarama',
    district: 'Gasabo',
    sector: 'Nyarutarama',
    size_sqm: 900,
    land_price_rwf: 90000000,
    type: 'commercial',
    status: 'listed',
    added_date: '2025-04-28',
    image: 'images/pexels-hoang-vu-257779885-15770452.jpg',
    readiness: { legal: 95, physical: 85, infrastructure: 90, urban: 95, community: 80, tokenisation: 75 }
  }
];

// ─── Computed fields (mutates parcels in place) ────────────────────────────────
parcels.forEach(p => {
  p.units_planned = Math.floor(p.size_sqm / 100);
  p.gfa_sqm = p.units_planned * 100;
  p.dev_cost_rwf = p.gfa_sqm * DEV_COST_PER_SQM;
  p.price_per_sqm = Math.round(p.land_price_rwf / p.size_sqm);
  p.dev_cost_per_unit = Math.round(p.dev_cost_rwf / p.units_planned);
  p.leverage_ratio = parseFloat((p.dev_cost_rwf / p.land_price_rwf).toFixed(2));
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
    // Structure
    { id: 'cement',     name: 'Cement (50kg bags)',              category: 'Structure', unit: 'bags',    qty: Math.ceil(gfa * 0.4),         unit_price: 10000 },
    { id: 'sand',       name: 'Sand',                            category: 'Structure', unit: 'm³',      qty: Math.ceil(gfa * 0.5),         unit_price: 25000 },
    { id: 'gravel',     name: 'Gravel / Aggregate',              category: 'Structure', unit: 'm³',      qty: Math.ceil(gfa * 0.4),         unit_price: 30000 },
    { id: 'steel',      name: 'Steel Rebar',                     category: 'Structure', unit: 'tonnes',  qty: Math.ceil(gfa * 0.012),       unit_price: 1200000 },
    { id: 'blocks',     name: 'Concrete Blocks',                 category: 'Structure', unit: 'blocks',  qty: Math.ceil(gfa * 12),          unit_price: 400 },
    // Roofing
    { id: 'iron',       name: 'Box-Profile Iron Sheets',         category: 'Roofing',   unit: 'sheets',  qty: ironSheets,                   unit_price: 8000 },
    { id: 'ridge',      name: 'Ridge Caps',                      category: 'Roofing',   unit: 'pcs',     qty: Math.ceil(ironSheets / 8),    unit_price: 3000 },
    { id: 'nails',      name: 'Roofing Nails',                   category: 'Roofing',   unit: 'kg',      qty: Math.ceil(ironSheets * 0.25), unit_price: 2500 },
    { id: 'purlins',    name: 'Purlins (3m × 75×50mm)',          category: 'Roofing',   unit: 'lengths', qty: Math.ceil(ironSheets * 3),    unit_price: 5000 },
    // Finishes
    { id: 'floor_tile', name: 'Floor Tiles (600×600mm)',         category: 'Finishes',  unit: 'm²',      qty: Math.ceil(gfa * 1.05),        unit_price: 15000 },
    { id: 'wall_tile',  name: 'Wall Tiles (wet areas)',          category: 'Finishes',  unit: 'm²',      qty: Math.ceil(units * 18),        unit_price: 18000 },
    { id: 'paint',      name: 'Paint (interior + exterior)',     category: 'Finishes',  unit: 'litres',  qty: Math.ceil(gfa * 0.7),         unit_price: 4500 },
    { id: 'ceiling',    name: 'Gypsum Ceiling Boards (1.2×2.4m)',category: 'Finishes',  unit: 'sheets',  qty: Math.ceil(gfa / 2.88),        unit_price: 8000 },
    // Openings
    { id: 'main_door',  name: 'Main / Entrance Doors',          category: 'Openings',  unit: 'units',   qty: units,                        unit_price: 120000 },
    { id: 'int_door',   name: 'Interior Doors (bedroom + bath)',  category: 'Openings',  unit: 'units',   qty: units * 3,                    unit_price: 80000 },
    { id: 'windows',    name: 'Windows (standard)',              category: 'Openings',  unit: 'units',   qty: units * 4,                    unit_price: 95000 },
    // MEP
    { id: 'elec_cable', name: 'Electrical Cable (2.5mm²)',       category: 'MEP',       unit: 'metres',  qty: Math.ceil(gfa * 15),          unit_price: 1200 },
    { id: 'panels',     name: 'Distribution Panels',             category: 'MEP',       unit: 'panels',  qty: units,                        unit_price: 85000 },
    { id: 'sockets',    name: 'Socket Outlets',                  category: 'MEP',       unit: 'pcs',     qty: units * 8,                    unit_price: 8000 },
    { id: 'lights',     name: 'Light Fittings',                  category: 'MEP',       unit: 'pcs',     qty: units * 10,                   unit_price: 12000 },
    { id: 'pvc',        name: 'PVC Pipes (32mm)',                category: 'MEP',       unit: 'metres',  qty: Math.ceil(gfa * 2),           unit_price: 3500 },
    { id: 'tanks',      name: 'Water Tanks (2,000L)',            category: 'MEP',       unit: 'tanks',   qty: Math.ceil(units / 8),         unit_price: 350000 },
    { id: 'toilets',    name: 'Toilets (WC)',                    category: 'MEP',       unit: 'units',   qty: Math.ceil(units * 1.5),       unit_price: 75000 },
    { id: 'bath_sink',  name: 'Bathroom Sinks',                  category: 'MEP',       unit: 'units',   qty: Math.ceil(units * 1.5),       unit_price: 55000 },
    { id: 'kit_sink',   name: 'Kitchen Sinks',                   category: 'MEP',       unit: 'units',   qty: units,                        unit_price: 65000 },
    { id: 'showers',    name: 'Shower Units',                    category: 'MEP',       unit: 'units',   qty: Math.ceil(units * 1.5),       unit_price: 90000 }
  ];

  catalog.forEach(m => { m.total_cost = m.qty * m.unit_price; });
  return catalog;
}
