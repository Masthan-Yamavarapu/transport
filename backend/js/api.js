const API_BASE_URL = 'http://localhost:3000/api';

// Example: Replace mock sendOTP
async sendOTP(phone, role) {
  const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, role }),
  });
  return res.json();
}
