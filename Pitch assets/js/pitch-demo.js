/* The Healin Hub pitch — live geo-search demo (vanilla JS) */
(function () {
  var CITIES = {
    chicago:   { name: "Chicago, IL",   lat: 41.8339, lng: -87.6722 },
    austin:    { name: "Austin, TX",    lat: 30.2672, lng: -97.7431 },
    houston:   { name: "Houston, TX",   lat: 29.7604, lng: -95.3698 },
    atlanta:   { name: "Atlanta, GA",   lat: 33.7490, lng: -84.3880 },
    phoenix:   { name: "Phoenix, AZ",   lat: 33.4484, lng: -112.0740 }
  };

  var PROVIDERS = [
    { name: "Chicago Dollz Experience", meta: "Post-op massage · Body sculpting · W 95th St", lat: 41.7212, lng: -87.6687, rating: "5.0", count: 94, vetted: true },
    { name: "West Loop Aesthetics", meta: "Med spa · Injectables", lat: 41.8825, lng: -87.6441, rating: "4.8", count: 143, vetted: true },
    { name: "Hyde Park Glow Studio", meta: "Facials · Skin care", lat: 41.7943, lng: -87.5907, rating: "4.7", count: 66, vetted: false },
    { name: "South Shore Lash & Nail", meta: "Nails · Lashes", lat: 41.7600, lng: -87.5660, rating: "4.6", count: 52, vetted: false },
    { name: "Lumen Med Spa", meta: "Med spa · Injectables", lat: 30.2510, lng: -97.7494, rating: "4.9", count: 212, vetted: true },
    { name: "Hill Country Aesthetics", meta: "Med spa · Weight loss", lat: 30.3265, lng: -97.8092, rating: "4.5", count: 41, vetted: false },
    { name: "Violet Crown Facials", meta: "Facials · Skin tightening", lat: 30.2980, lng: -97.7090, rating: "4.8", count: 77, vetted: true },
    { name: "South First Nails & Spa", meta: "Nails · Waxing", lat: 30.2420, lng: -97.7650, rating: "4.6", count: 129, vetted: false },
    { name: "Glow Aesthetics & Wellness", meta: "Med spa · Injectables", lat: 29.7430, lng: -95.4010, rating: "4.9", count: 128, vetted: true },
    { name: "Bayou Body Sculpting", meta: "Body contouring · Post-op care", lat: 29.8030, lng: -95.4180, rating: "4.7", count: 64, vetted: true },
    { name: "Heights Hair Collective", meta: "Hair · Extensions", lat: 29.7910, lng: -95.3970, rating: "4.8", count: 203, vetted: false },
    { name: "Velvet Touch Post-Op Care", meta: "Post-op recovery · Lymphatic massage", lat: 33.7610, lng: -84.3520, rating: "4.8", count: 64, vetted: true },
    { name: "Peach & Pine Facials", meta: "Facials · Peels", lat: 33.7810, lng: -84.4080, rating: "4.7", count: 96, vetted: true },
    { name: "Ponce City Injectables", meta: "Injectables · Med spa", lat: 33.7720, lng: -84.3660, rating: "4.9", count: 154, vetted: true },
    { name: "Desert Bloom Aesthetics", meta: "Med spa · Skin tightening", lat: 33.5090, lng: -112.0480, rating: "4.6", count: 88, vetted: true },
    { name: "Solstice Skin Studio", meta: "Facials · Dermaplaning", lat: 33.4810, lng: -111.9260, rating: "4.8", count: 112, vetted: false },
    { name: "Camelback Weight & Wellness", meta: "Medical weight loss", lat: 33.5230, lng: -112.0740, rating: "4.5", count: 39, vetted: true }
  ];

  function dist(aLat, aLng, bLat, bLng) {
    var R = 3958.8, toRad = Math.PI / 180;
    var dLat = (bLat - aLat) * toRad, dLng = (bLng - aLng) * toRad;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(aLat * toRad) * Math.cos(bLat * toRad) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  var state = { city: "chicago", radius: 10 };

  function render() {
    var c = CITIES[state.city];
    var results = PROVIDERS
      .map(function (p) { return Object.assign({ d: dist(c.lat, c.lng, p.lat, p.lng) }, p); })
      .filter(function (p) { return p.d <= state.radius; })
      .sort(function (a, b) { return a.d - b.d; });

    var count = document.getElementById("demo-count");
    count.innerHTML = "<b>" + results.length + " provider" + (results.length === 1 ? "" : "s") +
      "</b> within " + state.radius + " miles of " + c.name + " · sorted by distance";

    var list = document.getElementById("demo-list");
    list.innerHTML = results.slice(0, 4).map(function (p) {
      return '<div class="prow">' +
        '<div class="pimg"></div>' +
        '<div class="pbody"><h4>' + p.name +
        (p.vetted ? ' <span class="badge badge-vetted" style="font-size: 11px; padding: 4px 10px;">✓ Vetted</span>' : '') +
        '</h4><p class="pmeta">' + p.meta + '</p>' +
        '<span class="rating"><span class="stars">★★★★★</span><span class="score">' + p.rating +
        '</span><span class="count">(' + p.count + ')</span></span></div>' +
        '<div class="pside"><span><b>' + p.d.toFixed(1) + ' mi</b></span></div></div>';
    }).join("") || '<div class="alert alert-info"><span>No vetted providers within ' + state.radius +
      ' miles yet. Try a wider radius — or be the first to list.</span></div>';

    // Map: project ±0.45° lng / ±0.34° lat around city center
    var map = document.getElementById("demo-map");
    var spanLng = 0.45, spanLat = 0.34;
    var pins = results.map(function (p) {
      var x = 50 + ((p.lng - c.lng) / spanLng) * 50;
      var y = 50 - ((p.lat - c.lat) / spanLat) * 50;
      if (x < 6 || x > 94 || y < 8 || y > 92) return "";
      return '<span class="pin" style="left: ' + x.toFixed(1) + '%; top: ' + y.toFixed(1) + '%;"></span>';
    }).join("");
    // radius ring: radius miles -> % of half-width (half-width ≈ spanLng/2 ° lng ≈ 0.225*53mi ≈ 12mi at these latitudes)
    var milesPerHalf = (spanLng / 2) * 53;
    var ringPct = Math.min((state.radius / milesPerHalf) * 100, 240);
    map.innerHTML = pins +
      '<span class="ring" style="left: 50%; top: 50%; width: ' + ringPct + '%; height: ' + (ringPct * 1.18) + '%;"></span>' +
      '<span class="you" style="left: 50%; top: 50%;"></span>' +
      '<span class="map-tag">' + c.name + ' · ' + state.radius + ' mi radius</span>';

    document.querySelectorAll("[data-demo-city]").forEach(function (el) {
      el.classList.toggle("active", el.getAttribute("data-demo-city") === state.city);
    });
    document.querySelectorAll("[data-demo-radius]").forEach(function (el) {
      el.classList.toggle("active", Number(el.getAttribute("data-demo-radius")) === state.radius);
    });
  }

  document.addEventListener("click", function (e) {
    var cityEl = e.target.closest("[data-demo-city]");
    if (cityEl) { state.city = cityEl.getAttribute("data-demo-city"); render(); }
    var radEl = e.target.closest("[data-demo-radius]");
    if (radEl) { state.radius = Number(radEl.getAttribute("data-demo-radius")); render(); }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
