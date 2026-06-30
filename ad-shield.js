/* ad-shield.js — ad/popup blocking, iOS-safe version.
   Fixed issues:
   - Removed beforeunload guard (breaks iOS Safari navigation & video)
   - Removed blur/focus watchdog (interferes with iOS video player focus)
   - Removed window.open override (iOS video players use it internally)
   - Removed setInterval refocus (continuously interrupts iOS video)
   - Kept: popup link blocking, postMessage guard, DOM cleaner
*/
(function () {
  'use strict';

  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  /* ── 1. Block _blank link clicks (ads opening new tabs) ─────────────── */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[target="_blank"]');
    if (a) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  // Block middle-click new-tab (desktop only)
  if (!isIOS) {
    document.addEventListener('auxclick', function (e) {
      if (e.button === 1) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  }

  /* ── 2. window.open guard — only block clearly ad-like opens ────────── */
  // On iOS we skip overriding window.open entirely because video players
  // (especially HLS embeds) use it internally to set up stream sessions.
  if (!isIOS) {
    var _origOpen = window.open;
    window.open = function (url, name, features) {
      // Allow opens that have no URL (player internal calls) or same-origin
      if (!url) return _origOpen.apply(window, arguments);
      try {
        var targetHost = new URL(url, location.href).hostname;
        if (targetHost === location.hostname) return _origOpen.apply(window, arguments);
      } catch(e) {}
      // Block everything else (ad popups)
      console.warn('[ad-shield] popup blocked:', url);
      return null;
    };
  }

  /* ── 3. postMessage hijack catcher ───────────────────────────────────── */
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (typeof d === 'string' && /(redirect|navigate|location|href|open)/i.test(d)) {
      e.stopImmediatePropagation();
    }
  }, true);

  /* ── 4. Shield overlay over the player iframe ────────────────────────── */
  function installShield(frameEl) {
    var wrap = frameEl.parentElement;
    if (!wrap || wrap.querySelector('.ad-shield-overlay')) return;

    var shield = document.createElement('div');
    shield.className = 'ad-shield-overlay';
    shield.style.cssText = [
      'position:absolute',
      'inset:0',
      'z-index:9999',
      'pointer-events:none',
      'background:transparent',
    ].join(';');

    wrap.style.position = wrap.style.position || 'relative';
    wrap.appendChild(shield);

    var shieldTimer = null;
    function armShield(ms) {
      shield.style.pointerEvents = 'all';
      clearTimeout(shieldTimer);
      shieldTimer = setTimeout(function () {
        shield.style.pointerEvents = 'none';
      }, ms || 600);
    }

    frameEl.addEventListener('load', function () {
      try {
        var iwin = frameEl.contentWindow;
        if (!iwin) return;
        // On desktop only — on iOS, blur listener kills the video player
        if (!isIOS) {
          iwin.addEventListener('blur', function () {
            armShield(800);
          });
        }
        scanAndRemoveAds(frameEl);
      } catch (e) { /* cross-origin */ }
    });
  }

  /* ── 5. In-iframe DOM cleaner (same-origin only) ─────────────────────── */
  var AD_SELECTORS = [
    '[style*="position:fixed"]',
    '[style*="position: fixed"]',
    '.ad', '.ads', '.advert', '.advertisement', '.ad-container', '.ad-wrap',
    '.ad-overlay', '.popup', '.pop-up', '.modal-ad', '.interstitial',
    '[id*="advert"]', '[id*="banner"]', '[id*="popup"]', '[id*="overlay"]',
    '[class*="advert"]', '[class*="banner-ad"]', '[class*="popup"]',
    'iframe[src*="doubleclick"]', 'iframe[src*="googlesyndication"]',
    'iframe[src*="adnxs"]', 'iframe[src*="ads."]',
  ];

  function scanAndRemoveAds(frameEl) {
    try {
      var doc = frameEl.contentDocument;
      if (!doc) return;
      AD_SELECTORS.forEach(function (sel) {
        try {
          doc.querySelectorAll(sel).forEach(function (node) {
            var cs = doc.defaultView.getComputedStyle(node);
            var zi = parseInt(cs.zIndex, 10);
            var pos = cs.position;
            if ((pos === 'fixed' || pos === 'absolute') && (isNaN(zi) || zi > 100)) {
              node.remove();
            }
          });
        } catch (e2) {}
      });
    } catch (e) { /* cross-origin */ }
  }

  /* ── 6. Auto-install on page ready + watch for new iframes ──────────── */
  function processIframes() {
    document.querySelectorAll('#playerFrame iframe, #videoIframe').forEach(function (f) {
      installShield(f);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processIframes);
  } else {
    processIframes();
  }

  var mo = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.tagName === 'IFRAME') installShield(n);
        else if (n.querySelectorAll) {
          n.querySelectorAll('iframe').forEach(installShield);
        }
      });
    });
  });
  mo.observe(document.body, { childList: true, subtree: true });

  /* ── 7. Expose disarm function for intentional navigation ────────────── */
  window.adShieldDisarm = function () {};

})();