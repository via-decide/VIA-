/* router.js — ViaDecide Universal Router (hash + path + overlay)
   Public API: VDRouter.go, VDRouter.openOverlay, VDRouter.navigate, VDRouter.prefetch,
               VDRouter.resolve, VDRouter.on, VDRouter.routes, VDRouter.bindLinks, VDRouter.init

   Defaults:
   - AUTO mode chooses HASH unless the app is controlled by a Service Worker (PWA), then PATH.
   - Override with window.__VD_ROUTER_MODE__ = 'hash' | 'path'
*/

(function () {
  "use strict";

  // ───────────────────────────────────────────────────────────────
  // 0) BASE PATH DETECTION (supports /repo/ deployments)
  // ───────────────────────────────────────────────────────────────
  function detectBasePath() {
    try {
      var cs = document.currentScript;
      var src = cs && cs.getAttribute("src");
      if (!src) {
        var scripts = document.getElementsByTagName("script");
        for (var i = scripts.length - 1; i >= 0; i--) {
          var s = scripts[i].getAttribute("src") || "";
          if (s.indexOf("router.js") !== -1) { src = s; break; }
        }
      }
      if (!src) return "";
      // handle absolute URLs
      if (/^https?:\/\//i.test(src)) src = new URL(src).pathname;
      // src like "/decide.engine/router.js" => base "/decide.engine"
      src = src.split("?")[0].split("#")[0];
      var base = src.replace(/\/router\.js$/i, "");
      // if base is "/" then empty
      if (base === "/") base = "";
      return base;
    } catch (e) {
      return "";
    }
  }

  var BASE_PATH = (window.__VD_BASE_PATH__ != null ? String(window.__VD_BASE_PATH__) : detectBasePath()) || "";
  if (BASE_PATH && !BASE_PATH.startsWith("/")) BASE_PATH = "/" + BASE_PATH;
  if (BASE_PATH.endsWith("/")) BASE_PATH = BASE_PATH.slice(0, -1);

  function withBase(p) {
    p = String(p || "");
    if (!p.startsWith("/")) p = "/" + p;
    return BASE_PATH + p;
  }

  function stripBase(pathname) {
    pathname = String(pathname || "/");
    if (!BASE_PATH) return pathname || "/";
    if (pathname.indexOf(BASE_PATH + "/") === 0) return pathname.slice(BASE_PATH.length);
    if (pathname === BASE_PATH) return "/";
    return pathname;
  }

  // ───────────────────────────────────────────────────────────────
  // 1) ROUTES (slug/path -> file)
  // ───────────────────────────────────────────────────────────────
  var ROUTES = {
    "/":                                    "/index.html",
    "/404":                                 "/404/index.html",
    "/AshokVerma":                          "/AshokVerma/index.html",
    "/CustomSwipeEngineForm":               "/CustomSwipeEngineForm/index.html",
    "/engine-activation-request":           "/engine-activation-request/index.html",
    "/HexWars":                             "/HexWars/index.html",
    "/HivaLand":                            "/HivaLand/index.html",
    "/Jalaram-food-court-rajkot":           "/Jalaram-food-court-rajkot/index.html",
    "/ONDC-demo":                           "/ONDC-demo/index.html",
    "/ondc-demo":                           "/ONDC-demo/index.html",
    "/StudyOS":                             "/StudyOS/index.html",
    "/SwipeOS":                             "/SwipeOS/index.html",
    "/the-decision-stack":                  "/the-decision-stack/index.html",
    "/ViaGuide":                            "/ViaGuide/index.html",
    "/Viadecide-blogs":                     "/Viadecide-blogs/index.html",
    "/alchemist":                           "/alchemist/index.html",
    "/app-generator":                       "/app-generator/index.html",
    "/brief":                               "/brief/index.html",
    "/cashback-claim":                      "/cashback-claim/index.html",
    "/cashback-rules":                      "/cashback-rules/index.html",
    "/cohort-apply-here":                   "/cohort-apply-here/index.html",
    "/contact":                             "/contact/index.html",
    "/decide-foodrajkot":                   "/decide-foodrajkot/index.html",
    "/decide-service":                      "/decide-service/index.html",
    "/decision-brief-guide":                "/decision-brief-guide/index.html",
    "/decision-brief":                      "/decision-brief/index.html",
    "/decision-infrastructure-india":       "/decision-infrastructure-india/index.html",
    "/discounts":                           "/discounts/index.html",
    "/engine-deals":                        "/engine-deals/index.html",
    "/engine-license":                      "/engine-license/index.html",
    "/finance-dashboard-msme":              "/finance-dashboard-msme/index.html",
    "/founder":                             "/founder/index.html",
    "/indiaai-mission-2025":                "/indiaai-mission-2025/index.html",
    "/interview-prep":                      "/interview-prep/index.html",
    "/laptops-under-50000":                 "/laptops-under-50000/index.html",
    "/mars-rover-simulator-game":           "/mars-rover-simulator-game/index.html",
    "/memory":                              "/memory/index.html",
    "/multi-source-research-explained":     "/multi-source-research-explained/index.html",
    "/ondc-for-bharat":                     "/ondc-for-bharat/index.html",
    "/payment-register":                    "/payment-register/index.html",
    "/pricing":                             "/pricing/index.html",
    "/privacy":                             "/privacy/index.html",
    "/prompt-alchemy":                      "/prompt-alchemy/index.html",
    "/sales-dashboard":                     "/sales-dashboard/index.html",
    "/student-research":                    "/student-research/index.html",
    "/terms":                               "/terms/index.html",
    "/viadecide-decision-matrix":           "/viadecide-decision-matrix/index.html",
    "/viadecide-opportunity-radar":         "/viadecide-opportunity-radar/index.html",
    "/viadecide-public-beta":               "/viadecide-public-beta/index.html",
    "/viadecide-reality-check":             "/viadecide-reality-check/index.html",
    "/why-small-businesses-dont-need-saas": "/why-small-businesses-dont-need-saas/index.html",

    // Store (PrintByDD) — these are standalone pages
    "/printbydd-store":                     "/printbydd-store/index.html",
    "/numberplate":                         "/printbydd-store/numberplate.html",
    "/keychain":                            "/printbydd-store/keychain.html",
    "/gifts-that-mean-more":                "/printbydd-store/gifts-that-mean-more.html"
  };

  // Store pages should NOT be SPA-fetched/swapped.
  function isStandaloneFile(file) {
    file = String(file || "");
    return (
      file.indexOf("/printbydd-store/") === 0 ||
      /\.pdf$/i.test(file)
    );
  }

  // ───────────────────────────────────────────────────────────────
  // 2) META (optional: overlay header if caller doesn’t supply)
  // ───────────────────────────────────────────────────────────────
  var META = {
    "ondc-demo": { icon: "🛒", name: "ONDC Live Demo" },
    "ONDC-demo": { icon: "🛒", name: "ONDC Live Demo" },
    "alchemist": { icon: "✨", name: "Alchemist" },
    "finance-dashboard-msme": { icon: "💰", name: "FinTrack — Finance Dashboard" },
    "sales-dashboard": { icon: "📊", name: "MSME Sales Register" },
    "interview-prep": { icon: "🎤", name: "Interview Simulator" },
    "Viadecide-blogs": { icon: "✍️", name: "ViaDecide Blogs" },
    "pricing": { icon: "💰", name: "Pricing" },
    "contact": { icon: "📬", name: "Contact" },
    "privacy": { icon: "🔒", name: "Privacy" },
    "terms": { icon: "📜", name: "Terms" },
    "founder": { icon: "👤", name: "Founder" },
    "numberplate": { icon: "🚗", name: "Numberplates" },
    "keychain": { icon: "🔑", name: "NFC Keychains" },
    "gifts-that-mean-more": { icon: "🎁", name: "Gifts That Mean More" }
  };

  // ───────────────────────────────────────────────────────────────
  // 3) MODE (hash vs path)
  // ───────────────────────────────────────────────────────────────
  function hasSWControl() {
    try { return !!(navigator.serviceWorker && navigator.serviceWorker.controller); }
    catch (e) { return false; }
  }
  var MODE = (window.__VD_ROUTER_MODE__ || "auto").toLowerCase();
  if (MODE !== "hash" && MODE !== "path") {
    // AUTO: safest default is HASH unless PWA (SW-controlled), then PATH.
    MODE = hasSWControl() ? "path" : "hash";
  }

  // ───────────────────────────────────────────────────────────────
  // 4) EVENTS
  // ───────────────────────────────────────────────────────────────
  var _handlers = {};
  function on(ev, fn) { (_handlers[ev] = _handlers[ev] || []).push(fn); }
  function emit(ev, data) {
    var arr = _handlers[ev] || [];
    for (var i = 0; i < arr.length; i++) { try { arr[i](data); } catch (e) {} }
  }

  // ───────────────────────────────────────────────────────────────
  // 5) RESOLVE
  // ───────────────────────────────────────────────────────────────
  function cleanSlug(s) {
    s = String(s || "");
    s = s.replace(/^#+/, "");
    s = s.replace(/^\//, "");
    s = s.replace(/\.html?$/i, "");
    s = s.replace(/\/+$/, "");
    return s;
  }

  function resolve(slugOrPath) {
    var s = String(slugOrPath || "");
    // If caller passes "/foo" keep as path; if "foo" convert to "/foo"
    var path = s.startsWith("/") ? s : ("/" + cleanSlug(s));
    // Normalize root
    if (path === "/") return ROUTES["/"] || "/index.html";
    // Strip .html if someone passes it
    path = path.replace(/\.html?$/i, "");
    // If route exists, return it
    if (ROUTES[path]) return ROUTES[path];
    // Default convention: "/slug/index.html"
    return path + "/index.html";
  }

  // ───────────────────────────────────────────────────────────────
  // 6) PREFETCH
  // ───────────────────────────────────────────────────────────────
  var _prefetched = {};
  function prefetch(slugOrPath) {
    var file = resolve(slugOrPath);
    var href = withBase(file);
    if (_prefetched[href]) return;
    _prefetched[href] = 1;
    try {
      var l = document.createElement("link");
      l.rel = "prefetch";
      l.as = "document";
      l.href = href;
      document.head.appendChild(l);
    } catch (e) {}
  }

  // ───────────────────────────────────────────────────────────────
  // 7) OVERLAY (iframe modal owned by index.html)
  // ───────────────────────────────────────────────────────────────
  function openOverlay(fileOrSlug, opts) {
    opts = opts || {};

    var file = /\.html?$/i.test(String(fileOrSlug)) ? String(fileOrSlug) : resolve(fileOrSlug);
    var slug = String(file).replace(/^\/+/, "").replace(/\/index\.html?$/i, "").replace(/\.html?$/i, "");

    var meta = META[slug] || {};
    var icon = meta.icon || "🔬";
    var name = meta.name || slug.replace(/-/g, " ");

    if (opts.title) {
      // index.html passes "🛒\u2009ONDC Live Demo"
      var t = String(opts.title).trim();
      var m = t.match(/^([\S\u200A\u2009]+)\s+([\s\S]+)$/);
      if (m) { icon = meta.icon || m[1]; name = meta.name || m[2]; }
      else { name = meta.name || t; }
    }

    var modal = document.getElementById("modal");
    var frame = document.getElementById("modal-frame");
    if (!modal || !frame) { window.location.href = withBase(file); return; }

    function el(id) { return document.getElementById(id); }
    if (el("m-icon")) el("m-icon").textContent = icon;
    if (el("m-name")) el("m-name").textContent = name;
    if (el("m-tab")) el("m-tab").href = withBase(file);
    if (el("err-open-link")) el("err-open-link").href = withBase(file);
    if (el("modal-err")) el("modal-err").classList.remove("show");
    if (el("modal-loading")) el("modal-loading").classList.add("active");

    frame.style.display = "block";
    frame.src = "";
    setTimeout(function () { frame.src = withBase(file); }, 10);

    modal.classList.add("open");
    document.body.style.overflow = "hidden";

    emit("overlayopen", { file: file, slug: slug, icon: icon, name: name });
  }

  // ───────────────────────────────────────────────────────────────
  // 8) NAVIGATION CORE
  // ───────────────────────────────────────────────────────────────
  function parseTargetFromHash() {
    // "#/pricing?x=1"
    var h = location.hash || "";
    var m = h.match(/^#\/([^?]*)/);
    var slug = m ? m[1] : "";
    slug = slug.replace(/^\/+/, "").replace(/\/+$/, "");
    return "/" + (slug || "");
  }

  function currentPathNoBase() {
    return stripBase(location.pathname || "/") || "/";
  }

  function setURLForPath(path) {
    path = String(path || "/");
    if (!path.startsWith("/")) path = "/" + path;
    if (MODE === "hash") {
      var slug = path === "/" ? "" : path.replace(/^\/+/, "");
      var newHash = "#/" + slug;
      if (location.hash !== newHash) location.hash = newHash;
    } else {
      var full = withBase(path);
      history.pushState({}, "", full + location.search + location.hash);
    }
  }

  function execScripts(container) {
    var scripts = container.querySelectorAll("script");
    for (var i = 0; i < scripts.length; i++) {
      var old = scripts[i];
      var neo = document.createElement("script");
      for (var j = 0; j < old.attributes.length; j++) {
        var a = old.attributes[j];
        neo.setAttribute(a.name, a.value);
      }
      neo.textContent = old.textContent;
      old.parentNode.replaceChild(neo, old);
    }
  }

  function navigate(path, isPopState) {
    path = String(path || "/");
    if (!path.startsWith("/")) path = "/" + path;
    // Normalize "/foo/" => "/foo"
    if (path.length > 1) path = path.replace(/\/+$/, "");

    var file = resolve(path);

    // Standalone (store) => full navigation
    if (isStandaloneFile(file)) {
      window.location.href = withBase(file);
      return;
    }

    // In HASH mode, keep URL as hash for safety; in PATH mode, pushState
    if (!isPopState) {
      if (MODE === "hash") {
        var slug = path === "/" ? "" : path.replace(/^\/+/, "");
        location.hash = "#/" + slug;
      } else {
        history.pushState({}, "", withBase(path));
      }
    }

    // Fetch + swap only if target page has #app
    fetch(withBase(file), { credentials: "same-origin" })
      .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var newApp = doc.querySelector("#app");
        var curApp = document.querySelector("#app");

        if (!newApp || !curApp) {
          window.location.href = withBase(file);
          return;
        }

        // Merge styles (avoid duplicate link href)
        var nodes = doc.querySelectorAll('link[rel="stylesheet"],style');
        for (var i = 0; i < nodes.length; i++) {
          var n = nodes[i];
          if (n.tagName === "LINK") {
            var href = n.getAttribute("href");
            if (!href) continue;
            // make href absolute to base if it starts with "/"
            var key = href;
            if (!document.querySelector('link[rel="stylesheet"][href="' + key + '"]')) {
              document.head.appendChild(n.cloneNode(true));
            }
          } else {
            document.head.appendChild(n.cloneNode(true));
          }
        }

        curApp.innerHTML = newApp.innerHTML;
        if (doc.title) document.title = doc.title;

        window.scrollTo(0, 0);
        execScripts(curApp);

        emit("routechange", { path: path, file: file });
      })
      .catch(function (e) {
        console.error("[VDRouter] navigate failed:", e);
        // hard fallback
        window.location.href = withBase(file);
      });
  }

  function go(slugOrPath, opts) {
    opts = opts || {};
    var s = String(slugOrPath || "");
    // allow passing "/foo" or "foo"
    var path = s.startsWith("/") ? s : ("/" + cleanSlug(s));
    // allow "index" to mean "/"
    if (path === "/index") path = "/";

    if (opts.overlay) {
      openOverlay(path, opts);
      return;
    }

    // If route unknown, still try conventional file
    navigate(path, false);
  }

  // ───────────────────────────────────────────────────────────────
  // 9) LINK BINDING (intercept internal links)
  // ───────────────────────────────────────────────────────────────
  var ASSET_EXT_RE = /\.(pdf|png|jpg|jpeg|gif|svg|css|js|mjs|json|glb|gltf|stl|zip|mp4|webm|webp|ico|woff2?|ttf|otf)$/i;

  function bindLinks() {
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (!a) return;

      var href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (/^(mailto|tel):/i.test(href)) return;
      if (a.hasAttribute("download")) return;
      if (a.target === "_blank") return;

      var url;
      try { url = new URL(href, location.href); } catch (ex) { return; }
      if (url.origin !== location.origin) return;

      var pathname = stripBase(url.pathname);
      // assets or standalone store: allow default navigation
      if (ASSET_EXT_RE.test(pathname) || pathname.indexOf("/printbydd-store") === 0) return;

      e.preventDefault();

      if (MODE === "hash") {
        // convert "/pricing" -> "#/pricing"
        var p = pathname.replace(/\/+$/, "") || "/";
        var slug = p === "/" ? "" : p.replace(/^\/+/, "");
        location.hash = "#/" + slug;
      } else {
        navigate(pathname + url.search + url.hash, false);
      }
    }, true);
  }

  // ───────────────────────────────────────────────────────────────
  // 10) INIT
  // ───────────────────────────────────────────────────────────────
  function init() {
    bindLinks();

    if (MODE === "hash") {
      window.addEventListener("hashchange", function () {
        var p = parseTargetFromHash();
        navigate(p, true);
      });

      // initial
      var initial = parseTargetFromHash();
      if (initial !== "/") navigate(initial, true);
    } else {
      window.addEventListener("popstate", function () {
        navigate(currentPathNoBase(), true);
      });

      // initial: handle direct /slug loads inside the PWA / SW fallback
      var p0 = currentPathNoBase().replace(/\/+$/, "") || "/";
      if (p0 !== "/") navigate(p0, true);
    }

    emit("ready", { mode: MODE, base: BASE_PATH, routeCount: Object.keys(ROUTES).length });
  }

  // ───────────────────────────────────────────────────────────────
  // 11) EXPORT
  // ───────────────────────────────────────────────────────────────
  window.VDRouter = window.AppRouter = {
    go: go,
    navigate: navigate,
    openOverlay: openOverlay,
    prefetch: prefetch,
    resolve: resolve,
    on: on,
    bindLinks: bindLinks,
    init: init,
    routes: function () { return ROUTES; },
    meta: function () { return META; },
    mode: function () { return MODE; },
    base: function () { return BASE_PATH; }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
