import { Router } from 'express';
import { UsersController } from './controller';

const usersRouter = Router();

const usersController = new UsersController();

usersRouter.get('/', usersController.get);
usersRouter.get('/profile', usersController.profile)
usersRouter.post('/create-user', usersController.createUser);

export default usersRouter;
