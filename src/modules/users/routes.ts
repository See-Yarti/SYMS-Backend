import { Router } from 'express';
import { UsersController } from './controller';
import Validator from '@/middlewares/Validator';

const usersRouter = Router();
const validator = new Validator();
const usersController = new UsersController();

usersRouter.get('/', usersController.get);
usersRouter.get('/profile', validator.tokenValidator(), usersController.profile);
// usersRouter.post('/create-user', usersController.createUser);

export default usersRouter;
