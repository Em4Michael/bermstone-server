// Lazy mailer — only tries to use nodemailer if SMTP_USER is configured.
// If nodemailer is not installed or SMTP is not set, emails are silently
// skipped so the rest of the API keeps working.

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch {
  // nodemailer not installed — emails will be skipped
}

function getTransporter() {
  if (!nodemailer || !process.env.SMTP_USER) return null;
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const FROM        = () => process.env.SMTP_FROM  || process.env.SMTP_USER || 'noreply@bermstone.com';
const ADMIN_EMAIL = () => process.env.ADMIN_EMAIL || process.env.SMTP_USER;

async function sendBookingEmails(booking, property) {
  const transporter = getTransporter();
  if (!transporter) return; // silently skip if not configured

  const guestName   = `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`;
  const checkInStr  = new Date(booking.checkIn).toDateString();
  const checkOutStr = new Date(booking.checkOut).toDateString();
  const amount      = `NGN ${(booking.totalAmount || 0).toLocaleString()}`;

  await transporter.sendMail({
    from: `"Bermstone" <${FROM()}>`,
    to:   booking.guestInfo.email,
    subject: `Booking Confirmed — ${property.name} [${booking.bookingReference}]`,
    html: `<div style="font-family:sans-serif;color:#0B1F3A;max-width:580px;margin:0 auto">
      <div style="background:#1E5FBE;padding:20px;border-radius:8px 8px 0 0">
        <h2 style="color:white;margin:0">Booking Request Received ✓</h2>
      </div>
      <div style="background:#f8faff;padding:20px;border:1px solid #dbeafe;border-radius:0 0 8px 8px">
        <p>Hi ${guestName}, thank you for booking with Bermstone. Our team will contact you shortly.</p>
        <table style="width:100%;border-collapse:collapse;margin:12px 0">
          <tr><td style="padding:6px;color:#64748b">Reference</td><td style="padding:6px;font-weight:bold">${booking.bookingReference}</td></tr>
          <tr style="background:#f1f5f9"><td style="padding:6px;color:#64748b">Property</td><td style="padding:6px">${property.name}</td></tr>
          <tr><td style="padding:6px;color:#64748b">Check-in</td><td style="padding:6px">${checkInStr}</td></tr>
          <tr style="background:#f1f5f9"><td style="padding:6px;color:#64748b">Check-out</td><td style="padding:6px">${checkOutStr}</td></tr>
          <tr><td style="padding:6px;color:#64748b">Nights</td><td style="padding:6px">${booking.nights}</td></tr>
          <tr style="background:#f1f5f9"><td style="padding:6px;color:#64748b">Total</td><td style="padding:6px;font-weight:bold">${amount}</td></tr>
        </table>
        <p style="font-size:12px;color:#94a3b8">Bermstone · Port Harcourt, Nigeria · +234 800 000 0000</p>
      </div>
    </div>`,
  });

  const adminEmail = ADMIN_EMAIL();
  if (adminEmail) {
    await transporter.sendMail({
      from: `"Bermstone" <${FROM()}>`,
      to:   adminEmail,
      subject: `[New Booking] ${property.name} — ${guestName}`,
      html: `<p><b>Ref:</b> ${booking.bookingReference}</p>
             <p><b>Property:</b> ${property.name}</p>
             <p><b>Guest:</b> ${guestName} · ${booking.guestInfo.email} · ${booking.guestInfo.phone}</p>
             <p><b>Dates:</b> ${checkInStr} → ${checkOutStr} (${booking.nights} nights, ${booking.guests} guests)</p>
             <p><b>Total:</b> ${amount}</p>
             ${booking.specialRequests ? `<p><b>Requests:</b> ${booking.specialRequests}</p>` : ''}`,
    });
  }
}

async function sendInquiryEmails(inquiry) {
  const transporter = getTransporter();
  if (!transporter) return; // silently skip if not configured

  const name   = `${inquiry.firstName} ${inquiry.lastName}`;
  const types  = { owner_listing: 'Owner Listing', investor: 'Investment Inquiry', general_contact: 'General Contact' };
  const label  = types[inquiry.type] || inquiry.type;

  await transporter.sendMail({
    from: `"Bermstone" <${FROM()}>`,
    to:   inquiry.email,
    subject: `We received your ${label} — Bermstone`,
    html: `<div style="font-family:sans-serif;color:#0B1F3A;max-width:580px;margin:0 auto">
      <div style="background:#1E5FBE;padding:20px;border-radius:8px 8px 0 0">
        <h2 style="color:white;margin:0">Inquiry Received ✓</h2>
      </div>
      <div style="background:#f8faff;padding:20px;border:1px solid #dbeafe;border-radius:0 0 8px 8px">
        <p>Hi ${name}, thank you for your <b>${label}</b>. Our team will contact you within <b>24 hours</b>.</p>
        <blockquote style="border-left:3px solid #1E5FBE;margin:12px 0;padding:8px 12px;color:#475569">${inquiry.message}</blockquote>
        ${inquiry.investmentDetails?.projectOfInterest ? `<p><b>Project:</b> ${inquiry.investmentDetails.projectOfInterest}</p>` : ''}
        ${inquiry.investmentDetails?.investmentAmount   ? `<p><b>Amount:</b> NGN ${Number(inquiry.investmentDetails.investmentAmount).toLocaleString()}</p>` : ''}
        <p style="font-size:12px;color:#94a3b8">Bermstone · Port Harcourt, Nigeria</p>
      </div>
    </div>`,
  });

  const adminEmail = ADMIN_EMAIL();
  if (adminEmail) {
    await transporter.sendMail({
      from: `"Bermstone" <${FROM()}>`,
      to:   adminEmail,
      subject: `[${label}] ${name}`,
      html: `<p><b>Type:</b> ${label}</p>
             <p><b>Name:</b> ${name}</p>
             <p><b>Email:</b> ${inquiry.email}</p>
             <p><b>Phone:</b> ${inquiry.phone || '—'}</p>
             ${inquiry.company ? `<p><b>Company:</b> ${inquiry.company}</p>` : ''}
             <p><b>Message:</b> ${inquiry.message}</p>
             ${inquiry.investmentDetails?.projectOfInterest ? `<p><b>Project:</b> ${inquiry.investmentDetails.projectOfInterest}</p>` : ''}
             ${inquiry.investmentDetails?.investmentAmount   ? `<p><b>Amount:</b> NGN ${Number(inquiry.investmentDetails.investmentAmount).toLocaleString()}</p>` : ''}`,
    });
  }
}

module.exports = { sendBookingEmails, sendInquiryEmails };