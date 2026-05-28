import nodemailer from "nodemailer";

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error("O envio de e-mail ainda não está configurado neste ambiente.");
  }

  return value;
}

function createTransporter() {
  const host = getRequiredEnv("SMTP_HOST");
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = getRequiredEnv("SMTP_USER");
  const pass = getRequiredEnv("SMTP_PASS");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
}

export async function sendPasswordResetEmail({
  to,
  resetUrl
}: {
  to: string;
  resetUrl: string;
}) {
  const from = getRequiredEnv("SMTP_FROM");
  const transporter = createTransporter();

  await transporter.sendMail({
    from,
    to,
    subject: "Redefinição de senha - Inca Bar",
    text: [
      "Olá!",
      "",
      "Recebemos um pedido de redefinição de senha no site de palpites do Inca Bar.",
      "Para criar uma nova senha, acessa o link abaixo:",
      "",
      resetUrl,
      "",
      "Se você não pediu essa redefinição, pode ignorar este e-mail.",
      "",
      "Equipe Inca Bar"
    ].join("\n")
  });
}
