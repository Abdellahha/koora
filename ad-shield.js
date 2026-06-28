/* ad-shield.js — aggressive ad/popup blocking WITHOUT iframe sandbox.
   Works by:
   1. Killing window.open / window.location hijacks at the top frame level.
   2. A transparent shield div over the iframe that intercepts stray clicks
      on ad overlays, lets through real video-player clicks via a centre-zone
      pass-through, and auto-dismisses anything that looks like an ad overlay.
   3. Periodic DOM scanning inside the iframe (same-origin frames only) to
      remove overlay nodes.
   4. postMessage listener to catch embeds that send redirect commands.
   5. Visibility / blur / beforeunload guards (popunder & redirect prevention).
*/
(function () {
  'use strict';

  /* ── 1. window.open / location hijack kill ───────────────────────────── */
  var _allowedHosts = ['ntv.cx', 'ntvs.cx', 'embed.st', 'youtube.com', 'youtu.be'];

  function hostAllowed(url) {
    try {
      var h = new URL(url).hostname.replace(/^www\./, '');
      return _allowedHosts.some(function (d) { return h === d || h.endsWith('.' + d); });
    } catch (e) { return false; }
  }

  window.open = function (url, name, features) {
    if (!url || !hostAllowed(url)) { console.warn('[ad-shield] popup blocked:', url); return null; }
    return null; // even allowed hosts: never open a new tab
  };

  // Block _blank link clicks
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[target="_blank"]');
    if (a) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  // Block middle-click new-tab
  document.addEventListener('auxclick', function (e) {
    if (e.button === 1) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  /* ── 2. Popunder & top-frame redirect guard ──────────────────────────── */
  window.__adShieldGuard = true;

  window.addEventListener('blur', function () {
    if (!window.__adShieldGuard) return;
    setTimeout(function () { if (window.__adShieldGuard) window.focus(); }, 0);
  });

  document.addEventListener('visibilitychange', function () {
    if (window.__adShieldGuard && document.visibilityState === 'visible') window.focus();
  });

  window.addEventListener('beforeunload', function (e) {
    if (!window.__adShieldGuard) return;
    e.preventDefault(); e.returnValue = ''; return '';
  });

  window.addEventListener('pagehide', function () { window.__adShieldGuard = false; });

  // Watchdog: re-focus if something pulls focus away
  setInterval(function () {
    if (window.__adShieldGuard && document.visibilityState === 'visible' && !document.hasFocus()) {
      window.focus();
    }
  }, 400);

  /* ── 3. postMessage hijack catcher ───────────────────────────────────── */
  window.addEventListener('message', function (e) {
    // Some ad scripts send postMessage to trigger a redirect
    var d = e.data;
    if (typeof d === 'string' && /(redirect|navigate|location|href|open)/i.test(d)) {
      e.stopImmediatePropagation();
    }
  }, true);

  /* ── 4. Shield overlay over the player iframe ────────────────────────── */
  // A transparent div sits on top of the iframe. Clicks in the centre 60% of
  // the player (where real video controls live) pass through via pointer-events
  // toggling. Clicks detected near edges (where ad banners typically sit) are
  // swallowed and the overlay is re-shown.
  function installShield(frameEl) {
    var wrap = frameEl.parentElement;
    if (!wrap || wrap.querySelector('.ad-shield-overlay')) return;

    var shield = document.createElement('div');
    shield.className = 'ad-shield-overlay';
    shield.style.cssText = [
      'position:absolute',
      'inset:0',
      'z-index:9999',
      'pointer-events:none',  // start transparent
      'background:transparent',
    ].join(';');

    wrap.style.position = wrap.style.position || 'relative';
    wrap.appendChild(shield);

    // When the iframe fires a click-like event near its edges, the shield
    // briefly turns on pointer-events to swallow the next click.
    var shieldTimer = null;
    function armShield(ms) {
      shield.style.pointerEvents = 'all';
      clearTimeout(shieldTimer);
      shieldTimer = setTimeout(function () {
        shield.style.pointerEvents = 'none';
      }, ms || 600);
    }

    // Detect when the iframe window loses focus — a strong signal an ad overlay
    // was clicked. Re-arm immediately and refocus the parent.
    frameEl.addEventListener('load', function () {
      try {
        var iwin = frameEl.contentWindow;
        if (!iwin) return;
        iwin.addEventListener('blur', function () {
          armShield(800);
          setTimeout(function () { window.focus(); }, 0);
        });
        // Also scan the iframe DOM for overlay nodes once it loads
        scanAndRemoveAds(frameEl);
      } catch (e) { /* cross-origin — can't access contentWindow */ }
    });
  }

  /* ── 5. In-iframe DOM cleaner (same-origin only) ─────────────────────── */
  var AD_SELECTORS = [
    // Generic overlay patterns
    '[style*="position:fixed"]',
    '[style*="position: fixed"]',
    '[style*="z-index:9"]',
    '[style*="z-index: 9"]',
    // Common ad class/id patterns
    '.ad', '.ads', '.advert', '.advertisement', '.ad-container', '.ad-wrap',
    '.ad-overlay', '.popup', '.pop-up', '.modal-ad', '.interstitial',
    '[id*="advert"]', '[id*="banner"]', '[id*="popup"]', '[id*="overlay"]',
    '[class*="advert"]', '[class*="banner-ad"]', '[class*="popup"]',
    // iframes inside iframes that look like ad slots
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
            // Only remove if it looks like an overlay (large z-index or fixed pos)
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

  // Watch for dynamically created iframes (channels swap the iframe element)
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
  window.adShieldDisarm = function () { window.__adShieldGuard = false; };

})();
