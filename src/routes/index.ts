import authRouter from '@/modules/auth/route';
import usersRouter from '@/modules/users/routes';
import vendorRouter from '@/modules/vendor/route';
import { Router } from 'express';

const apiRouter = Router();
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/vendor', vendorRouter);
export default apiRouter;
