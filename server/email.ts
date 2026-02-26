const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@freefinity.in";
const APP_URL = process.env.APP_URL || "https://freefinity.in";

export async function sendPasswordResetEmail(toEmail: string, resetToken: string, username: string): Promise<boolean> {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

  if (!SENDGRID_API_KEY) {
    console.log(`[DEV] Password reset link for ${username} (${toEmail}): ${resetUrl}`);
    return true;
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: toEmail }],
          subject: "Reset your FreeFinity India password",
        }],
        from: { email: FROM_EMAIL, name: "FreeFinity India" },
        content: [{
          type: "text/html",
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0C0F0A; color: #fff; padding: 32px; border-radius: 12px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #FF7A18; margin: 0;">FreeFinity India</h2>
                <p style="color: #888; font-size: 13px; margin: 4px 0 0;">Your Voice. Your Bharat. No Limits.</p>
              </div>
              <h3 style="margin: 0 0 12px;">Reset Your Password</h3>
              <p style="color: #ccc; margin: 0 0 20px;">Hi <strong>${username}</strong>,</p>
              <p style="color: #ccc; margin: 0 0 20px;">We received a request to reset your password. Click the button below to set a new one. This link expires in 1 hour.</p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #FF7A18, #FF4E00); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
              </div>
              <p style="color: #666; font-size: 12px; margin: 0;">If you didn't request this, you can safely ignore this email. Your password will not change.</p>
              <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;" />
              <p style="color: #555; font-size: 11px; text-align: center; margin: 0;">FreeFinity India — Freedom Without Limits</p>
            </div>
          `,
        }],
      }),
    });

    return response.ok;
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    return false;
  }
}
