// ===============================
// 🎯 Countdown Timer
// ===============================
(() => {
  const hoursEl = document.getElementById("cyber-monday-hours");
  const minutesEl = document.getElementById("cyber-monday-minutes");
  if (!hoursEl || !minutesEl) return;

  const targetDate = new Date(Date.UTC(2026, 0, 4, 0, 0, 0));

  function updateCountdown() {
    const diff = targetDate - new Date();

    if (isNaN(diff) || diff <= 0) {
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      return;
    }

    const totalMinutes = Math.floor(diff / 1000 / 60);
    hoursEl.textContent = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    minutesEl.textContent = String(totalMinutes % 60).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
})();
