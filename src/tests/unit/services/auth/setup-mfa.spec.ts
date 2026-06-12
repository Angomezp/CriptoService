import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthService from '../../../../services/auth.service.js';

import * as jwtHandler from '../../../../security/jwt.handler.js';
import * as totpHandler from '../../../../security/totp.handler.js';
import * as encryptionHandler from '../../../../security/encryption.js';

import { mockUserRepo, resetMocks } from './auth.mocks.js';

import { validUser } from '../../fixtures/user.fixture.js';

vi.mock('../../../../security/jwt.handler.js', () => ({
    generarToken: vi.fn(),
    generarMfaToken: vi.fn(),
    verificarToken: vi.fn(),
    verificarMfaToken: vi.fn(),
}));

vi.mock('../../../../security/totp.handler.js', () => ({
    generarSecret: vi.fn(),
    generarUriTOTP: vi.fn(),
    generarCodigoQR: vi.fn(),
    verificarTokenTOTP: vi.fn(),
}));

vi.mock('../../../../security/encryption.js', () => ({
    cifrar: vi.fn(),
    descifrar: vi.fn(),
}));

describe('AuthService - setupMfa', () => {
    let authService: AuthService;

    beforeEach(() => {
        resetMocks();

        authService = new AuthService();

        (authService as any).userRepo = mockUserRepo;
    });

    it('should setup MFA successfully', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue({
            userId: validUser.idUsuario,
        } as any);

        mockUserRepo.findById.mockResolvedValue(validUser);

        vi.mocked(totpHandler.generarSecret).mockReturnValue('totp-secret');

        vi.mocked(encryptionHandler.cifrar).mockReturnValue('encrypted-secret');

        vi.mocked(totpHandler.generarUriTOTP).mockReturnValue(
            'otpauth://totp/test'
        );

        vi.mocked(totpHandler.generarCodigoQR).mockResolvedValue(
            'qr-code-image'
        );

        mockUserRepo.updateMfaSecret.mockResolvedValue(undefined);

        const result = await authService.setupMfa('jwt-token');

        expect(result).toEqual({
            qrCode: 'qr-code-image',
        });

        expect(mockUserRepo.updateMfaSecret).toHaveBeenCalledWith(
            validUser.idUsuario,
            'encrypted-secret',
            false
        );
    });

    it('should throw INVALID_TOKEN when token is invalid', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue(null as any);

        await expect(
            authService.setupMfa('invalid-token')
        ).rejects.toMatchObject({
            code: 'INVALID_TOKEN',
        });
    });

    it('should throw USER_NOT_FOUND when user does not exist', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue({
            userId: 999,
        } as any);

        mockUserRepo.findById.mockResolvedValue(null);

        await expect(authService.setupMfa('jwt-token')).rejects.toMatchObject({
            code: 'USER_NOT_FOUND',
        });
    });

    it('should throw unexpected error from repository', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue({
            userId: validUser.idUsuario,
        } as any);

        mockUserRepo.findById.mockRejectedValue(new Error('Database error'));

        await expect(authService.setupMfa('jwt-token')).rejects.toThrow();
    });
});
