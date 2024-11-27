// emailController.js

const nodemailer = require('nodemailer');

const sendEmail = async (req, res) => {
  try {
    const { to, subject, text } = req.body;

    // Create transporter
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Define email options
    let mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: to,
      subject: subject,
      text: text
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
};

module.exports = sendEmail;
