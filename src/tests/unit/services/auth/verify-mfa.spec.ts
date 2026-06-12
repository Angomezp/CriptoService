import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthService from '../../../../services/auth.service.js';

import { mockUserRepo } from './auth.mocks.js';

import * as jwtHandler from '../../../../security/jwt.handler.js';
import * as encryptionHandler from '../../../../security/encryption.js';
import * as totpHandler from '../../../../security/totp.handler.js';

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
    generarSecretoTOTP: vi.fn(),
    generarQRCode: vi.fn(),
    verificarTokenTOTP: vi.fn(),
}));

describe('AuthService - verifyMfa', () => {
    let authService: AuthService;

    beforeEach(() => {
        vi.clearAllMocks();

        authService = new AuthService();
        (authService as any).userRepo = mockUserRepo;
    });

    it('should verify MFA successfully and return JWT token', async () => {
        const user = {
            idUsuario: 1,
            correo: 'angel@test.com',
            totpSecret: 'encrypted-secret',
        };

        vi.mocked(jwtHandler.verificarMfaToken).mockReturnValue({
            userId: 1,
            scope: 'PRE_AUTH',
        } as any);

        mockUserRepo.findById.mockResolvedValue(user);

        vi.mocked(encryptionHandler.descifrar).mockReturnValue(
            'decrypted-secret'
        );

        vi.mocked(totpHandler.verificarTokenTOTP).mockResolvedValue(true);

        vi.mocked(jwtHandler.generarToken).mockReturnValue('jwt-final-token');

        const result = await authService.verifyMfa('mfa-token', '123456');

        expect(result).toBe('jwt-final-token');

        expect(jwtHandler.generarToken).toHaveBeenCalledWith(user.idUsuario);
    });

    it('should throw INVALID_MFA_TOKEN when MFA token is invalid', async () => {
        vi.mocked(jwtHandler.verificarMfaToken).mockReturnValue(null as any);

        await expect(
            authService.verifyMfa('invalid-token', '123456')
        ).rejects.toMatchObject({
            code: 'INVALID_MFA_TOKEN',
        });
    });

    it('should throw INVALID_MFA_TOKEN when token scope is invalid', async () => {
        vi.mocked(jwtHandler.verificarMfaToken).mockReturnValue({
            userId: 1,
            scope: 'INVALID_SCOPE',
        } as any);

        await expect(
            authService.verifyMfa('mfa-token', '123456')
        ).rejects.toMatchObject({
            code: 'INVALID_MFA_TOKEN',
        });
    });

    it('should throw USER_NOT_FOUND when user does not exist', async () => {
        vi.mocked(jwtHandler.verificarMfaToken).mockReturnValue({
            userId: 1,
            scope: 'PRE_AUTH',
        } as any);

        mockUserRepo.findById.mockResolvedValue(null);

        await expect(
            authService.verifyMfa('mfa-token', '123456')
        ).rejects.toMatchObject({
            code: 'USER_NOT_FOUND',
        });
    });

    it('should throw MFA_NOT_CONFIGURED when user has no TOTP secret', async () => {
        vi.mocked(jwtHandler.verificarMfaToken).mockReturnValue({
            userId: 1,
            scope: 'PRE_AUTH',
        } as any);

        mockUserRepo.findById.mockResolvedValue({
            idUsuario: 1,
            correo: 'angel@test.com',
            totpSecret: null,
        });

        await expect(
            authService.verifyMfa('mfa-token', '123456')
        ).rejects.toMatchObject({
            code: 'MFA_NOT_CONFIGURED',
        });
    });

    it('should throw INVALID_MFA_CODE when TOTP code is invalid', async () => {
        vi.mocked(jwtHandler.verificarMfaToken).mockReturnValue({
            userId: 1,
            scope: 'PRE_AUTH',
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
            authService.verifyMfa('mfa-token', '123456')
        ).rejects.toMatchObject({
            code: 'INVALID_MFA_CODE',
        });
    });

    it('should throw VERIFY_MFA_ERROR when repository fails', async () => {
        vi.mocked(jwtHandler.verificarMfaToken).mockReturnValue({
            userId: 1,
            scope: 'PRE_AUTH',
        } as any);

        mockUserRepo.findById.mockRejectedValue(new Error('Database error'));

        await expect(
            authService.verifyMfa('mfa-token', '123456')
        ).rejects.toMatchObject({
            code: 'VERIFY_MFA_ERROR',
        });
    });
});
