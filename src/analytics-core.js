// ===============================
// 📈 LAFS Analytics Core
// ===============================
(() => {
  if (typeof window.sendLAFSAnalytics === "function") return;

  window.sendLAFSAnalytics = async function(payload) {
    const endpoint = "https://prod-v2.cosmicfusions.com/analytics?type=LAFSAnalytics";

    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        actionTimestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  };
})();
