# Transmaa — Commercial Vehicle Logistics App

A multi-role logistics platform for truck booking, driver management,
vehicle marketplace, and finance/insurance enquiries.

---

## 📁 Project Structure

```
transmaa/
├── index.html              ← Main HTML entry point
│
├── css/
│   ├── variables.css       ← Design tokens (colors, spacing, fonts)
│   ├── base.css            ← Reset, layout shell, animations
│   └── components.css      ← All UI components (buttons, cards, inputs, nav…)
│
└── js/
    ├── api.js              ← Mock backend: in-memory DB + all API methods
    ├── utils.js            ← DOM helpers, shared UI (toast, nav, cards, OTP)
    ├── auth.js             ← OTP login flow (shared across all roles)
    ├── customer.js         ← Customer app (booking, history, finance, market)
    ├── staff.js            ← Staff dashboard (orders, drivers, finance, market)
    ├── driver.js           ← Driver app (register, find loads, deliveries)
    └── app.js              ← Entry point: role selector + routing
```

---

## 🚀 How to Run

### Option 1 — Open directly (simplest)
Just open `index.html` in any modern browser. No build step needed.

### Option 2 — Local server (recommended, avoids CORS issues)
```bash
# Python
python -m http.server 3000

# Node.js
npx serve .

# VS Code
Install "Live Server" extension → right-click index.html → Open with Live Server
```
Then visit: http://localhost:3000

---

## 🔑 Demo Credentials

| Role | Phone | OTP |
|------|-------|-----|
| Customer | 9090909090 | 123456 |
| Staff Admin | 8888888888 | 123456 |
| Driver (approved) | 7777777777 | 123456 |
| Driver (pending) | 6666666666 | 123456 |
| New Driver | any 10 digits | 123456 |

---

## 👤 Customer Features
- OTP login
- Book a truck: select route → date/time/goods → truck type → confirm
- View booking history with live status tracking
- Finance & Insurance enquiry form
- Buy/Sell vehicle marketplace

## 🏢 Staff Features
- Review & accept/reject incoming bookings
- Monitor active orders, send SMS confirmation + set price
- Approve/reject driver registrations
- View finance & insurance enquiries
- Approve vehicle listings, view buyer interest

## 🚛 Driver Features
- 3-step registration (personal info → vehicle docs → review)
- Verification pending / rejected screens
- Search available loads by route
- Accept loads
- Mark deliveries as completed
- Profile page

---

## 🔌 Replacing Mock Backend with Real API

All API calls are in `js/api.js`. Each method has a comment showing
the equivalent REST endpoint. To switch to a real backend:

```js
// EXAMPLE: Replace mock createBooking with real fetch
async createBooking(data) {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
},
```

### Recommended backend stack
| Feature | Service |
|---------|---------|
| Phone OTP | Firebase Auth / MSG91 / Twilio |
| Database | Firebase Firestore / Supabase |
| SMS notifications | Twilio / MSG91 |
| File uploads | Firebase Storage / AWS S3 |
| Hosting | Firebase Hosting / Vercel / Netlify |

---

## 🎨 Customising Design

All design tokens (colors, fonts, spacing, radii) are in `css/variables.css`.
Change `--orange` to update the brand color everywhere.

---

## 📱 PWA Ready

Add a `manifest.json` and service worker to make this installable on mobile devices.
