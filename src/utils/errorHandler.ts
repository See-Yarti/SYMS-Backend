/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errors';
import Logger from './logger';

export default class ErrorHandler {
  static handle = () => {
    return async (err: ApiError, req: Request, res: Response, next: NextFunction) => {
      Logger.error(err.message);

      const statusCode = err.statusCode || 500;
      res.status(statusCode).send({
        success: false,
        statusCode,
        message: err.message,
        stack: err.stack,
        errors: err.errors,
      });
    };
  };
  static initializeUnhandledException = () => {
    process.on('unhandledRejection', (reason: Error, promise: Promise<any>) => {
      Logger.error('Unhandled Rejection Error', 'reason:', reason.message);
      console.warn(reason.name, reason.message);
      console.warn('UNHANDLED REJECTION! 💥 Shutting down...');
      throw reason;
    });

    process.on('uncaughtException', (err: Error) => {
      Logger.error('Unhandled exception Error', 'error:', err.message);
      console.warn(err.name, err.message);
      console.warn('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      process.exit(1);
    });
  };
}
