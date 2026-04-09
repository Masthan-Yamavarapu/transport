/* ============================================================
   TRANSMAA — Mock Backend (DB + API)
   All data lives in-memory. Replace API methods with real
   fetch() calls to your backend when ready.
   ============================================================ */

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// ── In-Memory Database ────────────────────────────────────
const DB = {
  users: {
    "9090909090": { name: "Sai Kumar",        role: "customer", verified: true },
    "8888888888": { name: "Staff Admin",       role: "staff",    verified: true },
    "7777777777": { name: "Mahesh Driver",     role: "driver",   verified: true,  driverStatus: "approved" },
    "6666666666": { name: "Suresh (Pending)",  role: "driver",   verified: false, driverStatus: "pending" },
    "5555555555": { name: "Raju (Rejected)",   role: "driver",   verified: false, driverStatus: "rejected" },
  },

  bookings: [
    {
      id: "TM-2401", customerId: "9090909090", customerName: "Sai Kumar",
      customerPhone: "+919090909090",
      from: "Sircilla, Rajanna Sircilla District, Telangana, 505301",
      to:   "Hitech City, Kukatpally Main Road, Hyderabad, 500081",
      goods: "House Shifting", truckType: "Open", truckCapacity: "7-11 Tons",
      date: "2024-03-25", time: "13:00", status: "waiting_driver",
      driverId: null, driverName: null, price: null,
      createdAt: "2024-03-24T10:00:00Z",
    },
    {
      id: "TM-2389", customerId: "9090909090", customerName: "Priya",
      customerPhone: "+911234554321",
      from: "Chamba, Himachal Pradesh",
      to:   "Yavat, Daund, Pune, Maharashtra",
      goods: "Timber/Plywood/Laminate", truckType: "Container", truckCapacity: "9-30 Tons",
      date: "2024-03-19", time: "10:00", status: "delivered",
      driverId: "7777777777", driverName: "Mahesh Driver", price: 18500,
      createdAt: "2024-03-18T08:00:00Z",
    },
    {
      id: "TM-2402", customerId: "9090909090", customerName: "Ravi",
      customerPhone: "+919876543210",
      from: "Warangal, Telangana",
      to:   "Pune, Maharashtra",
      goods: "Furniture/Home Furnishing", truckType: "Container", truckCapacity: "9-30 Tons",
      date: "2024-03-26", time: "10:00", status: "driver_accepted",
      driverId: "7777777777", driverName: "Mahesh Driver", price: null,
      createdAt: "2024-03-24T14:00:00Z",
    },
  ],

  drivers: [
    {
      id: "7777777777", name: "Mahesh Kumar", phone: "+918688474431",
      dob: "1999-04-01", gender: "Male", bio: "Experienced long-haul driver",
      experience: 7, vehicleType: "Mini/Pickup", vehicleModel: "TATA ACE",
      vehicleNumber: "TS23AB5029", dlNumber: "IB34567890987654", panNumber: "LJKBH4567L",
      status: "approved", submittedAt: "2024-03-10T09:00:00Z",
    },
    {
      id: "6666666666", name: "Suresh Reddy", phone: "+916666666666",
      dob: "1995-06-15", gender: "Male", bio: "New driver looking for work",
      experience: 2, vehicleType: "LCV", vehicleModel: "Eicher 14ft",
      vehicleNumber: "TS09CD1234", dlNumber: "AP12345678901234", panNumber: "ABCDE1234F",
      status: "pending", submittedAt: "2024-03-23T11:00:00Z",
    },
    {
      id: "5555555555", name: "Raju Naik", phone: "+915555555555",
      dob: "1990-12-20", gender: "Male", bio: "Veteran trucker 12 years",
      experience: 12, vehicleType: "Open Truck", vehicleModel: "Ashok Leyland Dost",
      vehicleNumber: "AP01AB9999", dlNumber: "AP98765432109876", panNumber: "XYZAB5678G",
      status: "rejected", submittedAt: "2024-03-20T15:00:00Z",
    },
  ],

  financeEnquiries: [
    { id: "FIN-001", name: "Raju",    phone: "+919988776655", vehicleType: "TATA LPT",       rcNumber: "TS01AB1234", enquiryType: "Finance",   submittedAt: "2024-03-22T10:00:00Z" },
    { id: "FIN-002", name: "Kavitha", phone: "+919876543211", vehicleType: "Mahindra Bolero", rcNumber: "AP02CD5678", enquiryType: "Insurance", submittedAt: "2024-03-23T14:00:00Z" },
  ],

  vehicles: [
    { id: "VH-001", sellerName: "Ramesh", phone: "+919000011111", vehicleNo: "TS07EF2345", model: "Kia Carnival",   rcNo: "TS07EF2345RC", year: 2021, status: "listed",               interestedBuyers: [] },
    { id: "VH-002", sellerName: "Anand",  phone: "+919000022222", vehicleNo: "TS03GH8901", model: "Mahindra TUV300", rcNo: "TS03GH8901RC", year: 2017, status: "listed",               interestedBuyers: [] },
    { id: "VH-003", sellerName: "Sunita", phone: "+919000033333", vehicleNo: "AP05IJ3456", model: "Tata Alto",      rcNo: "AP05IJ3456RC", year: 2017, status: "listed",               interestedBuyers: [] },
    { id: "VH-004", sellerName: "Vikram", phone: "+919000044444", vehicleNo: "KA01KL6789", model: "Mahindra XUV",   rcNo: "KA01KL6789RC", year: 2019, status: "pending_verification", interestedBuyers: [] },
  ],

  otpStore: {},
};

// ── API Layer ─────────────────────────────────────────────
const API = {

  /* AUTH */
  async sendOTP(phone) {
    await delay(600);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    DB.otpStore[phone] = otp;
    console.info(`[SMS] OTP for +91${phone}: ${otp}`);
    // In production: POST /api/auth/send-otp  { phone }
    return { success: true, _devOTP: otp };
  },

  async verifyOTP(phone, otp) {
    await delay(500);
    if (DB.otpStore[phone] === otp || otp === "123456") {
      delete DB.otpStore[phone];
      const user = DB.users[phone] || null;
      // In production: POST /api/auth/verify-otp  { phone, otp }
      return { success: true, user, isNewUser: !user };
    }
    return { success: false, message: "Invalid OTP. Try 123456 for demo." };
  },

  /* BOOKINGS */
  async getBookings(customerId) {
    await delay(400);
    // In production: GET /api/bookings?customerId={customerId}
    return DB.bookings.filter(b => b.customerId === customerId);
  },

  async getAllBookings() {
    await delay(400);
    // In production: GET /api/bookings  (staff only)
    return [...DB.bookings];
  },

  async createBooking(data) {
    await delay(700);
    const id = `TM-${2403 + DB.bookings.length}`;
    const booking = {
      id, ...data,
      status: "waiting",
      driverId: null, driverName: null, price: null,
      createdAt: new Date().toISOString(),
    };
    DB.bookings.push(booking);
    // In production: POST /api/bookings  { ...data }
    return { success: true, booking };
  },

  async updateBookingStatus(bookingId, status, extra = {}) {
    await delay(500);
    const idx = DB.bookings.findIndex(b => b.id === bookingId);
    if (idx >= 0) {
      DB.bookings[idx] = { ...DB.bookings[idx], status, ...extra };
      // In production: PATCH /api/bookings/{bookingId}  { status, ...extra }
      return { success: true };
    }
    return { success: false, message: "Booking not found" };
  },

  /* DRIVERS */
  async registerDriver(phone, data) {
    await delay(800);
    const id = phone;
    DB.users[phone] = { name: data.name, role: "driver", verified: false, driverStatus: "pending" };
    DB.drivers.push({
      id, phone: `+91${phone}`, ...data,
      status: "pending",
      submittedAt: new Date().toISOString(),
    });
    // In production: POST /api/drivers/register  { phone, ...data }
    return { success: true };
  },

  async getDrivers() {
    await delay(400);
    // In production: GET /api/drivers  (staff only)
    return [...DB.drivers];
  },

  async updateDriverStatus(driverId, status) {
    await delay(500);
    const driver = DB.drivers.find(d => d.id === driverId);
    if (driver) {
      driver.status = status;
      if (DB.users[driverId]) DB.users[driverId].driverStatus = status;
      // In production: PATCH /api/drivers/{driverId}  { status }
      return { success: true };
    }
    return { success: false };
  },

  /* LOADS (driver-facing) */
  async getAvailableLoads() {
    await delay(600);
    // In production: GET /api/loads/available
    return DB.bookings.filter(b => b.status === "waiting_driver");
  },

  async acceptLoad(bookingId, driverId, driverName) {
    await delay(500);
    // In production: POST /api/loads/{bookingId}/accept  { driverId }
    return this.updateBookingStatus(bookingId, "driver_accepted", { driverId, driverName });
  },

  async sendConfirmationSMS(bookingId, price) {
    await delay(700);
    // In production: POST /api/bookings/{bookingId}/confirm  { price }
    // → triggers Twilio SMS to both customer and driver
    await this.updateBookingStatus(bookingId, "on_the_way", { price });
    return { success: true };
  },

  async markDelivered(bookingId) {
    await delay(500);
    // In production: PATCH /api/bookings/{bookingId}  { status: "delivered" }
    return this.updateBookingStatus(bookingId, "delivered");
  },

  /* FINANCE */
  async getFinanceEnquiries() {
    await delay(400);
    // In production: GET /api/finance-enquiries  (staff only)
    return [...DB.financeEnquiries];
  },

  async submitFinanceEnquiry(data) {
    await delay(600);
    const id = `FIN-${String(DB.financeEnquiries.length + 1).padStart(3, "0")}`;
    DB.financeEnquiries.push({ id, ...data, submittedAt: new Date().toISOString() });
    // In production: POST /api/finance-enquiries  { ...data }
    return { success: true };
  },

  /* VEHICLES (marketplace) */
  async getVehicles() {
    await delay(400);
    // In production: GET /api/vehicles
    return [...DB.vehicles];
  },

  async listVehicle(data) {
    await delay(700);
    const id = `VH-${String(DB.vehicles.length + 1).padStart(3, "0")}`;
    DB.vehicles.push({ id, ...data, status: "pending_verification", interestedBuyers: [] });
    // In production: POST /api/vehicles  { ...data }  (with multipart for images)
    return { success: true };
  },

  async approveVehicle(vehicleId) {
    await delay(400);
    const v = DB.vehicles.find(v => v.id === vehicleId);
    if (v) { v.status = "listed"; return { success: true }; }
    return { success: false };
  },

  async expressInterest(vehicleId, buyerName, buyerPhone) {
    await delay(400);
    const v = DB.vehicles.find(v => v.id === vehicleId);
    if (v) {
      v.interestedBuyers.push({ name: buyerName, phone: buyerPhone, at: new Date().toISOString() });
      // In production: POST /api/vehicles/{vehicleId}/interest  { buyerName, buyerPhone }
      return { success: true };
    }
    return { success: false };
  },
};

// Export for use in other JS files
window.API = API;
window.DB  = DB;
