// ===============================
// 💳 Booking – Blink Payment (FINAL)
// ===============================
(() => {
  wfLog("Booking Blink Payment script loaded");

  let bookingSessionId = null;
  let blinkInitialized = false;

  document.addEventListener("DOMContentLoaded", () => {
    const paymentEl = document.getElementById("payment");

    if (!paymentEl) {
      wfErr("Payment element not found");
      return;
    }

    const paymentForm = paymentEl.closest("form");

    if (!(paymentForm instanceof HTMLFormElement)) {
      wfErr("Payment form not found or #payment is not inside a form");
      return;
    }

    paymentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      wfLog("Blink submit intercepted – allowing Blink JS to continue");

      const formData = new FormData(paymentForm);
      for (const [key, value] of formData.entries()) {
        if (value) wfLog(key, value);
      }
    });
  });

  // ===============================
  // Autosave booking draft
  // ===============================
  async function saveBookingDraft(payload) {
    if (!bookingSessionId) return;

    try {
      await fetch("https://savebookingdraft-xmismu3jga-uc.a.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingSessionId, ...payload }),
      });
    } catch (err) {
      console.warn("Draft save failed:", err);
    }
  }

  // ===============================
  // Blink script injection
  // ===============================
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

  // ===============================
  // Open booking popup
  // ===============================
  document.body.addEventListener("click", async (event) => {
    const btn =
      event.target.closest(".book-button") ||
      event.target.closest("#event-book-now") ||
      event.target.closest(".featured-event-book-btn");

    if (!btn) return;
    event.preventDefault();

    const popup = document.getElementById("payment-popup");
    const paymentForm = document.getElementById("payment");
    if (!popup || !paymentForm) return;

    // ===============================
    // Overlay loader
    // ===============================
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:9999;
      display:flex; align-items:center; justify-content:center;
      background:rgba(255,255,255,0.8);
      font-family:Inter,sans-serif;
    `;
    overlay.textContent = "Loading event details…";
    document.body.appendChild(overlay);

    // ===============================
    // Extract CMS data
    // ===============================
    const cardItem =
      btn.closest("[role='listitem']") ||
      document.querySelector(".container-large.events") ||
      btn.closest(".featured-event");

    if (!cardItem) return;

    const slug = cardItem.getAttribute("data-event-id");
    const eventName = cardItem.getAttribute("data-event-name");
    const eventDate = cardItem.getAttribute("data-event-date");

    let eventImage =
      cardItem.querySelector(".event-image")?.src ||
      cardItem.querySelector("#event-image")?.src ||
      "";

    try {
      // ===============================
      // Fetch event + price
      // ===============================
      const res = await fetch(
        `https://geteventdetails-xmismu3jga-uc.a.run.app?slug=${slug}&priceId=1`
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error("Event load failed");

      const unitPrice = data.price?.price || 0;

      // ===============================
      // Populate UI
      // ===============================
      document.getElementById("ticket-name").textContent = eventName;
      document.getElementById("ticket-event-date").textContent = eventDate;
      document.getElementById("ticket-price").textContent = `£${unitPrice.toFixed(2)}`;

      const ticketImageEl = document.getElementById("ticket-image");
      ticketImageEl.style.backgroundImage = eventImage
        ? `url("${eventImage}")`
        : "none";

      // ===============================
      // Create booking session
      // ===============================
      const sessionRes = await fetch(
        "https://createbookingsession-xmismu3jga-uc.a.run.app",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, priceId: "1", unitPrice }),
        }
      );

      const sessionData = await sessionRes.json();
      if (!sessionData.bookingSessionId) {
        throw new Error("Booking session failed");
      }

      bookingSessionId = sessionData.bookingSessionId;

      // ===============================
      // Show popup FIRST
      // ===============================
      overlay.remove();
      popup.style.display = "flex";

      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.position = "fixed";
      document.body.style.width = "100%";

      // ===============================
      // 🔑 WAIT FOR WEBFLOW TO FINISH RENDERING
      // ===============================
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!blinkInitialized) {
            wfLog("Initialising Blink (DOM ready)");
            initializeBlinkPayment(slug, unitPrice);
            blinkInitialized = true;
          }
        });
      });

      // ===============================
      // Autosave fields
      // ===============================
      const nameEl = document.getElementById("payment-name");
      const emailEl = document.getElementById("payment-email");

      if (nameEl) {
        let t;
        nameEl.addEventListener("input", (e) => {
          clearTimeout(t);
          t = setTimeout(() => saveBookingDraft({ name: e.target.value }), 800);
        });
      }

      if (emailEl) {
        let t;
        emailEl.addEventListener("input", (e) => {
          clearTimeout(t);
          t = setTimeout(() => saveBookingDraft({ email: e.target.value }), 800);
        });
      }

    } catch (err) {
      wfErr("Booking failed", err);
      overlay.remove();
    }
  });

  // ===============================
  // Blink initialisation (DOM-safe)
  // ===============================
  async function initializeBlinkPayment(slug, totalAmount) {
    const ccEl = document.getElementById("cc-element");
    const apEl = document.getElementById("apple-pay-element");
    const gpEl = document.getElementById("google-pay-element");

    if (!ccEl || !apEl || !gpEl) {
      wfErr("Blink containers missing");
      return;
    }

    try {
      const res = await fetch(
        "https://createblinkintent-xmismu3jga-uc.a.run.app",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            purchaseData: { totalPrice: totalAmount },
          }),
        }
      );

      const data = await res.json();
      if (!res.ok || data.error) throw new Error("Blink intent failed");

      injectWithScripts(apEl, data.elements.applePay || "");
      injectWithScripts(gpEl, data.elements.googlePay || "");
      injectWithScripts(ccEl, data.elements.card || "");

      wfLog("Blink fields injected (DOM ready)");

    } catch (err) {
      wfErr("Blink init failed", err);
    }
  }

  // ===============================
  // Close popup
  // ===============================
  document.querySelectorAll(".close-popup").forEach((btn) => {
    btn.addEventListener("click", () => {
      const popup = document.getElementById("payment-popup");
      popup.style.display = "none";

      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);

      bookingSessionId = null;
      blinkInitialized = false;
    });
  });
})();
