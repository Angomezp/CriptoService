import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

router.get('/auth/register', (req, res) => {
    res.status(200).json({ message: 'Register endpoint' });
});

router.get('/auth/login', (req, res) => {
    res.status(200).json({ message: 'Login endpoint' });
});

router.get('/auth/verify-mfa', (req, res) => {
    res.status(200).json({ message: 'Verify MFA endpoint' });
});

router.get('/auth/confirm-mfa', (req, res) => {
    res.status(200).json({ message: 'Confirm MFA endpoint' });
});

export default router;