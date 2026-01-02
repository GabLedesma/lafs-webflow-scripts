// ===============================
// 📊 Analytics – Event Cards
// ===============================
(() => {
  document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.sendLAFSAnalytics !== "function") return;

    document.body.addEventListener("click", async e => {
      const btn = e.target.closest(".button-details");
      if (!btn) return;

      e.preventDefault();

      const card = btn.closest(".event-item");
      if (card?.dataset?.eventId) {
        await window.sendLAFSAnalytics({
          actionType: "UPCOMING_MORE_DETAILS_CLICK",
          eventId: card.dataset.eventId,
          eventName: card.dataset.eventName,
          pageSource: "HOME",
          eventVenueAddress: card.dataset.venueAddress,
          ageRange: card.dataset.ageRange,
          price: card.dataset.price,
          eventCity: card.dataset.eventCity,
        });
      }

      if (btn.href) window.location.href = btn.href;
    });
  });
})();
