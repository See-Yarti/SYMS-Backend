import Validator from '@/middlewares/Validator';
import { Router } from 'express';
import NotificationsController from './controller';
import { GetNotificationsDTO } from './dto';

const notificationsRouter = Router();

const validator = new Validator();
const notificationsController = new NotificationsController();

// Get All Notifications for the User
notificationsRouter.get(
  '/',
  validator.tokenValidator(),
  validator.inputValidator({ dto: GetNotificationsDTO, target: 'query' }),
  notificationsController.getAllNotifications,
);

export default notificationsRouter;
