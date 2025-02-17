import { Router } from 'express';
import AuthController from './controller';
import AuthMiddleware from '@/middlewares/Auth';

const authRouter = Router();
const authController = new AuthController();

authRouter.post('/login/credential/:email', authController.emailLogin);
authRouter.post('/login/credential/:email/otp-verify', authController.verifyOtp);
authRouter.post('/login/credential/:email/otp-resend', authController.resendOtp);
// authRouter.get('/login/google', AuthMiddleware.validateCallbackUrl, authController.googleLogin);
// authRouter.get('/login/google/callback', authController.googleCallback);
// authRouter.get('/decode-error-token', authController.decodeErrorToken);
export default authRouter;
