import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthService from '../../../../services/auth.service.js';
import { hashear } from '../../../../security/hashing.js';

import { mockUserRepo, resetMocks } from './auth.mocks.js';

vi.mock('../../../../security/hashing.js', () => ({
    hashear: vi.fn(),
}));

describe('AuthService - register', () => {
    let authService: AuthService;

    beforeEach(() => {
        resetMocks();

        authService = new AuthService();

        (authService as any).userRepo = mockUserRepo;
    });

    it('should register a new user', async () => {
        mockUserRepo.findByEmail.mockResolvedValue(null);

        mockUserRepo.createUser.mockResolvedValue({
            nombre: 'Angel',
            correo: 'angel@test.com',
        });

        vi.mocked(hashear).mockResolvedValue('hashedPassword');

        const result = await authService.register(
            'Angel',
            'angel@test.com',
            'Password123!'
        );

        expect(result).toEqual({
            message: 'Usuario registrado exitosamente',
            nombre: 'Angel',
            correo: 'angel@test.com',
        });

        expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('angel@test.com');

        expect(mockUserRepo.createUser).toHaveBeenCalledOnce();
    });

    it('should throw ConflictError when user already exists', async () => {
        mockUserRepo.findByEmail.mockResolvedValue({
            idUsuario: 1,
        });

        await expect(
            authService.register('Angel', 'angel@test.com', 'Password123!')
        ).rejects.toMatchObject({
            code: 'CONFLICT_ERROR',
        });
    });

    it('should throw ValidationError for invalid email', async () => {
        mockUserRepo.findByEmail.mockResolvedValue(null);

        await expect(
            authService.register('Angel', 'invalid-email', 'Password123!')
        ).rejects.toMatchObject({
            code: 'VALIDATION_ERROR',
        });
    });

    it('should throw ValidationError for weak password', async () => {
        mockUserRepo.findByEmail.mockResolvedValue(null);

        await expect(
            authService.register('Angel', 'angel@test.com', '123')
        ).rejects.toMatchObject({
            code: 'VALIDATION_ERROR',
        });
    });

    it('should throw REGISTER_ERROR when repository fails', async () => {
        mockUserRepo.findByEmail.mockResolvedValue(null);

        vi.mocked(hashear).mockResolvedValue('hashedPassword');

        mockUserRepo.createUser.mockRejectedValue(new Error('Database error'));

        await expect(
            authService.register('Angel', 'angel@test.com', 'Password123!')
        ).rejects.toMatchObject({
            code: 'REGISTER_ERROR',
        });
    });
});
