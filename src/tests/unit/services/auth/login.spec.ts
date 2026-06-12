import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthService from '../../../../services/auth.service.js';
import { verificar } from '../../../../security/hashing.js';
import * as jwtHandler from '../../../../security/jwt.handler.js';
import { env } from '../../../../config/env.js';

import { mockUserRepo, resetMocks } from './auth.mocks.js';

import {
    validUser,
    validMfaUser,
    blockedUser,
} from '../../fixtures/user.fixture.js';

vi.mock('../../../../security/hashing.js', () => ({
    hashear: vi.fn(),
    verificar: vi.fn(),
}));

vi.mock('../../../../security/jwt.handler.js', () => ({
    generarToken: vi.fn(),
    generarMfaToken: vi.fn(),
    verificarToken: vi.fn(),
    verificarMfaToken: vi.fn(),
}));

vi.mock('../../../../services/mailer.service.js', () => ({
    enviarAlertaBloqueo: vi.fn().mockResolvedValue(undefined),
    enviarCorreoRecuperacion: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../../services/mailer.service.js', () => ({
    enviarAlertaBloqueo: vi.fn(),
}));

describe('AuthService - login', () => {
    let authService: AuthService;

    beforeEach(() => {
        resetMocks();

        authService = new AuthService();

        (authService as any).userRepo = mockUserRepo;
    });

    it('should login successfully without MFA', async () => {
        mockUserRepo.findByEmail.mockResolvedValue(validUser);

        mockUserRepo.resetearIntentos.mockResolvedValue(undefined);

        vi.mocked(verificar).mockResolvedValue(true);

        vi.mocked(jwtHandler.generarToken).mockReturnValue('jwt-token');

        const result = await authService.login(
            'angel@test.com',
            'Password123!'
        );

        expect(result).toEqual({
            message: 'Inicio de sesión exitoso',
            token: 'jwt-token',
            mfa_requerido: false,
        });

        expect(mockUserRepo.resetearIntentos).toHaveBeenCalledWith(
            validUser.idUsuario
        );
    });

    it('should login successfully with MFA enabled', async () => {
        mockUserRepo.findByEmail.mockResolvedValue(validMfaUser);

        mockUserRepo.resetearIntentos.mockResolvedValue(undefined);

        vi.mocked(verificar).mockResolvedValue(true);

        vi.mocked(jwtHandler.generarMfaToken).mockReturnValue('mfa-token');

        const result = await authService.login(
            'angel@test.com',
            'Password123!'
        );

        expect(result).toEqual({
            mfaToken: 'mfa-token',
            message: 'Contraseña correcta, ingresa el código MFA',
            mfa_requerido: true,
        });
    });

    it('should throw INVALID_CREDENTIALS when user does not exist', async () => {
        mockUserRepo.findByEmail.mockResolvedValue(null);

        await expect(
            authService.login('angel@test.com', 'Password123!')
        ).rejects.toMatchObject({
            code: 'INVALID_CREDENTIALS',
        });
    });

    it('should throw ACCOUNT_LOCKED when user is blocked', async () => {
        mockUserRepo.findByEmail.mockResolvedValue(blockedUser);

        await expect(
            authService.login('angel@test.com', 'Password123!')
        ).rejects.toMatchObject({
            code: 'ACCOUNT_LOCKED',
        });
    });

    it('should throw INVALID_CREDENTIALS when password is incorrect', async () => {
        mockUserRepo.findByEmail.mockResolvedValue(validUser);

        mockUserRepo.incrementarIntentos.mockResolvedValue(undefined);

        vi.mocked(verificar).mockResolvedValue(false);

        await expect(
            authService.login('angel@test.com', 'wrong-password')
        ).rejects.toMatchObject({
            code: 'INVALID_CREDENTIALS',
        });

        expect(mockUserRepo.incrementarIntentos).toHaveBeenCalledWith(
            validUser.idUsuario
        );
    });

    it('should lock account after maximum failed attempts', async () => {
        const user = {
            ...validUser,
            intentosFallidos: env.maxIntentosLogin - 1,
        };

        mockUserRepo.findByEmail.mockResolvedValue(user);

        mockUserRepo.incrementarIntentos.mockResolvedValue(undefined);

        mockUserRepo.bloquearUsuario.mockResolvedValue(undefined);

        vi.mocked(verificar).mockResolvedValue(false);

        await expect(
            authService.login('angel@test.com', 'wrong-password')
        ).rejects.toMatchObject({
            code: 'ACCOUNT_LOCKED',
        });

        expect(mockUserRepo.bloquearUsuario).toHaveBeenCalledWith(
            user.idUsuario,
            env.bloqueoMinutos
        );
    });

    it('should throw LOGIN_ERROR when repository fails', async () => {
        mockUserRepo.findByEmail.mockRejectedValue(new Error('Database error'));

        await expect(
            authService.login('angel@test.com', 'Password123!')
        ).rejects.toMatchObject({
            code: 'LOGIN_ERROR',
        });
    });
});
