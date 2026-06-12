import { vi } from 'vitest';

export const mockUserRepo = {
    findByEmail: vi.fn(),
    createUser: vi.fn(),
    findById: vi.fn(),
    incrementarIntentos: vi.fn(),
    resetearIntentos: vi.fn(),
    bloquearUsuario: vi.fn(),
    updateMfaSecret: vi.fn(),
};

export const resetMocks = () => {
    vi.clearAllMocks();
};
