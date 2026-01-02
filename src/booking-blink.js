// ===============================
// 💳 Booking – Blink Payment
// ===============================
(() => {
  document.body.addEventListener("click", async (event) => {
    const btn =
      event.target.closest(".book-button") ||
      event.target.closest("#event-book-now") ||
      event.target.closest(".featured-event-book-btn");

    if (!btn) return;
    event.preventDefault();

    const popup = document.getElementById("payment-popup");
    const loadingSpinner = document.getElementById("loading-spinner");
    const paymentForm = document.getElementById("payment-form");

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
        initializeBlinkPayment(total);
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
      // Show popup
      // ===============================
      processingOverlay.style.display = "none";
      popup.style.display = "flex";

      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      if (loadingSpinner) loadingSpinner.style.display = "none";

      // ===============================
      // Blink initialization
      // ===============================
      async function initializeBlinkPayment(totalAmount) {
        paymentForm.innerHTML = "";

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

          paymentForm.innerHTML = `
            <form id="blink-payment-form">
              <div id="blink-card">${elements.card || ""}</div>
              <div id="blink-gpay" style="margin-top:12px;">${elements.googlePay || ""}</div>
              <div id="blink-applepay" style="margin-top:12px;">${elements.applePay || ""}</div>

              <div style="text-align:center;margin-top:20px;">
                <button id="blink-pay-button"
                  style="background:#3C2AE7;color:#fff;border:none;
                  border-radius:12px;padding:12px 24px;font-size:16px;cursor:pointer;">
                  Pay Now
                </button>
              </div>
            </form>
          `;

          document
            .getElementById("blink-pay-button")
            .addEventListener("click", (e) => {
              e.preventDefault();
              setTimeout(() => {
                window.location.href =
                  "https://www.loveatfirstsign.co.uk/success";
              }, 3000);
            });
        } catch (err) {
          paymentForm.innerHTML =
            "<div style='color:red;text-align:center;'>Blink initialization failed.</div>";
        }
      }

      renderTotals();
    } catch (err) {
      console.error("🔥 Blink booking failed:", err);
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

      document.getElementById("payment-form").innerHTML = "";
    });
  });
})();
