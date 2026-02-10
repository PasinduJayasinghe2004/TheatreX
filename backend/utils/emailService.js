import nodemailer from 'nodemailer';

// Create a transporter using Ethereal Email (for development)
// In production, use a real service like SendGrid, Mailgun, or Gmail (with App Password)
const createTransporter = async () => {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    return { transporter, testAccount };
};

export const sendResetEmail = async (email, resetToken) => {
    const { transporter } = await createTransporter();

    // Reset Link (assuming frontend runs on port 5173/5174/5175... verify this dynamically or use env var)
    // For now hardcoding to localhost:5173 as base, user can adjust
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}&email=${email}`;

    const info = await transporter.sendMail({
        from: '"TheatreX Support" <support@theatrex.com>', // sender address
        to: email, // list of receivers
        subject: "Password Reset Request", // Subject line
        text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`, // plain text body
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563EB;">Password Reset Request</h2>
                <p>You requested a password reset for your TheatreX account.</p>
                <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Reset Password</a>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
            </div>
        `, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    return info;
};
