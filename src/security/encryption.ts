import crypto from 'crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from(env.encryptionKey, 'hex');
const IV_LENGTH = 16;

export function cifrar(texto: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    const encrypted = Buffer.concat([
        cipher.update(texto, 'utf8'),
        cipher.final(),
    ]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function descifrar(textoCifrado: string): string {
    const [ivHex, encryptedHex] = textoCifrado.split(':');
    const iv = Buffer.from(ivHex as string, 'hex');
    const encrypted = Buffer.from(encryptedHex as string, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]);
    return decrypted.toString('utf8');
}
