import Router from 'express';
import authRoutes from '../routes/auth.routes.js';
import predictionRoutes from '../routes/prediction.routes.js';
import modelsRoutes from '../routes/models.routes.js';
import portafolioRoutes from '../routes/portafolio.routes.js';
import inversionRoutes from '../routes/inversion.routes.js';

const router = Router();

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

router.use('/auth', authRoutes);

router.use('/predict', predictionRoutes);

router.use('/portafolios', portafolioRoutes);

router.use('/inversiones', inversionRoutes);

router.use('/models', modelsRoutes);

export default router;
