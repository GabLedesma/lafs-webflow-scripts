// ===============================
// 📊 GTM – Book Now Click
// ===============================
(() => {
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".book-button").forEach(btn => {
      btn.addEventListener("click", () => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "book_now_click",
          button_text: btn.innerText.trim(),
          location: window.location.pathname
        });
      });
    });
  });
})();
