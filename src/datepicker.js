// ===============================
// 📅 Datepicker Init
// ===============================
(() => {
  if (!window.$ || !$.fn.datepicker) return;

  $(document).ready(() => {
    $('[data-toggle="datepicker"]').datepicker({
      format: "mm-dd-yyyy"
    });
  });
})();
