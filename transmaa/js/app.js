/* ============================================================
   TRANSMAA — App Entry Point
   Role selector → Auth → Role-specific App
   ============================================================ */

"use strict";

(function () {
  const root = document.getElementById("root");

  // ── Role Selector ─────────────────────────────────────────
  function showRoleSelector() {
    root.innerHTML = `
      <div class="landing">
        <div style="background:linear-gradient(160deg,#12100E 0%,#2C2825 100%);padding:64px 24px 32px;text-align:center">
          <div style="font-family:var(--font-display);font-size:44px;font-weight:800;color:#fff;letter-spacing:-2px;line-height:1">
            TRAN<span style="color:#F5A623">S</span>MAA
          </div>
          <div class="t-sub" style="color:rgba(255,255,255,0.5);margin-top:8px">Commercial Vehicle Logistics Platform</div>
        </div>

        <div style="padding:32px 24px;flex:1;background:#fff">
          <div class="t-h2 mb-sm center">Continue as</div>
          <div class="t-sub mb-lg center">Select your role to get started</div>

          <div id="role-cards"></div>

          <div style="margin-top:24px;padding:14px 16px;background:var(--orange-bg);border-radius:14px;border:1px solid rgba(255,90,31,0.15)">
            <div style="font-size:11px;font-weight:700;color:var(--orange);margin-bottom:4px;letter-spacing:1px">DEMO CREDENTIALS</div>
            <div class="t-caption" style="line-height:1.9">
              Customer → <strong>9090909090</strong><br>
              Staff Admin → <strong>8888888888</strong><br>
              Driver (approved) → <strong>7777777777</strong><br>
              Driver (pending) → <strong>6666666666</strong><br>
              Any OTP or type <strong>123456</strong>
            </div>
          </div>
        </div>
      </div>`;

    const roles = [
      { key:"customer", icon:"👤", label:"Customer",    desc:"Book trucks for shifting & delivery" },
      { key:"staff",    icon:"🏢", label:"Staff",       desc:"Manage orders, drivers & enquiries" },
      { key:"driver",   icon:"🚛", label:"Driver",      desc:"Register, find loads & earn" },
    ];

    const container = document.getElementById("role-cards");
    roles.forEach((r, i) => {
      const card = document.createElement("div");
      card.className = "fade-up";
      card.style.cssText = `
        display:flex;align-items:center;gap:16px;
        padding:18px 20px;border:1.5px solid var(--mist);border-radius:18px;
        margin-bottom:12px;cursor:pointer;background:var(--smoke);
        transition:all 0.2s;animation-delay:${i*0.08}s`;
      card.innerHTML = `
        <div style="width:52px;height:52px;border-radius:14px;background:#fff;
             display:flex;align-items:center;justify-content:center;font-size:26px;
             box-shadow:0 2px 8px rgba(0,0,0,0.08);flex-shrink:0">${r.icon}</div>
        <div style="flex:1">
          <div style="font-family:var(--font-display);font-weight:700;font-size:17px">${r.label}</div>
          <div class="t-sub">${r.desc}</div>
        </div>
        <div style="font-size:20px;color:var(--mist)">›</div>`;
      card.addEventListener("mouseenter", () => { card.style.borderColor = "var(--orange)"; card.style.background = "var(--orange-bg)"; });
      card.addEventListener("mouseleave", () => { card.style.borderColor = "var(--mist)"; card.style.background = "var(--smoke)"; });
      card.addEventListener("click", () => showAuth(r.key));
      container.appendChild(card);
    });
  }

  // ── Auth Screen ───────────────────────────────────────────
  function showAuth(role) {
    root.innerHTML = "";
    const roleLabels = { customer:"Customer", staff:"Staff Admin", driver:"Driver" };
    new AuthFlow(root, {
      roleLabel: roleLabels[role],
      onSuccess: (phone, user, isNew) => {
        // Validate role match
        if (user && user.role && user.role !== role) {
          TM.showToast(`This number is registered as ${user.role}`, "error");
          return;
        }
        TM.Session.save({ phone, user, role, isNew });
        launchApp(role, phone, user, isNew);
      },
      onRegister: role === "driver" ? () => {
        // Force new driver registration
        launchApp("driver", null, null, true);
      } : null,
    });

    // Back button
    const back = document.createElement("button");
    back.textContent = "← Change Role";
    back.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:none;border:none;color:var(--orange);font-weight:700;font-size:13px;cursor:pointer;z-index:10";
    back.addEventListener("click", showRoleSelector);
    root.appendChild(back);
  }

  // ── Launch Role App ───────────────────────────────────────
  function launchApp(role, phone, user, isNew) {
    root.innerHTML = "";
    const opts = { phone, user, isNew };
    if (role === "customer") new CustomerApp(root, opts);
    if (role === "staff")    new StaffApp(root, opts);
    if (role === "driver")   new DriverApp(root, opts);
  }

  // ── Restore Session ───────────────────────────────────────
  const saved = TM.Session.load();
  if (saved?.phone && saved?.role) {
    launchApp(saved.role, saved.phone, saved.user, saved.isNew);
  } else {
    showRoleSelector();
  }

})();
