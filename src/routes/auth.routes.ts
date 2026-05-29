import { Router } from 'express';
 import { login, register } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);

router.post('/login', login);

router.post('/verify-mfa', (req, res) => {
    res.status(200).json({ message: 'Verify MFA endpoint' });
});

router.post('/setup-mfa', (req, res) => {
    res.status(200).json({ message: 'Setup MFA endpoint' });
});

router.post('/confirm-mfa', (req, res) => {
    res.status(200).json({ message: 'Confirm MFA endpoint' });
});

export default router;