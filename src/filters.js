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
