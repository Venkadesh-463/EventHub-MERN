const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendRegistrationEmail = async (student, event, qrCodeData) => {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrCodeData}`;
  
  const mailOptions = {
    from: `"Event Hub" <${process.env.EMAIL_USER}>`,
    to: student.email,
    subject: `🎟️ Registration Confirmed: ${event.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #6366f1; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">Registration Confirmed!</h1>
        </div>
        <div style="padding: 30px; line-height: 1.6; color: #1e293b;">
          <h2>Hi ${student.name},</h2>
          <p>You have successfully registered for <strong>${event.title}</strong>. Your entry ticket is ready!</p>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px;">
            <p style="margin-bottom: 15px; font-weight: bold; color: #6366f1;">YOUR ENTRY QR CODE</p>
            <img src="${qrCodeUrl}" alt="QR Code" style="width: 150px; height: 150px;" />
            <p style="margin-top: 15px; font-size: 0.8rem; color: #64748b;">Show this at the venue entrance</p>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px;">
            <p style="margin-bottom: 12px;"><strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>📍 Venue:</strong> ${event.location}</p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; background-color: #eef2ff; border: 2px solid #6366f1; border-radius: 12px; padding: 16px;">
            <p style="margin: 0 0 6px 0; font-size: 12px; color: #6366f1; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Your Registration ID</p>
            <p style="margin: 0; font-size: 28px; font-weight: 900; font-family: monospace; color: #1e293b; letter-spacing: 4px;">${qrCodeData}</p>
            <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">Use this ID for manual check-in if QR scan fails</p>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
          This ticket is unique to you. Do not share it with others.
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Registration confirmation email sent');
  } catch (error) {
    console.error('❌ Registration email failed:', error.message);
  }
};

const sendEventNotification = async (students, event) => {
  const mailOptions = {
    from: `"Event Hub" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Send to self
    bcc: students.map(s => s.email).join(','), // BCC all students for privacy
    subject: `🚀 New Event Published: ${event.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #6366f1; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">New Event Alert!</h1>
        </div>
        <div style="padding: 30px; line-height: 1.6; color: #1e293b;">
          <h2>${event.title}</h2>
          <p>Hi Student,</p>
          <p>A new event has just been published in your college. Don't miss out on this opportunity!</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>📍 Venue:</strong> ${event.location}</p>
            <p><strong>🏷️ Category:</strong> ${event.category}</p>
          </div>
          
          <p>${event.description}</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://127.0.0.1:5173/events" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Event & Register</a>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
          This is an automated notification from Event Hub.
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Event notification emails sent');
  } catch (error) {
    console.error('❌ Email notification failed:', error.message);
  }
};

const sendAttendanceEmail = async (student, event, duration) => {
  const mailOptions = {
    from: `"Event Hub" <${process.env.EMAIL_USER}>`,
    to: student.email,
    subject: `✅ Attendance Verified: ${event.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #10b981; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">Attendance Verified!</h1>
        </div>
        <div style="padding: 30px; line-height: 1.6; color: #1e293b;">
          <h2>Congratulations, ${student.name}!</h2>
          <p>Your attendance for <strong>${event.title}</strong> has been successfully verified.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0;">
            <p><strong>🕒 Duration Present:</strong> ${duration} minutes</p>
            <p><strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
          </div>
          
          <p>Your certificate is now available for download in your dashboard.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://127.0.0.1:5173/my-events" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Download Certificate</a>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
          Well done on participating! See you at the next event.
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Attendance verification email sent');
  } catch (error) {
    console.error('❌ Attendance email failed:', error.message);
  }
};

const sendPasswordResetEmail = async (user, resetUrl) => {
  const mailOptions = {
    from: `"Event Hub" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: '🔐 Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #6366f1; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">Password Reset</h1>
        </div>
        <div style="padding: 30px; line-height: 1.6; color: #1e293b;">
          <h2>Hi ${user.name},</h2>
          <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
          
          <p>To reset your password, click the button below. This link is valid for 10 minutes only.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1rem;">Reset Password</a>
          </div>
          
          <p style="font-size: 0.9rem; color: #64748b;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 0.8rem; color: #6366f1; word-break: break-all;">${resetUrl}</p>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
          This is a secure automated message from Event Hub.
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent');
  } catch (error) {
    console.error('❌ Reset email failed:', error.message);
  }
};

const sendCollegeOnboardingEmail = async (adminName, email, password, collegeName) => {
  const mailOptions = {
    from: `"Event Hub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🏛️ Welcome to Event Hub! Your College Admin Account is Ready`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #6366f1; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">Welcome to Event Hub!</h1>
        </div>
        <div style="padding: 30px; line-height: 1.6; color: #1e293b;">
          <h2>Hello ${adminName},</h2>
          <p>The Super Admin has officially created an administrator account for <strong>${collegeName}</strong> on the Event Hub platform!</p>
          
          <p>You can now log in, set up your college profile, and start publishing events for students to discover.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0; color: #475569;">Your Login Credentials:</h3>
            <p style="margin-bottom: 5px;"><strong>Email:</strong> ${email}</p>
            <p style="margin-top: 0;"><strong>Password:</strong> ${password}</p>
          </div>
          
          <p style="color: #ef4444; font-size: 0.85rem;"><em>For your security, we highly recommend changing this password immediately after your first login.</em></p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://127.0.0.1:5173/login" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Log In Now</a>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
          This is an automated onboarding message from Event Hub.
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ College Onboarding email sent');
  } catch (error) {
    console.error('❌ College Onboarding email failed:', error.message);
  }
};

module.exports = { sendEventNotification, sendAttendanceEmail, sendRegistrationEmail, sendPasswordResetEmail, sendCollegeOnboardingEmail };
