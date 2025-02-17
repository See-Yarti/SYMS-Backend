import { NextFunction, Request, Response } from 'express';
import successResponse from '@/utils/SuccessResponse';
import passport from 'passport';
import { BadRequestError } from '@/utils/errors';
import { AuthError, AuthInfo } from '@/types/passport';
import { Queue } from 'bullmq';
import Database from '@/providers/Database';
import { EmailJobData } from '@/types/email.types';
import { TUserSession } from '@/types/user.types';
import Locals from '@/providers/Locals';
import { handleAuthError } from '@/utils/authUtils';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { asyncWrapper } from '@/utils/asyncWrapper';
import UserService from '@/services/user.service';
import OtpService from '@/services/otp.service';
import { RedisClientType } from 'redis';

class AuthController {
  // Service's
  private userService: UserService = new UserService();
  private otpService: OtpService = new OtpService();
  private emailQueue = new Queue<EmailJobData>('emailQueue', { connection: Database.getRedisOptions('QUEUE') });
  private redisCache: RedisClientType = Database.getRedisClient('CACHE');
  // Local Authentication
  // public credentialLogin = (request: Request, response: Response, next: NextFunction) => {
  //   //  authenticate the user
  //   passport.authenticate('local', (err: AuthError, user: any | false, info: AuthInfo) => {
  //     if (err) {
  //       console.error('Passport error:', err);
  //       return next(new BadRequestError('Internal server error', 500));
  //     }
  //     if (!user) {
  //       console.error('Authentication failed:', info?.message);
  //       return next(new BadRequestError(info?.message || 'Authentication failed', 401));
  //     }
  //     // if the user is found and error is null
  //     request.logIn(user, async (loginError) => {
  //       if (loginError) return next(new BadRequestError('Unable to authenticate', 500));
  //       // await this.emailQueue.add('loginEmail', {
  //       //   type: 'loginEmail',
  //       //   to: user.email,
  //       //   data: {
  //       //     receiverName: user.firstName,
  //       //   },
  //       // });
  //       const clientProfile = request.redirectTo || Locals.config().CLIENT_URL;
  //       console.log(clientProfile);
  //       // Complete the request by sending the response
  //       return response.status(200).send(
  //         new successResponse(
  //           {
  //             redirectTo: clientProfile,
  //             user: {
  //               email: user.email,
  //               firstName: user.firstName,
  //               lastName: user.lastName,
  //             },
  //           },
  //           'User Logged In Successfully',
  //           true,
  //           200,
  //         ),
  //       );
  //     });
  //   })(request, response, next);
  // };

  // Email login - if the user is found then send the otp
  public emailLogin = asyncWrapper(async (request: Request) => {
    const email = request.params.email;

    // Check if user exists
    const isU = await this.userService.findUserByEmail(email);
    if (!isU) {
      throw new BadRequestError('User not found', 404);
    }

    const otpKey = `otp_request:${email}`;
    const blockedKey = `blocked_user:${email}`;

    const isUserBlocked = await this.redisCache.get(blockedKey);
    if (isUserBlocked) {
      throw new BadRequestError('There are too many requests for this user, Try again after one hour', 429);
    }

    // Get the OTP Request count
    const otpRequestCount = await this.redisCache.get(otpKey);
    const attempts = otpRequestCount ? parseInt(otpRequestCount, 10) : 0;
    if (attempts >= Locals.config().OTP_LIMIT) {
      // Block the user for the one hour
      await this.redisCache.set(blockedKey, 'true', { EX: Locals.config().OTP_CACHE_EXPIRY_TIME });
      throw new BadRequestError('There are too many requests for this user, Try again after one hour', 429);
    }

    // if they have a limit to request a otp
    await this.redisCache.set(otpKey, (attempts + 1).toString(), {
      EX: Locals.config().OTP_CACHE_EXPIRY_TIME,
    });

    // Generate OTP
    const otp = await this.otpService.generateOtp(email);

    // Add the OTP Email to the Queue
    this.emailQueue.add('OtpEmail', {
      type: 'otpEmail',
      to: email,
      data: {
        receiverName: isU.firstName,
        otp: otp,
      },
    });

    // Send success response
    return new successResponse(null, 'OTP sent successfully', true, 200);
  });
  // Login OTP Verification - if the otp is valid then logged the user
  public verifyOtp = asyncWrapper(async (request: Request, response: Response, next: NextFunction) => {
    const { otp } = request.body;
    const { email } = request.params;

    // Check if user exists
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      return next(new BadRequestError('User not found', 404));
    }

    // Verify OTP
    const isOtpValid = await this.otpService.verifyOtp(email, otp);
    if (!isOtpValid) {
      return next(new BadRequestError('Invalid or expired OTP', 401));
    }

    // Saving the user data in the session
    const sessionUser: TUserSession = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    request.logIn(sessionUser, (err) => {
      if (err) {
        return next(new BadRequestError('Session creation failed', 500));
      }
      // Send the Login Email to the user
      this.emailQueue.add('loginEmail', {
        type: 'loginEmail',
        to: user.email,
        data: {
          receiverName: sessionUser.firstName,
        },
      });
      // Complete the request by sending the response
      return response.status(200).json(new successResponse(null, 'OTP Verified, User Logged In', true, 200));
    });
  });

  // Resent OTP
  public resendOtp = asyncWrapper(async (request: Request, response: Response, next: NextFunction) => {
    const email = request.params.email;

    // Check if the user exists
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      return next(new BadRequestError('User not found', 404));
    }

    // Generate new OTP
    const newOtp = await this.otpService.generateOtp(email);

    // Send OTP via Email Queue
    await this.emailQueue.add('otpEmail', {
      type: 'otpEmail',
      to: user.email,
      data: {
        receiverName: user.firstName,
        otp: newOtp,
      },
    });

    return response.status(200).json(new successResponse(null, 'OTP Resent Successfully', true, 200));
  });

  // Google Authentication
  // public googleLogin = (request: Request, response: Response, next: NextFunction) => {
  //   //  authenticate the user
  //   passport.authenticate(
  //     'google',
  //     { scope: ['profile', 'email'] },
  //     (err: AuthError, user: TUserSession | false, info: AuthInfo) => {
  //       if (err) {
  //         console.error('Passport error:', err);
  //         return next(new BadRequestError('Internal server error', 500));
  //       }
  //       if (!user) {
  //         console.error('Authentication failed:', info?.message);
  //         return next(new BadRequestError(info?.message || 'Authentication failed', 401));
  //       }
  //       // if the user is found and error is null
  //       request.logIn(user, async (loginError) => {
  //         if (loginError) throw new BadRequestError('Unable to authenticate', 500);
  //         await this.emailQueue.add('loginEmail', {
  //           type: 'loginEmail',
  //           to: user.email,
  //           data: {
  //             receiverName: user.firstName,
  //           },
  //         });
  //         // Complete the request by sending the response
  //         return response.status(200).send(new successResponse(user, 'User Logged In Successfully', true, 200));
  //       });
  //     },
  //   )(request, response, next);
  // };
  // // Google Authentication Callback
  // public googleCallback = (request: Request, response: Response, next: NextFunction) => {
  //   //  authenticate the user
  //   passport.authenticate(
  //     'google',
  //     { session: false },
  //     (err: AuthError, user: TUserSession | false, info: AuthInfo) => {
  //       if (err || !user) {
  //         return handleAuthError(response, err?.message || 'Invalid Email Address');
  //       }
  //       const redirectTo = request.redirectTo;
  //       if (redirectTo) {
  //         return response.redirect(redirectTo);
  //       }
  //       const clientProfile = Locals.config().CLIENT_URL;
  //       return response.redirect(clientProfile);
  //     },
  //   )(request, response, next);
  // };
  // // Decode Error Token
  // public decodeErrorToken = asyncWrapper(async (request: Request, response: Response, next: NextFunction) => {
  //   try {
  //     const token = request.query.token as string;
  //     // Check if token is provided
  //     if (!token) {
  //       throw new BadRequestError('Token is required', 400);
  //     }
  //     // Verify the JWT
  //     const decoded = jwt.verify(token, Locals.config().JWT_SECRET) as { message: string };
  //     return new successResponse(decoded.message, decoded.message);
  //   } catch (error) {
  //     // Handle different JWT errors
  //     if (error instanceof TokenExpiredError) {
  //       throw new BadRequestError('Session has expired, Please try again.', 400);
  //     }

  //     if (error instanceof JsonWebTokenError) {
  //       throw new BadRequestError('Invalid token, Authentication Failed.', 401);
  //     }

  //     throw new BadRequestError('Something went wrong while decoding the token.', 500);
  //   }
  // });
}
export default AuthController;
