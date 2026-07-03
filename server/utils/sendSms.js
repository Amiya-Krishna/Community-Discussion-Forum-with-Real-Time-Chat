// Small helper around the Fast2SMS "OTP" route (free ₹50 signup credit,
// no DLT registration needed). Docs: https://www.fast2sms.com/otp-sms/
export const sendSms = async ({ to, otp }) => {
  if (!process.env.FAST2SMS_API_KEY) {
    console.error("FAST2SMS_API_KEY is not set — cannot send SMS");
    return { ok: false, error: "SMS service not configured" };
  }

  // Fast2SMS expects a plain 10-digit Indian mobile number (no +91 / 0 prefix).
  const number = String(to || "").replace(/\D/g, "").slice(-10);
  if (number.length !== 10) {
    return { ok: false, error: "Invalid mobile number" };
  }

  try {
    const resp = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        variables_values: otp,
        route: "otp",
        numbers: number,
      }),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || data?.return === false) {
      console.error("Fast2SMS API error", data);
      return { ok: false, error: data?.message?.[0] || "SMS send failed" };
    }

    return { ok: true };
  } catch (err) {
    console.error("Failed to send SMS", err.message || err);
    return { ok: false, error: err.message || String(err) };
  }
};

export default sendSms;
