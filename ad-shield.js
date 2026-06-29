/* ad-shield.js — blocks popup/tab ads from stream iframes WITHOUT sandbox.
 *
 * HOW IT WORKS
 * ─────────────
 * The root problem: ad scripts inside the iframe listen for ANY click/touch
 * on their page and call window.open() or navigate window.top to an ad URL.
 * We can't stop their internal JS, but we CAN stop the browser from ever
 * giving the iframe a real "user gesture" — by placing a transparent div on
 * top of the iframe that:
 *
 *   1. Catches every pointerdown/click on the iframe area.
 *   2. Re-fires a SYNTHETIC (isTrusted=false) event at the same position so
 *      the video player still responds (play/pause, seek, fullscreen).
 *   3. Swallows the original trusted event, so the iframe's ad JS never gets
 *      a user gesture and browser popup policy blocks window.open().
 *
 * Classic guards still run on top:
 *   • window.open → null
 *   • beforeunload redirect guard
 *   • blur/focus popunder snap-back
 *   • _blank link kill, middle-click kill
 */
(function () {
  'use strict';

  /* ── window.open nuke ───────────────────────────────────────────────── */
  window.open = function (url) {
    console.warn('[ad-shield] blocked window.open:', url);
    return null;
  };

  /* ── kill _blank links ──────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[target="_blank"]');
    if (a) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);

  /* ── kill middle-click ──────────────────────────────────────────────── */
  document.addEventListener('auxclick', function (e) {
    if (e.button === 1) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);

  /* ── popunder snap-back + redirect guard ────────────────────────────── */
  var _guard = true;
  window.addEventListener('blur', function () {
    if (!_guard) return;
    setTimeout(function () { if (_guard) window.focus(); }, 0);
  });
  document.addEventListener('visibilitychange', function () {
    if (_guard && document.visibilityState === 'visible') window.focus();
  });
  window.addEventListener('beforeunload', function (e) {
    if (!_guard) return;
    e.preventDefault(); e.returnValue = ''; return '';
  });
  window.addEventListener('pagehide', function () { _guard = false; });
  setInterval(function () {
    if (_guard && document.visibilityState === 'visible' && !document.hasFocus()) window.focus();
  }, 300);

  window.adShieldDisarm = function () { _guard = false; };

  /* ── transparent interception shield ───────────────────────────────── */
  function makeShield(iframeEl) {
    var wrap = iframeEl.parentElement;
    if (!wrap) return;
    if (wrap.querySelector('.asg-shield')) return;

    var pos = getComputedStyle(wrap).position;
    if (pos === 'static') wrap.style.position = 'relative';

    var shield = document.createElement('div');
    shield.className = 'asg-shield';
    shield.style.cssText = [
      'position:absolute',
      'inset:0',
      'z-index:2147483647',
      'background:transparent',
      'cursor:pointer',
      '-webkit-tap-highlight-color:transparent',
    ].join(';');

    wrap.appendChild(shield);

    function forwardMouse(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      try {
        ['pointerdown','mousedown','mouseup','click'].forEach(function (type) {
          iframeEl.dispatchEvent(new MouseEvent(type, {
            bubbles: true, cancelable: true,
            clientX: e.clientX, clientY: e.clientY,
            screenX: e.screenX, screenY: e.screenY,
            view: window,
          }));
        });
      } catch (err) {}
    }

    function forwardTouch(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      try {
        var t = e.touches[0] || e.changedTouches[0];
        if (!t) return;
        iframeEl.dispatchEvent(new MouseEvent('click', {
          bubbles: true, cancelable: true,
          clientX: t.clientX, clientY: t.clientY,
          view: window,
        }));
      } catch (err) {}
    }

    shield.addEventListener('pointerdown', forwardMouse, { passive: false });
    shield.addEventListener('touchstart',  forwardTouch,  { passive: false });

    /* Snap focus back if iframe somehow steals it */
    iframeEl.addEventListener('load', function () {
      try {
        iframeEl.contentWindow.addEventListener('blur', function () {
          setTimeout(function () { window.focus(); }, 0);
        });
      } catch (e) {}
    });
  }

  /* ── install on all current and future iframes ─────────────────────── */
  function installAll() {
    document.querySelectorAll('#playerFrame iframe, #videoIframe').forEach(makeShield);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installAll);
  } else {
    installAll();
  }

  var mo = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        if (n.tagName === 'IFRAME') setTimeout(function () { makeShield(n); }, 0);
        else if (n.querySelectorAll) n.querySelectorAll('iframe').forEach(function (f) {
          setTimeout(function () { makeShield(f); }, 0);
        });
      });
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      mo.observe(document.body, { childList: true, subtree: true });
    });
  } else {
    mo.observe(document.body, { childList: true, subtree: true });
  }

})();
