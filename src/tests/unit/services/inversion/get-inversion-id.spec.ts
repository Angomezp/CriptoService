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
        findIdByUserAndName =
            mockPortafolioRepo.findIdByUserAndName;

        existsByUserAndName =
            mockPortafolioRepo.existsByUserAndName;
    },
}));

vi.mock('../../../../security/jwt.handler.js', () => ({
    verificarToken: vi.fn(),
}));

describe('InversionService - getInversionById', () => {
    let inversionService: InversionService;

    beforeEach(() => {
        resetMocks();

        inversionService = new InversionService();
    });

    it('should return investment successfully', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue(
            validJwtPayload as any
        );

        mockInversionRepo.findById.mockResolvedValue(
            validInversion
        );

        mockInversionRepo.existsByIdAndUser.mockResolvedValue(
            true
        );

        const result = await inversionService.getInversionById(
            1,
            'jwt-token'
        );

        expect(result).toEqual(validInversion);

        expect(mockInversionRepo.findById).toHaveBeenCalledWith(1);

        expect(
            mockInversionRepo.existsByIdAndUser
        ).toHaveBeenCalledWith(
            1,
            validJwtPayload.userId
        );
    });

    it('should throw INVERSION_NOT_FOUND when investment does not exist', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue(
            validJwtPayload as any
        );

        mockInversionRepo.findById.mockResolvedValue(null);

        await expect(
            inversionService.getInversionById(
                1,
                'jwt-token'
            )
        ).rejects.toMatchObject({
            code: 'INVERSION_NOT_FOUND',
        });
    });

    it('should throw FORBIDDEN when user is not owner', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue(
            validJwtPayload as any
        );

        mockInversionRepo.findById.mockResolvedValue(
            validInversion
        );

        mockInversionRepo.existsByIdAndUser.mockResolvedValue(
            false
        );

        await expect(
            inversionService.getInversionById(
                1,
                'jwt-token'
            )
        ).rejects.toMatchObject({
            code: 'FORBIDDEN',
        });
    });

    it('should propagate repository error from findById', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue(
            validJwtPayload as any
        );

        mockInversionRepo.findById.mockRejectedValue(
            new Error('Database error')
        );

        await expect(
            inversionService.getInversionById(
                1,
                'jwt-token'
            )
        ).rejects.toThrow('Database error');
    });

    it('should propagate repository error from existsByIdAndUser', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue(
            validJwtPayload as any
        );

        mockInversionRepo.findById.mockResolvedValue(
            validInversion
        );

        mockInversionRepo.existsByIdAndUser.mockRejectedValue(
            new Error('Database error')
        );

        await expect(
            inversionService.getInversionById(
                1,
                'jwt-token'
            )
        ).rejects.toThrow('Database error');
    });
});