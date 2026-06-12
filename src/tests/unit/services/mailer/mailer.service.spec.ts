import { beforeEach, describe, expect, it } from 'vitest';

import {
    resetNodemailerMocks,
    transporter,
} from '../../mocks/nodemailer.mocks.js';
import {
    enviarCorreoRecuperacion,
    enviarAlertaBloqueo,
    verificarConexionSMTP,
} from '../../../../services/mailer.service.js';

describe('Mailer Service', () => {
    beforeEach(() => {
        resetNodemailerMocks();
    });

    it('enviarCorreoRecuperacion should send mail with link', async () => {
        const destino = 'user@example.com';
        const link = 'https://app/reset?token=abc';

        await enviarCorreoRecuperacion(destino, link);

        expect(transporter.sendMail).toHaveBeenCalledTimes(1);
        const mailArgs = (
            transporter.sendMail.mock.calls as any[]
        )[0][0] as any;
        expect(mailArgs.to).toBe(destino);
        expect(mailArgs.subject).toContain('Recupera tu contraseña');
        expect(mailArgs.text).toContain(link);
        expect(mailArgs.html).toContain(link);
    });

    it('enviarAlertaBloqueo should send alert mail', async () => {
        const destino = 'user@example.com';
        const minutos = 15;
        const appUrl = 'https://app';

        await enviarAlertaBloqueo(destino, minutos, appUrl);

        expect(transporter.sendMail).toHaveBeenCalledTimes(1);
        const mailArgs = (
            transporter.sendMail.mock.calls as any[]
        )[0][0] as any;
        expect(mailArgs.to).toBe(destino);
        expect(mailArgs.subject).toContain('Alerta de seguridad');
        expect(mailArgs.text).toContain(appUrl + '/forgot-password');
    });

    it('verificarConexionSMTP returns true on success', async () => {
        transporter.verify.mockResolvedValueOnce(true);
        const ok = await verificarConexionSMTP();
        expect(ok).toBe(true);
    });

    it('verificarConexionSMTP returns false on failure', async () => {
        transporter.verify.mockRejectedValueOnce(new Error('SMTP error'));
        const ok = await verificarConexionSMTP();
        expect(ok).toBe(false);
    });
});
