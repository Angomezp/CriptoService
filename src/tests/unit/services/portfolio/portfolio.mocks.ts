import { vi } from 'vitest';

export const mockPortafolioRepo = {
    savePortafolio: vi.fn(),
    findAllByUserId: vi.fn(),
};

export const mockUserRepo = {
    findById: vi.fn(),
};

export function resetMocks() {
    vi.clearAllMocks();
}
