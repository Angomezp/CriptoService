import { Router } from 'express';
import { crearInversion, obtenerInversion, obtenerInversiones } from '../controllers/inversion.controller.js';

const router = Router();

router.post('/create', crearInversion);

router.get('/list', obtenerInversiones);

router.get('/id/:idInversion', obtenerInversion);

export default router;