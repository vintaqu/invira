// Email service - gracefully handles missing RESEND_API_KEY in local dev
let Resend: any = null
try {
  Resend = require('resend').Resend
} catch {}

const resend = process.env.RESEND_API_KEY && Resend
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM = process.env.EMAIL_FROM ?? 'Invira <hola@invira.app>'

async function sendEmail(params: { from: string; to: string; subject: string; html: string }) {
  if (!resend) {
    console.log('[Email - DEV MODE] Would send to:', params.to, '|', params.subject)
    return { id: 'dev-mode' }
  }
  return resend.emails.send(params)
}

interface RSVPConfirmationParams {
  to: string; guestName: string; eventTitle: string; eventDate: Date; eventSlug: string
}
interface EventActivatedParams {
  to: string; userName: string; eventTitle: string; eventUrl: string; dashboardUrl: string
}
interface InvitationParams {
  to: string; guestName: string; eventTitle: string; eventDate: Date
  personalizedUrl: string; heroImageUrl?: string
}
interface ReminderParams {
  to: string; guestName: string; eventTitle: string; eventDate: Date
  daysUntil: number; eventUrl: string; rsvpStatus?: string
}


interface WelcomeParams { to: string; name: string }

export const emailService = {
  async sendRSVPConfirmation(p: RSVPConfirmationParams) {
    return sendEmail({
      from: FROM,
      to: p.to,
      subject: `✅ Asistencia confirmada — ${p.eventTitle}`,
      html: `<div style="font-family:Georgia,serif;max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:48px 40px;text-align:center">
          <p style="color:#84C5BC;font-size:13px;letter-spacing:3px;text-transform:uppercase;margin:0 0 16px">Invira</p>
          <h1 style="color:#fff;font-size:28px;font-weight:400;margin:0">Asistencia Confirmada ✓</h1>
        </div>
        <div style="padding:40px">
          <p style="color:#333;font-size:16px">Hola <strong>${p.guestName}</strong>,</p>
          <p style="color:#555;font-size:15px;line-height:1.8">Tu asistencia a <strong>${p.eventTitle}</strong> ha sido confirmada. ¡Estamos encantados de contar contigo!</p>
          <div style="background:#faf9f7;border-left:3px solid #84C5BC;padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0">
            <p style="margin:0;color:#333;font-size:14px"><strong>Fecha:</strong> ${new Date(p.eventDate).toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/event/${p.eventSlug}" style="display:inline-block;background:#1a1a2e;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:14px">Ver invitación →</a>
        </div>
      </div>`,
    })
  },

  async sendEventActivated(p: EventActivatedParams) {
    return sendEmail({
      from: FROM,
      to: p.to,
      subject: `🎉 ¡Tu evento está publicado! — ${p.eventTitle}`,
      html: `<div style="font-family:Georgia,serif;max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:48px 40px;text-align:center">
          <p style="font-size:36px;margin:0 0 12px">🎉</p>
          <h1 style="color:#fff;font-size:26px;font-weight:400;margin:0">¡Tu evento está live!</h1>
        </div>
        <div style="padding:40px">
          <p style="color:#333">Hola <strong>${p.userName}</strong>,</p>
          <p style="color:#555;line-height:1.8"><strong>${p.eventTitle}</strong> ya está publicado y listo para compartir con tus invitados.</p>
          <div style="display:flex;gap:12px;margin:24px 0">
            <a href="${p.eventUrl}" style="flex:1;text-align:center;background:#84C5BC;color:#fff;padding:14px;border-radius:8px;text-decoration:none;font-size:13px">Ver mi evento →</a>
            <a href="${p.dashboardUrl}" style="flex:1;text-align:center;background:#1a1a2e;color:#fff;padding:14px;border-radius:8px;text-decoration:none;font-size:13px">Ir al panel →</a>
          </div>
        </div>
      </div>`,
    })
  },

  async sendInvitation(p: InvitationParams) {
    return sendEmail({
      from: FROM,
      to: p.to,
      subject: `💌 Estás invitado/a — ${p.eventTitle}`,
      html: `<div style="font-family:Georgia,serif;max-width:560px;margin:40px auto">
        ${p.heroImageUrl ? `<img src="${p.heroImageUrl}" style="width:100%;height:240px;object-fit:cover;border-radius:16px 16px 0 0" alt="">` : ''}
        <div style="background:#fff;padding:40px;border-radius:${p.heroImageUrl ? '0 0 16px 16px' : '16px'}">
          <p style="color:#84C5BC;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 20px">Invitación Personal</p>
          <h1 style="font-size:28px;color:#1a1a2e;font-weight:400;margin:0 0 8px">${p.eventTitle}</h1>
          <p style="color:#888;font-size:14px;margin:0 0 24px">${new Date(p.eventDate).toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
          <p style="color:#555;font-size:15px;line-height:1.8">Hola <strong>${p.guestName}</strong>, tienes una invitación especial esperándote.</p>
          <a href="${p.personalizedUrl}" style="display:block;text-align:center;background:#1a1a2e;color:#fff;padding:16px 28px;border-radius:8px;text-decoration:none;font-size:14px;margin-top:28px">Abrir mi invitación →</a>
          <p style="color:#aaa;font-size:11px;text-align:center;margin-top:24px">Powered by <a href="https://invira.app" style="color:#84C5BC">Invira</a></p>
        </div>
      </div>`,
    })
  },


  async sendWelcome(p: WelcomeParams) {
    return sendEmail({
      from: FROM,
      to: p.to,
      subject: '¡Bienvenido/a a Invira! 🎉',
      html: `<div style="font-family:Georgia,serif;max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <div style="background:linear-gradient(135deg,#2d1a10,#1a0e08);padding:48px 40px;text-align:center">
          <p style="font-family:'Playfair Display',serif;font-style:italic;font-size:28px;color:#fff;margin:0 0 8px">Invira</p>
          <p style="color:rgba(132,197,188,0.8);font-size:14px;margin:0">Invitaciones digitales para momentos únicos</p>
        </div>
        <div style="padding:40px">
          <p style="color:#333;font-size:16px;margin-bottom:12px">Hola <strong>${p.name}</strong>,</p>
          <p style="color:#555;font-size:15px;line-height:1.8;margin-bottom:24px">
            Bienvenido/a a Invira. Ya puedes crear tu primera invitación digital en minutos.
          </p>
          <div style="background:#faf8f4;border-radius:12px;padding:20px;margin-bottom:24px">
            <p style="font-size:14px;color:#333;margin:0 0 8px;font-weight:500">¿Por dónde empezar?</p>
            <p style="font-size:13px;color:#888;margin:0;line-height:1.7">
              1. Ve al dashboard y haz clic en <strong>+ Crear evento</strong><br>
              2. Elige el tipo de celebración y añade los detalles<br>
              3. Añade tus invitados y comparte el enlace
            </p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#1a1a1a;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:500">
            Ir a mi panel →
          </a>
        </div>
        <div style="padding:20px 40px;border-top:1px solid #f0ece6;text-align:center">
          <p style="color:#aaa;font-size:12px;margin:0">Powered by <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#84C5BC;text-decoration:none">Invira</a></p>
        </div>
      </div>`,
    })
  },
  async sendReminder(p: ReminderParams) {
    return sendEmail({
      from: FROM,
      to: p.to,
      subject: `⏰ Quedan ${p.daysUntil} días — ${p.eventTitle}`,
      html: `<div style="font-family:Georgia,serif;max-width:560px;margin:40px auto;background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <p style="color:#84C5BC;font-size:13px;letter-spacing:2px;text-transform:uppercase">Recordatorio</p>
        <h1 style="font-size:32px;color:#1a1a2e;font-weight:400">Quedan <span style="color:#84C5BC">${p.daysUntil}</span> días</h1>
        <p style="color:#555;font-size:15px;line-height:1.8">Hola <strong>${p.guestName}</strong>, se acerca <strong>${p.eventTitle}</strong> el ${new Date(p.eventDate).toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}.</p>
        ${p.rsvpStatus === 'PENDING' ? '<p style="color:#e67e22;font-size:14px">⚠️ Aún no has confirmado tu asistencia.</p>' : ''}
        <a href="${p.eventUrl}" style="display:inline-block;background:#1a1a2e;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:14px;margin-top:16px">Ver detalles →</a>
      </div>`,
    })
  },
}
