import { beforeEach, describe, expect, it, vi } from 'vitest';

import InversionService from '../../../../services/inversion.service.js';
import * as jwtHandler from '../../../../security/jwt.handler.js';

import {
    mockInversionRepo,
    mockPortafolioRepo,
    resetMocks,
} from './inversion.mocks.js';

import {
    validInversion,
    validJwtPayload,
} from '../../fixtures/inversion.fixture.js';

vi.mock('../../../../repositories/inversion.repository.js', () => ({
    default: class {
        saveInversion = mockInversionRepo.saveInversion;
        findByPortafolio = mockInversionRepo.findByPortafolio;
        findById = mockInversionRepo.findById;
        existsByIdAndUser = mockInversionRepo.existsByIdAndUser;
    },
}));

vi.mock('../../../../repositories/portafolio.repository.js', () => ({
    default: class {
        findIdByUserAndName = mockPortafolioRepo.findIdByUserAndName;

        existsByUserAndName = mockPortafolioRepo.existsByUserAndName;
    },
}));

vi.mock('../../../../security/jwt.handler.js', () => ({
    verificarToken: vi.fn(),
}));

describe('InversionService - getInversiones', () => {
    let inversionService: InversionService;

    beforeEach(() => {
        resetMocks();

        inversionService = new InversionService();
    });

    it('should return investments successfully', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue(
            validJwtPayload as any
        );

        mockPortafolioRepo.findIdByUserAndName.mockResolvedValue(1);

        mockPortafolioRepo.existsByUserAndName.mockResolvedValue(true);

        mockInversionRepo.findByPortafolio.mockResolvedValue([validInversion]);

        const result = await inversionService.getInversiones(
            'Principal',
            'jwt-token'
        );

        expect(result).toEqual([validInversion]);

        expect(mockInversionRepo.findByPortafolio).toHaveBeenCalledWith(1);
    });

    it('should throw PORTAFOLIO_NOT_FOUND when portfolio does not exist', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue(
            validJwtPayload as any
        );

        mockPortafolioRepo.findIdByUserAndName.mockResolvedValue(null);

        await expect(
            inversionService.getInversiones('Principal', 'jwt-token')
        ).rejects.toMatchObject({
            code: 'PORTAFOLIO_NOT_FOUND',
        });
    });

    it('should throw FORBIDDEN when user is not owner', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue(
            validJwtPayload as any
        );

        mockPortafolioRepo.findIdByUserAndName.mockResolvedValue(1);

        mockPortafolioRepo.existsByUserAndName.mockResolvedValue(false);

        await expect(
            inversionService.getInversiones('Principal', 'jwt-token')
        ).rejects.toMatchObject({
            code: 'FORBIDDEN',
        });
    });

    it('should propagate repository error', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue(
            validJwtPayload as any
        );

        mockPortafolioRepo.findIdByUserAndName.mockResolvedValue(1);

        mockPortafolioRepo.existsByUserAndName.mockResolvedValue(true);

        mockInversionRepo.findByPortafolio.mockRejectedValue(
            new Error('Database error')
        );

        await expect(
            inversionService.getInversiones('Principal', 'jwt-token')
        ).rejects.toThrow('Database error');
    });
});
