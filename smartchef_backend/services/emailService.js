const SibApiV3Sdk = require("sib-api-v3-sdk");
const nodemailer = require("nodemailer");
const { getSettings } = require("./systemSettingsService");
const AdminNotificationService = require("./adminNotificationService");

// Configuração padrão do Brevo (usando a API key do .env)
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Função auxiliar para verificar se o SMTP está configurado
function isSmtpConfigured(smtp) {
  return smtp && smtp.host && smtp.user && smtp.pass;
}

// Função para enviar email usando SMTP (Nodemailer)
async function sendWithSmtp(smtpConfig, mailOptions) {
  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port || 587,
    secure: smtpConfig.secure || false, // true para porta 465
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.sendMail({
    from: `"Bom Piteu" <${smtpConfig.user}>`,
    to: mailOptions.to,
    subject: mailOptions.subject,
    html: mailOptions.html,
  });
}

// Função para enviar email usando Brevo (API)
async function sendWithBrevo(mailOptions) {
  const api = new SibApiV3Sdk.TransactionalEmailsApi();
  await api.sendTransacEmail({
    sender: { name: "Bom Piteu", email: "contavisa560@gmail.com" },
    to: [{ email: mailOptions.to, name: mailOptions.name || "" }],
    subject: mailOptions.subject,
    htmlContent: mailOptions.html,
  });
}

// Função principal que decide qual serviço usar
async function sendEmail(mailOptions) {
  const settings = await getSettings();

  if (!settings.enableNotifications) {
    console.log("📧 Emails desativados pela configuração. Não enviado.");
    return;
  }

  try {
    if (isSmtpConfigured(settings.smtp)) {
      console.log(`📧 Enviando via SMTP (${settings.smtp.host})`);
      await sendWithSmtp(settings.smtp, mailOptions);
    } else {
      if (!process.env.BREVO_API_KEY) {
        console.error("❌ BREVO_API_KEY não configurada. Email não enviado.");
        await AdminNotificationService.notifyEmailFailure(mailOptions.to, new Error("BREVO_API_KEY não configurada"));
        return;
      }
      console.log("📧 Enviando via Brevo (API)");
      await sendWithBrevo(mailOptions);
    }
  } catch (error) {
    console.error("❌ Falha no envio de email:", error);
    await AdminNotificationService.notifyEmailFailure(mailOptions.to, error);
  }
}

// Template de email (igual ao teu, mantém)
const emailTemplate = (title, content, buttonText, buttonUrl) => `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f8f4f0;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f4f0;padding:40px 0;">
     <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
           <tr>
            <td align="center" style="background:linear-gradient(135deg,#f97316,#ef4444);padding:32px;border-radius:16px 16px 0 0;">
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">Bom Piteu</h1>
              <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px;">A sua cozinha inteligente</p>
             </td>
           </tr>
           <tr>
            <td style="background:#fff;padding:40px 48px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 16px;font-weight:600;">${title}</h2>
              ${content}
              ${buttonText && buttonUrl ? `
              <div style="text-align:center;margin:32px 0;">
                <a href="${buttonUrl}" style="display:inline-block;background:linear-gradient(135deg,#f97316,#ef4444);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:600;font-size:15px;">
                  ${buttonText}
                </a>
              </div>
              <p style="color:#999;font-size:12px;text-align:center;margin:0;">
                Se o botão não funcionar, copia e cola este link:<br>
                <a href="${buttonUrl}" style="color:#f97316;word-break:break-all;">${buttonUrl}</a>
              </p>
              ` : ''}
             </td>
           </tr>
           <tr>
            <td align="center" style="padding:24px 0;">
              <p style="color:#aaa;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} Bom Piteu · Luanda, Angola<br>
                Este é um email automático, por favor não responda.
              </p>
             </td>
           </tr>
         </table>
       </td>
     </tr>
   </table>
</body>
</html>
`;

// Funções específicas
const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const content = `
    <p style="color:#444;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Olá <strong>${user.name}</strong>,
    </p>
    <p style="color:#444;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Obrigado por criar a sua conta no <strong>Bom Piteu</strong>! Para activar a sua conta, confirme o seu email clicando no botão abaixo.
    </p>
    <div style="background:#fff8f5;border-left:4px solid #f97316;padding:16px;border-radius:8px;margin:20px 0;">
      <p style="margin:0;color:#666;font-size:13px;">Este link expira em <strong>24 horas</strong>.</p>
    </div>
  `;
  await sendEmail({
    to: user.email,
    name: user.name,
    subject: "Confirme o seu email — Bom Piteu",
    html: emailTemplate("Confirme o seu email", content, "Verificar Email", verifyUrl),
  });
  console.log(`📧 Email de verificação enviado para: ${user.email}`);
};

const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const content = `
    <p style="color:#444;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Olá <strong>${user.name}</strong>,
    </p>
    <p style="color:#444;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Recebemos um pedido para repor a palavra-passe da sua conta. Clique no botão abaixo para criar uma nova.
    </p>
    <div style="background:#fff8f5;border-left:4px solid #ef4444;padding:16px;border-radius:8px;margin:20px 0;">
      <p style="margin:0 0 8px;color:#666;font-size:13px;">Este link expira em <strong>1 hora</strong>.</p>
      <p style="margin:0;color:#666;font-size:13px;">Se não pediu esta alteração, ignore este email.</p>
    </div>
  `;
  await sendEmail({
    to: user.email,
    name: user.name,
    subject: "Recuperar palavra-passe — Bom Piteu",
    html: emailTemplate("Recuperar palavra-passe", content, "Criar nova palavra-passe", resetUrl),
  });
  console.log(`📧 Email de recuperação enviado para: ${user.email}`);
};

const sendWelcomeEmail = async (user) => {
  const content = `
    <p style="color:#444;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Olá <strong>${user.name}</strong>,
    </p>
    <p style="color:#444;font-size:15px;line-height:1.7;margin:0 0 16px;">
      A sua conta foi verificada com sucesso! 🎉 Bem-vindo ao <strong>Bom Piteu</strong>.
    </p>
    <ul style="color:#444;font-size:15px;line-height:2;padding-left:20px;">
      <li>Conversar com o chef IA</li>
      <li>Identificar pratos por foto</li>
      <li>Descobrir receitas angolanas e internacionais</li>
      <li>Guardar os seus pratos favoritos</li>
    </ul>
  `;
  await sendEmail({
    to: user.email,
    name: user.name,
    subject: "Bem-vindo ao Bom Piteu! 🎉",
    html: emailTemplate("Bem-vindo ao Bom Piteu!", content, "Começar a cozinhar", process.env.FRONTEND_URL),
  });
  console.log(`📧 Email de boas-vindas enviado para: ${user.email}`);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};