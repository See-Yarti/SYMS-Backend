import { Application } from 'express';
import dotenv from 'dotenv';
import path from 'path';

class Locals {
  /**
   * Load and return environment configurations.
   */
  public static config() {
    const env = process.env;
    // Load environment variables from the appropriate file based on NODE_ENV
    const envFile = `.env.${env.NODE_ENV}`;
    // Load environment variables from .env file
    dotenv.config({ path: path.join(__dirname, '..', '..', '/secrets', envFile) });

    // Default values with environment fallbacks
    return {
      NODE_ENV: env.NODE_ENV as string,
      PORT: Number(env.PORT) || 4040,
      URL: env.URL || `http://localhost:${env.PORT || 4040}`,
      MONGOOSE_URL: env.MONGOOSE_URL as string,
      MAX_RATE_LIMIT: Number(env.MAX_RATE_LIMIT as string),
      BODY_PARSER_LIMIT: env.BODY_PARSER_LIMIT as string,
      // Redis basic configuration
      REDIS_HOST: env.REDIS_HOST as string,
      REDIS_PORT: Number(env.REDIS_PORT as string),
      REDIS_PASSWORD: env.REDIS_PASSWORD as string,
      REDIS_TTL: Number(env.REDIS_TTL as string),
      REDIS_TLS: Boolean(env.REDIS_TTL as string),
      REDIS_REPLICATION_MODE: env.REDIS_REPLICATION_MODE as string,
      REDIS_URL: `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`,
      // Redis Services configuration
      REDIS_SESSION_DB: Number(env.REDIS_SESSION_DB as string),
      REDIS_SESSION_PREFIX: env.REDIS_SESSION_PREFIX as string,
      REDIS_CACHE_DB: Number(env.REDIS_CACHE_DB as string),
      REDIS_CACHE_PREFIX: env.REDIS_CACHE_PREFIX as string,
      REDIS_QUEUE_DB: Number(env.REDIS_CACHE_DB as string),
      REDIS_QUEUE_PREFIX: env.REDIS_QUEUE_PREFIX as string,
      // Queue Configuration
      QUEUE_FAILED_ATTEMPTS: Number(env.QUEUE_FAILED_ATTEMPTS as string),
      // Session configuration
      SESSION_NAME: env.SESSION_NAME as string,
      SESSION_SECRET: env.SESSION_SECRET as string,
      SESSION_MAX_AGE: Number(env.SESSION_MAX_AGE as string),
      SESSION_DOMAIN: env.SESSION_DOMAIN as string | undefined,
      // Email configuration
      EMAIL_SERVICE: env.EMAIL_SERVICE as string,
      EMAIL_HOST: env.EMAIL_HOST as string,
      EMAIL_PORT: Number(env.EMAIL_PORT as string),
      EMAIL_USER: env.EMAIL_USER as string,
      EMAIL_PASSWORD: env.EMAIL_PASSWORD as string,
      // Google OAuth configuration
      GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID as string,
      GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET as string,
      GOOGLE_CALLBACK_URL: env.GOOGLE_CALLBACK_URL as string,
      // JWT configuration
      JWT_SECRET: env.JWT_SECRET as string,
      //CLIENT WEB URL
      CLIENT_URL: env.CLIENT_URL as string,
      CLIENT_AUTH_ERROR_URL: env.CLIENT_AUTH_ERROR_URL as string,
      // OTP configuration
      OTP_EXPIRATION_TIME: Number(env.OTP_EXPIRATION_TIME as string),
      OTP_LIMIT: Number(env.OTP_LIMIT as string),
      OTP_BLOCK_TIME: Number(env.OTP_BLOCK_TIME as string),
      OTP_CACHE_EXPIRY_TIME: Number(env.OTP_CACHE_EXPIRY_TIME as string),
      // OTP Request Key
      OTP_REQUEST_KEY: (email : string) => `otp_request:${email}`,
      BLOCKED_USER_KEY: (email: string) => `blocked_user:${email}`
    };
  }
  /**
   * Injects your config to the app's locals
   */
  public static init(_express: Application): Application {
    _express.locals.app = this.config();
    return _express;
  }
}

export default Locals;
