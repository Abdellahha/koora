/* tv-nav.js — lets a TV remote's arrow + OK/Enter buttons drive the whole site,
   no mouse/touch needed. Works by spatial navigation between focusable items. */
(function () {
  var SEL = '.channel,.glass-btn,.card,.team-btn,.watch-btn,.dd-item,.back-link,a,button,input';

  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    var cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') return false;
    if (el.disabled) return false;
    // skip things hidden inside a closed collapsible (max-height:0)
    var p = el.parentElement;
    while (p) {
      var pcs = getComputedStyle(p);
      if (pcs.display === 'none' || pcs.visibility === 'hidden') return false;
      if (p.classList && p.classList.contains('team-list') && !p.classList.contains('open')) return false;
      p = p.parentElement;
    }
    return true;
  }

  function ensureFocusable() {
    var nodes = document.querySelectorAll(SEL);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!el.hasAttribute('tabindex') && el.tagName !== 'BUTTON' && el.tagName !== 'A' && el.tagName !== 'INPUT') {
        el.setAttribute('tabindex', '0');
      }
    }
  }

  function getFocusable() {
    return Array.prototype.filter.call(document.querySelectorAll(SEL), visible);
  }

  function focusFirst() {
    var els = getFocusable();
    if (els.length) els[0].focus();
  }

  function move(dir) {
    var els = getFocusable();
    var current = document.activeElement;
    if (els.indexOf(current) === -1) { focusFirst(); return; }
    var cr = current.getBoundingClientRect();
    var cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
    var best = null, bestScore = Infinity;
    els.forEach(function (el) {
      if (el === current) return;
      var r = el.getBoundingClientRect();
      var ex = r.left + r.width / 2, ey = r.top + r.height / 2;
      var dx = ex - cx, dy = ey - cy;
      var primary, ortho, valid;
      if (dir === 'left') { valid = dx < -1; primary = -dx; ortho = Math.abs(dy); }
      else if (dir === 'right') { valid = dx > 1; primary = dx; ortho = Math.abs(dy); }
      else if (dir === 'up') { valid = dy < -1; primary = -dy; ortho = Math.abs(dx); }
      else { valid = dy > 1; primary = dy; ortho = Math.abs(dx); }
      if (!valid) return;
      var score = primary + ortho * 2.2;
      if (score < bestScore) { bestScore = score; best = el; }
    });
    if (best) best.focus();
  }

  function onKeydown(e) {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); move('down'); break;
      case 'ArrowUp': e.preventDefault(); move('up'); break;
      case 'ArrowLeft': e.preventDefault(); move('left'); break;
      case 'ArrowRight': e.preventDefault(); move('right'); break;
      case 'Enter':
      case ' ':
        if (document.activeElement && document.activeElement !== document.body) {
          e.preventDefault();
          document.activeElement.click();
        }
        break;
    }
  }

  function init() {
    ensureFocusable();
    document.addEventListener('keydown', onKeydown);
    focusFirst();
    // Re-scan whenever the page swaps content in (channel lists, dropdowns, etc.)
    var obs = new MutationObserver(function () { ensureFocusable(); });
    obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 200);
  } else {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 200); });
  }
})();