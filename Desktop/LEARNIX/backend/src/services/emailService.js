const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT == 465,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });
};

const sendEmail = async ({ to, subject, html, text }) => {
    const transporter = createTransporter();
    const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to,
        subject,
        html,
        text,
    };
    const info = await transporter.sendMail(mailOptions);
    return info;
};

const sendWelcomeEmail = async (user) => {
    await sendEmail({
        to: user.email,
        subject: 'Welcome to LEARNIX!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">Welcome to LEARNIX!</h1>
                </div>
                <div style="background: #fff; padding: 40px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333;">Hi ${user.name}!</h2>
                    <p style="color: #666; line-height: 1.8;">We're thrilled to have you join our learning community.</p>
                </div>
            </div>
        `,
    });
};

const sendVerificationEmail = async (user, token) => {
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
    await sendEmail({
        to: user.email,
        subject: 'Verify Your Email Address',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
                </div>
                <div style="background: #fff; padding: 40px; border-radius: 0 0 10px 10px;">
                    <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none;">
                        Verify Email
                    </a>
                </div>
            </div>
        `,
    });
};

const sendPasswordResetEmail = async (user, token) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail({
        to: user.email,
        subject: 'Reset Your Password',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Password Reset</h1>
                </div>
                <div style="background: #fff; padding: 40px; border-radius: 0 0 10px 10px;">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none;">
                        Reset Password
                    </a>
                </div>
            </div>
        `,
    });
};

const sendOTPEmail = async (user, otp) => {
    await sendEmail({
        to: user.email,
        subject: 'Your OTP Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">OTP Verification</h1>
                </div>
                <div style="background: #fff; padding: 40px; text-align: center;">
                    <h1 style="color: #6366f1; font-size: 40px; letter-spacing: 10px; margin: 0;">${otp}</h1>
                </div>
            </div>
        `,
    });
};

module.exports = { sendEmail, sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail, sendOTPEmail };
