import { Router } from 'express';
import AuthController from './controller';
import AuthMiddleware from '@/middlewares/Auth';

const authRouter = Router();
const authController = new AuthController();

authRouter.post('/login/credential/:email', authController.emailLogin);
authRouter.post('/login/credential/:email/otp-session-verify/:st', authController.verifyOTPSessionToken);
authRouter.post('/login/credential/:email/otp-verify/:st', authController.verifyOtp);
authRouter.get('/login/google', authController.googleLogin);
authRouter.get('/login/google/callback', authController.googleCallback);
authRouter.get('/decode-error-token', authController.decodeErrorToken);

export default authRouter; 