import authRouter from '@/modules/auth/route';
import usersRouter from '@/modules/users/routes';
import { Router } from 'express';

const apiRouter = Router();

apiRouter.use('/users', usersRouter);
apiRouter.use('/auth', authRouter);

export default apiRouter;
