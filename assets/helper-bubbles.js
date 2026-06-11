// helper-bubbles.js — ELBubbles: contextual in-app guidance for the portal.
//
// Usage (portal pages, after ELP is available):
//   ELBubbles.render("listing_editor", hostElement?)
//     — renders all active, non-dismissed bubbles for a screen. process_guide
//       bubbles go to the top of the host (or [data-bubble-host]); field_hint
//       bubbles render into [data-bubble-slot="<key>"] when present, else
//       after the process guides.
//   ELBubbles.dismiss(key) — local (localStorage) + helper_bubble_dismissals upsert.
//
// Respects profiles.show_helper_bubbles (cached for the session).

window.ELBubbles = (function () {
  const LS_PREFIX = "bubble_dismissed_";

  function isDismissedLocally(key) {
    try { return localStorage.getItem(LS_PREFIX + key) === "1"; } catch (_e) { return false; }
  }
  function markDismissedLocally(key) {
    try { localStorage.setItem(LS_PREFIX + key, "1"); } catch (_e) { /* ignore */ }
  }

  async function showBubblesEnabled(userId) {
    try {
      const cached = sessionStorage.getItem("el_show_bubbles");
      if (cached !== null) return cached === "1";
      const rows = await ELP.rest(`profiles?id=eq.${userId}&select=show_helper_bubbles&limit=1`);
      const enabled = rows?.[0]?.show_helper_bubbles !== false;
      sessionStorage.setItem("el_show_bubbles", enabled ? "1" : "0");
      return enabled;
    } catch (_e) { return true; }
  }

  async function fetchRemoteDismissals(userId) {
    try {
      const rows = await ELP.rest(`helper_bubble_dismissals?user_id=eq.${userId}&select=bubble_key`);
      (rows ?? []).forEach((r) => markDismissedLocally(r.bubble_key));
    } catch (_e) { /* offline-tolerant */ }
  }

  async function dismiss(key) {
    markDismissedLocally(key);
    const el = document.querySelector(`[data-bubble-key="${key}"]`);
    if (el) el.remove();
    try {
      const session = await ELP.getSession();
      if (!session) return;
      await ELP.rest(`helper_bubble_dismissals`, {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ user_id: session.user.id, bubble_key: key }),
      });
    } catch (_e) { /* local dismissal still holds */ }
  }

  function bubbleEl(b) {
    const div = document.createElement("div");
    div.className = `el-helper-bubble ${b.bubble_type === "process_guide" ? "process-guide" : "field-hint"}`;
    div.setAttribute("data-bubble-key", b.key);
    const icon = b.bubble_type === "process_guide" ? "ℹ️" : "💡";
    div.innerHTML =
      `<button class="bubble-dismiss" aria-label="Dismiss">×</button>` +
      `<span class="bubble-title">${icon} ${ELP.esc(b.title)}</span>` +
      `<span class="bubble-content">${ELP.esc(b.content)}</span>`;
    div.querySelector(".bubble-dismiss").addEventListener("click", () => dismiss(b.key));
    if (b.bubble_type === "process_guide") {
      const toggle = document.createElement("button");
      toggle.className = "bubble-toggle";
      toggle.textContent = "Hide";
      toggle.addEventListener("click", () => {
        div.classList.toggle("collapsed");
        toggle.textContent = div.classList.contains("collapsed") ? "Show" : "Hide";
      });
      div.querySelector(".bubble-title").appendChild(toggle);
    }
    return div;
  }

  async function render(screen, host) {
    try {
      // Feature flag gate — bubbles ship dark until enabled
      if (!ELP.flags?.helper_bubbles) return;
      const session = await ELP.getSession();
      if (!session) return;
      if (!(await showBubblesEnabled(session.user.id))) return;
      await fetchRemoteDismissals(session.user.id);

      const bubbles = await ELP.rest(
        `helper_bubbles?is_active=eq.true&screen=eq.${encodeURIComponent(screen)}&select=*&order=priority.asc`
      );
      const visible = (bubbles ?? []).filter((b) => !isDismissedLocally(b.key));
      if (!visible.length) return;

      const container = host || document.querySelector("[data-bubble-host]") || document.querySelector("main") || document.body;
      for (const b of visible) {
        if (document.querySelector(`[data-bubble-key="${b.key}"]`)) continue;
        const slot = document.querySelector(`[data-bubble-slot="${b.key}"]`);
        if (slot) slot.appendChild(bubbleEl(b));
        else if (b.bubble_type === "process_guide") container.prepend(bubbleEl(b));
        else container.appendChild(bubbleEl(b));
      }
    } catch (e) {
      console.warn("ELBubbles.render failed:", e);
    }
  }

  return { render, dismiss };
})();
