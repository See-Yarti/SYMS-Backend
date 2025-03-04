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
      // Tokens & JWT configuration
      CRYPTO_ALGORITHM: env.CRYPTO_ALGORITHM as string,
      CRYPTO_SECRET_KEY: env.CRYPTO_SECRET_KEY as string,
      CRYPTO_IV_LENGTH: Number(env.CRYPTO_IV_LENGTH as string),

      ACCESS_TOKEN_SECRET: String(env.ACCESS_TOKEN_SECRET as string),
      REFRESH_TOKEN_SECRET: String(env.REFRESH_TOKEN_SECRET as string),
      ACCESS_JWT_EXPIRATION: env.ACCESS_JWT_EXPIRATION as string,
      REFRESH_JWT_EXPIRATION: env.REFRESH_JWT_EXPIRATION as string,

      // Cloudinary configuration
      CLOUDINARY_NAME: env.CLOUDINARY_NAME as string,
      CLOUDINARY_API_KEY: env.CLOUDINARY_API_KEY as string,
      CLOUDINARY_API_SECRET: env.CLOUDINARY_API_SECRET as string,
      CLOUDINARY_FOLDER_NAME: env.CLOUDINARY_FOLDER_NAME as string,
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
