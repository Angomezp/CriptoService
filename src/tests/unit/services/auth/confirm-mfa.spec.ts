import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthService from '../../../../services/auth.service.js';

import { mockUserRepo } from './auth.mocks.js';

import * as jwtHandler from '../../../../security/jwt.handler.js';
import * as encryptionHandler from '../../../../security/encryption.js';
import * as totpHandler from '../../../../security/totp.handler.js';
import * as mailerService from '../../../../services/mailer.service.js';

vi.mock('../../../../security/jwt.handler.js', () => ({
    generarToken: vi.fn(),
    generarMfaToken: vi.fn(),
    verificarToken: vi.fn(),
    verificarMfaToken: vi.fn(),
}));

vi.mock('../../../../security/encryption.js', () => ({
    cifrar: vi.fn(),
    descifrar: vi.fn(),
}));

vi.mock('../../../../security/totp.handler.js', () => ({
    generarSecret: vi.fn(),
    generarUriTOTP: vi.fn(),
    generarCodigoQR: vi.fn(),
    verificarTokenTOTP: vi.fn(),
}));

vi.mock('../../../../services/mailer.service.js', () => ({
    enviarAlertaBloqueo: vi.fn(),
    enviarCorreoRecuperacion: vi.fn(),
}));

beforeEach(() => {
    vi.mocked(mailerService.enviarAlertaBloqueo).mockResolvedValue(undefined);
});
describe('AuthService - confirmMfa', () => {
    let authService: AuthService;

    beforeEach(() => {
        vi.clearAllMocks();

        authService = new AuthService();
        (authService as any).userRepo = mockUserRepo;
    });

    it('should confirm MFA successfully', async () => {
        const user = {
            idUsuario: 1,
            correo: 'angel@test.com',
            totpSecret: 'encrypted-secret',
        };

        vi.mocked(jwtHandler.verificarToken).mockReturnValue({
            userId: 1,
        } as any);

        mockUserRepo.findById.mockResolvedValue(user);

        vi.mocked(encryptionHandler.descifrar).mockReturnValue(
            'decrypted-secret'
        );

        vi.mocked(totpHandler.verificarTokenTOTP).mockResolvedValue(true);

        mockUserRepo.updateMfaSecret.mockResolvedValue(undefined);

        await authService.confirmMfa('jwt-token', '123456');

        expect(mockUserRepo.updateMfaSecret).toHaveBeenCalledWith(
            user.idUsuario,
            user.totpSecret,
            true
        );
    });

    it('should throw INVALID_TOKEN when JWT is invalid', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue(null as any);

        await expect(
            authService.confirmMfa('invalid-token', '123456')
        ).rejects.toMatchObject({
            code: 'INVALID_TOKEN',
        });
    });

    it('should throw USER_NOT_FOUND when user does not exist', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue({
            userId: 1,
        } as any);

        mockUserRepo.findById.mockResolvedValue(null);

        await expect(
            authService.confirmMfa('jwt-token', '123456')
        ).rejects.toMatchObject({
            code: 'USER_NOT_FOUND',
        });
    });

    it('should throw MFA_NOT_CONFIGURED when user has no secret', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue({
            userId: 1,
        } as any);

        mockUserRepo.findById.mockResolvedValue({
            idUsuario: 1,
            correo: 'angel@test.com',
            totpSecret: null,
        });

        await expect(
            authService.confirmMfa('jwt-token', '123456')
        ).rejects.toMatchObject({
            code: 'MFA_NOT_CONFIGURED',
        });
    });

    it('should throw INVALID_MFA_CODE when TOTP code is invalid', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue({
            userId: 1,
        } as any);

        mockUserRepo.findById.mockResolvedValue({
            idUsuario: 1,
            correo: 'angel@test.com',
            totpSecret: 'encrypted-secret',
        });

        vi.mocked(encryptionHandler.descifrar).mockReturnValue(
            'decrypted-secret'
        );

        vi.mocked(totpHandler.verificarTokenTOTP).mockResolvedValue(false);

        await expect(
            authService.confirmMfa('jwt-token', '123456')
        ).rejects.toMatchObject({
            code: 'INVALID_MFA_CODE',
        });
    });

    it('should propagate repository errors', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue({
            userId: 1,
        } as any);

        mockUserRepo.findById.mockRejectedValue(new Error('Database error'));

        await expect(
            authService.confirmMfa('jwt-token', '123456')
        ).rejects.toThrow('Database error');
    });
});
