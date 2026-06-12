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

vi.mock('../../../../repositories/inversion.repository.js', () => {
    return {
        default: class {
            saveInversion = mockInversionRepo.saveInversion;
            findByPortafolio = mockInversionRepo.findByPortafolio;
            findById = mockInversionRepo.findById;
            existsByIdAndUser = mockInversionRepo.existsByIdAndUser;
        },
    };
});

vi.mock('../../../../repositories/portafolio.repository.js', () => {
    return {
        default: class {
            findIdByUserAndName =
                mockPortafolioRepo.findIdByUserAndName;

            existsByUserAndName =
                mockPortafolioRepo.existsByUserAndName;
        },
    };
});

vi.mock('../../../../security/jwt.handler.js', () => ({
    verificarToken: vi.fn(),
}));

describe('InversionService - createInversion', () => {
    let inversionService: InversionService;

    beforeEach(() => {
        resetMocks();

        inversionService = new InversionService();
    });

    it('should create investment successfully', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue(
            validJwtPayload as any
        );

        mockPortafolioRepo.findIdByUserAndName.mockResolvedValue(1);

        vi.spyOn(
            inversionService,
            'calcularCostoInicial'
        ).mockResolvedValue(120000);

        mockInversionRepo.saveInversion.mockResolvedValue(
            validInversion
        );

        const result = await inversionService.createInversion(
            'Principal',
            'BTC',
            2,
            'jwt-token'
        );

        expect(result).toEqual(validInversion);

        expect(
            mockPortafolioRepo.findIdByUserAndName
        ).toHaveBeenCalledWith(
            validJwtPayload.userId,
            'Principal'
        );

        expect(
            mockInversionRepo.saveInversion
        ).toHaveBeenCalledWith(
            1,
            'bitcoin',
            2,
            120000
        );
    });

    it('should throw PORTAFOLIO_NOT_FOUND when portfolio does not exist', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue(
            validJwtPayload as any
        );

        mockPortafolioRepo.findIdByUserAndName.mockResolvedValue(
            null
        );

        await expect(
            inversionService.createInversion(
                'Principal',
                'BTC',
                2,
                'jwt-token'
            )
        ).rejects.toMatchObject({
            code: 'PORTAFOLIO_NOT_FOUND',
        });
    });

    it('should propagate error when calcularCostoInicial fails', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue(
            validJwtPayload as any
        );

        mockPortafolioRepo.findIdByUserAndName.mockResolvedValue(1);

        vi.spyOn(
            inversionService,
            'calcularCostoInicial'
        ).mockRejectedValue(
            new Error('CoinGecko unavailable')
        );

        await expect(
            inversionService.createInversion(
                'Principal',
                'BTC',
                2,
                'jwt-token'
            )
        ).rejects.toThrow('CoinGecko unavailable');
    });

    it('should propagate repository error when saveInversion fails', async () => {
        vi.mocked(jwtHandler.verificarToken).mockReturnValue(
            validJwtPayload as any
        );

        mockPortafolioRepo.findIdByUserAndName.mockResolvedValue(1);

        vi.spyOn(
            inversionService,
            'calcularCostoInicial'
        ).mockResolvedValue(120000);

        mockInversionRepo.saveInversion.mockRejectedValue(
            new Error('Database error')
        );

        await expect(
            inversionService.createInversion(
                'Principal',
                'BTC',
                2,
                'jwt-token'
            )
        ).rejects.toThrow('Database error');
    });
});