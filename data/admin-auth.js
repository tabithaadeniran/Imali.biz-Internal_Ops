// ── Imali.biz — Admin Password Gate ─────────────────────────────────────────
// Shows a password overlay on admin pages (add-parcel, edit-parcel).
// Password hash is stored in Firestore _config/admin.passwordHash.
// Default password: "imali-admin" — change it via admin/seed.html.
// Requires: data/db.js loaded first.

(function () {
  'use strict';

  var SESSION_KEY = 'imali_admin_auth';

  var _resolve;
  var _ready = new Promise(function (res) { _resolve = res; });
  window.imaliAuth = { ready: _ready };

  // Skip gate if already authenticated this session
  if (sessionStorage.getItem(SESSION_KEY) === 'ok') {
    _resolve(true);
    return;
  }

  async function sha256(text) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .map(function (b) { return b.toString(16).padStart(2, '0'); })
      .join('');
  }

  function showGate(correctHash) {
    var overlay = document.createElement('div');
    overlay.id = 'adminGate';
    overlay.style.cssText = [
      'position:fixed;inset:0;background:rgba(0,0,0,0.88);',
      'display:flex;flex-direction:column;align-items:center;justify-content:center;',
      'z-index:99999;font-family:"DM Sans",sans-serif;',
    ].join('');
    overlay.innerHTML = [
      '<div style="background:#1a1a24;border:1px solid rgba(212,168,50,0.3);',
        'border-radius:16px;padding:2.5rem;width:min(380px,90vw);text-align:center">',
      '<div style="font-size:1.9rem;margin-bottom:0.5rem">🔒</div>',
      '<div style="font-family:Syne,sans-serif;font-size:1.3rem;font-weight:700;',
        'color:#f5f0e8;margin-bottom:0.4rem">Admin Access</div>',
      '<div style="color:rgba(245,240,232,0.5);font-size:0.84rem;margin-bottom:1.4rem">',
        'Enter the admin password to continue.</div>',
      '<input id="gateInput" type="password" placeholder="Password" autocomplete="current-password"',
        ' style="width:100%;box-sizing:border-box;padding:0.75rem 1rem;',
        'background:rgba(255,255,255,0.07);border:1px solid rgba(212,168,50,0.25);',
        'border-radius:8px;color:#f5f0e8;font-size:0.95rem;outline:none;',
        'margin-bottom:0.6rem">',
      '<div id="gateErr" style="color:#ef5350;font-size:0.82rem;',
        'margin-bottom:0.7rem;min-height:1.2rem"></div>',
      '<button id="gateBtn" style="width:100%;padding:0.75rem;',
        'background:#d4a832;border:none;border-radius:8px;',
        'font-family:Syne,sans-serif;font-weight:700;font-size:0.95rem;',
        'color:#0d0d12;cursor:pointer">Unlock</button>',
      '</div>',
    ].join('');
    document.body.appendChild(overlay);

    var input = document.getElementById('gateInput');
    var btn   = document.getElementById('gateBtn');
    var err   = document.getElementById('gateErr');

    input.focus();
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') attempt(); });
    btn.addEventListener('click', attempt);

    async function attempt() {
      var pw = input.value;
      if (!pw) { err.textContent = 'Please enter the password.'; return; }
      btn.disabled = true;
      btn.textContent = 'Checking…';
      var hash = await sha256(pw);
      if (hash === correctHash) {
        sessionStorage.setItem(SESSION_KEY, 'ok');
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.25s';
        setTimeout(function () { overlay.remove(); }, 280);
        _resolve(true);
      } else {
        input.value = '';
        err.textContent = 'Incorrect password. Please try again.';
        btn.disabled = false;
        btn.textContent = 'Unlock';
        input.focus();
      }
    }
  }

  // Wait for imaliDB to load, then get the stored hash from Firestore.
  // Falls back to SHA-256("imali-admin") if no hash is saved yet.
  window.imaliDB.ready
    .then(function () { return window.imaliDB.getConfig('admin'); })
    .then(function (cfg) {
      var stored = cfg && cfg.passwordHash ? cfg.passwordHash : null;
      return stored ? Promise.resolve(stored) : sha256('imali-admin');
    })
    .then(function (hash) { showGate(hash); })
    .catch(function () { sha256('imali-admin').then(showGate); });
})();
