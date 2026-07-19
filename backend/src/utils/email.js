import nodemailer from 'nodemailer'

/**
 * Creates a reusable Nodemailer transporter using SMTP credentials
 * from the environment. Falls back to a test (ethereal) account when
 * no SMTP credentials are configured so the app still runs locally.
 */
let transporter = null

const getTransporter = async () => {
  if (transporter) return transporter

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  } else {
    // Dev fallback: create a throwaway ethereal test account.
    const testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
  }
  return transporter
}

/**
 * Sends an email. Silently logs failures so the server never crashes
 * because of a mail error (e.g. booking confirmation still succeeds).
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const t = await getTransporter()
    const info = await t.sendMail({
      from: process.env.EMAIL_FROM || 'MediCare <no-reply@medicarehospital.com>',
      to,
      subject,
      text: text || '',
      html,
    })
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📧 Email sent: ${nodemailer.getTestMessageUrl(info)}`)
    }
    return info
  } catch (error) {
    console.error(`⚠️ Email send failed: ${error.message}`)
    return null
  }
}

export default sendEmail
