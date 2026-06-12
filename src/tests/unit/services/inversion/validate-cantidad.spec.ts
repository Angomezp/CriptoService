import { beforeEach, describe, expect, it } from 'vitest';

import InversionService from '../../../../services/inversion.service.js';
import { ValidationError } from '../../../../config/http_errors.js';

describe('InversionService - validateCantidad', () => {
    let inversionService: InversionService;

    beforeEach(() => {
        inversionService = new InversionService();
    });

    it('should accept a positive amount', async () => {
        await expect(
            inversionService.validateCantidad(10)
        ).resolves.toBeUndefined();
    });

    it('should accept decimal amounts', async () => {
        await expect(
            inversionService.validateCantidad(0.5)
        ).resolves.toBeUndefined();
    });

    it('should throw ValidationError when amount is zero', async () => {
        await expect(
            inversionService.validateCantidad(0)
        ).rejects.toBeInstanceOf(ValidationError);

        await expect(
            inversionService.validateCantidad(0)
        ).rejects.toMatchObject({
            code: 'VALIDATION_ERROR',
        });
    });

    it('should throw ValidationError when amount is negative', async () => {
        await expect(
            inversionService.validateCantidad(-10)
        ).rejects.toBeInstanceOf(ValidationError);

        await expect(
            inversionService.validateCantidad(-10)
        ).rejects.toMatchObject({
            code: 'VALIDATION_ERROR',
        });
    });
});