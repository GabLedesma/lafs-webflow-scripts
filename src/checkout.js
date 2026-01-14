// ===============================
// 💳 Blink Minimal Checkout Test
// ===============================
(() => {
  console.log("[Blink Test] Script loaded");

  // -------------------------------
  // Helper: execute returned scripts
  // -------------------------------
  function injectWithScripts(container, html) {
    container.innerHTML = html;

    const scripts = container.querySelectorAll("script");
    scripts.forEach(oldScript => {
      const s = document.createElement("script");
      [...oldScript.attributes].forEach(attr =>
        s.setAttribute(attr.name, attr.value)
      );
      s.text = oldScript.text;
      oldScript.replaceWith(s);
    });
  }

  // -------------------------------
  // Init Blink once page is ready
  // -------------------------------
  document.addEventListener("DOMContentLoaded", async () => {
    const ccEl = document.getElementById("cc-element");
    const form = document.getElementById("payment");

    if (!ccEl || !form) {
      console.error("[Blink Test] Missing form or cc-element");
      return;
    }

    console.log("[Blink Test] Initialising Blink…");

    try {
      const res = await fetch(
        "https://createblinkintent-xmismu3jga-uc.a.run.app",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: "30s-40s-singles-mixer-slug-and-lettuce-oxford-circus",
            purchaseData: { totalPrice: 1.0 }, // £1 test
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || data.error) {
        console.error("[Blink Test] Intent failed", data);
        return;
      }

      injectWithScripts(ccEl, data.elements.card || "");

      console.log("[Blink Test] Card field injected");

    } catch (err) {
      console.error("[Blink Test] Init error", err);
    }
  });
})();
