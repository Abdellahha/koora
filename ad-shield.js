/* ad-shield.js — iOS-safe ad/popup blocking.
   Key iOS fixes vs old version:
   - NO beforeunload listener (breaks iOS video navigation)
   - NO blur/window.focus() loop (fights iOS video player for focus)
   - NO window.open override on iOS (HLS players use it internally)
   - NO setInterval refocus (interrupts iOS video continuously)
*/
(function () {
  'use strict';

  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  /* ── 1. Block _blank ad links ────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[target="_blank"]');
    if (a && !a.classList.contains('back-link')) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  /* ── 2. window.open — only block on desktop, iOS needs it for streams ── */
  if (!isIOS) {
    var _orig = window.open;
    window.open = function (url, name, features) {
      if (!url) return _orig.apply(window, arguments);
      try {
        var h = new URL(url, location.href).hostname;
        if (h === location.hostname) return _orig.apply(window, arguments);
      } catch(e) {}
      console.warn('[ad-shield] blocked popup:', url);
      return null;
    };
  }

  /* ── 3. postMessage redirect catcher ─────────────────────────────────── */
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (typeof d === 'string' && /(redirect|navigate|open\s+url)/i.test(d)) {
      e.stopImmediatePropagation();
    }
  }, true);

  /* ── 4. DOM ad cleaner for same-origin iframes ───────────────────────── */
  var AD_SEL = [
    '[style*="position:fixed"],[style*="position: fixed"]',
    '.ad-overlay,.popup,.modal-ad,.interstitial',
    'iframe[src*="doubleclick"],iframe[src*="googlesyndication"]',
  ].join(',');

  function scanAds(frameEl) {
    try {
      var doc = frameEl.contentDocument;
      if (!doc) return;
      doc.querySelectorAll(AD_SEL).forEach(function (n) {
        try {
          var cs = doc.defaultView.getComputedStyle(n);
          if ((cs.position === 'fixed' || cs.position === 'absolute') && parseInt(cs.zIndex) > 100) n.remove();
        } catch(e2) {}
      });
    } catch(e) {}
  }

  /* ── 5. Install per-iframe ───────────────────────────────────────────── */
  function installShield(frameEl) {
    if (frameEl._adShielded) return;
    frameEl._adShielded = true;
    frameEl.addEventListener('load', function () { scanAds(frameEl); });
  }

  function processAll() {
    document.querySelectorAll('iframe').forEach(installShield);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processAll);
  } else { processAll(); }

  new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.tagName === 'IFRAME') installShield(n);
        else if (n.querySelectorAll) n.querySelectorAll('iframe').forEach(installShield);
      });
    });
  }).observe(document.body, { childList: true, subtree: true });

  window.adShieldDisarm = function () {};
})();