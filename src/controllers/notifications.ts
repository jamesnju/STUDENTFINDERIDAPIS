import { Request, Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import { prisma } from '../conn/connection';


export async function sendEmailNotification(req: Request, res: Response, next: NextFunction) {
  const { to, subject, text, from } = req.body;

  if (!to || !subject || !text || !from) {
    res.status(400).json({ error: 'All fields (to, subject, text, from) are required' });
    return;
  }
console.log(req.body);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Use environment variables in production
    },
  });

  const mailOptions = {
    from,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);

    // Save email log to the database (optional)
    await prisma.email.create({
      data: {
        to,
        subject,
        text,
        from,
      },
    });

    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
}