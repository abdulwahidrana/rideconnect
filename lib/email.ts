import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await resend.emails.send({
    from: "RideConnect <onboarding@resend.dev>",
    to,
    subject: "Reset your RideConnect password",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#1e293b;margin-bottom:8px;">Password Reset Request</h2>
        <p style="color:#475569;font-size:15px;">
          We received a request to reset your password. Click the button below to choose a new one.
          This link expires in <strong>30 minutes</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:24px 0;padding:12px 28px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
          Reset Password
        </a>
        <p style="color:#94a3b8;font-size:13px;">
          If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#cbd5e1;font-size:12px;text-align:center;">RideConnect &mdash; Real-Time Ride Sharing</p>
      </div>
    `,
  });
}
