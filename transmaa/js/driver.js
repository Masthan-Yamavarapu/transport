/* ============================================================
   TRANSMAA — Driver App
   ============================================================ */

"use strict";

const VEHICLE_TYPES = ["Mini/Pickup","LCV","Open Truck","Dumper","Tipper","Container","Trailer"];

class DriverApp {
  constructor(container, { phone, user, isNew }) {
    this.container = container;
    this.phone = phone;
    this.user  = user;
    this.isNew = isNew;
    this.tab   = "loads";
    this.regStep = 1;
    this.reg = { name:"", dob:"", gender:"Male", bio:"", experience:"", vehicleType:"Mini/Pickup", vehicleModel:"", vehicleNumber:"", dlNumber:"", panNumber:"" };

    const status = user?.driverStatus;
    if (isNew)                 this._renderRegister();
    else if (status==="pending")  this._renderPending();
    else if (status==="rejected") this._renderRejected();
    else                       this._buildMainApp();
  }

  // ── Blocked States ────────────────────────────────────────
  _renderPending() {
    this.container.innerHTML = `
      <div class="app-shell page--centered">
        <div style="font-size:80px;margin-bottom:20px">🔍</div>
        <div class="t-display">Verification in Progress</div>
        <div class="t-sub" style="margin:8px 0 28px;max-width:280px">
          Our team is reviewing your documents. You'll receive an SMS once approved.
        </div>
        ${TM.card(`
          ${TM.infoRow("Name",      this.user?.name || "Driver")}
          ${TM.infoRow("Status",    `<span class="chip chip--warn">⏳ Pending</span>`)}
          ${TM.infoRow("Submitted", new Date().toLocaleDateString("en-IN"))}
        `)}
        <button id="drv-back-login" class="btn btn--secondary">← Back to Login</button>
      </div>`;
    document.getElementById("drv-back-login").addEventListener("click", () => location.reload());
  }

  _renderRejected() {
    this.container.innerHTML = `
      <div class="app-shell page--centered">
        <div style="font-size:80px;margin-bottom:20px">❌</div>
        <div class="t-display">Profile Rejected</div>
        <div class="t-sub" style="margin:8px 0 28px;max-width:280px">
          Your profile verification was unsuccessful. Please contact support or re-register.
        </div>
        <button id="drv-back2" class="btn btn--secondary">← Back to Login</button>
      </div>`;
    document.getElementById("drv-back2").addEventListener("click", () => location.reload());
  }

  // ── Registration Flow ─────────────────────────────────────
  _renderRegister() {
    this.container.innerHTML = `
      <div class="app-shell">
        <div id="reg-header" style="background:linear-gradient(135deg,var(--orange),var(--orange-dark));padding:52px 24px 20px"></div>
        <div id="reg-body" class="page"></div>
      </div>`;
    this._renderRegHeader();
    this._renderRegStep();
  }

  _renderRegHeader() {
    document.getElementById("reg-header").innerHTML = `
      <div style="font-family:var(--font-display);font-size:24px;font-weight:800;color:#fff">Driver Registration</div>
      <div class="t-caption" style="color:rgba(255,255,255,0.8);margin-top:4px">
        Step ${this.regStep} of 3 — ${["Personal Info","Vehicle & Docs","Review"][this.regStep-1]}
      </div>
      <div class="step-bar">
        ${[1,2,3].map(i => `<div class="step-segment${i===this.regStep?" step-segment--active":i<this.regStep?" step-segment--done":""}"></div>`).join("")}
      </div>`;
  }

  _renderRegStep() {
    this._renderRegHeader();
    const body = document.getElementById("reg-body");
    if (this.regStep === 1) {
      body.innerHTML = `
        ${TM.card(`
          <label class="t-label">Full Name</label>
          <input id="reg-name" class="input" placeholder="Your full name" value="${this.reg.name}">
          <label class="t-label">Date of Birth</label>
          <input id="reg-dob"  class="input" type="date" value="${this.reg.dob}">
          <label class="t-label">Gender</label>
          <select id="reg-gender" class="select">
            ${["Male","Female","Other"].map(g=>`<option ${this.reg.gender===g?"selected":""}>${g}</option>`).join("")}
          </select>
          <label class="t-label">Bio</label>
          <textarea id="reg-bio" class="textarea" placeholder="Brief introduction…">${this.reg.bio}</textarea>
          <button id="reg-next1" class="btn btn--primary">Next →</button>
        `, "Personal Information")}`;

      document.getElementById("reg-next1").addEventListener("click", () => {
        this.reg.name   = document.getElementById("reg-name").value.trim();
        this.reg.dob    = document.getElementById("reg-dob").value;
        this.reg.gender = document.getElementById("reg-gender").value;
        this.reg.bio    = document.getElementById("reg-bio").value.trim();
        if (!this.reg.name || !this.reg.dob) { TM.showToast("Fill all fields", "error"); return; }
        this.regStep = 2;
        this._renderRegStep();
      });
    }

    if (this.regStep === 2) {
      const vTypeOptions = VEHICLE_TYPES.map(v =>
        `<option ${this.reg.vehicleType===v?"selected":""}>${v}</option>`).join("");

      body.innerHTML = `
        ${TM.card(`
          <div style="text-align:center;margin-bottom:18px">
            <div style="width:80px;height:80px;border-radius:50%;background:var(--smoke);border:2px dashed var(--mist);margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:30px;cursor:pointer">📷</div>
            <div class="t-caption">Tap to upload profile photo</div>
          </div>
          <label class="t-label">Years of Experience</label>
          <input id="reg-exp"  class="input" type="number" placeholder="e.g. 5" value="${this.reg.experience}">
          <label class="t-label">Vehicle Type</label>
          <select id="reg-vtype" class="select">${vTypeOptions}</select>
          <label class="t-label">Vehicle Model</label>
          <input id="reg-vmodel" class="input" placeholder="e.g. TATA ACE" value="${this.reg.vehicleModel}">
          <label class="t-label">Vehicle Number</label>
          <input id="reg-vnum" class="input" placeholder="e.g. TS23AB5029" value="${this.reg.vehicleNumber}">
          <label class="t-label">Driving Licence Number</label>
          <input id="reg-dl"  class="input" placeholder="DL Number" value="${this.reg.dlNumber}">
          <label class="t-label">PAN Card Number</label>
          <input id="reg-pan" class="input" placeholder="PAN Number" value="${this.reg.panNumber}" style="margin-bottom:4px">
          <button id="reg-next2" class="btn btn--primary mt-md">Next →</button>
          <button id="reg-back2" class="btn btn--secondary mt-sm">← Back</button>
        `, "Experience & Vehicle")}`;

      document.getElementById("reg-back2").addEventListener("click", () => { this.regStep = 1; this._renderRegStep(); });
      document.getElementById("reg-next2").addEventListener("click", () => {
        this.reg.experience    = document.getElementById("reg-exp").value.trim();
        this.reg.vehicleType   = document.getElementById("reg-vtype").value;
        this.reg.vehicleModel  = document.getElementById("reg-vmodel").value.trim();
        this.reg.vehicleNumber = document.getElementById("reg-vnum").value.trim();
        this.reg.dlNumber      = document.getElementById("reg-dl").value.trim();
        this.reg.panNumber     = document.getElementById("reg-pan").value.trim();
        if (!this.reg.vehicleModel || !this.reg.vehicleNumber || !this.reg.dlNumber) {
          TM.showToast("Fill all vehicle details", "error"); return;
        }
        this.regStep = 3;
        this._renderRegStep();
      });
    }

    if (this.regStep === 3) {
      body.innerHTML = `
        ${TM.card(`
          ${[
            ["Name",         this.reg.name],
            ["Date of Birth",this.reg.dob],
            ["Gender",       this.reg.gender],
            ["Experience",   `${this.reg.experience} years`],
            ["Vehicle Type", this.reg.vehicleType],
            ["Vehicle Model",this.reg.vehicleModel],
            ["Vehicle No.",  this.reg.vehicleNumber],
            ["DL Number",    this.reg.dlNumber],
            ["PAN Number",   this.reg.panNumber],
          ].map(([k,v]) => TM.infoRow(k, v||"—")).join("")}
          <div class="card-divider"></div>
          <button id="reg-submit" class="btn btn--primary">🚀 Start Your Journey</button>
          <button id="reg-back3"  class="btn btn--secondary mt-sm">← Edit Details</button>
        `, "Review Your Details")}`;

      document.getElementById("reg-back3").addEventListener("click", () => { this.regStep = 2; this._renderRegStep(); });
      document.getElementById("reg-submit").addEventListener("click", async () => {
        const btn = document.getElementById("reg-submit");
        btn.innerHTML = `<span class="btn-spinner"></span>`;
        btn.disabled = true;
        await API.registerDriver(this.phone, this.reg);
        this._renderPending();
      });
    }
  }

  // ── Main App ──────────────────────────────────────────────
  _buildMainApp() {
    this.container.innerHTML = `
      <div class="app-shell">
        <div id="drv-page" class="page"></div>
        <nav id="drv-nav" class="bottom-nav"></nav>
      </div>`;
    this._renderMainNav();
    this._renderMainTab();
  }

  _renderMainNav() {
    TM.renderBottomNav(
      document.getElementById("drv-nav"),
      [
        { key:"loads",   icon:"🔍", label:"Find Loads" },
        { key:"myloads", icon:"📋", label:"My Loads" },
        { key:"profile", icon:"👤", label:"Profile" },
      ],
      this.tab,
      key => { this.tab = key; this._renderMainTab(); }
    );
  }

  _renderMainNav() {
    TM.renderBottomNav(
      document.getElementById("drv-nav"),
      [
        { key:"loads",   icon:"🔍", label:"Find Loads" },
        { key:"myloads", icon:"📋", label:"My Loads" },
        { key:"profile", icon:"👤", label:"Profile" },
      ],
      this.tab,
      key => { this.tab = key; this._renderMainTab(); }
    );
  }

  _renderMainTab() {
    this._renderMainNav();
    if (this.tab === "loads")   this._renderLoads();
    if (this.tab === "myloads") this._renderMyLoads();
    if (this.tab === "profile") this._renderProfile();
  }

  _page() { return document.getElementById("drv-page"); }

  // ── LOADS ─────────────────────────────────────────────────
  async _renderLoads() {
    const page = this._page();
    page.innerHTML = `
      <div class="fade-up">
        <div style="font-size:13px;color:var(--orange);font-weight:700">Hi Driver 👋</div>
        <div class="t-display mb-sm">${this.user?.name || "Welcome"}</div>
        ${TM.card(`
          <label class="t-label">📍 From Location</label>
          <input id="drv-from" class="input" placeholder="Your location" value="Sircilla, Rajanna Sircilla">
          <label class="t-label">📍 To Location</label>
          <input id="drv-to" class="input" placeholder="Destination" value="Hyderabad">
          <button id="drv-search" class="btn btn--primary">🔍 Search Available Loads</button>
        `, "Search Loads on Your Route")}
        <div class="card-title mb-sm" id="loads-count-label">Available Loads</div>
        <div id="loads-list"></div>
      </div>`;

    document.getElementById("drv-search").addEventListener("click", () => this._fetchLoads());
    this._fetchLoads();
  }

  async _fetchLoads() {
    const list = document.getElementById("loads-list");
    if (!list) return;
    TM.showLoading(list, 2);

    // Make TM-2401 available for demo
    const b = DB.bookings.find(b => b.id === "TM-2401");
    if (b && b.status !== "waiting_driver") b.status = "waiting_driver";

    const loads = await API.getAvailableLoads();
    document.getElementById("loads-count-label").textContent = `Available Loads (${loads.length})`;

    if (!loads.length) { TM.showEmpty(list, "🔍", "No loads on this route right now"); return; }
    list.innerHTML = loads.map(l => TM.card(`
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:10px">
        <span class="t-h3">${l.id}</span>
        <span class="chip chip--success">🟢 Available</span>
      </div>
      ${TM.infoRow("From",         l.from?.split(",")[0])}
      ${TM.infoRow("To",           l.to?.split(",")[0])}
      ${TM.infoRow("Goods",        l.goods)}
      ${TM.infoRow("Truck Needed", `${l.truckType} (${l.truckCapacity})`)}
      ${TM.infoRow("Date",         `${l.date} at ${l.time}`)}
      <div class="card-divider"></div>
      <button class="btn btn--success" data-lid="${l.id}" style="height:42px">✓ Accept This Load</button>
    `)).join("");

    $$("[data-lid]").forEach(btn => {
      btn.addEventListener("click", async () => {
        btn.innerHTML = `<span class="btn-spinner"></span>`;
        btn.disabled = true;
        await API.acceptLoad(btn.dataset.lid, this.phone, this.user?.name || "Driver");
        TM.showToast("Load accepted! Awaiting staff confirmation ✅", "success");
        this._fetchLoads();
      });
    });
  }

  // ── MY LOADS ──────────────────────────────────────────────
  async _renderMyLoads() {
    const page = this._page();
    page.innerHTML = `
      <div class="t-display mb-sm">My Loads</div>
      <div class="t-sub mb-lg">Your active & past deliveries</div>
      <div id="myloads-list"></div>`;

    const list = document.getElementById("myloads-list");
    TM.showLoading(list, 2);
    const myLoads = DB.bookings.filter(b => b.driverId === this.phone);

    if (!myLoads.length) { TM.showEmpty(list, "📭", "No loads accepted yet"); return; }
    list.innerHTML = myLoads.map(l => TM.bookingCard(l,
      l.status === "on_the_way" ? `
        <button class="btn btn--success btn--sm" data-mid="${l.id}" style="width:100%">📦 Mark as Delivered</button>` : ""
    )).join("");

    $$("[data-mid]").forEach(btn => {
      btn.addEventListener("click", async () => {
        btn.innerHTML = `<span class="btn-spinner"></span>`;
        btn.disabled = true;
        await API.markDelivered(btn.dataset.mid);
        TM.showToast("Marked as delivered ✅", "success");
        this._renderMyLoads();
      });
    });
  }

  // ── PROFILE ───────────────────────────────────────────────
  _renderProfile() {
    const driver = DB.drivers.find(d => d.id === this.phone);
    this._page().innerHTML = `
      <div class="fade-up">
        <div style="text-align:center;margin-bottom:24px">
          <div style="width:80px;height:80px;border-radius:50%;background:var(--orange);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:32px;color:#fff">🧑</div>
          <div class="t-h2">${this.user?.name || "Driver"}</div>
          <div class="t-sub mt-sm">+91 ${this.phone}</div>
          <div class="mt-sm">${TM.statusChip(this.user?.driverStatus || "approved")}</div>
        </div>

        ${driver ? TM.card(`
          ${TM.infoRow("Vehicle",    driver.vehicleModel)}
          ${TM.infoRow("Vehicle No.",driver.vehicleNumber)}
          ${TM.infoRow("Type",       driver.vehicleType)}
          ${TM.infoRow("Experience", `${driver.experience} years`)}
          ${TM.infoRow("DL Number",  driver.dlNumber)}
        `, "Driver Details") : ""}

        <button id="drv-logout" class="btn btn--secondary mt-md">Logout</button>
      </div>`;

    document.getElementById("drv-logout").addEventListener("click", () => {
      TM.Session.clear();
      location.reload();
    });
  }
}

window.DriverApp = DriverApp;
