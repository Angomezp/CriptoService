import { Router } from 'express';
import { crearInversion } from '../controllers/inversion.controller.js';

const router = Router();

router.post('/create', crearInversion);

export default router;