// ===============================
// 🎟️ Booking + Payment
// ===============================
(() => {
  function refreshGenderSelect(maleTicketsAvailable, femaleTicketsAvailable) {
    const genderSelect = document.getElementById("payment-gender");
    if (!genderSelect) return;

    // Reset + normalize all options first
    genderSelect.querySelectorAll("option").forEach(opt => {
      // Remove any existing (SOLD OUT) text safely
      opt.textContent = opt.textContent.replace(/\s*\(SOLD OUT\)$/i, "");
      opt.disabled = false;
    });

    // Apply SOLD OUT to Male
    if (maleTicketsAvailable <= 0) {
      const maleOption = genderSelect.querySelector('option[value="Male"]');
      if (maleOption && !maleOption.textContent.includes("(SOLD OUT)")) {
        maleOption.textContent += " (SOLD OUT)";
        maleOption.disabled = true;
      }
    }

    // Apply SOLD OUT to Female
    if (femaleTicketsAvailable <= 0) {
      const femaleOption = genderSelect.querySelector('option[value="Female"]');
      if (femaleOption && !femaleOption.textContent.includes("(SOLD OUT)")) {
        femaleOption.textContent += " (SOLD OUT)";
        femaleOption.disabled = true;
      }
    }
  }

  document.body.addEventListener("click", async (event) => {
    const testBtn = event.target.closest("#book-test-button");
    if(testBtn) return;
    const btn = event.target.closest(".book-button") || event.target.closest("#event-book-now") || event.target.closest(".featured-event-book-btn");
    if (!btn) return;
    event.preventDefault();

    const popup = document.getElementById("payment-popup");
    const loadingSpinner = document.getElementById("loading-spinner");
    const paymentForm = document.getElementById("payment");

    // Overlay loader
    const processingOverlay = document.createElement("div");
    processingOverlay.id = "payment-processing-overlay";
    processingOverlay.style.cssText = `
      display:none; position:fixed; top:0; left:0; right:0; bottom:0;
      background:rgba(255,255,255,0.8); z-index:9999;
      justify-content:center; align-items:center;
      font-size:1.2rem; color:#3C2AE7;
      font-family:Inter, sans-serif; backdrop-filter:blur(3px);
    `;
    document.body.appendChild(processingOverlay);

    // Extract CMS data
    const cardItem = btn.closest("[role='listitem']") || document.querySelector('.container-large.events') || btn.closest('.featured-event') || "";
    const slug = cardItem.getAttribute("data-event-id");
    const eventName = cardItem.getAttribute("data-event-name");
    const eventDate = cardItem.getAttribute("data-event-date");
    const eventCity = cardItem.getAttribute("data-event-city");
    const venueAddress = cardItem.getAttribute("data-venue-address");
    const venueName = cardItem.getAttribute("data-venue-name");
    const ageRange = cardItem.getAttribute("data-age-range");
    let eventImage = "";
    eventImage = cardItem.querySelector(".event-image")?.src || cardItem.querySelector("#event-image")?.src || "";

    processingOverlay.style.display = "flex";
    processingOverlay.innerHTML = "<div>Loading event details...</div>";

    try {
      // 🔹 Determine which price to load (scoped properly)
      let selectedPriceId = "1";

      if (cardItem) {
        const radioWrap = cardItem.querySelector(".radio-wrap-tickets") || cardItem.querySelector("#radio-wrap-tickets");

        // 🧠 If radio-wrap-tickets does not exist or is hidden → default to price 1
        if (!radioWrap || radioWrap.offsetParent === null) {
          selectedPriceId = "1";
        } else {
          const selectedRadio = cardItem.querySelector('input[name="ticketChoice"]:checked');
          // If a radio is selected, use it. Otherwise default to price 2 (second tier)
          if (selectedRadio) {
            selectedPriceId = selectedRadio.value === "two" ? "2" : "1";
          } else {
            selectedPriceId = "2";
          }
        }
      }
      // If priceId = 2, each quantity counts as 2 tickets
      const ticketsPerUnit = selectedPriceId === "2" ? 2 : 1;

      // 🔹 Fetch event + price
      const response = await fetch(`https://geteventdetails-xmismu3jga-uc.a.run.app?slug=${slug}&priceId=${selectedPriceId}`);
      const eventData = await response.json();

      if (!response.ok || !eventData.success) {
        alert("Failed to load event details");
        processingOverlay.style.display = "none";
        return;
      }

      const eventInfo = eventData.event;
      const priceInfo = eventData.price;

      

      let ticketPerGender = eventInfo.ticketPerGender;
      if (
        !ticketPerGender ||
        typeof ticketPerGender.male !== "number" ||
        typeof ticketPerGender.female !== "number"
      ) {
        ticketPerGender = {
          male: 15,
          female: 15
        };
      }

      let ticketsSold = eventInfo.ticketsSold;
      if (
        !ticketsSold ||
        typeof ticketsSold.male !== "number" ||
        typeof ticketsSold.female !== "number"
      ) {
        ticketsSold = {
          male: 0,
          female: 0
        };
      }

      let maleTicketsAvailable = ticketPerGender.male - ticketsSold.male;
      let femaleTicketsAvailable = ticketPerGender.female - ticketsSold.female;

      const genderSelect = document.getElementById("payment-gender");
      const eventDetails = document.getElementById("event-details");

      // Reset selected value
      genderSelect.value = "";
      refreshGenderSelect(maleTicketsAvailable, femaleTicketsAvailable);
      
      let ticketsAvailable = 0;

      // 🔥 remove options based on availability (duplicate-proof)
      if (genderSelect) {

        // First: reset all options (remove existing SOLD OUT labels)
        genderSelect.querySelectorAll("option").forEach(opt => {
          opt.disabled = false;
          opt.textContent = opt.textContent.replace(/\s*\(SOLD OUT\)/gi, "");
        });

        // Disable Male if sold out
        if (maleTicketsAvailable <= 0) {
          const maleOption = genderSelect.querySelector('option[value="Male"]');
          if (maleOption) {
            maleOption.disabled = true;
            maleOption.textContent += " (SOLD OUT)";
          }
        }

        // Disable Female if sold out
        if (femaleTicketsAvailable <= 0) {
          const femaleOption = genderSelect.querySelector('option[value="Female"]');
          if (femaleOption) {
            femaleOption.disabled = true;
            femaleOption.textContent += " (SOLD OUT)";
          }
        }
      }

      genderSelect.addEventListener("change", (e) => {
        const value = e.target.value;
        console.log("Selected:", value);
      });

      eventDetails.addEventListener("click", (e) => {
        const gender = genderSelect.value;

        if (!gender) {
          e.preventDefault();     // stop links, buttons, forms
          e.stopImmediatePropagation(); // stop ALL handlers from firing
          alert("Please select your gender first.");
        }

        if (gender === "Male") {
          ticketsAvailable = maleTicketsAvailable;
        } else if (gender === "Female") {
          ticketsAvailable = femaleTicketsAvailable;
        }
        renderTotals();
      }, true);  // <-- this 'true' enables capture mode

      // === POPULATE UI ===
      const ticketName = document.getElementById("ticket-name");
      const ticketEventDate = document.getElementById("ticket-event-date");
      const ticketPrice = document.getElementById("ticket-price");
      const ticketImage = document.getElementById("ticket-image");
      const ticketUndiscounted = document.getElementById("ticket-undiscounted-price");
      const ticketDiscountWrap = document.getElementById("ticket-discount-percent-wrap");
      const ticketDiscount = document.getElementById("ticket-discount-percent");
      const ticketTagWrap = document.getElementById("ticket-tag-wrap");
      const ticketTag = document.getElementById("ticket-tag");
      

      ticketName.textContent = eventName;
      ticketEventDate.textContent = eventDate;
      if (eventImage) {
        ticketImage.style.backgroundImage = `url("${eventImage}")`;
      } else {
        ticketImage.style.backgroundImage = "none";
      }
      

      if (priceInfo) {
        const price = priceInfo.price || 0;
        const undiscounted = priceInfo.undiscounted_price || null;
        const tag = priceInfo.tag || "";

        ticketPrice.textContent = `£${price.toFixed(2)}`;

        if (undiscounted && undiscounted > price) {
          ticketUndiscounted.style.display = "inline";
          ticketUndiscounted.textContent = `£${undiscounted.toFixed(2)}`;
          const discountPercent = Math.round(((undiscounted - price) / undiscounted) * 100);
          ticketDiscountWrap.style.display = "inline";
          ticketDiscount.textContent = `-${discountPercent}%`;
        } else {
          ticketUndiscounted.style.display = "none";
          ticketDiscountWrap.style.display = "none";
        }

        if (tag && tag.trim() !== "") {
          ticketTagWrap.style.display = "inline-flex";
          ticketTag.textContent = tag;
        } else {
          ticketTagWrap.style.display = "none";
        }
      }

      // === PRICE + QUANTITY ===
      const qtyMinus = document.getElementById("qty-minus");
      const qtyPlus = document.getElementById("qty-plus");
      const qtyText = document.getElementById("qty-text");
      const totalPriceEl = document.getElementById("ticket-total-price");

      let quantity = 1;
      let unitPrice = priceInfo?.price || 0;

      // === PROMO CODE ELEMENTS ===
      const promoInputWrapper = document.querySelector(".promo-code-input-wrapper");
      const promoInput = document.querySelector(".promo-code-input");
      const promoApplyText = document.querySelector(".promo-code-apply-text");
      const promoTotalWrapper = document.querySelector(".promo-code-total-wrapper");
      const promoDiscountText = document.querySelector(".promo-code-discount-text");
      const promoSubtotalText = document.querySelector(".promo-code-subtotal-text");
      const promoDiscountValue = document.querySelector(".promo-discount-text");
      const promoDiscountCodeText = document.querySelector(".promo-discount-code-text");
      const promoRemoveWrapper = document.querySelector(".promo-code-remove-wrapper");

      // initial UI states
      promoInputWrapper.style.display = "flex";
      promoTotalWrapper.style.display = "none";
      promoApplyText.style.display = "none";

      // promo state
      let promoState = null;

      let finalTotal = unitPrice * quantity;

      function renderTotals() {
        const subtotal = unitPrice * quantity;
        let total = subtotal;

        if (promoState) {
          const discount = (promoState.discountPerUnit || 0) * quantity;
          total = Math.max(0, subtotal - discount);
          promoSubtotalText.textContent = `£${subtotal.toFixed(2)}`;
          promoDiscountValue.textContent = `-£${discount.toFixed(2)}`;
        }

        totalPriceEl.textContent = `£${total.toFixed(2)}`;
        qtyText.textContent = quantity;

        // Disable + button if the next bundle will exceed availability
        const nextTicketCount = (quantity + 1) * ticketsPerUnit;
        qtyPlus.style.opacity = nextTicketCount > ticketsAvailable ? "0.4" : "1";
        qtyPlus.style.pointerEvents = nextTicketCount > ticketsAvailable ? "none" : "auto";

        finalTotal = total;
      }

      qtyMinus.onclick = () => {
        if (quantity > 1) {
          quantity--;
          renderTotals();
        }
      };
      qtyPlus.onclick = () => {
        if ((quantity + 1) * ticketsPerUnit <= ticketsAvailable) {
          quantity++;
          renderTotals();
        } else {
          alert(`Only ${ticketsAvailable} ${userGender} ticket(s) are available.`);
        }
      };

      renderTotals(); 

      // === PROMO CODE LOGIC ===
      promoInput.addEventListener("input", () => {
        promoApplyText.style.display = promoInput.value.trim() ? "flex" : "none";
      });

      promoApplyText.addEventListener("click", async () => {
        const code = promoInput.value.trim();
        if (!code) return;

        processingOverlay.style.display = "flex";
        processingOverlay.innerHTML = "<div>Validating promo code...</div>";

        try {
          const res = await fetch("https://validatepromo-xmismu3jga-uc.a.run.app", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code,
              slug,
              quantity,
              amountPerUnit: unitPrice
            }),
          });
          const data = await res.json();
          processingOverlay.style.display = "none";

          if (!data.success) {
            alert(data.error || "This code is invalid.");
            return;
          }

          const { promo, discount } = data;

          promoState = {
            code: promo.code,
            type: promo.type,
            value: promo.value,
            discountPerUnit: discount.discountPerUnit
          };

          promoInputWrapper.style.display = "none";
          promoTotalWrapper.style.display = "block";
          promoDiscountText.textContent =
            promo.type === "percentage" ? `${promo.value}% off` : `£${Number(promo.value).toFixed(2)} off`;
          promoDiscountCodeText.textContent = promo.code;

          renderTotals();
        } catch (err) {
          console.error("Promo code error:", err);
          alert("This code is invalid.");
          processingOverlay.style.display = "none";
        }
      });

      promoRemoveWrapper.addEventListener("click", () => {
        promoState = null;
        promoTotalWrapper.style.display = "none";
        promoInputWrapper.style.display = "flex";
        promoInput.value = "";
        promoApplyText.style.display = "none";
        renderTotals();
      });

      processingOverlay.style.display = "none";
      popup.style.display = "flex";
      // Disable background scroll when popup opens
      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      if (loadingSpinner) loadingSpinner.style.display = "none";

      // === PAY BUTTON ===
      const payBtn = document.getElementById("payment-book-button");
      payBtn.value ="Book & Secure Payment";
      payBtn.onclick = async (event) => {
        event.preventDefault();
        processingOverlay.innerHTML = "<div>Setting up payment, please wait...</div>";
        processingOverlay.style.display = "flex";

        const userName = document.getElementById("payment-name").value;
        const userEmail = document.getElementById("payment-email").value;
        const userPhone = document.getElementById("payment-phone").value;
        const userCity = document.getElementById("payment-city").value;
        const userGender = document.getElementById("payment-gender").value; 
        const hearSelect = document.getElementById("hear-select").value;

        let subtotal = unitPrice * quantity;
        let finalTotalPrice = subtotal;
        if (promoState) {
          const discount = (promoState.discountPerUnit || 0) * quantity;
          finalTotalPrice = Math.max(0, subtotal - discount);
        }

        // === Validate Required Fields ===
        const requiredFields = [
            { field: userName, name: "Name" },
            { field: userEmail, name: "Email" },
            { field: userPhone, name: "Phone" },
            { field: userCity, name: "City" },
            { field: userGender, name: "Gender" },
            { field: hearSelect, name: "Hear about" },
        ];

        const missing = requiredFields.filter(f => !f.field);

        if (missing.length > 0) {
          alert(`Please fill in the following required fields:\n\n${missing.map(f => "• " + f.name).join("\n")}`);
          processingOverlay.style.display = "none";
          return; // Stop execution
        }

        try {
          const response = await fetch("https://us-central1-cosmic-fusion.cloudfunctions.net/createBookingDraft", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventData: {
                eventId: eventData.eventId,
                eventCity,
                eventDate,
                slug,
                venueAddress,
                venueName,
              },
              purchaseData: {
                amount: finalTotalPrice,
                currency: "GBP",
                priceId: selectedPriceId,
                promoCode: promoState?.code || "N/A",
                quantity,
              },
              userDetails: {
                name: userName,
                email: userEmail,
                gender: userGender,
                phone: userPhone,
              },
            }),
          });

          const data = await response.json();
          if (!response.ok) {
            wfErr("🔥 Error creating booking draft:", data.error);
            alert("Error creating payment: " + data.error);
            processingOverlay.style.display = "none";
            return;
          }

        //   window.location.href = data.url;
        } catch (err) {
          alert("Something went wrong processing your payment: " + (err.message || err));
        } finally {
          processingOverlay.style.display = "none";
        }
      };

    } catch (err) {
      console.error("🔥 Setup failed:", err);
      paymentForm.innerHTML = `<div style="color:red;text-align:center;">Something went wrong initializing payment.</div>`;
    }
  });

  // Close popup
  document.querySelectorAll(".close-popup").forEach(btn => {
    // Re-select the popup + form for this script
    const popup = document.getElementById("payment-popup");
    const paymentForm = document.getElementById("payment");
    
    document.querySelectorAll(".close-popup").forEach(btn => {
      btn.addEventListener("click", () => {

        // Re-enable background scroll
        const scrollY = document.body.style.top;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, parseInt(scrollY || "0") * -1);

        // Close popup
        popup.style.display = "none";

        // Optional: reset form contents
        paymentForm.innerHTML = "";
      });
    });
  });
})();
