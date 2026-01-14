// ===============================
// 💳 Booking – Blink Payment
// ===============================
(() => {
  wfLog("Booking Blink Payment script loadedzxc");
  let bookingSessionId = null;
  let blinkInitialized = false;

  // document.addEventListener("click", (e) => {
  //   const btn = e.target.closest("#blink-submit");
  //   if (!btn) return;

  //   e.preventDefault();

  //   if (window.Blink && typeof window.Blink.submit === "function") {
  //     wfLog("[WF] Triggering Blink.submit()");
  //     window.Blink.submit();
  //   } else {
  //     wfErr("Blink.submit() not ready");
  //   }
  // });

  // ===============================
  // PREVENT DEFAULT FORM SUBMIT
  // ===============================
  // document.addEventListener("DOMContentLoaded", () => {
  //   const paymentEl = document.getElementById("payment");

  //   if (!paymentEl) {
  //     wfErr("Payment element not found");
  //     return;
  //   }

  //   // 🔑 THIS IS THE FIX
  //   const paymentForm = paymentEl.closest("form");

  //   if (!(paymentForm instanceof HTMLFormElement)) {
  //     wfErr("Payment form not found or #payment is not inside a form");
  //     return;
  //   }

  //   paymentForm.addEventListener("submit", (e) => {
  //     e.preventDefault();
  //     wfLog("[WF] Blink submit intercepted – allowing Blink JS to continue");

  //     const formData = new FormData(paymentForm);
  //     for (const [key, value] of formData.entries()) {
  //       if (value) wfLog(key, value);
  //     }
  //   });
  // });

  async function saveBookingDraft(payload) {
    if (!bookingSessionId) return;

    try {
      await fetch(
        "https://savebookingdraft-xmismu3jga-uc.a.run.app",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingSessionId,
            ...payload,
          }),
        }
      );
    } catch (err) {
      console.warn("Draft save failed:", err);
    }
  }

  document.body.addEventListener("click", async (event) => {
    const btn =
      event.target.closest(".book-button") ||
      event.target.closest("#event-book-now") ||
      event.target.closest(".featured-event-book-btn");

    if (!btn) return;
    event.preventDefault();

    const popup = document.getElementById("payment-popup");
    const loadingSpinner = document.getElementById("loading-spinner");
    const paymentForm = document.getElementById("payment");

    if (!popup || !paymentForm) return;

    // ===============================
    // Overlay loader
    // ===============================
    const processingOverlay = document.createElement("div");
    processingOverlay.id = "payment-processing-overlay";
    processingOverlay.style.cssText = `
      display:none; position:fixed; inset:0;
      background:rgba(255,255,255,0.8); z-index:9999;
      display:flex; justify-content:center; align-items:center;
      font-size:1.2rem; color:#3C2AE7;
      font-family:Inter, sans-serif; backdrop-filter:blur(3px);
    `;
    processingOverlay.innerHTML = "<div>Loading event details...</div>";
    document.body.appendChild(processingOverlay);
    processingOverlay.style.display = "flex";

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
      // Determine price tier
      // ===============================
      let selectedPriceId = "1";
      const radioWrap =
        cardItem.querySelector(".radio-wrap-tickets") ||
        cardItem.querySelector("#radio-wrap-tickets");

      if (radioWrap && radioWrap.offsetParent !== null) {
        const selectedRadio = cardItem.querySelector(
          'input[name="ticketChoice"]:checked'
        );
        selectedPriceId = selectedRadio?.value === "two" ? "2" : "1";
      }

      // ===============================
      // Fetch event + price
      // ===============================
      const res = await fetch(
        `https://geteventdetails-xmismu3jga-uc.a.run.app?slug=${slug}&priceId=${selectedPriceId}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert("Failed to load event details");
        processingOverlay.remove();
        return;
      }

      const priceInfo = data.price;
      const unitPrice = priceInfo?.price || 0;

      // ===============================
      // Populate UI
      // ===============================
      document.getElementById("ticket-name").textContent = eventName;
      document.getElementById("ticket-event-date").textContent = eventDate;

      const ticketImage = document.getElementById("ticket-image");
      ticketImage.style.backgroundImage = eventImage
        ? `url("${eventImage}")`
        : "none";

      document.getElementById("ticket-price").textContent = `£${unitPrice.toFixed(
        2
      )}`;

      // ===============================
      // Quantity + totals
      // ===============================
      let quantity = 1;

      const qtyMinus = document.getElementById("qty-minus");
      const qtyPlus = document.getElementById("qty-plus");
      const qtyText = document.getElementById("qty-text");
      const totalPriceEl = document.getElementById("ticket-total-price");

      function renderTotals() {
        const total = unitPrice * quantity;
        qtyText.textContent = quantity;
        totalPriceEl.textContent = `£${total.toFixed(2)}`;
        if (!blinkInitialized) {
          initializeBlinkPayment(total);
          blinkInitialized = true;
        }
      }

      qtyMinus.onclick = () => {
        if (quantity > 1) {
          quantity--;
          renderTotals();
        }
      };

      qtyPlus.onclick = () => {
        quantity++;
        renderTotals();
      };

      // ===============================
      // Create booking session
      // ===============================
      const sessionRes = await fetch(
        "https://createbookingsession-xmismu3jga-uc.a.run.app",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            priceId: selectedPriceId,
            unitPrice: data.price?.price || 0,
          }),
        }
      );

      const sessionData = await sessionRes.json();

      if (!sessionRes.ok || !sessionData.bookingSessionId) {
        alert("Failed to start booking session");
        processingOverlay.remove();
        return;
      }

      // 🔑 STORE SESSION ID FOR AUTOSAVE + BLINK
      bookingSessionId = sessionData.bookingSessionId;

      // ===============================
      // Show popup
      // ===============================
      processingOverlay.style.display = "none";
      popup.style.display = "flex";

      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      if (loadingSpinner) loadingSpinner.style.display = "none";
      
      // ===============================
      // Autosave popup form fields
      // ===============================

      // Gender
      const genderEl = document.getElementById("payment-gender");
      if (genderEl) {
        genderEl.addEventListener("change", (e) => {
          saveBookingDraft({ gender: e.target.value });
        });
      }

      // Name (debounced)
      const nameEl = document.getElementById("payment-name");
      if (nameEl) {
        let nameTimer;
        nameEl.addEventListener("input", (e) => {
          clearTimeout(nameTimer);
          nameTimer = setTimeout(() => {
            saveBookingDraft({ name: e.target.value });
          }, 800);
        });
      }

      // Email (debounced)
      const emailEl = document.getElementById("payment-email");
      if (emailEl) {
        let emailTimer;
        emailEl.addEventListener("input", (e) => {
          clearTimeout(emailTimer);
          emailTimer = setTimeout(() => {
            saveBookingDraft({ email: e.target.value });
          }, 800);
        });
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

      function reloadBlinkCustomJs() {
        const old = document.querySelector(
          'script[src*="secure.blinkpayment.co.uk/assets/js/api/custom.js"]'
        );
        if (old) old.remove();

        const s = document.createElement("script");
        s.src = "https://secure.blinkpayment.co.uk/assets/js/api/custom.js";
        s.async = false;
        document.body.appendChild(s);
      }


      // ===============================
      // Blink initialization
      // ===============================
      async function initializeBlinkPayment(totalAmount) {
        const ccEl = document.getElementById("cc-element");
        const apEl = document.getElementById("apple-pay-element");
        const gpEl = document.getElementById("google-pay-element");

        if (!ccEl || !apEl || !gpEl) {
          wfErr("Blink containers missing", { ccEl, apEl, gpEl });
          return;
        }

        // Clear safely
        // ccEl.innerHTML = "";
        // apEl.innerHTML = "";
        // gpEl.innerHTML = "";

        const bookingData = {
          name: document.getElementById("payment-name")?.value || "",
          email: document.getElementById("payment-email")?.value || "",
        };

        try {
          const res = await fetch(
            "https://createblinkintent-xmismu3jga-uc.a.run.app",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                slug,
                purchaseData: { totalPrice: totalAmount },
                bookingData,
              }),
            }
          );

          const data = await res.json();

          if (!res.ok || data.error) {
            paymentForm.innerHTML =
              "<div style='color:red;text-align:center;'>Payment could not be initialized.</div>";
            return;
          }
          
          const { elements } = data;

          wfLog("elements:", elements);
          wfLog("ccElement:", elements.card);
          wfLog("window.ApplePaySession:", window.ApplePaySession);
          if (window.ApplePaySession) {
            wfLog(
              "canMakePayments:",
              window.ApplePaySession.canMakePayments()
            );
          } else {
            wfLog("Apple Pay not supported in this browser/device");
          }

          injectWithScripts(apEl, elements.applePay || "");
          injectWithScripts(gpEl, elements.googlePay || "");

          // injectWithScripts(ccEl, elements.card || "");
          ccEl.innerHTML = elements.card || "";

          // reloadBlinkCustomJs();
        } catch (err) {
          wfErr("🔥 Blink initialization failed:", err);
          paymentForm.innerHTML =
            "<div style='color:red;text-align:center;'>Blink initialization failed.</div>";
        }
      }

      renderTotals();
    } catch (err) {
      wfErr("🔥 Blink booking failed:", err);
      paymentForm.innerHTML =
        "<div style='color:red;text-align:center;'>Something went wrong.</div>";
    }
  });

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

      // 🔑 Clear Blink mounts ONLY
      // document.getElementById("apple-pay-element").innerHTML = "";
      // document.getElementById("google-pay-element").innerHTML = "";
      // document.getElementById("cc-element").innerHTML = "";
    });
  });
})();
