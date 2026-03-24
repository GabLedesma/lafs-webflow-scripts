(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    document.querySelectorAll("[data-event-date]").forEach((item) => {
      const raw = item.getAttribute("data-event-date");
      if (!raw) return;

      const date = new Date(raw);
      if (isNaN(date)) return;

      const dayEl = item.querySelector(".event-date-day");
      const numEl = item.querySelector(".event-date-num");
      const monthEl = item.querySelector(".event-date-month");

      if (dayEl) dayEl.textContent = DAYS[date.getDay()];
      if (numEl) numEl.textContent = date.getDate();
      if (monthEl) monthEl.textContent = MONTHS[date.getMonth()];
    });
  });
})();
