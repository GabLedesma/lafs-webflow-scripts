(() => {

  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");
  const amount = params.get("amount");
  const reference = params.get("reference");

  const successEl = document.querySelector(".success-wrapper");
  const failureEl = document.querySelector(".failure-wrapper");

  // Hide both first
  if (successEl) successEl.style.display = "none";
  if (failureEl) failureEl.style.display = "none";

  // Normalize
  const isDeclined = status && status.toLowerCase() === "declined";

  // ============================
  // ❌ FAILED PAYMENT
  // ============================
  if (isDeclined) {
    if (failureEl) failureEl.style.display = "flex";
    return;
  }

  // ============================
  // ✅ SUCCESS PAYMENT
  // ============================
  if (successEl) successEl.style.display = "flex";

  // 🔥 SEND GA4 PURCHASE EVENT
  if (typeof gtag === "function") {
    gtag("event", "purchase", {
      transaction_id: reference || "unknown",
      value: Number(amount) || 0,
      currency: "GBP",
      items: [
        {
          item_name: "Love at First Sign Event Ticket",
          item_id: reference || "event_ticket",
          price: Number(amount) || 0,
          quantity: 1
        }
      ]
    });

    console.log("GA4 purchase fired");
  }

})();