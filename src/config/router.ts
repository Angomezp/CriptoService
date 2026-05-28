import { Router } from 'express';
import authRoutes  from '../routes/auth.routes.js';

const router = Router();

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});


router.use('/auth', authRoutes);



export default router;