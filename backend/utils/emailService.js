const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

const sendWelcomeEmail = (toEmail, name) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'Welcome to Healthy Bites!',
        html: `
            <div style="font-family: sans-serif; padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
                <h1 style="color: #047857;">Welcome, ${name}!</h1>
                <p style="color: #1f2937;">Thank you for joining Healthy Bites. We're excited to help you on your journey to better health.</p>
                <p style="color: #1f2937;">To get started, please update your profile with your personal details so we can calculate your daily nutrition goals.</p>
                <a href="http://localhost:5500/profile.html" style="display: inline-block; padding: 10px 20px; margin-top: 20px; background-color: #047857; color: #ffffff; text-decoration: none; border-radius: 5px;">Go to My Profile</a>
                <p style="margin-top: 30px; color: #6b7280;">Best regards,<br>The Healthy Bites Team</p>
            </div>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('Error sending email:', error);
        }
        console.log('Email sent:', info.response);
    });
};

module.exports = { sendWelcomeEmail };