// ===============================
// 📧 Brevo Signup – Sticky Promo
// ===============================
(() => {
  const BREVO_API_KEY = window.BREVO_API_KEY;
  const BREVO_FOLDER_ID = 1; // Default folder; change if needed

  const brevo = (path, method = "GET", body) =>
    fetch(`https://api.brevo.com/v3${path}`, {
      method,
      headers: { "Content-Type": "application/json", "api-key": BREVO_API_KEY },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }).then(r => r.json());

  async function getOrCreateListId(city) {
    const listName = `LAFS - ${city}`;
    const cacheKey = `brevo_list_id_${city.toLowerCase()}`;

    const cached = localStorage.getItem(cacheKey);
    if (cached) return Number(cached);

    const { lists = [] } = await brevo("/contacts/lists?limit=50");
    const existing = lists.find(l => l.name === listName);

    if (existing) {
      localStorage.setItem(cacheKey, existing.id);
      return existing.id;
    }

    const created = await brevo("/contacts/lists", "POST", {
      name: listName,
      folderId: BREVO_FOLDER_ID,
    });
    localStorage.setItem(cacheKey, created.id);
    return created.id;
  }

  function init() {
    const nameInput  = document.getElementById("sticky-promo-name");
    const cityInput  = document.getElementById("sticky-promo-city");
    const emailInput = document.getElementById("sticky-promo-email");
    const btn        = document.getElementById("sticky-promo-btn");

    if (!nameInput || !cityInput || !emailInput || !btn) return;

    const form = btn.closest("form");
    if (form) form.addEventListener("submit", e => e.preventDefault());

    btn.addEventListener("click", async () => {
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

      btn.disabled = true;
      const original = btn.textContent;
      btn.textContent = "Sending…";

      try {
        const listId = await getOrCreateListId(city);

        const res = await fetch("https://api.brevo.com/v3/contacts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": BREVO_API_KEY,
          },
          body: JSON.stringify({
            email,
            attributes: { FIRSTNAME: name, CITY: city },
            listIds: [listId],
            updateEnabled: true,
          }),
        });

        if (res.ok || res.status === 204) {
          const promos = document.querySelectorAll(".sticky-promo");
          promos.forEach(p => {
            p.style.transition = "transform 0.4s ease-in";
            p.style.transform = "translateX(-100%)";
          });
          sessionStorage.setItem("promoClosed", "true");
          setTimeout(() => promos.forEach(p => p.style.display = "none"), 400);
        } else {
          const err = await res.json().catch(() => ({}));
          console.error("Brevo error:", err);
          btn.disabled = false;
          btn.textContent = original;
          alert("Something went wrong. Try again.");
        }
      } catch (e) {
        console.error("Brevo signup failed:", e);
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

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }


})();
