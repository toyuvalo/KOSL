// KOSL Cookie Consent Manager — Consent Mode v2
// Categories: essential (always on), analytics, marketing
// Version 2.0.0
(function () {
  'use strict';

  var STORAGE_KEY = 'kosl_cookie_consent_v2';
  var CONSENT_VERSION = 2;
  var ACCENT = '#2563eb';
  var ACCENT_DARK = '#1d4ed8';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (obj.v !== CONSENT_VERSION) return null;
      return obj;
    } catch (e) { return null; }
  }

  function writeConsent(c) {
    var payload = {
      v: CONSENT_VERSION, ts: Date.now(), essential: true,
      analytics: !!c.analytics, marketing: !!c.marketing
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    applyConsent(payload);
    window.dispatchEvent(new CustomEvent('kosl:consent', { detail: payload }));
    return payload;
  }

  function applyConsent(c) {
    gtag('consent', 'update', {
      analytics_storage: c.analytics ? 'granted' : 'denied',
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied'
    });
  }

  var css = '\
  #kosl-cc-banner,#kosl-cc-modal,#kosl-cc-fab{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1f2937;box-sizing:border-box}\
  #kosl-cc-banner *,#kosl-cc-modal *{box-sizing:border-box}\
  #kosl-cc-banner{position:fixed;left:16px;right:16px;bottom:16px;max-width:720px;margin:0 auto;background:#fff;border:1px solid #e2e5ea;border-radius:4px;padding:20px 22px;box-shadow:0 20px 60px rgba(20,30,50,.18);z-index:2147483646;animation:koslccIn .35s cubic-bezier(.2,.9,.3,1.2)}\
  @keyframes koslccIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}\
  #kosl-cc-banner .kosl-cc-hdr{display:flex;align-items:center;gap:10px;margin-bottom:8px}\
  #kosl-cc-banner h3{margin:0;font-size:14px;font-weight:600;color:#111827;letter-spacing:.02em}\
  #kosl-cc-banner p{margin:0 0 16px;font-size:13.5px;line-height:1.6;color:#4b5563}\
  #kosl-cc-banner .kosl-cc-btns{display:flex;gap:8px;flex-wrap:wrap}\
  #kosl-cc-banner button{font:inherit;font-size:12.5px;font-weight:600;padding:9px 16px;border-radius:3px;cursor:pointer;border:1px solid transparent;transition:background .15s,border-color .15s,color .15s}\
  .kosl-cc-primary{background:' + ACCENT + ';color:#fff;border-color:' + ACCENT + ' !important}\
  .kosl-cc-primary:hover{background:' + ACCENT_DARK + '}\
  .kosl-cc-secondary{background:#fff;color:#374151;border-color:#cdd2da !important}\
  .kosl-cc-secondary:hover{border-color:#9ca3af !important;background:#f8f9fb}\
  .kosl-cc-link{background:transparent;color:#6b7280;border:none !important;padding:9px 10px !important;text-decoration:underline}\
  .kosl-cc-link:hover{color:#111827}\
  #kosl-cc-modal{position:fixed;inset:0;background:rgba(20,25,35,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;animation:koslccFade .2s}\
  @keyframes koslccFade{from{opacity:0}to{opacity:1}}\
  #kosl-cc-modal .kosl-cc-dlg{background:#fff;border:1px solid #e2e5ea;border-radius:4px;max-width:560px;width:100%;max-height:90vh;overflow-y:auto;padding:28px;box-shadow:0 30px 80px rgba(20,30,50,.25)}\
  #kosl-cc-modal h2{margin:0 0 6px;font-size:18px;color:#111827;display:flex;align-items:center;gap:10px;font-weight:600}\
  #kosl-cc-modal .kosl-cc-sub{margin:0 0 22px;font-size:13.5px;color:#6b7280;line-height:1.6}\
  .kosl-cc-cat{background:#f8f9fb;border:1px solid #e2e5ea;border-radius:3px;padding:14px 16px;margin-bottom:10px}\
  .kosl-cc-cat-top{display:flex;justify-content:space-between;align-items:center;gap:12px}\
  .kosl-cc-cat-top strong{font-size:13.5px;color:#111827;font-weight:600}\
  .kosl-cc-cat-desc{font-size:12.5px;color:#6b7280;margin-top:6px;line-height:1.55}\
  .kosl-cc-badge{font-size:10.5px;padding:3px 8px;border-radius:2px;background:#dcfce7;color:#166534;border:1px solid rgba(34,197,94,.25);text-transform:uppercase;letter-spacing:.5px;font-weight:600}\
  .kosl-cc-tgl{position:relative;width:40px;height:22px;background:#cdd2da;border-radius:999px;cursor:pointer;transition:background .15s;flex-shrink:0;border:none;padding:0}\
  .kosl-cc-tgl.on{background:' + ACCENT + '}\
  .kosl-cc-tgl::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;background:#fff;border-radius:50%;transition:transform .15s;box-shadow:0 1px 2px rgba(0,0,0,.2)}\
  .kosl-cc-tgl.on::after{transform:translateX(18px)}\
  #kosl-cc-modal .kosl-cc-foot{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px;justify-content:flex-end}\
  #kosl-cc-modal button{font:inherit;font-size:12.5px;font-weight:600;padding:9px 16px;border-radius:3px;cursor:pointer;border:1px solid transparent}\
  #kosl-cc-fab{position:fixed;left:16px;bottom:16px;width:42px;height:42px;border-radius:3px;background:#fff;border:1px solid #cdd2da;box-shadow:0 6px 20px rgba(20,30,50,.15);cursor:pointer;z-index:2147483645;display:flex;align-items:center;justify-content:center;color:' + ACCENT + ';transition:transform .15s,border-color .15s}\
  #kosl-cc-fab:hover{transform:scale(1.06);border-color:' + ACCENT + '}\
  #kosl-cc-fab svg{width:20px;height:20px}\
  @media (max-width:520px){#kosl-cc-banner{padding:16px}#kosl-cc-banner .kosl-cc-btns{flex-direction:column}#kosl-cc-banner button{width:100%}}';

  function injectCSS() {
    if (document.getElementById('kosl-cc-css')) return;
    var s = document.createElement('style');
    s.id = 'kosl-cc-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  var SHIELD_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="' + ACCENT + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z"/><path d="M9 12l2 2 4-4"/></svg>';

  function showBanner() {
    if (document.getElementById('kosl-cc-banner')) return;
    injectCSS();
    var b = document.createElement('div');
    b.id = 'kosl-cc-banner';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Cookie preferences');
    b.innerHTML =
      '<div class="kosl-cc-hdr">' + SHIELD_SVG + '<h3>Your privacy</h3></div>' +
      '<p>Essential cookies keep this site working. With your permission, we also use analytics to understand which pages visitors find useful — never for advertising or data resale.</p>' +
      '<div class="kosl-cc-btns">' +
        '<button class="kosl-cc-primary" data-act="all">Accept all</button>' +
        '<button class="kosl-cc-secondary" data-act="essential">Essential only</button>' +
        '<button class="kosl-cc-link" data-act="customize">Customize</button>' +
      '</div>';
    document.body.appendChild(b);
    b.addEventListener('click', function (e) {
      var act = e.target.getAttribute('data-act');
      if (!act) return;
      if (act === 'all') { writeConsent({ analytics: true, marketing: true }); closeBanner(); mountFab(); }
      else if (act === 'essential') { writeConsent({ analytics: false, marketing: false }); closeBanner(); mountFab(); }
      else if (act === 'customize') { closeBanner(); showModal(); }
    });
  }

  function closeBanner() {
    var b = document.getElementById('kosl-cc-banner');
    if (b) b.remove();
  }

  function showModal(prefill) {
    var current = prefill || readConsent() || { analytics: false, marketing: false };
    injectCSS();
    closeBanner();
    var m = document.createElement('div');
    m.id = 'kosl-cc-modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.innerHTML =
      '<div class="kosl-cc-dlg" role="document">' +
        '<h2>' + SHIELD_SVG + 'Cookie preferences</h2>' +
        '<p class="kosl-cc-sub">KOSL is built privacy-first. We never sell your data. Choose exactly what you\'re comfortable with.</p>' +
        '<div class="kosl-cc-cat"><div class="kosl-cc-cat-top"><strong>Strictly necessary</strong><span class="kosl-cc-badge">Always on</span></div><div class="kosl-cc-cat-desc">Required for the site to function. No tracking.</div></div>' +
        '<div class="kosl-cc-cat"><div class="kosl-cc-cat-top"><strong>Analytics</strong><button class="kosl-cc-tgl' + (current.analytics ? ' on' : '') + '" data-tgl="analytics" role="switch" aria-checked="' + (current.analytics ? 'true' : 'false') + '" aria-label="Analytics"></button></div><div class="kosl-cc-cat-desc">Google Analytics 4 with IP anonymization. Helps us understand which pages are useful. No cross-site tracking.</div></div>' +
        '<div class="kosl-cc-cat"><div class="kosl-cc-cat-top"><strong>Marketing</strong><button class="kosl-cc-tgl' + (current.marketing ? ' on' : '') + '" data-tgl="marketing" role="switch" aria-checked="' + (current.marketing ? 'true' : 'false') + '" aria-label="Marketing"></button></div><div class="kosl-cc-cat-desc">Reserved for future conversion pixels — off by default and only activated with your consent.</div></div>' +
        '<div class="kosl-cc-foot">' +
          '<button class="kosl-cc-secondary" data-act="reject">Reject all</button>' +
          '<button class="kosl-cc-primary" data-act="save">Save</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(m);

    m.addEventListener('click', function (e) {
      if (e.target === m) { closeModal(); return; }
      var tgl = e.target.closest('[data-tgl]');
      if (tgl) {
        tgl.classList.toggle('on');
        var on = tgl.classList.contains('on');
        tgl.setAttribute('aria-checked', on ? 'true' : 'false');
        current[tgl.getAttribute('data-tgl')] = on;
        return;
      }
      var act = e.target.getAttribute('data-act');
      if (act === 'save') {
        var ans = {};
        m.querySelectorAll('[data-tgl]').forEach(function (t) { ans[t.getAttribute('data-tgl')] = t.classList.contains('on'); });
        writeConsent(ans); closeModal(); mountFab();
      } else if (act === 'reject') {
        writeConsent({ analytics: false, marketing: false }); closeModal(); mountFab();
      }
    });
  }

  function closeModal() {
    var m = document.getElementById('kosl-cc-modal');
    if (m) m.remove();
  }

  function mountFab() {
    if (document.getElementById('kosl-cc-fab')) return;
    injectCSS();
    var f = document.createElement('button');
    f.id = 'kosl-cc-fab';
    f.setAttribute('aria-label', 'Cookie preferences');
    f.innerHTML = SHIELD_SVG;
    f.addEventListener('click', function () { showModal(); });
    document.body.appendChild(f);
  }

  function boot() {
    var existing = readConsent();
    if (existing) { applyConsent(existing); mountFab(); }
    else { showBanner(); }
  }

  window.KOSLCookieConsent = {
    open: function () { showModal(); },
    reset: function () { localStorage.removeItem(STORAGE_KEY); location.reload(); },
    get: function () { return readConsent(); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
