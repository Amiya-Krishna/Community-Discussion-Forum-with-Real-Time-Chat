// Small helper around the Resend HTTP API so every feature (password reset,
// OTP login, future notification emails, etc.) sends mail the same way.
export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set — cannot send email");
    return { ok: false, error: "Email service not configured" };
  }

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // IMPORTANT: without a verified custom domain in Resend, you can
        // only send from their sandbox address "onboarding@resend.dev" —
        // and Resend will only actually deliver those emails to the address
        // you signed up to Resend with. Set RESEND_FROM to an address on a
        // domain you've verified in Resend once you're ready for real users.
        from: process.env.RESEND_FROM || "onboarding@resend.dev",
        to: [to],
        subject,
        html,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Resend API responded non-OK", text);
      return { ok: false, error: text };
    }

    return { ok: true };
  } catch (err) {
    console.error("Failed to send email", err.message || err);
    return { ok: false, error: err.message || String(err) };
  }
};

export default sendEmail;
