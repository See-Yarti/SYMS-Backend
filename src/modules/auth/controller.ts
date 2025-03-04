import { Queue } from 'bullmq';
import Database from '@/providers/Database';
import { EmailJobData } from '@/types/email.types';
import { asyncWrapper } from '@/utils/asyncWrapper';
import UserService from '@/services/user.service';
import VendorService from '@/services/vendor.service';
import { RedisClientType } from 'redis';
import { Request } from 'express';
import { BadRequestError } from '@/utils/errors';
import { generateAuthToken, verifyToken } from '@/utils/authUtils';
import successResponse from '@/utils/SuccessResponse';
import RefreshTokenService from '@/services/refresh-token.service';
import { TUserSession, UserGender, UserRole } from '@/types/user.types';
import CryptoService from '@/services/crypto.service';
import { createAdminAccount, createVendorAccount } from './dto';
import mongoose from 'mongoose';
import NotificationService from '@/services/notification.service';
import { NotificationType } from '@/types/notification.types';
import Multer from '@/middlewares/Multer';

class AuthController {
  // Services
  private userService: UserService = new UserService();
  private vendorService: VendorService = new VendorService();
  private notificationService: NotificationService = new NotificationService();
  private cryptoService: CryptoService = new CryptoService();
  private refreshTokenService: RefreshTokenService = new RefreshTokenService();
  private emailQueue = new Queue<EmailJobData>('emailQueue', { connection: Database.getRedisOptions('QUEUE') });
  private redisCache: RedisClientType = Database.getRedisClient('CACHE');
  private multer = new Multer();
  /**
   * User Login (Only Admin & Verified Vendors)
   */
  public credentialLogin = asyncWrapper(async (request: Request) => {
    const { email, password } = request.body;

    // Find user by email
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new BadRequestError('User not found', 404);
    }

    // If user is a vendor, check if they are verified
    if (user.role === UserRole.vendor) {
      // Find the vendor by using user ID
      const vendor = await this.vendorService.getVendorByUserId(user.id);
      // if vendor is not found, throw error
      if (!vendor) {
        throw new BadRequestError('Vendor not found', 404);
      }
      // Check if the vendor is verified by the admin or not
      const isVerified = await this.vendorService.isVendorVerified(vendor.id);
      if (!isVerified) {
        throw new BadRequestError('Vendor is not verified. Please wait for admin approval.', 403);
      }
    }

    // Check password
    const decryptedPassword = this.cryptoService.decrypt(user.password);

    // If the password is not matched, throw error
    if (password !== decryptedPassword) {
      throw new BadRequestError('Invalid password', 400);
    }

    // Update user loginAt and isFirstLogin
    const updateUserPromise = this.userService.updateUserFields({
      userId: user.id,
      updateData: { loginAt: new Date(), isFirstLogin: user.isFirstLogin ? false : true },
    });

    // Add the notification to the user
    const addNotificationPromise = user.isFirstLogin
      ? this.notificationService.addNotification(user.id, 'Welcome to the platform!', NotificationType.info)
      : Promise.resolve();

    // Run the promise and update user and add notification to the user
    await Promise.all([updateUserPromise, addNotificationPromise]);

    // Get the all notifications of the logged user thar are unread
    const unReadNotificationsPromise = this.notificationService.getTotalNotifications(user.id);

    // Get the total number of notifications that are read
    const readNotificationsPromise = this.notificationService.getTotalNotifications(user.id, true);

    // Wait for both promises to resolve
    const [unReadNotifications, readNotifications] = await Promise.all([
      unReadNotificationsPromise,
      readNotificationsPromise,
    ]);

    // Generate JWT token
    const { accessToken, refreshToken } = generateAuthToken({ email: user.email, id: user.id, role: user.role });

    // Save refresh token
    await this.refreshTokenService.saveRefreshToken(user.id, refreshToken);

    const response = {
      token: { accessToken },
      unReadNotifications,
      readNotifications,
      user: {
        email: user.email,
        id: user.id,
        role: user.role,
        name: user.name,
        isFirstLogin: user.isFirstLogin,
        avatarUrl: user.avatarUrl,
      },
    };

    return new successResponse(response, 'User logged in successfully', true, 200);
  });

  /**
   * Create a new Vendor (Unverified until Admin Approves)
   */
  public createVendor = asyncWrapper(async (request: Request) => {
    const bodyData = request.body as createVendorAccount;

    // Check if the email is already registered
    const existingUser = await this.userService.findUserByEmail(bodyData.email);

    if (existingUser) {
      throw new BadRequestError('User already exists', 400);
    }

    const tradeLicenseFile = request.file;

    if (!tradeLicenseFile) {
      throw new BadRequestError('Trade license file is required', 400);
    }
    // Upload file to Cloudinary
    const tradeLicenseUrl = await this.multer.BufferFileUpload(
      tradeLicenseFile.buffer,
      `${bodyData.email}-trade-license`,
    );

    if (!tradeLicenseUrl) {
      throw new BadRequestError('Failed to upload trade license', 500);
    }

    // Encrypt default password for security
    const encryptedPassword = this.cryptoService.encrypt('unverified');

    // Start a MongoDB session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Step 1: Create the User (Inside the Transaction)
      const newUser = await this.userService.createUser(
        {
          name: bodyData.name,
          email: bodyData.email,
          role: UserRole.vendor,
          password: encryptedPassword,
          agent: request.headers['user-agent'] || '',
          loginAt: new Date(),
          ip: request.clientIp,
          phoneNumber: bodyData.phoneNumber,
          gender: UserGender.other,
          address: {
            state: bodyData.state,
            fullAddress: bodyData.companyAddress,
          },
        },
        session, // Pass session for transaction
      );

      // Step 2: Create the Vendor (Inside the Transaction)
      await this.vendorService.createVendor(
        newUser.id,
        {
          companyName: bodyData.companyName,
          designation: bodyData.designation,
          taxRefNumber: bodyData.taxRefNumber,
          isVendorVerified: false,
          tradeLicense: tradeLicenseUrl,
        },
        session, // Pass session for transaction
      );

      // If both operations succeed, commit the transaction
      await session.commitTransaction();
      session.endSession();

      // Send the Register Vendor Email
      await this.emailQueue.add('registerVendorEmail', {
        type: 'registerVendorEmail',
        to: bodyData.email,
        data: {
          receiverName: bodyData.name,
        },
      });

      return new successResponse(null, 'Vendor Created Successfully. Please wait for Admin Approval.', true, 201);
    } catch (error) {
      console.error(error);
      // If any operation fails, rollback everything
      await session.abortTransaction();
      session.endSession();
      throw new BadRequestError('Vendor registration failed. Please try again.', 500);
    }
  });

  /**
   * Refresh the access token
   */
  public refreshToken = asyncWrapper(async (request: Request) => {
    const authHeader = request.headers.authorization;

    if (!authHeader) throw new BadRequestError('Unauthorized Request', 401);

    const token = authHeader.split(' ')[1];

    const decoded = verifyToken(token, 'accessToken') as TUserSession;

    if (!decoded) throw new BadRequestError('Unauthorized Token Request', 401);

    const user = await this.userService.findUserByEmail(decoded.email);

    if (!user) throw new BadRequestError('Unauthorized User Request', 401);

    const userRefreshToken = await this.refreshTokenService.getRefreshToken(user.id);

    if (!userRefreshToken) throw new BadRequestError('Unauthorized User Request', 401);

    const refreshTokenVerification = verifyToken(userRefreshToken.token, 'refreshToken') as TUserSession;

    if (!refreshTokenVerification) throw new BadRequestError('Refresh Token Failed', 401);

    const { accessToken } = generateAuthToken({ email: user.email, id: user.id, role: user.role });

    return new successResponse({ token: { accessToken } }, 'Token Refreshed Successfully', true, 200);
  });

  /**
   * Create a admin account
   */
  public createAdmin = asyncWrapper(async (request: Request) => {
    const bodyData = request.body as createAdminAccount;

    const user = await this.userService.findUserByEmail(bodyData.email);

    if (user) throw new BadRequestError('User already exists', 400);

    const encryptedPassword = this.cryptoService.encrypt(bodyData.password);

    const admin = await this.userService.createUser({
      name: bodyData.name,
      email: bodyData.email,
      role: UserRole.admin,
      password: encryptedPassword,
      agent: request.headers['user-agent'] || '',
      loginAt: new Date(),
      ip: request.clientIp,
      phoneNumber: bodyData.phoneNumber,
      gender: UserGender.other,
      address: {
        fullAddress: bodyData.address,
      },
    });

    return new successResponse(
      {
        email: admin.email,
        name: admin.name,
      },
      'Admin Created Successfully',
      true,
      201,
    );
  });
}

export default AuthController;
