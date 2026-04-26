// easierLet — Signature canvas widget
//
// Reusable e-signature pad. Mount onto a container with a <canvas>:
//
//   <div class="el-sig">
//     <canvas data-sig-canvas></canvas>
//     <div class="el-sig-actions">
//       <button data-sig-clear>Clear</button>
//       <span data-sig-hint>Sign with your mouse or finger</span>
//     </div>
//   </div>
//
//   const sig = ELSignature.mount(document.querySelector(".el-sig"));
//   sig.isEmpty()        // → boolean
//   sig.toDataURL()      // → "data:image/png;base64,..."
//   sig.clear()
//
// The output is a base64 PNG matching the format the iOS app uses for
// landlord_signature / tenant_signature / inventory signatures.

(function () {
  function mount(host) {
    const canvas = host.querySelector("[data-sig-canvas]");
    const clearBtn = host.querySelector("[data-sig-clear]");
    const hint = host.querySelector("[data-sig-hint]");
    if (!canvas) throw new Error("ELSignature: no canvas found");

    const ctx = canvas.getContext("2d");
    let drawing = false;
    let dirty = false;
    let last = null;

    function size() {
      // Keep an internal canvas at devicePixelRatio for crisp lines, while
      // displaying at the CSS box size. Re-runs on resize so a rotated
      // tablet doesn't blur the strokes.
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const data = dirty ? canvas.toDataURL("image/png") : null;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#1A2E28";
      ctx.lineWidth = 2;
      // Repaint the previous strokes after a resize so we don't lose data.
      if (data) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
        img.src = data;
      }
    }
    size();
    window.addEventListener("resize", size);

    function pos(e) {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches && e.touches[0];
      const x = (t ? t.clientX : e.clientX) - rect.left;
      const y = (t ? t.clientY : e.clientY) - rect.top;
      return { x, y };
    }

    function start(e) {
      e.preventDefault();
      drawing = true;
      last = pos(e);
      if (hint) hint.style.opacity = "0";
    }
    function move(e) {
      if (!drawing) return;
      e.preventDefault();
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
      dirty = true;
    }
    function end(e) {
      if (!drawing) return;
      e.preventDefault();
      drawing = false;
      last = null;
    }

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseup", end);
    canvas.addEventListener("mouseleave", end);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end);

    function clear() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dirty = false;
      if (hint) hint.style.opacity = "";
    }
    if (clearBtn) clearBtn.addEventListener("click", clear);

    return {
      clear,
      isEmpty: () => !dirty,
      toDataURL: () => (dirty ? canvas.toDataURL("image/png") : null),
    };
  }

  window.ELSignature = { mount };
})();
