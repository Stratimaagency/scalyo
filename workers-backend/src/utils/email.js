/**
 * Send an email via SendGrid or MailChannels (free on CF Workers).
 */
export async function sendEmail(env, { to, subject, html }) {
  const from = env.FROM_EMAIL || 'noreply@scalyo.app'
  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: from, name: 'Scalyo' },
    subject,
    content: [{ type: 'text/html', value: html }],
  }

  try {
    if (env.SENDGRID_API_KEY) {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.SENDGRID_API_KEY}` },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        console.error('SendGrid error:', await res.text())
        return false
      }
    } else {
      const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        console.error('MailChannels error:', await res.text())
        return false
      }
    }
    return true
  } catch (err) {
    console.error('sendEmail error:', err)
    return false
  }
}
