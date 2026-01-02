// ===============================
// 📌 Sticky Promo Swipe
// ===============================
(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const promos = document.querySelectorAll(".sticky-promo");
    if (!promos.length) return;

    const closeKey = "promoClosed";
    if (sessionStorage.getItem(closeKey) === "true") {
      promos.forEach(p => p.style.display = "none");
      return;
    }

    let startX = 0, currentX = 0, dragging = false;

    const start = x => { dragging = true; startX = x; };
    const move = x => {
      if (!dragging) return;
      currentX = x - startX;
      if (currentX < 0) promos.forEach(p => p.style.transform = `translateX(${currentX}px)`);
    };
    const end = () => {
      if (!dragging) return;
      dragging = false;

      if (currentX < -100) {
        promos.forEach(p => {
          p.style.transition = "transform 0.4s ease-in";
          p.style.transform = "translateX(-100%)";
        });
        sessionStorage.setItem(closeKey, "true");
        setTimeout(() => promos.forEach(p => p.style.display = "none"), 400);
      } else {
        promos.forEach(p => {
          p.style.transition = "transform 0.2s ease-out";
          p.style.transform = "translateX(0)";
        });
      }
      currentX = 0;
    };

    promos.forEach(p => {
      p.addEventListener("mousedown", e => start(e.clientX));
      p.addEventListener("touchstart", e => start(e.touches[0].clientX));
    });

    document.addEventListener("mousemove", e => move(e.clientX));
    document.addEventListener("mouseup", end);
    document.addEventListener("touchmove", e => move(e.touches[0].clientX));
    document.addEventListener("touchend", end);
  });
})();
