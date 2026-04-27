// easierLet — Portal helpers
//
// Loaded by every authenticated page (tenant + landlord). Provides:
//   - A Supabase client (loaded from CDN) on window.ELP.client
//   - Session helpers (require / load)
//   - Authenticated REST + Edge Function callers that send the user JWT
//   - Shared UI shell (sidebar/header) so portal pages stay thin
//
// Keeping it ESM-CDN free of bundlers — fits the rest of the site.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = "https://ffzknvcptqjlkxmkdxuk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmemtudmNwdHFqbGt4bWtkeHVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTQ0ODQsImV4cCI6MjA5MDgzMDQ4NH0.YRdkBgoVm7cpUJlsK8T4nP6iNE3vgfOmODImiAkPhr4";

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "el-portal-session",
  },
});

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

async function getSession() {
  const { data } = await client.auth.getSession();
  return data?.session ?? null;
}

async function requireSession(loginUrl) {
  const session = await getSession();
  if (!session) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace(`${loginUrl}?next=${next}`);
    return null;
  }
  return session;
}

async function signOut(redirectTo = "/") {
  await client.auth.signOut();
  window.location.replace(redirectTo);
}

// ---------------------------------------------------------------------------
// Authenticated REST / Edge Function calls
//
// PostgREST honours RLS based on the JWT in Authorization, so authenticated
// reads/writes against tables like property_listings, viewing_requests etc.
// just work — provided RLS policies allow it for that user.
// ---------------------------------------------------------------------------

async function authedFetch(url, init = {}) {
  const session = await getSession();
  const headers = new Headers(init.headers || {});
  headers.set("apikey", SUPABASE_ANON_KEY);
  headers.set("Authorization", `Bearer ${session?.access_token ?? SUPABASE_ANON_KEY}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, { ...init, headers });
}

async function rest(path, init = {}) {
  const res = await authedFetch(`${SUPABASE_URL}/rest/v1/${path}`, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`REST ${res.status}: ${text || res.statusText}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function callFn(name, body, method = "POST") {
  const res = await authedFetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function gbp(n) {
  if (n == null || n === "") return "—";
  return "£" + Math.round(Number(n)).toLocaleString("en-GB");
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function esc(s) {
  if (s == null) return "";
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// ---------------------------------------------------------------------------
// Portal shell — renders the standard sidebar + header on the page.
//
// Usage in HTML:
//   <div id="portal-shell"
//        data-role="landlord"
//        data-active="listings"
//        data-title="Listings"></div>
// Then call ELP.mountShell() once auth is verified.
// ---------------------------------------------------------------------------

const NAV = {
  tenant: [
    { href: "/tenant/", id: "home",         label: "Overview",      icon: "home" },
    { href: "/tenant/?tab=applications", id: "applications", label: "My applications", icon: "file" },
    { href: "/tenant/?tab=viewings",     id: "viewings",     label: "Viewings",        icon: "eye" },
    { href: "/tenant/?tab=tenancy",      id: "tenancy",      label: "My tenancy",      icon: "key" },
    { href: "/tenant/?tab=documents",    id: "documents",    label: "Documents",       icon: "doc" },
  ],
  landlord: [
    { href: "/landlord/",                  id: "home",         label: "Dashboard",       icon: "home" },
    { href: "/landlord/properties/",       id: "properties",   label: "Properties",      icon: "building" },
    { href: "/landlord/?tab=listings",     id: "listings",     label: "Listings",        icon: "house" },
    { href: "/landlord/?tab=viewings",     id: "viewings",     label: "Viewing requests",icon: "eye" },
    { href: "/landlord/?tab=tenants",      id: "tenants",      label: "Tenants",         icon: "users" },
    { href: "/landlord/?tab=tenancies",    id: "tenancies",    label: "Tenancies",       icon: "key" },
    { href: "/landlord/inventory/",        id: "inventory",    label: "Inventories",     icon: "checklist" },
    { href: "/landlord/maintenance/",      id: "maintenance",  label: "Maintenance",     icon: "wrench" },
    { href: "/landlord/?tab=transactions", id: "transactions", label: "Transactions",    icon: "coins" },
    { href: "/landlord/?tab=documents",    id: "documents",    label: "Documents",       icon: "doc" },
    { href: "/landlord/loan/",             id: "loan",         label: "Director's loan", icon: "coins" },
    { href: "/landlord/useful-links/",     id: "useful-links", label: "Useful links",    icon: "link" },
    { href: "/billing/",                   id: "billing",      label: "Billing",         icon: "coins" },
  ],
};

const ICONS = {
  home:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 3l9 9"/><path d="M5 10v10h14V10"/></svg>',
  house: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 3l9 9"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>',
  file:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  eye:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  key:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="M10.5 12.5L21 2"/><path d="M16 7l3 3"/></svg>',
  doc:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
  coins: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1115.63 22"/><path d="M7 6h2a2 2 0 010 4H7v4"/><path d="M9 12h-2"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1"/><line x1="9" y1="7" x2="9" y2="7"/><line x1="15" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="9" y2="11"/><line x1="15" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="9" y2="15"/><line x1="15" y1="15" x2="15" y2="15"/><path d="M10 21V18a2 2 0 014 0v3"/></svg>',
  checklist: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',
  wrench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 005.4 5.4l-9.6 9.6a2 2 0 01-2.8-2.8l9.6-9.6a4 4 0 00-2.6-2.6"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.7-1.7"/></svg>',
};

function mountShell({ user } = {}) {
  const root = document.getElementById("portal-shell");
  if (!root) return;
  const role = root.dataset.role;
  const active = root.dataset.active;
  const title = root.dataset.title || "";
  const items = NAV[role] || [];

  const userLabel = user?.email || user?.user_metadata?.name || "Account";

  root.innerHTML = `
    <header class="elp-topbar">
      <div class="elp-topbar-inner">
        <button class="elp-menu-btn" id="elp-menu-btn" aria-label="Menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <a href="/" class="elp-brand"><span class="e">easier</span><span class="l">Let</span></a>
        <div class="elp-spacer"></div>
        <div class="elp-user" id="elp-user-menu">
          <button class="elp-user-btn">
            <span class="elp-user-avatar">${esc(userLabel.charAt(0).toUpperCase())}</span>
            <span class="elp-user-label">${esc(userLabel)}</span>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="elp-user-dropdown" id="elp-user-dropdown">
            <a href="/${role}/?tab=settings">Account settings</a>
            <button class="elp-signout" id="elp-signout">Sign out</button>
          </div>
        </div>
      </div>
    </header>
    <aside class="elp-sidebar" id="elp-sidebar">
      <div class="elp-sidebar-section">
        <div class="elp-sidebar-label">${role === "landlord" ? "Landlord" : "Tenant"} portal</div>
        <nav class="elp-nav">
          ${items.map((it) => `
            <a href="${it.href}" class="elp-nav-item ${it.id === active ? "active" : ""}" data-tab="${it.id}">
              <span class="elp-nav-icon">${ICONS[it.icon] || ""}</span>
              <span>${esc(it.label)}</span>
            </a>
          `).join("")}
        </nav>
      </div>
      <div class="elp-sidebar-foot">
        <a href="/" class="elp-sidebar-link">&larr; Back to easierLet</a>
      </div>
    </aside>
  `;

  // Wire up menu and user dropdown
  document.getElementById("elp-menu-btn")?.addEventListener("click", () => {
    document.getElementById("elp-sidebar")?.classList.toggle("open");
  });
  const userMenu = document.getElementById("elp-user-menu");
  const userDropdown = document.getElementById("elp-user-dropdown");
  userMenu?.querySelector(".elp-user-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown?.classList.toggle("open");
  });
  document.addEventListener("click", () => userDropdown?.classList.remove("open"));
  document.getElementById("elp-signout")?.addEventListener("click", () => signOut("/"));

  if (title) document.title = `${title} — easierLet`;
}

// ---------------------------------------------------------------------------
// Tab routing — read ?tab= and update sections with [data-tab].
// Hooks elements with .elp-tab-link to switch tabs without reload.
// ---------------------------------------------------------------------------
function initTabs(defaultTab) {
  const u = new URL(window.location.href);
  const initial = u.searchParams.get("tab") || defaultTab;
  showTab(initial);
  document.querySelectorAll(".elp-tab-link").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = el.dataset.tab;
      const url = new URL(window.location.href);
      if (tab === defaultTab) url.searchParams.delete("tab");
      else url.searchParams.set("tab", tab);
      window.history.pushState({}, "", url);
      showTab(tab);
    });
  });
  window.addEventListener("popstate", () => {
    const t = new URL(window.location.href).searchParams.get("tab") || defaultTab;
    showTab(t);
  });
}

function showTab(tab) {
  document.querySelectorAll("[data-tab-panel]").forEach((el) => {
    el.style.display = el.dataset.tabPanel === tab ? "" : "none";
  });
  document.querySelectorAll(".elp-nav-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.tab === tab);
  });
  // Fire a custom event so pages can lazy-load panel data on first visit.
  window.dispatchEvent(new CustomEvent("elp:tab", { detail: { tab } }));
}

// ---------------------------------------------------------------------------
// Toast — minimal feedback for portal actions.
// ---------------------------------------------------------------------------
function toast(message, kind = "info") {
  let host = document.getElementById("elp-toast-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "elp-toast-host";
    document.body.appendChild(host);
  }
  const el = document.createElement("div");
  el.className = `elp-toast elp-toast-${kind}`;
  el.textContent = message;
  host.appendChild(el);
  setTimeout(() => el.classList.add("show"), 10);
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 200);
  }, 3500);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
window.ELP = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  client,
  getSession,
  requireSession,
  signOut,
  rest,
  callFn,
  authedFetch,
  gbp,
  fmtDate,
  fmtDateTime,
  esc,
  mountShell,
  initTabs,
  showTab,
  toast,
};
