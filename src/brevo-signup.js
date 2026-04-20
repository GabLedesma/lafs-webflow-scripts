// ===============================
// 📧 Brevo Signup – Sticky Promo
// ===============================
(() => {
  const WORKER_URL = "https://brevo-proxy.loveatfirstsign.workers.dev";

  const LIVE_CITIES = [
    { label: "Los Angeles",    value: "/los-angeles" },
    { label: "New York",       value: "/new-york" },
    { label: "Bath",           value: "/bath" },
    { label: "Birmingham",     value: "/birmingham" },
    { label: "Bournemouth",    value: "/bournemouth" },
    { label: "Brighton",       value: "/brighton" },
    { label: "Bristol",        value: "/bristol" },
    { label: "Cambridge",      value: "/cambridge" },
    { label: "Cardiff",        value: "/cardiff" },
    { label: "Edinburgh",      value: "/edinburgh" },
    { label: "Glasgow",        value: "/glasgow" },
    { label: "Guildford",      value: "/guildford" },
    { label: "Leamington Spa", value: "/leamington-spa" },
    { label: "Leeds",          value: "/leeds" },
    { label: "Leicester",      value: "/leicester" },
    { label: "London",         value: "/london" },
    { label: "Manchester",     value: "/manchester" },
    { label: "Newcastle",      value: "/newcastle" },
    { label: "Nottingham",     value: "/nottingham" },
    { label: "Reading",        value: "/reading" },
    { label: "Sheffield",      value: "/sheffield" },
    { label: "Southampton",    value: "/southampton" },
    { label: "Winchester",     value: "/winchester" },
  ];

  function findLiveCity(input) {
    const normalized = input.trim().toLowerCase();
    return LIVE_CITIES.find(c => c.label.toLowerCase() === normalized) ?? null;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function init() {
    const nameInput  = document.getElementById("sticky-promo-name");
    const cityInput  = document.getElementById("sticky-promo-city");
    const emailInput = document.getElementById("sticky-promo-email");
    const btn        = document.getElementById("sticky-promo-btn");

    if (!nameInput || !cityInput || !emailInput || !btn) return;

    const form = btn.closest("form");
    if (form) form.addEventListener("submit", e => { e.preventDefault(); e.stopPropagation(); });

    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const name  = nameInput.value.trim();
      const city  = cityInput.value.trim();
      const email = emailInput.value.trim();

      if (!name || !city || !email) {
        alert("Please fill in all fields.");
        return;
      }

      if (!isValidEmail(email)) {
        alert("Enter a valid email.");
        return;
      }

      const matchedCity = findLiveCity(city);
      if (matchedCity) {
        location.href = `/events${matchedCity.value}`;
        return;
      }

      btn.disabled = true;
      const original = btn.textContent;
      btn.textContent = "Sending…";

      try {
        const res = await fetch(WORKER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, city, email }),
        });

        if (res.ok) {
          alert("You're on the list! We'll let you know when we arrive.");
          const promos = document.querySelectorAll(".sticky-promo");
          promos.forEach(p => {
            p.style.transition = "transform 0.4s ease-in";
            p.style.transform = "translateX(-100%)";
          });
          sessionStorage.setItem("promoClosed", "true");
          setTimeout(() => promos.forEach(p => p.style.display = "none"), 400);
        } else {
          console.error("Signup error:", await res.json().catch(() => ({})));
          btn.disabled = false;
          btn.textContent = original;
          alert("Something went wrong. Try again.");
        }
      } catch (err) {
        console.error("Brevo signup failed:", err);
        btn.disabled = false;
        btn.textContent = original;
        alert("Network error. Try again.");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
