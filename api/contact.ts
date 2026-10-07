// src/api/contact.ts
import nodemailer from 'nodemailer';

interface ContactRequestBody {
  name: string;
  email: string;
  message: string;
}

interface ApiResponse {
  message: string;
}

export default async function handler(req: { method: string; body?: ContactRequestBody }, res: { status: (code: number) => { json: (data: ApiResponse) => void } }) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Please fill all required fields.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_USER}>`,
      replyTo: email,
      to: process.env.MY_EMAIL,
      subject: `Portfolio Contact: ${name}`,
      text: message,
      html: `<p>${message}</p><p>From: ${name} (${email})</p>`,
    });

    return res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Failed to send email.' });
  }
}
