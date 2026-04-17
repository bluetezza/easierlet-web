// easierLet — shared JS helpers loaded by all public pages

const SUPABASE_URL = "https://ffzknvcptqjlkxmkdxuk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmemtudmNwdHFqbGt4bWtkeHVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTQ0ODQsImV4cCI6MjA5MDgzMDQ4NH0.YRdkBgoVm7cpUJlsK8T4nP6iNE3vgfOmODImiAkPhr4";

window.EL = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,

  // Functions endpoint
  fn: (name) => `${SUPABASE_URL}/functions/v1/${name}`,

  // REST query — read-only, anon-authenticated
  rest: async (path) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) throw new Error(`REST ${res.status}`);
    return res.json();
  },

  // Call an RPC function (for increment_listing_view etc.)
  rpc: async (name, params) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params ?? {}),
    });
    if (!res.ok) throw new Error(`RPC ${res.status}`);
    try { return await res.json(); } catch { return null; }
  },

  // Call an Edge Function (public endpoints, no auth required)
  callFn: async (name, body) => {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  },

  // Format currency
  gbp: (n) => {
    if (n == null) return "—";
    return "£" + Math.round(Number(n)).toLocaleString("en-GB");
  },

  // Format a YYYY-MM-DD date as "15 Jun 2026"
  formatDate: (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  },

  // HTML-escape
  esc: (s) => {
    if (s == null) return "";
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  },

  // Wire up all "Why we ask" toggles on the page
  wireWhyToggles: () => {
    document.querySelectorAll("[data-why]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById(btn.getAttribute("data-why"));
        if (target) target.classList.toggle("open");
      });
    });
  },
};
