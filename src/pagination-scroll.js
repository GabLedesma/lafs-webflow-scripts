// ===============================
// 📄 Pagination Scroll
// ===============================
(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const listTop = document.querySelector(".events-list");
    if (!listTop) return;

    document.querySelectorAll(
      ".w-pagination-next, .w-pagination-previous, .Next, .Previous"
    ).forEach(btn => {
      btn.addEventListener("click", () => {
        setTimeout(() => {
          listTop.scrollIntoView({ behavior: "smooth" });
        }, 100);
      });
    });
  });
})();
