import crypto from 'crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthService from '../../../../services/auth.service.js';
import { Database } from '../../../../config/database.js';
import { hashear } from '../../../../security/hashing.js';
import { enviarCorreoRecuperacion } from '../../../../services/mailer.service.js';

import { mockUserRepo, resetMocks } from './auth.mocks.js';
import { validUser } from '../../fixtures/user.fixture.js';

vi.mock('../../../../security/hashing.js', () => ({
    hashear: vi.fn(),
    verificar: vi.fn(),
}));

vi.mock('../../../../services/mailer.service.js', () => ({
    enviarCorreoRecuperacion: vi.fn(),
    enviarAlertaBloqueo: vi.fn(),
}));

describe('AuthService - solicitarRecuperacion', () => {
    let authService: AuthService;

    const mockTokenRepo = {
        create: vi.fn(),
        save: vi.fn(),
    };

    beforeEach(() => {
        resetMocks();

        authService = new AuthService();

        (authService as any).userRepo = mockUserRepo;

        vi.spyOn(Database, 'getInstance').mockReturnValue({
            getRepository: vi.fn().mockReturnValue(mockTokenRepo),
        } as any);

        vi.spyOn(crypto, 'randomBytes').mockImplementation(() =>
            Buffer.from('mock-token')
        );
    });

    it('should return generic message when user does not exist', async () => {
        mockUserRepo.findByEmail.mockResolvedValue(null);

        const result =
            await authService.solicitarRecuperacion('noexiste@test.com');

        expect(result.message).toContain('Si el correo está registrado');
    });

    it('should create reset token and send email', async () => {
        mockUserRepo.findByEmail.mockResolvedValue(validUser);

        vi.mocked(hashear).mockResolvedValue('hashed-token');

        mockTokenRepo.create.mockReturnValue({
            idToken: 1,
        });

        mockTokenRepo.save.mockResolvedValue({
            idToken: 1,
        });

        vi.mocked(enviarCorreoRecuperacion).mockResolvedValue(undefined);

        const result = await authService.solicitarRecuperacion(
            validUser.correo
        );

        expect(result.message).toContain('Si el correo está registrado');

        expect(hashear).toHaveBeenCalled();

        expect(mockTokenRepo.create).toHaveBeenCalled();

        expect(mockTokenRepo.save).toHaveBeenCalled();

        expect(enviarCorreoRecuperacion).toHaveBeenCalledTimes(1);
    });

    it('should continue even if email sending fails', async () => {
        mockUserRepo.findByEmail.mockResolvedValue(validUser);

        vi.mocked(hashear).mockResolvedValue('hashed-token');

        mockTokenRepo.create.mockReturnValue({
            idToken: 1,
        });

        mockTokenRepo.save.mockResolvedValue({
            idToken: 1,
        });

        vi.mocked(enviarCorreoRecuperacion).mockRejectedValue(
            new Error('SMTP error')
        );

        const result = await authService.solicitarRecuperacion(
            validUser.correo
        );

        expect(result.message).toContain('Si el correo está registrado');
    });

    it('should throw FORGOT_PASSWORD_ERROR when repository fails', async () => {
        mockUserRepo.findByEmail.mockRejectedValue(new Error('Database error'));

        await expect(
            authService.solicitarRecuperacion(validUser.correo)
        ).rejects.toMatchObject({
            code: 'FORGOT_PASSWORD_ERROR',
        });
    });

    it('should throw FORGOT_PASSWORD_ERROR when save fails', async () => {
        mockUserRepo.findByEmail.mockResolvedValue(validUser);

        vi.mocked(hashear).mockResolvedValue('hashed-token');

        mockTokenRepo.create.mockReturnValue({
            idToken: 1,
        });

        mockTokenRepo.save.mockRejectedValue(new Error('Save error'));

        await expect(
            authService.solicitarRecuperacion(validUser.correo)
        ).rejects.toMatchObject({
            code: 'FORGOT_PASSWORD_ERROR',
        });
    });

    it('should throw FORGOT_PASSWORD_ERROR when hashing fails', async () => {
        mockUserRepo.findByEmail.mockResolvedValue(validUser);

        vi.mocked(hashear).mockRejectedValue(new Error('Hash error'));

        await expect(
            authService.solicitarRecuperacion(validUser.correo)
        ).rejects.toMatchObject({
            code: 'FORGOT_PASSWORD_ERROR',
        });
    });
});
