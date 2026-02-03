(() => {
    document.addEventListener("DOMContentLoaded", () => {
    if (!window.location.pathname.startsWith("/events")) return;

    const selectMonth = document.getElementById("select-month");
    const selectCity = document.getElementById("select-city");
    const selectAge = document.getElementById("select-age");
    const ageSearch = document.getElementById("age-search");

    const params = new URLSearchParams(window.location.search);
    const monthFromURL = params.get("month");
    const ageFromURL = params.get("age");

    const pathParts = window.location.pathname.split("/");
    const cityFromPath = pathParts[2]; // /events/{city}

    // ---------- Prefill Month ----------
    if (monthFromURL && selectMonth) {
        selectMonth.value = monthFromURL;
        selectMonth.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // ---------- Prefill City ----------
    if (cityFromPath && selectCity) {
        selectCity.value = "/" + cityFromPath;
        selectCity.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // ---------- Prefill Age + push into Finsweet search ----------
    if (selectAge && ageSearch) {

        // From URL on load
        if (ageFromURL) {
        selectAge.value = ageFromURL;
        ageSearch.value = ageFromURL;
        ageSearch.dispatchEvent(new Event("input", { bubbles: true }));
        }

        // On user change
        selectAge.addEventListener("change", () => {
        ageSearch.value = selectAge.value || "";
        ageSearch.dispatchEvent(new Event("input", { bubbles: true }));
        });
    }
    });
})();
