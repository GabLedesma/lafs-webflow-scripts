// ===============================
// 🔔 Promo Popup (session-based)
// ===============================
(() => {
  window.addEventListener("load", () => {
    if (sessionStorage.getItem("promoClosed") === "true") return;

    setTimeout(() => {
      document.querySelectorAll(".promo-popup").forEach(popup => {
        popup.style.display = "flex";
      });
    }, 1000);

    const closeBtn = document.querySelector(".promo-popup-close-btn");
    closeBtn?.addEventListener("click", () => {
      document.querySelectorAll(".promo-popup").forEach(p => p.style.display = "none");
      sessionStorage.setItem("promoClosed", "true");
    });
  });
})();
