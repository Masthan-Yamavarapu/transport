/* ============================================================
   TRANSMAA — Staff Dashboard App
   ============================================================ */

"use strict";

class StaffApp {
  constructor(container, { phone, user }) {
    this.container = container;
    this.phone = phone;
    this.user  = user;
    this.tab   = "orders";
    this._buildShell();
    this._renderTab();
  }

  _buildShell() {
    this.container.innerHTML = `
      <div class="app-shell">
        <div id="staff-header" style="background:var(--ink);padding:48px 20px 0"></div>
        <div id="staff-page" class="page" style="padding-top:20px"></div>
        <nav id="staff-nav" class="bottom-nav"></nav>
      </div>`;
    this._renderHeader();
    this._renderNav();
  }

  _renderHeader() {
    document.getElementById("staff-header").innerHTML = `
      <div class="t-caption" style="color:rgba(255,255,255,0.5);letter-spacing:2px;text-transform:uppercase;margin-bottom:4px">Staff Portal</div>
      <div style="font-family:var(--font-display);font-size:22px;font-weight:800;color:#fff">Dashboard</div>
      <div id="staff-tab-icons" style="display:flex;gap:10px;margin-top:14px;padding-bottom:0"></div>`;
  }

  _renderNav() {
    TM.renderBottomNav(
      document.getElementById("staff-nav"),
      [
        { key:"orders",  icon:"📦", label:"Orders" },
        { key:"active",  icon:"✅", label:"Active" },
        { key:"drivers", icon:"🪪", label:"Drivers" },
        { key:"finance", icon:"💰", label:"Finance" },
        { key:"market",  icon:"🛒", label:"Market" },
      ],
      this.tab,
      key => { this.tab = key; this._renderTab(); }
    );
  }

  _page() { return document.getElementById("staff-page"); }

  async _renderTab() {
    this._renderNav();
    const page = this._page();
    TM.showLoading(page, 3);
    if (this.tab === "orders")  await this._renderOrders();
    if (this.tab === "active")  await this._renderActive();
    if (this.tab === "drivers") await this._renderDrivers();
    if (this.tab === "finance") await this._renderFinance();
    if (this.tab === "market")  await this._renderMarket();
  }

  // ── ORDERS (pending verification) ────────────────────────
  async _renderOrders() {
    const page = this._page();
    const all = await API.getAllBookings();
    const pending = all.filter(b => b.status === "waiting");
    const delivered = all.filter(b => b.status === "delivered");

    page.innerHTML = `
      <div class="t-h2 mb-sm">Pending Orders</div>
      <div class="t-sub mb-lg">Review and accept/reject customer bookings</div>
      <div id="pending-list"></div>
      ${delivered.length ? `
        <div class="card-title mt-lg mb-sm">Delivered (${delivered.length})</div>
        <div id="delivered-list"></div>` : ""}`;

    const pList = document.getElementById("pending-list");
    if (!pending.length) { TM.showEmpty(pList, "📭", "No pending orders"); }
    else {
      pList.innerHTML = pending.map(b => TM.bookingCard(b, `
        <div class="btn-row">
          <button class="btn btn--success btn--sm" data-action="accept" data-id="${b.id}">✓ Accept</button>
          <button class="btn btn--danger  btn--sm" data-action="reject" data-id="${b.id}">✕ Reject</button>
        </div>`)).join("");
    }

    const dList = document.getElementById("delivered-list");
    if (dList) dList.innerHTML = delivered.map(b => TM.bookingCard(b)).join("");

    $$("[data-action]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const { id, action } = btn.dataset;
        btn.innerHTML = `<span class="btn-spinner"></span>`;
        btn.disabled = true;
        if (action === "accept") {
          await API.updateBookingStatus(id, "waiting_driver");
          TM.showToast("Order accepted & sent to drivers ✅", "success");
        } else {
          await API.updateBookingStatus(id, "rejected");
          TM.showToast("Order rejected", "error");
        }
        this._renderOrders();
      });
    });
  }

  // ── ACTIVE (driver assigned) ──────────────────────────────
  async _renderActive() {
    const page = this._page();
    const all = await API.getAllBookings();
    const active = all.filter(b => ["waiting_driver","driver_accepted","on_the_way"].includes(b.status));

    page.innerHTML = `
      <div class="t-h2 mb-sm">Active Orders</div>
      <div class="t-sub mb-lg">Monitor in-progress shipments</div>
      <div id="active-list"></div>`;

    const list = document.getElementById("active-list");
    if (!active.length) { TM.showEmpty(list, "📭", "No active orders right now"); return; }

    list.innerHTML = active.map(b => TM.bookingCard(b,
      b.status === "driver_accepted" ? `
        <button class="btn btn--primary btn--sm" data-action="sms" data-id="${b.id}">📱 Send Confirmation SMS</button>` : ""
    )).join("");

    $$("[data-action='sms']").forEach(btn => {
      btn.addEventListener("click", () => this._showPriceModal(btn.dataset.id));
    });
  }

  _showPriceModal(bookingId) {
    const overlay = TM.el("div", "modal-overlay");
    overlay.innerHTML = `
      <div class="modal-sheet">
        <div class="modal-sheet__handle"></div>
        <div class="t-h3 mb-sm">Send Confirmation</div>
        <div class="t-sub mb-lg">Enter agreed transportation price for ${bookingId}</div>
        <label class="t-label">Agreed Price (₹)</label>
        <input id="price-input" class="input" type="number" placeholder="e.g. 15000">
        <button id="price-send" class="btn btn--primary mt-md">📱 Send SMS to Customer & Driver</button>
        <button id="price-cancel" class="btn btn--secondary mt-sm">Cancel</button>
      </div>`;
    document.body.appendChild(overlay);

    document.getElementById("price-send").addEventListener("click", async () => {
      const price = parseInt(document.getElementById("price-input").value);
      if (!price || price < 1) { TM.showToast("Enter valid price", "error"); return; }
      const btn = document.getElementById("price-send");
      btn.innerHTML = `<span class="btn-spinner"></span>`;
      btn.disabled = true;
      await API.sendConfirmationSMS(bookingId, price);
      overlay.remove();
      TM.showToast("SMS sent to customer & driver ✅", "success");
      this._renderActive();
    });
    document.getElementById("price-cancel").addEventListener("click", () => overlay.remove());
  }

  // ── DRIVERS ───────────────────────────────────────────────
  async _renderDrivers() {
    const page = this._page();
    const drivers = await API.getDrivers();
    page.innerHTML = `<div class="t-h2 mb-lg">Driver Registrations</div><div id="driver-list"></div>`;

    const list = document.getElementById("driver-list");
    if (!drivers.length) { TM.showEmpty(list, "🚛", "No driver registrations"); return; }

    // Group by status
    ["pending","approved","rejected"].forEach(status => {
      const group = drivers.filter(d => d.status === status);
      if (!group.length) return;
      const wrap = TM.el("div");
      wrap.innerHTML = `<div class="card-title mt-sm mb-sm" style="color:${status==="pending"?"var(--warn)":status==="approved"?"var(--success)":"var(--danger)"}">${status.toUpperCase()} (${group.length})</div>`;
      wrap.innerHTML += group.map(d => TM.driverCard(d,
        status === "pending" ? `
          <div class="btn-row">
            <button class="btn btn--success btn--sm" data-action="approve" data-id="${d.id}">✓ Approve</button>
            <button class="btn btn--danger  btn--sm" data-action="rejectd" data-id="${d.id}">✕ Reject</button>
          </div>` : ""
      )).join("");
      list.appendChild(wrap);
    });

    $$("[data-action='approve']").forEach(btn => {
      btn.addEventListener("click", async () => {
        btn.innerHTML = `<span class="btn-spinner"></span>`; btn.disabled = true;
        await API.updateDriverStatus(btn.dataset.id, "approved");
        TM.showToast("Driver approved ✅", "success");
        this._renderDrivers();
      });
    });
    $$("[data-action='rejectd']").forEach(btn => {
      btn.addEventListener("click", async () => {
        btn.innerHTML = `<span class="btn-spinner"></span>`; btn.disabled = true;
        await API.updateDriverStatus(btn.dataset.id, "rejected");
        TM.showToast("Driver rejected", "error");
        this._renderDrivers();
      });
    });
  }

  // ── FINANCE ───────────────────────────────────────────────
  async _renderFinance() {
    const page = this._page();
    const enquiries = await API.getFinanceEnquiries();
    page.innerHTML = `
      <div class="t-h2 mb-sm">Finance & Insurance</div>
      <div class="t-sub mb-lg">Customer enquiries for vehicle finance & insurance</div>
      <div id="fin-list"></div>`;

    const list = document.getElementById("fin-list");
    if (!enquiries.length) { TM.showEmpty(list, "💰", "No enquiries yet"); return; }

    list.innerHTML = enquiries.map(f => TM.card(`
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px">
        <span class="t-h3">${f.name}</span>
        <span class="chip ${f.enquiryType==="Finance"?"chip--blue":"chip--success"}">
          ${f.enquiryType==="Finance"?"💰":"🛡️"} ${f.enquiryType}
        </span>
      </div>
      ${TM.infoRow("Phone",    f.phone)}
      ${TM.infoRow("Vehicle",  f.vehicleType)}
      ${TM.infoRow("RC No.",   f.rcNumber)}
      ${TM.infoRow("Received", TM.fmtDate(f.submittedAt))}
      <div class="card-divider"></div>
      <button class="btn btn--ghost btn--sm" style="width:100%">📞 Contact Customer</button>
    `)).join("");
  }

  // ── MARKET ────────────────────────────────────────────────
  async _renderMarket() {
    const page = this._page();
    const vehicles = await API.getVehicles();
    const pending = vehicles.filter(v => v.status === "pending_verification");
    const listed  = vehicles.filter(v => v.status === "listed");

    page.innerHTML = `
      <div class="t-h2 mb-lg">Vehicle Marketplace</div>
      ${pending.length ? `
        <div class="card-title" style="color:var(--warn);margin-bottom:10px">PENDING VERIFICATION (${pending.length})</div>
        <div id="mkt-pending"></div>` : ""}
      <div class="card-title mt-lg mb-sm">LISTED VEHICLES (${listed.length})</div>
      <div id="mkt-listed"></div>`;

    const pEl = document.getElementById("mkt-pending");
    if (pEl) {
      pEl.innerHTML = pending.map(v => TM.card(`
        <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px">
          <span class="t-h3">${v.model} (${v.year})</span>
          <span class="chip chip--warn">⏳ Under Review</span>
        </div>
        ${TM.infoRow("Seller",     v.sellerName)}
        ${TM.infoRow("Phone",      v.phone)}
        ${TM.infoRow("Vehicle No.",v.vehicleNo)}
        ${TM.infoRow("RC No.",     v.rcNo)}
        <div class="card-divider"></div>
        <button class="btn btn--success btn--sm" data-vid="${v.id}" style="width:100%">✓ Approve & List</button>
      `)).join("");

      $$("[data-vid]").forEach(btn => {
        btn.addEventListener("click", async () => {
          btn.innerHTML = `<span class="btn-spinner"></span>`; btn.disabled = true;
          await API.approveVehicle(btn.dataset.vid);
          TM.showToast("Vehicle listed ✅", "success");
          this._renderMarket();
        });
      });
    }

    const lEl = document.getElementById("mkt-listed");
    if (!listed.length) { TM.showEmpty(lEl, "🚗", "No vehicles listed yet"); return; }
    lEl.innerHTML = listed.map(v => TM.card(`
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-weight:700">${v.model} (${v.year})</span>
        <span class="chip chip--success">🟢 Listed</span>
      </div>
      ${TM.infoRow("Seller", v.sellerName)}
      ${TM.infoRow("RC No.", v.rcNo)}
      ${v.interestedBuyers?.length ? `
        <div style="margin-top:10px;background:var(--success-bg);border-radius:10px;padding:10px 12px">
          <div style="font-size:11px;font-weight:700;color:var(--success);margin-bottom:4px">INTERESTED BUYERS (${v.interestedBuyers.length})</div>
          ${v.interestedBuyers.map(b => `<div class="t-caption">${b.name} — ${b.phone}</div>`).join("")}
        </div>` : ""}
    `)).join("");
  }
}

window.StaffApp = StaffApp;
