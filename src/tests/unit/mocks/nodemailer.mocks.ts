import { vi } from 'vitest';

export const transporter = {
    sendMail: vi.fn(),
    verify: vi.fn(),
};

vi.mock('nodemailer', () => ({
    default: {
        createTransport: () => transporter,
    },
}));

export const resetNodemailerMocks = () => {
    vi.clearAllMocks();
    transporter.sendMail.mockResolvedValue(undefined);
    transporter.verify.mockResolvedValue(true);
};
