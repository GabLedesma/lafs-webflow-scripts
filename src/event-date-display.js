(() => {
  const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  function applyEventDates() {
    document.querySelectorAll(".event-item").forEach((item) => {
      if (item.dataset.dateApplied) return;

      const raw = item.getAttribute("data-event-date");
      if (!raw) return;

      const date = new Date(raw);
      if (isNaN(date)) return;

      const dayEl = item.querySelector("#event-date-day");
      const numEl = item.querySelector("#event-date-num");
      const monthEl = item.querySelector("#event-date-month");

      if (dayEl) dayEl.textContent = DAYS[date.getDay()];
      if (numEl) numEl.textContent = date.getDate();
      if (monthEl) monthEl.textContent = MONTHS[date.getMonth()];

      item.dataset.dateApplied = "true";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyEventDates();

    const listWrapper = document.querySelector(".events-list-wrapper");
    if (!listWrapper) return;

    const observer = new MutationObserver(() => {
      applyEventDates();
    });

    observer.observe(listWrapper, {
      childList: true,
      subtree: true,
    });
  });
})();
