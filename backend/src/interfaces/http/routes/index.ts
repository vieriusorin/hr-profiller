import { Router } from 'express';

import opportunityRouter from '../../../infrastructure/http/routes/opportunities';
import roleRouter from '../../../infrastructure/http/routes/roles';
import employeeRouter from '../../../infrastructure/http/routes/employees';
import personRouter from '../../../infrastructure/http/routes/persons';
import { lookupRoutes } from '../../../infrastructure/http/routes/lookup';
import aiRouter from '../../../infrastructure/http/routes/ai';
import authRouter from '../../../infrastructure/http/routes/auth';

const router = Router();

router.use('/auth', authRouter);
router.use('/opportunities', opportunityRouter);
router.use('/roles', roleRouter);
router.use('/employees', employeeRouter);
router.use('/persons', personRouter);
router.use('/lookup', lookupRoutes);
router.use('/ai', aiRouter);


export default router; 