const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  });
};

const sendVerificationEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await sendMail({
    to: user.email,
    subject: "Verify your Luminary account",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#258cf4">Welcome to Luminary, ${user.name}!</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${url}" style="display:inline-block;padding:12px 28px;background:#258cf4;color:white;border-radius:8px;text-decoration:none;font-weight:600">
          Verify Email
        </a>
        <p style="color:#888;font-size:12px;margin-top:20px">This link expires in 24 hours.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await sendMail({
    to: user.email,
    subject: "Reset your Luminary password",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#258cf4">Password Reset</h2>
        <p>Hi ${user.name}, click below to reset your password.</p>
        <a href="${url}" style="display:inline-block;padding:12px 28px;background:#258cf4;color:white;border-radius:8px;text-decoration:none;font-weight:600">
          Reset Password
        </a>
        <p style="color:#888;font-size:12px;margin-top:20px">This link expires in 1 hour. Ignore if you didn't request this.</p>
      </div>
    `,
  });
};

const sendOrderConfirmationEmail = async (user, order) => {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${item.price}</td>
      </tr>
    `
    )
    .join("");

  await sendMail({
    to: user.email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#258cf4">Order Confirmed!</h2>
        <p>Hi ${user.name}, your order <strong>${order.orderNumber}</strong> has been placed.</p>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f5f7f8">
              <th style="padding:8px;text-align:left">Item</th>
              <th style="padding:8px">Qty</th>
              <th style="padding:8px;text-align:right">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="text-align:right;font-weight:600;margin-top:12px">Total: $${order.pricing.total}</p>
        <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="display:inline-block;padding:12px 28px;background:#258cf4;color:white;border-radius:8px;text-decoration:none;font-weight:600">
          Track Order
        </a>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendOrderConfirmationEmail, sendMail };
