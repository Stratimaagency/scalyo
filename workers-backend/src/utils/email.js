/**
 * Send an email via Resend, SendGrid, or MailChannels.
 */
export async function sendEmail(env, { to, subject, html }) {
  const from = env.FROM_EMAIL || 'noreply@scalyo.app'

  try {
    // Priority: Resend > SendGrid > MailChannels
    if (env.RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.RESEND_API_KEY}` },
        body: JSON.stringify({ from: `Scalyo <${from}>`, to: [to], subject, html }),
      })
      if (!res.ok) {
        console.error('Resend error:', await res.text())
        return false
      }
    } else if (env.SENDGRID_API_KEY) {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.SENDGRID_API_KEY}` },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: from, name: 'Scalyo' },
          subject,
          content: [{ type: 'text/html', value: html }],
        }),
      })
      if (!res.ok) {
        console.error('SendGrid error:', await res.text())
        return false
      }
    } else {
      console.error('No email provider configured (RESEND_API_KEY or SENDGRID_API_KEY)')
      return false
    }
    return true
  } catch (err) {
    console.error('sendEmail error:', err)
    return false
  }
}
