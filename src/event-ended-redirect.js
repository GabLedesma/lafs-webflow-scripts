(() => {
  document.addEventListener("DOMContentLoaded", function () {
    const status = "{{wf {&quot;path&quot;:&quot;status&quot;,&quot;type&quot;:&quot;PlainText&quot;} }}";
    const cityRaw = "{{wf {&quot;path&quot;:&quot;venue-city&quot;,&quot;type&quot;:&quot;PlainText&quot;} }}";

    // Only redirect ended events
    if (status !== "Ended") return;

    if (!cityRaw) {
      window.location.replace("/events");
      return;
    }

    // Normalize city → slug
    const citySlug = cityRaw
      .replace(/[^\w\s-]/g, "") // remove emojis/symbols
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    // Ignore non-city values
    const ignoredCities = ["party", "lgbtq"];
    if (ignoredCities.includes(citySlug)) {
      window.location.replace("/events");
      return;
    }

    // ✅ Allowed city slugs (whitelist)
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

    // Fallback if city page does not exist
    if (!allowedCities.includes(citySlug)) {
      window.location.replace("/events");
      return;
    }

    // Final redirect
    window.location.replace(`/events/${citySlug}`);
  });
})();
