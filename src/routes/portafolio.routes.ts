import { Router } from 'express';
import { crearPortafolio, obtenerPortafolios } from '../controllers/portafolio.controller.js';

const router = Router();

router.post('/create', crearPortafolio);

router.get('/list', obtenerPortafolios);

export default router;