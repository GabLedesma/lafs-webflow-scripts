// ===============================
// 🧭 Month + City + Age (Redirect Only)
// ===============================
(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const selectMonth = document.getElementById("select-month");
    const selectCity = document.getElementById("select-city");
    const selectAge = document.getElementById("select-age");
    const goButtons = document.querySelectorAll("#select-month-city-button");

    // ---------- Populate Month ----------
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

    // ---------- Populate City ----------
    if (selectCity) {
      selectCity.innerHTML = `<option value="">City</option>`;

      const cities = {
        US: [
          { label: "Los Angeles", value: "/los-angeles" },
          { label: "New York", value: "/new-york" }
        ],
        UK: [
          { label: "Bath", value: "/bath" },
          { label: "Birmingham", value: "/birmingham" },
          { label: "Bournemouth", value: "/bournemouth" },
          { label: "Brighton", value: "/brighton" },
          { label: "Bristol", value: "/bristol" },
          { label: "Cambridge", value: "/cambridge" },
          { label: "Cardiff", value: "/cardiff" },
          { label: "Edinburgh", value: "/edinburgh" },
          { label: "Exeter", value: "__coming-soon:Exeter" },
          { label: "Glasgow", value: "/glasgow" },
          { label: "Guildford", value: "/guildford" },
          { label: "Inverness", value: "__coming-soon:Inverness" },
          { label: "Leamington Spa", value: "/leamington-spa" },
          { label: "Leeds", value: "/leeds" },
          { label: "Leicester", value: "/leicester" },
          { label: "Lincoln", value: "__coming-soon:Lincoln" },
          { label: "London", value: "/london" },
          { label: "Manchester", value: "/manchester" },
          { label: "Newcastle", value: "/newcastle" },
          { label: "Nottingham", value: "/nottingham" },
          { label: "Plymouth", value: "__coming-soon:Plymouth" },
          { label: "Portsmouth", value: "__coming-soon:Portsmouth" },
          { label: "Reading", value: "/reading" },
          { label: "Sheffield", value: "/sheffield" },
          { label: "Southampton", value: "/southampton" },
          { label: "Winchester", value: "/winchester" },

          // Special categories
          { label: "Party 🎉", value: "/parties" },
          { label: "LGBTQ+ 🌈", value: "/lgbtq" },
          { label: "Universities 🎓", value: "/university" }
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

    // ---------- GO Button ----------
    goButtons.forEach(goButton => goButton.addEventListener("click", () => {
      const month = selectMonth?.value;
      const city = selectCity?.value;
      const age = selectAge?.value;

      if (city?.startsWith("__coming-soon:")) {
        const cityName = city.replace("__coming-soon:", "");
        location.href = `/events/coming-soon?city=${encodeURIComponent(cityName)}`;
        return;
      }

      let url = "/events";
      if (city) url += city;

      const params = new URLSearchParams();

      if (month) params.set("month", month);
      if (age) params.set("age", age);

      const query = params.toString();
      if (query) url += `?${query}`;

      location.href = url;
    }));
  });
})();
