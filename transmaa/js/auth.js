/* ============================================================
   TRANSMAA — Auth Module
   Handles OTP send + verify for all roles
   ============================================================ */

"use strict";

class AuthFlow {
  constructor(container, { roleLabel, onSuccess, onRegister }) {
    this.container = container;
    this.roleLabel = roleLabel;
    this.onSuccess = onSuccess;
    this.onRegister = onRegister;
    this.phone = "";
    this.devOTP = "";
    this.step = 1;          // 1 = phone, 2 = otp
    this.loading = false;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="app-shell">
        <div style="background:linear-gradient(160deg,#12100E,#2C2825);padding:52px 24px 28px">
          <div class="t-caption" style="color:rgba(255,255,255,0.5);letter-spacing:2px;text-transform:uppercase;margin-bottom:4px">${this.roleLabel}</div>
          <div style="font-family:var(--font-display);font-size:36px;font-weight:800;color:#fff;letter-spacing:-1px">
            TRAN<span style="color:#F5A623">S</span>MAA
          </div>
          <div class="t-sub" style="color:rgba(255,255,255,0.55);margin-top:4px">Welcome back</div>
        </div>
        <div id="auth-body" style="padding:28px 24px;flex:1;background:#fff"></div>
      </div>`;
    this.renderBody();
  }

  renderBody() {
    const body = $("#auth-body", this.container);
    if (this.step === 1) {
      body.innerHTML = `
        <div class="t-h2 mb-md">Enter your number</div>
        <div class="t-sub mb-lg">We'll send a one-time password to verify</div>
        <div class="phone-row mb-md">
          <div class="phone-prefix">+91</div>
          <input id="auth-phone" class="input flex-1" placeholder="10-digit mobile number"
                 inputmode="numeric" maxlength="10" style="margin-bottom:0">
        </div>
        <div id="auth-error" class="field-error" style="margin-bottom:10px;display:none"></div>
        <button id="auth-send-btn" class="btn btn--primary">Send OTP →</button>
        ${this.onRegister ? `
          <div style="text-align:center;margin-top:20px">
            <span class="t-sub">New driver? </span>
            <button id="auth-register-link" style="background:none;border:none;color:var(--orange);font-weight:700;font-size:13px;cursor:pointer;text-decoration:underline">Register here</button>
          </div>` : ""}
        <div style="margin-top:20px;padding:12px 14px;background:var(--orange-bg);border-radius:12px;border:1px solid rgba(255,90,31,0.15)">
          <div style="font-size:11px;font-weight:700;color:var(--orange);margin-bottom:4px">DEMO CREDENTIALS</div>
          <div class="t-caption" style="line-height:1.8">
            Customer: <strong>9090909090</strong><br>
            Staff: <strong>8888888888</strong><br>
            Driver (approved): <strong>7777777777</strong><br>
            Any OTP or type <strong>123456</strong>
          </div>
        </div>`;
      this._bindStep1();
    } else {
      body.innerHTML = `
        <div class="t-h2 mb-sm">Verify OTP</div>
        <div class="t-sub mb-lg">
          Sent to +91 ${this.phone}
          <button id="auth-change-num" style="background:none;border:none;color:var(--orange);font-weight:700;font-size:12px;cursor:pointer;margin-left:6px">change</button>
        </div>
        <div id="otp-boxes" class="otp-row"></div>
        <div id="auth-error" class="field-error" style="margin-bottom:10px;display:none;text-align:center"></div>
        ${this.devOTP ? `
          <div style="background:var(--orange-bg);border:1px solid rgba(255,90,31,0.2);border-radius:10px;padding:10px 14px;margin-bottom:14px;text-align:center">
            <span class="t-sub">Demo OTP: </span>
            <strong style="color:var(--orange);letter-spacing:0.1em">${this.devOTP}</strong>
            <span class="t-sub"> (or use 123456)</span>
          </div>` : ""}
        <button id="auth-verify-btn" class="btn btn--primary">Verify & Login</button>
        <button id="auth-back-btn" class="btn btn--secondary mt-sm">← Back</button>`;
      this._bindStep2();
    }
  }

  _bindStep1() {
    const phoneInp = $("#auth-phone", this.container);
    const btn      = $("#auth-send-btn", this.container);
    const errEl    = $("#auth-error", this.container);
    const regLink  = $("#auth-register-link", this.container);

    phoneInp.addEventListener("input", () => {
      phoneInp.value = phoneInp.value.replace(/\D/g, "").slice(0, 10);
      errEl.style.display = "none";
    });

    btn.addEventListener("click", async () => {
      const phone = phoneInp.value.trim();
      if (!TM.Validators.phone(phone)) {
        errEl.textContent = "Enter a valid 10-digit number";
        errEl.style.display = "block";
        phoneInp.classList.add("input--error");
        phoneInp.style.animation = "shake 0.3s ease";
        setTimeout(() => phoneInp.style.animation = "", 300);
        return;
      }
      this.phone = phone;
      btn.innerHTML = `<span class="btn-spinner"></span>`;
      btn.disabled = true;
      const res = await API.sendOTP(phone);
      btn.innerHTML = "Send OTP →";
      btn.disabled = false;
      if (res.success) {
        this.devOTP = res._devOTP;
        this.step = 2;
        this.renderBody();
        TM.showToast(`OTP sent to +91${phone}`, "success");
      }
    });

    if (regLink) {
      regLink.addEventListener("click", () => this.onRegister?.());
    }
  }

  _bindStep2() {
    const otpContainer = $("#otp-boxes", this.container);
    const errEl        = $("#auth-error", this.container);
    const verifyBtn    = $("#auth-verify-btn", this.container);
    const backBtn      = $("#auth-back-btn", this.container);
    let otpValue = "";

    TM.renderOTPBoxes(otpContainer, v => { otpValue = v; });

    verifyBtn.addEventListener("click", async () => {
      if (otpValue.length < 6) {
        errEl.textContent = "Enter the 6-digit OTP";
        errEl.style.display = "block";
        return;
      }
      verifyBtn.innerHTML = `<span class="btn-spinner"></span>`;
      verifyBtn.disabled = true;
      const res = await API.verifyOTP(this.phone, otpValue);
      verifyBtn.innerHTML = "Verify & Login";
      verifyBtn.disabled = false;
      if (res.success) {
        this.onSuccess(this.phone, res.user, res.isNewUser);
      } else {
        errEl.textContent = res.message;
        errEl.style.display = "block";
        otpContainer.style.animation = "shake 0.3s ease";
        setTimeout(() => otpContainer.style.animation = "", 300);
      }
    });

    backBtn.addEventListener("click", () => { this.step = 1; this.renderBody(); });

    $("#auth-change-num", this.container)?.addEventListener("click", () => {
      this.step = 1; this.renderBody();
    });
  }
}

window.AuthFlow = AuthFlow;
