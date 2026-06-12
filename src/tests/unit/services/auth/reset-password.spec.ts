import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthService from '../../../../services/auth.service.js';
import { Database } from '../../../../config/database.js';
import { hashear, verificar } from '../../../../security/hashing.js';

import { mockUserRepo, resetMocks } from './auth.mocks.js';
import { validUser } from '../../fixtures/user.fixture.js';

vi.mock('../../../../security/hashing.js', () => ({
    hashear: vi.fn(),
    verificar: vi.fn(),
}));

describe('AuthService - restablecerPassword', () => {
    let authService: AuthService;

    const mockTokenRepo = {
        findOne: vi.fn(),
        save: vi.fn(),
    };

    const mockTypeOrmUserRepo = {
        save: vi.fn(),
    };

    beforeEach(() => {
        resetMocks();

        authService = new AuthService();

        (authService as any).userRepo = mockUserRepo;

        vi.spyOn(Database, 'getInstance').mockReturnValue({
            getRepository: vi.fn((entity: any) => {
                if (entity?.name === 'PasswordResetToken') {
                    return mockTokenRepo;
                }

                return mockTypeOrmUserRepo;
            }),
        } as any);
    });

    it('should reset password successfully', async () => {
        const registro = {
            idToken: 1,
            usado: false,
            expiraEn: new Date(Date.now() + 60_000),
            tokenHash: 'hashed-token',
            usuario: {
                ...validUser,
            },
        };

        mockTokenRepo.findOne.mockResolvedValue(registro);

        vi.mocked(verificar).mockResolvedValue(true);

        vi.mocked(hashear).mockResolvedValue('new-password-hash');

        mockTypeOrmUserRepo.save.mockResolvedValue(undefined);

        mockTokenRepo.save.mockResolvedValue(undefined);

        const result = await authService.restablecerPassword(
            1,
            'plain-token',
            'Password123!'
        );

        expect(result).toEqual({
            message: 'Contraseña actualizada exitosamente',
        });

        expect(mockTypeOrmUserRepo.save).toHaveBeenCalled();

        expect(mockTokenRepo.save).toHaveBeenCalled();
    });

    it('should throw INVALID_RESET_TOKEN when token does not exist', async () => {
        mockTokenRepo.findOne.mockResolvedValue(null);

        await expect(
            authService.restablecerPassword(
                1,
                'token',
                'Password123!'
            )
        ).rejects.toMatchObject({
            code: 'INVALID_RESET_TOKEN',
        });
    });

    it('should throw TOKEN_ALREADY_USED when token was already used', async () => {
        mockTokenRepo.findOne.mockResolvedValue({
            usado: true,
        });

        await expect(
            authService.restablecerPassword(
                1,
                'token',
                'Password123!'
            )
        ).rejects.toMatchObject({
            code: 'TOKEN_ALREADY_USED',
        });
    });

    it('should throw TOKEN_EXPIRED when token is expired', async () => {
        mockTokenRepo.findOne.mockResolvedValue({
            usado: false,
            expiraEn: new Date(Date.now() - 60_000),
        });

        await expect(
            authService.restablecerPassword(
                1,
                'token',
                'Password123!'
            )
        ).rejects.toMatchObject({
            code: 'TOKEN_EXPIRED',
        });
    });

    it('should throw INVALID_RESET_TOKEN when token hash does not match', async () => {
        mockTokenRepo.findOne.mockResolvedValue({
            usado: false,
            expiraEn: new Date(Date.now() + 60_000),
            tokenHash: 'stored-hash',
        });

        vi.mocked(verificar).mockResolvedValue(false);

        await expect(
            authService.restablecerPassword(
                1,
                'invalid-token',
                'Password123!'
            )
        ).rejects.toMatchObject({
            code: 'INVALID_RESET_TOKEN',
        });
    });

    it('should throw VALIDATION_ERROR when password is invalid', async () => {
        mockTokenRepo.findOne.mockResolvedValue({
            usado: false,
            expiraEn: new Date(Date.now() + 60_000),
            tokenHash: 'stored-hash',
            usuario: validUser,
        });

        vi.mocked(verificar).mockResolvedValue(true);

        await expect(
            authService.restablecerPassword(
                1,
                'token',
                '123'
            )
        ).rejects.toMatchObject({
            code: 'VALIDATION_ERROR',
        });
    });

    it('should throw RESET_PASSWORD_ERROR when repository fails', async () => {
        mockTokenRepo.findOne.mockRejectedValue(
            new Error('Database error')
        );

        await expect(
            authService.restablecerPassword(
                1,
                'token',
                'Password123!'
            )
        ).rejects.toMatchObject({
            code: 'RESET_PASSWORD_ERROR',
        });
    });

    it('should mark token as used', async () => {
        const registro = {
            idToken: 1,
            usado: false,
            expiraEn: new Date(Date.now() + 60_000),
            tokenHash: 'hashed-token',
            usuario: {
                ...validUser,
            },
        };

        mockTokenRepo.findOne.mockResolvedValue(registro);

        vi.mocked(verificar).mockResolvedValue(true);

        vi.mocked(hashear).mockResolvedValue('new-password-hash');

        mockTypeOrmUserRepo.save.mockResolvedValue(undefined);

        mockTokenRepo.save.mockResolvedValue(undefined);

        await authService.restablecerPassword(
            1,
            'token',
            'Password123!'
        );

        expect(registro.usado).toBe(true);
    });
});