import { Router } from 'express';
import {
    login,
    register,
    verifyMfa,
    setupMfa,
    confirmMfa,
    forgotPassword,
    resetPassword,
} from '../controllers/auth.controller.js';
import { authenticate } from '../handlers/auth.handler.js';
import { asyncHandler } from '../handlers/async.handler.js';

const router = Router();

router.post('/register', asyncHandler(register));

router.post('/login', asyncHandler(login));

router.post('/verify-mfa', asyncHandler(verifyMfa));

router.post('/setup-mfa', authenticate, asyncHandler(setupMfa));

router.post('/confirm-mfa', authenticate, asyncHandler(confirmMfa));

router.post('/forgot-password', asyncHandler(forgotPassword));

router.post('/reset-password', asyncHandler(resetPassword));

export default router;
