import { vi } from 'vitest';

export const mockAxios = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    isAxiosError: vi.fn(),
};

vi.mock('axios', () => ({
    default: mockAxios,
}));

export const resetMocks = () => {
    vi.clearAllMocks();

    mockAxios.isAxiosError.mockReturnValue(false);
};