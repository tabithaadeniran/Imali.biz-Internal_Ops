// ── Imali.biz User Overrides ────────────────────────────────────────────────
// Loaded after data/pipeline.js + data.js on every page.
// Reads three localStorage keys and patches the live `parcels` array in-place:
//   IMALI_PARCEL_DELETED  — UPIs to remove from the pipeline
//   IMALI_PARCEL_OVERRIDES — field edits for existing parcels
//   IMALI_ADDED_PARCELS   — parcels added via add-parcel.html (merged in as full objects)

(function() {
  'use strict';
  var OVERRIDES_KEY = 'IMALI_PARCEL_OVERRIDES';
  var DELETED_KEY   = 'IMALI_PARCEL_DELETED';
  var ADDED_KEY     = 'IMALI_ADDED_PARCELS';

  var overrides = {}, deleted = [], added = [];
  try {
    overrides = JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}');
    deleted   = JSON.parse(localStorage.getItem(DELETED_KEY)   || '[]');
    added     = JSON.parse(localStorage.getItem(ADDED_KEY)     || '[]');
  } catch(e) { return; }

  var hasWork = deleted.length || Object.keys(overrides).length || added.length;
  if (!hasWork) return;

  // Work on whichever array is available (parcels is data.js alias of PIPELINE_PARCELS)
  var arr = (typeof parcels !== 'undefined') ? parcels
          : (typeof PIPELINE_PARCELS !== 'undefined') ? PIPELINE_PARCELS
          : null;

  // ── 1. Delete ──────────────────────────────────────────────────────────────
  if (deleted.length) {
    if (arr) {
      for (var i = arr.length - 1; i >= 0; i--) {
        if (deleted.indexOf(arr[i].id) !== -1) arr.splice(i, 1);
      }
    }
    if (typeof PIPELINE_PRICES !== 'undefined') {
      deleted.forEach(function(upi) { delete PIPELINE_PRICES[upi]; });
    }
  }

  // ── 2. Apply overrides ─────────────────────────────────────────────────────
  var DEV_COST_PER_SQM = 500000;

  if (arr && Object.keys(overrides).length) {
    Object.keys(overrides).forEach(function(upi) {
      var ov = overrides[upi];

      var p = null;
      for (var j = 0; j < arr.length; j++) {
        if (arr[j].id === upi) { p = arr[j]; break; }
      }
      if (!p) return;

      ['name', 'location', 'district', 'sector', 'zone', 'type', 'status', 'notes',
       'comp_type', 'comp_timeline', 'comp_notes'].forEach(function(f) {
        if (ov[f] !== undefined) p[f] = ov[f];
      });

      if (ov.photos      !== undefined) p.photos      = ov.photos;
      if (ov.plans       !== undefined) p.plans       = ov.plans;
      if (ov.cover_photo !== undefined) p.cover_photo = ov.cover_photo;
      if (ov.unit_type   !== undefined) p.unit_type   = ov.unit_type;

      if (ov.size_sqm !== undefined && ov.size_sqm !== null) {
        p.size_sqm = ov.size_sqm;
      }
      if (ov.units_planned !== undefined && ov.units_planned !== null && ov.units_planned > 0) {
        p.units_planned = ov.units_planned;
      } else if (ov.size_sqm !== undefined && ov.size_sqm !== null) {
        p.units_planned = Math.floor(ov.size_sqm / 100);
      }
      if (ov.size_sqm !== undefined && ov.size_sqm !== null) {
        p.gfa_sqm       = p.units_planned * 100;
        p.dev_cost_rwf  = p.gfa_sqm * DEV_COST_PER_SQM;
        p.dev_cost_per_unit = p.units_planned > 0 ? Math.round(p.dev_cost_rwf / p.units_planned) : 0;
      }

      if (ov.land_price_rwf !== undefined && ov.land_price_rwf !== null) {
        p.land_price_rwf = ov.land_price_rwf;
      }

      if (ov.size_sqm !== undefined || ov.land_price_rwf !== undefined) {
        p.price_per_sqm  = p.size_sqm > 0 && p.land_price_rwf ? Math.round(p.land_price_rwf / p.size_sqm) : 0;
        p.leverage_ratio = p.land_price_rwf > 0 ? parseFloat((p.dev_cost_rwf / p.land_price_rwf).toFixed(2)) : 0;
      }

      if (typeof PIPELINE_PRICES !== 'undefined' && PIPELINE_PRICES[upi]) {
        if (ov.land_price_rwf !== undefined) PIPELINE_PRICES[upi].price = ov.land_price_rwf;
        if (ov.zone           !== undefined) PIPELINE_PRICES[upi].zone  = ov.zone;
        if (ov.name           !== undefined) PIPELINE_PRICES[upi].note  = ov.name;
      }
    });
  }

  // ── 3. Merge added parcels ─────────────────────────────────────────────────
  if (!arr || !added.length) return;

  // Build a set of IDs already in the array to skip duplicates
  var existingIds = {};
  for (var k = 0; k < arr.length; k++) existingIds[arr[k].id] = true;

  // Also skip any added parcels that have been deleted
  var deletedSet = {};
  deleted.forEach(function(upi) { deletedSet[upi] = true; });

  // Image pools (same files as pipeline.js)
  var IMG = {
    residential: [
      'images/pexels-bala-5120876.jpg',
      'images/pexels-nguyendesigner-16419876.jpg',
      'images/pexels-droneafrica-37386894.jpg',
    ],
    commercial: [
      'images/payam-moin-afshari-QRkbb0ZFW9s-unsplash.jpg',
      'images/pexels-hoang-vu-257779885-15770452.jpg',
    ],
    'mixed-use': [
      'images/pexels-marquez-6372033.jpg',
      'images/pexels-ana-kenk-2159501753-36477481.jpg',
    ],
  };
  var imgIdx = { residential: 0, commercial: 0, 'mixed-use': 0 };

  // Readiness hash — mirrors makeReadiness() in pipeline.js
  function hashReadiness(upi) {
    var h = 0;
    for (var ci = 0; ci < upi.length; ci++) h = Math.imul(31, h) + upi.charCodeAt(ci) | 0;
    var dims = ['legal','physical','infrastructure','urban','community','tokenisation'];
    var out = {}, sum = 0;
    dims.forEach(function(d, di) {
      var v = Math.abs(h * (di + 7)) % 101;
      out[d] = v; sum += v;
    });
    out.avg = Math.round(sum / dims.length);
    return out;
  }

  added.forEach(function(p) {
    if (!p.upi) return;
    if (existingIds[p.upi]) return;  // already a pipeline parcel with this UPI
    if (deletedSet[p.upi]) return;   // user deleted it

    // Apply any pending override for this UPI on top of the stored data
    var ov = overrides[p.upi] || {};

    var zone    = ov.zone     || p.zone     || '';
    var name    = ov.name     || p.name     || p.upi;
    var district= ov.district || p.district || '';
    var sector  = ov.sector   || p.sector   || '';
    var status  = ov.status   || p.status   || 'pending';
    var notes   = ov.notes    || p.notes    || '';
    var size_sqm     = ov.size_sqm     !== undefined ? ov.size_sqm     : (p.size_sqm || 0);
    var land_price_rwf = ov.land_price_rwf !== undefined ? ov.land_price_rwf
                       : (p.price || null);

    var type = zone.charAt(0) === 'R' ? 'residential'
             : zone.charAt(0) === 'C' ? 'commercial'
             : 'mixed-use';

    var photos      = ov.photos      !== undefined ? ov.photos      : (p.photos      || []);
    var plans       = ov.plans       !== undefined ? ov.plans       : (p.plans       || []);
    var cover_photo = ov.cover_photo !== undefined ? ov.cover_photo : (p.cover_photo || '');
    var unit_type   = ov.unit_type   !== undefined ? ov.unit_type   : (p.unit_type   || '');

    var imgArr = IMG[type] || IMG['mixed-use'];
    var image;
    if (cover_photo) {
      image = cover_photo;
    } else if (photos[0]) {
      image = photos[0];
    } else {
      image = imgArr[imgIdx[type] % imgArr.length];
      imgIdx[type]++;
    }

    var storedUnits = ov.units_planned !== undefined ? ov.units_planned : p.units_planned;
    var units_planned = (storedUnits !== undefined && storedUnits !== null && storedUnits > 0)
      ? storedUnits
      : Math.floor(size_sqm / 100);
    var gfa_sqm         = units_planned * 100;
    var dev_cost_rwf    = gfa_sqm * DEV_COST_PER_SQM;
    var price_per_sqm   = size_sqm > 0 && land_price_rwf ? Math.round(land_price_rwf / size_sqm) : 0;
    var dev_cost_per_unit = units_planned > 0 ? Math.round(dev_cost_rwf / units_planned) : 0;
    var leverage_ratio  = land_price_rwf > 0 ? parseFloat((dev_cost_rwf / land_price_rwf).toFixed(2)) : 0;

    var rd = hashReadiness(p.upi);
    var avg_readiness = rd.avg;

    var addedDate = '';
    try {
      var dt = p.added_at ? new Date(p.added_at) : new Date();
      addedDate = dt.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
    } catch(e) { addedDate = '—'; }

    arr.push({
      id:             p.upi,
      upi:            p.upi,
      name:           name,
      location:       [sector, district].filter(Boolean).join(', ') || 'Kigali',
      district:       district,
      sector:         sector,
      zone:           zone,
      note:           notes,
      notes:          notes,
      size_sqm:       size_sqm,
      land_price_rwf: land_price_rwf,
      type:           type,
      status:         status,
      image:          image,
      readiness: {
        legal:          rd.legal,
        physical:       rd.physical,
        infrastructure: rd.infrastructure,
        urban:          rd.urban,
        community:      rd.community,
        tokenisation:   rd.tokenisation,
      },
      added_date:       addedDate,
      units_planned:    units_planned,
      gfa_sqm:          gfa_sqm,
      dev_cost_rwf:     dev_cost_rwf,
      price_per_sqm:    price_per_sqm,
      dev_cost_per_unit:dev_cost_per_unit,
      leverage_ratio:   leverage_ratio,
      avg_readiness:    avg_readiness,
      comp_type:        ov.comp_type     || p.comp_type     || '',
      comp_timeline:    ov.comp_timeline || p.comp_timeline || '',
      comp_notes:       ov.comp_notes    || p.comp_notes    || '',
      photos:           photos,
      plans:            plans,
      unit_type:        unit_type,
      cover_photo:      cover_photo,
    });
  });
})();
