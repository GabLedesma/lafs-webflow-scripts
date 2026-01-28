(() => {
  document.addEventListener("DOMContentLoaded", function () {
    const statusEl = document.getElementById("event-status");
    const cityEl = document.getElementById("event-city");

    if (!statusEl || !cityEl) return;

    const status = statusEl.textContent.trim();
    const cityRaw = cityEl.textContent.trim();

    if (status !== "Ended") return;

    if (!cityRaw) {
      window.location.replace("/events");
      return;
    }

    const citySlug = cityRaw
      .replace(/[^\w\s-]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    const ignoredCities = ["party", "lgbtq"];
    if (ignoredCities.includes(citySlug)) {
      window.location.replace("/events");
      return;
    }

    const allowedCities = [
      "los-angeles",
      "new-york",
      "bath",
      "birmingham",
      "bournemouth",
      "brighton",
      "bristol",
      "cambridge",
      "cardiff",
      "edinburgh",
      "glasgow",
      "guildford",
      "leamington-spa",
      "leeds",
      "leicester",
      "london",
      "manchester",
      "newcastle",
      "nottingham",
      "reading",
      "sheffield",
      "southampton",
      "winchester"
    ];

    if (!allowedCities.includes(citySlug)) {
      window.location.replace("/events");
      return;
    }

    window.location.replace(`/events/${citySlug}`);
  });
})();
