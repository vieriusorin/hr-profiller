import { Router } from 'express';
import candidateRoutes from '../../infrastructure/http/routes/candidates';
import { metricsHandler } from './middlewares/loggs.middleware';

const router = Router();
router.get('/metrics', metricsHandler);
router.use('/candidates', candidateRoutes);

export default router;
