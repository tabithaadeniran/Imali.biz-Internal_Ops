// ── Imali.biz Pipeline Data ────────────────────────────────────────────────────
// Single source of truth for the land pipeline.
// To add a new parcel: add one line to PIPELINE_PRICES, then add its GIS metadata
// to _PARCEL_GEO. All pages (map, overview, inventory, materials) update automatically.

const PIPELINE_PRICES = {
  '1/01/02/01/1399': { price: 2500000000,  zone: 'R1', note: 'Kanyinya'              },
  '1/01/02/02/1730': { price:  160000000,  zone: 'I1', note: ''                       },
  '1/01/02/02/5423': { price:  250000000,  zone: 'I1', note: ''                       },
  '1/01/06/06/198' : { price:   18000000,  zone: '',   note: ''                       },
  '1/01/06/06/235' : { price:   45000000,  zone: '',   note: ''                       },
  '1/01/09/03/101' : { price:  300000000,  zone: '',   note: ''                       },
  '1/01/09/03/152' : { price:  300000000,  zone: '',   note: 'Kiyovu'                 },
  '1/01/02/03/802' : { price:  350000000,  zone: '',   note: 'Taba / Kanyinya'        },
  '1/02/04/01/254' : { price:         null, zone: 'R3', note: 'Residential (phased)'  },
  '1/02/04/01/1066': { price:   65000000,  zone: 'R1', note: 'Clinic'                 },
  '1/02/04/01/392' : { price:  100000000,  zone: '',   note: 'Gisozi'                 },
  '1/02/04/01/474' : { price:  220000000,  zone: '',   note: ''                       },
  '1/02/04/01/4807': { price:  200000000,  zone: '',   note: ''                       },
  '1/02/04/01/454' : { price:  250000000,  zone: '',   note: 'Kaburimbo'              },
  '1/02/01/02/417' : { price:  130000000,  zone: 'R3', note: 'Bumbogo Musave'         },
  '1/02/04/01/1874': { price:   85000000,  zone: '',   note: 'Gakinjiro'              },
  '1/02/04/01/3310': { price: 3500000000,  zone: '',   note: ''                       },
  '1/02/04/02/2029': { price:  200000000,  zone: '',   note: ''                       },
  '1/02/04/02/3332': { price:  160000000,  zone: '',   note: 'Gisozi Ruhango'         },
  '1/02/04/02/5432': { price:  210000000,  zone: '',   note: 'Gisozi Ruhango'         },
  '1/02/04/02/666' : { price: 1700000000,  zone: '',   note: ''                       },
  '1/02/04/02/2280': { price:  100000000,  zone: '',   note: ''                       },
  '1/02/04/01/7035': { price:   85000000,  zone: '',   note: ''                       },
  '1/02/04/02/1083': { price:  200000000,  zone: '',   note: 'Gisozi'                 },
  '1/02/04/02/140' : { price: 1000000000,  zone: '',   note: 'Gisozi / Ecole Berge'   },
  '1/02/04/02/423' : { price:  120000000,  zone: '',   note: 'Gisozi'                 },
  '1/02/07/01/1219': { price:   90000000,  zone: '',   note: 'Ange Kacyiru'           },
  '1/02/07/01/940' : { price:  550000000,  zone: '',   note: 'Kacyiru'                },
  '1/02/09/01/2602': { price:  140000000,  zone: '',   note: 'Bibare'                 },
  '1/02/09/02/2192': { price:  200000000,  zone: '',   note: 'Kibagabaga Muzehe'      },
  '1/02/09/02/2699': { price:  100000000,  zone: '',   note: 'Kimironko'              },
  '1/02/09/02/3440': { price:  400000000,  zone: 'R1', note: ''                       },
  '1/02/10/03/988' : { price:  300000000,  zone: '',   note: ''                       },
  '1/02/04/02/5577': { price:  140000000,  zone: '',   note: ''                       },
  '1/02/10/03/1464': { price:  450000000,  zone: '',   note: 'Batsinda'               },
  '1/02/10/03/1471': { price:  120000000,  zone: '',   note: 'Kagugu'                 },
  '1/02/10/03/11070':{ price:  100000000,  zone: '',   note: 'Kagugu'                 },
  '1/02/10/03/11360':{ price:  100000000,  zone: '',   note: 'Kagugu'                 },
  '1/02/10/03/4606': { price:  200000000,  zone: '',   note: 'Kagugu'                 },
  '1/02/10/03/5838': { price:  600000000,  zone: '',   note: ''                       },
  '1/02/10/03/9684': { price: 1400000000,  zone: '',   note: ''                       },
  '1/02/10/04/1019': { price:  420000000,  zone: '',   note: ''                       },
  '1/02/12/02/546' : { price:   85000000,  zone: '',   note: ''                       },
  '1/02/12/02/3823': { price:   70000000,  zone: '',   note: ''                       },
  '1/03/05/02/1958': { price:  700000000,  zone: '',   note: ''                       },
  '1/03/08/02/673' : { price:  850000000,  zone: '',   note: 'Masaka'                 },
  '1/03/02/03/2183': { price:  550000000,  zone: '',   note: 'Kicukiro Nobreza'       },
  '1/03/03/02/319' : { price:        null, zone: '',   note: ''                       },
  '1/03/08/05/1544': { price:        null, zone: 'C3', note: 'Masaka'                 },
};

// Size (m²) and location from Kigali GIS — KigaliParcelsJune2026
const _PARCEL_GEO = {
  '1/01/02/01/1399': { size: 43248, district: 'Nyarugenge', sector: 'Kanyinya'   },
  '1/01/02/02/1730': { size:  1816, district: 'Nyarugenge', sector: 'Kanyinya'   },
  '1/01/02/02/5423': { size:  5252, district: 'Nyarugenge', sector: 'Kanyinya'   },
  '1/01/06/06/198' : { size:    87, district: 'Nyarugenge', sector: 'Muhima'     },
  '1/01/06/06/235' : { size:   281, district: 'Nyarugenge', sector: 'Muhima'     },
  '1/01/09/03/101' : { size:  1154, district: 'Nyarugenge', sector: 'Nyarugenge' },
  '1/01/09/03/152' : { size:   756, district: 'Nyarugenge', sector: 'Nyarugenge' },
  '1/01/02/03/802' : { size: 23933, district: 'Nyarugenge', sector: 'Kanyinya'   },
  '1/02/04/01/254' : { size:  2630, district: 'Gasabo',     sector: 'Gisozi'     },
  '1/02/04/01/1066': { size:  1178, district: 'Gasabo',     sector: 'Gisozi'     },
  '1/02/04/01/392' : { size:   592, district: 'Gasabo',     sector: 'Gisozi'     },
  '1/02/04/01/474' : { size:  2733, district: 'Gasabo',     sector: 'Gisozi'     },
  '1/02/04/01/4807': { size:   736, district: 'Gasabo',     sector: 'Gisozi'     },
  '1/02/04/01/454' : { size:   944, district: 'Gasabo',     sector: 'Gisozi'     },
  '1/02/01/02/417' : { size:  9951, district: 'Gasabo',     sector: 'Bumbogo'    },
  '1/02/04/01/1874': { size:   625, district: 'Gasabo',     sector: 'Gisozi'     },
  '1/02/04/01/3310': { size: 18210, district: 'Gasabo',     sector: 'Gisozi'     },
  '1/02/04/02/2029': { size:  1315, district: 'Gasabo',     sector: 'Gisozi'     },
  '1/02/04/02/3332': { size:   910, district: 'Gasabo',     sector: 'Gisozi'     },
  '1/02/04/02/5432': { size:  1077, district: 'Gasabo',     sector: 'Gisozi'     },
  '1/02/04/02/666' : { size:  8060, district: 'Gasabo',     sector: 'Gisozi'     },
  '1/02/04/02/2280': { size:  1108, district: 'Gasabo',     sector: 'Gisozi'     },
  '1/02/04/01/7035': { size:   699, district: 'Gasabo',     sector: 'Gisozi'     },
  '1/02/04/02/1083': { size:  3917, district: 'Gasabo',     sector: 'Gisozi'     },
  '1/02/04/02/140' : { size: 10600, district: 'Gasabo',     sector: 'Gisozi'     },
  '1/02/04/02/423' : { size:   819, district: 'Gasabo',     sector: 'Gisozi'     },
  '1/02/07/01/1219': { size:   638, district: 'Gasabo',     sector: 'Kacyiru'    },
  '1/02/07/01/940' : { size:  1925, district: 'Gasabo',     sector: 'Kacyiru'    },
  '1/02/09/01/2602': { size:  1211, district: 'Gasabo',     sector: 'Kimironko'  },
  '1/02/09/02/2192': { size:   968, district: 'Gasabo',     sector: 'Kimironko'  },
  '1/02/09/02/2699': { size:   733, district: 'Gasabo',     sector: 'Kimironko'  },
  '1/02/09/02/3440': { size:   613, district: 'Gasabo',     sector: 'Kimironko'  },
  '1/02/10/03/988' : { size:  4669, district: 'Gasabo',     sector: 'Kinyinya'   },
  '1/02/04/02/5577': { size:   363, district: 'Gasabo',     sector: 'Gisozi'     },
  '1/02/10/03/1464': { size:  3411, district: 'Gasabo',     sector: 'Kinyinya'   },
  '1/02/10/03/1471': { size:  3096, district: 'Gasabo',     sector: 'Kinyinya'   },
  '1/02/10/03/11070':{ size:  1445, district: 'Gasabo',     sector: 'Kinyinya'   },
  '1/02/10/03/11360':{ size:   762, district: 'Gasabo',     sector: 'Kinyinya'   },
  '1/02/10/03/4606': { size:  1071, district: 'Gasabo',     sector: 'Kinyinya'   },
  '1/02/10/03/5838': { size:  6888, district: 'Gasabo',     sector: 'Kinyinya'   },
  '1/02/10/03/9684': { size:  8459, district: 'Gasabo',     sector: 'Kinyinya'   },
  '1/02/10/04/1019': { size:  4975, district: 'Gasabo',     sector: 'Kinyinya'   },
  '1/02/12/02/546' : { size:  1612, district: 'Gasabo',     sector: 'Nduba'      },
  '1/02/12/02/3823': { size:   561, district: 'Gasabo',     sector: 'Nduba'      },
  '1/03/05/02/1958': { size:  3112, district: 'Kicukiro',   sector: 'Kanombe'    },
  '1/03/08/02/673' : { size: 20930, district: 'Kicukiro',   sector: 'Masaka'     },
  '1/03/02/03/2183': { size:   526, district: 'Kicukiro',   sector: 'Gatenga'    },
  '1/03/03/02/319' : { size:   433, district: 'Kicukiro',   sector: 'Gikondo'    },
  '1/03/08/05/1544': { size: 12544, district: 'Kicukiro',   sector: 'Masaka'     },
};

// ── Derived PIPELINE_PARCELS array ─────────────────────────────────────────────
// Used by data.js as the `parcels` array, powering all pages.
const PIPELINE_PARCELS = (function() {
  var residentialImgs = [
    'images/pexels-bala-5120876.jpg',
    'images/pexels-nguyendesigner-16419876.jpg',
    'images/pexels-droneafrica-37386894.jpg',
  ];
  var commercialImgs = [
    'images/payam-moin-afshari-QRkbb0ZFW9s-unsplash.jpg',
    'images/pexels-hoang-vu-257779885-15770452.jpg',
  ];
  var mixedImgs = [
    'images/pexels-marquez-6372033.jpg',
    'images/pexels-ana-kenk-2159501753-36477481.jpg',
  ];
  var typeImgs = { residential: residentialImgs, commercial: commercialImgs, 'mixed-use': mixedImgs };
  var imgIdx   = { residential: 0, commercial: 0, 'mixed-use': 0 };

  return Object.keys(PIPELINE_PRICES).map(function(upi) {
    var pp   = PIPELINE_PRICES[upi];
    var geo  = _PARCEL_GEO[upi] || {};
    var zone = pp.zone || '';
    var note = pp.note || '';

    var district = geo.district || 'Kigali';
    var sector   = geo.sector   || '';
    var size_sqm = geo.size     || 0;

    var type = /^R/i.test(zone) ? 'residential'
             : /^C/i.test(zone) ? 'commercial'
             : /^I/i.test(zone) ? 'mixed-use'
             : 'residential';

    var plotNum = upi.split('/').pop();
    var name = note || (sector ? sector + ' ' + plotNum : upi);

    var imgs = typeImgs[type];
    var image = imgs[imgIdx[type] % imgs.length];
    imgIdx[type]++;

    return {
      id:             upi,
      upi:            upi,
      name:           name,
      location:       district + ' / ' + sector,
      district:       district,
      sector:         sector,
      zone:           zone,
      note:           note,
      size_sqm:       size_sqm,
      land_price_rwf: pp.price || 0,
      type:           type,
      status:         pp.price == null ? 'pending' : 'under_review',
      image:          image,
      readiness: {
        legal:          45,
        physical:       70,
        infrastructure: 60,
        urban:          65,
        community:      50,
        tokenisation:   15,
      },
    };
  });
})();
