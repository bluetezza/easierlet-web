// cookie-banner.js — essential-cookies notice for public pages (UK PECR / UK GDPR).
//
// EasierLet only uses essential/functional cookies (auth session storage).
// Do NOT add analytics, advertising, or tracking cookies without updating
// this notice and obtaining proper consent first.
//
// Usage: <script src="/assets/cookie-banner.js" defer></script> on public
// pages only. Portal pages (/landlord/, /tenant/) are excluded automatically.

(function () {
  var KEY = "el_cookie_consent";
  var path = window.location.pathname;
  if (path.indexOf("/landlord/") === 0 || path.indexOf("/tenant/") === 0) return;
  try {
    if (localStorage.getItem(KEY) === "accepted") return;
  } catch (e) { return; } // storage blocked — can't remember consent, skip banner

  function mount() {
    var banner = document.createElement("div");
    banner.id = "el-cookie-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Cookie notice");
    banner.style.cssText =
      "position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#194D3A;color:#fff;" +
      "padding:14px 18px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;" +
      "gap:10px 18px;font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;" +
      "box-shadow:0 -2px 12px rgba(0,0,0,0.18);";
    banner.innerHTML =
      '<span>We use essential cookies to make this site work. By continuing, you agree to our use of cookies.</span>' +
      '<span style="display:inline-flex;gap:10px;align-items:center;">' +
      '<a href="/privacy/" style="color:#CFE8DC;text-decoration:underline;">Learn more</a>' +
      '<button id="el-cookie-accept" style="background:#fff;color:#194D3A;border:none;border-radius:8px;' +
      'padding:8px 18px;font-weight:600;font-size:14px;cursor:pointer;">Accept</button></span>';
    document.body.appendChild(banner);
    document.getElementById("el-cookie-accept").addEventListener("click", function () {
      try { localStorage.setItem(KEY, "accepted"); } catch (e) { /* ignore */ }
      banner.remove();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
