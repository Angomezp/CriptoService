import { env } from '../../../config/env.js';

export const validUser = {
    idUsuario: 1,
    nombre: 'Angel',
    correo: 'angel@test.com',
    passwordHash: 'hashedPassword',
    mfaEnabled: false,
    mfaSecret: null,
    intentosFallidos: 0,
    bloqueadoHasta: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};

export const validMfaUser = {
    ...validUser,
    mfaEnabled: true,
    mfaSecret: 'SECRET123',
};

export const blockedUser = {
    ...validUser,
    bloqueadoHasta: new Date(Date.now() + 10 * 60 * 1000),
};

export const userWithFailedAttempts = {
    ...validUser,
    intentosFallidos: env.maxIntentosLogin - 1,
};
