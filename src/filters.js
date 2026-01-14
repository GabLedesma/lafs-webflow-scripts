// ===============================
// 🧭 Month + City Filter
// ===============================
(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const selectMonth = document.getElementById("select-month");
    const selectCity = document.getElementById("select-city");
    const goButton = document.getElementById("select-month-city-button");

    if (selectMonth && selectMonth.options.length <= 1) {
      const months = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
      ];
      const now = new Date().getMonth();

      for (let i = 0; i < 12; i++) {
        const opt = document.createElement("option");
        opt.value = months[(now + i) % 12];
        opt.textContent = opt.value;
        selectMonth.appendChild(opt);
      }
    }

    // ---------- Populate City with Groups ----------
    if (selectCity) {
      selectCity.innerHTML = `<option value="">Select City</option>`;

      const cities = {
        US: [
          { label: "New York", value: "/new-york" },
          { label: "Los Angeles", value: "/los-angeles" }
        ],
        UK: [
          { label: "Birmingham", value: "/birmingham" },
          { label: "Bournemouth", value: "/bournemouth" },
          { label: "Brighton", value: "/brighton" },
          { label: "Bristol", value: "/bristol" },
          { label: "Cambridge", value: "/cambridge" },
          { label: "Cardiff", value: "/cardiff" },
          { label: "Edinburgh", value: "/edinburgh" },
          { label: "Glasgow", value: "/glasgow" },
          { label: "Guildford", value: "/guildford" },
          { label: "Leeds", value: "/leeds" },
          { label: "London", value: "/london" },
          { label: "Manchester", value: "/manchester" },
          { label: "Newcastle", value: "/newcastle" },
          { label: "Nottingham", value: "/nottingham" },
          { label: "Southampton", value: "/southampton" },
          { label: "Winchester", value: "/winchester" },

          // ✅ Special categories (as per your Webflow values)
          { label: "Party 🎉", value: "/parties" },
          { label: "LGBTQ+ 🌈", value: "/lgbtq" }
        ]
      };

      Object.entries(cities).forEach(([country, list]) => {
        const group = document.createElement("optgroup");
        group.label = country;

        list.forEach(item => {
          const opt = document.createElement("option");
          opt.value = item.value;
          opt.textContent = item.label;
          group.appendChild(opt);
        });

        selectCity.appendChild(group);
      });
    }

    goButton?.addEventListener("click", () => {
      const month = selectMonth?.value;
      const city = selectCity?.value;

      let url = "/events";
      if (city && city !== "Select City") url += city;
      if (month && month !== "Select Month") url += `?month=${encodeURIComponent(month)}`;

      if (url !== location.pathname + location.search) location.href = url;
    });
  });
})();
