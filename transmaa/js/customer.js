/* ============================================================
   TRANSMAA — Customer App
   ============================================================ */

"use strict";

const GOODS_TYPES = [
  "House Shifting","Timber/Plywood/Laminate","Electrical/Electronics/Home Appliances",
  "General","Building/Construction","Catering/Restaurant/Event Management",
  "Machines/Equipments/Spare Parts/Metals","Textile/Garments/Fashion Accessories",
  "Furniture/Home Furnishing","Ceramics/Sanitary/Hardware","Paper/Packaging/Printed Material",
];

const TRUCK_TYPES = [
  { name:"LCV",        capacity:"2.5–7 Tons",  icon:"🚐", desc:"Mini goods" },
  { name:"Open",       capacity:"7–11 Tons",   icon:"🚛", desc:"Open body" },
  { name:"Dumper",     capacity:"9–16 Tons",   icon:"🚚", desc:"Construction" },
  { name:"Tipper",     capacity:"9–24 Tons",   icon:"🏗️", desc:"Sand/gravel" },
  { name:"Container",  capacity:"9–30 Tons",   icon:"📦", desc:"Enclosed" },
  { name:"Trailer",    capacity:"16–43 Tons",  icon:"🚜", desc:"Heavy loads" },
  { name:"Multi-Axle", capacity:"20–36 Tons",  icon:"🛻", desc:"Extra heavy" },
];

class CustomerApp {
  constructor(container, { phone, user }) {
    this.container = container;
    this.phone = phone;
    this.user  = user;
    this.tab   = "home";
    this.screen = "route";        // home sub-screens
    this.booking = { from:"", to:"", date:"", time:"", goods: GOODS_TYPES[0], truck: null };
    this.bookings = [];
    this.vehicles = [];
    this.createdBooking = null;
    this.finType = "Finance";
    this.interestVehicle = null;
    this._buildShell();
    this._renderTab();
  }

  // ── Shell ────────────────────────────────────────────────
  _buildShell() {
    this.container.innerHTML = `
      <div class="app-shell" id="cu-shell">
        <div id="cu-page" class="page"></div>
        <nav id="cu-nav" class="bottom-nav"></nav>
      </div>`;
    this._renderNav();
  }

  _renderNav() {
    TM.renderBottomNav(
      document.getElementById("cu-nav"),
      [
        { key:"home",    icon:"🏠", label:"Home" },
        { key:"history", icon:"📋", label:"Bookings" },
        { key:"finance", icon:"💰", label:"Finance" },
        { key:"market",  icon:"🛒", label:"Market" },
      ],
      this.tab,
      key => { this.tab = key; this.screen = "route"; this._renderTab(); }
    );
  }

  _renderTab() {
    this._renderNav();
    if (this.tab === "home")    this._renderHome();
    if (this.tab === "history") this._renderHistory();
    if (this.tab === "finance") this._renderFinance();
    if (this.tab === "market")  this._renderMarket();
  }

  _page() { return document.getElementById("cu-page"); }

  // ── HOME ─────────────────────────────────────────────────
  _renderHome() {
    if (this.screen === "route")   this._renderRoute();
    if (this.screen === "details") this._renderDetails();
    if (this.screen === "confirm") this._renderConfirm();
    if (this.screen === "success") this._renderSuccess();
  }

  _renderRoute() {
    this._page().innerHTML = `
      <div class="fade-up">
        <div style="margin-bottom:22px">
          <div style="font-size:13px;color:var(--orange);font-weight:700">Good day 👋</div>
          <div class="t-display">${this.user?.name || "Welcome"}</div>
          <div class="t-sub mt-sm">Where are you moving today?</div>
        </div>

        <div class="promo-banner">
          <div class="promo-banner__bg">🚛</div>
          <div class="promo-banner__tag">Limited Offer</div>
          <div class="promo-banner__title">10% OFF</div>
          <div class="promo-banner__sub">On all truck types this week</div>
        </div>

        ${TM.card(`
          <label class="t-label">📍 Load From</label>
          <input id="cu-from" class="input" placeholder="Enter pickup location" value="${this.booking.from}">
          <label class="t-label">📍 Unload To</label>
          <input id="cu-to" class="input" placeholder="Enter drop location" style="margin-bottom:4px" value="${this.booking.to}">
          <button id="cu-confirm-route" class="btn btn--primary mt-md">Confirm Route →</button>
        `, "Book a Truck")}
      </div>`;

    $("#cu-confirm-route").addEventListener("click", () => {
      const from = $("#cu-from").value.trim();
      const to   = $("#cu-to").value.trim();
      if (!from || !to) { TM.showToast("Enter both locations", "error"); return; }
      this.booking.from = from;
      this.booking.to   = to;
      this.screen = "details";
      this._renderHome();
    });
  }

  _renderDetails() {
    const truckGrid = TRUCK_TYPES.map(t => `
      <div class="truck-card${this.booking.truck === t.name ? " truck-card--selected" : ""}"
           data-truck="${t.name}">
        <div class="truck-card__icon">${t.icon}</div>
        <div class="truck-card__name">${t.name}</div>
        <div class="truck-card__cap">${t.capacity}</div>
      </div>`).join("");

    const goodsOptions = GOODS_TYPES.map(g =>
      `<option value="${g}" ${this.booking.goods === g ? "selected" : ""}>${g}</option>`).join("");

    this._page().innerHTML = `
      <div class="fade-up">
        <button class="btn btn--secondary btn--sm" id="cu-back-details" style="width:auto;margin-bottom:16px">← Back</button>
        <div class="t-display mb-sm">Booking Details</div>
        <div class="t-sub mb-lg">${this.booking.from} → ${this.booking.to}</div>

        ${TM.card(`
          <div class="row">
            <div class="flex-1">
              <label class="t-label">Shift Date</label>
              <input id="cu-date" type="date" class="input" value="${this.booking.date}">
            </div>
            <div class="flex-1">
              <label class="t-label">Shift Time</label>
              <input id="cu-time" type="time" class="input" value="${this.booking.time}">
            </div>
          </div>
          <label class="t-label">Type of Goods</label>
          <select id="cu-goods" class="select">${goodsOptions}</select>
        `, "When & What")}

        ${TM.card(`<div class="truck-grid">${truckGrid}</div>`, "Choose Truck Type")}

        <button id="cu-to-confirm" class="btn btn--primary">Book Pickup →</button>
      </div>`;

    $("#cu-back-details").addEventListener("click", () => { this.screen = "route"; this._renderHome(); });

    // Truck selection
    $$(".truck-card").forEach(card => {
      card.addEventListener("click", () => {
        this.booking.truck = card.dataset.truck;
        $$(".truck-card").forEach(c => c.classList.remove("truck-card--selected"));
        card.classList.add("truck-card--selected");
        $$(".truck-card__name").forEach(n => n.style.color = "");
        card.querySelector(".truck-card__name").style.color = "var(--orange)";
      });
    });

    $("#cu-to-confirm").addEventListener("click", () => {
      this.booking.date  = $("#cu-date").value;
      this.booking.time  = $("#cu-time").value;
      this.booking.goods = $("#cu-goods").value;
      if (!this.booking.truck || !this.booking.date || !this.booking.time) {
        TM.showToast("Please fill all details", "error"); return;
      }
      this.screen = "confirm";
      this._renderHome();
    });
  }

  _renderConfirm() {
    const truck = TRUCK_TYPES.find(t => t.name === this.booking.truck);
    this._page().innerHTML = `
      <div class="fade-up">
        <button class="btn btn--secondary btn--sm" id="cu-back-confirm" style="width:auto;margin-bottom:16px">← Back</button>
        <div class="t-display mb-sm">Confirm Pickup</div>
        <div class="t-sub mb-lg">Review your booking</div>

        ${TM.card(`
          <div class="row" style="align-items:center;margin-bottom:16px">
            <span style="font-size:40px">${truck?.icon}</span>
            <div style="margin-left:12px;flex:1">
              <div class="t-h3">${truck?.name} Truck</div>
              <div class="t-sub">${truck?.capacity}</div>
            </div>
            <span class="chip chip--warn">⏳ Awaiting Staff</span>
          </div>
          <div class="card-divider"></div>
          ${TM.infoRow("From",      this.booking.from)}
          ${TM.infoRow("To",        this.booking.to)}
          ${TM.infoRow("Date",      this.booking.date)}
          ${TM.infoRow("Time",      this.booking.time)}
          ${TM.infoRow("Goods",     this.booking.goods)}
          ${TM.infoRow("Customer",  this.user?.name || "You")}
        `)}

        <button id="cu-submit" class="btn btn--primary">✓ Confirm & Book</button>
      </div>`;

    $("#cu-back-confirm").addEventListener("click", () => { this.screen = "details"; this._renderHome(); });
    $("#cu-submit").addEventListener("click", async () => {
      const btn = $("#cu-submit");
      btn.innerHTML = `<span class="btn-spinner"></span>`;
      btn.disabled = true;
      const res = await API.createBooking({
        ...this.booking,
        customerId:    this.phone,
        customerName:  this.user?.name || "Customer",
        customerPhone: `+91${this.phone}`,
        truckType:     this.booking.truck,
        truckCapacity: TRUCK_TYPES.find(t => t.name === this.booking.truck)?.capacity,
      });
      btn.innerHTML = "✓ Confirm & Book";
      btn.disabled = false;
      if (res.success) {
        this.createdBooking = res.booking;
        this.screen = "success";
        this._renderHome();
        TM.showToast("Booking placed!", "success");
      }
    });
  }

  _renderSuccess() {
    const b = this.createdBooking;
    this._page().innerHTML = `
      <div class="fade-up" style="text-align:center;padding-top:40px">
        <div style="font-size:72px;margin-bottom:16px">🎉</div>
        <div class="t-display">Booking Placed!</div>
        <div class="t-sub" style="margin:8px 0 24px">
          Your booking ID is <strong style="color:var(--orange)">${b.id}</strong><br>
          Transmaa staff will verify and confirm soon.
        </div>
        ${TM.card(`
          ${TM.infoRow("Booking ID", b.id)}
          ${TM.infoRow("Route", `${b.from?.split(",")[0]} → ${b.to?.split(",")[0]}`)}
          ${TM.infoRow("Truck", b.truckType)}
          ${TM.infoRow("Goods", b.goods)}
          ${TM.infoRow("Status", `<span class="chip chip--warn">⏳ Awaiting Staff</span>`)}
        `, "", "card--highlight")}
        <button id="cu-book-another" class="btn btn--primary">Book Another</button>
        <button id="cu-view-history" class="btn btn--secondary mt-sm">View My Bookings</button>
      </div>`;

    $("#cu-book-another").addEventListener("click", () => {
      this.booking = { from:"", to:"", date:"", time:"", goods: GOODS_TYPES[0], truck: null };
      this.screen = "route";
      this._renderHome();
    });
    $("#cu-view-history").addEventListener("click", () => {
      this.tab = "history";
      this._renderTab();
    });
  }

  // ── HISTORY ──────────────────────────────────────────────
  async _renderHistory() {
    const page = this._page();
    page.innerHTML = `
      <div class="t-display mb-sm">My Bookings</div>
      <div class="t-sub mb-lg">Track all your shipments</div>
      <div id="cu-booking-list"></div>`;
    TM.showLoading($("#cu-booking-list"), 3);
    const data = await API.getBookings(this.phone);
    this.bookings = data;
    const list = $("#cu-booking-list");
    if (!data.length) { TM.showEmpty(list, "📦", "No bookings yet"); return; }
    list.innerHTML = data.map(b => TM.bookingCard(b)).join("");
  }

  // ── FINANCE ──────────────────────────────────────────────
  _renderFinance() {
    this._page().innerHTML = `
      <div class="fade-up">
        <div class="t-display mb-sm">Finance & Insurance</div>
        <div class="t-sub mb-lg">Get financial services for your commercial vehicle</div>
        <div class="toggle-row">
          <button class="toggle-btn${this.finType==="Finance"?" toggle-btn--active":""}" id="fin-tab-finance">💰 Finance</button>
          <button class="toggle-btn${this.finType==="Insurance"?" toggle-btn--active":""}" id="fin-tab-insurance">🛡️ Insurance</button>
        </div>
        ${TM.card(`
          <label class="t-label">Full Name</label>
          <input id="fin-name" class="input" placeholder="Your name" value="${this.user?.name||""}">
          <label class="t-label">Phone Number</label>
          <input id="fin-phone" class="input" placeholder="Your phone number">
          <label class="t-label">Type of Vehicle</label>
          <input id="fin-vehicle" class="input" placeholder="e.g. TATA LPT 1618">
          <label class="t-label">RC Number</label>
          <input id="fin-rc" class="input" placeholder="Registration Certificate No." style="margin-bottom:4px">
          <button id="fin-submit" class="btn btn--primary mt-md">Submit Enquiry</button>
        `, `${this.finType} Enquiry`)}
      </div>`;

    $("#fin-tab-finance").addEventListener("click", () => { this.finType = "Finance"; this._renderFinance(); });
    $("#fin-tab-insurance").addEventListener("click", () => { this.finType = "Insurance"; this._renderFinance(); });
    $("#fin-submit").addEventListener("click", async () => {
      const name = $("#fin-name").value.trim();
      const phone = $("#fin-phone").value.trim();
      const vehicleType = $("#fin-vehicle").value.trim();
      const rcNumber = $("#fin-rc").value.trim();
      if (!name || !phone || !vehicleType || !rcNumber) { TM.showToast("Fill all fields", "error"); return; }
      const btn = $("#fin-submit");
      btn.innerHTML = `<span class="btn-spinner"></span>`;
      btn.disabled = true;
      await API.submitFinanceEnquiry({ name, phone, vehicleType, rcNumber, enquiryType: this.finType });
      TM.showToast("Enquiry submitted! We'll contact you shortly.", "success");
      this._page().innerHTML = `
        <div style="text-align:center;padding:60px 24px">
          <div style="font-size:64px;margin-bottom:16px">✅</div>
          <div class="t-h2">Enquiry Submitted!</div>
          <div class="t-sub mt-sm mb-lg">Our team will contact you soon at ${phone}</div>
          <button id="fin-another" class="btn btn--secondary">Submit Another</button>
        </div>`;
      $("#fin-another").addEventListener("click", () => this._renderFinance());
    });
  }

  // ── MARKET ───────────────────────────────────────────────
  async _renderMarket() {
    const page = this._page();
    page.innerHTML = `
      <div class="t-display mb-sm">Commercial Vehicles</div>
      <div class="toggle-row mt-sm">
        <button class="toggle-btn toggle-btn--active">🛒 Buy</button>
        <button class="toggle-btn" id="market-sell-toggle">💸 Sell</button>
      </div>
      <div id="vehicle-list"></div>`;

    TM.showLoading($("#vehicle-list"), 3);
    const data = await API.getVehicles();
    this.vehicles = data.filter(v => v.status === "listed");
    const list = $("#vehicle-list");
    if (!this.vehicles.length) { TM.showEmpty(list, "🚗", "No vehicles listed right now"); return; }

    list.innerHTML = this.vehicles.map(v => TM.card(`
      <div class="vehicle-card">
        <div class="vehicle-thumb">🚗</div>
        <div style="flex:1">
          <div class="t-h3">${v.model}</div>
          <div class="t-caption mt-sm">Year: ${v.year}</div>
          <div class="t-caption">RC: ${v.rcNo}</div>
          <div class="t-caption">Seller: ${v.sellerName}</div>
        </div>
      </div>
      <button class="btn btn--ghost btn--sm mt-md" style="width:100%" data-vid="${v.id}">Interested to Buy →</button>
    `)).join("");

    $$("[data-vid]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.interestVehicle = this.vehicles.find(v => v.id === btn.dataset.vid);
        this._showInterestModal();
      });
    });

    $("#market-sell-toggle").addEventListener("click", () => this._renderSellForm());
  }

  _showInterestModal() {
    const v = this.interestVehicle;
    const overlay = TM.el("div", "modal-overlay");
    overlay.innerHTML = `
      <div class="modal-sheet">
        <div class="modal-sheet__handle"></div>
        <div class="t-h3 mb-sm">Express Interest</div>
        <div class="t-sub mb-lg">${v.model} (${v.year}) — Transmaa will connect you with the seller</div>
        <button id="interest-confirm" class="btn btn--primary">Confirm Interest</button>
        <button id="interest-cancel"  class="btn btn--secondary mt-sm">Cancel</button>
      </div>`;
    document.body.appendChild(overlay);
    $("#interest-confirm").addEventListener("click", async () => {
      await API.expressInterest(v.id, this.user?.name || "Buyer", `+91${this.phone}`);
      overlay.remove();
      TM.showToast("Interest noted! Our team will contact you.", "success");
    });
    $("#interest-cancel").addEventListener("click", () => overlay.remove());
  }

  _renderSellForm() {
    this._page().innerHTML = `
      <div class="fade-up">
        <button class="btn btn--secondary btn--sm" id="sell-back" style="width:auto;margin-bottom:16px">← Back to Buy</button>
        <div class="t-h2 mb-sm">List Your Vehicle</div>
        <div class="t-sub mb-lg">Submit details for Transmaa to verify and list</div>
        ${TM.card(`
          <label class="t-label">Your Name</label>
          <input id="sell-name" class="input" placeholder="Seller name" value="${this.user?.name||""}">
          <label class="t-label">Phone Number</label>
          <input id="sell-phone" class="input" placeholder="Contact number">
          <label class="t-label">Vehicle Number</label>
          <input id="sell-vno" class="input" placeholder="e.g. TS07AB1234">
          <label class="t-label">Vehicle Model</label>
          <input id="sell-model" class="input" placeholder="e.g. Mahindra TUV300">
          <label class="t-label">RC Number</label>
          <input id="sell-rc" class="input" placeholder="Registration Certificate No.">
          <label class="t-label">Year of Manufacture</label>
          <input id="sell-year" class="input" placeholder="e.g. 2019" type="number">
          <div class="card-title mt-md">Upload 4 Photos</div>
          <div class="photo-grid">
            <div class="photo-slot"><span class="photo-slot__icon">📷</span>Front Side</div>
            <div class="photo-slot"><span class="photo-slot__icon">📷</span>Back Side</div>
            <div class="photo-slot"><span class="photo-slot__icon">📷</span>Left Side</div>
            <div class="photo-slot"><span class="photo-slot__icon">📷</span>Right Side</div>
          </div>
          <button id="sell-submit" class="btn btn--primary">Save & Submit for Review</button>
        `, "Vehicle Details")}
      </div>`;

    $("#sell-back").addEventListener("click", () => this._renderMarket());
    $("#sell-submit").addEventListener("click", async () => {
      const data = {
        sellerName: $("#sell-name").value.trim(),
        phone: $("#sell-phone").value.trim(),
        vehicleNo: $("#sell-vno").value.trim(),
        model: $("#sell-model").value.trim(),
        rcNo: $("#sell-rc").value.trim(),
        year: $("#sell-year").value.trim(),
      };
      if (!Object.values(data).every(v => v)) { TM.showToast("Fill all fields", "error"); return; }
      const btn = $("#sell-submit");
      btn.innerHTML = `<span class="btn-spinner"></span>`;
      btn.disabled = true;
      await API.listVehicle(data);
      TM.showToast("Vehicle submitted for review!", "success");
      this._page().innerHTML = `
        <div style="text-align:center;padding:60px 24px">
          <div style="font-size:64px;margin-bottom:16px">✅</div>
          <div class="t-h2">Submitted!</div>
          <div class="t-sub mt-sm mb-lg">Transmaa will verify and list your vehicle shortly.</div>
          <button id="sell-back2" class="btn btn--secondary">← Back to Market</button>
        </div>`;
      $("#sell-back2").addEventListener("click", () => this._renderMarket());
    });
  }
}

window.CustomerApp = CustomerApp;
