import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

router.post('/auth/register', (req, res) => {
    res.status(200).json({ message: 'Register endpoint' });
});

router.post('/auth/login', (req, res) => {
    res.status(200).json({ message: 'Login endpoint' });
});

router.post('/auth/verify-mfa', (req, res) => {
    res.status(200).json({ message: 'Verify MFA endpoint' });
});

router.post('/auth/setup-mfa', (req, res) => {
    res.status(200).json({ message: 'Setup MFA endpoint' });
});

router.post('/auth/confirm-mfa', (req, res) => {
    res.status(200).json({ message: 'Confirm MFA endpoint' });
});

export default router;