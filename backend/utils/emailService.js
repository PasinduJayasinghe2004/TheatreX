import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Resend only if API key is available
let resend = null;
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
} else {
    console.warn('⚠️  RESEND_API_KEY not set - email functionality will be disabled');
}

export const sendResetEmail = async (email, resetToken) => {
    // Check if Resend is configured
    if (!resend) {
        console.warn('Email service not configured. Skipping email send.');
        console.log(`[DEV MODE] Reset link would be sent to: ${email}`);
        console.log(`[DEV MODE] Reset token: ${resetToken}`);
        return { success: true, message: 'Email skipped - no API key configured' };
    }

    // Reset Link (assuming frontend runs on port 5173/5174/5175... verify this dynamically or use env var)
    // For now hardcoding to localhost:5173 as base, user can adjust
    // Ideally this base URL should be in .env as well (e.g., CLIENT_URL)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}&email=${email}`;

    try {
        const data = await resend.emails.send({
            from: 'TheatreX Support <onboarding@resend.dev>', // Use 'onboarding@resend.dev' for testing without a domain
            to: email,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563EB;">Password Reset Request</h2>
                    <p>You requested a password reset for your TheatreX account.</p>
                    <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Reset Password</a>
                    <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
                </div>
            `
        });

        console.log("Email sent successfully:", data);
        return data;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

