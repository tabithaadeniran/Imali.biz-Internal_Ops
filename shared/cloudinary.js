// ── Imali.biz — Cloudinary Upload Config ─────────────────────────────────────
// After creating your Cloudinary account:
//   1. Find your Cloud Name on the Cloudinary dashboard (top of the page)
//   2. Go to Settings → Upload → Upload Presets → Add upload preset
//      Set "Signing mode" to UNSIGNED, then save. Copy the preset name.
//   3. Paste both values below.

var CLOUDINARY_CLOUD  = 'nfykhohc';   // e.g. 'dxyz12abc'
var CLOUDINARY_PRESET = 'imali_parcels';  // e.g. 'imali_parcels'

// Returns true if config has been filled in
function cloudinaryConfigured() {
  return CLOUDINARY_CLOUD !== 'YOUR_CLOUD_NAME' && CLOUDINARY_PRESET !== 'YOUR_PRESET_NAME';
}

// Upload a File object to Cloudinary.
// onProgress(pct) is called with 0-100 during upload.
// Returns a Promise that resolves to the Cloudinary response JSON.
function cloudinaryUpload(file, onProgress) {
  return new Promise(function(resolve, reject) {
    if (!cloudinaryConfigured()) {
      reject(new Error('Cloudinary is not configured yet. Open shared/cloudinary.js and fill in your cloud name and upload preset.'));
      return;
    }
    var xhr = new XMLHttpRequest();
    var fd  = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLOUDINARY_PRESET);
    fd.append('folder', 'imali-parcels');

    xhr.open('POST', 'https://api.cloudinary.com/v1_1/' + CLOUDINARY_CLOUD + '/image/upload', true);

    if (onProgress) {
      xhr.upload.addEventListener('progress', function(e) {
        if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100));
      });
    }

    xhr.onload = function() {
      if (xhr.status === 200) {
        try { resolve(JSON.parse(xhr.responseText)); }
        catch(e) { reject(new Error('Invalid response from Cloudinary')); }
      } else {
        var msg = 'Upload failed (' + xhr.status + ')';
        try { msg = JSON.parse(xhr.responseText).error.message; } catch(e) {}
        reject(new Error(msg));
      }
    };
    xhr.onerror = function() { reject(new Error('Network error — could not reach Cloudinary')); };
    xhr.send(fd);
  });
}
