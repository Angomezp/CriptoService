import { beforeEach, describe, expect, it, vi } from 'vitest';

import PortafolioService from '../../../../services/portafolio.service.js';
import * as jwtHandler from '../../../../security/jwt.handler.js';

import {
    mockPortafolioRepo,
    mockUserRepo,
    resetMocks,
} from './portfolio.mocks.js';

import {
    validJwtPayload,
    validUser,
    validPortafolio,
} from '../../fixtures/portfolio.fixture.js';

vi.mock('../../../../repositories/portafolio.repository.js', () => ({
    default: class {
        savePortafolio = mockPortafolioRepo.savePortafolio;
        findAllByUserId = mockPortafolioRepo.findAllByUserId;
    },
}));

vi.mock('../../../../repositories/user.repository.js', () => ({
    default: class {
        findById = mockUserRepo.findById;
    },
}));

vi.mock('../../../../security/jwt.handler.js', () => ({
    verificarToken: vi.fn(),
}));

describe('PortafolioService - getPortafolios', () => {
    let service: PortafolioService;

    beforeEach(() => {
        resetMocks();

        service = new PortafolioService();
    });

    it('should return user portfolios', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue(
            validJwtPayload as any
        );

        mockUserRepo.findById.mockResolvedValue(validUser);

        mockPortafolioRepo.findAllByUserId.mockResolvedValue([
            validPortafolio,
        ]);

        const result = await service.getPortafolios(
            'jwt-token'
        );

        expect(result).toEqual([validPortafolio]);
    });

    it('should throw INVALID_TOKEN', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue(
            null as any
        );

        await expect(
            service.getPortafolios('invalid-token')
        ).rejects.toMatchObject({
            code: 'INVALID_TOKEN',
        });
    });

    it('should throw USER_NOT_FOUND', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue(
            validJwtPayload as any
        );

        mockUserRepo.findById.mockResolvedValue(null);

        await expect(
            service.getPortafolios('jwt-token')
        ).rejects.toMatchObject({
            code: 'USER_NOT_FOUND',
        });
    });

    it('should propagate repository errors', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue(
            validJwtPayload as any
        );

        mockUserRepo.findById.mockResolvedValue(validUser);

        mockPortafolioRepo.findAllByUserId.mockRejectedValue(
            new Error('Database error')
        );

        await expect(
            service.getPortafolios('jwt-token')
        ).rejects.toThrow('Database error');
    });
});