(() => {
    function applyEventDiscounts() {
        document.querySelectorAll(".event-item").forEach(eventItem => {
            if (eventItem.dataset.discountApplied) return;

            const oneTicketEl = eventItem.querySelector("#event-price-1-text");
            const twoTicketEl = eventItem.querySelector("#event-price-2-text");
            const saveTextEl = eventItem.querySelector("#event-save-discount-text");

            if (!oneTicketEl || !twoTicketEl || !saveTextEl) return;

            const oneText = oneTicketEl.textContent.trim();
            const twoText = twoTicketEl.textContent.trim();

            const currencyMatch = oneText.match(/[^\d.,\s]+/);
            const currencySymbol = currencyMatch ? currencyMatch[0] : "";

            const onePrice = parseFloat(oneText.replace(/[^\d.]/g, ""));
            const twoPrice = parseFloat(twoText.replace(/[^\d.]/g, ""));

            if (isNaN(onePrice) || isNaN(twoPrice)) {
            saveTextEl.style.display = "none";
            return;
            }

            const savings = (onePrice * 2) - twoPrice;

            if (savings > 0) {
            saveTextEl.textContent = `SAVE ${currencySymbol}${savings.toFixed(0)}!`;
            saveTextEl.style.display = "inline-block";
            } else {
            saveTextEl.style.display = "none";
            }

            // Prevent double-processing
            eventItem.dataset.discountApplied = "true";
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        applyEventDiscounts();

        const listWrapper = document.querySelector(".events-list-wrapper");
        if (!listWrapper) return;

        const observer = new MutationObserver(() => {
            applyEventDiscounts();
        });

        observer.observe(listWrapper, {
            childList: true,
            subtree: true
        });
    });
})();
