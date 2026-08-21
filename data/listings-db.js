// ── Imali.biz — Public Listings reader for Internal Site ─────────────────────
// Bootstraps off imaliDB (which loads Firebase SDK), then reads the `listings`
// collection and exposes window.listingsDB with ready promise + CRUD helpers.
(function () {
  'use strict';

  var _listings = [];
  var _resolve, _reject;
  var _ready = new Promise(function (res, rej) { _resolve = res; _reject = rej; });

  function getDb() { return window.firebase.firestore(); }

  function fetchListings() {
    return getDb().collection('listings').orderBy('created_at', 'desc').get()
      .then(function (snap) {
        _listings = [];
        snap.forEach(function (doc) {
          var data = doc.data();
          if (data.status === 'archived') return;
          data._docId = doc.id;
          data._source = 'listing';
          _listings.push(data);
        });
        return _listings;
      });
  }

  // Wait for imaliDB to finish loading Firebase SDK, then fetch listings.
  window.imaliDB.ready
    .then(function () { return fetchListings(); })
    .then(function (arr) { _resolve(arr); })
    .catch(function (err) {
      console.error('[listingsDB] Boot failed:', err);
      _resolve([]);
    });

  window.listingsDB = {
    ready: _ready,
    getListings: function () { return _listings; },
    reload: function () { return fetchListings(); },
    create: function (data) {
      var payload = Object.assign({}, data);
      payload.status = payload.status || 'live';
      payload.created_at = window.firebase.firestore.FieldValue.serverTimestamp();
      return getDb().collection('listings').add(payload);
    },
    archive: function (docId) {
      return getDb().collection('listings').doc(docId).update({
        status: 'archived',
        archived_at: window.firebase.firestore.FieldValue.serverTimestamp()
      });
    },
    restore: function (docId) {
      return getDb().collection('listings').doc(docId).update({ status: 'live' });
    }
  };
})();
