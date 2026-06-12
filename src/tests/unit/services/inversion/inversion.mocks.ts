import { vi } from 'vitest';

export const mockInversionRepo = {
    saveInversion: vi.fn(),
    findByPortafolio: vi.fn(),
    findById: vi.fn(),
    existsByIdAndUser: vi.fn(),
};

export const mockPortafolioRepo = {
    findIdByUserAndName: vi.fn(),
    existsByUserAndName: vi.fn(),
};

export const resetMocks = () => {
    vi.clearAllMocks();

    mockInversionRepo.saveInversion.mockReset();
    mockInversionRepo.findByPortafolio.mockReset();
    mockInversionRepo.findById.mockReset();
    mockInversionRepo.existsByIdAndUser.mockReset();

    mockPortafolioRepo.findIdByUserAndName.mockReset();
    mockPortafolioRepo.existsByUserAndName.mockReset();
};