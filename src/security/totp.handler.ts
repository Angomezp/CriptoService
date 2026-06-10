import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';

export function generarSecret(): string {
    return generateSecret();
}

export function generarUriTOTP(correo: string, secreto: string): string {
    return generateURI({
        issuer: 'CriptoService',
        label: correo,
        secret: secreto,
    });
}

export async function generarCodigoQR(uri: string): Promise<string> {
    try {
        return await QRCode.toDataURL(uri);
    } catch (error) {
        throw new Error('Error al generar el código QR', { cause: error });
    }
}

export async function verificarTokenTOTP(
    token: string,
    secreto: string
): Promise<boolean> {
    try {
        const resultado = await verify({ secret: secreto, token });
        return resultado.valid;
    } catch {
        return false;
    }
}
