/* ============================================================
   TRANSMAA — UI Utilities & Shared Helpers
   ============================================================ */

"use strict";

// ── DOM Helpers ───────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const el = (tag, cls = "", html = "") => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
};

// ── State Management (simple pub/sub) ────────────────────
class Store {
  constructor(initial) {
    this._state = { ...initial };
    this._listeners = [];
  }
  get state() { return { ...this._state }; }
  setState(patch) {
    this._state = { ...this._state, ...patch };
    this._listeners.forEach(fn => fn(this._state));
  }
  subscribe(fn) {
    this._listeners.push(fn);
    return () => { this._listeners = this._listeners.filter(f => f !== fn); };
  }
}

// ── Toast ─────────────────────────────────────────────────
let _toastTimer = null;
function showToast(msg, type = "info") {
  let toast = $("#transmaa-toast");
  if (!toast) {
    toast = el("div");
    toast.id = "transmaa-toast";
    document.body.appendChild(toast);
  }
  toast.className = `toast toast--${type}`;
  toast.textContent = msg;
  toast.style.display = "block";
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { toast.style.display = "none"; }, 3000);
}

// ── Navigation ────────────────────────────────────────────
function renderBottomNav(container, items, activeKey, onSelect) {
  container.innerHTML = "";
  container.className = "bottom-nav";
  items.forEach(item => {
    const btn = el("button", `bottom-nav__item${item.key === activeKey ? " bottom-nav__item--active" : ""}`);
    btn.innerHTML = `
      <span class="bottom-nav__icon">${item.icon}</span>
      <span class="bottom-nav__label">${item.label}</span>
      ${item.key === activeKey ? '<span class="bottom-nav__dot"></span>' : ""}
    `;
    btn.addEventListener("click", () => onSelect(item.key));
    container.appendChild(btn);
  });
}

// ── Status Chip ───────────────────────────────────────────
const STATUS_MAP = {
  waiting:              { cls: "chip--warn",    label: "⏳ Awaiting Staff" },
  waiting_driver:       { cls: "chip--blue",    label: "📢 Finding Driver" },
  accepted_by_staff:    { cls: "chip--blue",    label: "✅ Staff Verified" },
  driver_accepted:      { cls: "chip--gold",    label: "🚛 Driver Assigned" },
  on_the_way:           { cls: "chip--orange",  label: "🚚 On the Way" },
  delivered:            { cls: "chip--success", label: "✅ Delivered" },
  rejected:             { cls: "chip--danger",  label: "❌ Rejected" },
  pending:              { cls: "chip--warn",    label: "⏳ Pending" },
  approved:             { cls: "chip--success", label: "✅ Approved" },
  listed:               { cls: "chip--success", label: "🟢 Listed" },
  pending_verification: { cls: "chip--warn",    label: "⏳ Under Review" },
};
function statusChip(status) {
  const { cls, label } = STATUS_MAP[status] || { cls: "chip--neutral", label: status };
  return `<span class="chip ${cls}">${label}</span>`;
}

// ── Info Row ──────────────────────────────────────────────
function infoRow(key, value) {
  return `
    <div class="info-row">
      <span class="info-row__key">${key}</span>
      <span class="info-row__val">${value ?? "—"}</span>
    </div>`;
}

// ── Card ──────────────────────────────────────────────────
function card(inner, title = "", extraClass = "") {
  return `
    <div class="card ${extraClass}">
      ${title ? `<div class="card-title">${title}</div>` : ""}
      ${inner}
    </div>`;
}

// ── OTP Input ─────────────────────────────────────────────
function renderOTPBoxes(container, onChange) {
  container.innerHTML = "";
  container.className = "otp-row";
  const inputs = [];
  for (let i = 0; i < 6; i++) {
    const inp = el("input", "otp-box");
    inp.type = "text";
    inp.inputMode = "numeric";
    inp.maxLength = 1;
    inp.addEventListener("input", e => {
      const v = e.target.value.replace(/\D/g, "");
      inp.value = v;
      if (v) inp.classList.add("otp-box--filled");
      else    inp.classList.remove("otp-box--filled");
      if (v && i < 5) inputs[i + 1].focus();
      onChange(inputs.map(x => x.value).join(""));
    });
    inp.addEventListener("keydown", e => {
      if (e.key === "Backspace" && !inp.value && i > 0) inputs[i - 1].focus();
    });
    container.appendChild(inp);
    inputs.push(inp);
  }
  return inputs;
}

// ── Form Validators ───────────────────────────────────────
const Validators = {
  phone: v => /^\d{10}$/.test(v),
  otp:   v => /^\d{6}$/.test(v),
  required: v => (v || "").trim().length > 0,
};

function setInputError(inputEl, msg) {
  inputEl.classList.add("input--error");
  let err = inputEl.nextElementSibling;
  if (!err || !err.classList.contains("field-error")) {
    err = el("span", "field-error", msg);
    inputEl.parentNode.insertBefore(err, inputEl.nextSibling);
  } else {
    err.textContent = msg;
  }
}

function clearInputError(inputEl) {
  inputEl.classList.remove("input--error");
  const err = inputEl.nextElementSibling;
  if (err && err.classList.contains("field-error")) err.remove();
}

// ── Booking / Driver display helpers ─────────────────────
function bookingCard(b, actions = "") {
  return card(`
    <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:10px">
      <span class="t-h3">${b.id}</span>
      ${statusChip(b.status)}
    </div>
    ${infoRow("From",      b.from?.split(",")[0])}
    ${infoRow("To",        b.to?.split(",")[0])}
    ${infoRow("Goods",     b.goods)}
    ${infoRow("Truck",     `${b.truckType} (${b.truckCapacity})`)}
    ${b.price  ? infoRow("Price",  `₹${Number(b.price).toLocaleString("en-IN")}`) : ""}
    ${b.driverName ? infoRow("Driver", b.driverName) : ""}
    ${infoRow("Date/Time", `${b.date} ${b.time}`)}
    ${actions ? `<div class="card-divider"></div>${actions}` : ""}
  `);
}

function driverCard(d, actions = "") {
  return card(`
    <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px">
      <span class="t-h3">${d.name}</span>
      ${statusChip(d.status)}
    </div>
    ${infoRow("Phone",       d.phone)}
    ${infoRow("Vehicle",     `${d.vehicleModel} (${d.vehicleType})`)}
    ${infoRow("Vehicle No.", d.vehicleNumber)}
    ${infoRow("Experience",  `${d.experience} years`)}
    ${infoRow("DL Number",   d.dlNumber)}
    ${infoRow("PAN Number",  d.panNumber)}
    ${infoRow("Submitted",   new Date(d.submittedAt).toLocaleDateString("en-IN"))}
    ${actions ? `<div class="card-divider"></div>${actions}` : ""}
  `);
}

// ── Loading Skeleton ──────────────────────────────────────
function skeletonCard() {
  return `
    <div class="card">
      <div class="skeleton" style="height:16px;width:60%;margin-bottom:10px"></div>
      <div class="skeleton" style="height:12px;width:90%;margin-bottom:6px"></div>
      <div class="skeleton" style="height:12px;width:75%;margin-bottom:6px"></div>
      <div class="skeleton" style="height:12px;width:80%"></div>
    </div>`;
}

function showLoading(container, count = 3) {
  container.innerHTML = Array(count).fill(skeletonCard()).join("");
}

function showEmpty(container, icon, msg) {
  container.innerHTML = `
    <div style="text-align:center;padding:48px 24px">
      <div style="font-size:40px;margin-bottom:12px">${icon}</div>
      <p class="t-sub">${msg}</p>
    </div>`;
}

// ── Date / Format helpers ─────────────────────────────────
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtCurrency(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

// ── Session ───────────────────────────────────────────────
const Session = {
  key: "transmaa_session",
  save(data)  { sessionStorage.setItem(this.key, JSON.stringify(data)); },
  load()      { try { return JSON.parse(sessionStorage.getItem(this.key)); } catch { return null; } },
  clear()     { sessionStorage.removeItem(this.key); },
};

// Export
window.TM = {
  $, $$, el,
  Store, showToast,
  renderBottomNav, statusChip,
  infoRow, card, bookingCard, driverCard,
  renderOTPBoxes, Validators, setInputError, clearInputError,
  showLoading, showEmpty, skeletonCard,
  fmtDate, fmtCurrency, Session,
};
