const nodemailer = require('nodemailer');

// Create a Nodemailer transporter using your email service provider
const transporter = nodemailer.createTransport({
    service: 'gmail', // e.g., Gmail
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Define the function to send a password reset email
const sendPasswordResetEmail = (email, resetToken) => {
    const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: 'Password Reset Request',
        text: `Click on the following link to reset your password: http://localhost:8080/auth/reset-password?token=${resetToken}`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log(`Password reset email sent: ${info.response}`);
        }
    });
};

module.exports = { sendPasswordResetEmail };
