// ── Imali.biz — Firestore Data Layer ────────────────────────────────────────
// Loads Firebase compat SDK, initialises Firestore, fetches all live parcels,
// applies computed fields, and exposes window.imaliDB + window.parcels.

(function () {
  'use strict';

  var FIREBASE_VER = '10.14.1';
  var CDN = 'https://www.gstatic.com/firebasejs/' + FIREBASE_VER + '/';
  var CONFIG = {
    apiKey:            'AIzaSyBPYfPNzAGjMyMPuLP70pYak4yySefCOBE',
    authDomain:        'imali-biz.firebaseapp.com',
    projectId:         'imali-biz',
    storageBucket:     'imali-biz.firebasestorage.app',
    messagingSenderId: '462784037667',
    appId:             '1:462784037667:web:f2c30063b2dc10915f8296',
  };
  var DEV_COST_PER_SQM = 500000;

  // ── Ready promise ────────────────────────────────────────────────────────────
  var _resolve, _reject;
  var _ready = new Promise(function (res, rej) { _resolve = res; _reject = rej; });

  var _db = null;

  // ── Script loader ────────────────────────────────────────────────────────────
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = res;
      s.onerror = function () { rej(new Error('Failed to load ' + src)); };
      document.head.appendChild(s);
    });
  }

  // ── Computed fields ──────────────────────────────────────────────────────────
  function applyComputed(p) {
    // Derive type from zone code if not set
    if (!p.type) {
      var z = (p.zone || '').charAt(0).toUpperCase();
      p.type = z === 'R' ? 'residential' : z === 'C' ? 'commercial' : 'mixed-use';
    }
    // Build display location
    if (!p.location) {
      p.location = [p.sector, p.district].filter(Boolean).join(', ') || 'Kigali';
    }
    // UPI alias for backward compat
    p.id = p.upi;

    var sz = p.size_sqm || 0;
    var storedUnits = (p.units_planned && p.units_planned > 0) ? p.units_planned : 0;
    p.units_planned     = storedUnits || Math.floor(sz / 100);
    p.gfa_sqm           = p.units_planned * 100;
    p.dev_cost_rwf      = p.gfa_sqm * DEV_COST_PER_SQM;
    p.price_per_sqm     = (sz > 0 && p.land_price_rwf) ? Math.round(p.land_price_rwf / sz) : 0;
    p.dev_cost_per_unit = p.units_planned > 0 ? Math.round(p.dev_cost_rwf / p.units_planned) : 0;
    p.leverage_ratio    = p.land_price_rwf > 0 ? parseFloat((p.dev_cost_rwf / p.land_price_rwf).toFixed(2)) : 0;

    // Ensure readiness object has all six dims
    var rd   = p.readiness || {};
    var dims = ['legal', 'physical', 'infrastructure', 'urban', 'community', 'tokenisation'];
    dims.forEach(function (d) { if (rd[d] === undefined) rd[d] = 0; });
    p.readiness    = rd;
    p.avg_readiness = Math.round(dims.reduce(function (s, d) { return s + (rd[d] || 0); }, 0) / dims.length);

    // Fallback image
    if (!p.image) p.image = 'images/pexels-bala-5120876.jpg';

    return p;
  }

  // ── Fetch parcels ────────────────────────────────────────────────────────────
  function fetchParcels() {
    return _db.collection('parcels').get().then(function (snap) {
      var arr = [];
      snap.forEach(function (doc) {
        var data = doc.data();
        if (data.status === 'archived') return;
        data._docId = doc.id;
        applyComputed(data);
        arr.push(data);
      });
      window.parcels = arr; // updates the global `var parcels` in data.js
      return arr;
    });
  }

  // ── Boot ─────────────────────────────────────────────────────────────────────
  loadScript(CDN + 'firebase-app-compat.js')
    .then(function () { return loadScript(CDN + 'firebase-firestore-compat.js'); })
    .then(function () {
      if (!window.firebase.apps.length) window.firebase.initializeApp(CONFIG);
      _db = window.firebase.firestore();
      return fetchParcels();
    })
    .then(function (arr) { _resolve(arr); })
    .catch(function (err) {
      console.error('[imaliDB] Boot failed:', err);
      window.parcels = window.parcels || [];
      _resolve(window.parcels);
    });

  // ── Strip computed / internal fields before writing to Firestore ─────────────
  function _clean(data) {
    var out = Object.assign({}, data);
    // Strip computed/internal fields — do NOT strip units_planned (user can override it)
    ['_docId', 'id', 'location', 'gfa_sqm', 'dev_cost_rwf',
     'price_per_sqm', 'dev_cost_per_unit', 'leverage_ratio', 'avg_readiness']
      .forEach(function (k) { delete out[k]; });
    return out;
  }

  // ── Public API ───────────────────────────────────────────────────────────────
  window.imaliDB = {
    /** Resolves with the parcels array once Firestore data has loaded. */
    ready: _ready,

    /** Re-fetch all live parcels and refresh window.parcels. */
    reload: function () { return fetchParcels(); },

    /** Save a brand-new parcel document. Returns Promise<DocumentReference>. */
    saveParcel: function (data) {
      var payload = _clean(data);
      payload.created_at = window.firebase.firestore.FieldValue.serverTimestamp();
      return _db.collection('parcels').add(payload);
    },

    /** Update fields on an existing parcel by Firestore doc ID. */
    updateParcel: function (docId, data) {
      var payload = _clean(data);
      payload.updated_at = window.firebase.firestore.FieldValue.serverTimestamp();
      return _db.collection('parcels').doc(docId).set(payload, { merge: true });
    },

    /** Soft-delete: sets status = 'archived'. Parcel disappears from all live views. */
    archiveParcel: function (docId) {
      return _db.collection('parcels').doc(docId).update({
        status:      'archived',
        archived_at: window.firebase.firestore.FieldValue.serverTimestamp(),
      });
    },

    /** Hard-delete (permanent). Prefer archiveParcel for recoverable removes. */
    deleteParcel: function (docId) {
      return _db.collection('parcels').doc(docId).delete();
    },

    /** Restore an archived parcel. */
    restoreParcel: function (docId) {
      return _db.collection('parcels').doc(docId).update({ status: 'under_review' });
    },

    /** Find a parcel in window.parcels by UPI string. */
    findByUPI: function (upi) {
      return (window.parcels || []).find(function (p) {
        return p.upi === upi || p.id === upi;
      }) || null;
    },

    /** Load all archived parcels (separate query). */
    getArchived: function () {
      return _db.collection('parcels').where('status', '==', 'archived').get()
        .then(function (snap) {
          var arr = [];
          snap.forEach(function (doc) {
            var d = doc.data();
            d._docId = doc.id;
            applyComputed(d);
            arr.push(d);
          });
          return arr;
        });
    },

    // ── Config helpers (password hash, settings) ─────────────────────────────
    getConfig: function (key) {
      return _db.collection('_config').doc(key).get().then(function (doc) {
        return doc.exists ? doc.data() : null;
      });
    },
    setConfig: function (key, data) {
      return _db.collection('_config').doc(key).set(data, { merge: true });
    },
  };
})();
