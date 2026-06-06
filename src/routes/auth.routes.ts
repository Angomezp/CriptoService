import { Router } from 'express';
import { login, register, verifyMfa, setupMfa, confirmMfa } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);

router.post('/login', login);

router.post('/verify-mfa', verifyMfa);

router.post('/setup-mfa', setupMfa);

router.post('/confirm-mfa', confirmMfa);

export default router;