import { Router } from 'express';
import AuthController from './controller';
import AuthMiddleware from '@/middlewares/Auth';
import Validator from '@/middlewares/Validator';
import { createAdminAccount, createVendorAccount, EmailLogin } from './dto';
import { UserRole } from '@/types/user.types';
import Multer from '@/middlewares/Multer';

const authRouter = Router();
const validator = new Validator();
const multer = new Multer();
const authController = new AuthController();
// Login Route for the Controller
authRouter.post(
  '/controller/login',
  validator.inputValidator({ dto: EmailLogin, target: 'body' }),
  authController.credentialLogin,
);

// Register new Vendor Account Route
authRouter.post(
  '/controller/vendor/register',
  multer.routeUpload.single('tradeLicense'),
  validator.inputValidator({ dto: createVendorAccount, target: 'body' }),
  authController.createVendor,
);

// Create new Admin Account Route
authRouter.post(
  '/controller/admin/register',
  validator.inputValidator({ dto: createAdminAccount, target: 'body' }),
  authController.createAdmin,
);

// Auth Token Refresh Route
authRouter.get('/controller/token/refresh', authController.refreshToken);

// Auth Controller Logout Route
authRouter.post('/controller/logout', authController.logout);
export default authRouter;
