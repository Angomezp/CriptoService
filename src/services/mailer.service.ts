import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
    },
});

export async function enviarCorreoRecuperacion(
    destino: string,
    link: string
): Promise<void> {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Recupera tu contraseña</h2>
            <p>Hola,</p>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>CriptoService</strong>.</p>
            <p>Haz clic en el siguiente enlace para crear una contraseña nueva:</p>
            <p style="margin: 24px 0;">
                <a href="${link}" 
                   style="background-color: #3498db; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 4px; display: inline-block;">
                    Restablecer contraseña
                </a>
            </p>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #7f8c8d; font-size: 12px;">${link}</p>
            <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 24px 0;">
            <p style="color: #7f8c8d; font-size: 12px;">
                Este enlace expirará en ${env.passwordResetTtlMin} minutos.<br>
                Si no solicitaste esto, ignora este correo. Tu contraseña no cambiará.
            </p>
        </div>
    `;

    const text = `
Recupera tu contraseña

Recibimos una solicitud para restablecer la contraseña de tu cuenta en CriptoService.

Para crear una nueva contraseña, abre este enlace en tu navegador:
${link}

Este enlace expirará en ${env.passwordResetTtlMin} minutos.
Si no solicitaste esto, ignora este correo.
    `.trim();

    await transporter.sendMail({
        from: env.smtpFrom,
        to: destino,
        subject: 'Recupera tu contraseña - CriptoService',
        text: text,
        html: html,
    });
}

export async function enviarAlertaBloqueo(
    destino: string,
    minutosBloqueo: number,
    appUrl: string
): Promise<void> {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #c0392b;">Alerta de seguridad</h2>
            <p>Hola,</p>
            <p>Detectamos múltiples intentos fallidos de inicio de sesión en tu cuenta de <strong>CriptoService</strong>.</p>
            <p>Por seguridad, hemos <strong>bloqueado temporalmente</strong> el acceso a tu cuenta durante <strong>${minutosBloqueo} minutos</strong>.</p>
            <h3 style="color: #2c3e50; margin-top: 24px;">¿Qué hacer ahora?</h3>
            <ul style="line-height: 1.8;">
                <li><strong>Si fuiste tú:</strong> espera ${minutosBloqueo} minutos y vuelve a intentarlo con tu contraseña correcta.</li>
                <li><strong>Si no fuiste tú:</strong> alguien podría estar intentando acceder a tu cuenta. Te recomendamos restablecer tu contraseña inmediatamente.</li>
            </ul>
            <p style="margin: 24px 0;">
                <a href="${appUrl}/forgot-password" 
                   style="background-color: #c0392b; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 4px; display: inline-block;">
                    Restablecer contraseña
                </a>
            </p>
            <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 24px 0;">
            <p style="color: #7f8c8d; font-size: 12px;">
                Este es un correo automático de seguridad. Si tienes dudas, contacta al equipo de CriptoService.
            </p>
        </div>
    `;

    const text = `
Alerta de seguridad - CriptoService

Detectamos múltiples intentos fallidos de inicio de sesión en tu cuenta.

Por seguridad, hemos bloqueado temporalmente el acceso a tu cuenta durante ${minutosBloqueo} minutos.

¿Qué hacer ahora?
- Si fuiste tú: espera ${minutosBloqueo} minutos y vuelve a intentarlo con tu contraseña correcta.
- Si no fuiste tú: alguien podría estar intentando acceder a tu cuenta. Te recomendamos restablecer tu contraseña inmediatamente desde: ${appUrl}/forgot-password

Este es un correo automático de seguridad.
    `.trim();

    await transporter.sendMail({
        from: env.smtpFrom,
        to: destino,
        subject: 'Alerta de seguridad: tu cuenta fue bloqueada temporalmente',
        text: text,
        html: html,
    });
}

export async function verificarConexionSMTP(): Promise<boolean> {
    try {
        await transporter.verify();
        return true;
    } catch (error) {
        console.error('Error al verificar conexión SMTP:', error);
        return false;
    }
}
