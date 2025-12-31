const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");

// transporter (FIX sender)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1️⃣ Save in DB
    await Contact.create({ name, email, subject, message });

    // 2️⃣ Mail to ADMIN
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `📩 New Contact from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b><br/>${message}</p>
      `,
    });

    // 3️⃣ Mail to USER (DYNAMIC)
    await transporter.sendMail({
      from: `"Abhipsa Thakur" <${process.env.EMAIL_USER}>`,
      to: email, // 👈 USER EMAIL (dynamic)
      subject: "✅ Contact Form Submitted Successfully",
      html: `
        <p>Hi <b>${name}</b>,</p>
        <p>Thank you for contacting me. Your message has been received successfully.</p>
        <p>I will get back to you as soon as possible.</p>
        <hr/>
        <p><b>Your Message:</b></p>
        <p>${message}</p>
        <br/>
        <p>Regards,<br/>
        <b>Abhipsa Thakur</b></p>
      `,
    });

    res.status(201).json({
      message: "Message sent successfully & confirmation email sent to user",
    });
  } catch (error) {
    console.error("CONTACT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
