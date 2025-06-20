import { Router } from 'express';

import opportunityRouter from '../../../infrastructure/http/routes/opportunities';
import roleRouter from '../../../infrastructure/http/routes/roles';
import employeeRouter from '../../../infrastructure/http/routes/employees';

const router = Router();

router.use('/opportunities', opportunityRouter);
router.use('/roles', roleRouter);
router.use('/employees', employeeRouter);

export default router; 