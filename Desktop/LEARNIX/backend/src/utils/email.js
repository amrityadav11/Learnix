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

const sendEmployeeCredentialsEmail = async (employee, tempPassword) => {
  const loginUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  await sendEmail({
    to: employee.email,
    subject: 'Your LEARNIX Employee Account Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">👨‍💼 Welcome to LEARNIX Team!</h1>
        </div>
        <div style="background: #fff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <p style="color: #666; font-size: 16px;">Hi ${employee.firstName} ${employee.lastName},</p>
          <p style="color: #666; line-height: 1.8;">
            Your employee account has been created in LEARNIX. Use the credentials below to log in for the first time:
          </p>
          
          <div style="background: #f4f4f8; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #6366f1;">
            <p style="color: #333; margin: 10px 0;"><strong>📧 Email:</strong> <code style="background: white; padding: 5px 10px; border-radius: 3px; font-family: monospace;">${employee.email}</code></p>
            <p style="color: #333; margin: 10px 0;"><strong>🔑 Temporary Password:</strong> <code style="background: white; padding: 5px 10px; border-radius: 3px; font-family: monospace;">${tempPassword}</code></p>
            <p style="color: #333; margin: 10px 0;"><strong>👔 Job Title:</strong> ${employee.jobTitle}</p>
            <p style="color: #333; margin: 10px 0;"><strong>🏢 Department:</strong> ${employee.departmentName || 'Not assigned'}</p>
            <p style="color: #333; margin: 10px 0;"><strong>📍 Employee ID:</strong> ${employee.employeeId || 'Will be generated'}</p>
          </div>

          <p style="color: #f59e0b; background: #fffbeb; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
            <strong>⚠️ Important:</strong> For security reasons, you must change your password immediately after your first login.
          </p>

          <a href="${loginUrl}/login" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px; font-weight: bold;">
            Login to LEARNIX
          </a>

          <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #0ea5e9;">
            <p style="color: #0369a1; margin: 10px 0;"><strong>💡 Tips:</strong></p>
            <ul style="color: #0369a1; margin: 0; padding-left: 20px;">
              <li>Keep your login credentials secure</li>
              <li>Change your password upon first login</li>
              <li>Enable two-factor authentication for added security</li>
              <li>Contact HR if you face any issues logging in</li>
            </ul>
          </div>

          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
            If you didn't expect this email or have questions, contact your HR department.<br/>
            This is an automated message, please do not reply directly.
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
  sendEmployeeCredentialsEmail,
};
