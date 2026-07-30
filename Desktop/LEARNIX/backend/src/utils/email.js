const nodemailer = require('nodemailer');

const createTransporter = () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      logger: false,
      debug: false
    });
    return transporter;
  } catch (err) {
    console.error('Transporter creation error:', err.message);
    return null;
  }
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      console.error('Email credentials not configured in .env');
      return { success: false, error: 'Email not configured' };
    }

    const transporter = createTransporter();
    if (!transporter) {
      console.error('Failed to create email transporter');
      return { success: false, error: 'Transporter creation failed' };
    }

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'LEARNIX'}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html: html || text,
      text: text || html,
    };

    console.log('[EMAIL] Sending to:', to, 'Subject:', subject);
    const info = await transporter.sendMail(mailOptions);
    console.log('[EMAIL] Sent successfully:', info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error('[EMAIL ERROR]:', error.message);
    return { success: false, error: error.message };
  }
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
        <div style="background: #fff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">Hi ${user.name}! 👋</h2>
          <p style="color: #666; line-height: 1.8;">
            We're thrilled to have you join our learning community. Start exploring thousands of courses from expert instructors and begin your learning journey today!
          </p>
          <a href="${process.env.CLIENT_URL}/courses" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px;">
            Explore Courses
          </a>
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
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Verify Your Email</h1>
        </div>
        <div style="background: #fff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <p style="color: #666; line-height: 1.8;">Hi ${user.name}, please verify your email by clicking the button below:</p>
          <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none;">
            Verify Email
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">Link expires in 24 hours. If you didn't create an account, ignore this email.</p>
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
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        <div style="background: #fff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <p style="color: #666; line-height: 1.8;">Hi ${user.name}, click below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none;">
            Reset Password
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">Link expires in 10 minutes. If you didn't request this, ignore this email.</p>
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
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">OTP Verification</h1>
        </div>
        <div style="background: #fff; padding: 40px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="color: #666;">Hi ${user.name}, your OTP is:</p>
          <div style="background: #f4f4f8; display: inline-block; padding: 20px 40px; border-radius: 10px; margin: 20px 0;">
            <h1 style="color: #6366f1; font-size: 40px; letter-spacing: 10px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #999; font-size: 12px;">This OTP expires in 10 minutes.</p>
        </div>
      </div>
    `,
  });
};

const sendPurchaseConfirmationEmail = async (user, order) => {
  const courseTitles = order.courses.map(c => c.course?.title || 'Course').join(', ');

  await sendEmail({
    to: user.email,
    subject: `Order Confirmed - ${order._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">✅ Order Confirmed!</h1>
        </div>
        <div style="background: #fff; padding: 40px; border-radius: 0 0 10px 10px;">
          <p style="color: #666; font-size: 16px;">Hi ${user.name},</p>
          <p style="color: #666; line-height: 1.8;">Your purchase was successful!</p>
          <p style="color: #666;"><strong>Courses:</strong> ${courseTitles}</p>
          <p style="color: #666;"><strong>Amount Paid:</strong> $${order.finalAmount || order.totalAmount}</p>
          <a href="${process.env.CLIENT_URL}/dashboard/my-learning" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px; font-weight: bold;">
            Start Learning
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            Questions? Contact us at support@learnix.com
          </p>
        </div>
      </div>
    `,
  });
};

const sendEnrollmentEmail = async (user, course, courseLink) => {
  await sendEmail({
    to: user.email,
    subject: `Welcome to ${course.title}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🎉 Enrollment Successful!</h1>
        </div>
        <div style="background: #fff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <p style="color: #666; font-size: 16px;">Hi ${user.name},</p>
          <p style="color: #666; line-height: 1.8;">
            Welcome! You've been successfully enrolled in <strong>${course.title}</strong>${course.instructor?.name ? ` by ${course.instructor.name}` : ''}.
          </p>
          <p style="color: #666; line-height: 1.8;">
            You can now access all course content and start learning immediately.
          </p>
          <a href="${courseLink}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px; font-weight: bold;">
            Start Learning Now
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            If you have any questions, contact us at support@learnix.com
          </p>
        </div>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
  sendPurchaseConfirmationEmail,
  sendEnrollmentEmail,
};
