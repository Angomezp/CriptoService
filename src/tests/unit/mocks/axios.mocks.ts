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

export const resetAxiosMocks = () => {
    vi.clearAllMocks();
    mockAxios.isAxiosError.mockReturnValue(false);
};
