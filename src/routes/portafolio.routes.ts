import { Router } from 'express';
import { crearPortafolio } from '../controllers/portafolio.controller.js';

const router = Router();

router.post('/create', crearPortafolio);

export default router;