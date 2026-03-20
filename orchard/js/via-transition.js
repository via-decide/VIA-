(function (global) {
  'use strict';

  var OVERLAY_ID = 'via-transition-overlay';

  function canTransition() {
    return typeof document !== 'undefined' && document.body;
  }

  function shouldHandleUrl(url) {
    var value = String(url || '').trim();
    if (!value || value.indexOf('javascript:') === 0 || value.indexOf('mailto:') === 0 || value.indexOf('tel:') === 0) {
      return false;
    }
    var target;
    try {
      target = new URL(value, global.location.href);
    } catch (_error) {
      return false;
    }
    if (target.origin !== global.location.origin) return false;
    if (target.pathname === global.location.pathname && target.search === global.location.search && target.hash) {
      return false;
    }
    var pathname = target.pathname || '';
    if (pathname === global.location.pathname) return true;
    if (/\.html$/.test(pathname) || /\/$/.test(pathname)) return true;
    return !/\/[^/]+\.[^/]+$/.test(pathname);
  }

  function removeExistingOverlay() {
    var existing = document.getElementById(OVERLAY_ID);
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
  }

  function navigateWithTransition(url) {
    if (!shouldHandleUrl(url) || !canTransition()) {
      global.location.href = url;
      return;
    }

    removeExistingOverlay();

    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = '#050505';
    overlay.style.zIndex = '9999';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.25s ease';
    overlay.style.pointerEvents = 'all';
    overlay.innerHTML = '\n      <div style="\n        position:absolute;\n        top:50%;\n        left:50%;\n        transform:translate(-50%,-50%);\n        color:#ff671f;\n        font-weight:700;\n        font-family:sans-serif;\n        letter-spacing:0.18em;\n      ">\n        VIA\n      </div>\n    ';

    document.body.appendChild(overlay);

    requestAnimationFrame(function () {
      overlay.style.opacity = '1';
    });

    global.setTimeout(function () {
      global.location.href = url;
    }, 200);
  }

  function bindAnchors() {
    document.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
      if (!link || link.hasAttribute('download') || link.getAttribute('target') === '_blank' || link.hasAttribute('data-no-transition')) {
        return;
      }
      var href = link.getAttribute('href') || '';
      if (!shouldHandleUrl(href)) return;
      event.preventDefault();
      navigateWithTransition(link.href);
    });
  }

  global.VIATransition = {
    navigate: navigateWithTransition
  };

  bindAnchors();

  global.addEventListener('load', function () {
    if (!document.body) return;
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';

    requestAnimationFrame(function () {
      document.body.style.opacity = '1';
    });
  });
})(window);
